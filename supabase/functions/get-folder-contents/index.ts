import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing secure link token" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: link, error: linkError } = await supabaseAdmin
      .from("secure_links")
      .select("id, folder_id, status, expires_at, created_by")
      .eq("link_token", token)
      .single();

    if (linkError || !link) {
      console.error("get-folder-contents: link error", linkError);
      return new Response(
        JSON.stringify({ error: "Secure link not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!link.folder_id) {
      return new Response(
        JSON.stringify({ error: "Link is not associated with a folder" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (
      link.status === "revoked" ||
      link.status === "expired" ||
      (link.expires_at && new Date(link.expires_at) < new Date())
    ) {
      return new Response(
        JSON.stringify({ error: "This link is no longer active" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const { data: allFolders, error: foldersError } = await supabaseAdmin
      .from("secure_folders")
      .select("*")
      .eq("created_by", link.created_by)
      .eq("is_active", true);

    if (foldersError || !allFolders) {
      console.error("get-folder-contents: folders error", foldersError);
      return new Response(
        JSON.stringify({ error: "Failed to load folders" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const folderMap = new Map<string, any>();
    for (const folder of allFolders) {
      folderMap.set(folder.id, folder);
    }

    const rootFolder = folderMap.get(link.folder_id);
    if (!rootFolder) {
      return new Response(
        JSON.stringify({ error: "Shared folder not found or inactive" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const descendantIds = new Set<string>();
    const queue: string[] = [link.folder_id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (descendantIds.has(currentId)) continue;
      descendantIds.add(currentId);

      for (const folder of allFolders) {
        if (folder.parent_folder_id === currentId) {
          queue.push(folder.id);
        }
      }
    }

    const descendantFolders = allFolders.filter((f) =>
      descendantIds.has(f.id),
    );

    const { data: documents, error: docsError } = await supabaseAdmin
      .from("secure_documents")
      .select("*")
      .in("folder_id", Array.from(descendantIds))
      .eq("is_active", true);

    if (docsError) {
      console.error("get-folder-contents: documents error", docsError);
      return new Response(
        JSON.stringify({ error: "Failed to load documents" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    return new Response(
      JSON.stringify({
        rootFolder,
        folders: descendantFolders,
        documents: documents ?? [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("Error in get-folder-contents function:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Unexpected error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
