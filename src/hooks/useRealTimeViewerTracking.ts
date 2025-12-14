import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ActiveViewer {
  id: string;
  viewer_name: string | null;
  viewer_email: string | null;
  link_id: string;
  document_id: string;
  opened_at: string;
  last_activity_at: string;
}

export function useRealTimeViewerTracking(linkIds?: string[]) {
  const [activeViewers, setActiveViewers] = useState<ActiveViewer[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel('viewer-activity-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'viewer_activity'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newViewer = payload.new as ActiveViewer;
              // Filter by linkIds if provided
              if (!linkIds || linkIds.includes(newViewer.link_id)) {
                setActiveViewers(prev => [...prev, newViewer]);
                setRecentActivity(prev => [payload.new, ...prev].slice(0, 20));
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as ActiveViewer;
              // Check if viewer is still active (activity within last 2 minutes)
              const lastActivity = new Date(updated.last_activity_at || updated.opened_at);
              const isActive = (Date.now() - lastActivity.getTime()) < 120000;
              
              setActiveViewers(prev => {
                if (isActive) {
                  const exists = prev.find(v => v.id === updated.id);
                  if (exists) {
                    return prev.map(v => v.id === updated.id ? updated : v);
                  } else if (!linkIds || linkIds.includes(updated.link_id)) {
                    return [...prev, updated];
                  }
                } else {
                  return prev.filter(v => v.id !== updated.id);
                }
                return prev;
              });
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    // Clean up stale viewers every 30 seconds
    const cleanupInterval = setInterval(() => {
      setActiveViewers(prev => 
        prev.filter(v => {
          const lastActivity = new Date(v.last_activity_at || v.opened_at);
          return (Date.now() - lastActivity.getTime()) < 120000;
        })
      );
    }, 30000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(cleanupInterval);
    };
  }, [linkIds?.join(',')]);

  // Get active viewer count for a specific link
  const getActiveViewerCount = (linkId: string) => {
    return activeViewers.filter(v => v.link_id === linkId).length;
  };

  // Check if a specific link has active viewers
  const hasActiveViewers = (linkId: string) => {
    return activeViewers.some(v => v.link_id === linkId);
  };

  return {
    activeViewers,
    recentActivity,
    getActiveViewerCount,
    hasActiveViewers,
    totalActiveViewers: activeViewers.length
  };
}
