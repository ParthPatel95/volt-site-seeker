
import { useState, useEffect } from 'react';
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

export const useVoltMarketAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<VoltMarketProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profileData, error } = await supabase
            .from('voltmarket_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (error) {
            console.log('Profile fetch error:', error);
          }
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('voltmarket_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData, error }) => {
            if (error) {
              console.log('Initial profile fetch error:', error);
            }
            setProfile(profileData);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: {
    role: 'buyer' | 'seller';
    seller_type?: 'site_owner' | 'broker' | 'realtor' | 'equipment_vendor';
    company_name?: string;
    phone_number?: string;
  }) => {
    try {
      console.log('Starting signup process...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/voltmarket`
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('User created:', data.user?.id);

      if (data.user && !data.session) {
        // User needs to confirm email
        return { data, error: null };
      }

      if (data.user && data.session) {
        // User is immediately signed in, create profile
        console.log('Creating profile for user:', data.user.id);
        
        const { error: profileError } = await supabase
          .from('voltmarket_profiles')
          .insert({
            user_id: data.user.id,
            role: userData.role,
            seller_type: userData.seller_type,
            company_name: userData.company_name,
            phone_number: userData.phone_number,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: profileError };
        }
        
        console.log('Profile created successfully');
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
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<VoltMarketProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('voltmarket_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};
