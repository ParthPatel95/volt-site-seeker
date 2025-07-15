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
    
    console.log('Meta-proxy request:', { listingId, userAgent });
    
    if (!listingId) {
      return new Response('Missing listing ID', { status: 400 });
    }

    // Check if it's a social media crawler
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|telegrambot|whatsapp|bot|crawler|spider/i.test(userAgent);
    console.log('Is crawler:', isCrawler);

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
      if (imageUrl.startsWith('http')) {
        fullImageUrl = imageUrl;
      } else if (imageUrl.startsWith('/')) {
        fullImageUrl = `https://9fe0623a-4080-437c-aca0-ba8b38e9d029.lovableproject.com${imageUrl}`;
      }
    }

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
  
  <!-- Redirect immediately -->
  <meta http-equiv="refresh" content="0; url=${actualUrl}">
</head>
<body>
  <p>Redirecting to listing...</p>
  <script>
    window.location.href = '${actualUrl}';
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