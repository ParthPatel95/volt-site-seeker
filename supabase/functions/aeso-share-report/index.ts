import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareReportRequest {
  reportData: any;
  reportConfig: any;
  reportHtml?: string;
  title?: string;
  password?: string;
  expiresAt?: string;
  maxViews?: number;
}

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    const body: ShareReportRequest = await req.json();
    console.log('[AESO Share Report] Creating shareable link');
    console.log('[AESO Share Report] Title:', body.title);
    console.log('[AESO Share Report] Has password:', !!body.password);
    console.log('[AESO Share Report] Expires at:', body.expiresAt);
    console.log('[AESO Share Report] Max views:', body.maxViews);

    // Generate unique share token
    const shareToken = generateShareToken();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (body.password) {
      passwordHash = await hashPassword(body.password);
    }

    // Determine report type
    const reportType = body.reportConfig?.exportType === 'comprehensive' ? 'comprehensive' : 'single';

    // Insert into database
    const { data, error } = await supabase
      .from('shared_aeso_reports')
      .insert({
        created_by: userId,
        share_token: shareToken,
        title: body.title || 'AESO Analysis Report',
        password_hash: passwordHash,
        expires_at: body.expiresAt || null,
        max_views: body.maxViews || null,
        report_type: reportType,
        report_data: body.reportData,
        report_config: body.reportConfig,
        report_html: body.reportHtml || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[AESO Share Report] Database error:', error);
      throw new Error(`Failed to create share link: ${error.message}`);
    }

    console.log('[AESO Share Report] Created share link:', shareToken);

    // Generate shareable URL - always use production domain for external sharing
    const shareUrl = `https://wattbyte.com/shared/aeso-report/${shareToken}`;

    return new Response(JSON.stringify({
      success: true,
      shareToken,
      shareUrl,
      expiresAt: body.expiresAt,
      maxViews: body.maxViews,
      hasPassword: !!body.password
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[AESO Share Report] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
