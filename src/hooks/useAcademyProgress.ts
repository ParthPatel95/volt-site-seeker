import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

interface ProgressData {
  completedSections: string[];
  moduleStarted: boolean;
  startedAt: string | null;
  lastVisitedAt: string | null;
}

interface UseAcademyProgressReturn {
  completedSections: string[];
  isLoading: boolean;
  error: Error | null;
  markSectionComplete: (sectionId: string) => Promise<void>;
  markSectionIncomplete: (sectionId: string) => Promise<void>;
  toggleSection: (sectionId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  getCompletionPercentage: (totalSections: number) => number;
  recordModuleStart: () => Promise<void>;
}

export const useAcademyProgress = (moduleId: string): UseAcademyProgressReturn => {
  const { user } = useAcademyAuth();
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch progress from database
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('academy_progress')
        .select('section_id')
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      if (fetchError) throw fetchError;

      setCompletedSections(data?.map(p => p.section_id) || []);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, moduleId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Record when user starts a module
  const recordModuleStart = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('academy_module_starts')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          last_visited_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });
    } catch (err) {
      console.error('Error recording module start:', err);
    }
  }, [user, moduleId]);

  // Mark a section as complete
  const markSectionComplete = useCallback(async (sectionId: string) => {
    if (!user) return;

    try {
      const { error: insertError } = await supabase
        .from('academy_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          section_id: sectionId,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id,section_id'
        });

      if (insertError) throw insertError;

      setCompletedSections(prev => 
        prev.includes(sectionId) ? prev : [...prev, sectionId]
      );
    } catch (err) {
      console.error('Error marking section complete:', err);
      setError(err as Error);
    }
  }, [user, moduleId]);

  // Mark a section as incomplete
  const markSectionIncomplete = useCallback(async (sectionId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('academy_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('section_id', sectionId);

      if (deleteError) throw deleteError;

      setCompletedSections(prev => prev.filter(id => id !== sectionId));
    } catch (err) {
      console.error('Error marking section incomplete:', err);
      setError(err as Error);
    }
  }, [user, moduleId]);

  // Toggle section completion
  const toggleSection = useCallback(async (sectionId: string) => {
    if (completedSections.includes(sectionId)) {
      await markSectionIncomplete(sectionId);
    } else {
      await markSectionComplete(sectionId);
    }
  }, [completedSections, markSectionComplete, markSectionIncomplete]);

  // Reset all progress for this module
  const resetProgress = useCallback(async () => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('academy_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      if (deleteError) throw deleteError;

      setCompletedSections([]);
    } catch (err) {
      console.error('Error resetting progress:', err);
      setError(err as Error);
    }
  }, [user, moduleId]);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback((totalSections: number) => {
    if (totalSections === 0) return 0;
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  return {
    completedSections,
    isLoading,
    error,
    markSectionComplete,
    markSectionIncomplete,
    toggleSection,
    resetProgress,
    getCompletionPercentage,
    recordModuleStart
  };
};

// Hook to get all modules progress for a user (for dashboard)
export const useAllAcademyProgress = () => {
  const { user } = useAcademyAuth();
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: number; lastVisited: string | null }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get all progress
        const { data: progressData, error: progressError } = await supabase
          .from('academy_progress')
          .select('module_id, section_id, completed_at')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        // Get module starts
        const { data: startsData, error: startsError } = await supabase
          .from('academy_module_starts')
          .select('module_id, last_visited_at')
          .eq('user_id', user.id);

        if (startsError) throw startsError;

        // Build progress map
        const progressMap: Record<string, { completed: number; lastVisited: string | null }> = {};

        // Count completions per module
        progressData?.forEach(p => {
          if (!progressMap[p.module_id]) {
            progressMap[p.module_id] = { completed: 0, lastVisited: null };
          }
          progressMap[p.module_id].completed++;
        });

        // Add last visited dates
        startsData?.forEach(s => {
          if (!progressMap[s.module_id]) {
            progressMap[s.module_id] = { completed: 0, lastVisited: null };
          }
          progressMap[s.module_id].lastVisited = s.last_visited_at;
        });

        setModuleProgress(progressMap);
      } catch (err) {
        console.error('Error fetching all progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProgress();
  }, [user]);

  return { moduleProgress, isLoading };
};
