import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface GridAlert {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
}

// Parse XML RSS feed to extract items - handles both CDATA and plain text formats
function parseRSSFeed(xmlText: string): GridAlert[] {
  const alerts: GridAlert[] = [];
  
  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemContent = itemMatch[1];
    
    // Extract fields - try CDATA first, then plain text (handles both formats)
    const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const guidMatch = itemContent.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    
    if (titleMatch && pubDateMatch) {
      // Clean up extracted text (remove extra whitespace, decode HTML entities)
      const cleanText = (text: string) => text
        .trim()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      alerts.push({
        title: cleanText(titleMatch[1]),
        description: descMatch ? cleanText(descMatch[1]) : '',
        link: linkMatch ? cleanText(linkMatch[1]) : '',
        pubDate: pubDateMatch[1].trim(),
        guid: guidMatch ? cleanText(guidMatch[1]) : `alert-${Date.now()}-${Math.random()}`
      });
    }
  }
  
  console.log('Parsed alerts from RSS:', alerts.map(a => ({ title: a.title.substring(0, 50), pubDate: a.pubDate })));
  return alerts;
}

// Determine alert type from title/description
function determineAlertType(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('eea') || text.includes('energy emergency')) {
    return 'eea';
  }
  if (text.includes('maintenance') || text.includes('scheduled')) {
    return 'maintenance';
  }
  return 'grid_alert';
}

// Determine if alert is still active based on content
function determineAlertStatus(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('ended') || text.includes('cancelled') || text.includes('resolved')) {
    return 'ended';
  }
  return 'active';
}

// Clean up old alerts - mark stale as expired, delete very old ones
async function cleanupOldAlerts(supabase: any) {
  const now = new Date();
  
  // Mark alerts older than 7 days as expired (if still active)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { error: expireError, count: expiredCount } = await supabase
    .from('aeso_grid_alerts')
    .update({ 
      status: 'expired',
      updated_at: now.toISOString()
    })
    .eq('status', 'active')
    .lt('published_at', sevenDaysAgo.toISOString());
  
  if (expireError) {
    console.error('Error expiring old alerts:', expireError);
  } else if (expiredCount && expiredCount > 0) {
    console.log(`Marked ${expiredCount} stale alerts as expired`);
  }
  
  // Delete alerts older than 90 days to prevent database bloat
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { error: deleteError, count: deletedCount } = await supabase
    .from('aeso_grid_alerts')
    .delete()
    .lt('published_at', ninetyDaysAgo.toISOString());
  
  if (deleteError) {
    console.error('Error deleting old alerts:', deleteError);
  } else if (deletedCount && deletedCount > 0) {
    console.log(`Deleted ${deletedCount} alerts older than 90 days`);
  }
  
  return { expiredCount: expiredCount || 0, deletedCount: deletedCount || 0 };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching AESO Grid Alert RSS feed...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Clean up old alerts first
    const cleanupResult = await cleanupOldAlerts(supabase);
    console.log('Cleanup result:', cleanupResult);
    
    // Fetch the RSS feed
    const rssResponse = await fetch('https://www.aeso.ca/rss/grid-alert', {
      headers: {
        'User-Agent': 'WattByte-Grid-Monitor/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    if (!rssResponse.ok) {
      console.error('RSS feed fetch failed:', rssResponse.status, rssResponse.statusText);
      throw new Error(`Failed to fetch RSS feed: ${rssResponse.status}`);
    }

    const xmlText = await rssResponse.text();
    console.log('RSS feed fetched, length:', xmlText.length);
    
    // Parse the RSS feed
    const alerts = parseRSSFeed(xmlText);
    console.log('Parsed alerts count:', alerts.length);

    // Store/update alerts in database, correlating "ended" alerts with originals
    const upsertedAlerts = [];
    
    // Sort alerts by published date (oldest first) to process in order
    const sortedAlerts = [...alerts].sort((a, b) => 
      new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
    );
    
    for (const alert of sortedAlerts) {
      const alertType = determineAlertType(alert.title, alert.description);
      const status = determineAlertStatus(alert.title, alert.description);
      const publishedAt = new Date(alert.pubDate);
      
      // If this is an "ended" alert, mark any previous active alerts as ended
      if (status === 'ended') {
        // Find alerts from the same day that are still marked active and update them
        const dayStart = new Date(publishedAt);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(publishedAt);
        dayEnd.setHours(23, 59, 59, 999);
        
        const { error: updateError } = await supabase
          .from('aeso_grid_alerts')
          .update({ status: 'ended', updated_at: new Date().toISOString() })
          .eq('status', 'active')
          .gte('published_at', dayStart.toISOString())
          .lte('published_at', publishedAt.toISOString());
        
        if (updateError) {
          console.error('Error updating related alerts to ended:', updateError);
        } else {
          console.log('Marked previous active alerts as ended for date:', publishedAt.toISOString());
        }
      }
      
      const { data, error } = await supabase
        .from('aeso_grid_alerts')
        .upsert({
          title: alert.title,
          description: alert.description,
          link: alert.link,
          published_at: publishedAt.toISOString(),
          guid: alert.guid,
          alert_type: alertType,
          status: status,
          source: 'aeso_rss',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'guid'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting alert:', error);
      } else {
        upsertedAlerts.push(data);
      }
    }

    // Fetch recent alerts from database to return (excluding expired unless recent)
    const { data: recentAlerts, error: fetchError } = await supabase
      .from('aeso_grid_alerts')
      .select('*')
      .neq('status', 'expired')
      .order('published_at', { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error('Error fetching recent alerts:', fetchError);
    }

    // Determine current grid status
    const activeAlerts = (recentAlerts || []).filter(a => a.status === 'active');
    const hasActiveGridAlert = activeAlerts.some(a => a.alert_type === 'grid_alert' || a.alert_type === 'eea');
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      feedAlertsCount: alerts.length,
      storedAlertsCount: upsertedAlerts.length,
      cleanup: cleanupResult,
      currentStatus: {
        hasActiveAlert: hasActiveGridAlert,
        activeAlertCount: activeAlerts.length,
        alertLevel: hasActiveGridAlert ? 'warning' : 'normal'
      },
      recentAlerts: recentAlerts || [],
      rawFeedAlerts: alerts
    };

    console.log('Response prepared:', {
      feedAlerts: alerts.length,
      stored: upsertedAlerts.length,
      hasActiveAlert: hasActiveGridAlert,
      cleanup: cleanupResult
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in aeso-grid-alerts function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
