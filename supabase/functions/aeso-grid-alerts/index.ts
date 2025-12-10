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

// Parse XML RSS feed to extract items
function parseRSSFeed(xmlText: string): GridAlert[] {
  const alerts: GridAlert[] = [];
  
  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemContent = itemMatch[1];
    
    // Extract fields from each item
    const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || 
                       itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                      itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const guidMatch = itemContent.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
    
    if (titleMatch && pubDateMatch) {
      alerts.push({
        title: titleMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : '',
        link: linkMatch ? linkMatch[1].trim() : '',
        pubDate: pubDateMatch[1].trim(),
        guid: guidMatch ? guidMatch[1].trim() : `alert-${Date.now()}-${Math.random()}`
      });
    }
  }
  
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching AESO Grid Alert RSS feed...');
    
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store/update alerts in database
    const upsertedAlerts = [];
    for (const alert of alerts) {
      const alertType = determineAlertType(alert.title, alert.description);
      const status = determineAlertStatus(alert.title, alert.description);
      
      const { data, error } = await supabase
        .from('aeso_grid_alerts')
        .upsert({
          title: alert.title,
          description: alert.description,
          link: alert.link,
          published_at: new Date(alert.pubDate).toISOString(),
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

    // Fetch recent alerts from database to return
    const { data: recentAlerts, error: fetchError } = await supabase
      .from('aeso_grid_alerts')
      .select('*')
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
      hasActiveAlert: hasActiveGridAlert
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
