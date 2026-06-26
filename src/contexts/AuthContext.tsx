import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const approvalCache = useRef<Map<string, boolean>>(new Map());

  // One RPC attempt, raced against a clearable timeout.
  const runApprovalRpc = async (userId: string, timeoutMs: number): Promise<boolean> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Approval check timeout')), timeoutMs);
      });
      const approvalPromise = supabase.rpc('is_voltscout_approved', { user_id: userId });
      const result = (await Promise.race([approvalPromise, timeoutPromise])) as {
        data: unknown;
        error: { message: string } | null;
      };
      if (result?.error) throw new Error(result.error.message);
      return Boolean(result?.data);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };

  // Resolve VoltScout approval for a user.
  //
  // Security property (preserved from the Audit-2026-06-25 P0 fix): we NEVER
  // grant access we have not positively confirmed. A user who has never been
  // confirmed approved defaults to denied on any error — a backend outage can
  // never grant access.
  //
  // Availability property (the regression this fixes): once a user HAS been
  // confirmed approved this session, a transient RPC error/timeout — e.g. the
  // re-check Supabase triggers on tab refocus (SIGNED_IN) or token refresh —
  // must NOT flip them to denied and bounce them to the login screen. We keep
  // the last-known-good result and only an explicit `false` from the RPC
  // revokes access.
  const checkApproval = async (userId: string, opts: { force?: boolean } = {}) => {
    const prior = approvalCache.current.get(userId); // last confirmed value, if any
    if (!opts.force && prior !== undefined) {
      setIsApproved(prior);
      return;
    }

    // Retry transient failures a couple of times before giving up.
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const approved = await runApprovalRpc(userId, 5000);
        approvalCache.current.set(userId, approved);
        setIsApproved(approved);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    console.warn(
      'Approval check failed:',
      lastError instanceof Error ? lastError.message : 'unknown',
    );
    if (prior === true) {
      // Keep an approved user approved through a transient outage.
      setIsApproved(true);
    } else {
      // Never confirmed → fail closed, but do NOT cache the denial so a later
      // retry can still succeed.
      setIsApproved(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Prevent infinite loading on mobile/slow networks
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth loading timeout - forcing load complete');
        setLoading(false);
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session error:', error.message);
          if (error.message.includes('session_expired') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            if (isMounted) {
              setSession(null);
              setUser(null);
              setIsApproved(false);
              setLoading(false);
            }
            return;
          }
        }
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkApproval(session.user.id);
        } else {
          setIsApproved(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setIsApproved(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          approvalCache.current.clear();
          setSession(null);
          setUser(null);
          setIsApproved(false);
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, signing out');
          approvalCache.current.clear();
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setIsApproved(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            // Supabase fires SIGNED_IN on tab refocus too — do NOT invalidate
            // the cached approval there (a re-check that transiently fails
            // would otherwise bounce an approved user to the login screen).
            // Only USER_UPDATED forces a fresh check (an admin may have changed
            // approval); checkApproval keeps last-known-good on transient error.
            await checkApproval(session.user.id, { force: event === 'USER_UPDATED' });
          } catch (err) {
            console.error('Error checking approval:', err);
            // Keep whatever we already had rather than forcing a logout.
          }
        } else {
          setIsApproved(false);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user: isApproved ? user : null,
    session: isApproved ? session : null,
    loading,
    isApproved,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Non-throwing variant for components that may render OUTSIDE the AuthProvider
// — e.g. the public secure-share viewers. Returns a logged-out, not-loading
// default so a public viewer never blocks on (or crashes from) auth.
const LOGGED_OUT: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  isApproved: false,
  signOut: async () => {},
};

export function useOptionalAuth(): AuthContextType {
  return useContext(AuthContext) ?? LOGGED_OUT;
}
