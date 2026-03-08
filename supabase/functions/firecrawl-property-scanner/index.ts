const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

interface SearchParams {
  location: string;
  property_type: string;
  min_power_mw?: number;
  budget_max?: number;
  search_queries?: string[];
}

// EIA API state code mapping for electricity rates
async function fetchEIAElectricityRate(stateCode: string, eiaApiKey: string): Promise<number | null> {
  try {
    const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${eiaApiKey}&frequency=monthly&data[0]=price&facets[stateid][]=${stateCode}&facets[sectorid][]=IND&sort[0][column]=period&sort[0][direction]=desc&length=1`;
    
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('EIA API returned status:', resp.status);
      return null;
    }
    
    const data = await resp.json();
    const price = data?.response?.data?.[0]?.price;
    
    if (price && typeof price === 'number') {
      // EIA returns cents/kWh, convert to $/kWh
      return price / 100;
    }
    return null;
  } catch (err) {
    console.warn('EIA rate lookup failed:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'OpenAI API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const EIA_API_KEY = Deno.env.get('EIA_API_KEY');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const params: SearchParams = await req.json();
    const { location, property_type, min_power_mw, budget_max } = params;

    if (!location) {
      return new Response(JSON.stringify({ success: false, error: 'Location is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Starting Firecrawl property scan:', { location, property_type, min_power_mw, budget_max });

    // Build targeted search queries for mining-suitable properties
    const queries = params.search_queries?.length ? params.search_queries : [
      `industrial property for sale ${location} high power ${property_type || ''} site:loopnet.com OR site:crexi.com`,
      `heavy industrial warehouse ${location} power infrastructure for sale site:loopnet.com OR site:landsearch.com`,
    ];

    // Step 1: Search via Firecrawl (parallel, NO scraping — just titles/descriptions for speed)
    console.log('Searching with', queries.length, 'queries in parallel...');
    const searchPromises = queries.map(async (query) => {
      try {
        const searchResp = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: 5,
          }),
        });

        const searchData = await searchResp.json();
        if (searchData.success && searchData.data) {
          console.log(`Query "${query.substring(0, 50)}..." returned ${searchData.data.length} results`);
          return searchData.data;
        } else {
          console.warn('Search query failed:', searchData.error || 'unknown error');
          return [];
        }
      } catch (err) {
        console.error('Search query error:', err);
        return [];
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults = searchResults.flat();

    // Deduplicate by URL
    const uniqueResults = Array.from(
      new Map(allResults.map(r => [r.url, r])).values()
    ).slice(0, 8); // Cap at 8

    console.log(`Found ${uniqueResults.length} unique results to analyze`);

    if (uniqueResults.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        properties_found: 0,
        message: 'No listings found matching your criteria. Try broadening your search location or property type.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 1.5: Quick-scrape top results in parallel to get richer content
    console.log(`Scraping ${uniqueResults.length} result pages in parallel...`);
    const scrapePromises = uniqueResults.map(async (result) => {
      try {
        const scrapeResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: result.url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });
        const scrapeData = await scrapeResp.json();
        if (scrapeData.success && scrapeData.data?.markdown) {
          result.markdown = scrapeData.data.markdown;
          console.log(`Scraped ${result.url.substring(0, 60)}... (${scrapeData.data.markdown.length} chars)`);
        }
      } catch (err) {
        console.warn('Scrape failed for', result.url, err);
      }
    });
    await Promise.all(scrapePromises);

    // Step 2: Extract structured data via OpenAI (parallel)
    const eiaRateCache = new Map<string, number | null>();

    const extractionPromises = uniqueResults
      .filter(r => (r.markdown || r.description || '').length >= 50)
      .map(async (result) => {
        try {
          const markdown = result.markdown || result.description || '';
          const extractionPrompt = `You are a commercial real estate and power infrastructure analyst. Extract structured property data from this listing content, specifically evaluating suitability for Bitcoin mining / high-performance computing operations.

LISTING URL: ${result.url}
LISTING TITLE: ${result.title || 'N/A'}

CONTENT:
${markdown.substring(0, 4000)}

Extract and return a JSON object with these fields. Use null for any field you cannot determine:

{
  "address": "full street address",
  "city": "city name",
  "state": "2-letter state code",
  "zip_code": "zip code",
  "property_type": "industrial|warehouse|manufacturing|data_center|land|other",
  "square_footage": number or null,
  "lot_size_acres": number or null,
  "asking_price": number or null,
  "price_per_sqft": number or null,
  "year_built": number or null,
  "zoning": "zoning designation",
  "description": "brief property description (max 200 chars)",
  "power_infrastructure": {
    "estimated_power_capacity_mw": number or null,
    "voltage_available": "voltage levels mentioned",
    "nearest_substation": "name/location if mentioned",
    "substation_distance_miles": number or null,
    "transmission_access": true/false,
    "utility_provider": "local utility company name",
    "power_application_process": {
      "utility_contact": "who to contact",
      "typical_timeline_months": number or null,
      "required_documents": ["list"],
      "estimated_interconnection_cost": "cost range",
      "process_steps": ["step 1", "step 2"]
    },
    "grid_interconnection_notes": "notes",
    "cooling_potential": "natural cooling advantages",
    "redundancy_options": "backup power options"
  },
  "bitcoin_mining_suitability": {
    "score": 1-10,
    "strengths": ["list"],
    "weaknesses": ["list"],
    "estimated_hashrate_capacity": "estimate",
    "recommended_setup": "brief recommendation"
  }
}

Return ONLY valid JSON, no markdown code fences.`;

          const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a commercial real estate and power infrastructure expert. Always return valid JSON.' },
                { role: 'user', content: extractionPrompt }
              ],
              temperature: 0.2,
              max_tokens: 1500,
            }),
          });

          const openaiData = await openaiResp.json();
          const content = openaiData.choices?.[0]?.message?.content;

          if (!content) {
            console.warn('Empty OpenAI response for', result.url);
            return null;
          }

          let parsed;
          try {
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
          } catch {
            console.warn('Failed to parse OpenAI JSON for', result.url);
            return null;
          }

          if (!parsed.address && !parsed.city) {
            console.warn('No address/city extracted for', result.url);
            return null;
          }

          // EIA rate lookup (cached per state)
          let eiaRate: number | null = null;
          if (EIA_API_KEY && parsed.state) {
            if (eiaRateCache.has(parsed.state)) {
              eiaRate = eiaRateCache.get(parsed.state)!;
            } else {
              eiaRate = await fetchEIAElectricityRate(parsed.state, EIA_API_KEY);
              eiaRateCache.set(parsed.state, eiaRate);
              if (eiaRate) {
                console.log(`EIA rate for ${parsed.state}: ${(eiaRate * 100).toFixed(2)}¢/kWh`);
              }
            }
          }

          return {
            ...parsed,
            listing_url: result.url,
            source_title: result.title,
            eia_electricity_rate: eiaRate,
          };
        } catch (err) {
          console.error('Extraction error for', result.url, err);
          return null;
        }
      });

    const extractionResults = await Promise.all(extractionPromises);
    const extractedProperties = extractionResults.filter(Boolean) as any[];

    console.log(`Extracted ${extractedProperties.length} valid properties`);

    // Step 3: Save to scraped_properties table
    let savedCount = 0;
    for (const prop of extractedProperties) {
      try {
        const { error } = await supabase
          .from('scraped_properties')
          .upsert({
            address: prop.address || `${prop.city}, ${prop.state}`,
            city: prop.city || 'Unknown',
            state: prop.state || 'Unknown',
            zip_code: prop.zip_code,
            property_type: prop.property_type || property_type || 'industrial',
            square_footage: prop.square_footage,
            lot_size_acres: prop.lot_size_acres,
            asking_price: prop.asking_price,
            price_per_sqft: prop.price_per_sqft,
            year_built: prop.year_built,
            power_capacity_mw: prop.power_infrastructure?.estimated_power_capacity_mw,
            substation_distance_miles: prop.power_infrastructure?.substation_distance_miles,
            transmission_access: prop.power_infrastructure?.transmission_access || false,
            zoning: prop.zoning,
            description: prop.description,
            listing_url: prop.listing_url,
            source: 'firecrawl_scanner',
            moved_to_properties: false,
            ai_analysis: {
              power_infrastructure: prop.power_infrastructure,
              bitcoin_mining_suitability: prop.bitcoin_mining_suitability,
              source_title: prop.source_title,
              eia_electricity_rate: prop.eia_electricity_rate,
              scanned_at: new Date().toISOString(),
            },
          }, { onConflict: 'listing_url' });

        if (error) {
          console.error('DB insert error:', error);
        } else {
          savedCount++;
        }
      } catch (err) {
        console.error('Save error:', err);
      }
    }

    console.log(`Saved ${savedCount} properties to database`);

    return new Response(JSON.stringify({
      success: true,
      properties_found: savedCount,
      total_results_searched: uniqueResults.length,
      properties: extractedProperties,
      queries_used: queries.length,
      eia_enrichment: !!EIA_API_KEY,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Scanner error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Scanner failed'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
