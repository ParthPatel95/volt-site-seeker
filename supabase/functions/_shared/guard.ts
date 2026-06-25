// requireUserOrService — the guard for paid-API / data-collection functions.
//
// These functions are reached two legitimate ways:
//   1. Directly from the authenticated web app (the caller's user JWT).
//   2. Server-to-server from another edge function — e.g. scraping-
//      orchestrator invoking a scanner — which carries the SERVICE_ROLE key
//      as its bearer token.
//
// Both must be allowed; an anonymous public caller (no token, or the public
// anon key) must NOT be — otherwise anyone with the function URL can burn
// your OpenAI / Firecrawl / Google / Sentinel credits. (Audit-2026-06-25
// PR3.)
//
// Usage:
//   const gate = await requireUserOrService(req, sb);            // any user or service
//   const gate = await requireUserOrService(req, sb, { adminOnly: true });
//   if (gate instanceof Response) return gate;
//   if (gate.kind === 'user') { /* gate.userId */ }

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "./cors.ts";

export type Caller = { kind: "service" } | { kind: "user"; userId: string };

const deny = (msg: string, status: number): Response =>
  new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export async function requireUserOrService(
  req: Request,
  sb: SupabaseClient,
  opts: { adminOnly?: boolean } = {},
): Promise<Caller | Response> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return deny("unauthenticated", 401);
  const token = auth.slice(7);

  // Service-role token → trusted internal caller (orchestrator, cron-with-
  // service-key, other edge functions). The service-role key is already a
  // god credential, so a function that trusts it is no weaker than the rest
  // of the system.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && token === serviceKey) return { kind: "service" };

  // Otherwise it must resolve to a real user (the public anon key does NOT,
  // which is the whole point — it has no user behind it).
  try {
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user?.id) return deny("unauthenticated", 401);
    if (opts.adminOnly) {
      const { data: isAdmin } = await sb.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (isAdmin !== true) return deny("forbidden", 403);
    }
    return { kind: "user", userId: data.user.id };
  } catch {
    return deny("unauthenticated", 401);
  }
}

// Standalone variant for pure API-proxy functions that don't otherwise need
// a Supabase client. Builds a throwaway service-role client just for the
// token check. Same accept rules as requireUserOrService.
let _client: SupabaseClient | null = null;
function sharedClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
  }
  return _client;
}

export function requireCaller(
  req: Request,
  opts: { adminOnly?: boolean } = {},
): Promise<Caller | Response> {
  return requireUserOrService(req, sharedClient(), opts);
}
