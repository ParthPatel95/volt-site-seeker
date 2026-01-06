import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: async (): Promise<PlatformUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
