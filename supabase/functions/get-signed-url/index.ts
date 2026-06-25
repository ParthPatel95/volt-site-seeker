import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

// get-signed-url
// Mints signed URLs for stored objects. Used by:
//   * the Secure Share viewer (PUBLIC, token-based) — must NOT require a JWT
//     because the viewer is anonymous by design.
//   * admin/internal flows that already carry a Supabase user JWT.
//
// Before this revision the function was an open relay: no auth, any bucket,
// any path. Anyone could POST a path and receive a signed URL for any object
// in storage. (Audit-2026-06-25 P0.)
//
// Authorization model now:
//   1. Bucket allowlist — only the buckets that actually exist are signable.
//   2. Either:
//      a. Authorization: Bearer <user JWT> resolves to a valid user — admin/
//         internal path, anything inside the allowlist is signable.
//      b. shareToken: <token> from a public share link — the requested
//         storage path MUST belong to a document reachable via that link's
//         document_id / bundle_id / folder_id graph. Verified server-side
//         against secure_documents joined through secure_links.
//   3. If neither is supplied, 401.

interface BatchPathRequest {
  storagePath: string;
  isVideo?: boolean;
  expiresIn?: number;
}

interface BatchUrlResult {
  storagePath: string;
  signedUrl: string | null;
  expiresIn: number;
  isVideo: boolean;
  error?: string;
}

// Only the buckets the product actually serves. Add new ones deliberately.
const ALLOWED_BUCKETS = new Set<string>([
  'secure-documents',
  'documents',
  'inventory-images',
  'listing-images',
  'profile-images',
  'voltmarket-documents',
  'voltmarket-images',
]);

const supabaseAdmin = (): SupabaseClient => createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

async function authenticateUser(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const { data } = await supabaseAdmin().auth.getUser(token);
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

// Given a share token, return the set of storage paths reachable through it.
// Empty set = invalid/expired/scoped to nothing.
async function pathsReachableByShareToken(token: string): Promise<Set<string>> {
  const sb = supabaseAdmin();
  const { data: link, error: linkErr } = await sb
    .from("secure_links")
    .select("id, document_id, bundle_id, folder_id, status, expires_at, max_views, current_views")
    .eq("token", token)
    .maybeSingle();
  if (linkErr || !link) return new Set();
  if (link.status && link.status !== "active") return new Set();
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) return new Set();
  if (link.max_views && link.current_views >= link.max_views) return new Set();

  const reachable = new Set<string>();

  // Single document
  if (link.document_id) {
    const { data: doc } = await sb
      .from("secure_documents").select("storage_path").eq("id", link.document_id).maybeSingle();
    if (doc?.storage_path) reachable.add(doc.storage_path);
  }

  // Bundle → documents
  if (link.bundle_id) {
    const { data: rows } = await sb
      .from("bundle_documents")
      .select("document_id, secure_documents!inner(storage_path)")
      .eq("bundle_id", link.bundle_id);
    for (const r of rows ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (r as any)?.secure_documents?.storage_path;
      if (p) reachable.add(p);
    }
  }

  // Folder (and descendants) → documents
  if (link.folder_id) {
    const allFolderIds = new Set<string>([link.folder_id]);
    let frontier: string[] = [link.folder_id];
    // BFS bounded so a pathological tree can't hang.
    for (let depth = 0; depth < 8 && frontier.length; depth++) {
      const { data: kids } = await sb
        .from("secure_folders").select("id, parent_folder_id")
        .in("parent_folder_id", frontier).eq("is_active", true);
      const next: string[] = [];
      for (const k of kids ?? []) {
        if (!allFolderIds.has(k.id)) { allFolderIds.add(k.id); next.push(k.id); }
      }
      frontier = next;
    }
    const { data: docs } = await sb
      .from("secure_documents").select("storage_path")
      .in("folder_id", Array.from(allFolderIds));
    for (const d of docs ?? []) if (d.storage_path) reachable.add(d.storage_path);
  }

  return reachable;
}

const unauthorized = (msg: string): Response => new Response(JSON.stringify({ error: msg }), {
  status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
});
const badRequest = (msg: string): Response => new Response(JSON.stringify({ error: msg }), {
  status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
});

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const bucketName = body.bucket ?? 'secure-documents';

    // 1. Bucket allowlist
    if (!ALLOWED_BUCKETS.has(bucketName)) {
      return badRequest(`bucket "${bucketName}" is not signable`);
    }

    // 2. Authorize via either user JWT or share token.
    const userId = await authenticateUser(req);
    const shareToken: string | undefined = body.shareToken;

    let allowedPaths: Set<string> | null = null; // null = unrestricted (user JWT)
    if (userId) {
      allowedPaths = null;
    } else if (typeof shareToken === "string" && shareToken.length > 0) {
      allowedPaths = await pathsReachableByShareToken(shareToken);
      if (allowedPaths.size === 0) {
        return unauthorized("share token is invalid, expired, or scoped to no documents");
      }
    } else {
      return unauthorized("provide an Authorization Bearer token or a shareToken");
    }

    // 3. Dispatch
    if (body.paths && Array.isArray(body.paths)) {
      return await handleBatchRequest(body.paths, bucketName, allowedPaths);
    }
    return await handleSingleRequest(body, bucketName, allowedPaths);
  } catch (error: unknown) {
    console.error("Error in get-signed-url:", error);
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

async function handleBatchRequest(
  paths: BatchPathRequest[],
  bucketName: string,
  allowedPaths: Set<string> | null,
): Promise<Response> {
  const startTime = Date.now();
  const sb = supabaseAdmin();
  const results: BatchUrlResult[] = [];
  let successCount = 0;

  for (const p of paths) {
    if (!p?.storagePath) {
      results.push({ storagePath: "", signedUrl: null, expiresIn: 0, isVideo: false, error: "missing storagePath" });
      continue;
    }
    if (allowedPaths && !allowedPaths.has(p.storagePath)) {
      results.push({ storagePath: p.storagePath, signedUrl: null, expiresIn: 0, isVideo: !!p.isVideo, error: "forbidden" });
      continue;
    }
    const expirySeconds = p.expiresIn ?? (p.isVideo ? 21600 : 3600);
    try {
      const { data, error } = await sb.storage.from(bucketName).createSignedUrl(p.storagePath, expirySeconds);
      if (error || !data?.signedUrl) {
        results.push({ storagePath: p.storagePath, signedUrl: null, expiresIn: expirySeconds, isVideo: !!p.isVideo, error: "sign failed" });
      } else {
        results.push({ storagePath: p.storagePath, signedUrl: data.signedUrl, expiresIn: expirySeconds, isVideo: !!p.isVideo });
        successCount++;
      }
    } catch {
      results.push({ storagePath: p.storagePath, signedUrl: null, expiresIn: expirySeconds, isVideo: !!p.isVideo, error: "sign error" });
    }
  }

  return new Response(JSON.stringify({
    signedUrls: results,
    totalRequested: paths.length,
    totalSuccess: successCount,
    processingTimeMs: Date.now() - startTime,
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      "Cache-Control": "public, max-age=300",
    },
  });
}

async function handleSingleRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  bucketName: string,
  allowedPaths: Set<string> | null,
): Promise<Response> {
  const filePath: string | undefined = body.path || body.storagePath;
  if (!filePath) return badRequest("storagePath is required");
  if (allowedPaths && !allowedPaths.has(filePath)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const isVideo = !!body.isVideo;
  const defaultExpiry = isVideo ? 21600 : 3600;
  const expirySeconds = body.expiresIn || defaultExpiry;
  const sb = supabaseAdmin();

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await sb.storage.from(bucketName).createSignedUrl(filePath, expirySeconds);
      if (error) {
        if (error.message?.includes('Unexpected token') || error.message?.includes('<html>')) {
          if (attempt < 3) { await new Promise(r => setTimeout(r, 500 * attempt)); continue; }
        }
        return new Response(JSON.stringify({ error: "sign failed" }), {
          status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({
        signedUrl: data.signedUrl, expiresIn: expirySeconds, isVideo,
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch {
      if (attempt < 3) await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }

  return new Response(JSON.stringify({ error: "sign failed after retries" }), {
    status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
