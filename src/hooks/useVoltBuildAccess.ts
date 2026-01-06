import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useVoltBuildAccess() {
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        setIsApproved(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('is_voltbuild_approved', { user_id: user.id });

        if (error) {
          console.error('Error checking VoltBuild access:', error);
          setIsApproved(false);
        } else {
          setIsApproved(data === true);
        }
      } catch (err) {
        console.error('Error checking VoltBuild access:', err);
        setIsApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user?.id]);

  return { isApproved, isLoading };
}
