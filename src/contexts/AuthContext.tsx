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

  const checkApproval = async (userId: string) => {
    if (approvalCache.current.has(userId)) {
      const cached = approvalCache.current.get(userId)!;
      setIsApproved(cached);
      return;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Approval check timeout')), 5000)
      );
      
      const approvalPromise = supabase
        .rpc('is_voltscout_approved', { user_id: userId });
      
      const { data, error } = await Promise.race([
        approvalPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('Error checking VoltScout approval:', error);
        setIsApproved(false);
        return;
      }
      
      const approved = data || false;
      approvalCache.current.set(userId, approved);
      setIsApproved(approved);
    } catch (error) {
      console.error('Error checking VoltScout approval:', error);
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
          setSession(null);
          setUser(null);
          setIsApproved(false);
          setLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, signing out');
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
            await checkApproval(session.user.id);
          } catch (err) {
            console.error('Error checking approval:', err);
            setIsApproved(false);
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
