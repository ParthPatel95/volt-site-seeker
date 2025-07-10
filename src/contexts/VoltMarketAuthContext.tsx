import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface VoltMarketProfile {
  id: string;
  user_id: string;
  role: 'buyer' | 'seller' | 'admin';
  seller_type?: 'site_owner' | 'broker' | 'realtor' | 'equipment_vendor';
  company_name?: string;
  phone_number?: string;
  is_id_verified: boolean;
  is_email_verified: boolean;
  profile_image_url?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

interface VoltMarketAuthContextType {
  user: User | null;
  session: Session | null;
  profile: VoltMarketProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<VoltMarketProfile>) => Promise<any>;
  createProfile: (userId: string, userData: any) => Promise<any>;
  resendEmailVerification: () => Promise<any>;
}

const VoltMarketAuthContext = createContext<VoltMarketAuthContextType | undefined>(undefined);

export const VoltMarketAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<VoltMarketProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profileData, error } = await supabase
        .from('voltmarket_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.log('Profile fetch error:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (err) {
      console.log('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const createProfile = async (userId: string, userData: {
    role: 'buyer' | 'seller';
    seller_type?: 'site_owner' | 'broker' | 'realtor' | 'equipment_vendor';
    company_name?: string;
    phone_number?: string;
  }) => {
    try {
      // For signup, we need to ensure the profile is created with proper auth context
      // First, let's try with the service role for initial profile creation
      const { data, error } = await supabase
        .from('voltmarket_profiles')
        .insert({
          user_id: userId,
          role: userData.role,
          seller_type: userData.seller_type,
          company_name: userData.company_name,
          phone_number: userData.phone_number,
          is_id_verified: false,
          is_email_verified: false,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Profile creation error:', error);
        // If RLS error, try creating via edge function
        if (error.message.includes('row-level security')) {
          try {
            const response = await fetch(`https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/create-voltmarket-profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE`,
              },
              body: JSON.stringify({
                user_id: userId,
                role: userData.role,
                seller_type: userData.seller_type,
                company_name: userData.company_name,
                phone_number: userData.phone_number,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              return { error: new Error(errorData.error || 'Failed to create profile via edge function') };
            }

            const profileData = await response.json();
            return { data: profileData, error: null };
          } catch (edgeFunctionError) {
            console.error('Edge function error:', edgeFunctionError);
            return { error: edgeFunctionError as Error };
          }
        }
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected profile creation error:', err);
      return { error: err as Error };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential recursive calls
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(session.user.id);
              if (mounted) {
                setProfile(profileData);
                setLoading(false);
              }
            }
          }, 0);
        } else {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session only once
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        console.log('Initial session check:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run only once

  const signUp = async (email: string, password: string, userData: {
    role: 'buyer' | 'seller';
    seller_type?: 'site_owner' | 'broker' | 'realtor' | 'equipment_vendor';
    company_name?: string;
    phone_number?: string;
  }) => {
    try {
      console.log('Starting signup process...');
      
      // Sign up user with Supabase auth (disable email confirmation for now)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/voltmarket/dashboard`,
          data: {
            role: userData.role,
            company_name: userData.company_name
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('User created:', data.user?.id);

      if (data.user) {
        // Create profile
        console.log('Creating profile for user:', data.user.id);
        
        const profileResult = await createProfile(data.user.id, userData);
        
        if (profileResult.error) {
          return { error: profileResult.error };
        }
        
        console.log('Profile created successfully');
        setProfile(profileResult.data);

        // Send custom verification email
        try {
          const response = await fetch(`https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/send-verification-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE`,
            },
            body: JSON.stringify({
              email: data.user.email,
              user_id: data.user.id,
              is_resend: false
            }),
          });

          if (!response.ok) {
            console.error('Failed to send verification email');
          } else {
            console.log('Verification email sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Don't fail signup if email sending fails
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    console.log('Attempting to sign out...');
    try {
      // Clear local state FIRST to ensure immediate UI update
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Even if there's an error, we've cleared local state
      } else {
        console.log('Sign out successful');
      }
      
      return { error };
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      return { error: err as Error };
    }
  };

  const updateProfile = async (updates: Partial<VoltMarketProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('voltmarket_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Profile update error:', error);
        return { data: null, error };
      }

      if (data) {
        console.log('Profile updated successfully:', data);
        setProfile(data);
        
        // Force a page refresh if role changed to ensure dashboard updates
        if (updates.role && updates.role !== profile?.role) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected profile update error:', err);
      return { data: null, error: err as Error };
    }
  };

  const resendEmailVerification = async () => {
    if (!user?.email || !user?.id) return { error: new Error('No user found') };

    try {
      const response = await fetch(`https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE`,
        },
        body: JSON.stringify({
          email: user.email,
          user_id: user.id,
          is_resend: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: new Error(errorData.error || 'Failed to send verification email') };
      }

      return { error: null };
    } catch (err) {
      console.error('Error resending verification email:', err);
      return { error: err as Error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    createProfile,
    resendEmailVerification,
  };

  return (
    <VoltMarketAuthContext.Provider value={value}>
      {children}
    </VoltMarketAuthContext.Provider>
  );
};

export const useVoltMarketAuth = () => {
  const context = useContext(VoltMarketAuthContext);
  if (context === undefined) {
    throw new Error('useVoltMarketAuth must be used within a VoltMarketAuthProvider');
  }
  return context;
};