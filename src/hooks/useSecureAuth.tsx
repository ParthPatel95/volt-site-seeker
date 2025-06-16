
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Failed to get session');
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError('Authentication initialization failed');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with proper error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setError(null);

          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError('Authentication state update failed');
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile load error:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await createUserProfile(userId);
        }
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Profile loading failed:', err);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (authUser.user) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email || '',
            role: 'analyst'
          });

        if (error) {
          console.error('Profile creation error:', error);
        } else {
          await loadUserProfile(userId);
        }
      }
    } catch (err) {
      console.error('Profile creation failed:', err);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError('Failed to sign out');
        return false;
      }

      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      return true;
    } catch (err) {
      console.error('Sign out failed:', err);
      setError('Sign out failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    error,
    signOut,
    isAuthenticated: !!user && !!session
  };
}
