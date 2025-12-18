import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wattbyte_learning_progress';

export interface ModuleProgress {
  completedSections: string[];
  lastVisited: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AllProgress {
  [moduleId: string]: ModuleProgress;
}

const getStoredProgress = (): AllProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveProgress = (progress: AllProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
  }
};

export const useProgressTracking = (moduleId: string, totalSections: number) => {
  const [progress, setProgress] = useState<ModuleProgress>(() => {
    const all = getStoredProgress();
    return all[moduleId] || {
      completedSections: [],
      lastVisited: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
  });

  // Sync with localStorage on mount and when progress changes
  useEffect(() => {
    const all = getStoredProgress();
    all[moduleId] = progress;
    saveProgress(all);
  }, [moduleId, progress]);

  const markSectionComplete = useCallback((sectionId: string) => {
    setProgress((prev) => {
      if (prev.completedSections.includes(sectionId)) return prev;
      
      const newCompleted = [...prev.completedSections, sectionId];
      const isFullyComplete = newCompleted.length >= totalSections;
      
      return {
        ...prev,
        completedSections: newCompleted,
        lastVisited: sectionId,
        completedAt: isFullyComplete ? new Date().toISOString() : null,
      };
    });
  }, [totalSections]);

  const markSectionIncomplete = useCallback((sectionId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedSections: prev.completedSections.filter((id) => id !== sectionId),
      completedAt: null,
    }));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    if (progress.completedSections.includes(sectionId)) {
      markSectionIncomplete(sectionId);
    } else {
      markSectionComplete(sectionId);
    }
  }, [progress.completedSections, markSectionComplete, markSectionIncomplete]);

  const setLastVisited = useCallback((sectionId: string) => {
    setProgress((prev) => ({
      ...prev,
      lastVisited: sectionId,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      completedSections: [],
      lastVisited: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
  }, []);

  const isSectionComplete = useCallback(
    (sectionId: string) => progress.completedSections.includes(sectionId),
    [progress.completedSections]
  );

  const getProgressPercentage = useCallback(() => {
    if (totalSections === 0) return 0;
    return Math.round((progress.completedSections.length / totalSections) * 100);
  }, [progress.completedSections.length, totalSections]);

  return {
    progress,
    completedCount: progress.completedSections.length,
    totalSections,
    percentage: getProgressPercentage(),
    isComplete: progress.completedAt !== null,
    markSectionComplete,
    markSectionIncomplete,
    toggleSection,
    setLastVisited,
    resetProgress,
    isSectionComplete,
  };
};

// Utility hook to get progress for all modules (for dashboard)
export const useAllModulesProgress = () => {
  const [allProgress, setAllProgress] = useState<AllProgress>(getStoredProgress);

  useEffect(() => {
    const handleStorageChange = () => {
      setAllProgress(getStoredProgress());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getModuleProgress = useCallback((moduleId: string, totalSections: number) => {
    const moduleProgress = allProgress[moduleId];
    if (!moduleProgress) return { percentage: 0, isStarted: false, isComplete: false };
    
    const percentage = totalSections > 0 
      ? Math.round((moduleProgress.completedSections.length / totalSections) * 100)
      : 0;
    
    return {
      percentage,
      isStarted: moduleProgress.completedSections.length > 0,
      isComplete: moduleProgress.completedAt !== null,
      lastVisited: moduleProgress.lastVisited,
    };
  }, [allProgress]);

  return { allProgress, getModuleProgress };
};
