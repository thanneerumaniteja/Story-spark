import React, { useState } from 'react';
import { UserState, WriterProfile } from '../types/story';
import { X, Check, ArrowRight, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserState;
  writers: WriterProfile[];
  onClose: () => void;
  onLogin: (updatedUser: Partial<UserState>, redirectToWriters?: boolean) => void;
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
    label: 'Alex (Reader)',
    role: 'Reader',
    readerName: 'Alex',
    writerName: 'Arjun',
    writerId: 'writer-arjun',
    email: 'alex@storyspark.lit',
    favoriteGenres: ['Mystery', 'Horror', 'Science Fiction'],
    desc: 'Follows 3 writers · 6-day reading streak · Curates 6 collections',
  },
  {
    label: 'Arjun (Established Writer)',
    role: 'Writer & Reader',
    readerName: 'Arjun',
    writerName: 'Arjun',
    writerId: 'writer-arjun',
    email: 'arjun@storyspark.lit',
    favoriteGenres: ['Mystery', 'Psychological', 'Comedy'],
    desc: 'Author of “The Last Train” · 2,431 reads · 320 followers',
  },
  {
    label: 'Ananya (Fresh Voice Writer)',
    role: 'Emerging Writer',
    readerName: 'Ananya',
    writerName: 'Ananya',
    writerId: 'writer-ananya',
    email: 'ananya@storyspark.lit',
    favoriteGenres: ['Slice of Life', 'Drama', 'Romance'],
    desc: 'Author of “Three Minutes Before Sunrise” · 93% completion rate',
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
  const [name, setName] = useState(currentUser.readerName || '');
  const [email, setEmail] = useState('alex@storyspark.lit');
  const [password, setPassword] = useState('••••••••••••');
  const [accountRole, setAccountRole] = useState<'reader' | 'writer' | 'both'>('both');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    currentUser.favoriteGenres || ['Mystery', 'Science Fiction']
  );
  const [selectedWriterIds, setSelectedWriterIds] = useState<string[]>(
    currentUser.followedWriterIds || ['writer-arjun', 'writer-ananya']
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

  const handleSubmit = (e: React.FormEvent, goToWriters = false) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Alex';
    onLogin(
      {
        readerName: cleanName,
        writerName: accountRole === 'reader' ? currentUser.writerName : cleanName,
        favoriteGenres: selectedGenres.length > 0 ? selectedGenres : ['Mystery'],
        followedWriterIds: selectedWriterIds,
      },
      goToWriters
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#18181b] border border-white/12 rounded-[4px] max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 text-[#ececec]">
        <div className="flex items-start justify-between border-b border-white/12 pb-4">
          <div>
            <span className="meta-label !text-[#5e66ff] block mb-1">
              StorySpark Literary Circle
            </span>
            <h2 className="font-brand text-2xl md:text-3xl text-white uppercase">
              {mode === 'signin'
                ? 'SIGN IN & DISCOVER WRITERS'
                : 'CREATE YOUR ACCOUNT'}
            </h2>
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
            Sign In / Quick Switch
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
            Join & Personalize Writers
          </button>
        </div>

        {mode === 'signin' ? (
          <div className="space-y-6">
            <div>
              <p className="meta-label mb-2.5">
                Instant One-Click Literary Profiles
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent =
                    currentUser.readerName.toLowerCase() ===
                    acc.readerName.toLowerCase();
                  return (
                    <button
                      key={acc.label}
                      type="button"
                      onClick={() => {
                        onLogin(
                          {
                            readerName: acc.readerName,
                            writerName: acc.writerName,
                            writerId: acc.writerId,
                            favoriteGenres: acc.favoriteGenres,
                          },
                          true
                        );
                        onClose();
                      }}
                      className={`p-4 border rounded-[4px] text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#5e66ff]/12 border-[#5e66ff]'
                          : 'bg-[#151517] border-white/12 hover:border-[#5e66ff]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-white">
                            {acc.label}
                          </span>
                          <span className="meta-label !text-[#5e66ff]">· {acc.role}</span>
                        </div>
                        <p className="text-xs text-[#ececec]/55 mt-1">{acc.desc}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#5e66ff] whitespace-nowrap ml-3">
                        {isCurrent ? 'Active · Find Writers →' : 'Sign In →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4 pt-4 border-t border-white/12">
              <p className="meta-label">
                Or Sign In with Your Credentials
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#ececec]/60 mb-1">
                    Your Display Name / Pen Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alex or Clara"
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
                  onClick={(e) => handleSubmit(e, false)}
                  className="px-4 py-2.5 text-xs font-semibold border border-white/12 rounded-[4px] bg-[#1c1c1f] hover:border-[#5e66ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#5e66ff] text-white hover:bg-[#4e56f0] rounded-[4px] transition-colors cursor-pointer"
                >
                  <span>Sign In & Find Writers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-5">
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
                  How will you use StorySpark?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'reader', label: 'Reader' },
                      { id: 'writer', label: 'Writer' },
                      { id: 'both', label: 'Both' },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAccountRole(r.id)}
                      className={`py-2 text-xs font-semibold border rounded-[4px] transition-colors cursor-pointer ${
                        accountRole === r.id
                          ? 'bg-[#5e66ff] text-white border-[#5e66ff]'
                          : 'bg-[#151517] border-white/12 text-[#ececec]/70'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block meta-label mb-2">
                Select Genres to Match You with Writers
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
                Choose Writers to Follow ({selectedWriterIds.length} selected)
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
                <span>Complete Setup & Explore Writers</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
