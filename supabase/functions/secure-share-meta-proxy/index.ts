import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

import { corsHeaders } from "../_shared/cors.ts";
import { errorResponse } from '../_shared/http.ts';
import { enforceRateLimit } from '../_shared/rateLimit.ts';

// HTML and JS-string escapers used to render the meta-tag preamble safely.
// Without them the token + share title/description (both reflected from the
// request / DB) get interpolated straight into <meta content="..."> and into
// a <script>window.location.href = '...'</script> string, where an
// attacker-shaped value can break out of the attribute / string context and
// inject markup or JS. (Audit-2026-06-25 P0.)
function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function jsEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\r?\n/g, '\\n');
}
// Tokens we mint are url-safe alphanumeric. An out-of-shape token can't map
// to a real share — reject before interpolating it anywhere.
const SAFE_TOKEN_RE = /^[A-Za-z0-9_-]{8,128}$/;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Abuse guard: cap meta-proxy fetches per IP.
  const limited = await enforceRateLimit(req, { name: 'secure-share-meta-proxy', max: 30, windowSeconds: 60, corsHeaders });
  if (limited) return limited;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];
    
    if (!token || !SAFE_TOKEN_RE.test(token)) {
      return new Response('Invalid share token', { status: 400, headers: corsHeaders });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    // Detect social media crawlers and sharing scenarios
    const isCrawler = /bot|crawler|spider|crawling|WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|SkypeUriPreview|pinterest|instagram|discord/i.test(userAgent);
    const isSharingScenario = /WhatsApp|facebook|twitter|linkedin|telegram|slack|pinterest|instagram|discord/i.test(referer.toLowerCase());

    console.log('Request details:', {
      token,
      userAgent,
      referer,
      isCrawler,
      isSharingScenario,
    });

    // If it's not a crawler or sharing scenario, redirect to the actual page
    if (!isCrawler && !isSharingScenario) {
      const actualUrl = `${url.origin}/view/${token}`;
      return Response.redirect(actualUrl, 302);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to fetch share details for better meta tags
    let shareTitle = 'WattByte Infrastructure Company - Secure Document Sharing';
    let shareDescription = 'View shared documents from WattByte Infrastructure Company';
    let shareImage = `${url.origin}/og-image.png`;

    try {
      // Fetch share details
      const { data: shareData } = await supabase
        .from('secure_shares')
        .select(`
          id,
          created_at,
          documents:secure_documents(file_name, file_type),
          folders:secure_folders(folder_name)
        `)
        .eq('share_token', token)
        .single();

      if (shareData) {
        // Customize meta tags based on share content
        if (shareData.folders) {
          shareTitle = `${shareData.folders.folder_name} - WattByte Shared Folder`;
          shareDescription = 'Secure folder shared from WattByte Infrastructure Company';
        } else if (shareData.documents && shareData.documents.length > 0) {
          const doc = shareData.documents[0];
          shareTitle = `${doc.file_name} - WattByte Shared Document`;
          shareDescription = `View ${doc.file_type.toUpperCase()} document shared from WattByte Infrastructure Company`;
        }
      }
    } catch (error) {
      console.error('Error fetching share details:', error);
      // Continue with default meta tags
    }

    // Escape every interpolation. Token is shape-checked above, but we still
    // run it through both encoders defensively in case the regex ever loosens.
    const tH = htmlEscape(token);
    const tJ = jsEscape(token);
    const oH = htmlEscape(url.origin);
    const oJ = jsEscape(url.origin);
    const titleH = htmlEscape(shareTitle);
    const descH = htmlEscape(shareDescription);
    const imgH = htmlEscape(shareImage);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleH}</title>
  <meta name="description" content="${descH}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${oH}/view/${tH}">
  <meta property="og:title" content="${titleH}">
  <meta property="og:description" content="${descH}">
  <meta property="og:image" content="${imgH}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="WattByte Infrastructure Company">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${oH}/view/${tH}">
  <meta name="twitter:title" content="${titleH}">
  <meta name="twitter:description" content="${descH}">
  <meta name="twitter:image" content="${imgH}">

  <!-- Redirect for non-crawler requests -->
  <meta http-equiv="refresh" content="0; url=${oH}/view/${tH}">
  <script>
    // JavaScript redirect as fallback
    window.location.href = '${oJ}/view/${tJ}';
  </script>
</head>
<body>
  <p>Redirecting to shared content...</p>
  <p>If you are not redirected automatically, <a href="${oH}/view/${tH}">click here</a>.</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    return errorResponse(error, corsHeaders, { status: 500, context: 'secure-share-meta-proxy' });
  }
});
