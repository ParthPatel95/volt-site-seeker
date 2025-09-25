import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Enable CORS for all requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get('listingId');
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    
    console.log('Meta-proxy request:', { 
      listingId, 
      userAgent, 
      referer,
      method: req.method,
      url: req.url 
    });
    
    if (!listingId) {
      console.log('Missing listing ID, returning 400');
      return new Response('Missing listing ID', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Check for debug mode or force mode
    const debug = url.searchParams.get('debug') === 'true';
    const force = url.searchParams.get('force') === 'true';
    
    // Enhanced crawler detection - be more aggressive about serving meta tags
    const isCrawler = /facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|telegrambot|whatsapp|bot|crawler|spider|slurp|facebot|ia_archiver|WhatsApp|facebook|preview|meta|social|share/i.test(userAgent);
    
    // Also serve meta tags for any request that looks like it might be for sharing
    const hasShareIndicators = referer.includes('facebook') || 
                              referer.includes('whatsapp') || 
                              referer.includes('telegram') || 
                              referer.includes('linkedin') ||
                              url.searchParams.has('utm_source');
    
    // Always serve meta tags for social media requests by default (this is the key fix)
    const shouldServeMeta = isCrawler || debug || hasShareIndicators || force || true; // Force serving meta tags for all requests
    
    console.log('Request analysis:', { 
      isCrawler, 
      hasShareIndicators, 
      debug,
      force,
      userAgent,
      referer,
      shouldServeMeta
    });
    
    // Only redirect regular browser requests if explicitly not a sharing context
    if (!shouldServeMeta) {
      console.log('Regular browser request, redirecting to actual listing');
      const actualUrl = `https://9fe0623a-4080-437c-aca0-ba8b38e9d029.lovableproject.com/voltmarket/listings/${listingId}`;
      return new Response(null, {
        status: 302,
        headers: {
          'Location': actualUrl,
          ...corsHeaders,
        }
      });
    }
    
    console.log('Serving meta tags for crawler or debug mode');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch listing data
    const { data: listing, error: listingError } = await supabase
      .from('voltmarket_listings')
      .select('*')
      .eq('id', listingId)
      .maybeSingle();

    console.log('Listing fetch result:', { listing: !!listing, error: listingError });

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return new Response('Error fetching listing', { status: 500 });
    }

    if (!listing) {
      return new Response('Listing not found', { status: 404 });
    }

    // Fetch first image
    const { data: images } = await supabase
      .from('voltmarket_listing_images')
      .select('image_url')
      .eq('listing_id', listingId)
      .order('sort_order', { ascending: true })
      .limit(1);

    console.log('Images fetch result:', { imageCount: images?.length || 0 });

    const imageUrl = images && images.length > 0 ? images[0].image_url : null;
    let fullImageUrl = 'https://9fe0623a-4080-437c-aca0-ba8b38e9d029.lovableproject.com/placeholder.svg';
    
    if (imageUrl) {
      if (imageUrl.startsWith('https://ktgosplhknmnyagxrgbe.supabase.co/storage/v1/object/public/')) {
        // Supabase storage URL - use as is
        fullImageUrl = imageUrl;
      } else if (imageUrl.startsWith('http')) {
        // Already a full URL
        fullImageUrl = imageUrl;
      } else if (imageUrl.startsWith('/')) {
        // Relative URL from domain root
        fullImageUrl = `https://9fe0623a-4080-437c-aca0-ba8b38e9d029.lovableproject.com${imageUrl}`;
      } else {
        // Other formats - treat as Supabase storage
        fullImageUrl = imageUrl.includes('supabase.co') ? imageUrl : `https://9fe0623a-4080-437c-aca0-ba8b38e9d029.lovableproject.com/${imageUrl}`;
      }
    }
    
    console.log('Image processing:', { originalImageUrl: imageUrl, finalImageUrl: fullImageUrl });

    // Clean description for HTML
    const cleanDescription = (listing.description || 'Power infrastructure listing').replace(/"/g, '&quot;').replace(/\n/g, ' ').substring(0, 160);
    const priceDisplay = listing.asking_price ? `$${listing.asking_price.toLocaleString()}` : 'Contact for Price';
    const powerInfo = listing.power_capacity_mw && listing.power_capacity_mw > 0 ? ` | ${listing.power_capacity_mw}MW` : '';
    const shareTitle = `${listing.title} - ${priceDisplay} | VoltMarket`.replace(/"/g, '&quot;');
    const shareDescription = `${cleanDescription} | ${listing.location}${powerInfo}`;
    const actualUrl = `https://9fe0623a-4080-437c-aca0-ba8b38e9d029.lovableproject.com/voltmarket/listings/${listingId}`;

    console.log('Generated meta data:', { shareTitle, shareDescription, fullImageUrl, actualUrl });

    // Generate HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shareTitle}</title>
  
  <!-- Basic Meta Tags -->
  <meta name="description" content="${shareDescription}">
  
  <!-- Open Graph Tags -->
  <meta property="og:title" content="${shareTitle}">
  <meta property="og:description" content="${shareDescription}">
  <meta property="og:image" content="${fullImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${actualUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="VoltMarket">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${shareTitle}">
  <meta name="twitter:description" content="${shareDescription}">
  <meta name="twitter:image" content="${fullImageUrl}">
  
  <!-- Redirect immediately for browsers -->
  <meta http-equiv="refresh" content="0; url=${actualUrl}">
  <script>
    // Immediate redirect for browsers that support JavaScript
    if (typeof window !== 'undefined') {
      window.location.href = '${actualUrl}';
    }
  </script>
</head>
<body>
  <h1>${listing.title}</h1>
  <p>${cleanDescription}</p>
  <p>Redirecting to full listing...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': debug ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
        ...(debug && { 'Pragma': 'no-cache' }),
        ...(debug && { 'Expires': '0' }),
      },
    });

  } catch (error) {
    console.error('Error in meta-proxy:', error);
    return new Response('Internal server error', { status: 500 });
  }
});