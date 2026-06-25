// Shared auth helpers for edge functions.
//
// requireUser(req, sb) — verifies the Authorization Bearer token and returns
//   the user_id, or returns a Response (401) the caller can return directly.
// requireAdmin(req, sb) — additionally checks public.has_role(user_id, 'admin').
//
// Usage pattern:
//   const gate = await requireAdmin(req, sb);
//   if (gate instanceof Response) return gate;
//   const { userId } = gate;
//
// Keeping these in one file means a security regression (e.g. forgetting to
// check role) is a single grep instead of fifty.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "./cors.ts";

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export async function requireUser(
  req: Request,
  sb: SupabaseClient,
): Promise<{ userId: string } | Response> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json({ error: "unauthenticated" }, 401);
  try {
    const { data, error } = await sb.auth.getUser(auth.slice(7));
    if (error || !data?.user?.id) return json({ error: "unauthenticated" }, 401);
    return { userId: data.user.id };
  } catch {
    return json({ error: "unauthenticated" }, 401);
  }
}

export async function requireAdmin(
  req: Request,
  sb: SupabaseClient,
): Promise<{ userId: string } | Response> {
  const gate = await requireUser(req, sb);
  if (gate instanceof Response) return gate;
  // public.has_role(uuid, app_role) is the canonical admin check.
  try {
    const { data, error } = await sb.rpc("has_role", {
      _user_id: gate.userId,
      _role: "admin",
    });
    if (error || data !== true) return json({ error: "forbidden" }, 403);
  } catch {
    return json({ error: "forbidden" }, 403);
  }
  return gate;
}
