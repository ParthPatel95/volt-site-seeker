import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadTimeBaseline } from '../../types/voltbuild-advanced.types';

export function useLeadTimeBaselines(jurisdiction?: string) {
  return useQuery({
    queryKey: ['leadtime-baselines', jurisdiction],
    queryFn: async (): Promise<LeadTimeBaseline[]> => {
      let query = supabase
        .from('leadtime_baselines')
        .select('*')
        .order('milestone', { ascending: true });

      if (jurisdiction) {
        query = query.eq('jurisdiction', jurisdiction);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LeadTimeBaseline[];
    },
  });
}

export function useDistinctJurisdictions() {
  const { data: baselines } = useLeadTimeBaselines();
  
  const jurisdictions = [...new Set(baselines?.map(b => b.jurisdiction) || [])];
  
  const utilitiesByJurisdiction = (baselines || []).reduce((acc, b) => {
    if (!acc[b.jurisdiction]) {
      acc[b.jurisdiction] = new Set<string>();
    }
    if (b.utility) {
      acc[b.jurisdiction].add(b.utility);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  const utilitiesMap = Object.entries(utilitiesByJurisdiction).reduce((acc, [j, set]) => {
    acc[j] = Array.from(set);
    return acc;
  }, {} as Record<string, string[]>);

  return { jurisdictions, utilitiesByJurisdiction: utilitiesMap };
}
