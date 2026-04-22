import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { buildCorsHeaders } from "../_shared/cors.ts";

interface ValidateRequest {
  token: string;
  password?: string;
  viewerName?: string;
  viewerEmail?: string;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function legacySha256Hex(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith('pbkdf2$')) {
    const [, iterStr, saltB64, hashB64] = stored.split('$');
    const iterations = Number(iterStr);
    if (!Number.isFinite(iterations) || iterations < 1) return false;
    const salt = base64ToBytes(saltB64);
    const expected = base64ToBytes(hashB64);
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      baseKey,
      expected.length * 8
    );
    return constantTimeEquals(new Uint8Array(bits), expected);
  }
  // Backward compat: legacy unsalted SHA-256 hex
  const candidate = await legacySha256Hex(password);
  const a = new TextEncoder().encode(candidate);
  const b = new TextEncoder().encode(stored);
  return constantTimeEquals(a, b);
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

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

      const ok = await verifyPassword(body.password, report.password_hash);
      if (!ok) {
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
      console.log('[Validate AESO Share] Viewer info required, returning form prompt');
      const response = {
        valid: false,
        requiresViewerInfo: true,
        title: report.title,
        requiresPassword: !!report.password_hash
      };
      console.log('[Validate AESO Share] Response:', JSON.stringify(response));
      return new Response(JSON.stringify(response), {
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
    console.error('[Validate AESO Share] Error:', error instanceof Error ? error.message : 'unknown');
    return new Response(JSON.stringify({
      valid: false,
      error: 'Internal error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
