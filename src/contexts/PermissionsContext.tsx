import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionsContextType {
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (requiredPermissions: string[]) => boolean;
  hasAllPermissions: (requiredPermissions: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
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

    fetchPermissions();
  }, [user?.id]);

  const hasPermission = useCallback((permission: string) => {
    // Admin always has all permissions
    if (user?.email === 'admin@voltscout.com') return true;
    return permissions.includes(permission);
  }, [permissions, user?.email]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]) => {
    // Admin always has all permissions
    if (user?.email === 'admin@voltscout.com') return true;
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions, user?.email]);

  const hasAllPermissions = useCallback((requiredPermissions: string[]) => {
    // Admin always has all permissions
    if (user?.email === 'admin@voltscout.com') return true;
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions, user?.email]);

  const value = useMemo(() => ({
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }), [permissions, loading, hasPermission, hasAnyPermission, hasAllPermissions]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider');
  }
  return context;
}
