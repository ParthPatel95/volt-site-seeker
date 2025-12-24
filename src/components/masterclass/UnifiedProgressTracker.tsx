import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, Clock, Trophy, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  title: string;
  anchor: string;
}

interface Track {
  id: string;
  number: number;
  title: string;
  gradient: string;
  sections: Section[];
}

interface UnifiedProgressTrackerProps {
  tracks: Track[];
  currentTrack: number;
  className?: string;
}

const STORAGE_KEY = "masterclass-progress";

// Static gradient mappings for tracks
const trackGradients = [
  "from-purple-500 to-violet-600",
  "from-orange-500 to-amber-600",
  "from-blue-500 to-cyan-600",
  "from-green-500 to-emerald-600",
  "from-pink-500 to-rose-600"
];

const trackBgColors = [
  "bg-purple-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-pink-500"
];

export const UnifiedProgressTracker = ({ tracks, currentTrack, className }: UnifiedProgressTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedSections, setCompletedSections] = useState<Record<string, string[]>>({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedSections(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse masterclass progress", e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
  }, [completedSections]);

  const toggleSection = (trackId: string, sectionId: string) => {
    setCompletedSections(prev => {
      const trackSections = prev[trackId] || [];
      if (trackSections.includes(sectionId)) {
        return {
          ...prev,
          [trackId]: trackSections.filter(s => s !== sectionId)
        };
      } else {
        return {
          ...prev,
          [trackId]: [...trackSections, sectionId]
        };
      }
    });
  };

  const getTrackProgress = (trackId: string, totalSections: number) => {
    const completed = completedSections[trackId]?.length || 0;
    return {
      completed,
      total: totalSections,
      percentage: Math.round((completed / totalSections) * 100)
    };
  };

  const getTotalProgress = () => {
    const totalSections = tracks.reduce((acc, track) => acc + track.sections.length, 0);
    const totalCompleted = Object.values(completedSections).reduce((acc, sections) => acc + sections.length, 0);
    return {
      completed: totalCompleted,
      total: totalSections,
      percentage: Math.round((totalCompleted / totalSections) * 100)
    };
  };

  const resetProgress = () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      setCompletedSections({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowMobileMenu(false);
    }
  };

  const totalProgress = getTotalProgress();
  const currentTrackData = tracks[currentTrack - 1];
  const currentProgress = currentTrackData ? getTrackProgress(currentTrackData.id, currentTrackData.sections.length) : null;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block",
          className
        )}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className={cn(
          "bg-white/95 backdrop-blur border border-gray-200 rounded-r-xl shadow-xl transition-all duration-300",
          isExpanded ? "w-80" : "w-16"
        )}>
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-watt-blue rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
          </button>

          {/* Collapsed View - Track Pills */}
          {!isExpanded && (
            <div className="p-3 space-y-2">
              {tracks.map((track, index) => {
                const progress = getTrackProgress(track.id, track.sections.length);
                const isCurrentTrack = track.number === currentTrack;
                const bgColor = trackBgColors[index];
                
                return (
                  <button
                    key={track.id}
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold relative group",
                      isCurrentTrack ? `${bgColor} text-white` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {progress.percentage === 100 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      track.number
                    )}
                    
                    {/* Progress Ring */}
                    {progress.percentage > 0 && progress.percentage < 100 && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${(progress.percentage / 100) * 113} 113`}
                          className="text-watt-blue/30"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
              
              {/* Total Progress */}
              <div className="pt-2 border-t border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-100 to-green-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-watt-navy">{totalProgress.percentage}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-watt-navy">Progress</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-watt-navy/60">{totalProgress.percentage}%</span>
                  <Trophy className={cn("w-4 h-4", totalProgress.percentage === 100 ? "text-yellow-500" : "text-gray-400")} />
                </div>
              </div>
              
              {/* Overall Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-orange-500 to-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress.percentage}%` }}
                />
              </div>

              {/* Track List */}
              <div className="space-y-4">
                {tracks.map((track, index) => {
                  const progress = getTrackProgress(track.id, track.sections.length);
                  const isCurrentTrack = track.number === currentTrack;
                  const bgColor = trackBgColors[index];
                  
                  return (
                    <div key={track.id} className="space-y-2">
                      <div className={cn(
                        "flex items-center gap-2 p-2 rounded-lg transition-colors",
                        isCurrentTrack ? "bg-watt-blue/10" : ""
                      )}>
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                          progress.percentage === 100 
                            ? "bg-green-500" 
                            : bgColor
                        )}>
                          {progress.percentage === 100 ? <CheckCircle2 className="w-4 h-4" /> : track.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-watt-navy truncate">{track.title}</p>
                          <p className="text-xs text-watt-navy/50">{progress.completed}/{progress.total} sections</p>
                        </div>
                      </div>
                      
                      {/* Sections for current track */}
                      {isCurrentTrack && (
                        <div className="pl-8 space-y-1">
                          {track.sections.map((section) => {
                            const isCompleted = completedSections[track.id]?.includes(section.id);
                            return (
                              <button
                                key={section.id}
                                onClick={() => scrollToSection(section.anchor)}
                                className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-gray-100 transition-colors"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection(track.id, section.id);
                                  }}
                                  className="shrink-0"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-400 hover:text-watt-blue" />
                                  )}
                                </button>
                                <span className={cn(
                                  "text-sm truncate",
                                  isCompleted ? "text-watt-navy/50 line-through" : "text-watt-navy"
                                )}>
                                  {section.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reset Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetProgress}
                className="w-full mt-4 text-gray-500 hover:text-red-500"
              >
                Reset Progress
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white/95 backdrop-blur border-t border-gray-200">
          {/* Current Track Progress */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {currentTrackData && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                  trackBgColors[currentTrack - 1]
                )}>
                  {currentTrackData.number}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-watt-navy">{currentTrackData?.title}</p>
                <p className="text-xs text-watt-navy/50">
                  {currentProgress?.completed}/{currentProgress?.total} sections • {currentProgress?.percentage}%
                </p>
              </div>
            </div>
            {showMobileMenu ? <ChevronDown className="w-5 h-5 text-watt-navy" /> : <ChevronUp className="w-5 h-5 text-watt-navy" />}
          </button>

          {/* Expanded Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 overflow-hidden"
              >
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {/* Track Pills */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {tracks.map((track, index) => {
                      const progress = getTrackProgress(track.id, track.sections.length);
                      const bgColor = trackBgColors[index];
                      return (
                        <button
                          key={track.id}
                          className={cn(
                            "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5",
                            track.number === currentTrack 
                              ? `${bgColor} text-white` 
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {progress.percentage === 100 && <CheckCircle2 className="w-3.5 h-3.5" />}
                          Track {track.number}
                        </button>
                      );
                    })}
                  </div>

                  {/* Current Track Sections */}
                  {currentTrackData && (
                    <div className="space-y-1">
                      {currentTrackData.sections.map((section) => {
                        const isCompleted = completedSections[currentTrackData.id]?.includes(section.id);
                        return (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.anchor)}
                            className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-gray-100"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(currentTrackData.id, section.id);
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <span className={cn(
                              "text-sm",
                              isCompleted ? "text-watt-navy/50" : "text-watt-navy"
                            )}>
                              {section.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
