import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

interface AcademyLearner {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  created_at: string;
  last_activity_at: string | null;
  modules_started: number;
  sections_completed: number;
}

interface ModuleStats {
  module_id: string;
  total_starts: number;
  total_completions: number;
  avg_sections_completed: number;
}

interface AdminStats {
  totalLearners: number;
  activeLearners: number; // active in last 7 days
  totalModuleStarts: number;
  totalSectionsCompleted: number;
}

export const useAcademyAdmin = () => {
  const { isAdmin } = useAcademyAuth();
  const [learners, setLearners] = useState<AcademyLearner[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all learners with their progress counts
      const { data: learnersData, error: learnersError } = await supabase
        .from('academy_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (learnersError) throw learnersError;

      // Get progress counts for each learner
      const learnersWithProgress: AcademyLearner[] = await Promise.all(
        (learnersData || []).map(async (learner) => {
          const { count: modulesStarted } = await supabase
            .from('academy_module_starts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', learner.user_id);

          const { count: sectionsCompleted } = await supabase
            .from('academy_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', learner.user_id);

          return {
            ...learner,
            modules_started: modulesStarted || 0,
            sections_completed: sectionsCompleted || 0
          };
        })
      );

      setLearners(learnersWithProgress);

      // Calculate stats
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeLearners = learnersWithProgress.filter(
        l => l.last_activity_at && new Date(l.last_activity_at) > sevenDaysAgo
      ).length;

      const { count: totalModuleStarts } = await supabase
        .from('academy_module_starts')
        .select('*', { count: 'exact', head: true });

      const { count: totalSectionsCompleted } = await supabase
        .from('academy_progress')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalLearners: learnersWithProgress.length,
        activeLearners,
        totalModuleStarts: totalModuleStarts || 0,
        totalSectionsCompleted: totalSectionsCompleted || 0
      });

      // Get module-level stats
      const { data: moduleStartsData } = await supabase
        .from('academy_module_starts')
        .select('module_id');

      const { data: progressData } = await supabase
        .from('academy_progress')
        .select('module_id, user_id');

      // Aggregate module stats
      const moduleMap: Record<string, { starts: Set<string>; completions: number }> = {};
      
      moduleStartsData?.forEach(ms => {
        if (!moduleMap[ms.module_id]) {
          moduleMap[ms.module_id] = { starts: new Set(), completions: 0 };
        }
        moduleMap[ms.module_id].starts.add(ms.module_id);
      });

      progressData?.forEach(p => {
        if (!moduleMap[p.module_id]) {
          moduleMap[p.module_id] = { starts: new Set(), completions: 0 };
        }
        moduleMap[p.module_id].completions++;
      });

      const moduleStatsArray: ModuleStats[] = Object.entries(moduleMap).map(([module_id, data]) => ({
        module_id,
        total_starts: data.starts.size,
        total_completions: data.completions,
        avg_sections_completed: data.starts.size > 0 ? data.completions / data.starts.size : 0
      }));

      setModuleStats(moduleStatsArray);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const exportLearnerData = useCallback(() => {
    if (!learners.length) return;

    const headers = ['Email', 'Full Name', 'Company', 'Joined', 'Last Activity', 'Modules Started', 'Sections Completed'];
    const rows = learners.map(l => [
      l.email,
      l.full_name || '',
      l.company || '',
      new Date(l.created_at).toLocaleDateString(),
      l.last_activity_at ? new Date(l.last_activity_at).toLocaleDateString() : 'Never',
      l.modules_started.toString(),
      l.sections_completed.toString()
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academy-learners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [learners]);

  return {
    learners,
    stats,
    moduleStats,
    isLoading,
    error,
    refetch: fetchAdminData,
    exportLearnerData
  };
};
