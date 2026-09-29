import React, { useState } from 'react';
import { Story, StoryCollection, WriterProfile, UserState } from '../types/story';
import { StoryCard } from './StoryCard';
import {
  Lock,
  Globe,
  Plus,
  UserPlus,
  UserCheck,
  BookOpen,
  Feather,
  Search,
  MapPin,
  LogIn,
} from 'lucide-react';

interface LibraryViewProps {
  stories: Story[];
  collections: StoryCollection[];
  savedStoryIds: string[];
  readStoryIds: string[];
  onReadStory: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
  onCreateCollection: (title: string, emoji: string, description: string, isPublic: boolean) => void;
  onToggleCollectionPrivacy: (collectionId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  stories,
  collections,
  savedStoryIds,
  readStoryIds,
  onReadStory,
  onToggleSave,
  onCreateCollection,
  onToggleCollectionPrivacy,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    collections[0]?.id || 'saved'
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌙');
  const [newDesc, setNewDesc] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);

  const activeCollection = collections.find((c) => c.id === selectedCollectionId);

  const displayedStories =
    selectedCollectionId === 'saved'
      ? stories.filter((s) => savedStoryIds.includes(s.id) && !s.isDraft)
      : selectedCollectionId === 'history'
      ? stories.filter((s) => readStoryIds.includes(s.id) && !s.isDraft)
      : stories.filter(
          (s) => activeCollection?.storyIds.includes(s.id) && !s.isDraft
        );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCollection(
      newTitle.trim(),
      newEmoji || '✨',
      newDesc.trim() || 'Curated short story anthology.',
      newIsPublic
    );
    setNewTitle('');
    setNewDesc('');
    setShowNewForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-6">
        <div>
          <span className="meta-label !text-[#5e66ff] block mb-1">
            Personal Reading Room
          </span>
          <h1 className="font-brand text-3xl md:text-4xl text-white uppercase">
            MY COLLECTIONS & SAVED STORIES
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowNewForm((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Create Collection Form */}
      {showNewForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-6 bg-[#18181b] border border-white/12 rounded-[4px] space-y-4 max-w-xl"
        >
          <h2 className="font-brand text-lg text-white uppercase">CREATE A STORY COLLECTION</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block meta-label mb-1">
                Icon
              </label>
              <select
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-white/12 rounded-[4px] bg-[#151517] text-white"
              >
                {['🌙', '👻', '❤️', '🚀', '🕵️', '✨', '🌿', '🔥', '☕'].map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block meta-label mb-1">
                Collection Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Rainy Sunday Reads"
                className="w-full px-3 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
              />
            </div>
          </div>

          <div>
            <label className="block meta-label mb-1">
              Description
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What connects the stories on this shelf?"
              className="w-full px-3 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-xs text-[#ececec]/75 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsPublic}
                onChange={(e) => setNewIsPublic(e.target.checked)}
              />
              <span>Public collection (visible on your reader profile)</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-3 py-1.5 text-xs border border-white/12 rounded-[4px] text-[#ececec]/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-[#5e66ff] text-white rounded-[4px] cursor-pointer"
              >
                Create Shelf
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setSelectedCollectionId('saved')}
          className={`p-4 text-left border rounded-[4px] transition-colors cursor-pointer ${
            selectedCollectionId === 'saved'
              ? 'bg-[#5e66ff]/15 border-[#5e66ff] text-white'
              : 'bg-[#18181b] border-white/12 hover:border-[#5e66ff]'
          }`}
        >
          <div className="flex items-center justify-between meta-label mb-2">
            <span>Bookmarks</span>
            <span>{savedStoryIds.length} stories</span>
          </div>
          <p className="text-base font-semibold text-white">🔖 Saved for Later</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCollectionId('history')}
          className={`p-4 text-left border rounded-[4px] transition-colors cursor-pointer ${
            selectedCollectionId === 'history'
              ? 'bg-[#5e66ff]/15 border-[#5e66ff] text-white'
              : 'bg-[#18181b] border-white/12 hover:border-[#5e66ff]'
          }`}
        >
          <div className="flex items-center justify-between meta-label mb-2">
            <span>Archive</span>
            <span>{readStoryIds.length} stories</span>
          </div>
          <p className="text-base font-semibold text-white">📖 Recently Read</p>
        </button>

        {collections.map((col) => {
          const isSelected = selectedCollectionId === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setSelectedCollectionId(col.id)}
              className={`p-4 text-left border rounded-[4px] transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#5e66ff]/15 border-[#5e66ff] text-white'
                  : 'bg-[#18181b] border-white/12 hover:border-[#5e66ff]'
              }`}
            >
              <div className="flex items-center justify-between meta-label mb-2">
                <span className="inline-flex items-center gap-1">
                  {col.isPublic ? (
                    <>
                      <Globe className="w-3 h-3 text-[#5e66ff]" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> Private
                    </>
                  )}
                </span>
                <span>{col.storyIds.length} stories</span>
              </div>
              <p className="text-base font-semibold text-white truncate">
                {col.emoji} {col.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Collection Details & Stories */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/12 pb-4">
          <div>
            <h2 className="font-brand text-2xl text-white uppercase">
              {selectedCollectionId === 'saved'
                ? 'SAVED FOR LATER'
                : selectedCollectionId === 'history'
                ? 'RECENTLY READ STORIES'
                : `${activeCollection?.emoji} ${activeCollection?.title}`}
            </h2>
            {activeCollection && (
              <p className="text-xs text-[#ececec]/55 mt-1">{activeCollection.description}</p>
            )}
          </div>

          {activeCollection && (
            <button
              type="button"
              onClick={() => onToggleCollectionPrivacy(activeCollection.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/12 bg-[#18181b] rounded-[4px] hover:border-[#5e66ff] cursor-pointer"
            >
              {activeCollection.isPublic ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-[#5e66ff]" />
                  <span>Public Collection (Click to make Private)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private Collection (Click to make Public)</span>
                </>
              )}
            </button>
          )}
        </div>

        {displayedStories.length === 0 ? (
          <p className="text-sm text-[#ececec]/55 py-8">
            No stories in this collection yet. Open any story and click “Save” or “Add to Shelf”.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onRead={onReadStory}
                isSaved={savedStoryIds.includes(story.id)}
                onToggleSave={(id) => onToggleSave(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

interface FollowingViewProps {
  stories: Story[];
  writers: WriterProfile[];
  followedWriterIds: string[];
  savedStoryIds: string[];
  onReadStory: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
  onToggleFollow: (writerId: string) => void;
  onOpenAuthModal?: () => void;
}

export const FollowingView: React.FC<FollowingViewProps> = ({
  stories,
  writers,
  followedWriterIds,
  savedStoryIds,
  onReadStory,
  onToggleSave,
  onToggleFollow,
  onOpenAuthModal,
}) => {
  const [writerQuery, setWriterQuery] = useState('');
  const [writerFilter, setWriterFilter] = useState<
    'all' | 'fresh' | 'following' | string
  >('all');
  const [selectedWriterId, setSelectedWriterId] = useState<string | null>(null);

  const followedStories = stories.filter(
    (s) => !s.isDraft && followedWriterIds.includes(s.authorId)
  );

  const filteredWriters = writers.filter((w) => {
    const q = writerQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.bio.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q) ||
      w.favoriteGenres.some((g) => g.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (writerFilter === 'fresh') return w.isNewWriter;
    if (writerFilter === 'following') return followedWriterIds.includes(w.id);
    if (writerFilter !== 'all') {
      return w.favoriteGenres.some(
        (g) => g.toLowerCase() === writerFilter.toLowerCase()
      );
    }
    return true;
  });

  const inspectedWriter = writers.find((w) => w.id === selectedWriterId);
  const inspectedWriterStories = inspectedWriter
    ? stories.filter(
        (s) =>
          !s.isDraft &&
          (s.authorId === inspectedWriter.id ||
            s.author.toLowerCase() === inspectedWriter.name.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-6">
        <div>
          <span className="meta-label !text-[#5e66ff] block mb-1">
            Find & Follow Writers
          </span>
          <h1 className="font-brand text-3xl md:text-4xl text-white uppercase">
            DISCOVER WRITERS ({followedWriterIds.length} FOLLOWED)
          </h1>
          <p className="text-sm text-[#ececec]/55 mt-1">
            Search for emerging and established writers by name, genre, or literary style.
          </p>
        </div>

        {onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border border-white/12 bg-[#18181b] hover:border-[#5e66ff] text-white rounded-[4px] transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#5e66ff]" />
            <span>Switch Account / Personalize Writers</span>
          </button>
        )}
      </header>

      {/* Find Writers Search & Filter Bar */}
      <section className="p-6 bg-[#18181b] border border-white/12 rounded-[4px] space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#ececec]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={writerQuery}
              onChange={(e) => setWriterQuery(e.target.value)}
              placeholder="Find writers by name (e.g., Arjun, Ananya, Elias), genre (Mystery, Sci-Fi), or city..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#151517] text-white border border-white/12 rounded-[4px] focus:outline-none focus:border-[#5e66ff]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Writers' },
            { id: 'fresh', label: '🌱 Fresh Voices' },
            { id: 'following', label: '✓ Following' },
            { id: 'Mystery', label: 'Mystery' },
            { id: 'Horror', label: 'Horror' },
            { id: 'Science Fiction', label: 'Sci-Fi' },
            { id: 'Fantasy', label: 'Fantasy' },
            { id: 'Slice of Life', label: 'Slice of Life' },
            { id: 'Experimental', label: 'Experimental' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWriterFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium border rounded-[4px] transition-colors cursor-pointer ${
                writerFilter === tab.id
                  ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                  : 'bg-[#1c1c1f] text-[#ececec]/70 border-white/12 hover:border-[#5e66ff] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Inspected Writer Portfolio Drawer */}
      {inspectedWriter && (
        <section className="p-6 md:p-8 bg-[#18181b] border border-[#5e66ff] rounded-[4px] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/12 pb-4">
            <div>
              <span className="meta-label !text-[#5e66ff] block mb-1">
                Writer Portfolio {inspectedWriter.isNewWriter ? '· 🌱 Fresh Voice' : ''}
              </span>
              <h2 className="font-brand text-3xl text-white uppercase">
                {inspectedWriter.name}
              </h2>
              <p className="meta-label mt-1 inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#5e66ff]" /> {inspectedWriter.location} ·{' '}
                {inspectedWriter.favoriteGenres.join(' · ')}
              </p>
              <p className="text-sm text-[#ececec]/70 mt-2 max-w-2xl">
                {inspectedWriter.bio}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleFollow(inspectedWriter.id)}
                className={`px-4 py-2 text-xs font-semibold border rounded-[4px] transition-colors cursor-pointer ${
                  followedWriterIds.includes(inspectedWriter.id)
                    ? 'bg-[#1c1c1f] text-white border-white/20'
                    : 'bg-[#5e66ff] text-white border-[#5e66ff]'
                }`}
              >
                {followedWriterIds.includes(inspectedWriter.id)
                  ? '✓ Following Writer'
                  : '+ Follow Writer'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedWriterId(null)}
                className="px-3 py-2 text-xs border border-white/12 rounded-[4px] hover:border-[#5e66ff] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-brand text-lg text-white uppercase mb-4">
              STORIES BY {inspectedWriter.name} ({inspectedWriterStories.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inspectedWriterStories.map((st) => (
                <StoryCard
                  key={st.id}
                  story={st}
                  onRead={onReadStory}
                  isSaved={savedStoryIds.includes(st.id)}
                  onToggleSave={(id) => onToggleSave(id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Writers Directory Grid */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-brand text-xl text-white uppercase">
            MATCHING WRITERS
          </h2>
          <span className="meta-label">
            {filteredWriters.length} Writers found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredWriters.map((w) => {
            const isFollowing = followedWriterIds.includes(w.id);
            const isSelected = selectedWriterId === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setSelectedWriterId(isSelected ? null : w.id)}
                className={`cursor-pointer p-6 border rounded-[4px] flex flex-col justify-between gap-4 transition-all ${
                  isSelected
                    ? 'bg-[#18181b] border-[#5e66ff]'
                    : 'bg-[#18181b] border-white/12 hover:border-[#5e66ff] hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      {w.name}
                    </h3>
                    {w.isNewWriter && (
                      <span className="meta-label !text-[#5e66ff]">
                        🌱 Fresh Voice
                      </span>
                    )}
                  </div>
                  <p className="meta-label mb-2">
                    📍 {w.location}
                  </p>
                  <p className="meta-label !text-[#5e66ff] mb-3">
                    {w.storiesCount} stories · {w.readsCount.toLocaleString()} reads · {w.followersCount} followers
                  </p>
                  <p className="text-xs text-[#ececec]/65 leading-relaxed mb-3">{w.bio}</p>
                  <p className="meta-label">
                    Genres: {w.favoriteGenres.join(' · ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-dotted border-white/12">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFollow(w.id);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold border rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isFollowing
                        ? 'bg-[#1c1c1f] text-white border-white/20'
                        : 'bg-[#5e66ff] text-white border-[#5e66ff] hover:bg-[#4e56f0]'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWriterId(isSelected ? null : w.id);
                    }}
                    className="px-3 py-2 text-xs font-medium border border-white/12 rounded-[4px] bg-[#1c1c1f] text-[#ececec]/80 hover:border-[#5e66ff] hover:text-white cursor-pointer"
                  >
                    Portfolio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stories from Followed Writers */}
      <section className="pt-8 border-t border-white/12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-brand text-xl text-white uppercase">
            LATEST DISPATCHES FROM WRITERS YOU FOLLOW
          </h2>
          <span className="meta-label">{followedStories.length} Stories</span>
        </div>
        {followedStories.length === 0 ? (
          <p className="text-sm text-[#ececec]/55">
            You aren’t following any writers yet. Follow writers above to see their latest stories here.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {followedStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onRead={onReadStory}
                isSaved={savedStoryIds.includes(story.id)}
                onToggleSave={(id) => onToggleSave(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

interface ProfileViewProps {
  userState: UserState;
  stories: Story[];
  collections: StoryCollection[];
  onReadStory: (story: Story) => void;
  onOpenAuthModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userState,
  stories,
  collections,
  onReadStory,
  onOpenAuthModal,
}) => {
  const [roleView, setRoleView] = useState<'reader' | 'writer'>('reader');

  const writerStories = stories.filter(
    (s) => !s.isDraft && s.author.toLowerCase() === userState.writerName.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/12 pb-6">
        <div>
          <span className="meta-label !text-[#5e66ff] block mb-1">
            Signed-In Member Profile
          </span>
          <h1 className="font-brand text-3xl md:text-4xl text-white uppercase">
            {roleView === 'reader' ? userState.readerName : userState.writerName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-white/12 bg-[#18181b] rounded-[4px] p-1">
            <button
              type="button"
              onClick={() => setRoleView('reader')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                roleView === 'reader'
                  ? 'bg-[#5e66ff] text-white'
                  : 'text-[#ececec]/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reader ({userState.readerName})</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('writer')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                roleView === 'writer'
                  ? 'bg-[#5e66ff] text-white'
                  : 'text-[#ececec]/60 hover:text-white'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Writer ({userState.writerName})</span>
            </button>
          </div>

          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#5e66ff] text-[#5e66ff] hover:bg-[#5e66ff] hover:text-white rounded-[4px] transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          )}
        </div>
      </div>

      {roleView === 'reader' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 p-6 bg-[#18181b] border border-white/12 rounded-[4px] space-y-6">
            <div>
              <h2 className="font-brand text-2xl text-white uppercase">{userState.readerName}</h2>
              <p className="meta-label mt-1">Avid Short Story Reader</p>
            </div>

            <dl className="divide-y divide-white/12 text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#ececec]/60">Stories read</dt>
                <dd className="font-tabular font-semibold text-white">
                  {40 + userState.readStoryIds.length}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#ececec]/60">Writers followed</dt>
                <dd className="font-tabular font-semibold text-white">
                  {15 + userState.followedWriterIds.length}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#ececec]/60">Collections</dt>
                <dd className="font-tabular font-semibold text-white">{collections.length}</dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-white/12">
              <p className="meta-label mb-2">
                Favorite genres
              </p>
              <p className="text-sm font-medium text-[#5e66ff]">
                {userState.favoriteGenres.join(' · ')}
              </p>
            </div>

            <div className="p-4 bg-[#151517] border border-white/12 rounded-[4px]">
              <span className="meta-label block mb-1">Reading Streak</span>
              <p className="font-brand text-3xl text-[#5e66ff]">
                0{userState.streakDays} DAYS
              </p>
              <p className="text-xs text-[#ececec]/55 mt-1">
                You’ve read {userState.storiesReadThisWeek} stories this week.
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <h3 className="font-brand text-xl text-white uppercase">PUBLIC STORY COLLECTIONS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections
                .filter((c) => c.isPublic)
                .map((col) => (
                  <div
                    key={col.id}
                    className="p-5 border border-white/12 bg-[#18181b] rounded-[4px] space-y-1.5"
                  >
                    <p className="text-base font-semibold text-white">
                      {col.emoji} {col.title}
                    </p>
                    <p className="text-xs text-[#ececec]/55">{col.description}</p>
                    <p className="meta-label !text-[#5e66ff] pt-2">
                      {col.storyIds.length} stories
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="p-6 md:p-8 bg-[#18181b] border border-white/12 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="meta-label !text-[#5e66ff] block">
                Writer Portfolio
              </span>
              <h2 className="font-brand text-3xl text-white uppercase">{userState.writerName}</h2>
              <p className="text-sm text-[#ececec]/70 leading-relaxed">{userState.writerBio}</p>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/12">
              <div>
                <p className="font-brand text-2xl text-white">12</p>
                <p className="meta-label">Stories</p>
              </div>
              <div>
                <p className="font-brand text-2xl text-[#5e66ff]">2.4K</p>
                <p className="meta-label">Reads</p>
              </div>
              <div>
                <p className="font-brand text-2xl text-white">320</p>
                <p className="meta-label">Followers</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-brand text-xl text-white uppercase mb-6">
              PUBLISHED STORIES BY {userState.writerName}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {writerStories.map((story) => (
                <StoryCard key={story.id} story={story} onRead={onReadStory} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
