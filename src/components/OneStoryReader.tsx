import React, { useState, useEffect } from 'react';
import { Story, ReactionType, StoryCollection } from '../types/story';
import { StoryCard } from './StoryCard';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  Check,
  Sun,
  Moon,
  BookOpen,
  FolderPlus,
} from 'lucide-react';

interface OneStoryReaderProps {
  story: Story;
  allStories: Story[];
  isLiked: boolean;
  isSaved: boolean;
  isFollowingAuthor: boolean;
  userReaction?: ReactionType;
  bookmarkedParagraph?: number;
  collections: StoryCollection[];
  onClose: () => void;
  onSelectStory: (story: Story) => void;
  onToggleLike: (storyId: string) => void;
  onToggleSave: (storyId: string) => void;
  onToggleFollow: (authorId: string) => void;
  onReact: (storyId: string, reaction: ReactionType) => void;
  onAddComment: (storyId: string, text: string, reaction?: ReactionType) => void;
  onSetBookmark: (storyId: string, paragraphIndex: number) => void;
  onAddStoryToCollection: (collectionId: string, storyId: string) => void;
  onMarkCompleted: (storyId: string) => void;
}

const REACTION_META: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'love', emoji: '❤️', label: 'Loved it' },
  { type: 'unexpected', emoji: '😮', label: 'Unexpected' },
  { type: 'emotional', emoji: '😢', label: 'Emotional' },
  { type: 'thoughtful', emoji: '🧠', label: 'Thought-provoking' },
  { type: 'creepy', emoji: '👻', label: 'Creepy' },
  { type: 'funny', emoji: '😂', label: 'Funny' },
];

export const OneStoryReader: React.FC<OneStoryReaderProps> = ({
  story,
  allStories,
  isLiked,
  isSaved,
  isFollowingAuthor,
  userReaction,
  bookmarkedParagraph,
  collections,
  onClose,
  onSelectStory,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  onReact,
  onAddComment,
  onSetBookmark,
  onAddStoryToCollection,
  onMarkCompleted,
}) => {
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [progress, setProgress] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [collectionToast, setCollectionToast] = useState<string | null>(null);
  const [completedSignaled, setCompletedSignaled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCompletedSignaled(false);
  }, [story.id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(100);
        return;
      }
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
      setProgress(pct);
      if (pct >= 80 && !completedSignaled) {
        setCompletedSignaled(true);
        onMarkCompleted(story.id);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [story.id, completedSignaled, onMarkCompleted]);

  const themeClasses = {
    light: 'bg-[#FBF9F5] text-[#1C1917] border-[#E5E0D8]',
    sepia: 'bg-[#F4ECD8] text-[#2C221E] border-[#DFD3B8]',
    dark: 'bg-[#111113] text-[#ececec] border-white/12 tracking-[0.01em]',
  }[theme];

  const mutedTextClass = {
    light: 'text-[#6B655E]',
    sepia: 'text-[#6E5D4F]',
    dark: 'text-[#ececec]/55',
  }[theme];

  const surfaceClass = {
    light: 'bg-[#F2EFE9] border-[#E5E0D8]',
    sepia: 'bg-[#EAE0C8] border-[#DFD3B8]',
    dark: 'bg-[#18181b] border-white/12',
  }[theme];

  const fontSizeClass = {
    sm: 'text-[16px] leading-[1.78]',
    md: 'text-[18px] leading-[1.85]',
    lg: 'text-[20px] leading-[1.9]',
    xl: 'text-[22px] leading-[1.95]',
  }[fontSize];

  const totalReactions =
    Object.values(story.reactions).reduce((acc, v) => acc + v, 0) || 1;
  const sortedReactions = REACTION_META.map((meta) => ({
    ...meta,
    count: story.reactions[meta.type] || 0,
    pct: Math.round(((story.reactions[meta.type] || 0) / totalReactions) * 100),
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const recommendations = allStories
    .filter((s) => s.id !== story.id && !s.isDraft)
    .map((candidate) => {
      let score = 0;
      if (candidate.genre === story.genre) score += 3;
      if (candidate.mood === story.mood || candidate.allMoods.includes(story.mood)) score += 3;
      if (Math.abs(candidate.readingTime - story.readingTime) <= 5) score += 2;
      if (candidate.isNewWriter) score += 2.5;
      const sharedThemes = candidate.themes.filter((t) => story.themes.includes(t)).length;
      score += sharedThemes * 1.5;
      return { story: candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.story);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?story=${story.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(story.id, commentText.trim(), userReaction);
    setCommentText('');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses}`}>
      {/* Thin Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div
          className="h-full bg-[#5e66ff] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Minimal Distraction-Free Top Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 md:px-8 h-16 flex items-center justify-between ${
          theme === 'dark'
            ? 'bg-[#111113]/90 border-white/12'
            : theme === 'sepia'
            ? 'bg-[#F4ECD8]/90 border-[#DFD3B8]'
            : 'bg-[#FBF9F5]/90 border-[#E5E0D8]'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-medium hover:text-[#5e66ff] transition-colors py-1.5 px-2 whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        <div className={`hidden sm:flex items-center gap-2 text-xs ${mutedTextClass}`}>
          <span className="font-semibold truncate max-w-[220px]">{story.title}</span>
          <span aria-hidden="true">·</span>
          <span className="font-tabular text-[#5e66ff]">{progress}% READ</span>
        </div>

        {/* Typography & Theme Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-current/15 rounded-[4px] overflow-hidden text-xs">
            {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`px-2 py-1 uppercase font-medium transition-colors cursor-pointer ${
                  fontSize === sz
                    ? 'bg-[#5e66ff] text-white'
                    : 'hover:bg-current/5'
                }`}
                title={`Font size ${sz.toUpperCase()}`}
              >
                {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-current/15 rounded-[4px] overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-1.5 transition-colors cursor-pointer ${
                theme === 'light' ? 'bg-[#5e66ff] text-white' : 'hover:bg-current/5'
              }`}
              title="Paper Light Mode"
              aria-label="Light reading mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('sepia')}
              className={`p-1.5 transition-colors cursor-pointer ${
                theme === 'sepia' ? 'bg-[#5e66ff] text-white' : 'hover:bg-current/5'
              }`}
              title="Archival Sepia Mode"
              aria-label="Sepia reading mode"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-1.5 transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-[#5e66ff] text-white' : 'hover:bg-current/5'
              }`}
              title="Variation 5 Dark Mode"
              aria-label="Dark reading mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main "One Story" Reading Column */}
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        {/* Story Editorial Header */}
        <header className="mb-10 pb-8 border-b border-current/15">
          <div className={`flex flex-wrap items-center gap-2 font-tabular text-[11px] uppercase tracking-widest mb-4 ${mutedTextClass}`}>
            <span className="text-[#5e66ff]">{story.genre}</span>
            {story.subgenre && (
              <>
                <span aria-hidden="true">·</span>
                <span>{story.subgenre}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{story.readingTime} MIN READ</span>
            <span aria-hidden="true">·</span>
            <span>{story.mood}</span>
          </div>

          <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl leading-[1.02] tracking-tight mb-6 uppercase">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-base">
                by <span className="font-semibold text-[#5e66ff]">{story.author}</span>
                {story.isNewWriter && (
                  <span className="ml-2 text-xs font-tabular uppercase text-[#5e66ff]">
                    · 🌱 Fresh Voice
                  </span>
                )}
              </p>
              <p className={`text-xs mt-1 ${mutedTextClass}`}>{story.authorBio}</p>
            </div>

            <button
              type="button"
              onClick={() => onToggleFollow(story.authorId)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-[4px] border transition-colors whitespace-nowrap cursor-pointer ${
                isFollowingAuthor
                  ? 'border-current/30 opacity-80'
                  : 'border-[#5e66ff] bg-[#5e66ff] text-white hover:bg-[#4e56f0]'
              }`}
            >
              {isFollowingAuthor ? '✓ Following Writer' : '+ Follow Writer'}
            </button>
          </div>
        </header>

        {/* Bookmark indicator */}
        {bookmarkedParagraph !== undefined && (
          <div className={`mb-6 px-4 py-2.5 border rounded-[4px] text-xs flex items-center justify-between ${surfaceClass}`}>
            <span>
              🔖 Bookmarked at paragraph <strong className="font-tabular">#{bookmarkedParagraph + 1}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(`para-${bookmarkedParagraph}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="text-[#5e66ff] font-medium hover:underline cursor-pointer"
            >
              Jump to bookmark →
            </button>
          </div>
        )}

        {/* Story Body Content */}
        <article className={`font-prose space-y-6 ${fontSizeClass}`}>
          {story.content.map((paragraph, index) => {
            const isBookmarked = bookmarkedParagraph === index;
            return (
              <div
                id={`para-${index}`}
                key={index}
                className="group relative"
              >
                <p
                  className={
                    index === 0
                      ? 'first-letter:text-5xl first-letter:font-brand first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#5e66ff]'
                      : ''
                  }
                >
                  {paragraph}
                </p>
                <button
                  type="button"
                  onClick={() => onSetBookmark(story.id, index)}
                  title="Bookmark this paragraph"
                  className={`mt-1 sm:mt-0 sm:absolute sm:-left-8 sm:top-1 text-xs transition-opacity cursor-pointer ${
                    isBookmarked
                      ? 'opacity-100 text-[#5e66ff]'
                      : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            );
          })}
        </article>

        {/* Subtle Ornament End Mark */}
        <div className="my-12 flex items-center justify-center gap-3 opacity-50">
          <span className="h-px w-12 bg-current" />
          <span className="font-tabular text-xs uppercase tracking-widest text-[#5e66ff]">END OF STORY</span>
          <span className="h-px w-12 bg-current" />
        </div>

        {/* Action Bar: Like, Save, Add to Collection, Comment, Share */}
        <div className="py-5 border-t border-b border-current/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleLike(story.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                isLiked
                  ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                  : 'border-current/20 hover:border-[#5e66ff]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>Like</span>
              <span className="font-tabular">({story.likes})</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(story.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-white text-[#111113] border-white'
                  : 'border-current/20 hover:border-[#5e66ff]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
              <span className="font-tabular">({story.saves})</span>
            </button>

            {/* Add to Collection Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCollectionMenu((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[4px] border border-current/20 hover:border-[#5e66ff] transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add to Shelf</span>
              </button>

              {showCollectionMenu && (
                <div className={`absolute left-0 mt-2 w-60 border rounded-[4px] shadow-xl p-2 z-30 ${surfaceClass}`}>
                  <p className={`text-[10px] font-tabular uppercase tracking-wider px-2 py-1 ${mutedTextClass}`}>
                    Select Collection
                  </p>
                  {collections.map((col) => {
                    const alreadyIn = col.storyIds.includes(story.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          onAddStoryToCollection(col.id, story.id);
                          setCollectionToast(`Added to ${col.emoji} ${col.title}`);
                          setShowCollectionMenu(false);
                          setTimeout(() => setCollectionToast(null), 2500);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#5e66ff]/15 rounded-[4px] flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">
                          {col.emoji} {col.title}
                        </span>
                        {alreadyIn && <Check className="w-3.5 h-3.5 text-[#5e66ff]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#reader-comments"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] border border-current/20 hover:border-[#5e66ff] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments ({story.comments.length})</span>
            </a>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] border border-current/20 hover:border-[#5e66ff] transition-colors cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {collectionToast && (
          <div className="mt-3 text-xs text-[#5e66ff] font-medium">
            ✓ {collectionToast}
          </div>
        )}

        {/* Finished? Did this story make you feel something? */}
        <section className={`mt-10 p-6 md:p-8 border rounded-[4px] ${surfaceClass}`}>
          <p className={`text-[11px] font-tabular uppercase tracking-widest mb-1 ${mutedTextClass}`}>
            Finished Reading?
          </p>
          <h2 className="font-brand text-xl uppercase mb-4">
            DID THIS STORY MAKE YOU FEEL SOMETHING?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
            {REACTION_META.map((item) => {
              const active = userReaction === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onReact(story.id, item.type)}
                  className={`px-3.5 py-2.5 text-xs font-semibold rounded-[4px] border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                      : 'border-current/15 hover:border-[#5e66ff]'
                  }`}
                >
                  <span className="truncate">
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                  </span>
                  <span className="font-tabular opacity-80 ml-2">
                    {story.reactions[item.type] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-5 border-t border-current/10">
            <h3 className={`text-[11px] font-tabular uppercase tracking-widest mb-3 ${mutedTextClass}`}>
              What readers felt
            </h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {sortedReactions.map((r) => (
                <div key={r.type} className="flex items-center gap-1.5">
                  <span>{r.emoji}</span>
                  <span className="font-tabular font-semibold">{r.pct}%</span>
                  <span className={`text-xs ${mutedTextClass}`}>({r.label})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Because you read this... Story Recommendations */}
        <section className="mt-14">
          <div className="mb-6">
            <p className={`text-[11px] font-tabular uppercase tracking-widest mb-1 text-[#5e66ff]`}>
              Curated Next Reads
            </p>
            <h2 className="font-brand text-2xl uppercase">
              BECAUSE YOU READ “{story.title}”
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 text-[#ececec]">
            {recommendations.map((rec) => (
              <StoryCard
                key={rec.id}
                story={rec}
                onRead={onSelectStory}
              />
            ))}
          </div>
        </section>

        {/* Story Comments */}
        <section id="reader-comments" className="mt-14 pt-10 border-t border-current/15">
          <h2 className="font-brand text-xl uppercase mb-2">
            READER REFLECTIONS ({story.comments.length})
          </h2>
          <p className={`text-xs mb-6 ${mutedTextClass}`}>
            Leave a note for {story.author} about a line or moment that stayed with you.
          </p>

          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder={`Share what you felt reading "${story.title}"...`}
              className="w-full p-3.5 text-sm border border-current/20 rounded-[4px] bg-transparent focus:outline-none focus:border-[#5e66ff] mb-3"
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${mutedTextClass}`}>
                {userReaction
                  ? `Attached reaction: ${REACTION_META.find((r) => r.type === userReaction)?.emoji} ${
                      REACTION_META.find((r) => r.type === userReaction)?.label
                    }`
                  : 'Tip: Select a reaction above to pair with your note'}
              </span>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
              >
                Post Reflection
              </button>
            </div>
          </form>

          {story.comments.length === 0 ? (
            <p className={`text-sm italic ${mutedTextClass}`}>
              No written reflections yet. Be the first reader to leave a note for {story.author}.
            </p>
          ) : (
            <div className="space-y-4">
              {story.comments.map((c) => {
                const reactObj = REACTION_META.find((r) => r.type === c.reaction);
                return (
                  <div key={c.id} className={`p-4 border rounded-[4px] ${surfaceClass}`}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#5e66ff]">{c.authorName}</span>
                      <div className={`flex items-center gap-2 ${mutedTextClass}`}>
                        {reactObj && (
                          <span>
                            {reactObj.emoji} {reactObj.label}
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-tabular">{c.createdAt}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
