import React from 'react';
import { Story } from '../types/story';
import { StoryCoverArt } from './StoryCoverArt';
import { Bookmark } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onRead: (story: Story) => void;
  onToggleSave?: (storyId: string, e: React.MouseEvent) => void;
  isSaved?: boolean;
  matchReason?: string;
  onSelectAuthor?: (authorId: string, e: React.MouseEvent) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onRead,
  onToggleSave,
  isSaved = false,
  matchReason,
  onSelectAuthor,
}) => {
  return (
    <article
      onClick={() => onRead(story)}
      className="group cursor-pointer bg-[#18181b] border border-white/12 hover:border-[#5e66ff] hover:-translate-y-0.5 transition-all duration-200 p-6 relative flex flex-col sm:flex-row gap-6"
    >
      {/* Square 120x120 Thumbnail matching Variation 5 */}
      <div className="w-full sm:w-[120px] h-[160px] sm:h-[120px] shrink-0 relative">
        <StoryCoverArt
          story={story}
          aspectClass="w-full h-full"
          className="w-full h-full rounded-[4px]"
        />
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(story.id, e);
            }}
            aria-label={isSaved ? 'Remove from saved stories' : 'Save story'}
            className={`absolute top-2 right-2 w-7 h-7 rounded-[4px] flex items-center justify-center transition-colors ${
              isSaved
                ? 'bg-[#5e66ff] text-white'
                : 'bg-black/70 text-[#ececec]/80 hover:bg-[#5e66ff] hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-[20px] font-semibold text-white group-hover:text-[#5e66ff] transition-colors leading-snug truncate">
              {story.title}
            </h3>
            <span className="meta-label shrink-0">
              {story.readingTime}M · {story.genre}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13.5px] mb-3">
            <button
              type="button"
              onClick={(e) => {
                if (onSelectAuthor) {
                  e.stopPropagation();
                  onSelectAuthor(story.authorId, e);
                }
              }}
              className="text-[#5e66ff] hover:underline font-medium"
            >
              by {story.author}
            </button>
            <span className="text-white/25">·</span>
            <span className="meta-label">{story.mood}</span>
            {story.isNewWriter && (
              <>
                <span className="text-white/25">·</span>
                <span className="meta-label !text-[#5e66ff]">🌱 Fresh Voice</span>
              </>
            )}
          </div>

          <p className="text-[14.5px] leading-relaxed text-[#ececec]/55 line-clamp-2 mb-4">
            “{story.description}”
          </p>

          {matchReason && (
            <div className="border-l-2 border-[#5e66ff] pl-3 py-1.5 mb-4 text-xs text-[#ececec]/80 bg-[#5e66ff]/10 rounded-r-[4px]">
              <span className="font-semibold text-[#5e66ff]">Match Reason: </span>
              {matchReason}
            </div>
          )}
        </div>

        <div className="pt-3.5 border-t border-dotted border-white/12 flex items-center justify-between gap-4">
          <span className="meta-label">
            {story.completionRate}% Completion · {story.likes} Likes
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRead(story);
            }}
            className="bg-[#5e66ff] hover:bg-[#4e56f0] text-white text-xs font-semibold px-4 py-2 rounded-[4px] transition-colors cursor-pointer shrink-0"
          >
            Read Now
          </button>
        </div>
      </div>
    </article>
  );
};
