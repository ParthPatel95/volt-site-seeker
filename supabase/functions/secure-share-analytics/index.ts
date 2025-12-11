import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  dateFrom?: string;
  dateTo?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dateFrom, dateTo }: AnalyticsRequest = await req.json();
    
    console.log('Fetching analytics with date range:', { dateFrom, dateTo });

    // Build the query with date filters
    let query = supabaseClient
      .from('viewer_activity')
      .select(`
        id,
        viewer_name,
        viewer_email,
        viewer_ip,
        viewer_location,
        device_type,
        browser,
        total_time_seconds,
        engagement_score,
        opened_at,
        pages_viewed,
        scroll_depth,
        document_id,
        document:secure_documents(id, file_name, file_type),
        link:secure_links(recipient_email)
      `)
      .order('opened_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('opened_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('opened_at', dateTo);
    }

    const { data: activity, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Fetched ${activity?.length || 0} activity records`);

    // Pre-compute all metrics server-side
    const totalViews = activity?.length || 0;
    const totalEngagementTime = activity?.reduce((sum, v) => sum + (v.total_time_seconds || 0), 0) || 0;
    const avgEngagementScore = totalViews > 0 
      ? activity!.reduce((sum, v) => sum + (v.engagement_score || 0), 0) / totalViews 
      : 0;
    
    const uniqueEmails = new Set(activity?.map(v => v.viewer_email).filter(Boolean));
    const uniqueViewers = uniqueEmails.size;

    // Device breakdown
    const deviceStats: Record<string, { count: number; engagement: number; time: number }> = {};
    activity?.forEach(a => {
      const device = a.device_type || 'Unknown';
      if (!deviceStats[device]) {
        deviceStats[device] = { count: 0, engagement: 0, time: 0 };
      }
      deviceStats[device].count += 1;
      deviceStats[device].engagement += a.engagement_score || 0;
      deviceStats[device].time += a.total_time_seconds || 0;
    });

    const deviceData = Object.entries(deviceStats).map(([name, stats]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: stats.count,
      avgEngagement: stats.count > 0 ? Math.round(stats.engagement / stats.count) : 0,
      avgTime: stats.count > 0 ? Math.round(stats.time / stats.count) : 0
    }));

    // Browser breakdown
    const browserCounts: Record<string, number> = {};
    activity?.forEach(a => {
      const browser = a.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    const browserData = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Location breakdown (already stored as city/country or coordinates)
    const locationCounts: Record<string, number> = {};
    activity?.forEach(a => {
      const loc = a.viewer_location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const locationData = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Engagement over time (group by day)
    const dailyEngagement: Record<string, { totalEngagement: number; count: number }> = {};
    activity?.forEach(a => {
      const day = new Date(a.opened_at).toISOString().split('T')[0];
      if (!dailyEngagement[day]) {
        dailyEngagement[day] = { totalEngagement: 0, count: 0 };
      }
      dailyEngagement[day].totalEngagement += a.engagement_score || 0;
      dailyEngagement[day].count += 1;
    });

    const engagementOverTime = Object.entries(dailyEngagement)
      .map(([date, stats]) => ({
        date,
        engagement: stats.count > 0 ? Math.round(stats.totalEngagement / stats.count) : 0,
        views: stats.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top documents
    const docStats: Record<string, any> = {};
    activity?.forEach(a => {
      const docId = a.document?.id;
      const docName = a.document?.file_name || 'Unknown';
      if (!docId) return;

      if (!docStats[docId]) {
        docStats[docId] = {
          id: docId,
          name: docName,
          views: 0,
          uniqueViewers: new Set(),
          totalEngagement: 0,
          totalTime: 0,
          completions: 0
        };
      }

      docStats[docId].views += 1;
      if (a.viewer_email) docStats[docId].uniqueViewers.add(a.viewer_email);
      docStats[docId].totalEngagement += a.engagement_score || 0;
      docStats[docId].totalTime += a.total_time_seconds || 0;
      
      const pagesViewed = Array.isArray(a.pages_viewed) ? a.pages_viewed.length : 0;
      if (pagesViewed >= 5) docStats[docId].completions += 1;
    });

    const topDocuments = Object.values(docStats)
      .map((stats: any) => ({
        id: stats.id,
        name: stats.name.length > 25 ? stats.name.substring(0, 25) + '...' : stats.name,
        fullName: stats.name,
        views: stats.views,
        uniqueViewers: stats.uniqueViewers.size,
        avgEngagement: stats.views > 0 ? Math.round(stats.totalEngagement / stats.views) : 0,
        avgTimeMinutes: stats.views > 0 ? Math.round(stats.totalTime / stats.views / 60) : 0,
        completionRate: stats.views > 0 ? Math.round((stats.completions / stats.views) * 100) : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Time of day analysis
    const timeOfDayViews: Record<number, number> = {};
    activity?.forEach(a => {
      const hour = new Date(a.opened_at).getHours();
      timeOfDayViews[hour] = (timeOfDayViews[hour] || 0) + 1;
    });

    const timeOfDayData = Array.from({ length: 24 }, (_, hour) => ({
      hour: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
      views: timeOfDayViews[hour] || 0
    }));

    // Re-engagement rate
    const viewerCounts: Record<string, number> = {};
    activity?.forEach(a => {
      if (a.viewer_email) {
        viewerCounts[a.viewer_email] = (viewerCounts[a.viewer_email] || 0) + 1;
      }
    });

    const repeatViewers = Object.values(viewerCounts).filter(count => count > 1).length;
    const totalUniqueViewers = Object.keys(viewerCounts).length;
    const reEngagementRate = totalUniqueViewers > 0 ? (repeatViewers / totalUniqueViewers) * 100 : 0;

    // Page drop-off analysis
    const pageDropoffs: Record<number, number> = {};
    activity?.forEach(a => {
      if (Array.isArray(a.pages_viewed)) {
        const lastPage = a.pages_viewed.length;
        pageDropoffs[lastPage] = (pageDropoffs[lastPage] || 0) + 1;
      }
    });

    const dropoffData = Object.entries(pageDropoffs)
      .map(([page, count]) => ({
        page: `Page ${page}`,
        dropoffs: count
      }))
      .sort((a, b) => parseInt(a.page.split(' ')[1]) - parseInt(b.page.split(' ')[1]))
      .slice(0, 10);

    // Average time per page
    const pageTimes: number[] = [];
    activity?.forEach(a => {
      if (Array.isArray(a.pages_viewed)) {
        a.pages_viewed.forEach((p: any) => {
          if (p.time_spent) pageTimes.push(p.time_spent);
        });
      }
    });

    const avgTimePerPage = pageTimes.length 
      ? pageTimes.reduce((sum, time) => sum + time, 0) / pageTimes.length 
      : 0;

    // Completion rate
    const completionRates = activity?.map(a => {
      const pagesViewed = Array.isArray(a.pages_viewed) ? a.pages_viewed.length : 0;
      return (pagesViewed / 10) * 100; // Estimate 10 pages avg
    }) || [];

    const avgCompletionRate = completionRates.length 
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
      : 0;

    // Generate insights
    const insights: Array<{ type: string; title: string; description: string; metric?: string }> = [];

    // Best time insight
    const hourlyEngagement: Record<number, { count: number; totalEngagement: number }> = {};
    activity?.forEach(a => {
      const hour = new Date(a.opened_at).getHours();
      if (!hourlyEngagement[hour]) {
        hourlyEngagement[hour] = { count: 0, totalEngagement: 0 };
      }
      hourlyEngagement[hour].count += 1;
      hourlyEngagement[hour].totalEngagement += a.engagement_score || 0;
    });

    const hourlyAvg = Object.entries(hourlyEngagement).map(([hour, stats]) => ({
      hour: parseInt(hour),
      avgEngagement: stats.count > 0 ? stats.totalEngagement / stats.count : 0
    }));

    const bestHour = hourlyAvg.sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
    if (bestHour && bestHour.avgEngagement > 0) {
      const timeStr = bestHour.hour === 0 ? '12 AM' : bestHour.hour < 12 ? `${bestHour.hour} AM` : bestHour.hour === 12 ? '12 PM' : `${bestHour.hour - 12} PM`;
      insights.push({
        type: 'success',
        title: 'Best Time to Share',
        description: `Documents shared around ${timeStr} get ${Math.round(bestHour.avgEngagement)}% higher engagement.`,
        metric: timeStr
      });
    }

    // Low engagement warning
    const lowEngagementViewers = activity?.filter(a => a.engagement_score && a.engagement_score < 30 && a.viewer_email);
    if (lowEngagementViewers && lowEngagementViewers.length > 0) {
      const uniqueLowEngagement = new Set(lowEngagementViewers.map(a => a.viewer_email));
      insights.push({
        type: 'warning',
        title: 'Low Engagement Viewers',
        description: `${uniqueLowEngagement.size} viewer${uniqueLowEngagement.size > 1 ? 's' : ''} showed low engagement. Consider follow-up.`,
        metric: `${uniqueLowEngagement.size}`
      });
    }

    // High effectiveness
    if (avgEngagementScore > 70) {
      insights.push({
        type: 'success',
        title: 'High Effectiveness',
        description: `Your documents have ${Math.round(avgEngagementScore)}% average engagement. Excellent!`,
        metric: `${Math.round(avgEngagementScore)}/100`
      });
    }

    // Strong repeat engagement
    if (repeatViewers > totalUniqueViewers * 0.3 && totalUniqueViewers > 0) {
      insights.push({
        type: 'success',
        title: 'Strong Repeat Engagement',
        description: `${repeatViewers} viewers returned multiple times. Your content builds lasting interest!`,
        metric: `${Math.round((repeatViewers / totalUniqueViewers) * 100)}%`
      });
    }

    // Recent activity for table
    const recentActivity = activity?.slice(0, 20).map(a => ({
      id: a.id,
      viewer_name: a.viewer_name,
      viewer_email: a.viewer_email || a.link?.recipient_email,
      viewer_ip: a.viewer_ip,
      viewer_location: a.viewer_location,
      device_type: a.device_type,
      browser: a.browser,
      total_time_seconds: a.total_time_seconds,
      engagement_score: a.engagement_score,
      opened_at: a.opened_at,
      pages_viewed: a.pages_viewed,
      scroll_depth: a.scroll_depth,
      document: a.document
    })) || [];

    // Fetch comparison data for previous period
    let comparisonData = null;
    if (dateFrom && dateTo) {
      const periodLength = new Date(dateTo).getTime() - new Date(dateFrom).getTime();
      const prevFrom = new Date(new Date(dateFrom).getTime() - periodLength).toISOString();
      const prevTo = dateFrom;

      const { data: prevActivity } = await supabaseClient
        .from('viewer_activity')
        .select('engagement_score, total_time_seconds, viewer_email')
        .gte('opened_at', prevFrom)
        .lte('opened_at', prevTo);

      if (prevActivity) {
        comparisonData = {
          totalViews: prevActivity.length,
          totalEngagementTime: prevActivity.reduce((sum, v) => sum + (v.total_time_seconds || 0), 0),
          avgEngagementScore: prevActivity.length
            ? prevActivity.reduce((sum, v) => sum + (v.engagement_score || 0), 0) / prevActivity.length
            : 0,
          uniqueViewers: new Set(prevActivity.map(v => v.viewer_email).filter(Boolean)).size
        };
      }
    }

    const analyticsData = {
      // Summary metrics
      totalViews,
      totalEngagementTime,
      avgEngagementScore: Math.round(avgEngagementScore),
      uniqueViewers,
      
      // Comparison
      comparisonData,
      
      // Charts data
      engagementOverTime,
      topDocuments,
      deviceData,
      browserData,
      locationData,
      timeOfDayData,
      dropoffData,
      
      // Advanced metrics
      reEngagementRate: Math.round(reEngagementRate),
      repeatViewers,
      avgTimePerPage: Math.round(avgTimePerPage),
      avgCompletionRate: Math.round(avgCompletionRate),
      
      // Insights
      insights,
      
      // Recent activity
      recentActivity
    };

    console.log('Analytics computed successfully');

    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in secure-share-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
