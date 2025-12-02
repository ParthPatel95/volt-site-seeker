import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];
    
    if (!token) {
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

    // Return HTML with proper meta tags for social media crawlers
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shareTitle}</title>
  <meta name="description" content="${shareDescription}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.origin}/view/${token}">
  <meta property="og:title" content="${shareTitle}">
  <meta property="og:description" content="${shareDescription}">
  <meta property="og:image" content="${shareImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="WattByte Infrastructure Company">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url.origin}/view/${token}">
  <meta name="twitter:title" content="${shareTitle}">
  <meta name="twitter:description" content="${shareDescription}">
  <meta name="twitter:image" content="${shareImage}">
  
  <!-- Redirect for non-crawler requests -->
  <meta http-equiv="refresh" content="0; url=${url.origin}/view/${token}">
  <script>
    // JavaScript redirect as fallback
    window.location.href = '${url.origin}/view/${token}';
  </script>
</head>
<body>
  <p>Redirecting to shared content...</p>
  <p>If you are not redirected automatically, <a href="${url.origin}/view/${token}">click here</a>.</p>
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
    console.error('Error in secure-share-meta-proxy:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
