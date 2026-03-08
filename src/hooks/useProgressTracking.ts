import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    setProgress((prev) => ({ ...prev, lastVisited: sectionId }));
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
// Uses Supabase when user is authenticated, falls back to localStorage
export const useAllModulesProgress = () => {
  const [allProgress, setAllProgress] = useState<AllProgress>(getStoredProgress);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async (userId: string) => {
      try {
        const [{ data: progressData }, { data: startsData }] = await Promise.all([
          supabase
            .from('academy_progress')
            .select('module_id, section_id, completed_at')
            .eq('user_id', userId),
          supabase
            .from('academy_module_starts')
            .select('module_id, started_at, last_visited_at')
            .eq('user_id', userId),
        ]);

        const supabaseProgress: AllProgress = {};

        progressData?.forEach(p => {
          if (!supabaseProgress[p.module_id]) {
            supabaseProgress[p.module_id] = {
              completedSections: [],
              lastVisited: null,
              startedAt: new Date().toISOString(),
              completedAt: null,
            };
          }
          supabaseProgress[p.module_id].completedSections.push(p.section_id);
        });

        startsData?.forEach(s => {
          if (!supabaseProgress[s.module_id]) {
            supabaseProgress[s.module_id] = {
              completedSections: [],
              lastVisited: null,
              startedAt: s.started_at,
              completedAt: null,
            };
          } else {
            supabaseProgress[s.module_id].startedAt = s.started_at;
          }
        });

        if (isMounted) setAllProgress(supabaseProgress);
      } catch (error) {
        console.error('Error fetching progress:', error);
        if (isMounted) setAllProgress(getStoredProgress());
      }
    };

    // Use a single getSession call, reuse AuthContext's session via listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return;
      if (session?.user) {
        fetchProgress(session.user.id);
      } else {
        setAllProgress(getStoredProgress());
      }
      setIsLoading(false);
    });

    // Also handle localStorage changes for non-auth mode
    const handleStorageChange = () => {
      setAllProgress(getStoredProgress());
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
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
      isComplete: percentage >= 100,
      lastVisited: moduleProgress.lastVisited,
    };
  }, [allProgress]);

  return { allProgress, getModuleProgress, isLoading };
};
