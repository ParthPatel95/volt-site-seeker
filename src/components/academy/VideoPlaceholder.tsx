import React from 'react';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COURSE_THUMBNAILS } from '@/assets/thumbnails';

interface VideoPlaceholderProps {
  moduleId: string;
  title: string;
  duration?: string;
  className?: string;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  moduleId,
  title,
  duration = '5:00',
  className,
}) => {
  const thumbnail = COURSE_THUMBNAILS[moduleId];

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-muted aspect-video group cursor-pointer border border-border',
        className
      )}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-200">
          <Play className="w-7 h-7 text-white ml-1" fill="white" />
        </div>
      </div>

      {/* Info bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium line-clamp-1">{title}</p>
        <div className="flex items-center gap-1 mt-1 text-white/70 text-xs">
          <Clock className="w-3 h-3" />
          {duration}
          <span className="ml-2 px-1.5 py-0.5 rounded bg-white/20 text-white/80 text-[10px] font-medium">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlaceholder;
