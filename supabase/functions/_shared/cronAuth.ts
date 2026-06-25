// requireCronOrService — the guard for edge functions invoked by pg_cron.
//
// pg_cron sends its requests through pg_net.http_post. Today those calls
// carry the project's anon JWT in the Authorization header, which is the
// same token any anonymous public visitor has — so "Authorization required"
// would NOT distinguish cron from public. Two cleanups land together:
//
//   1. The cron migration is rewritten to send an additional secret header
//      `X-Cron-Secret: <EDGE_CRON_SECRET>` on every scheduled invocation.
//      The secret is read from a Postgres setting (`app.cron_secret`) so it
//      doesn't live in source.
//
//   2. This guard accepts a request when EITHER:
//        * X-Cron-Secret matches EDGE_CRON_SECRET (cron path), OR
//        * Authorization Bearer is the service-role key (server-to-server,
//          e.g. another edge function or a manual ops invocation).
//      The public anon JWT, and any logged-in user, are REJECTED — these
//      endpoints aren't meant for user-driven access. (Audit-2026-06-25 PR4.)
//
// Constant-time comparison for the secret to avoid timing oracles.

import { corsHeaders } from "./cors.ts";

export type CronCaller = { kind: "cron" } | { kind: "service" };

const deny = (status = 401): Response =>
  new Response(JSON.stringify({ error: status === 401 ? "unauthenticated" : "forbidden" }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function requireCronOrService(req: Request): CronCaller | Response {
  // 1. Service role bearer — internal callers (orchestrators, edge-to-edge).
  const auth = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (auth?.startsWith("Bearer ") && serviceKey) {
    if (constantTimeEqual(auth.slice(7), serviceKey)) {
      return { kind: "service" };
    }
  }

  // 2. Cron secret header.
  const provided = req.headers.get("X-Cron-Secret") ?? "";
  const expected = Deno.env.get("EDGE_CRON_SECRET") ?? "";
  if (expected.length > 0 && constantTimeEqual(provided, expected)) {
    return { kind: "cron" };
  }

  return deny(401);
}
