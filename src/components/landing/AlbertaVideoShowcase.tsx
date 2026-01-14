import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Video, AlertCircle, RotateCcw } from 'lucide-react';
import { useVideoSignedUrl } from '@/hooks/useVideoSignedUrl';
const facilityNight = '/images/alberta-facility-night.png';

const VIDEO_STORAGE_PATH = '659d2108-b0be-45b4-b4ce-c0f1cf9bd428/2f56a4b2-2ae4-4933-9741-83f1a0631538.mp4';

export const AlbertaVideoShowcase: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { signedUrl, isLoading, error, fetchUrl } = useVideoSignedUrl({
    storagePath: VIDEO_STORAGE_PATH,
  });

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && hasStarted) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls, hasStarted]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handlePlayClick = async () => {
    if (!hasStarted) {
      setHasStarted(true);
      setVideoError(null);
      
      // Fetch signed URL on first play
      const url = await fetchUrl();
      if (!url) return;
    }
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Play error:', err);
          setVideoError('Failed to play video');
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
      
      // Update buffered
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = () => {
    setVideoError('Unable to load video. Please try again.');
    setIsPlaying(false);
  };

  const handleRetry = async () => {
    setVideoError(null);
    setHasStarted(false);
    await handlePlayClick();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-2xl overflow-hidden shadow-institutional-lg group cursor-pointer bg-watt-navy"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handlePlayClick}
    >
      {/* Thumbnail State */}
      {!hasStarted && (
        <div className="absolute inset-0 z-10">
          <img
            src={facilityNight}
            alt="Alberta 45MW Site"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" style={{ animationDuration: '2s' }} />
              <button
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 md:w-10 md:h-10 text-foreground ml-1" fill="currentColor" />
              </button>
            </div>
          </div>
          
          {/* Video Label */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Video className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">Virtual Tour</span>
            </div>
            <span className="px-2 py-1 rounded-full bg-watt-trust/80 text-white text-xs font-medium">
              45MW Alberta Site
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && hasStarted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-watt-navy/90">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-watt-trust animate-spin" />
            <span className="text-white/80 text-sm">Loading video...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {(error || videoError) && hasStarted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-watt-navy/90">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-white/80 text-sm max-w-xs">{error || videoError}</p>
            <button
              onClick={(e) => { e.stopPropagation(); handleRetry(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust text-white text-sm font-medium hover:bg-watt-trust/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Video Element */}
      {hasStarted && signedUrl && !error && !videoError && (
        <video
          ref={videoRef}
          src={signedUrl}
          className="w-full h-full object-cover"
          playsInline
          muted={isMuted}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
          onEnded={() => { setIsPlaying(false); setHasStarted(false); }}
        />
      )}

      {/* Video Controls Overlay */}
      {hasStarted && signedUrl && !error && !videoError && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Gradient overlay for controls visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Center Play/Pause */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`p-4 rounded-full bg-black/40 backdrop-blur-sm transition-transform duration-200 ${showControls ? 'scale-100' : 'scale-90'}`}>
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-0.5" fill="currentColor" />
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {/* Progress Bar */}
            <div
              className="relative h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              {/* Buffered */}
              <div
                className="absolute h-full bg-white/40 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div
                className="absolute h-full bg-watt-trust rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* Hover indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Time */}
                <span className="text-white text-sm font-medium">
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mute/Unmute */}
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};