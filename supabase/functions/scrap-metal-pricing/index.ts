import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default scrap prices (updated regularly as fallback)
// These are typical US scrap metal prices as of early 2025
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

// Scrap price multipliers (scrap = commodity * multiplier)
// These convert commodity spot prices to scrap yard buy prices
const SCRAP_MULTIPLIERS = {
  copper: {
    bareBright: 0.92, // Bare bright is closest to spot
    number1: 0.85,
    number2: 0.78,
    insulated: 0.45, // Recovery rate dependent
    pipe: 0.78,
  },
  aluminum: {
    sheet: 0.72,
    cast: 0.55,
    extrusion: 0.60,
    cans: 0.50,
    dirty: 0.35,
  },
  steel: {
    hms1: 0.70,
    hms2: 0.60,
    structural: 0.72,
    sheet: 0.60,
    rebar: 0.65,
    galvanized: 0.45,
  },
};

interface ScrapMetalPrices {
  copper: {
    bareBright: number;
    number1: number;
    number2: number;
    insulated: number;
    pipe: number;
  };
  aluminum: {
    sheet: number;
    cast: number;
    extrusion: number;
    cans: number;
    dirty: number;
  };
  steel: {
    hms1: number;
    hms2: number;
    structural: number;
    sheet: number;
    rebar: number;
    galvanized: number;
  };
  brass: {
    yellow: number;
    red: number;
    mixed: number;
  };
  stainless: {
    ss304: number;
    ss316: number;
    mixed: number;
  };
  iron: {
    cast: number;
    wrought: number;
  };
  lastUpdated: string;
  source: 'live' | 'cached' | 'default';
  spotPrices?: {
    copper?: number;
    aluminum?: number;
    iron?: number;
    nickel?: number;
  };
}

// Simple in-memory cache
let priceCache: {
  prices: ScrapMetalPrices | null;
  timestamp: number;
} = {
  prices: null,
  timestamp: 0,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchLivePrices(): Promise<ScrapMetalPrices | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  // If no API key, return null to use defaults
  if (!METALS_API_KEY) {
    console.log("No METALS_API_KEY configured, using default prices");
    return null;
  }

  try {
    // Metals-API.com format (free tier: 100 requests/month)
    // Symbols: XCU (Copper), XAL (Aluminum), FE (Iron Ore), NI (Nickel)
    const response = await fetch(
      `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=XCU,XAL,FE,NI`,
      { headers: { "Accept": "application/json" } }
    );

    if (!response.ok) {
      console.error("Metals-API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    console.log("Metals-API response:", JSON.stringify(data));
    
    if (!data.success) {
      console.error("Metals-API error response:", data.error);
      return null;
    }

    if (!data.rates) {
      console.error("No rates in Metals-API response");
      return null;
    }

    // Metals-API returns rates as 1 USD = X units of metal
    // So we need to invert: 1/rate = USD per unit
    // XCU = Copper (USD per troy ounce)
    // XAL = Aluminum (USD per troy ounce)
    // FE = Iron Ore (USD per metric ton)
    // NI = Nickel (USD per troy ounce)
    
    const copperPerOz = data.rates.XCU ? 1 / data.rates.XCU : null;
    const aluminumPerOz = data.rates.XAL ? 1 / data.rates.XAL : null;
    const ironPerTon = data.rates.FE ? 1 / data.rates.FE : null;
    const nickelPerOz = data.rates.NI ? 1 / data.rates.NI : null;

    console.log("Calculated prices:", { copperPerOz, aluminumPerOz, ironPerTon, nickelPerOz });

    // Convert to per-pound prices
    // 1 troy ounce = 0.0685714 pounds, so 1 pound = 14.5833 troy ounces
    const copperPerLb = copperPerOz ? copperPerOz * 14.5833 : 4.50;
    const aluminumPerLb = aluminumPerOz ? aluminumPerOz * 14.5833 : 1.15;
    const ironPerLb = ironPerTon ? ironPerTon / 2204.62 : 0.055;
    const nickelPerLb = nickelPerOz ? nickelPerOz * 14.5833 : 8.00;
    
    // Steel is roughly iron + processing premium
    const steelPerLb = ironPerLb * 2.5;

    // Apply scrap multipliers to get scrap yard prices
    const prices: ScrapMetalPrices = {
      copper: {
        bareBright: Math.round(copperPerLb * SCRAP_MULTIPLIERS.copper.bareBright * 100) / 100,
        number1: Math.round(copperPerLb * SCRAP_MULTIPLIERS.copper.number1 * 100) / 100,
        number2: Math.round(copperPerLb * SCRAP_MULTIPLIERS.copper.number2 * 100) / 100,
        insulated: Math.round(copperPerLb * SCRAP_MULTIPLIERS.copper.insulated * 100) / 100,
        pipe: Math.round(copperPerLb * SCRAP_MULTIPLIERS.copper.pipe * 100) / 100,
      },
      aluminum: {
        sheet: Math.round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.sheet * 100) / 100,
        cast: Math.round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.cast * 100) / 100,
        extrusion: Math.round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.extrusion * 100) / 100,
        cans: Math.round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.cans * 100) / 100,
        dirty: Math.round(aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.dirty * 100) / 100,
      },
      steel: {
        hms1: Math.round(steelPerLb * SCRAP_MULTIPLIERS.steel.hms1 * 100) / 100,
        hms2: Math.round(steelPerLb * SCRAP_MULTIPLIERS.steel.hms2 * 100) / 100,
        structural: Math.round(steelPerLb * SCRAP_MULTIPLIERS.steel.structural * 100) / 100,
        sheet: Math.round(steelPerLb * SCRAP_MULTIPLIERS.steel.sheet * 100) / 100,
        rebar: Math.round(steelPerLb * SCRAP_MULTIPLIERS.steel.rebar * 100) / 100,
        galvanized: Math.round(steelPerLb * SCRAP_MULTIPLIERS.steel.galvanized * 100) / 100,
      },
      brass: {
        // Brass is ~60% copper, ~40% zinc
        yellow: Math.round(copperPerLb * 0.55 * 100) / 100,
        red: Math.round(copperPerLb * 0.60 * 100) / 100,
        mixed: Math.round(copperPerLb * 0.50 * 100) / 100,
      },
      stainless: {
        // Stainless contains nickel - use nickel price as indicator
        ss304: Math.round((steelPerLb + nickelPerLb * 0.08) * 4.5 * 100) / 100,
        ss316: Math.round((steelPerLb + nickelPerLb * 0.12) * 6.0 * 100) / 100,
        mixed: Math.round((steelPerLb + nickelPerLb * 0.06) * 3.5 * 100) / 100,
      },
      iron: {
        cast: Math.round(ironPerLb * 1.6 * 100) / 100,
        wrought: Math.round(ironPerLb * 2.0 * 100) / 100,
      },
      lastUpdated: new Date().toISOString(),
      source: 'live',
      spotPrices: {
        copper: Math.round(copperPerLb * 100) / 100,
        aluminum: Math.round(aluminumPerLb * 100) / 100,
        iron: Math.round(ironPerLb * 1000) / 1000,
        nickel: Math.round(nickelPerLb * 100) / 100,
      },
    };

    return prices;
  } catch (error) {
    console.error("Error fetching live prices:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json().catch(() => ({ action: 'get-prices' }));

    if (action === 'get-prices') {
      // Check cache first
      if (priceCache.prices && Date.now() - priceCache.timestamp < CACHE_DURATION) {
        console.log("Returning cached prices from", new Date(priceCache.timestamp).toISOString());
        return new Response(
          JSON.stringify({
            success: true,
            prices: { ...priceCache.prices, source: 'cached' },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Try to fetch live prices
      const livePrices = await fetchLivePrices();

      if (livePrices) {
        // Update cache
        priceCache = {
          prices: livePrices,
          timestamp: Date.now(),
        };

        return new Response(
          JSON.stringify({ success: true, prices: livePrices }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fall back to defaults
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
      // Force refresh from API
      priceCache = { prices: null, timestamp: 0 };
      const livePrices = await fetchLivePrices();
      
      if (livePrices) {
        priceCache = {
          prices: livePrices,
          timestamp: Date.now(),
        };
        return new Response(
          JSON.stringify({ success: true, prices: livePrices, refreshed: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const defaultPrices: ScrapMetalPrices = {
        ...DEFAULT_PRICES,
        lastUpdated: new Date().toISOString(),
        source: 'default',
      };

      return new Response(
        JSON.stringify({ 
          success: true, 
          prices: defaultPrices, 
          refreshed: false,
          warning: 'Could not fetch live prices, using defaults'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("scrap-metal-pricing error:", error);
    
    // Return default prices on error
    const defaultPrices: ScrapMetalPrices = {
      ...DEFAULT_PRICES,
      lastUpdated: new Date().toISOString(),
      source: 'default',
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        prices: defaultPrices,
        warning: 'Failed to fetch live prices, using defaults'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
