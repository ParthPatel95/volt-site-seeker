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
    // Fetch commodity prices from metals API
    // Using metalpriceapi.com format
    const response = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${METALS_API_KEY}&base=USD&currencies=XCU,XAL,XFE`,
      { headers: { "Accept": "application/json" } }
    );

    if (!response.ok) {
      console.error("Metals API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.rates) {
      console.error("Invalid metals API response:", data);
      return null;
    }

    // Convert commodity prices to scrap prices
    // XCU = Copper per troy oz (multiply by ~29 for per lb estimate)
    // XAL = Aluminum per troy oz (multiply by ~29 for per lb)
    // XFE = Iron per metric ton (divide by 2204.62 for per lb)
    
    const copperSpot = data.rates.USDXCU ? 1 / data.rates.USDXCU : 4.5; // USD per troy oz
    const copperPerLb = copperSpot * 14.5833; // 14.58 troy oz per pound
    
    const aluminumSpot = data.rates.USDXAL ? 1 / data.rates.USDXAL : 1.15;
    const aluminumPerLb = aluminumSpot * 14.5833;
    
    const ironPerTon = data.rates.USDXFE ? 1 / data.rates.USDXFE : 120;
    const ironPerLb = ironPerTon / 2204.62;
    const steelPerLb = ironPerLb * 1.4; // Steel typically ~40% more than iron

    // Apply scrap multipliers
    const prices: ScrapMetalPrices = {
      copper: {
        bareBright: copperPerLb * SCRAP_MULTIPLIERS.copper.bareBright,
        number1: copperPerLb * SCRAP_MULTIPLIERS.copper.number1,
        number2: copperPerLb * SCRAP_MULTIPLIERS.copper.number2,
        insulated: copperPerLb * SCRAP_MULTIPLIERS.copper.insulated,
        pipe: copperPerLb * SCRAP_MULTIPLIERS.copper.pipe,
      },
      aluminum: {
        sheet: aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.sheet,
        cast: aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.cast,
        extrusion: aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.extrusion,
        cans: aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.cans,
        dirty: aluminumPerLb * SCRAP_MULTIPLIERS.aluminum.dirty,
      },
      steel: {
        hms1: steelPerLb * SCRAP_MULTIPLIERS.steel.hms1,
        hms2: steelPerLb * SCRAP_MULTIPLIERS.steel.hms2,
        structural: steelPerLb * SCRAP_MULTIPLIERS.steel.structural,
        sheet: steelPerLb * SCRAP_MULTIPLIERS.steel.sheet,
        rebar: steelPerLb * SCRAP_MULTIPLIERS.steel.rebar,
        galvanized: steelPerLb * SCRAP_MULTIPLIERS.steel.galvanized,
      },
      brass: {
        // Brass is ~60% copper, ~40% zinc
        yellow: copperPerLb * 0.55,
        red: copperPerLb * 0.60,
        mixed: copperPerLb * 0.50,
      },
      stainless: {
        // Stainless contains nickel - estimate based on steel + premium
        ss304: steelPerLb * 4.5,
        ss316: steelPerLb * 6.0,
        mixed: steelPerLb * 3.5,
      },
      iron: {
        cast: ironPerLb * 0.9,
        wrought: ironPerLb * 1.1,
      },
      lastUpdated: new Date().toISOString(),
      source: 'live',
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
