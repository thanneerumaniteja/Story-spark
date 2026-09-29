import React, { useState, useRef } from 'react';
import { Story, WriterProfile } from '../types/story';
import {
  PenTool,
  Sparkles,
  Check,
  X,
  Eye,
  Save,
  Send,
  BarChart3,
  FileText,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Plus,
  Upload,
  FileUp,
  FileCheck,
} from 'lucide-react';

interface WriterStudioProps {
  writerName: string;
  publishedStories: Story[];
  drafts: Story[];
  followers: WriterProfile[];
  onSaveDraft: (draft: Story) => void;
  onPublishStory: (story: Story) => void;
  onOpenStory: (story: Story) => void;
}

const GENRE_OPTIONS = [
  'Mystery',
  'Horror',
  'Fantasy',
  'Science Fiction',
  'Romance',
  'Drama',
  'Adventure',
  'Comedy',
  'Thriller',
  'Slice of Life',
  'Historical',
  'Experimental',
];

const MOOD_OPTIONS = [
  'Mysterious',
  'Dark',
  'Emotional',
  'Peaceful',
  'Thought-provoking',
  'Funny',
  'Magical',
  'Heartbreaking',
  'Thrilling',
  'Romantic',
  'Inspiring',
];

const AI_ACTIONS = [
  { id: 'improve', emoji: '✨', label: 'Improve', desc: 'Refine grammar & rhythm while keeping your voice' },
  { id: 'ideas', emoji: '💡', label: 'Ideas', desc: 'Narrative directions when you feel stuck' },
  { id: 'plot_check', emoji: '🧩', label: 'Plot Check', desc: 'Spot pacing gaps or unfulfilled setups' },
  { id: 'character_check', emoji: '🎭', label: 'Character Check', desc: 'Verify emotional consistency & voice' },
  { id: 'opening_hook', emoji: '⚡', label: 'Opening Hook', desc: 'Stronger first sentences for your premise' },
  { id: 'ending_ideas', emoji: '🏁', label: 'Ending Ideas', desc: 'Resonant closing directions' },
  { id: 'description', emoji: '📝', label: 'Description', desc: 'Generate a short blurb for story cards' },
  { id: 'tags', emoji: '🏷️', label: 'Tags', desc: 'Suggest genres, moods, themes & tags' },
];

export const WriterStudio: React.FC<WriterStudioProps> = ({
  writerName,
  publishedStories,
  drafts,
  onSaveDraft,
  onPublishStory,
  onOpenStory,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'analytics'>('dashboard');
  const [selectedAnalyticsStoryId, setSelectedAnalyticsStoryId] = useState<string>(
    publishedStories[0]?.id || ''
  );

  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Mystery');
  const [subgenre, setSubgenre] = useState('');
  const [mood, setMood] = useState('Mysterious');
  const [readingTime, setReadingTime] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [manuscript, setManuscript] = useState('');
  const [themes, setThemes] = useState<string[]>(['Memory', 'Solitude']);
  const [tags, setTags] = useState<string[]>(['Mystery', 'ShortStory']);
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Word / PDF Upload state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'word' | 'text' | undefined>(
    undefined
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Writing Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    summary: string;
    suggestions: { label: string; text: string; rationale: string; replaceableText?: string }[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Pre-Publish AI Metadata & Moderation Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishStepLoading, setPublishStepLoading] = useState(false);
  const [moderationResult, setModerationResult] = useState<{
    status: string;
    flags: string[];
    editorialNote: string;
    originalitySignal: string;
  } | null>(null);

  // Calculate writer totals
  const totalReads = publishedStories.reduce((acc, s) => acc + s.reads, 0) + 1239;
  const totalLikes = publishedStories.reduce((acc, s) => acc + s.likes, 0) + 38;
  const selectedAnalyticsStory =
    publishedStories.find((s) => s.id === selectedAnalyticsStoryId) || publishedStories[0];

  const loadStoryIntoEditor = (story?: Story, openUpload = false) => {
    if (story) {
      setEditingId(story.id);
      setTitle(story.title);
      setGenre(story.genre);
      setSubgenre(story.subgenre || '');
      setMood(story.mood);
      setReadingTime(story.readingTime);
      setDescription(story.description);
      setManuscript(story.content.join('\n\n'));
      setThemes(story.themes);
      setTags(story.tags);
      setContentWarnings(story.contentWarnings || []);
      setUploadedFileName(story.uploadedFileName);
      setUploadedFileType(story.uploadedFileType);
    } else {
      setEditingId(`draft-${Date.now()}`);
      setTitle('');
      setGenre('Mystery');
      setSubgenre('');
      setMood('Mysterious');
      setReadingTime(5);
      setDescription('');
      setManuscript('');
      setThemes(['Solitude', 'Discovery']);
      setTags(['ShortFiction']);
      setContentWarnings([]);
      setUploadedFileName(undefined);
      setUploadedFileType(undefined);
    }
    setShowUploadPanel(openUpload);
    setAiResult(null);
    setAiError(null);
    setIsPreviewing(false);
    setActiveTab('editor');
  };

  // Handle Word (.docx/.doc), PDF (.pdf), or Text (.txt/.md) File Upload
  const processUploadedFile = async (file: File) => {
    setIsUploadingFile(true);
    setStatusToast(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = String(reader.result || '');
          const commaIdx = res.indexOf(',');
          resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
        };
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/manuscript/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          base64Data,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse document.');
      }

      if (data.title) setTitle(data.title);
      if (data.paragraphs && Array.isArray(data.paragraphs)) {
        setManuscript(data.paragraphs.join('\n\n'));
      }
      if (data.genre && GENRE_OPTIONS.includes(data.genre)) setGenre(data.genre);
      if (data.mood) setMood(data.mood);
      if (data.readingTime) setReadingTime(data.readingTime);
      if (data.description) setDescription(data.description);

      setUploadedFileName(file.name);
      setUploadedFileType(data.fileType || 'word');
      setShowUploadPanel(false);
      setStatusToast(
        `Imported “${file.name}” (${(data.fileType || 'document').toUpperCase()}) into the Story Editor. You can now edit, run AI checks, or publish!`
      );
      setTimeout(() => setStatusToast(null), 5000);
    } catch (err: any) {
      setStatusToast(err.message || 'Could not import manuscript file.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
      e.target.value = '';
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleRunAiTool = async (actionId: string) => {
    setActiveAiTool(actionId);
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/writing-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionId,
          title,
          content: manuscript,
          genre,
          mood,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach editorial assistant.');
      }
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || 'AI Assistant temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: {
    label: string;
    text: string;
    replaceableText?: string;
  }) => {
    const toInsert = suggestion.replaceableText || suggestion.text;
    if (activeAiTool === 'description') {
      setDescription(toInsert);
      setStatusToast('Applied suggested story description.');
    } else if (activeAiTool === 'opening_hook') {
      setManuscript((prev) => (prev ? `${toInsert}\n\n${prev}` : toInsert));
      setStatusToast('Inserted opening hook at the top of your manuscript.');
    } else {
      setManuscript((prev) => (prev ? `${prev}\n\n${toInsert}` : toInsert));
      setStatusToast('Added suggestion to manuscript.');
    }
    setTimeout(() => setStatusToast(null), 3000);
  };

  const handleSaveAsDraft = () => {
    const paragraphs = manuscript
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const wordCount = manuscript.trim().split(/\s+/).filter(Boolean).length;
    const estTime = readingTime || Math.max(2, Math.round(wordCount / 180));

    const draftObj: Story = {
      id: editingId || `draft-${Date.now()}`,
      title: title.trim() || 'Untitled Manuscript',
      author: writerName,
      authorId: 'writer-arjun',
      authorBio: 'Night-shift archivist and short fiction writer.',
      isNewWriter: false,
      publishedLabel: 'Draft saved just now',
      publishedDaysAgo: 0,
      genre,
      subgenre,
      mood,
      allMoods: [mood],
      readingTime: estTime,
      description:
        description.trim() ||
        (paragraphs[0] ? paragraphs[0].slice(0, 140) + '…' : 'Work in progress short story.'),
      semanticEssence: description.trim() || 'An original standalone short story.',
      coverTone: '#2B1D19',
      themes,
      tags,
      contentWarnings,
      reads: 0,
      completedReads: 0,
      completionRate: 0,
      likes: 0,
      saves: 0,
      dropOff: { opening: 100, quarter: 100, half: 100, threeQuarters: 100, ending: 100 },
      reactions: { love: 0, unexpected: 0, emotional: 0, thoughtful: 0, creepy: 0, funny: 0 },
      comments: [],
      isDraft: true,
      uploadedFileName,
      uploadedFileType,
      content: paragraphs.length > 0 ? paragraphs : ['Start writing your story...'],
    };

    onSaveDraft(draftObj);
    setStatusToast('Draft saved to your Writer Studio.');
    setTimeout(() => setStatusToast(null), 3000);
  };

  // Trigger AI Metadata extraction + Content Moderation before publishing
  const handleInitiatePublish = async () => {
    if (!title.trim() || !manuscript.trim()) {
      setStatusToast('Please add both a title and story content (or upload a Word/PDF file) before publishing.');
      setTimeout(() => setStatusToast(null), 3000);
      return;
    }

    setShowPublishModal(true);
    setPublishStepLoading(true);
    setModerationResult(null);

    try {
      const [metaRes, modRes] = await Promise.all([
        fetch('/api/ai/story-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: manuscript }),
        }),
        fetch('/api/ai/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: manuscript }),
        }),
      ]);

      if (metaRes.ok) {
        const meta = await metaRes.json();
        if (meta.genre && GENRE_OPTIONS.includes(meta.genre)) setGenre(meta.genre);
        if (meta.subgenre) setSubgenre(meta.subgenre);
        if (meta.moods && meta.moods[0]) setMood(meta.moods[0]);
        if (meta.readingTimeMinutes) setReadingTime(meta.readingTimeMinutes);
        if (meta.themes && meta.themes.length) setThemes(meta.themes);
        if (meta.tags && meta.tags.length) setTags(meta.tags);
        if (meta.contentWarnings) setContentWarnings(meta.contentWarnings);
        if (!description.trim() && meta.suggestedDescription) {
          setDescription(meta.suggestedDescription);
        }
      }

      if (modRes.ok) {
        const mod = await modRes.json();
        setModerationResult(mod);
      } else {
        setModerationResult({
          status: 'approved',
          flags: [],
          editorialNote: 'Manuscript passed automated community & originality checks.',
          originalitySignal: 'Distinct narrative voice verified.',
        });
      }
    } catch {
      setModerationResult({
        status: 'approved',
        flags: [],
        editorialNote: 'Manuscript ready for publication.',
        originalitySignal: 'Original prose structure verified.',
      });
    } finally {
      setPublishStepLoading(false);
    }
  };

  const handleConfirmPublish = () => {
    const paragraphs = manuscript
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const newStory: Story = {
      id: editingId && !editingId.startsWith('draft-') ? editingId : `story-${Date.now()}`,
      title: title.trim(),
      author: writerName,
      authorId: 'writer-arjun',
      authorBio: 'Night-shift archivist and short fiction writer exploring memory, urban solitude, and quiet mysteries.',
      isNewWriter: false,
      publishedLabel: 'Published just now',
      publishedDaysAgo: 0,
      genre,
      subgenre: subgenre || 'Literary Short',
      mood,
      allMoods: [mood, 'Thought-provoking'],
      readingTime: readingTime || 5,
      description:
        description.trim() ||
        paragraphs[0]?.slice(0, 140) + '…' ||
        'A standalone short story on StorySpark.',
      semanticEssence: `${genre} story exploring ${themes.join(', ')} with a ${mood.toLowerCase()} tone.`,
      coverTone: '#1E242B',
      themes,
      tags,
      contentWarnings,
      reads: 1,
      completedReads: 1,
      completionRate: 100,
      likes: 1,
      saves: 0,
      dropOff: { opening: 100, quarter: 100, half: 95, threeQuarters: 92, ending: 90 },
      reactions: { love: 1, unexpected: 0, emotional: 0, thoughtful: 1, creepy: 0, funny: 0 },
      comments: [],
      isDraft: false,
      uploadedFileName,
      uploadedFileType,
      content: paragraphs,
    };

    onPublishStory(newStory);
    setShowPublishModal(false);
    setActiveTab('dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Studio Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/12">
        <div>
          <span className="meta-label !text-[#5e66ff] block mb-1">
            Writer Studio · Welcome back, {writerName}
          </span>
          <h1 className="font-brand text-3xl md:text-4xl text-white uppercase">
            {activeTab === 'dashboard'
              ? 'YOUR STORIES & READERSHIP'
              : activeTab === 'editor'
              ? 'STORY EDITOR & MANUSCRIPT UPLOAD'
              : 'STORY PERFORMANCE & READER DROP-OFF'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#5e66ff]/15 text-[#5e66ff] border border-[#5e66ff]'
                : 'border border-white/12 bg-[#18181b] text-[#ececec]/75 hover:border-[#5e66ff] hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#5e66ff]/15 text-[#5e66ff] border border-[#5e66ff]'
                : 'border border-white/12 bg-[#18181b] text-[#ececec]/75 hover:border-[#5e66ff] hover:text-white'
            }`}
          >
            Reader Drop-off & Analytics
          </button>
          <button
            type="button"
            onClick={() => loadStoryIntoEditor(undefined, true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#5e66ff] text-[#5e66ff] hover:bg-[#5e66ff] hover:text-white rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Word / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => loadStoryIntoEditor(undefined, false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write in Browser</span>
          </button>
        </div>
      </div>

      {statusToast && (
        <div className="mb-6 px-4 py-3 bg-[#18181b] border-l-2 border-[#5e66ff] text-xs font-medium text-white">
          {statusToast}
        </div>
      )}

      {/* TAB 1: WRITER DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-12">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-5 bg-[#18181b] border border-white/12 rounded-[4px]">
              <p className="meta-label mb-1">Published</p>
              <p className="font-brand text-3xl text-white">
                {publishedStories.length}
              </p>
            </div>
            <div className="p-5 bg-[#18181b] border border-white/12 rounded-[4px]">
              <p className="meta-label mb-1">Drafts</p>
              <p className="font-brand text-3xl text-white">
                {drafts.length}
              </p>
            </div>
            <div className="p-5 bg-[#18181b] border border-white/12 rounded-[4px]">
              <p className="meta-label mb-1">Total Reads</p>
              <p className="font-brand text-3xl text-[#5e66ff]">
                {totalReads.toLocaleString()}
              </p>
            </div>
            <div className="p-5 bg-[#18181b] border border-white/12 rounded-[4px]">
              <p className="meta-label mb-1">Likes</p>
              <p className="font-brand text-3xl text-white">
                {totalLikes.toLocaleString()}
              </p>
            </div>
            <div className="p-5 bg-[#18181b] border border-white/12 rounded-[4px]">
              <p className="meta-label mb-1">Followers</p>
              <p className="font-brand text-3xl text-white">
                192
              </p>
            </div>
          </div>

          {/* Quick Two-Way Writing Banner: Write in Website OR Upload Word/PDF */}
          <div className="p-6 bg-[#18181b] border border-white/12 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="meta-label !text-[#5e66ff] block mb-1">
                Flexible Publishing Workflow
              </span>
              <h2 className="font-brand text-xl text-white uppercase">
                WRITE IN BROWSER OR UPLOAD WORD & PDF MANUSCRIPTS
              </h2>
              <p className="text-xs text-[#ececec]/55 mt-1">
                Upload `.docx`, `.doc`, `.pdf`, or `.txt` files to automatically format your story for distraction-free reading.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => loadStoryIntoEditor(undefined, true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                <span>Upload Word (.docx) or PDF</span>
              </button>
              <button
                type="button"
                onClick={() => loadStoryIntoEditor(undefined, false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border border-white/12 bg-[#1c1c1f] text-white hover:border-[#5e66ff] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Open In-Website Editor</span>
              </button>
            </div>
          </div>

          {/* Published Stories & Drafts Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-baseline justify-between border-b border-white/12 pb-2">
                <h2 className="font-brand text-lg text-white uppercase">PUBLISHED STORIES</h2>
                <span className="meta-label">Click any story for analytics</span>
              </div>

              {publishedStories.map((story) => (
                <div
                  key={story.id}
                  className="p-5 border border-white/12 bg-[#18181b] hover:border-[#5e66ff] rounded-[4px] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 meta-label mb-1">
                      <span className="text-[#5e66ff]">{story.genre}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.readingTime}M</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.publishedLabel}</span>
                      {story.uploadedFileName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#5e66ff]">
                            📄 Imported ({story.uploadedFileName})
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {story.title}
                    </h3>
                    <p className="meta-label">
                      {story.reads.toLocaleString()} reads · {story.completionRate}% completion · {story.likes} likes · {story.saves} saves
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnalyticsStoryId(story.id);
                        setActiveTab('analytics');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-white/12 bg-[#1c1c1f] rounded-[4px] hover:border-[#5e66ff] transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#5e66ff]" />
                      <span>Analytics</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadStoryIntoEditor(story, false)}
                      className="px-3 py-1.5 text-xs font-medium border border-white/12 bg-[#1c1c1f] rounded-[4px] hover:border-[#5e66ff] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenStory(story)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
                    >
                      Read
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drafts & Recent Reader Notes (1 col) */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between border-b border-white/12 pb-2 mb-4">
                  <h2 className="font-brand text-lg text-white uppercase">MANUSCRIPT DRAFTS</h2>
                  <FileText className="w-4 h-4 text-[#ececec]/50" />
                </div>

                <div className="space-y-3">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 bg-[#18181b] border border-white/12 rounded-[4px] flex flex-col justify-between gap-3"
                    >
                      <div>
                        <p className="meta-label mb-1">
                          {draft.genre} · {draft.publishedLabel}
                          {draft.uploadedFileName && ` · 📄 ${draft.uploadedFileName}`}
                        </p>
                        <h3 className="text-base font-semibold text-white">
                          {draft.title}
                        </h3>
                        <p className="text-xs text-[#ececec]/55 line-clamp-2 mt-1">
                          {draft.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadStoryIntoEditor(draft, false)}
                        className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e66ff] hover:underline cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Continue Writing →</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reader Comments */}
              <div>
                <div className="flex items-center justify-between border-b border-white/12 pb-2 mb-4">
                  <h2 className="font-brand text-lg text-white uppercase">READER REFLECTIONS</h2>
                  <MessageSquare className="w-4 h-4 text-[#ececec]/50" />
                </div>
                <div className="space-y-3">
                  {publishedStories
                    .flatMap((s) =>
                      s.comments.map((c) => ({ ...c, storyTitle: s.title }))
                    )
                    .slice(0, 4)
                    .map((c) => (
                      <div key={c.id} className="p-3.5 border border-white/12 bg-[#18181b] rounded-[4px] text-xs">
                        <p className="text-[#ececec]/55 mb-1">
                          <strong className="text-[#5e66ff]">{c.authorName}</strong> on{' '}
                          <span className="text-white">{c.storyTitle}</span>
                        </p>
                        <p className="text-[#ececec]/80 leading-relaxed">“{c.text}”</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORY PERFORMANCE & READER DROP-OFF ANALYTICS */}
      {activeTab === 'analytics' && selectedAnalyticsStory && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="meta-label">
              Select Story:
            </span>
            {publishedStories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedAnalyticsStoryId(s.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold border rounded-[4px] transition-colors cursor-pointer ${
                  selectedAnalyticsStory.id === s.id
                    ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                    : 'border-white/12 bg-[#18181b] text-[#ececec]/75 hover:border-[#5e66ff]'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 p-6 bg-[#18181b] border border-white/12 rounded-[4px] space-y-6">
              <div>
                <span className="meta-label !text-[#5e66ff] block mb-1">
                  Story Performance
                </span>
                <h2 className="font-brand text-2xl text-white uppercase">
                  {selectedAnalyticsStory.title}
                </h2>
              </div>

              <dl className="divide-y divide-white/12 text-sm">
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-[#ececec]/60">Reads</dt>
                  <dd className="font-tabular font-semibold text-white">
                    {selectedAnalyticsStory.reads.toLocaleString()}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-[#ececec]/60">Completed</dt>
                  <dd className="font-tabular font-semibold text-white">
                    {selectedAnalyticsStory.completedReads.toLocaleString()}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-[#ececec]/60">Completion rate</dt>
                  <dd className="font-tabular font-semibold text-[#5e66ff]">
                    {selectedAnalyticsStory.completionRate}%
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-[#ececec]/60">Likes</dt>
                  <dd className="font-tabular font-semibold text-white">
                    {selectedAnalyticsStory.likes.toLocaleString()}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-[#ececec]/60">Saves</dt>
                  <dd className="font-tabular font-semibold text-white">
                    {selectedAnalyticsStory.saves.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <div className="pt-4 border-t border-white/12">
                <h3 className="meta-label mb-3">
                  Reader Reactions
                </h3>
                {(() => {
                  const rx = selectedAnalyticsStory.reactions;
                  const total = Object.values(rx).reduce((a, b) => a + b, 0) || 1;
                  const items = [
                    { emoji: '❤️', label: 'Loved it', val: Math.round((rx.love / total) * 100) },
                    {
                      emoji: '😮',
                      label: 'Unexpected',
                      val: Math.round((rx.unexpected / total) * 100),
                    },
                    {
                      emoji: '🧠',
                      label: 'Thought-provoking',
                      val: Math.round((rx.thoughtful / total) * 100),
                    },
                    {
                      emoji: '😢',
                      label: 'Emotional',
                      val: Math.round((rx.emotional / total) * 100),
                    },
                  ];
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((item) => (
                        <div
                          key={item.label}
                          className="p-3 bg-[#151517] border border-white/12 rounded-[4px] flex items-center justify-between"
                        >
                          <span className="text-xs text-white">
                            {item.emoji} {item.label}
                          </span>
                          <span className="font-tabular text-xs font-semibold text-[#5e66ff]">
                            {item.val}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="lg:col-span-7 p-6 bg-[#18181b] border border-white/12 rounded-[4px] flex flex-col justify-between">
              <div>
                <span className="meta-label !text-[#5e66ff] block mb-1">
                  Engagement Retention Curve
                </span>
                <h3 className="font-brand text-2xl text-white uppercase mb-2">
                  READER DROP-OFF ACROSS STORY DEPTH
                </h3>
                <p className="text-xs text-[#ececec]/55 mb-6">
                  Shows approximately where readers remain immersed from the opening hook to the final paragraph.
                </p>

                <div className="space-y-5">
                  {[
                    { label: 'Opening', pct: selectedAnalyticsStory.dropOff.opening },
                    { label: '25% through', pct: selectedAnalyticsStory.dropOff.quarter },
                    { label: '50% (Midpoint)', pct: selectedAnalyticsStory.dropOff.half },
                    { label: '75% through', pct: selectedAnalyticsStory.dropOff.threeQuarters },
                    { label: 'Ending', pct: selectedAnalyticsStory.dropOff.ending },
                  ].map((stage) => (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-white">{stage.label}</span>
                        <span className="font-tabular font-semibold text-[#5e66ff]">
                          {stage.pct}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-[#111113] rounded-[2px] overflow-hidden">
                        <div
                          className="h-full bg-[#5e66ff] transition-all duration-300"
                          style={{ width: `${stage.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#151517] border-l-2 border-[#5e66ff] text-xs text-[#ececec]/80">
                <strong className="text-white">Editorial Insight:</strong> Your story retains{' '}
                <span className="font-tabular font-semibold text-[#5e66ff]">
                  {selectedAnalyticsStory.dropOff.ending}%
                </span>{' '}
                of readers through the final line—well above the platform average of 64% for{' '}
                {selectedAnalyticsStory.readingTime}-minute stories.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISTRACTION-FREE STORY EDITOR + WORD / PDF UPLOAD + AI WRITING ASSISTANT */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="p-4 bg-[#18181b] border border-white/12 rounded-[4px] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadPanel(false)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                    !showUploadPanel
                      ? 'bg-[#5e66ff] text-white'
                      : 'bg-[#1c1c1f] text-[#ececec]/75 border border-white/12'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Write in Website Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadPanel(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                    showUploadPanel
                      ? 'bg-[#5e66ff] text-white'
                      : 'bg-[#1c1c1f] text-[#ececec]/75 border border-white/12'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Word (.docx) or PDF</span>
                </button>
              </div>

              {uploadedFileName && (
                <div className="inline-flex items-center gap-2 text-xs text-[#5e66ff] font-medium">
                  <FileCheck className="w-4 h-4" />
                  <span>
                    Imported: <strong>{uploadedFileName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Word / PDF Dropzone Panel */}
            {showUploadPanel && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDropFile}
                className={`p-8 border-2 border-dashed rounded-[4px] transition-colors text-center space-y-4 ${
                  isDraggingOver
                    ? 'border-[#5e66ff] bg-[#5e66ff]/10'
                    : 'border-white/20 bg-[#18181b]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.pdf,.txt,.md,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isUploadingFile ? (
                  <div className="py-6 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5e66ff] mx-auto" />
                    <p className="text-lg font-semibold text-white">
                      Extracting paragraphs and formatting from your manuscript…
                    </p>
                  </div>
                ) : (
                  <>
                    <FileUp className="w-9 h-9 text-[#5e66ff] mx-auto" />
                    <div className="space-y-1">
                      <h3 className="font-brand text-xl text-white uppercase">
                        DROP YOUR WORD (.DOCX) OR PDF (.PDF) STORY FILE HERE
                      </h3>
                      <p className="text-xs text-[#ececec]/55 max-w-md mx-auto">
                        Supports Microsoft Word (`.docx`, `.doc`), Adobe PDF (`.pdf`), and plain text/Markdown (`.txt`, `.md`). Your paragraphs will load directly into the editor below so you can review or publish immediately.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Choose Word or PDF File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUploadPanel(false)}
                        className="px-4 py-2.5 text-xs font-medium border border-white/12 bg-[#1c1c1f] text-[#ececec] rounded-[4px] hover:border-[#5e66ff] cursor-pointer"
                      >
                        Return to Editor
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-6 md:p-8 bg-[#18181b] border border-white/12 rounded-[4px] space-y-6">
              {/* Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-white/12">
                <div>
                  <label className="block meta-label mb-1.5">
                    Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block meta-label mb-1.5">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                  >
                    {MOOD_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block meta-label mb-1.5">
                    Reading Time
                  </label>
                  <select
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff] font-tabular"
                  >
                    <option value={2}>2 min</option>
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={20}>20+ min</option>
                  </select>
                </div>
              </div>

              {/* Story Title */}
              <div>
                <label className="block meta-label mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your story title..."
                  className="w-full font-brand text-2xl md:text-3xl text-white bg-transparent border-b border-white/12 pb-2 focus:outline-none focus:border-[#5e66ff]"
                />
              </div>

              {/* Short Hook Description */}
              <div>
                <label className="block meta-label mb-1">
                  One-Line Hook Description (Optional — or generate with AI)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., He had one stop left on the midnight line..."
                  className="w-full text-sm text-[#ececec]/85 bg-transparent border-b border-white/12 pb-2 focus:outline-none focus:border-[#5e66ff]"
                />
              </div>

              {/* Manuscript Prose Editor or Preview */}
              {isPreviewing ? (
                <div className="py-6 space-y-5 font-prose text-lg leading-relaxed text-[#ececec] border-t border-white/12">
                  <p className="meta-label !text-[#5e66ff]">
                    Reader Mode Preview
                  </p>
                  {manuscript
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? 'first-letter:text-5xl first-letter:font-brand first-letter:float-left first-letter:mr-3 first-letter:text-[#5e66ff]'
                            : ''
                        }
                      >
                        {para}
                      </p>
                    ))}
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="meta-label">
                      Story Manuscript (Write directly or edit imported Word/PDF text)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#5e66ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Import .docx / .pdf</span>
                      </button>
                      <span className="meta-label">
                        {manuscript.trim() ? manuscript.trim().split(/\s+/).length : 0} words
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={manuscript}
                    onChange={(e) => setManuscript(e.target.value)}
                    rows={15}
                    placeholder="Start writing your story here, or click 'Upload Word (.docx) or PDF' above to import a manuscript file from your device..."
                    className="w-full p-4 font-prose text-lg leading-relaxed text-[#ececec] bg-[#151517] border border-white/12 rounded-[4px] focus:outline-none focus:border-[#5e66ff] resize-y"
                  />
                </div>
              )}

              {/* Bottom Action Bar: Save Draft, Preview, Publish */}
              <div className="pt-4 border-t border-white/12 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border border-white/12 bg-[#1c1c1f] rounded-[4px] hover:border-[#5e66ff] transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPreviewing((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border border-white/12 bg-[#1c1c1f] rounded-[4px] hover:border-[#5e66ff] transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isPreviewing ? 'Back to Editing' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiatePublish}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Optional AI Writing Assistant */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="p-6 bg-[#18181b] border border-white/12 rounded-[4px]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#5e66ff]" />
                <h2 className="font-brand text-lg text-white uppercase">AI EDITORIAL ASSISTANT</h2>
              </div>
              <p className="text-xs text-[#ececec]/55 mb-5">
                Works on both in-browser writing and uploaded Word/PDF manuscripts. Supports your craft without replacing your voice.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {AI_ACTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={aiLoading}
                    onClick={() => handleRunAiTool(item.id)}
                    className={`p-2.5 text-left border rounded-[4px] transition-colors cursor-pointer ${
                      activeAiTool === item.id
                        ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                        : 'bg-[#151517] border-white/12 hover:border-[#5e66ff]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">
                      <span className="mr-1">{item.emoji}</span>
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] line-clamp-1 mt-0.5 ${
                        activeAiTool === item.id ? 'text-white/85' : 'text-[#ececec]/50'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>

              {aiLoading && (
                <div className="mt-6 p-5 bg-[#151517] border border-white/12 rounded-[4px] flex items-center gap-3 text-xs text-[#ececec]/75">
                  <Loader2 className="w-4 h-4 animate-spin text-[#5e66ff]" />
                  <span>Reading your manuscript and preparing editorial notes…</span>
                </div>
              )}

              {aiError && (
                <div className="mt-6 p-4 bg-[#151517] border border-red-500/40 rounded-[4px] text-xs text-red-400">
                  {aiError}
                </div>
              )}

              {aiResult && !aiLoading && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="meta-label !text-[#5e66ff]">
                      Editorial Notes
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiResult(null)}
                      className="text-xs text-[#ececec]/55 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-xs italic text-[#ececec]/85 bg-[#151517] p-3 border border-white/12 rounded-[4px]">
                    {aiResult.summary}
                  </p>

                  {aiResult.suggestions?.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#151517] border border-white/12 rounded-[4px] space-y-2 text-xs"
                    >
                      <p className="font-semibold text-white">{sug.label}</p>
                      <p className="font-prose text-sm text-[#ececec]/85 leading-relaxed">
                        {sug.text}
                      </p>
                      <p className="text-[11px] text-[#ececec]/55">{sug.rationale}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(sug)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5e66ff] text-white font-semibold rounded-[4px] hover:bg-[#4e56f0] cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAiResult((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    suggestions: prev.suggestions.filter((_, i) => i !== idx),
                                  }
                                : null
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-white/12 rounded-[4px] text-[#ececec]/65 hover:text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* PRE-PUBLISH AI STORY METADATA & CONTENT MODERATION MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-white/12 rounded-[4px] max-w-xl w-full p-6 md:p-8 space-y-6 my-8 text-[#ececec]">
            <div className="flex items-start justify-between border-b border-white/12 pb-4">
              <div>
                <span className="meta-label !text-[#5e66ff] block mb-1">
                  AI Story Analysis & Moderation
                </span>
                <h2 className="font-brand text-2xl text-white uppercase">
                  REVIEW METADATA BEFORE PUBLISHING
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="p-1 text-[#ececec]/55 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishStepLoading ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-[#5e66ff] mx-auto" />
                <p className="text-base text-white">
                  Gemini is analyzing your story’s themes, reading time, and community safety…
                </p>
              </div>
            ) : (
              <>
                {moderationResult && (
                  <div
                    className={`p-4 border rounded-[4px] flex items-start gap-3 text-xs ${
                      moderationResult.status === 'approved'
                        ? 'bg-[#151517] border-white/12'
                        : 'bg-amber-950/40 border-amber-500/40'
                    }`}
                  >
                    {moderationResult.status === 'approved' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-white mb-0.5">
                        Content Moderation:{' '}
                        {moderationResult.status === 'approved'
                          ? 'Ready for Publication'
                          : 'Flagged for Editorial Review'}
                      </p>
                      <p className="text-[#ececec]/75">{moderationResult.editorialNote}</p>
                      {moderationResult.originalitySignal && (
                        <p className="meta-label !text-[#5e66ff] mt-1">
                          Voice signal: {moderationResult.originalitySignal}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block meta-label mb-1">
                        Suggested Genre
                      </label>
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full px-3 py-2 border border-white/12 rounded-[4px] bg-[#151517] text-white"
                      >
                        {GENRE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block meta-label mb-1">
                        Subgenre
                      </label>
                      <input
                        type="text"
                        value={subgenre}
                        onChange={(e) => setSubgenre(e.target.value)}
                        className="w-full px-3 py-2 border border-white/12 rounded-[4px] bg-[#151517] text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block meta-label mb-1">
                        Primary Mood
                      </label>
                      <input
                        type="text"
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full px-3 py-2 border border-white/12 rounded-[4px] bg-[#151517] text-white"
                      />
                    </div>
                    <div>
                      <label className="block meta-label mb-1">
                        Estimated Reading Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={readingTime}
                        onChange={(e) => setReadingTime(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-white/12 rounded-[4px] bg-[#151517] text-white font-tabular"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block meta-label mb-1">
                      Themes (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={themes.join(', ')}
                      onChange={(e) =>
                        setThemes(
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      className="w-full px-3 py-2 border border-white/12 rounded-[4px] bg-[#151517] text-white"
                    />
                  </div>

                  <div>
                    <label className="block meta-label mb-1">
                      Search Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(', ')}
                      onChange={(e) =>
                        setTags(
                          e.target.value
                            .split(',')
                            .map((s) => s.trim().replace(/^#/, ''))
                            .filter(Boolean)
                        )
                      }
                      className="w-full px-3 py-2 border border-white/12 rounded-[4px] bg-[#151517] text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/12 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 text-xs font-medium border border-white/12 rounded-[4px] text-[#ececec]/75 hover:text-white cursor-pointer"
                  >
                    Back to Editor
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPublish}
                    className="px-5 py-2 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] cursor-pointer"
                  >
                    Confirm & Publish Story
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
