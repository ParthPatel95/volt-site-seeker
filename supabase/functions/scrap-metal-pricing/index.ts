import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default scrap prices (fallback when API unavailable)
const DEFAULT_PRICES = {
  copper: {
    bareBright: 4.00,
    number1: 3.60,
    number2: 3.40,
    insulated: 2.00,
    pipe: 3.40,
  },
  aluminum: {
    sheet: 0.95,
    cast: 0.60,
    extrusion: 0.70,
    cans: 0.50,
    dirty: 0.40,
  },
  steel: {
    hms1: 0.13,
    hms2: 0.11,
    structural: 0.14,
    sheet: 0.11,
    rebar: 0.12,
    galvanized: 0.08,
  },
  brass: {
    yellow: 2.40,
    red: 2.60,
    mixed: 2.10,
  },
  stainless: {
    ss304: 0.65,
    ss316: 0.85,
    mixed: 0.50,
  },
  iron: {
    cast: 0.09,
    wrought: 0.11,
  },
};

// Scrap multipliers to convert commodity spot to scrap yard prices
const SCRAP_MULTIPLIERS = {
  copper: { bareBright: 0.92, number1: 0.85, number2: 0.78, insulated: 0.45, pipe: 0.78 },
  aluminum: { sheet: 0.72, cast: 0.55, extrusion: 0.60, cans: 0.50, dirty: 0.35 },
  steel: { hms1: 0.70, hms2: 0.60, structural: 0.72, sheet: 0.60, rebar: 0.65, galvanized: 0.45 },
};

// Rate limiting: 2,500 calls/month = ~83/day, we'll limit to 3/day for safety
const MAX_API_CALLS_PER_DAY = 3;
const CACHE_DURATION_HOURS = 24;

interface ScrapMetalPrices {
  copper: { bareBright: number; number1: number; number2: number; insulated: number; pipe: number };
  aluminum: { sheet: number; cast: number; extrusion: number; cans: number; dirty: number };
  steel: { hms1: number; hms2: number; structural: number; sheet: number; rebar: number; galvanized: number };
  brass: { yellow: number; red: number; mixed: number };
  stainless: { ss304: number; ss316: number; mixed: number };
  iron: { cast: number; wrought: number };
  lastUpdated: string;
  source: 'live' | 'cached' | 'default';
  spotPrices?: { copper?: number; aluminum?: number; iron?: number; nickel?: number };
  cacheInfo?: { expiresAt: string; apiCallsToday: number; maxCallsPerDay: number };
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function getCachedPrices(supabase: ReturnType<typeof createClient>): Promise<{
  prices: ScrapMetalPrices | null;
  isExpired: boolean;
  apiCallsToday: number;
  canCallApi: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('scrap_metal_price_cache')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error || !data) {
      return { prices: null, isExpired: true, apiCallsToday: 0, canCallApi: true };
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    const isExpired = now > expiresAt;
    
    // Reset counter if it's a new day
    const lastCallDate = data.last_api_call_date;
    const today = now.toISOString().split('T')[0];
    const apiCallsToday = lastCallDate === today ? (data.api_calls_today || 0) : 0;
    const canCallApi = apiCallsToday < MAX_API_CALLS_PER_DAY;

    const prices = data.prices as ScrapMetalPrices;
    prices.cacheInfo = {
      expiresAt: data.expires_at,
      apiCallsToday,
      maxCallsPerDay: MAX_API_CALLS_PER_DAY,
    };

    return { prices, isExpired, apiCallsToday, canCallApi };
  } catch (e) {
    console.error("Error reading cache:", e);
    return { prices: null, isExpired: true, apiCallsToday: 0, canCallApi: true };
  }
}

async function savePricesToCache(
  supabase: ReturnType<typeof createClient>,
  prices: ScrapMetalPrices,
  incrementApiCall: boolean
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];

  try {
    // Get current api call count
    const { data: existing } = await supabase
      .from('scrap_metal_price_cache')
      .select('api_calls_today, last_api_call_date')
      .eq('id', 'current')
      .single();

    let apiCallsToday = 0;
    if (existing) {
      apiCallsToday = existing.last_api_call_date === today ? (existing.api_calls_today || 0) : 0;
    }
    if (incrementApiCall) {
      apiCallsToday++;
    }

    await supabase
      .from('scrap_metal_price_cache')
      .upsert({
        id: 'current',
        prices,
        fetched_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        api_calls_today: apiCallsToday,
        last_api_call_date: today,
      });

    console.log(`Cache saved, expires at ${expiresAt.toISOString()}, API calls today: ${apiCallsToday}`);
  } catch (e) {
    console.error("Error saving cache:", e);
  }
}

async function fetchLivePrices(): Promise<ScrapMetalPrices | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  if (!METALS_API_KEY) {
    console.log("No METALS_API_KEY configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=XCU,XAL,FE,NI`,
      { headers: { "Accept": "application/json" } }
    );

    if (!response.ok) {
      console.error("Metals-API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.rates) {
      console.error("Metals-API error:", data.error);
      return null;
    }

    // Invert rates: API returns 1 USD = X units, we want USD per unit
    const copperPerOz = data.rates.XCU ? 1 / data.rates.XCU : null;
    const aluminumPerOz = data.rates.XAL ? 1 / data.rates.XAL : null;
    const ironPerTon = data.rates.FE ? 1 / data.rates.FE : null;
    const nickelPerOz = data.rates.NI ? 1 / data.rates.NI : null;

    // Convert to per-pound (1 lb = 14.5833 troy oz)
    const copperPerLb = copperPerOz ? copperPerOz * 14.5833 : 4.50;
    const aluminumPerLb = aluminumPerOz ? aluminumPerOz * 14.5833 : 1.15;
    const ironPerLb = ironPerTon ? ironPerTon / 2204.62 : 0.055;
    const nickelPerLb = nickelPerOz ? nickelPerOz * 14.5833 : 8.00;
    const steelPerLb = ironPerLb * 2.5;

    const round = (n: number) => Math.round(n * 100) / 100;

    return {
      copper: {
        bareBright: round(copperPerLb * SCRAP_MULTIPLIERS.copper.bareBright),
        number1: round(copperPerLb * SCRAP_MULTIPLIERS.copper.number1),
        number2: round(copperPerLb * SCRAP_MULTIPLIERS.copper.number2),
        insulated: round(copperPerLb * SCRAP_MULTIPLIERS.copper.insulated),
        pipe: round(copperPerLb * SCRAP_MULTIPLIERS.copper.pipe),
      },
      aluminum: {
        sheet: round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.sheet),
        cast: round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.cast),
        extrusion: round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.extrusion),
        cans: round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.cans),
        dirty: round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.dirty),
      },
      steel: {
        hms1: round(steelPerLb * SCRAP_MULTIPLIERS.steel.hms1),
        hms2: round(steelPerLb * SCRAP_MULTIPLIERS.steel.hms2),
        structural: round(steelPerLb * SCRAP_MULTIPLIERS.steel.structural),
        sheet: round(steelPerLb * SCRAP_MULTIPLIERS.steel.sheet),
        rebar: round(steelPerLb * SCRAP_MULTIPLIERS.steel.rebar),
        galvanized: round(steelPerLb * SCRAP_MULTIPLIERS.steel.galvanized),
      },
      brass: {
        yellow: round(copperPerLb * 0.55),
        red: round(copperPerLb * 0.60),
        mixed: round(copperPerLb * 0.50),
      },
      stainless: {
        ss304: round((steelPerLb + nickelPerLb * 0.08) * 4.5),
        ss316: round((steelPerLb + nickelPerLb * 0.12) * 6.0),
        mixed: round((steelPerLb + nickelPerLb * 0.06) * 3.5),
      },
      iron: {
        cast: round(ironPerLb * 1.6),
        wrought: round(ironPerLb * 2.0),
      },
      lastUpdated: new Date().toISOString(),
      source: 'live',
      spotPrices: {
        copper: round(copperPerLb),
        aluminum: round(aluminumPerLb),
        iron: Math.round(ironPerLb * 1000) / 1000,
        nickel: round(nickelPerLb),
      },
    };
  } catch (error) {
    console.error("Error fetching live prices:", error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json().catch(() => ({ action: 'get-prices' }));
    const supabase = getSupabaseClient();

    if (action === 'get-prices') {
      const cache = await getCachedPrices(supabase);

      // Return cached if not expired
      if (cache.prices && !cache.isExpired) {
        console.log("Returning cached prices (not expired)");
        return new Response(
          JSON.stringify({ success: true, prices: { ...cache.prices, source: 'cached' } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If expired but can't call API (rate limited), return stale cache
      if (cache.prices && !cache.canCallApi) {
        console.log(`Rate limited (${cache.apiCallsToday}/${MAX_API_CALLS_PER_DAY} calls today), returning stale cache`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            prices: { ...cache.prices, source: 'cached' },
            warning: `Rate limited - using cached data (${cache.apiCallsToday}/${MAX_API_CALLS_PER_DAY} API calls today)`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch fresh prices
      const livePrices = await fetchLivePrices();

      if (livePrices) {
        await savePricesToCache(supabase, livePrices, true);
        return new Response(
          JSON.stringify({ success: true, prices: livePrices }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // API failed - return stale cache or defaults
      if (cache.prices) {
        console.log("API failed, returning stale cache");
        return new Response(
          JSON.stringify({ 
            success: true, 
            prices: { ...cache.prices, source: 'cached' },
            warning: 'API unavailable, using cached data'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // No cache, no API - use defaults
      const defaultPrices: ScrapMetalPrices = {
        ...DEFAULT_PRICES,
        lastUpdated: new Date().toISOString(),
        source: 'default',
      };
      return new Response(
        JSON.stringify({ success: true, prices: defaultPrices }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'refresh') {
      const cache = await getCachedPrices(supabase);

      if (!cache.canCallApi) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Rate limited: ${cache.apiCallsToday}/${MAX_API_CALLS_PER_DAY} API calls used today. Try again tomorrow.`,
            prices: cache.prices ? { ...cache.prices, source: 'cached' } : null
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const livePrices = await fetchLivePrices();
      
      if (livePrices) {
        await savePricesToCache(supabase, livePrices, true);
        return new Response(
          JSON.stringify({ success: true, prices: livePrices, refreshed: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not fetch live prices',
          prices: cache.prices ? { ...cache.prices, source: 'cached' } : { ...DEFAULT_PRICES, lastUpdated: new Date().toISOString(), source: 'default' }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'status') {
      const cache = await getCachedPrices(supabase);
      return new Response(
        JSON.stringify({
          success: true,
          status: {
            hasCachedData: !!cache.prices,
            isExpired: cache.isExpired,
            apiCallsToday: cache.apiCallsToday,
            maxCallsPerDay: MAX_API_CALLS_PER_DAY,
            canCallApi: cache.canCallApi,
            cacheDurationHours: CACHE_DURATION_HOURS,
            estimatedMonthlyUsage: `~${MAX_API_CALLS_PER_DAY * 30} of 2,500 calls`,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action. Valid: get-prices, refresh, status' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("scrap-metal-pricing error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        prices: { ...DEFAULT_PRICES, lastUpdated: new Date().toISOString(), source: 'default' },
        warning: 'Error occurred, using default prices'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
