import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, password } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Share token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch share link details
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('aeso_shared_dashboards')
      .select('*, aeso_custom_dashboards(*)')
      .eq('share_token', token)
      .single();

    if (shareLinkError || !shareLink) {
      console.error('Share link not found:', shareLinkError);
      return new Response(
        JSON.stringify({ error: 'Invalid share token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if share link is expired
    if (shareLink.status === 'expired' || shareLink.status === 'revoked') {
      return new Response(
        JSON.stringify({ error: 'Share link has been revoked or expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration date
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      await supabase
        .from('aeso_shared_dashboards')
        .update({ status: 'expired' })
        .eq('id', shareLink.id);

      return new Response(
        JSON.stringify({ error: 'Share link has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check view limits
    if (shareLink.max_views && shareLink.current_views >= shareLink.max_views) {
      await supabase
        .from('aeso_shared_dashboards')
        .update({ status: 'expired' })
        .eq('id', shareLink.id);

      return new Response(
        JSON.stringify({ error: 'Share link has reached maximum views' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check password if required
    if (shareLink.password_hash && shareLink.password_hash !== password) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment view count and update last accessed
    await supabase
      .from('aeso_shared_dashboards')
      .update({
        current_views: shareLink.current_views + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', shareLink.id);

    // Track the view
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const viewerIp = forwardedFor ? forwardedFor.split(',')[0] : 'Unknown';

    await supabase
      .from('aeso_dashboard_views')
      .insert({
        shared_dashboard_id: shareLink.id,
        viewer_ip: viewerIp,
        user_agent: userAgent,
        viewed_at: new Date().toISOString(),
      });

    // Fetch dashboard with widgets
    const { data: dashboard, error: dashboardError } = await supabase
      .from('aeso_custom_dashboards')
      .select('*, aeso_dashboard_widgets(*)')
      .eq('id', shareLink.dashboard_id)
      .single();

    if (dashboardError || !dashboard) {
      console.error('Dashboard not found:', dashboardError);
      return new Response(
        JSON.stringify({ error: 'Dashboard not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        dashboard,
        shareLink: {
          access_level: shareLink.access_level,
          custom_branding: shareLink.custom_branding,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating share token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
