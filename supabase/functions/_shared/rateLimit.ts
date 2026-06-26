// Per-identifier rate limiting for public edge functions. (Audit-2026-06-26.)
//
// Usage — right after the OPTIONS/preflight handling, before any real work:
//
//   import { enforceRateLimit } from "../_shared/rateLimit.ts";
//   const limited = await enforceRateLimit(req, {
//     name: 'notify-consulting-inquiry', max: 5, windowSeconds: 60, corsHeaders,
//   });
//   if (limited) return limited;   // 429 already built
//
// Design notes:
//   * Backed by the `check_rate_limit` SQL function + `rate_limits` table
//     (migration 20260626000000). Fixed-window counter keyed by
//     `${name}:${identifier}`.
//   * Identifier defaults to the client IP (X-Forwarded-For first hop). Pass
//     `identifier` to key on something else (e-mail, token, user id).
//   * FAILS OPEN. If the RPC errors for any reason — most importantly if the
//     migration has not been applied yet — the request is ALLOWED and the
//     problem is logged. A rate limiter must never take the site down.
//   * Creates its own cached service-role client so wiring a function up is a
//     single call with no extra plumbing.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

let _client: SupabaseClient | null = null;

function client(): SupabaseClient | null {
  if (_client) return _client;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

/** Best-effort client IP from the usual proxy headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

interface RateLimitOptions {
  /** Stable function name — namespaces the bucket so functions don't share counts. */
  name: string;
  /** Max requests allowed within the window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
  /** CORS headers to attach to the 429 response. */
  corsHeaders: Record<string, string>;
  /** Override the per-caller identifier (defaults to client IP). */
  identifier?: string;
}

/**
 * Returns a ready-to-return 429 Response when the caller is over the limit,
 * or null when the request should proceed. Never throws; fails open.
 */
export async function enforceRateLimit(
  req: Request,
  opts: RateLimitOptions,
): Promise<Response | null> {
  try {
    const sb = client();
    if (!sb) return null; // no service-role creds → cannot check, allow.

    const id = opts.identifier ?? getClientIp(req);
    const key = `${opts.name}:${id}`;

    const { data, error } = await sb.rpc("check_rate_limit", {
      p_key: key,
      p_max: opts.max,
      p_window_seconds: opts.windowSeconds,
    });

    if (error) {
      // Most likely the migration is not applied yet. Allow, but log.
      console.error("[rateLimit] check failed, allowing request:", error.message);
      return null;
    }

    if (data === false) {
      return new Response(
        JSON.stringify({ error: "Too many requests", code: "rate_limited" }),
        {
          status: 429,
          headers: {
            ...opts.corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(opts.windowSeconds),
          },
        },
      );
    }

    return null;
  } catch (e) {
    console.error("[rateLimit] unexpected error, allowing request:", e);
    return null; // fail open
  }
}
