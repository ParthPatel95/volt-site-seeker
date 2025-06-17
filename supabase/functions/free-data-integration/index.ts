import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FreeDataRequest {
  source: 'county_records' | 'google_places' | 'yelp' | 'openstreetmap' | 'census' | 'auction_com' | 'biggerpockets' | 'public_auctions';
  location: string;
  property_type?: string;
  radius?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: FreeDataRequest = await req.json();
    console.log('Free data integration request:', request);

    let data;
    switch (request.source) {
      case 'google_places':
        data = await fetchGooglePlaces(request);
        break;
      case 'yelp':
        data = await fetchYelpData(request);
        break;
      case 'openstreetmap':
        data = await fetchOpenStreetMapData(request);
        break;
      case 'census':
        data = await fetchCensusData(request);
        break;
      case 'county_records':
        data = await fetchCountyRecords(request);
        break;
      case 'auction_com':
        data = await scrapeAuctionCom(request);
        break;
      case 'biggerpockets':
        data = await scrapeBiggerPockets(request);
        break;
      case 'public_auctions':
        data = await scrapePublicAuctions(request);
        break;
      default:
        throw new Error('Unknown data source');
    }

    // Store successful results in our database
    if (data.properties && data.properties.length > 0) {
      await storeScrapedProperties(supabase, data.properties, request.source);
    }

    return new Response(JSON.stringify({
      success: true,
      source: request.source,
      properties_found: data.properties?.length || 0,
      properties: data.properties || [],
      message: data.message || 'Data retrieved successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Free data integration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      properties_found: 0,
      message: 'Failed to retrieve data from free sources'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

async function scrapeAuctionCom(request: FreeDataRequest) {
  try {
    console.log('Scraping Auction.com for:', request.location);
    
    const searchUrl = `https://www.auction.com/search?location=${encodeURIComponent(request.location)}&asset_type=real_estate&status=upcoming`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.auction.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      console.log(`Auction.com returned status: ${response.status}`);
      return { properties: [], message: 'Auction.com returned an error response' };
    }

    const html = await response.text();
    console.log(`Auction.com HTML length: ${html.length}`);

    // Parse HTML to extract property listings
    const properties = parseAuctionComHTML(html, request.location);

    return {
      properties,
      message: `Found ${properties.length} auction properties from Auction.com`
    };
  } catch (error) {
    console.error('Auction.com scraping error:', error);
    return { properties: [], message: `Auction.com scraping failed: ${error.message}` };
  }
}

async function scrapeBiggerPockets(request: FreeDataRequest) {
  try {
    console.log('Scraping BiggerPockets for:', request.location);
    
    const searchUrl = `https://www.biggerpockets.com/search/properties?location=${encodeURIComponent(request.location)}&property_type=commercial`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.biggerpockets.com/',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.log(`BiggerPockets returned status: ${response.status}`);
      return { properties: [], message: 'BiggerPockets returned an error response' };
    }

    const html = await response.text();
    console.log(`BiggerPockets HTML length: ${html.length}`);

    // Parse HTML to extract property listings
    const properties = parseBiggerPocketsHTML(html, request.location);

    return {
      properties,
      message: `Found ${properties.length} investment properties from BiggerPockets`
    };
  } catch (error) {
    console.error('BiggerPockets scraping error:', error);
    return { properties: [], message: `BiggerPockets scraping failed: ${error.message}` };
  }
}

async function scrapePublicAuctions(request: FreeDataRequest) {
  try {
    console.log('Scraping public auction sites for:', request.location);
    
    // Try multiple public auction sites
    const sites = [
      'https://www.publicsurplus.com/sms/browse/cataucs',
      'https://www.govdeals.com/index.cfm?fa=Main.AdvSearchResultsNew',
      'https://bid.txauction.com/index.cfm?fa=Main.AdvSearchResultsNew'
    ];

    let allProperties = [];
    
    for (const siteUrl of sites) {
      try {
        const response = await fetch(`${siteUrl}?location=${encodeURIComponent(request.location)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          }
        });

        if (response.ok) {
          const html = await response.text();
          const properties = parsePublicAuctionHTML(html, request.location, siteUrl);
          allProperties.push(...properties);
        }
      } catch (siteError) {
        console.log(`Failed to scrape ${siteUrl}:`, siteError.message);
      }
    }

    return {
      properties: allProperties,
      message: `Found ${allProperties.length} properties from public auction sites`
    };
  } catch (error) {
    console.error('Public auction scraping error:', error);
    return { properties: [], message: `Public auction scraping failed: ${error.message}` };
  }
}

function parseAuctionComHTML(html: string, location: string) {
  const properties = [];
  
  try {
    // Look for common auction.com patterns
    const listingRegex = /<div[^>]*class="[^"]*auction-item[^"]*"[^>]*>(.*?)<\/div>/gs;
    const addressRegex = /<span[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/span>/s;
    const priceRegex = /\$[\d,]+/g;
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/g;

    let match;
    while ((match = listingRegex.exec(html)) !== null && properties.length < 20) {
      const listingHtml = match[1];
      
      const addressMatch = addressRegex.exec(listingHtml);
      const priceMatches = listingHtml.match(priceRegex);
      const dateMatches = listingHtml.match(dateRegex);
      
      if (addressMatch) {
        const address = addressMatch[1].replace(/<[^>]*>/g, '').trim();
        const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
        const auctionDate = dateMatches ? dateMatches[0] : null;
        
        properties.push({
          address: address,
          city: extractLocationCity(location),
          state: extractLocationState(location),
          zip_code: '',
          property_type: 'foreclosure',
          source: 'auction_com',
          listing_url: 'https://www.auction.com/',
          description: `Foreclosure auction property - ${address}`,
          square_footage: null,
          asking_price: price,
          lot_size_acres: null,
          auction_date: auctionDate,
          auction_type: 'foreclosure'
        });
      }
    }
  } catch (error) {
    console.error('Error parsing Auction.com HTML:', error);
  }
  
  return properties;
}

function parseBiggerPocketsHTML(html: string, location: string) {
  const properties = [];
  
  try {
    // Look for BiggerPockets property listing patterns
    const listingRegex = /<div[^>]*class="[^"]*property-card[^"]*"[^>]*>(.*?)<\/div>/gs;
    const addressRegex = /<h3[^>]*>(.*?)<\/h3>/s;
    const priceRegex = /\$[\d,]+/g;
    const roiRegex = /(\d+\.?\d*)%\s*ROI/i;

    let match;
    while ((match = listingRegex.exec(html)) !== null && properties.length < 20) {
      const listingHtml = match[1];
      
      const addressMatch = addressRegex.exec(listingHtml);
      const priceMatches = listingHtml.match(priceRegex);
      const roiMatch = roiRegex.exec(listingHtml);
      
      if (addressMatch) {
        const address = addressMatch[1].replace(/<[^>]*>/g, '').trim();
        const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
        const roi = roiMatch ? parseFloat(roiMatch[1]) : null;
        
        properties.push({
          address: address,
          city: extractLocationCity(location),
          state: extractLocationState(location),
          zip_code: '',
          property_type: 'investment',
          source: 'biggerpockets',
          listing_url: 'https://www.biggerpockets.com/',
          description: `Investment property - ${address}${roi ? ` (${roi}% ROI)` : ''}`,
          square_footage: null,
          asking_price: price,
          lot_size_acres: null,
          roi_estimate: roi
        });
      }
    }
  } catch (error) {
    console.error('Error parsing BiggerPockets HTML:', error);
  }
  
  return properties;
}

function parsePublicAuctionHTML(html: string, location: string, sourceUrl: string) {
  const properties = [];
  
  try {
    // Generic patterns for government auction sites
    const listingRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    const addressRegex = /(?:address|location)[^>]*>([^<]+)</i;
    const priceRegex = /\$[\d,]+/g;
    const itemRegex = /<td[^>]*>([^<]*(?:property|building|facility|warehouse)[^<]*)<\/td>/i;

    let match;
    while ((match = listingRegex.exec(html)) !== null && properties.length < 15) {
      const rowHtml = match[1];
      
      const addressMatch = addressRegex.exec(rowHtml);
      const itemMatch = itemRegex.exec(rowHtml);
      const priceMatches = rowHtml.match(priceRegex);
      
      if (itemMatch || addressMatch) {
        const description = itemMatch ? itemMatch[1].trim() : 'Government surplus property';
        const address = addressMatch ? addressMatch[1].trim() : `Government Property, ${location}`;
        const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
        
        properties.push({
          address: address,
          city: extractLocationCity(location),
          state: extractLocationState(location),
          zip_code: '',
          property_type: 'government_surplus',
          source: 'public_auctions',
          listing_url: sourceUrl,
          description: description,
          square_footage: null,
          asking_price: price,
          lot_size_acres: null,
          auction_type: 'government_surplus'
        });
      }
    }
  } catch (error) {
    console.error('Error parsing public auction HTML:', error);
  }
  
  return properties;
}

async function fetchGooglePlaces(request: FreeDataRequest) {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    return { properties: [], message: 'Google Places API key not configured' };
  }

  try {
    const searchQuery = `commercial real estate ${request.property_type || 'industrial'} ${request.location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Google Places API error: ${data.error_message || 'Unknown error'}`);
    }

    const properties = data.results?.slice(0, 20).map((place: any) => ({
      address: place.formatted_address || place.name,
      city: extractCity(place.formatted_address),
      state: extractState(place.formatted_address),
      zip_code: extractZipCode(place.formatted_address),
      property_type: request.property_type || 'commercial',
      source: 'google_places',
      listing_url: place.photos?.[0] ? `https://maps.google.com/place/${place.place_id}` : null,
      description: `${place.name} - ${place.types?.join(', ')}`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
      coordinates: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
      }
    })) || [];

    return {
      properties,
      message: `Found ${properties.length} commercial properties via Google Places`
    };
  } catch (error) {
    console.error('Google Places API error:', error);
    return { properties: [], message: 'Google Places API currently unavailable' };
  }
}

async function fetchYelpData(request: FreeDataRequest) {
  const apiKey = Deno.env.get('YELP_API_KEY');
  if (!apiKey) {
    return { properties: [], message: 'Yelp API key not configured' };
  }

  try {
    const categories = 'realestateagents,commercialrealestate,industrialequipment';
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(request.location)}&categories=${categories}&limit=50`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Yelp API error: ${data.error?.description || 'Unknown error'}`);
    }

    const properties = data.businesses?.map((business: any) => ({
      address: business.location?.display_address?.join(', '),
      city: business.location?.city,
      state: business.location?.state,
      zip_code: business.location?.zip_code,
      property_type: 'commercial',
      source: 'yelp',
      listing_url: business.url,
      description: `${business.name} - ${business.categories?.map((c: any) => c.title).join(', ')}`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
      coordinates: {
        lat: business.coordinates?.latitude,
        lng: business.coordinates?.longitude
      }
    })) || [];

    return {
      properties,
      message: `Found ${properties.length} business properties via Yelp`
    };
  } catch (error) {
    console.error('Yelp API error:', error);
    return { properties: [], message: 'Yelp API currently unavailable' };
  }
}

async function fetchOpenStreetMapData(request: FreeDataRequest) {
  try {
    // Use Overpass API to query OpenStreetMap data
    const query = `
      [out:json][timeout:25];
      (
        way["landuse"~"commercial|industrial|retail"]["addr:city"~"${request.location}",i];
        way["building"~"commercial|industrial|warehouse"]["addr:city"~"${request.location}",i];
        relation["landuse"~"commercial|industrial"]["addr:city"~"${request.location}",i];
      );
      out geom;
    `;

    const url = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('OpenStreetMap Overpass API error');
    }

    const properties = data.elements?.slice(0, 30).map((element: any) => ({
      address: `${element.tags?.['addr:housenumber'] || ''} ${element.tags?.['addr:street'] || 'Unknown Street'}`.trim(),
      city: element.tags?.['addr:city'] || request.location,
      state: element.tags?.['addr:state'] || '',
      zip_code: element.tags?.['addr:postcode'] || '',
      property_type: element.tags?.landuse || element.tags?.building || 'commercial',
      source: 'openstreetmap',
      listing_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      description: `${element.tags?.name || 'Commercial Property'} - ${element.tags?.landuse || element.tags?.building}`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
      coordinates: element.type === 'node' ? {
        lat: element.lat,
        lng: element.lon
      } : element.center ? {
        lat: element.center.lat,
        lng: element.center.lon
      } : null
    })) || [];

    return {
      properties: properties.filter(p => p.coordinates),
      message: `Found ${properties.length} properties from OpenStreetMap`
    };
  } catch (error) {
    console.error('OpenStreetMap API error:', error);
    return { properties: [], message: 'OpenStreetMap data currently unavailable' };
  }
}

async function fetchCensusData(request: FreeDataRequest) {
  try {
    // Use Census Bureau's Business Patterns API
    const year = '2021';
    const url = `https://api.census.gov/data/${year}/cbp?get=NAME,NAICS2017_LABEL,EMP,ESTAB&for=county:*&in=state:*&NAICS2017=23,31-33,42,44-45,48-49,53,54,56`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Census API error');
    }

    // Filter for the requested location and convert to property-like data
    const locationFilter = request.location.toLowerCase();
    const relevantData = data?.slice(1).filter((row: any[]) => 
      row[0]?.toLowerCase().includes(locationFilter)
    ) || [];

    const properties = relevantData.slice(0, 20).map((row: any[], index: number) => ({
      address: `Business District ${index + 1}`,
      city: row[0]?.split(',')[0] || request.location,
      state: extractStateFromCensus(row),
      zip_code: '',
      property_type: 'commercial',
      source: 'census',
      listing_url: null,
      description: `${row[1]} - ${row[3]} establishments, ${row[2]} employees`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
      census_data: {
        industry: row[1],
        employees: parseInt(row[2]) || 0,
        establishments: parseInt(row[3]) || 0
      }
    }));

    return {
      properties,
      message: `Found ${properties.length} business areas from Census data`
    };
  } catch (error) {
    console.error('Census API error:', error);
    return { properties: [], message: 'Census data currently unavailable' };
  }
}

async function fetchCountyRecords(request: FreeDataRequest) {
  // This would require specific county APIs - return placeholder for now
  return {
    properties: [],
    message: 'County records integration requires specific county API configuration'
  };
}

async function storeScrapedProperties(supabase: any, properties: any[], source: string) {
  try {
    const propertiesToStore = properties.map(property => ({
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      property_type: property.property_type,
      square_footage: property.square_footage,
      asking_price: property.asking_price,
      lot_size_acres: property.lot_size_acres,
      description: property.description,
      listing_url: property.listing_url,
      source: source,
      ai_analysis: property.coordinates ? { coordinates: property.coordinates } : null
    }));

    const { error } = await supabase
      .from('scraped_properties')
      .upsert(propertiesToStore, {
        onConflict: 'address,city,state',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error storing properties:', error);
    } else {
      console.log(`Stored ${propertiesToStore.length} properties from ${source}`);
    }
  } catch (error) {
    console.error('Error in storeScrapedProperties:', error);
  }
}

// Helper functions
function extractCity(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 3]?.trim() : '';
}

function extractState(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  const statePart = parts[parts.length - 2]?.trim();
  return statePart?.split(' ')[0] || '';
}

function extractZipCode(address: string): string {
  if (!address) return '';
  const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : '';
}

function extractStateFromCensus(row: any[]): string {
  // Census data includes state codes - would need state code to name mapping
  return row[5] || '';
}

function extractLocationCity(location: string): string {
  const parts = location.split(',');
  return parts[0]?.trim() || location;
}

function extractLocationState(location: string): string {
  const parts = location.split(',');
  return parts[1]?.trim() || 'TX';
}
