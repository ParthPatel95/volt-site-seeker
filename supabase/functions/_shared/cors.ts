// Shared CORS utilities for Supabase edge functions.
//
// Two exports:
//   `corsHeaders`         - legacy wildcard headers, kept for non-sensitive
//                           public endpoints. Still set `Vary: Origin`.
//   `buildCorsHeaders(req)` - origin-checked headers for sensitive endpoints
//                             (anything that returns secrets, accepts auth, or
//                             mutates data). Echoes the request origin only if
//                             it matches the allowlist from the
//                             ALLOWED_ORIGINS env var (comma-separated).
//
// Configure ALLOWED_ORIGINS in the Supabase project secrets, e.g.
//   ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
// During local dev, http://localhost:5173 and http://localhost:8080 are
// allowed automatically.

const DEV_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
]);

function getAllowlist(): Set<string> {
  const raw = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  const configured = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...configured, ...DEV_ORIGINS]);
}

const BASE_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

export const corsHeaders: Record<string, string> = {
  ...BASE_HEADERS,
  'Access-Control-Allow-Origin': '*',
};

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowlist = getAllowlist();
  const allowed = allowlist.has(origin) ? origin : '';
  return {
    ...BASE_HEADERS,
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  return getAllowlist().has(origin);
}
