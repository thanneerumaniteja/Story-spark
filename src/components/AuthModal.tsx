import React, { useState } from 'react';
import { UserState, WriterProfile } from '../types/story';
import { X, Check, ArrowRight, Sparkles, BookOpen, PenTool } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserState;
  writers: WriterProfile[];
  onClose: () => void;
  onLogin: (
    updatedUser: Partial<UserState>,
    destination?: 'discover' | 'write' | 'following'
  ) => void;
}

const GENRE_CHOICES = [
  'Mystery',
  'Horror',
  'Fantasy',
  'Science Fiction',
  'Romance',
  'Drama',
  'Slice of Life',
  'Comedy',
  'Thriller',
  'Historical',
  'Experimental',
];

const DEMO_ACCOUNTS = [
  {
    name: 'Arjun',
    writerId: 'writer-arjun',
    bio: 'Night-shift archivist and short fiction writer exploring memory, urban solitude, and quiet mysteries.',
    email: 'arjun@storyspark.lit',
    favoriteGenres: ['Mystery', 'Horror', 'Science Fiction'],
    desc: '6-day reading streak · Curates 6 collections · Published “The Last Train” (2,431 reads)',
  },
  {
    name: 'Ananya',
    writerId: 'writer-ananya',
    bio: 'Architect turned fiction writer based in Pondicherry. Interested in dawn hours, quiet reconciliations, and small human rituals.',
    email: 'ananya@storyspark.lit',
    favoriteGenres: ['Slice of Life', 'Drama', 'Romance'],
    desc: 'Reads daily · Published “Three Minutes Before Sunrise” · 93% completion rate',
  },
  {
    name: 'Nadia Vance',
    writerId: 'writer-nadia',
    bio: 'Botanist and fabulist weaving speculative fables about nature and fragile worlds.',
    email: 'nadia@storyspark.lit',
    favoriteGenres: ['Fantasy', 'Science Fiction', 'Mystery'],
    desc: 'Follows emerging voices · 8 published short stories · 1,490 reads',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  writers,
  onClose,
  onLogin,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(currentUser.readerName || 'Arjun');
  const [email, setEmail] = useState('arjun@storyspark.lit');
  const [password, setPassword] = useState('••••••••••••');
  const [bio, setBio] = useState(
    currentUser.writerBio ||
      'Short story reader and writer on StorySpark.'
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    currentUser.favoriteGenres || ['Mystery', 'Science Fiction']
  );
  const [selectedWriterIds, setSelectedWriterIds] = useState<string[]>(
    currentUser.followedWriterIds || ['writer-ananya', 'writer-nadia']
  );

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleWriter = (writerId: string) => {
    setSelectedWriterIds((prev) =>
      prev.includes(writerId)
        ? prev.filter((id) => id !== writerId)
        : [...prev, writerId]
    );
  };

  const handleSubmit = (
    e: React.FormEvent,
    destination?: 'discover' | 'write' | 'following'
  ) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Arjun';
    const slugId = `writer-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    onLogin(
      {
        readerName: cleanName,
        writerName: cleanName,
        writerId: slugId,
        writerBio: bio.trim() || 'StorySpark reader and short fiction writer.',
        favoriteGenres: selectedGenres.length > 0 ? selectedGenres : ['Mystery'],
        followedWriterIds: selectedWriterIds,
      },
      destination
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#18181b] border border-white/12 rounded-[4px] max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 text-[#ececec]">
        <div className="flex items-start justify-between border-b border-white/12 pb-4">
          <div>
            <span className="meta-label !text-[#5e66ff] block mb-1">
              One Unified StorySpark Account · Read & Write Freely
            </span>
            <h2 className="font-brand text-2xl md:text-3xl text-white uppercase">
              {mode === 'signin'
                ? 'SIGN IN TO STORYSPARK'
                : 'CREATE YOUR STORYSPARK ACCOUNT'}
            </h2>
            <p className="text-xs text-[#ececec]/60 mt-1">
              Every account lets you discover stories, follow writers, and write or upload your own stories anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#ececec]/55 hover:text-white cursor-pointer"
            aria-label="Close sign in modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-white/12 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`px-5 py-2.5 border-b-2 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-[#5e66ff] text-[#5e66ff]'
                : 'border-transparent text-[#ececec]/55 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-5 py-2.5 border-b-2 transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'border-[#5e66ff] text-[#5e66ff]'
                : 'border-transparent text-[#ececec]/55 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'signin' ? (
          <div className="space-y-6">
            <div>
              <p className="meta-label mb-2.5">
                Quick-Switch Demo Accounts (Read & Write Enabled)
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent =
                    currentUser.readerName.toLowerCase() ===
                    acc.name.toLowerCase();
                  return (
                    <div
                      key={acc.name}
                      className={`p-4 border rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isCurrent
                          ? 'bg-[#5e66ff]/12 border-[#5e66ff]'
                          : 'bg-[#151517] border-white/12 hover:border-[#5e66ff]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-white">
                            {acc.name}
                          </span>
                          {isCurrent && (
                            <span className="meta-label !text-[#5e66ff]">
                              · Signed In
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#ececec]/55 mt-1">{acc.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onLogin(
                              {
                                readerName: acc.name,
                                writerName: acc.name,
                                writerId: acc.writerId,
                                writerBio: acc.bio,
                                favoriteGenres: acc.favoriteGenres,
                              },
                              'discover'
                            );
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#5e66ff] text-white rounded-[4px] hover:bg-[#4e56f0] cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onLogin(
                              {
                                readerName: acc.name,
                                writerName: acc.name,
                                writerId: acc.writerId,
                                writerBio: acc.bio,
                                favoriteGenres: acc.favoriteGenres,
                              },
                              'write'
                            );
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-semibold border border-white/12 bg-[#1c1c1f] text-[#ececec] hover:border-[#5e66ff] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5 text-[#5e66ff]" />
                          <span>Write</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={(e) => handleSubmit(e)}
              className="space-y-4 pt-4 border-t border-white/12"
            >
              <p className="meta-label">Sign In with Your Account</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#ececec]/60 mb-1">
                    Your Name / Pen Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Arjun or Clara"
                    className="w-full px-3.5 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#ececec]/60 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#ececec]/60 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'write')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border border-white/12 rounded-[4px] bg-[#1c1c1f] hover:border-[#5e66ff] transition-colors cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#5e66ff]" />
                  <span>Sign In & Write</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#ececec]/60 mb-1">
                  Your Name / Pen Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3.5 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#ececec]/60 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#ececec]/60 mb-1">
                Short Bio (Shown on your profile & stories you publish)
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A line about what you love to read and write..."
                className="w-full px-3.5 py-2 text-xs border border-white/12 rounded-[4px] bg-[#151517] text-white focus:outline-none focus:border-[#5e66ff]"
              />
            </div>

            <div>
              <label className="block meta-label mb-2">
                Favorite Genres (For Reading & Writing)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENRE_CHOICES.map((g) => {
                  const active = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1.5 text-xs border rounded-[4px] transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                          : 'bg-[#1c1c1f] text-[#ececec]/70 border-white/12 hover:border-[#5e66ff]'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block meta-label mb-2">
                Follow Writers ({selectedWriterIds.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {writers.map((w) => {
                  const isSel = selectedWriterIds.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWriter(w.id)}
                      className={`p-3 border rounded-[4px] text-left flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-[#5e66ff]/15 border-[#5e66ff]'
                          : 'bg-[#151517] border-white/12 hover:border-[#5e66ff]'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {w.name}{' '}
                          {w.isNewWriter && (
                            <span className="text-[10px] font-tabular uppercase text-[#5e66ff]">
                              · 🌱 Fresh Voice
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#ececec]/55">
                          {w.favoriteGenres.join(' · ')}
                        </p>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-[#5e66ff] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/12 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#ececec]/60 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Account & Start Reading / Writing</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
