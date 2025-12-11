import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

export interface AnalyticsData {
  // Summary metrics
  totalViews: number;
  totalEngagementTime: number;
  avgEngagementScore: number;
  uniqueViewers: number;
  
  // Comparison data
  comparisonData: {
    totalViews: number;
    totalEngagementTime: number;
    avgEngagementScore: number;
    uniqueViewers: number;
  } | null;
  
  // Charts data
  engagementOverTime: Array<{ date: string; engagement: number; views: number }>;
  topDocuments: Array<{
    id: string;
    name: string;
    fullName: string;
    views: number;
    uniqueViewers: number;
    avgEngagement: number;
    avgTimeMinutes: number;
    completionRate: number;
  }>;
  deviceData: Array<{ name: string; value: number; avgEngagement: number; avgTime: number }>;
  browserData: Array<{ name: string; value: number }>;
  locationData: Array<{ location: string; count: number }>;
  timeOfDayData: Array<{ hour: string; views: number }>;
  dropoffData: Array<{ page: string; dropoffs: number }>;
  
  // Advanced metrics
  reEngagementRate: number;
  repeatViewers: number;
  avgTimePerPage: number;
  avgCompletionRate: number;
  
  // Insights
  insights: Array<{
    type: string;
    title: string;
    description: string;
    metric?: string;
  }>;
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    viewer_name: string | null;
    viewer_email: string | null;
    viewer_ip: string | null;
    viewer_location: string | null;
    device_type: string | null;
    browser: string | null;
    total_time_seconds: number;
    engagement_score: number;
    opened_at: string;
    pages_viewed: Array<{ page: number; time_spent: number; viewed_at: string }>;
    scroll_depth: Record<string, number>;
    document: { file_name: string } | null;
  }>;
}

interface SecureShareAnalyticsContextValue {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const SecureShareAnalyticsContext = createContext<SecureShareAnalyticsContextValue | undefined>(undefined);

interface SecureShareAnalyticsProviderProps {
  children: React.ReactNode;
  dateRange?: DateRange;
}

export function SecureShareAnalyticsProvider({ children, dateRange }: SecureShareAnalyticsProviderProps) {
  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['secure-share-analytics-unified', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('secure-share-analytics', {
        body: {
          dateFrom: dateRange?.from?.toISOString(),
          dateTo: dateRange?.to?.toISOString()
        }
      });

      if (error) throw error;
      return data as AnalyticsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    retry: 2
  });

  const value = useMemo(() => ({
    analytics: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch
  }), [data, isLoading, error, refetch]);

  return (
    <SecureShareAnalyticsContext.Provider value={value}>
      {children}
    </SecureShareAnalyticsContext.Provider>
  );
}

export function useSecureShareAnalytics() {
  const context = useContext(SecureShareAnalyticsContext);
  if (context === undefined) {
    throw new Error('useSecureShareAnalytics must be used within a SecureShareAnalyticsProvider');
  }
  return context;
}
