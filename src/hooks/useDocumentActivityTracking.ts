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
    if (!activityId) {
      console.log('No activityId, skipping update');
      return;
    }

    const totalTimeSpent = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    const pagesViewed = Array.from(pageActivities.current.values());
    
    console.log('📊 Updating activity:', {
      activityId,
      totalTimeSpent,
      pagesCount: pagesViewed.length,
      pageActivitiesSize: pageActivities.current.size,
      pages: pagesViewed
    });
    
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

    const updateData = {
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

    console.log('📝 Update data:', updateData);

    try {
      const { data, error } = await supabase
        .from('viewer_activity')
        .update(updateData)
        .eq('id', activityId)
        .select();
      
      if (error) {
        console.error('❌ Error updating activity:', error);
      } else {
        console.log('✅ Activity updated successfully:', data);
      }
    } catch (error) {
      console.error('❌ Exception updating activity:', error);
    }
  };

  // Initialize tracking
  useEffect(() => {
    if (!enabled) return;

    const initTracking = async () => {
      try {
        const location = await getUserLocation();

        // Create a new activity record for each session
        const { data: newActivity, error: insertError } = await supabase
          .from('viewer_activity')
          .insert({
            link_id: linkId,
            document_id: documentId,
            viewer_location: location,
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

        if (insertError) {
          console.error('Error creating activity record:', insertError);
          return;
        }

        setActivityId(newActivity.id);

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
