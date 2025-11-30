import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  canDownload: boolean;
  className?: string;
  onError?: (error: Error) => void;
}

export function VideoPlayer({ src, canDownload, className, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [metadata, setMetadata] = useState<{ width?: number; height?: number } | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      console.log('[VideoPlayer] Loading started');
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      console.log('[VideoPlayer] Can play');
      setIsLoading(false);
    };

    const handleLoadedMetadata = () => {
      console.log('[VideoPlayer] Metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      setDuration(video.duration);
      setMetadata({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    const handleWaiting = () => {
      console.log('[VideoPlayer] Buffering...');
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      console.log('[VideoPlayer] Playing');
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const progress = video.duration > 0 ? (bufferedEnd / video.duration) * 100 : 0;
        setBufferProgress(progress);
      }
    };

    const handleError = (e: ErrorEvent | Event) => {
      console.error('[VideoPlayer] Error:', e);
      setHasError(true);
      setIsLoading(false);
      setIsBuffering(false);
      
      const error = new Error('Failed to load video');
      if (onError) onError(error);
    };

    const handleVolumeChange = () => {
      setIsMuted(video.muted);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onError]);

  // Auto-hide controls during playback
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('[VideoPlayer] Fullscreen error:', error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds || !isFinite(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileSize = () => {
    // Estimate from buffer if available
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedBytes = videoRef.current.buffered.end(0);
      if (bufferedBytes > 1024 * 1024) {
        return `${(bufferedBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    }
    return null;
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center bg-black/90 rounded-lg overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        controlsList={!canDownload ? 'nodownload' : undefined}
        onContextMenu={(e) => !canDownload && e.preventDefault()}
        className="max-w-full max-h-full w-full"
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
          <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
          <p className="text-white text-sm font-medium">Loading video...</p>
          <p className="text-white/60 text-xs mt-1">Please wait</p>
        </div>
      )}

      {/* Buffering Overlay */}
      {isBuffering && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-20 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
          <p className="text-white text-sm font-medium">Buffering...</p>
          {bufferProgress > 0 && bufferProgress < 100 && (
            <div className="w-48 h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${bufferProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <div className="text-center p-6 max-w-md">
            <p className="text-white text-base font-medium mb-2">Failed to load video</p>
            <p className="text-white/70 text-sm mb-4">
              The video could not be loaded. This may be due to network issues or an unsupported format.
            </p>
            <Button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              size="sm"
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Video Metadata Overlay (top) */}
      {!isLoading && !hasError && duration && (showControls || !isPlaying) && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10 transition-opacity duration-300">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium">Duration: {formatDuration(duration)}</span>
              {metadata?.width && metadata?.height && (
                <span className="text-white/70">{metadata.width}×{metadata.height}</span>
              )}
              {getFileSize() && (
                <span className="text-white/70">{getFileSize()}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay (bottom) */}
      {!isLoading && !hasError && (showControls || !isPlaying) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 z-10 transition-opacity duration-300">
          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={togglePlay}
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button
                onClick={toggleFullscreen}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Buffer Progress Indicator (subtle, at top of video when buffering) */}
      {!isLoading && isBuffering && bufferProgress > 0 && bufferProgress < 100 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${bufferProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
