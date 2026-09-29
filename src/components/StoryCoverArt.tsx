import React, { useState } from 'react';
import { Story } from '../types/story';

interface StoryCoverArtProps {
  story: Story;
  className?: string;
  aspectClass?: string;
  compact?: boolean;
}

export const StoryCoverArt: React.FC<StoryCoverArtProps> = ({
  story,
  className = '',
  aspectClass = 'aspect-square',
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const showImage = Boolean(story.coverImage) && !imgError;

  return (
    <div
      className={`relative overflow-hidden select-none rounded-[4px] bg-[#222226] ${aspectClass} ${className}`}
      style={{ backgroundColor: story.coverTone || '#222226' }}
    >
      {showImage ? (
        <>
          <img
            src={story.coverImage}
            alt={`Cover art for ${story.title} by ${story.author}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        </>
      ) : (
        <div className={`w-full h-full ${compact ? 'p-2.5' : 'p-4'} flex flex-col justify-between text-[#ececec] relative border border-white/10`}>
          <div className="flex items-center justify-between text-[9px] font-tabular tracking-widest uppercase text-white/60">
            <span>{story.genre}</span>
            <span>{story.readingTime}M</span>
          </div>

          <div className="my-auto">
            <h4 className={`font-brand ${compact ? 'text-xs' : 'text-base'} leading-tight text-white uppercase line-clamp-3`}>
              {story.title}
            </h4>
          </div>

          <div className="text-[10px] text-[#5e66ff] font-medium truncate">
            {story.author}
          </div>
        </div>
      )}

      {showImage && !compact && (
        <div className="absolute bottom-2 left-2 right-2 text-white pointer-events-none flex items-center justify-between">
          <span className="text-[10px] font-tabular uppercase tracking-wider px-1.5 py-0.5 bg-black/65 backdrop-blur-xs rounded-[2px] text-[#ececec]/90">
            {story.readingTime}m
          </span>
        </div>
      )}
    </div>
  );
};
