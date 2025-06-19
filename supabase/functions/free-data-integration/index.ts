import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { fetchCountyRecords } from './scrapers/countyRecords.ts';
import { FreeDataRequest, PropertyData } from './types.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: FreeDataRequest = await req.json();
    console.log('Free data integration request:', request);

    let allProperties: PropertyData[] = [];
    let messages: string[] = [];

    // Enhanced County Records (including AltaLink for Alberta)
    try {
      console.log('Fetching enhanced county records...');
      const countyResult = await fetchCountyRecords(request);
      if (countyResult.properties.length > 0) {
        allProperties.push(...countyResult.properties);
        messages.push(`County Records: ${countyResult.message}`);
        console.log(`County records found: ${countyResult.properties.length}`);
      } else {
        messages.push(`County Records: ${countyResult.message}`);
      }
    } catch (error) {
      console.error('County records error:', error);
      messages.push(`County Records: Error - ${error.message}`);
    }

    // Government APIs (NREL, EIA)
    // try {
    //   console.log('Fetching government data...');
    //   const governmentResult = await fetchGovernmentData(request);
    //   if (governmentResult.properties.length > 0) {
    //     allProperties.push(...governmentResult.properties);
    //     messages.push(`Government Data: ${governmentResult.message}`);
    //     console.log(`Government data found: ${governmentResult.properties.length}`);
    //   } else {
    //     messages.push(`Government Data: ${governmentResult.message}`);
    //   }
    // } catch (error) {
    //   console.error('Government data error:', error);
    //   messages.push(`Government Data: Error - ${error.message}`);
    // }

    // Auction Sites (LoopNet, Ten-X)
    // try {
    //   console.log('Scraping auction sites...');
    //   const auctionResult = await scrapeAuctionSites(request);
    //   if (auctionResult.properties.length > 0) {
    //     allProperties.push(...auctionResult.properties);
    //     messages.push(`Auction Sites: ${auctionResult.message}`);
    //     console.log(`Auction properties found: ${auctionResult.properties.length}`);
    //   } else {
    //     messages.push(`Auction Sites: ${auctionResult.message}`);
    //   }
    // } catch (error) {
    //   console.error('Auction sites error:', error);
    //   messages.push(`Auction Sites: Error - ${error.message}`);
    // }

    // Compile final response
    const uniqueProperties = removeDuplicateProperties(allProperties);
    console.log(`Total unique properties found: ${uniqueProperties.length}`);

    let finalMessage = messages.length > 0 ? messages.join(' | ') : 'No data sources returned results';
    
    // Add Alberta-specific messaging
    if (request.location.toLowerCase().includes('alberta') || request.location.toLowerCase().includes('ab')) {
      if (uniqueProperties.some(p => p.source === 'altalink_api' || p.source === 'altalink_fallback')) {
        finalMessage += ' | Enhanced with AltaLink transmission infrastructure data for accurate Alberta coverage';
      }
    }

    return new Response(JSON.stringify({
      properties: uniqueProperties,
      sources_attempted: messages.length,
      total_found: uniqueProperties.length,
      message: finalMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Free data integration error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch data',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

function removeDuplicateProperties(properties: PropertyData[]): PropertyData[] {
  const uniqueMap = new Map();
  return properties.filter(property => {
    const key = `${property.address}-${property.city}-${property.state}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, true);
      return true;
    }
    return false;
  });
}
