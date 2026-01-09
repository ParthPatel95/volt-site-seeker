import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AcademyUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  job_title: string | null;
  created_at: string;
  last_activity_at: string | null;
  is_email_verified: boolean;
}

interface AcademyAuthContextType {
  user: User | null;
  session: Session | null;
  academyUser: AcademyUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string, company?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<AcademyUser, 'full_name' | 'company' | 'job_title'>>) => Promise<{ error: Error | null }>;
  refreshAcademyUser: () => Promise<void>;
}

const AcademyAuthContext = createContext<AcademyAuthContextType | undefined>(undefined);

export const AcademyAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [academyUser, setAcademyUser] = useState<AcademyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAcademyUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('academy_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching academy user:', error);
        return null;
      }
      return data as AcademyUser | null;
    } catch (err) {
      console.error('Error in fetchAcademyUser:', err);
      return null;
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('academy_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) return false;
      return data?.role === 'admin';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer Supabase calls with setTimeout to prevent deadlock
        setTimeout(async () => {
          const academyData = await fetchAcademyUser(session.user.id);
          setAcademyUser(academyData);
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
          setIsLoading(false);
        }, 0);
      } else {
        setAcademyUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchAcademyUser(session.user.id).then(setAcademyUser);
        checkAdminStatus(session.user.id).then(setIsAdmin);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, company?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/academy`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        return { error };
      }

      // Create academy user profile
      if (data.user) {
        // Try direct insert first (in case session is already active)
        const { error: profileError } = await supabase
          .from('academy_users')
          .insert({
            user_id: data.user.id,
            email: email,
            full_name: fullName || null,
            company: company || null,
            is_email_verified: false
          });

        // If RLS blocks it, use edge function fallback with service role
        if (profileError) {
          console.log('Direct insert blocked by RLS, using edge function fallback');
          const { error: edgeFnError } = await supabase.functions.invoke('create-academy-profile', {
            body: { 
              user_id: data.user.id, 
              email, 
              full_name: fullName, 
              company 
            }
          });

          if (edgeFnError) {
            console.error('Edge function error creating profile:', edgeFnError);
            return { error: new Error('Failed to create profile. Please try again.') };
          }
        }

      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      // Check if academy profile exists, create if not (for existing Supabase users)
      if (data.user) {
        const existingProfile = await fetchAcademyUser(data.user.id);
        
        if (!existingProfile) {
          console.log('No academy profile found, creating one...');
          const { error: profileError } = await supabase.functions.invoke('create-academy-profile', {
            body: {
              user_id: data.user.id,
              email: email,
              full_name: data.user.user_metadata?.full_name || null,
              company: null
            }
          });

          if (profileError) {
            console.error('Failed to create academy profile:', profileError);
          } else {
            const newProfile = await fetchAcademyUser(data.user.id);
            setAcademyUser(newProfile);
          }
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAcademyUser(null);
    setIsAdmin(false);
  };

  const updateProfile = async (data: Partial<Pick<AcademyUser, 'full_name' | 'company' | 'job_title'>>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('academy_users')
        .update(data)
        .eq('user_id', user.id);

      if (!error) {
        setAcademyUser(prev => prev ? { ...prev, ...data } : null);
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };


  const refreshAcademyUser = async () => {
    if (user) {
      const academyData = await fetchAcademyUser(user.id);
      setAcademyUser(academyData);
    }
  };

  return (
    <AcademyAuthContext.Provider
      value={{
        user,
        session,
        academyUser,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshAcademyUser
      }}
    >
      {children}
    </AcademyAuthContext.Provider>
  );
};

export const useAcademyAuth = () => {
  const context = useContext(AcademyAuthContext);
  if (context === undefined) {
    throw new Error('useAcademyAuth must be used within an AcademyAuthProvider');
  }
  return context;
};
