import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDocumentActivityTrackingProps {
  linkId: string;
  documentId: string;
  enabled: boolean;
}

interface PageActivity {
  page: number;
  timeSpent: number;
  scrollDepth: number;
  viewedAt: string;
}

export function useDocumentActivityTracking({
  linkId,
  documentId,
  enabled
}: UseDocumentActivityTrackingProps) {
  const [activityId, setActivityId] = useState<string | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<number>(1);
  const pageActivities = useRef<Map<number, PageActivity>>(new Map());
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  // Get user location (IP-based from browser or geolocation API)
  const getUserLocation = async (): Promise<string | null> => {
    try {
      // Try to get browser geolocation
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve(`${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`);
            },
            () => {
              // Fallback to IP-based location (could be enhanced with a geolocation API)
              resolve(null);
            },
            { timeout: 5000 }
          );
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  // Track page change
  const trackPageChange = (newPage: number) => {
    if (!enabled || !activityId) return;

    // Calculate time spent on previous page
    const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
    
    // Update previous page activity
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

    // Update references
    currentPage.current = newPage;
    pageStartTime.current = Date.now();

    // Track new page view
    if (!pageActivities.current.has(newPage)) {
      pageActivities.current.set(newPage, {
        page: newPage,
        timeSpent: 0,
        scrollDepth: 0,
        viewedAt: new Date().toISOString()
      });
    }

    // Send update to database
    updateActivityInDatabase();
  };

  // Track scroll depth
  const trackScrollDepth = (scrollPercentage: number) => {
    if (!enabled || !activityId) return;

    const activity = pageActivities.current.get(currentPage.current);
    if (activity) {
      activity.scrollDepth = Math.max(activity.scrollDepth, scrollPercentage);
    }
  };

  // Update activity in database
  const updateActivityInDatabase = async () => {
    if (!activityId) return;

    const totalTimeSpent = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    const pagesViewed = Array.from(pageActivities.current.values());
    
    // Calculate engagement score based on:
    // - Number of unique pages viewed
    // - Total time spent
    // - Average scroll depth
    const avgScrollDepth = pagesViewed.reduce((sum, p) => sum + p.scrollDepth, 0) / (pagesViewed.length || 1);
    const engagementScore = Math.min(100, Math.round(
      (pagesViewed.length * 20) + // Up to 20 points per page (max 5 pages)
      (Math.min(totalTimeSpent / 60, 10) * 3) + // Up to 30 points for time (10 min max)
      (avgScrollDepth * 0.3) // Up to 30 points for scroll depth
    ));

    // Create scroll depth object per page
    const scrollDepth: Record<string, number> = {};
    pagesViewed.forEach(p => {
      scrollDepth[`page_${p.page}`] = p.scrollDepth;
    });

    try {
      await supabase
        .from('viewer_activity')
        .update({
          total_time_seconds: totalTimeSpent,
          pages_viewed: pagesViewed.map(p => ({
            page: p.page,
            time_spent: p.timeSpent,
            viewed_at: p.viewedAt
          })),
          scroll_depth: scrollDepth,
          engagement_score: engagementScore,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', activityId);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  // Initialize tracking
  useEffect(() => {
    if (!enabled) return;

    const initTracking = async () => {
      try {
        const location = await getUserLocation();

        // Try to find the most recent activity record for this link
        const { data: existingActivities } = await supabase
          .from('viewer_activity')
          .select('id')
          .eq('link_id', linkId)
          .eq('document_id', documentId)
          .order('opened_at', { ascending: false })
          .limit(1);

        let activityRecordId: string;

        if (existingActivities && existingActivities.length > 0) {
          // Use existing record
          activityRecordId = existingActivities[0].id;
        } else {
          // Create a new activity record
          const { data: newActivity, error: insertError } = await supabase
            .from('viewer_activity')
            .insert({
              link_id: linkId,
              document_id: documentId,
              viewer_location: location,
              device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
              browser: navigator.userAgent.split(' ').pop() || 'unknown',
              opened_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error creating activity record:', insertError);
            return;
          }

          activityRecordId = newActivity.id;
        }

        setActivityId(activityRecordId);

        // Update with location if we got it and using existing record
        if (location && existingActivities && existingActivities.length > 0) {
          await supabase
            .from('viewer_activity')
            .update({ viewer_location: location })
            .eq('id', activityRecordId);
        }

        // Initialize first page
        pageActivities.current.set(1, {
          page: 1,
          timeSpent: 0,
          scrollDepth: 0,
          viewedAt: new Date().toISOString()
        });

        // Set up periodic updates every 5 seconds
        updateInterval.current = setInterval(updateActivityInDatabase, 5000);
      } catch (error) {
        console.error('Error initializing tracking:', error);
      }
    };

    initTracking();

    return () => {
      // Final update before unmounting
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      updateActivityInDatabase();
    };
  }, [enabled, linkId, documentId]);

  return {
    trackPageChange,
    trackScrollDepth,
    updateActivity: updateActivityInDatabase
  };
}
