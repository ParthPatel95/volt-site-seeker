import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  canDownload: boolean;
  className?: string;
  onError?: (error: Error) => void;
  fileSize?: number; // File size in bytes for smart preload
  fileName?: string; // File name for download fallback
}

export function VideoPlayer({ src, canDownload, className, onError, fileSize, fileName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [duration, setDuration] = useState<number | null>(null);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [metadata, setMetadata] = useState<{ width?: number; height?: number } | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartTimeRef = useRef<number>(0);

  // Smart preload strategy based on file size
  const getPreloadStrategy = () => {
    if (!fileSize) return 'metadata';
    const sizeMB = fileSize / (1024 * 1024);
    if (sizeMB < 50) return 'auto'; // Small videos: load ahead
    if (sizeMB < 200) return 'metadata'; // Medium videos: just metadata
    return 'none'; // Large videos: minimal preload
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      loadStartTimeRef.current = Date.now();
      console.log('[VideoPlayer] Loading started', { fileSize, strategy: getPreloadStrategy() });
      setIsLoading(true);
      setHasError(false);
      setLoadTimeout(false);
      
      // Set 30-second timeout for loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        const loadTime = Date.now() - loadStartTimeRef.current;
        console.error('[VideoPlayer] Loading timeout after', loadTime, 'ms');
        setLoadTimeout(true);
        setIsLoading(false);
        setErrorMessage('Video is taking too long to load. This may be due to a slow connection or large file size.');
      }, 30000); // 30-second timeout
    };

    const handleCanPlay = () => {
      const loadTime = Date.now() - loadStartTimeRef.current;
      console.log('[VideoPlayer] Can play after', loadTime, 'ms');
      setIsLoading(false);
      setLoadTimeout(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };

    const handleLoadedData = () => {
      const loadTime = Date.now() - loadStartTimeRef.current;
      console.log('[VideoPlayer] Data loaded after', loadTime, 'ms');
      setIsLoading(false);
      setLoadTimeout(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };

    const handleLoadedMetadata = () => {
      console.log('[VideoPlayer] Metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        fileSize: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : 'unknown'
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
      const videoError = video.error;
      let message = 'Failed to load video.';
      
      if (videoError) {
        switch (videoError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = 'Video loading was aborted. Please try again.';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            message = 'Network error while loading video. Check your connection.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            message = 'Video format is not supported or file is corrupted.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = 'Video source not found or format not supported.';
            break;
          default:
            message = videoError.message || message;
        }
      }
      
      setErrorMessage(message);
      setHasError(true);
      setIsLoading(false);
      setIsBuffering(false);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      const error = new Error(message);
      if (onError) onError(error);
    };

    const handleVolumeChange = () => {
      setIsMuted(video.muted);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onError, fileSize]);

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

  const getFileSizeDisplay = () => {
    if (fileSize) {
      return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    }
    return null;
  };

  const handleRetry = () => {
    console.log('[VideoPlayer] Retry attempt', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setLoadTimeout(false);
    setIsLoading(true);
    setErrorMessage('');
    
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleDownloadFallback = () => {
    if (!canDownload) return;
    
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName || 'video';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        preload={getPreloadStrategy()}
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

      {/* Loading Timeout State */}
      {loadTimeout && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <div className="text-center p-6 max-w-md">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-3 mx-auto" />
            <p className="text-white text-base font-medium mb-2">Still Loading...</p>
            <p className="text-white/70 text-sm mb-4">
              The video is taking longer than expected. This might be due to a slow connection or large file size.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} size="sm" variant="secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              {canDownload && (
                <Button onClick={handleDownloadFallback} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <div className="text-center p-6 max-w-md">
            <p className="text-white text-base font-medium mb-2">Failed to load video</p>
            <p className="text-white/70 text-sm mb-4">
              {errorMessage || 'The video could not be loaded. This may be due to network issues or an unsupported format.'}
            </p>
            <p className="text-white/50 text-xs mb-4">
              Attempt {retryCount + 1}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} size="sm" variant="secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              {canDownload && (
                <Button onClick={handleDownloadFallback} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download and Play Locally
                </Button>
              )}
            </div>
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
              {getFileSizeDisplay() && (
                <span className="text-white/70">{getFileSizeDisplay()}</span>
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
