import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { buildCorsHeaders } from "../_shared/cors.ts";

interface ShareReportRequest {
  reportData: unknown;
  reportConfig: { exportType?: string } | null;
  reportHtml?: string;
  title?: string;
  password?: string;
  expiresAt?: string;
  maxViews?: number;
}

const MAX_REPORT_HTML_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_TITLE_LEN = 200;
const PBKDF2_ITERATIONS = 210_000;

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function generateShareToken(): string {
  // 24 random bytes -> 32-char base64url, ~192 bits of entropy
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    256
  );
  const hash = new Uint8Array(bits);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

function isValidIso(date: string): boolean {
  const t = Date.parse(date);
  return Number.isFinite(t) && t > Date.now();
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require authentication. Previously this function permitted anonymous
    // creation of shareable reports containing arbitrary HTML.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.slice('Bearer '.length);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = user.id;

    const body = await req.json() as ShareReportRequest;

    if (typeof body.reportHtml === 'string' && body.reportHtml.length > MAX_REPORT_HTML_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'reportHtml too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const title = (body.title ?? 'AESO Analysis Report').toString().slice(0, MAX_TITLE_LEN);

    if (body.expiresAt && !isValidIso(body.expiresAt)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid expiresAt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    let maxViews: number | null = null;
    if (body.maxViews !== undefined && body.maxViews !== null) {
      const n = Number(body.maxViews);
      if (!Number.isInteger(n) || n < 1 || n > 100_000) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid maxViews' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      maxViews = n;
    }

    const shareToken = generateShareToken();
    const passwordHash = body.password ? await hashPassword(body.password) : null;
    const reportType = body.reportConfig?.exportType === 'comprehensive' ? 'comprehensive' : 'single';

    const { data, error } = await supabase
      .from('shared_aeso_reports')
      .insert({
        created_by: userId,
        share_token: shareToken,
        title,
        password_hash: passwordHash,
        expires_at: body.expiresAt || null,
        max_views: maxViews,
        report_type: reportType,
        report_data: body.reportData,
        report_config: body.reportConfig,
        report_html: body.reportHtml || null,
        status: 'active',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[AESO Share Report] DB insert failed:', error?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create share link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'https://wattbyte.com';
    const shareUrl = `${baseUrl.replace(/\/$/, '')}/shared/aeso-report/${shareToken}`;

    return new Response(JSON.stringify({
      success: true,
      shareToken,
      shareUrl,
      expiresAt: body.expiresAt ?? null,
      maxViews,
      hasPassword: !!body.password,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[AESO Share Report] Error:', error instanceof Error ? error.message : 'unknown');
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
