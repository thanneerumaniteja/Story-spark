import React, { useState, useEffect } from 'react';
import {
  INITIAL_STORIES,
  INITIAL_COLLECTIONS,
  INITIAL_WRITERS,
  INITIAL_USER_STATE,
  INITIAL_DRAFTS,
} from './data/initialStories';
import { Story, StoryCollection, WriterProfile, UserState, ReactionType } from './types/story';
import { StoryCard } from './components/StoryCard';
import { StoryCoverArt } from './components/StoryCoverArt';
import { OneStoryReader } from './components/OneStoryReader';
import { WriterStudio } from './components/WriterStudio';
import { SemanticSearchView } from './components/SemanticSearchModal';
import { LibraryView, FollowingView, ProfileView } from './components/LibraryFollowingProfile';
import { AuthModal } from './components/AuthModal';
import {
  Dices,
  ArrowRight,
  Compass,
  PenTool,
  Bookmark,
  Users,
  Search,
  User,
  Mic,
  Sparkles,
  RotateCcw,
  LogIn,
} from 'lucide-react';

type NavSection = 'landing' | 'discover' | 'write' | 'library' | 'following' | 'search' | 'profile';

const TIME_OPTIONS = [
  { label: '2 MIN', value: 2 },
  { label: '5 MIN', value: 5 },
  { label: '10 MIN', value: 10 },
  { label: '15+ MIN', value: 15 },
];

const LANDING_MOODS = [
  { emoji: '❤️', label: 'Emotional', value: 'Emotional' },
  { emoji: '🕵️', label: 'Mysterious', value: 'Mysterious' },
  { emoji: '👻', label: 'Dark', value: 'Dark' },
  { emoji: '😂', label: 'Funny', value: 'Funny' },
  { emoji: '🚀', label: 'Sci-Fi', value: 'Science Fiction' },
  { emoji: '✨', label: 'Magical', value: 'Magical' },
  { emoji: '🧠', label: 'Psychological', value: 'Thought-provoking' },
  { emoji: '🌿', label: 'Peaceful', value: 'Peaceful' },
  { emoji: '💔', label: 'Heartbreaking', value: 'Heartbreaking' },
  { emoji: '🔥', label: 'Thrilling', value: 'Thrilling' },
];

const GENRE_LIST = [
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

const DISCOVERY_MOODS = [
  'Happy',
  'Sad',
  'Emotional',
  'Dark',
  'Mysterious',
  'Funny',
  'Romantic',
  'Inspiring',
  'Scary',
  'Thought-provoking',
  'Peaceful',
  'Magical',
  'Heartbreaking',
];

export default function App() {
  // Persistent state in localStorage
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('storyspark_stories_v1');
      return saved ? JSON.parse(saved) : INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  });

  const [drafts, setDrafts] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('storyspark_drafts_v1');
      return saved ? JSON.parse(saved) : INITIAL_DRAFTS;
    } catch {
      return INITIAL_DRAFTS;
    }
  });

  const [collections, setCollections] = useState<StoryCollection[]>(() => {
    try {
      const saved = localStorage.getItem('storyspark_collections_v1');
      return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  });

  const [writers, setWriters] = useState<WriterProfile[]>(() => {
    try {
      const saved = localStorage.getItem('storyspark_writers_v1');
      return saved ? JSON.parse(saved) : INITIAL_WRITERS;
    } catch {
      return INITIAL_WRITERS;
    }
  });

  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('storyspark_user_v1');
      return saved ? JSON.parse(saved) : INITIAL_USER_STATE;
    } catch {
      return INITIAL_USER_STATE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('storyspark_stories_v1', JSON.stringify(stories));
    } catch {}
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem('storyspark_drafts_v1', JSON.stringify(drafts));
    } catch {}
  }, [drafts]);

  useEffect(() => {
    try {
      localStorage.setItem('storyspark_collections_v1', JSON.stringify(collections));
    } catch {}
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem('storyspark_writers_v1', JSON.stringify(writers));
    } catch {}
  }, [writers]);

  useEffect(() => {
    try {
      localStorage.setItem('storyspark_user_v1', JSON.stringify(userState));
    } catch {}
  }, [userState]);

  // Navigation & Active Story state
  const [activeNav, setActiveNav] = useState<NavSection>('discover');
  const [readingStoryId, setReadingStoryId] = useState<string | null>(null);

  // Story Discovery Engine Filters (Section 5)
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // "Surprise Me" Animation Modal State (Section 6)
  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);
  const [surpriseRevealing, setSurpriseRevealing] = useState(false);
  const [surpriseStory, setSurpriseStory] = useState<Story | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLoginUpdate = (
    updatedUser: Partial<UserState>,
    redirectToWriters = false
  ) => {
    setUserState((prev) => ({ ...prev, ...updatedUser }));
    if (redirectToWriters) {
      setActiveNav('following');
    }
  };

  const activeReadingStory = stories.find((s) => s.id === readingStoryId) || null;

  // Story of the Moment & Daily Story
  const storyOfTheMoment =
    stories.find((s) => s.isStoryOfTheMoment) || stories[1] || stories[0];
  const dailyStory = stories.find((s) => s.isDailyStory) || stories[0];

  // Fresh Voices (New Writer Discovery - Section 9)
  const freshVoiceStories = stories
    .filter((s) => !s.isDraft && s.isNewWriter)
    .sort((a, b) => b.completionRate - a.completionRate);

  // Filtered Personalized Discovery Feed
  const filteredStories = stories
    .filter((s) => !s.isDraft)
    .filter((s) => {
      if (selectedTime !== null) {
        if (selectedTime >= 15) {
          if (s.readingTime < 15) return false;
        } else if (s.readingTime > selectedTime) {
          return false;
        }
      }
      if (selectedMood !== null) {
        const moodMatch =
          s.mood.toLowerCase() === selectedMood.toLowerCase() ||
          s.allMoods.some((m) => m.toLowerCase() === selectedMood.toLowerCase()) ||
          s.genre.toLowerCase() === selectedMood.toLowerCase();
        if (!moodMatch) return false;
      }
      if (selectedGenre !== null) {
        if (s.genre.toLowerCase() !== selectedGenre.toLowerCase()) return false;
      }
      return true;
    });

  // Handlers
  const handleOpenStory = (story: Story) => {
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, reads: s.reads + 1 } : s))
    );
    setReadingStoryId(story.id);
  };

  const handleMarkCompleted = (storyId: string) => {
    if (!userState.readStoryIds.includes(storyId)) {
      setUserState((prev) => ({
        ...prev,
        readStoryIds: [...prev.readStoryIds, storyId],
        storiesReadThisWeek: prev.storiesReadThisWeek + 1,
      }));
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId ? { ...s, completedReads: s.completedReads + 1 } : s
        )
      );
    }
  };

  const handleToggleLike = (storyId: string) => {
    const alreadyLiked = userState.likedStoryIds.includes(storyId);
    setUserState((prev) => ({
      ...prev,
      likedStoryIds: alreadyLiked
        ? prev.likedStoryIds.filter((id) => id !== storyId)
        : [...prev.likedStoryIds, storyId],
    }));
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, likes: Math.max(0, s.likes + (alreadyLiked ? -1 : 1)) }
          : s
      )
    );
  };

  const handleToggleSave = (storyId: string) => {
    const alreadySaved = userState.savedStoryIds.includes(storyId);
    setUserState((prev) => ({
      ...prev,
      savedStoryIds: alreadySaved
        ? prev.savedStoryIds.filter((id) => id !== storyId)
        : [...prev.savedStoryIds, storyId],
    }));
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, saves: Math.max(0, s.saves + (alreadySaved ? -1 : 1)) }
          : s
      )
    );
  };

  const handleToggleFollow = (writerId: string) => {
    const alreadyFollowing = userState.followedWriterIds.includes(writerId);
    setUserState((prev) => ({
      ...prev,
      followedWriterIds: alreadyFollowing
        ? prev.followedWriterIds.filter((id) => id !== writerId)
        : [...prev.followedWriterIds, writerId],
    }));
    setWriters((prev) =>
      prev.map((w) =>
        w.id === writerId
          ? {
              ...w,
              followersCount: Math.max(
                0,
                w.followersCount + (alreadyFollowing ? -1 : 1)
              ),
            }
          : w
      )
    );
  };

  const handleReact = (storyId: string, reaction: ReactionType) => {
    const previousReaction = userState.userReactions[storyId];
    setUserState((prev) => ({
      ...prev,
      userReactions: { ...prev.userReactions, [storyId]: reaction },
    }));
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const nextReactions = { ...s.reactions };
        if (previousReaction && nextReactions[previousReaction] > 0) {
          nextReactions[previousReaction] -= 1;
        }
        nextReactions[reaction] = (nextReactions[reaction] || 0) + 1;
        return { ...s, reactions: nextReactions };
      })
    );
  };

  const handleAddComment = (
    storyId: string,
    text: string,
    reaction?: ReactionType
  ) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: userState.readerName,
      createdAt: 'Just now',
      text,
      reaction,
    };
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, comments: [newComment, ...s.comments] } : s
      )
    );
  };

  const handleSetBookmark = (storyId: string, paragraphIndex: number) => {
    setUserState((prev) => ({
      ...prev,
      bookmarks: { ...prev.bookmarks, [storyId]: paragraphIndex },
    }));
  };

  const handleAddStoryToCollection = (collectionId: string, storyId: string) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id !== collectionId) return col;
        const exists = col.storyIds.includes(storyId);
        return {
          ...col,
          storyIds: exists
            ? col.storyIds.filter((id) => id !== storyId)
            : [...col.storyIds, storyId],
        };
      })
    );
  };

  const handleCreateCollection = (
    title: string,
    emoji: string,
    description: string,
    isPublic: boolean
  ) => {
    const newCol: StoryCollection = {
      id: `col-${Date.now()}`,
      title,
      emoji,
      description,
      isPublic,
      storyIds: [],
    };
    setCollections((prev) => [newCol, ...prev]);
  };

  const handleToggleCollectionPrivacy = (collectionId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, isPublic: !c.isPublic } : c
      )
    );
  };

  const handleSaveDraft = (draft: Story) => {
    setDrafts((prev) => {
      const exists = prev.some((d) => d.id === draft.id);
      return exists
        ? prev.map((d) => (d.id === draft.id ? draft : d))
        : [draft, ...prev];
    });
  };

  const handlePublishStory = (story: Story) => {
    setStories((prev) => {
      const exists = prev.some((s) => s.id === story.id);
      return exists
        ? prev.map((s) => (s.id === story.id ? story : s))
        : [story, ...prev];
    });
    setDrafts((prev) => prev.filter((d) => d.id !== story.id));
  };

  // Trigger "Surprise Me" Feature (Section 6)
  const handleSurpriseMe = () => {
    const pool = stories.filter((s) => !s.isDraft);
    const unreadPool = pool.filter((s) => !userState.readStoryIds.includes(s.id));
    const candidates = unreadPool.length > 0 ? unreadPool : pool;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    setSurpriseStory(chosen);
    setSurpriseModalOpen(true);
    setSurpriseRevealing(true);
    setTimeout(() => {
      setSurpriseRevealing(false);
    }, 1100);
  };

  // If "One Story" Distraction-Free Reading Mode is open, render only OneStoryReader
  if (activeReadingStory) {
    return (
      <OneStoryReader
        story={activeReadingStory}
        allStories={stories}
        isLiked={userState.likedStoryIds.includes(activeReadingStory.id)}
        isSaved={userState.savedStoryIds.includes(activeReadingStory.id)}
        isFollowingAuthor={userState.followedWriterIds.includes(
          activeReadingStory.authorId
        )}
        userReaction={userState.userReactions[activeReadingStory.id]}
        bookmarkedParagraph={userState.bookmarks[activeReadingStory.id]}
        collections={collections}
        onClose={() => setReadingStoryId(null)}
        onSelectStory={(nextStory) => handleOpenStory(nextStory)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onToggleFollow={handleToggleFollow}
        onReact={handleReact}
        onAddComment={handleAddComment}
        onSetBookmark={handleSetBookmark}
        onAddStoryToCollection={handleAddStoryToCollection}
        onMarkCompleted={handleMarkCompleted}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111113] text-[#ececec] pb-16 md:pb-0">
      {/* VARIATION 5 TOP HEADER */}
      <header className="sticky top-0 z-30 h-16 bg-[#111113]/85 backdrop-blur-md border-b border-white/12 px-6 flex items-center justify-between">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            setSelectedTime(null);
            setSelectedMood(null);
            setSelectedGenre(null);
            setActiveNav('discover');
          }}
          className="font-brand text-xl tracking-tight text-white uppercase cursor-pointer"
        >
          STORYSPARK.
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {(
            [
              { id: 'discover', label: 'Discover' },
              { id: 'write', label: 'Write' },
              { id: 'library', label: 'Library' },
              { id: 'following', label: 'Following' },
              { id: 'search', label: 'Search' },
            ] as const
          ).map((item) => {
            const isActive =
              activeNav === item.id ||
              (item.id === 'discover' && activeNav === 'landing');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`px-4 py-2 rounded-[4px] text-[13.5px] transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#5e66ff] bg-[#5e66ff]/12 font-medium'
                    : 'text-[#ececec]/55 hover:text-[#ececec] hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Profile & Sign In (Alex) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveNav('profile')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs transition-colors cursor-pointer ${
              activeNav === 'profile'
                ? 'text-[#5e66ff] bg-[#5e66ff]/12 border border-[#5e66ff]/40'
                : 'text-[#ececec]/60 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-3.5 py-1.5 rounded-[4px] text-[13px] text-[#ececec]/80 hover:text-white hover:border-[#5e66ff] border border-white/12 bg-transparent transition-colors cursor-pointer whitespace-nowrap"
          >
            Sign In ({userState.readerName})
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* VARIATION 5 DISCOVER / LANDING DASHBOARD */}
        {(activeNav === 'discover' || activeNav === 'landing') && (
          <div className="flex-1 flex flex-col">
            {/* Variation 5 Hero Banner */}
            <section
              className="py-12 md:py-16 px-6 text-center border-b border-white/12"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(94, 102, 255, 0.10), transparent)',
              }}
            >
              <span className="meta-label block mb-3">
                Selection Algorithm v2.4 · A few minutes. A whole story.
              </span>
              <h1 className="font-brand text-4xl sm:text-6xl md:text-[72px] text-white leading-[0.88] tracking-[-0.05em] uppercase mb-6">
                FEELING SOMETHING?
              </h1>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  className="bg-[#5e66ff] hover:bg-[#4e56f0] text-white text-xs font-semibold px-5 py-2.5 rounded-[4px] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Dices className="w-4 h-4" />
                  <span>Surprise Me</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav('search')}
                  className="bg-[#222226] hover:border-[#5e66ff] text-[#ececec] border border-white/12 text-xs font-semibold px-5 py-2.5 rounded-[4px] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Mic className="w-3.5 h-3.5 text-[#5e66ff]" />
                  <span>Voice Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav('write')}
                  className="bg-[#18181b] hover:border-[#5e66ff] text-[#ececec]/85 hover:text-white border border-white/12 text-xs font-semibold px-5 py-2.5 rounded-[4px] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#5e66ff]" />
                  <span>Write / Upload Story</span>
                </button>
              </div>
            </section>

            {/* Variation 5 Split Dashboard Container: 280px Control Pane + Scroll Pane */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr]">
              {/* Left Control Pane */}
              <aside className="p-6 border-b lg:border-b-0 lg:border-r border-white/12 bg-[#151517] space-y-8">
                {/* Reading Streak */}
                <div>
                  <span className="meta-label block mb-2">Reading Streak</span>
                  <div className="font-brand text-4xl text-[#5e66ff] leading-none">
                    0{userState.streakDays} DAYS
                  </div>
                  <p className="text-[11px] text-[#ececec]/45 mt-1.5">
                    {userState.storiesReadThisWeek} stories completed this week
                  </p>
                </div>

                {/* Active Filter Reset */}
                {(selectedTime !== null ||
                  selectedMood !== null ||
                  selectedGenre !== null) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTime(null);
                      setSelectedMood(null);
                      setSelectedGenre(null);
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-[#5e66ff] border border-[#5e66ff]/40 bg-[#5e66ff]/10 rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Active Filters</span>
                  </button>
                )}

                {/* Duration Filter */}
                <div>
                  <span className="meta-label block mb-3">Duration</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '2m', val: 2 },
                      { label: '5m', val: 5 },
                      { label: '10m', val: 10 },
                      { label: '15m', val: 15 },
                    ].map((d) => {
                      const active = selectedTime === d.val;
                      return (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() =>
                            setSelectedTime(active ? null : d.val)
                          }
                          className={`px-3 py-1.5 text-xs rounded-[4px] border transition-colors cursor-pointer font-tabular ${
                            active
                              ? 'bg-[#5e66ff] text-white border-[#5e66ff] font-semibold'
                              : 'bg-[#1c1c1f] border-white/12 text-[#ececec]/55 hover:border-[#5e66ff] hover:text-[#ececec]'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vibe / Mood Filter */}
                <div>
                  <span className="meta-label block mb-3">Vibe</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Happy', value: 'Happy' },
                      { label: 'Dark', value: 'Dark' },
                      { label: 'Mystery', value: 'Mysterious' },
                      { label: 'Romantic', value: 'Romantic' },
                      { label: 'Inspiring', value: 'Inspiring' },
                      { label: 'Scary', value: 'Scary' },
                      { label: 'Emotional', value: 'Emotional' },
                      { label: 'Peaceful', value: 'Peaceful' },
                      { label: 'Funny', value: 'Funny' },
                      { label: 'Magical', value: 'Magical' },
                    ].map((v) => {
                      const active = selectedMood === v.value;
                      return (
                        <button
                          key={v.label}
                          type="button"
                          onClick={() =>
                            setSelectedMood(active ? null : v.value)
                          }
                          className={`px-2.5 py-1.5 text-xs rounded-[4px] border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#5e66ff] text-white border-[#5e66ff] font-semibold'
                              : 'bg-[#1c1c1f] border-white/12 text-[#ececec]/55 hover:border-[#5e66ff] hover:text-[#ececec]'
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Genre Filter */}
                <div>
                  <span className="meta-label block mb-3">Genre</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Sci-Fi', value: 'Science Fiction' },
                      { label: 'Horror', value: 'Horror' },
                      { label: 'Fantasy', value: 'Fantasy' },
                      { label: 'Comedy', value: 'Comedy' },
                      { label: 'Drama', value: 'Drama' },
                      { label: 'Mystery', value: 'Mystery' },
                      { label: 'Romance', value: 'Romance' },
                      { label: 'Slice of Life', value: 'Slice of Life' },
                      { label: 'Experimental', value: 'Experimental' },
                    ].map((g) => {
                      const active = selectedGenre === g.value;
                      return (
                        <button
                          key={g.label}
                          type="button"
                          onClick={() =>
                            setSelectedGenre(active ? null : g.value)
                          }
                          className={`px-2.5 py-1.5 text-xs rounded-[4px] border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#5e66ff] text-white border-[#5e66ff] font-semibold'
                              : 'bg-[#1c1c1f] border-white/12 text-[#ececec]/55 hover:border-[#5e66ff] hover:text-[#ececec]'
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Story Highlight in Sidebar */}
                <div
                  onClick={() => handleOpenStory(dailyStory)}
                  className="p-4 bg-[#18181b] border border-white/12 hover:border-[#5e66ff] rounded-[4px] cursor-pointer transition-colors space-y-2"
                >
                  <span className="meta-label !text-[#5e66ff] block">
                    ✨ Daily Story Pick
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    {dailyStory.title}
                  </h4>
                  <p className="text-xs text-[#ececec]/55 line-clamp-2">
                    “{dailyStory.description}”
                  </p>
                  <div className="pt-1 flex items-center justify-between meta-label">
                    <span>by {dailyStory.author}</span>
                    <span className="text-[#5e66ff]">{dailyStory.readingTime}m →</span>
                  </div>
                </div>
              </aside>

              {/* Right Scroll Pane */}
              <section className="p-6 md:p-8 space-y-14 overflow-y-auto">
                {/* Main Feed Section */}
                <div>
                  <div className="flex items-baseline justify-between mb-6">
                    <h2 className="font-brand text-2xl text-white uppercase">
                      {selectedTime
                        ? `NEXT ${selectedTime} MINUTES`
                        : selectedMood
                        ? `${selectedMood.toUpperCase()} VIBE`
                        : selectedGenre
                        ? `${selectedGenre.toUpperCase()} STORIES`
                        : 'NEXT 5 MINUTES'}
                    </h2>
                    <span className="meta-label">
                      {filteredStories.length} Matches found
                    </span>
                  </div>

                  {filteredStories.length === 0 ? (
                    <div className="p-10 bg-[#18181b] border border-white/12 rounded-[4px] text-center space-y-3">
                      <p className="text-lg font-semibold text-white">
                        No stories match that exact filter combination.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTime(null);
                          setSelectedMood(null);
                          setSelectedGenre(null);
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-[#5e66ff] text-white rounded-[4px] cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {filteredStories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onRead={handleOpenStory}
                          isSaved={userState.savedStoryIds.includes(story.id)}
                          onToggleSave={(id) => handleToggleSave(id)}
                          onSelectAuthor={() => setActiveNav('following')}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* FRESH VOICES Section (Matching Variation 5 compact bar + full cards) */}
                <div>
                  <span className="meta-label !text-[#5e66ff] block mb-1">
                    Recently Published
                  </span>
                  <div className="flex items-baseline justify-between mb-6">
                    <h2 className="font-brand text-2xl text-white uppercase">
                      FRESH VOICES
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveNav('following')}
                      className="meta-label hover:!text-[#5e66ff] cursor-pointer"
                    >
                      Find & Follow Emerging Writers →
                    </button>
                  </div>

                  {/* Variation 5 Compact Strip for Fresh Voices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {freshVoiceStories.slice(0, 4).map((story) => (
                      <div
                        key={`compact-${story.id}`}
                        onClick={() => handleOpenStory(story)}
                        className="p-4 bg-[#18181b] border border-white/12 hover:border-[#5e66ff] rounded-[4px] flex items-center justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-brand text-sm text-white uppercase block truncate">
                            {story.title}
                          </span>
                          <span className="text-xs text-[#ececec]/50 truncate block mt-0.5">
                            {story.genre} · {story.readingTime}m · {story.completionRate}% completion
                          </span>
                        </div>
                        <span className="meta-label !text-[#5e66ff] shrink-0">
                          {story.author}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Story of the Moment Showcase Banner */}
                  <div
                    onClick={() => handleOpenStory(storyOfTheMoment)}
                    className="p-6 md:p-8 bg-[#18181b] border border-white/12 hover:border-[#5e66ff] rounded-[4px] cursor-pointer transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
                  >
                    <div className="w-full md:w-[160px] h-[160px] shrink-0">
                      <StoryCoverArt
                        story={storyOfTheMoment}
                        aspectClass="w-full h-full"
                        className="w-full h-full rounded-[4px]"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="meta-label !text-[#5e66ff]">
                          ★ Story of the Moment
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="meta-label">
                          {storyOfTheMoment.completionRate}% Completion Rate
                        </span>
                      </div>
                      <h3 className="font-brand text-2xl md:text-3xl text-white uppercase">
                        {storyOfTheMoment.title}
                      </h3>
                      <p className="text-sm text-[#5e66ff] font-medium">
                        by {storyOfTheMoment.author} · {storyOfTheMoment.readingTime} min read
                      </p>
                      <p className="text-sm text-[#ececec]/65 leading-relaxed max-w-2xl">
                        “{storyOfTheMoment.description}”
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-[#5e66ff] hover:bg-[#4e56f0] text-white text-xs font-semibold px-5 py-3 rounded-[4px] shrink-0 cursor-pointer"
                    >
                      Read Now
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* VIEW 3: WRITER STUDIO */}
        {activeNav === 'write' && (
          <WriterStudio
            writerName={userState.writerName}
            publishedStories={stories.filter((s) => !s.isDraft)}
            drafts={drafts}
            followers={writers}
            onSaveDraft={handleSaveDraft}
            onPublishStory={handlePublishStory}
            onOpenStory={handleOpenStory}
          />
        )}

        {/* VIEW 4: LIBRARY & STORY COLLECTIONS */}
        {activeNav === 'library' && (
          <LibraryView
            stories={stories}
            collections={collections}
            savedStoryIds={userState.savedStoryIds}
            readStoryIds={userState.readStoryIds}
            onReadStory={handleOpenStory}
            onToggleSave={handleToggleSave}
            onCreateCollection={handleCreateCollection}
            onToggleCollectionPrivacy={handleToggleCollectionPrivacy}
          />
        )}

        {/* VIEW 5: FOLLOWING */}
        {activeNav === 'following' && (
          <FollowingView
            stories={stories}
            writers={writers}
            followedWriterIds={userState.followedWriterIds}
            savedStoryIds={userState.savedStoryIds}
            onReadStory={handleOpenStory}
            onToggleSave={handleToggleSave}
            onToggleFollow={handleToggleFollow}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {/* VIEW 6: AI SEMANTIC & VOICE SEARCH */}
        {activeNav === 'search' && (
          <SemanticSearchView
            stories={stories}
            savedStoryIds={userState.savedStoryIds}
            onReadStory={handleOpenStory}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* VIEW 7: USER PROFILE */}
        {activeNav === 'profile' && (
          <ProfileView
            userState={userState}
            stories={stories}
            collections={collections}
            onReadStory={handleOpenStory}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        currentUser={userState}
        writers={writers}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLoginUpdate}
      />

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111113]/95 backdrop-blur-md border-t border-white/12 px-2 py-1.5 grid grid-cols-5"
      >
        {(
          [
            { id: 'discover', label: 'Discover', icon: Compass },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'write', label: 'Write', icon: PenTool },
            { id: 'library', label: 'Library', icon: Bookmark },
            { id: 'following', label: 'Writers', icon: Users },
          ] as const
        ).map((item) => {
          const IconComponent = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
                active ? 'text-[#5e66ff]' : 'text-[#ececec]/55'
              }`}
            >
              <IconComponent className="w-4 h-4 mb-0.5" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* "SURPRISE ME" ANIMATED LITERARY REVEAL MODAL */}
      {surpriseModalOpen && surpriseStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#18181b] border border-white/12 rounded-[4px] p-8 text-center space-y-6 text-[#ececec]">
            {surpriseRevealing ? (
              <div className="py-12 space-y-4">
                <Dices className="w-10 h-10 text-[#5e66ff] mx-auto animate-spin" />
                <p className="font-brand text-2xl text-white uppercase">
                  SELECTING SOMETHING UNEXPECTED…
                </p>
                <p className="meta-label">
                  Matching your preferred reading time & mood…
                </p>
              </div>
            ) : (
              <div className="space-y-5 text-left">
                <div className="flex items-center justify-between meta-label !text-[#5e66ff]">
                  <span>🎲 Serendipity Pick</span>
                  <span>{surpriseStory.readingTime}M READ</span>
                </div>

                <StoryCoverArt
                  story={surpriseStory}
                  aspectClass="aspect-[16/9]"
                  className="w-full rounded-[4px]"
                />

                <div>
                  <p className="meta-label mb-1">
                    {surpriseStory.genre} · {surpriseStory.mood}
                  </p>
                  <h2 className="font-brand text-2xl text-white uppercase">
                    {surpriseStory.title}
                  </h2>
                  <p className="text-xs text-[#5e66ff] font-medium mt-1">
                    by {surpriseStory.author}
                  </p>
                </div>

                <p className="text-sm text-[#ececec]/70 leading-relaxed">
                  “{surpriseStory.description}”
                </p>

                <div className="pt-4 border-t border-dotted border-white/12 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className="px-4 py-2 text-xs font-medium border border-white/12 bg-[#1c1c1f] rounded-[4px] hover:border-[#5e66ff] cursor-pointer"
                  >
                    🎲 Roll Another
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSurpriseModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-[#ececec]/60 hover:text-white cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSurpriseModalOpen(false);
                        handleOpenStory(surpriseStory);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] cursor-pointer"
                    >
                      <span>Read Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
