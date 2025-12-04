import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

let currentSessionId: string | null = null;
let pageStartTime: number = Date.now();

export function useAnalytics() {
  const { user } = useAuth();
  const location = useLocation();
  const previousPath = useRef<string>('');

  // Start session on mount - NON-BLOCKING
  useEffect(() => {
    if (!user?.id) return;

    // Fire-and-forget session start
    queueMicrotask(async () => {
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            user_agent: navigator.userAgent,
            session_start: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        currentSessionId = data.id;
      } catch (error) {
        console.error('Error starting session:', error);
      }
    });

    // End session on unmount or page close
    const endSession = () => {
      if (!currentSessionId) return;
      
      const sessionId = currentSessionId;
      
      // Use sendBeacon for reliability on page unload, fire-and-forget otherwise
      queueMicrotask(async () => {
        try {
          const sessionStart = await supabase
            .from('user_sessions')
            .select('session_start')
            .eq('id', sessionId)
            .single();

          if (sessionStart.data) {
            const durationSeconds = Math.floor(
              (Date.now() - new Date(sessionStart.data.session_start).getTime()) / 1000
            );

            await supabase
              .from('user_sessions')
              .update({
                session_end: new Date().toISOString(),
                duration_seconds: durationSeconds
              })
              .eq('id', sessionId);
          }
        } catch (error) {
          console.error('Error ending session:', error);
        }
      });
    };

    window.addEventListener('beforeunload', endSession);
    
    return () => {
      endSession();
      window.removeEventListener('beforeunload', endSession);
    };
  }, [user?.id]);

  // Track page visits - NON-BLOCKING
  useEffect(() => {
    if (!user?.id) return;

    // Fire-and-forget page tracking
    queueMicrotask(async () => {
      // Wait for session to be available (with timeout)
      let attempts = 0;
      while (!currentSessionId && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!currentSessionId) return;

      const currentPath = location.pathname;
      
      // Calculate time spent on previous page
      if (previousPath.current && previousPath.current !== currentPath) {
        const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000);
        
        try {
          await supabase
            .from('user_page_visits')
            .update({ time_spent_seconds: timeSpent })
            .eq('user_id', user.id)
            .eq('page_path', previousPath.current)
            .eq('session_id', currentSessionId)
            .order('visit_timestamp', { ascending: false })
            .limit(1);
        } catch (error) {
          console.error('Error updating page time:', error);
        }
      }

      // Record new page visit
      try {
        await supabase
          .from('user_page_visits')
          .insert({
            user_id: user.id,
            session_id: currentSessionId,
            page_path: currentPath,
            page_title: document.title,
            visit_timestamp: new Date().toISOString()
          });
        
        previousPath.current = currentPath;
        pageStartTime = Date.now();
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    });
  }, [location.pathname, user?.id]);

  // Track feature usage - NON-BLOCKING
  const trackFeature = useCallback((
    featureName: string, 
    actionType: string, 
    metadata?: Record<string, any>
  ) => {
    if (!user?.id || !currentSessionId) return;

    // Fire-and-forget feature tracking
    queueMicrotask(async () => {
      try {
        await supabase
          .from('user_feature_usage')
          .insert({
            user_id: user.id,
            session_id: currentSessionId,
            feature_name: featureName,
            action_type: actionType,
            metadata: metadata || null,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error tracking feature usage:', error);
      }
    });
  }, [user?.id]);

  return { trackFeature };
}
