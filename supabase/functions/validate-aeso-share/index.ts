import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  token: string;
  password?: string;
  viewerName?: string;
  viewerEmail?: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ValidateRequest = await req.json();
    console.log('[Validate AESO Share] Token:', body.token?.substring(0, 8) + '...');

    if (!body.token) {
      return new Response(JSON.stringify({
        valid: false,
        error: 'No token provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the report
    const { data: report, error: fetchError } = await supabase
      .from('shared_aeso_reports')
      .select('*')
      .eq('share_token', body.token)
      .single();

    if (fetchError || !report) {
      console.log('[Validate AESO Share] Report not found');
      return new Response(JSON.stringify({
        valid: false,
        error: 'Report not found or link is invalid'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if revoked
    if (report.status === 'revoked') {
      return new Response(JSON.stringify({
        valid: false,
        error: 'This link has been revoked'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiration
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('shared_aeso_reports')
        .update({ status: 'expired' })
        .eq('id', report.id);

      return new Response(JSON.stringify({
        valid: false,
        error: 'This link has expired'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check max views
    if (report.max_views && report.current_views >= report.max_views) {
      return new Response(JSON.stringify({
        valid: false,
        error: 'Maximum views reached for this link'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check password requirement
    if (report.password_hash) {
      if (!body.password) {
        return new Response(JSON.stringify({
          valid: false,
          requiresPassword: true,
          title: report.title,
          error: 'Password required'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const providedHash = await hashPassword(body.password);
      if (providedHash !== report.password_hash) {
        return new Response(JSON.stringify({
          valid: false,
          requiresPassword: true,
          title: report.title,
          error: 'Incorrect password'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check if viewer info provided (required for first access)
    if (!body.viewerName || !body.viewerEmail) {
      return new Response(JSON.stringify({
        valid: false,
        requiresViewerInfo: true,
        title: report.title,
        requiresPassword: !!report.password_hash,
        error: 'Viewer information required'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record the view
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const viewerIp = forwardedFor.split(',')[0]?.trim() || 'unknown';

    await supabase
      .from('shared_aeso_report_views')
      .insert({
        report_id: report.id,
        viewer_name: body.viewerName,
        viewer_email: body.viewerEmail,
        viewer_ip: viewerIp,
        viewer_user_agent: userAgent
      });

    // Increment view count
    await supabase
      .from('shared_aeso_reports')
      .update({ current_views: (report.current_views || 0) + 1 })
      .eq('id', report.id);

    console.log('[Validate AESO Share] Access granted to:', body.viewerEmail);

    return new Response(JSON.stringify({
      valid: true,
      report: {
        id: report.id,
        title: report.title,
        reportType: report.report_type,
        reportData: report.report_data,
        reportConfig: report.report_config,
        reportHtml: report.report_html,
        createdAt: report.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Validate AESO Share] Error:', error);
    return new Response(JSON.stringify({
      valid: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
