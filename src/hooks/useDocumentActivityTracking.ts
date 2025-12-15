import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDocumentActivityTrackingProps {
  linkId: string;
  documentId: string;
  enabled: boolean;
  viewerName?: string;
  viewerEmail?: string;
}

interface PageActivity {
  page: number;
  timeSpent: number;
  scrollDepth: number;
  viewedAt: string;
}

// Store activity in localStorage as backup
const ACTIVITY_STORAGE_KEY = 'secure_share_pending_activity';

export function useDocumentActivityTracking({
  linkId,
  documentId,
  enabled,
  viewerName,
  viewerEmail
}: UseDocumentActivityTrackingProps) {
  const [activityId, setActivityId] = useState<string | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<number>(1);
  const pageActivities = useRef<Map<number, PageActivity>>(new Map());
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const isVisible = useRef<boolean>(true);
  const lastUpdateTime = useRef<number>(Date.now());

  // Calculate current activity data
  const getActivityData = useCallback(() => {
    // Update current page's time spent
    const now = Date.now();
    const timeOnCurrentPage = Math.floor((now - pageStartTime.current) / 1000);
    const currentActivity = pageActivities.current.get(currentPage.current);
    if (currentActivity) {
      currentActivity.timeSpent += timeOnCurrentPage;
      pageStartTime.current = now;
    }

    const totalTimeSpent = Math.floor((now - sessionStartTime.current) / 1000);
    const pagesViewed = Array.from(pageActivities.current.values());
    
    // Calculate engagement score
    const avgScrollDepth = pagesViewed.reduce((sum, p) => sum + p.scrollDepth, 0) / (pagesViewed.length || 1);
    const engagementScore = Math.min(100, Math.round(
      (pagesViewed.length * 20) +
      (Math.min(totalTimeSpent / 60, 10) * 3) +
      (avgScrollDepth * 0.3)
    ));

    // Create scroll depth object per page
    const scrollDepth: Record<string, number> = {};
    pagesViewed.forEach(p => {
      scrollDepth[`page_${p.page}`] = p.scrollDepth;
    });

    return {
      total_time_seconds: totalTimeSpent,
      pages_viewed: pagesViewed.map(p => ({
        page: p.page,
        time_spent: p.timeSpent,
        viewed_at: p.viewedAt
      })),
      scroll_depth: scrollDepth,
      engagement_score: engagementScore,
      last_activity_at: new Date().toISOString()
    };
  }, []);

  // Store pending update in localStorage as backup
  const storePendingUpdate = useCallback((id: string, data: any) => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify({ id, data, timestamp: Date.now() }));
    } catch (e) {
      console.error('Failed to store pending activity:', e);
    }
  }, []);

  // Clear pending update from localStorage
  const clearPendingUpdate = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }, []);

  // Update activity in database
  const updateActivityInDatabase = useCallback(async () => {
    if (!activityId) return;

    const data = getActivityData();
    
    // Store as backup before sending
    storePendingUpdate(activityId, data);

    try {
      const { error } = await supabase
        .from('viewer_activity')
        .update(data)
        .eq('id', activityId);
      
      if (!error) {
        clearPendingUpdate();
        lastUpdateTime.current = Date.now();
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }, [activityId, getActivityData, storePendingUpdate, clearPendingUpdate]);

  // Send final update using sendBeacon API for reliable delivery on page close
  const sendFinalUpdate = useCallback(() => {
    if (!activityId) return;

    const data = getActivityData();
    
    // Use sendBeacon for reliable delivery on page unload
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({
        activityId,
        totalTimeSeconds: data.total_time_seconds,
        engagementScore: data.engagement_score,
        pagesViewed: data.pages_viewed,
        lastActivity: data.last_activity_at
      });
      
      // Send to beacon endpoint - hardcoded URL as env vars don't work in Lovable
      const beaconUrl = 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/track-activity-beacon';
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(beaconUrl, blob);
    } else {
      // Fallback: try regular update
      updateActivityInDatabase();
    }
  }, [activityId, getActivityData, updateActivityInDatabase]);

  // Handle visibility change (tab switching)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // User switched away - save current state
      isVisible.current = false;
      updateActivityInDatabase();
    } else {
      // User came back - resume tracking
      isVisible.current = true;
      pageStartTime.current = Date.now();
    }
  }, [updateActivityInDatabase]);

  // Get user location
  const getUserLocation = async (id: string): Promise<void> => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = `${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`;
            await supabase
              .from('viewer_activity')
              .update({ viewer_location: location })
              .eq('id', id);
          },
          () => {},
          { timeout: 5000 }
        );
      }
    } catch (error) {
      // Silently fail
    }
  };

  // Track page change
  const trackPageChange = useCallback((newPage: number) => {
    if (!enabled || !activityId) return;

    const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
    
    const existingActivity = pageActivities.current.get(currentPage.current);
    if (existingActivity) {
      existingActivity.timeSpent += timeOnPage;
    } else {
      pageActivities.current.set(currentPage.current, {
        page: currentPage.current,
        timeSpent: timeOnPage,
        scrollDepth: 0,
        viewedAt: new Date().toISOString()
      });
    }

    currentPage.current = newPage;
    pageStartTime.current = Date.now();

    if (!pageActivities.current.has(newPage)) {
      pageActivities.current.set(newPage, {
        page: newPage,
        timeSpent: 0,
        scrollDepth: 0,
        viewedAt: new Date().toISOString()
      });
    }

    updateActivityInDatabase();
  }, [enabled, activityId, updateActivityInDatabase]);

  // Track scroll depth
  const trackScrollDepth = useCallback((scrollPercentage: number) => {
    if (!enabled || !activityId) return;

    const activity = pageActivities.current.get(currentPage.current);
    if (activity) {
      activity.scrollDepth = Math.max(activity.scrollDepth, scrollPercentage);
    }
  }, [enabled, activityId]);

  // Initialize tracking
  useEffect(() => {
    if (!enabled) return;

    const initTracking = async () => {
      try {
        // Check for pending updates from previous sessions
        try {
          const pending = localStorage.getItem(ACTIVITY_STORAGE_KEY);
          if (pending) {
            const { id, data } = JSON.parse(pending);
            await supabase.from('viewer_activity').update(data).eq('id', id);
            localStorage.removeItem(ACTIVITY_STORAGE_KEY);
          }
        } catch (e) {
          // Ignore
        }

        const { data: newActivity, error } = await supabase
          .from('viewer_activity')
          .insert({
            link_id: linkId,
            document_id: documentId,
            viewer_name: viewerName || null,
            viewer_email: viewerEmail || null,
            viewer_location: null,
            device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            browser: navigator.userAgent.split(' ').pop() || 'unknown',
            opened_at: new Date().toISOString(),
            total_time_seconds: 0,
            pages_viewed: [],
            scroll_depth: {},
            engagement_score: 0
          })
          .select('id')
          .single();

        if (error) {
          // Silently fail for anonymous users (CORS/auth issues on shared links)
          console.warn('Activity tracking init error (expected for anonymous users):', error.message);
          return;
        }

        setActivityId(newActivity.id);

        pageActivities.current.set(1, {
          page: 1,
          timeSpent: 0,
          scrollDepth: 0,
          viewedAt: new Date().toISOString()
        });

        getUserLocation(newActivity.id);

        // Update every 3 seconds for more accurate tracking
        updateInterval.current = setInterval(() => {
          if (isVisible.current) {
            updateActivityInDatabase();
          }
        }, 3000);

      } catch (error) {
        console.error('Error initializing tracking:', error);
      }
    };

    initTracking();

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up beforeunload handler as backup
    const handleBeforeUnload = () => {
      sendFinalUpdate();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendFinalUpdate();
    };
  }, [enabled, linkId, documentId, viewerName, viewerEmail, handleVisibilityChange, sendFinalUpdate, updateActivityInDatabase]);

  return {
    trackPageChange,
    trackScrollDepth,
    updateActivity: updateActivityInDatabase
  };
}
