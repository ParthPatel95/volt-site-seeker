import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Server-backed admin check. Replaces the email-string compares
// (`user?.email === 'admin@voltscout.com'`) that were scattered across the
// codebase — those gates trusted a client-asserted email and were trivially
// bypassable by anyone who could create an account with that email.
//
// The real authority is `public.has_role(user_id, 'admin')` in Postgres; the
// frontend only mirrors that decision so admin-only UI doesn't render for
// non-admins. Any actual data access is RLS-policed regardless.

interface State {
  isAdmin: boolean;
  loading: boolean;
}

export function useIsAdmin(): State {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ isAdmin: false, loading: true });

  useEffect(() => {
    let cancelled = false;
    if (authLoading) {
      setState({ isAdmin: false, loading: true });
      return;
    }
    if (!user?.id) {
      setState({ isAdmin: false, loading: false });
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        if (cancelled) return;
        if (error) {
          // Fail closed: a transient RPC error must not be interpreted as
          // "is admin". A regular non-admin will see the same outcome.
          setState({ isAdmin: false, loading: false });
          return;
        }
        setState({ isAdmin: data === true, loading: false });
      } catch {
        if (cancelled) return;
        setState({ isAdmin: false, loading: false });
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  return state;
}
