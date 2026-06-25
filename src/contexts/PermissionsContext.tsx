import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';

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

  // Server-backed admin check via `public.has_role(user_id, 'admin')` RPC.
  // Replaces three `user?.email === 'admin@voltscout.com'` compares that
  // trusted a client-asserted email (Audit-2026-06-25 P0). The frontend
  // only mirrors the server decision; RLS still polices any actual data
  // access.
  const { isAdmin } = useIsAdmin();

  const hasPermission = useCallback((permission: string) => {
    if (!permission) return true;
    if (isAdmin) return true;
    return permissions.includes(permission);
  }, [permissions, isAdmin]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]) => {
    if (isAdmin) return true;
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions, isAdmin]);

  const hasAllPermissions = useCallback((requiredPermissions: string[]) => {
    if (isAdmin) return true;
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions, isAdmin]);

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
