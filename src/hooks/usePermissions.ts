import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    fetchPermissions();
  }, [user?.id]);

  const fetchPermissions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', user.id);

      if (error) throw error;

      setPermissions(data?.map(p => p.permission) || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    // Admin always has all permissions
    if (user?.email === 'admin@voltscout.com') return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    // Admin always has all permissions
    if (user?.email === 'admin@voltscout.com') return true;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    // Admin always has all permissions
    if (user?.email === 'admin@voltscout.com') return true;
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}
