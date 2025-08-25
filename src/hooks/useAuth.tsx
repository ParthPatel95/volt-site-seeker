
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const approvalCache = useRef<Map<string, boolean>>(new Map());

  const checkApproval = async (userId: string) => {
    // Check cache first to avoid repeated API calls
    if (approvalCache.current.has(userId)) {
      const cached = approvalCache.current.get(userId)!;
      setIsApproved(cached);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('is_voltscout_approved', { user_id: userId });
      
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

    // Get initial session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session error:', error.message);
          // Clear session if it's expired
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

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        // Handle sign out events explicitly
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsApproved(false);
          setLoading(false);
          return;
        }
        
        // Handle token refresh errors
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
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user: isApproved ? user : null, // Only return user if approved for VoltScout
    session: isApproved ? session : null, // Only return session if approved
    loading,
    signOut,
    isApproved,
  };
}
