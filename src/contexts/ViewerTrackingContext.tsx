import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

interface ViewerTrackingContextType {
  activeViewers: ActiveViewer[];
  totalActiveViewers: number;
  hasActiveViewers: (linkId: string) => boolean;
  getActiveViewerCount: (linkId: string) => number;
  recentActivity: any[];
}

const ViewerTrackingContext = createContext<ViewerTrackingContextType>({
  activeViewers: [],
  totalActiveViewers: 0,
  hasActiveViewers: () => false,
  getActiveViewerCount: () => 0,
  recentActivity: [],
});

export function ViewerTrackingProvider({ children }: { children: ReactNode }) {
  const [activeViewers, setActiveViewers] = useState<ActiveViewer[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel('global-viewer-activity')
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
              setActiveViewers(prev => [...prev, newViewer]);
              setRecentActivity(prev => [payload.new, ...prev].slice(0, 20));
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as ActiveViewer;
              const lastActivity = new Date(updated.last_activity_at || updated.opened_at);
              const isActive = (Date.now() - lastActivity.getTime()) < 120000;
              
              setActiveViewers(prev => {
                if (isActive) {
                  const exists = prev.find(v => v.id === updated.id);
                  if (exists) {
                    return prev.map(v => v.id === updated.id ? updated : v);
                  } else {
                    return [...prev, updated];
                  }
                } else {
                  return prev.filter(v => v.id !== updated.id);
                }
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
  }, []);

  const hasActiveViewers = (linkId: string) => 
    activeViewers.some(v => v.link_id === linkId);
  
  const getActiveViewerCount = (linkId: string) =>
    activeViewers.filter(v => v.link_id === linkId).length;

  return (
    <ViewerTrackingContext.Provider value={{
      activeViewers,
      totalActiveViewers: activeViewers.length,
      hasActiveViewers,
      getActiveViewerCount,
      recentActivity
    }}>
      {children}
    </ViewerTrackingContext.Provider>
  );
}

export const useViewerTracking = () => useContext(ViewerTrackingContext);
