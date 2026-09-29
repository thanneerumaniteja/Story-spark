import React, { useState, useRef } from 'react';
import { Story } from '../types/story';
import { StoryCard } from './StoryCard';
import { Mic, MicOff, Search, Sparkles, Loader2, X } from 'lucide-react';

interface SemanticSearchProps {
  stories: Story[];
  savedStoryIds: string[];
  onReadStory: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
}

const SAMPLE_NATURAL_QUERIES = [
  'Give me a five-minute mystery story with an unexpected ending.',
  'Something creepy but not extremely scary.',
  'Something emotional that I can finish in 5 minutes.',
  'Something like a dark mystery involving mirrors.',
  'A peaceful sci-fi story about nature and hope.',
];

export const SemanticSearchView: React.FC<SemanticSearchProps> = ({
  stories,
  savedStoryIds,
  onReadStory,
  onToggleSave,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDiscoveryResult, setAiDiscoveryResult] = useState<{
    interpretedIntent: string;
    extractedFilters: {
      maxReadingTime: number;
      genres: string[];
      moods: string[];
      themes: string[];
    };
    matches: { storyId: string; matchReason: string }[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  const runSemanticSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    setAiDiscoveryResult(null);

    try {
      const response = await fetch('/api/ai/semantic-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          stories: stories.filter((s) => !s.isDraft),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiDiscoveryResult(data);
      }
    } catch {
      // Fallback client-side semantic filter if offline
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setVoiceStatus(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening… Speak what kind of story you feel like reading.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        setVoiceStatus(`Heard: “${transcript}”`);
        runSemanticSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus(
          'Microphone permission or speech input unavailable in this frame. Try clicking a voice prompt below.'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      setVoiceStatus(
        'Browser speech recognition is not supported in this frame. Select any natural voice prompt below to test AI Voice Discovery.'
      );
    }
  };

  const qLower = query.trim().toLowerCase();
  const keywordMatchedStories = stories
    .filter((s) => !s.isDraft)
    .filter((s) => {
      if (!qLower) return true;
      return (
        s.title.toLowerCase().includes(qLower) ||
        s.author.toLowerCase().includes(qLower) ||
        s.genre.toLowerCase().includes(qLower) ||
        s.mood.toLowerCase().includes(qLower) ||
        s.description.toLowerCase().includes(qLower) ||
        s.semanticEssence.toLowerCase().includes(qLower) ||
        s.themes.some((t) => t.toLowerCase().includes(qLower)) ||
        s.tags.some((t) => t.toLowerCase().includes(qLower))
      );
    });

  const aiMatchedList =
    aiDiscoveryResult?.matches
      ?.map((m) => {
        const found = stories.find((s) => s.id === m.storyId);
        return found ? { story: found, reason: m.matchReason } : null;
      })
      .filter((item): item is { story: Story; reason: string } => Boolean(item)) || [];

  const displayStories =
    aiMatchedList.length > 0
      ? aiMatchedList
      : keywordMatchedStories.map((s) => ({ story: s, reason: undefined }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <header className="max-w-3xl">
        <span className="meta-label !text-[#5e66ff] block mb-2">
          Semantic & Voice Discovery Engine
        </span>
        <h1 className="font-brand text-3xl md:text-5xl text-white uppercase tracking-tight mb-3">
          DESCRIBE YOUR MOOD.
        </h1>
        <p className="text-sm text-[#ececec]/55">
          Search by title, writer, genre, or ask in natural language—by typing or speaking aloud.
        </p>
      </header>

      {/* Search Bar + Voice Microphone Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSemanticSearch(query);
        }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#ececec]/45 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: “Give me a five-minute mystery story with an unexpected ending”..."
            className="w-full pl-11 pr-10 py-3.5 text-sm bg-[#18181b] text-white border border-white/12 rounded-[4px] focus:outline-none focus:border-[#5e66ff] placeholder:text-[#ececec]/35"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setAiDiscoveryResult(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ececec]/45 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-semibold border rounded-[4px] transition-colors whitespace-nowrap cursor-pointer ${
              isListening
                ? 'bg-[#5e66ff] text-white border-[#5e66ff] animate-pulse'
                : 'bg-[#1c1c1f] text-[#ececec] border-white/12 hover:border-[#5e66ff]'
            }`}
            title="Voice Discovery"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#5e66ff]" />}
            <span>{isListening ? 'Listening…' : 'Voice Search'}</span>
          </button>

          <button
            type="submit"
            disabled={isAnalyzing || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] disabled:opacity-50 rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Discover</span>
              </>
            )}
          </button>
        </div>
      </form>

      {voiceStatus && (
        <div className="px-4 py-3 bg-[#18181b] border-l-2 border-[#5e66ff] text-xs text-[#ececec]">
          🎙️ {voiceStatus}
        </div>
      )}

      {/* Natural Concept Prompts */}
      <div>
        <p className="meta-label mb-3">
          Natural Language & Voice Prompts:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_NATURAL_QUERIES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                runSemanticSearch(sample);
              }}
              className="px-3.5 py-2 text-xs bg-[#1c1c1f] border border-white/12 hover:border-[#5e66ff] text-[#ececec]/80 hover:text-white rounded-[4px] transition-colors text-left cursor-pointer"
            >
              “{sample}”
            </button>
          ))}
        </div>
      </div>

      {/* AI Semantic Interpretation Banner */}
      {aiDiscoveryResult && (
        <div className="p-6 bg-[#18181b] border border-[#5e66ff]/40 rounded-[4px] space-y-3">
          <div className="flex items-center gap-2 meta-label !text-[#5e66ff]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semantic Story Understanding</span>
          </div>
          <p className="text-lg font-medium text-white">
            {aiDiscoveryResult.interpretedIntent}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#ececec]/60">
            <span className="meta-label">Extracted signals:</span>
            {aiDiscoveryResult.extractedFilters.maxReadingTime > 0 && (
              <span className="px-2 py-0.5 bg-[#1c1c1f] border border-white/12 rounded-[4px] text-white font-tabular">
                ≤ {aiDiscoveryResult.extractedFilters.maxReadingTime}m
              </span>
            )}
            {aiDiscoveryResult.extractedFilters.genres.map((g) => (
              <span key={g} className="px-2 py-0.5 bg-[#1c1c1f] border border-white/12 rounded-[4px] text-white">
                {g}
              </span>
            ))}
            {aiDiscoveryResult.extractedFilters.moods.map((m) => (
              <span key={m} className="px-2 py-0.5 bg-[#1c1c1f] border border-white/12 rounded-[4px] text-white">
                {m}
              </span>
            ))}
            {aiDiscoveryResult.extractedFilters.themes.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-[#5e66ff]/15 border border-[#5e66ff]/30 rounded-[4px] text-[#5e66ff]">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Grid */}
      <section>
        <div className="flex items-baseline justify-between border-b border-white/12 pb-3 mb-6">
          <h2 className="font-brand text-xl text-white uppercase">
            {aiDiscoveryResult
              ? 'CURATED MATCHES'
              : query
              ? 'MATCHING STORIES'
              : 'ALL STORIES IN CATALOG'}
          </h2>
          <span className="meta-label">{displayStories.length} Matches found</span>
        </div>

        {displayStories.length === 0 ? (
          <div className="p-10 border border-white/12 bg-[#18181b] text-center space-y-3 rounded-[4px]">
            <p className="text-lg font-semibold text-white">
              No exact keyword matches found for “{query}”.
            </p>
            <p className="text-xs text-[#ececec]/55">
              Click “AI Discover” above so Gemini can match your request semantically by theme and mood.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayStories.map(({ story, reason }) => (
              <StoryCard
                key={story.id}
                story={story}
                onRead={onReadStory}
                isSaved={savedStoryIds.includes(story.id)}
                onToggleSave={(id) => onToggleSave(id)}
                matchReason={reason}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
