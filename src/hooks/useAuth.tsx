
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  const checkApproval = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('is_voltscout_approved', { user_id: userId });
      
      if (error) {
        console.error('Error checking VoltScout approval:', error);
        setIsApproved(false);
        return;
      }
      
      setIsApproved(data || false);
    } catch (error) {
      console.error('Error checking VoltScout approval:', error);
      setIsApproved(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkApproval(session.user.id);
      } else {
        setIsApproved(false);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkApproval(session.user.id);
        } else {
          setIsApproved(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
