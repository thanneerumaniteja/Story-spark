export type ReactionType = 'love' | 'unexpected' | 'emotional' | 'thoughtful' | 'creepy' | 'funny';

export interface StoryReactions {
  love: number;
  unexpected: number;
  emotional: number;
  thoughtful: number;
  creepy: number;
  funny: number;
}

export interface CommentItem {
  id: string;
  authorName: string;
  createdAt: string;
  text: string;
  reaction?: ReactionType;
}

export interface StoryDropOff {
  opening: number;
  quarter: number;
  half: number;
  threeQuarters: number;
  ending: number;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  authorId: string;
  authorBio: string;
  isNewWriter: boolean;
  publishedLabel: string;
  publishedDaysAgo: number;
  genre: string;
  subgenre?: string;
  mood: string;
  allMoods: string[];
  readingTime: number; // in minutes
  description: string;
  semanticEssence: string;
  content: string[]; // array of paragraphs
  coverImage?: string;
  coverTone: string; // fallback editorial color theme
  themes: string[];
  tags: string[];
  contentWarnings?: string[];
  reads: number;
  completedReads: number;
  completionRate: number;
  likes: number;
  saves: number;
  dropOff: StoryDropOff;
  reactions: StoryReactions;
  comments: CommentItem[];
  isDraft?: boolean;
  isStoryOfTheMoment?: boolean;
  isDailyStory?: boolean;
  uploadedFileName?: string;
  uploadedFileType?: 'pdf' | 'word' | 'text';
}

export interface StoryCollection {
  id: string;
  title: string;
  emoji: string;
  description: string;
  isPublic: boolean;
  storyIds: string[];
}

export interface WriterProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
  isNewWriter: boolean;
  storiesCount: number;
  readsCount: number;
  followersCount: number;
  favoriteGenres: string[];
}

export interface UserState {
  readerName: string;
  writerName: string;
  writerId: string;
  writerBio: string;
  streakDays: number;
  storiesReadThisWeek: number;
  readStoryIds: string[];
  likedStoryIds: string[];
  savedStoryIds: string[];
  followedWriterIds: string[];
  userReactions: Record<string, ReactionType>;
  bookmarks: Record<string, number>; // storyId -> paragraph index
  preferredReadingTime: number;
  favoriteGenres: string[];
}
