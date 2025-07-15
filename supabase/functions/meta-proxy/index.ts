import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get('listingId');
    const userAgent = req.headers.get('user-agent') || '';
    
    // Check if it's a social media crawler
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|telegrambot|whatsapp/i.test(userAgent);
    
    if (!isCrawler || !listingId) {
      return new Response('Not a crawler or missing listing ID', { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch listing data
    const { data: listing } = await supabase
      .from('voltmarket_listings')
      .select('*')
      .eq('id', listingId)
      .single();

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

    const imageUrl = images && images.length > 0 ? images[0].image_url : '/wattbyte-logo.png';
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${supabaseUrl.replace('/rest/v1', '')}${imageUrl}`;

    // Generate HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${listing.title} - ${listing.asking_price ? `$${listing.asking_price.toLocaleString()}` : 'Contact for Price'} | VoltMarket</title>
  
  <!-- Basic Meta Tags -->
  <meta name="description" content="${listing.description?.substring(0, 160) || 'Power infrastructure listing'} | ${listing.location}${listing.power_capacity_mw > 0 ? ` | ${listing.power_capacity_mw}MW` : ''}">
  
  <!-- Open Graph Tags -->
  <meta property="og:title" content="${listing.title} - ${listing.asking_price ? `$${listing.asking_price.toLocaleString()}` : 'Contact for Price'} | VoltMarket">
  <meta property="og:description" content="${listing.description?.substring(0, 160) || 'Power infrastructure listing'} | ${listing.location}${listing.power_capacity_mw > 0 ? ` | ${listing.power_capacity_mw}MW` : ''}">
  <meta property="og:image" content="${fullImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${req.url.replace('/functions/v1/meta-proxy', '')}/voltmarket/listings/${listingId}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="VoltMarket">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${listing.title} - ${listing.asking_price ? `$${listing.asking_price.toLocaleString()}` : 'Contact for Price'} | VoltMarket">
  <meta name="twitter:description" content="${listing.description?.substring(0, 160) || 'Power infrastructure listing'} | ${listing.location}${listing.power_capacity_mw > 0 ? ` | ${listing.power_capacity_mw}MW` : ''}">
  <meta name="twitter:image" content="${fullImageUrl}">
  
  <!-- Telegram specific -->
  <meta property="telegram:channel" content="@voltmarket">
  
  <meta http-equiv="refresh" content="0; url=/voltmarket/listings/${listingId}">
</head>
<body>
  <p>Redirecting to listing...</p>
  <script>
    window.location.href = '/voltmarket/listings/${listingId}';
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error in meta-proxy:', error);
    return new Response('Internal server error', { status: 500 });
  }
});