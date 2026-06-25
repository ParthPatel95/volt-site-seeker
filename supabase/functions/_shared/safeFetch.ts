// SSRF guard. Several edge functions accept a user-supplied URL and fetch it
// server-side (to OCR a doc, translate a PDF, etc.). Without this guard the
// caller could point the function at http://169.254.169.254/ (cloud metadata),
// at internal services on the Supabase VPC, or at file:// (some runtimes).
//
// Allowlist policy: only the project's own Supabase storage CDN host. Add to
// this list deliberately if a legitimate new external source shows up.
//
// (Audit-2026-06-25 P0.)

function projectHost(): string | null {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) return null;
  try { return new URL(url).host; } catch { return null; }
}

const STATIC_ALLOWED_SUFFIXES = [
  ".supabase.co",
  ".supabase.in",
];

export function isAllowedFetchUrl(input: string): boolean {
  let parsed: URL;
  try { parsed = new URL(input); } catch { return false; }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.host.toLowerCase();
  if (STATIC_ALLOWED_SUFFIXES.some(s => host.endsWith(s))) return true;
  const ph = projectHost();
  if (ph && host === ph) return true;
  return false;
}

export function rejectIfUnsafe(url: unknown, corsHeaders: Record<string, string>): Response | null {
  if (typeof url !== "string" || !isAllowedFetchUrl(url)) {
    return new Response(JSON.stringify({
      error: "forbidden_url",
      detail: "documentUrl must be a Supabase storage URL",
    }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return null;
}
