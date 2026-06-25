import { createClient } from 'jsr:@supabase/supabase-js@2';

import { corsHeaders } from "../_shared/cors.ts";

// Verify a PBKDF2 hash of the form "pbkdf2$<iter>$<base64-salt>$<base64-hash>"
// in constant time. Mirrors the verifier in validate-aeso-share so dashboard
// shares get the same protection. Plaintext "password_hash !== password" was
// the previous check (Audit-2026-06-25 P0).
async function verifyPbkdf2(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbkdf2$')) {
    // Legacy unsalted SHA-256 — keep constant-time-compared so a hash-format
    // upgrade doesn't break existing shares.
    const enc = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const hex = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    return constantTimeEqual(hex, stored);
  }
  const [, iterStr, saltB64, hashB64] = stored.split('$');
  const iter = parseInt(iterStr, 10);
  if (!Number.isFinite(iter) || iter < 1000 || iter > 5_000_000) return false;
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const target = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    key, target.byteLength * 8,
  );
  return constantTimeEqualBytes(new Uint8Array(bits), target);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function constantTimeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

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

    // Check password if required — PBKDF2 + constant-time compare (with
    // legacy SHA-256 fallback for older share rows).
    if (shareLink.password_hash) {
      if (typeof password !== 'string' || password.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const ok = await verifyPbkdf2(password, shareLink.password_hash);
      if (!ok) {
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
