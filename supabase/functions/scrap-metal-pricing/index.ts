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

// Rate limiting: 2,500 calls/month = ~83/day
// Price cache: 3 calls/day, Market data: 4 calls/day = 7 total (~210/month)
const MAX_PRICE_API_CALLS_PER_DAY = 3;
const MAX_MARKET_API_CALLS_PER_DAY = 4; // timeseries, fluctuation, news, ohlc
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

interface TimeseriesData {
  [date: string]: { [symbol: string]: number };
}

interface FluctuationData {
  [symbol: string]: { change: number; change_pct: number; start_rate: number; end_rate: number };
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
}

interface OHLCData {
  [symbol: string]: { open: number; high: number; low: number; close: number };
}

interface MarketData {
  timeseries?: { data: TimeseriesData; processedTrends?: Record<string, { prices: number[]; dates: string[]; changePercent: number }> };
  fluctuation?: FluctuationData;
  news?: NewsArticle[];
  ohlc?: OHLCData;
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============ PRICE CACHE FUNCTIONS ============

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
    
    const lastCallDate = data.last_api_call_date;
    const today = now.toISOString().split('T')[0];
    const apiCallsToday = lastCallDate === today ? (data.api_calls_today || 0) : 0;
    const canCallApi = apiCallsToday < MAX_PRICE_API_CALLS_PER_DAY;

    const prices = data.prices as ScrapMetalPrices;
    prices.cacheInfo = {
      expiresAt: data.expires_at,
      apiCallsToday,
      maxCallsPerDay: MAX_PRICE_API_CALLS_PER_DAY,
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

// ============ MARKET DATA CACHE FUNCTIONS ============

async function getMarketDataCache(supabase: ReturnType<typeof createClient>): Promise<{
  data: MarketData | null;
  apiCallsToday: number;
  canCallApi: boolean;
  cacheStatus: {
    timeseries: { isCached: boolean; isExpired: boolean };
    fluctuation: { isCached: boolean; isExpired: boolean };
    news: { isCached: boolean; isExpired: boolean };
    ohlc: { isCached: boolean; isExpired: boolean };
  };
}> {
  try {
    const { data, error } = await supabase
      .from('scrap_metal_market_data')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error || !data) {
      return { 
        data: null, 
        apiCallsToday: 0, 
        canCallApi: true,
        cacheStatus: {
          timeseries: { isCached: false, isExpired: true },
          fluctuation: { isCached: false, isExpired: true },
          news: { isCached: false, isExpired: true },
          ohlc: { isCached: false, isExpired: true },
        }
      };
    }

    const now = new Date();
    const today = formatDate(now);
    const lastCallDate = data.last_api_call_date;
    const apiCallsToday = lastCallDate === today ? (data.api_calls_today || 0) : 0;
    const canCallApi = apiCallsToday < MAX_MARKET_API_CALLS_PER_DAY;

    const isDataExpired = (fetchedAt: string | null): boolean => {
      if (!fetchedAt) return true;
      const fetched = new Date(fetchedAt);
      const expiresAt = new Date(fetched.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);
      return now > expiresAt;
    };

    return {
      data: {
        timeseries: data.timeseries_data ? { data: data.timeseries_data as TimeseriesData } : undefined,
        fluctuation: data.fluctuation_data as FluctuationData | undefined,
        news: data.news_data as NewsArticle[] | undefined,
        ohlc: data.ohlc_data as OHLCData | undefined,
      },
      apiCallsToday,
      canCallApi,
      cacheStatus: {
        timeseries: { isCached: !!data.timeseries_data, isExpired: isDataExpired(data.timeseries_fetched_at) },
        fluctuation: { isCached: !!data.fluctuation_data, isExpired: isDataExpired(data.fluctuation_fetched_at) },
        news: { isCached: !!data.news_data, isExpired: isDataExpired(data.news_fetched_at) },
        ohlc: { isCached: !!data.ohlc_data, isExpired: isDataExpired(data.ohlc_fetched_at) },
      }
    };
  } catch (e) {
    console.error("Error reading market data cache:", e);
    return { 
      data: null, 
      apiCallsToday: 0, 
      canCallApi: true,
      cacheStatus: {
        timeseries: { isCached: false, isExpired: true },
        fluctuation: { isCached: false, isExpired: true },
        news: { isCached: false, isExpired: true },
        ohlc: { isCached: false, isExpired: true },
      }
    };
  }
}

async function saveMarketDataCache(
  supabase: ReturnType<typeof createClient>,
  updateData: {
    timeseries_data?: TimeseriesData;
    fluctuation_data?: FluctuationData;
    news_data?: NewsArticle[];
    ohlc_data?: OHLCData;
  },
  incrementApiCall: boolean
): Promise<void> {
  const now = new Date();
  const today = formatDate(now);

  try {
    const { data: existing } = await supabase
      .from('scrap_metal_market_data')
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

    const upsertData: Record<string, unknown> = {
      id: 'current',
      api_calls_today: apiCallsToday,
      last_api_call_date: today,
      updated_at: now.toISOString(),
    };

    if (updateData.timeseries_data) {
      upsertData.timeseries_data = updateData.timeseries_data;
      upsertData.timeseries_fetched_at = now.toISOString();
    }
    if (updateData.fluctuation_data) {
      upsertData.fluctuation_data = updateData.fluctuation_data;
      upsertData.fluctuation_fetched_at = now.toISOString();
    }
    if (updateData.news_data) {
      upsertData.news_data = updateData.news_data;
      upsertData.news_fetched_at = now.toISOString();
    }
    if (updateData.ohlc_data) {
      upsertData.ohlc_data = updateData.ohlc_data;
      upsertData.ohlc_fetched_at = now.toISOString();
    }

    await supabase
      .from('scrap_metal_market_data')
      .upsert(upsertData);

    console.log(`Market data cache saved, API calls today: ${apiCallsToday}`);
  } catch (e) {
    console.error("Error saving market data cache:", e);
  }
}

// ============ API FETCH FUNCTIONS ============

async function fetchLivePrices(): Promise<ScrapMetalPrices | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  if (!METALS_API_KEY) {
    console.log("No METALS_API_KEY configured");
    return null;
  }

  try {
    const url = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=XCU,XAL,FE,NI`;
    console.log("Fetching latest prices from Metals-API...");
    
    const response = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!response.ok) {
      console.error("Metals-API HTTP error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Metals-API response:", JSON.stringify(data).substring(0, 500));
    
    if (!data.success) {
      console.error("Metals-API error response:", JSON.stringify(data.error || data));
      return null;
    }
    
    if (!data.rates) {
      console.error("Metals-API missing rates in response:", JSON.stringify(data));
      return null;
    }

    const copperPerOz = data.rates.XCU ? 1 / data.rates.XCU : null;
    const aluminumPerOz = data.rates.XAL ? 1 / data.rates.XAL : null;
    const ironPerTon = data.rates.FE ? 1 / data.rates.FE : null;
    const nickelPerOz = data.rates.NI ? 1 / data.rates.NI : null;

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

async function fetchTimeseries(): Promise<TimeseriesData | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  if (!METALS_API_KEY) return null;

  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday (API requirement)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 8); // 7 days of data

    const url = `https://metals-api.com/api/timeseries?access_key=${METALS_API_KEY}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&symbols=XCU,XAL,FE,NI&base=USD`;
    console.log("Fetching timeseries from Metals-API...");
    
    const response = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!response.ok) {
      console.error("Timeseries API HTTP error:", response.status, response.statusText);
      return null;
    }

    const rawData = await response.json();
    // API response may be wrapped in a 'data' object
    const data = rawData.data || rawData;
    console.log("Timeseries API response:", JSON.stringify(rawData).substring(0, 500));
    
    if (!data.success) {
      console.error("Timeseries API error response:", JSON.stringify(data.error || data));
      return null;
    }
    
    if (!data.rates) {
      console.error("Timeseries API missing rates:", JSON.stringify(data));
      return null;
    }

    return data.rates as TimeseriesData;
  } catch (error) {
    console.error("Error fetching timeseries:", error);
    return null;
  }
}

async function fetchFluctuation(): Promise<FluctuationData | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  if (!METALS_API_KEY) return null;

  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 8);

    const url = `https://metals-api.com/api/fluctuation?access_key=${METALS_API_KEY}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&symbols=XCU,XAL,FE,NI&base=USD`;
    console.log("Fetching fluctuation from Metals-API...");
    
    const response = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!response.ok) {
      console.error("Fluctuation API HTTP error:", response.status, response.statusText);
      return null;
    }

    const rawData = await response.json();
    // API response may be wrapped in a 'data' object
    const data = rawData.data || rawData;
    console.log("Fluctuation API response:", JSON.stringify(rawData).substring(0, 500));
    
    if (!data.success) {
      console.error("Fluctuation API error response:", JSON.stringify(data.error || data));
      return null;
    }
    
    if (!data.rates) {
      console.error("Fluctuation API missing rates:", JSON.stringify(data));
      return null;
    }

    return data.rates as FluctuationData;
  } catch (error) {
    console.error("Error fetching fluctuation:", error);
    return null;
  }
}

async function fetchNews(): Promise<NewsArticle[] | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  if (!METALS_API_KEY) return null;

  try {
    const url = `https://metals-api.com/api/get-news?access_key=${METALS_API_KEY}&page=1`;
    console.log("Fetching news from Metals-API...");
    
    const response = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!response.ok) {
      console.error("News API HTTP error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("News API response structure:", JSON.stringify(Object.keys(data)));
    console.log("News API response preview:", JSON.stringify(data).substring(0, 500));
    
    if (!data.success) {
      console.error("News API error response:", JSON.stringify(data.error || data));
      return null;
    }

    // Handle different response structures - API returns data.news.data
    let articles: NewsArticle[] = [];
    
    if (Array.isArray(data.data)) {
      articles = data.data;
    } else if (data.data?.news?.data && Array.isArray(data.data.news.data)) {
      // Actual structure: { data: { news: { data: [...] } } }
      articles = data.data.news.data.map((item: { title?: string; article?: string; url?: string; source?: string; published_at?: string }) => ({
        title: item.title || '',
        description: item.article || '',
        url: item.url || '',
        source: item.source || 'Metals-API',
        published_at: item.published_at || new Date().toISOString(),
      }));
    } else if (data.data && Array.isArray(data.data.articles)) {
      articles = data.data.articles;
    } else if (data.data && Array.isArray(data.data.news)) {
      articles = data.data.news;
    } else if (data.articles && Array.isArray(data.articles)) {
      articles = data.articles;
    } else if (data.news && Array.isArray(data.news)) {
      articles = data.news;
    } else {
      console.warn("News API: Could not find articles array in response:", JSON.stringify(data).substring(0, 300));
      return [];
    }

    // Return top 5 articles
    return articles.slice(0, 5);
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
}

async function fetchOHLC(): Promise<OHLCData | null> {
  const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
  
  if (!METALS_API_KEY) return null;

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const url = `https://metals-api.com/api/ohlc?access_key=${METALS_API_KEY}&date=${formatDate(yesterday)}&symbols=XCU,XAL,FE,NI&base=USD`;
    console.log("Fetching OHLC from Metals-API...");
    
    const response = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!response.ok) {
      console.error("OHLC API HTTP error:", response.status, response.statusText);
      return null;
    }

    const rawData = await response.json();
    // API response may be wrapped in a 'data' object
    const data = rawData.data || rawData;
    console.log("OHLC API response:", JSON.stringify(rawData).substring(0, 500));
    
    if (!data.success) {
      console.error("OHLC API error response:", JSON.stringify(data.error || data));
      return null;
    }
    
    if (!data.rates) {
      console.error("OHLC API missing rates:", JSON.stringify(data));
      return null;
    }

    return data.rates as OHLCData;
  } catch (error) {
    console.error("Error fetching OHLC:", error);
    return null;
  }
}

// Process timeseries data to generate sparkline-ready trends
function processTimeseriesForTrends(timeseriesData: TimeseriesData): Record<string, { prices: number[]; dates: string[]; changePercent: number }> {
  const symbols = ['XCU', 'XAL', 'FE', 'NI'];
  const result: Record<string, { prices: number[]; dates: string[]; changePercent: number }> = {};

  for (const symbol of symbols) {
    const dates = Object.keys(timeseriesData).sort();
    const prices: number[] = [];

    for (const date of dates) {
      const rate = timeseriesData[date]?.[symbol];
      if (rate) {
        // Convert rate to USD per lb (invert and convert)
        const pricePerOz = 1 / rate;
        const pricePerLb = pricePerOz * 14.5833;
        prices.push(Math.round(pricePerLb * 100) / 100);
      }
    }

    if (prices.length >= 2) {
      const changePercent = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
      result[symbol] = {
        prices,
        dates,
        changePercent: Math.round(changePercent * 100) / 100,
      };
    }
  }

  return result;
}

// ============ REQUEST HANDLER ============

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json().catch(() => ({ action: 'get-prices' }));
    const supabase = getSupabaseClient();

    // ============ PRICE ACTIONS ============

    if (action === 'get-prices') {
      const cache = await getCachedPrices(supabase);

      if (cache.prices && !cache.isExpired) {
        console.log("Returning cached prices (not expired)");
        return new Response(
          JSON.stringify({ success: true, prices: { ...cache.prices, source: 'cached' } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (cache.prices && !cache.canCallApi) {
        console.log(`Rate limited (${cache.apiCallsToday}/${MAX_PRICE_API_CALLS_PER_DAY} calls today), returning stale cache`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            prices: { ...cache.prices, source: 'cached' },
            warning: `Rate limited - using cached data (${cache.apiCallsToday}/${MAX_PRICE_API_CALLS_PER_DAY} API calls today)`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const livePrices = await fetchLivePrices();

      if (livePrices) {
        await savePricesToCache(supabase, livePrices, true);
        return new Response(
          JSON.stringify({ success: true, prices: livePrices }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
            error: `Rate limited: ${cache.apiCallsToday}/${MAX_PRICE_API_CALLS_PER_DAY} API calls used today. Try again tomorrow.`,
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

    // ============ MARKET INTELLIGENCE ACTIONS ============

    // Debug action to clear cache and force refetch
    if (action === 'clear-market-cache') {
      try {
        await supabase
          .from('scrap_metal_market_data')
          .delete()
          .eq('id', 'current');
        
        return new Response(
          JSON.stringify({ success: true, message: 'Market data cache cleared' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to clear cache' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === 'get-market-data') {
      const cache = await getMarketDataCache(supabase);
      
      const marketData: MarketData = {};
      let needsFetch = false;
      const fetchTypes: string[] = [];

      // Check what data we need to fetch
      if (!cache.cacheStatus.timeseries.isCached || cache.cacheStatus.timeseries.isExpired) {
        needsFetch = true;
        fetchTypes.push('timeseries');
      } else if (cache.data?.timeseries) {
        marketData.timeseries = cache.data.timeseries;
      }

      if (!cache.cacheStatus.fluctuation.isCached || cache.cacheStatus.fluctuation.isExpired) {
        needsFetch = true;
        fetchTypes.push('fluctuation');
      } else if (cache.data?.fluctuation) {
        marketData.fluctuation = cache.data.fluctuation;
      }

      if (!cache.cacheStatus.news.isCached || cache.cacheStatus.news.isExpired) {
        needsFetch = true;
        fetchTypes.push('news');
      } else if (cache.data?.news) {
        marketData.news = cache.data.news;
      }

      if (!cache.cacheStatus.ohlc.isCached || cache.cacheStatus.ohlc.isExpired) {
        needsFetch = true;
        fetchTypes.push('ohlc');
      } else if (cache.data?.ohlc) {
        marketData.ohlc = cache.data.ohlc;
      }

      // If we need fresh data and can call API
      if (needsFetch && cache.canCallApi && fetchTypes.length > 0) {
        console.log(`Fetching fresh market data: ${fetchTypes.join(', ')}`);
        
        // Fetch only what we need (1 API call for all - we batch logically)
        const updateData: Record<string, unknown> = {};
        let madeApiCall = false;

        // Fetch timeseries (1 call covers trends + sparklines)
        if (fetchTypes.includes('timeseries')) {
          const timeseries = await fetchTimeseries();
          if (timeseries) {
            const processedTrends = processTimeseriesForTrends(timeseries);
            marketData.timeseries = { data: timeseries, processedTrends };
            updateData.timeseries_data = timeseries;
            madeApiCall = true;
          }
        }

        // Fetch fluctuation (for volatility)
        if (fetchTypes.includes('fluctuation') && cache.apiCallsToday < MAX_MARKET_API_CALLS_PER_DAY) {
          const fluctuation = await fetchFluctuation();
          if (fluctuation) {
            marketData.fluctuation = fluctuation;
            updateData.fluctuation_data = fluctuation;
            madeApiCall = true;
          }
        }

        // Fetch news
        if (fetchTypes.includes('news') && cache.apiCallsToday < MAX_MARKET_API_CALLS_PER_DAY) {
          const news = await fetchNews();
          if (news) {
            marketData.news = news;
            updateData.news_data = news;
            madeApiCall = true;
          }
        }

        // Fetch OHLC
        if (fetchTypes.includes('ohlc') && cache.apiCallsToday < MAX_MARKET_API_CALLS_PER_DAY) {
          const ohlc = await fetchOHLC();
          if (ohlc) {
            marketData.ohlc = ohlc;
            updateData.ohlc_data = ohlc;
            madeApiCall = true;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await saveMarketDataCache(supabase, updateData, madeApiCall);
        }
      }

      // Process timeseries trends if not already done
      if (marketData.timeseries?.data && !marketData.timeseries.processedTrends) {
        marketData.timeseries.processedTrends = processTimeseriesForTrends(marketData.timeseries.data);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          marketData,
          cacheStatus: cache.cacheStatus,
          apiCallsToday: cache.apiCallsToday,
          maxCallsPerDay: MAX_MARKET_API_CALLS_PER_DAY,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'get-timeseries') {
      const cache = await getMarketDataCache(supabase);
      
      // Return cached if available and not expired
      if (cache.data?.timeseries && !cache.cacheStatus.timeseries.isExpired) {
        const processedTrends = processTimeseriesForTrends(cache.data.timeseries.data);
        return new Response(
          JSON.stringify({ success: true, timeseries: cache.data.timeseries.data, trends: processedTrends, source: 'cached' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!cache.canCallApi) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Rate limited (${cache.apiCallsToday}/${MAX_MARKET_API_CALLS_PER_DAY} calls today)`,
            timeseries: cache.data?.timeseries?.data || null,
            source: 'cached'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const timeseries = await fetchTimeseries();
      if (timeseries) {
        await saveMarketDataCache(supabase, { timeseries_data: timeseries }, true);
        const processedTrends = processTimeseriesForTrends(timeseries);
        return new Response(
          JSON.stringify({ success: true, timeseries, trends: processedTrends, source: 'live' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Could not fetch timeseries data' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'get-fluctuation') {
      const cache = await getMarketDataCache(supabase);
      
      if (cache.data?.fluctuation && !cache.cacheStatus.fluctuation.isExpired) {
        return new Response(
          JSON.stringify({ success: true, fluctuation: cache.data.fluctuation, source: 'cached' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!cache.canCallApi) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Rate limited (${cache.apiCallsToday}/${MAX_MARKET_API_CALLS_PER_DAY} calls today)`,
            fluctuation: cache.data?.fluctuation || null,
            source: 'cached'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fluctuation = await fetchFluctuation();
      if (fluctuation) {
        await saveMarketDataCache(supabase, { fluctuation_data: fluctuation }, true);
        return new Response(
          JSON.stringify({ success: true, fluctuation, source: 'live' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Could not fetch fluctuation data' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'get-news') {
      const cache = await getMarketDataCache(supabase);
      
      if (cache.data?.news && !cache.cacheStatus.news.isExpired) {
        return new Response(
          JSON.stringify({ success: true, news: cache.data.news, source: 'cached' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!cache.canCallApi) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Rate limited (${cache.apiCallsToday}/${MAX_MARKET_API_CALLS_PER_DAY} calls today)`,
            news: cache.data?.news || null,
            source: 'cached'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const news = await fetchNews();
      if (news) {
        await saveMarketDataCache(supabase, { news_data: news }, true);
        return new Response(
          JSON.stringify({ success: true, news, source: 'live' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Could not fetch news' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'status') {
      const priceCache = await getCachedPrices(supabase);
      const marketCache = await getMarketDataCache(supabase);
      
      return new Response(
        JSON.stringify({
          success: true,
          status: {
            prices: {
              hasCachedData: !!priceCache.prices,
              isExpired: priceCache.isExpired,
              apiCallsToday: priceCache.apiCallsToday,
              maxCallsPerDay: MAX_PRICE_API_CALLS_PER_DAY,
              canCallApi: priceCache.canCallApi,
            },
            marketData: {
              apiCallsToday: marketCache.apiCallsToday,
              maxCallsPerDay: MAX_MARKET_API_CALLS_PER_DAY,
              canCallApi: marketCache.canCallApi,
              cacheStatus: marketCache.cacheStatus,
            },
            cacheDurationHours: CACHE_DURATION_HOURS,
            estimatedMonthlyUsage: `~${(MAX_PRICE_API_CALLS_PER_DAY + MAX_MARKET_API_CALLS_PER_DAY) * 30} of 2,500 calls`,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ GET ALL METALS (including precious) ============
    if (action === 'get-all-metals') {
      const METALS_API_KEY = Deno.env.get("METALS_API_KEY");
      
      // Default spot prices for all metals
      const defaultSpotPrices = {
        gold: 2347.80,
        silver: 27.45,
        platinum: 967.20,
        palladium: 1012.50,
        copper: 4.52,
        aluminum: 1.15,
        iron: 0.055,
        nickel: 8.00,
      };
      
      if (!METALS_API_KEY) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            spotPrices: defaultSpotPrices,
            source: 'default',
            lastUpdated: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const spotPrices = { ...defaultSpotPrices };
        let source: 'live' | 'default' = 'default';

        // Try precious metals first (should work on most plans)
        const preciousSymbols = 'XAU,XAG,XPT,XPD';
        const preciousUrl = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=${preciousSymbols}`;
        
        console.log("Fetching precious metal prices from Metals-API...");
        try {
          const preciousResponse = await fetch(preciousUrl, { headers: { "Accept": "application/json" } });
          if (preciousResponse.ok) {
            const preciousData = await preciousResponse.json();
            console.log("Precious metals response:", JSON.stringify(preciousData).substring(0, 300));
            
            if (preciousData.success && preciousData.rates) {
              const round = (n: number, decimals = 2) => Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
              
              if (preciousData.rates.XAU) spotPrices.gold = round(1 / preciousData.rates.XAU);
              if (preciousData.rates.XAG) spotPrices.silver = round(1 / preciousData.rates.XAG);
              if (preciousData.rates.XPT) spotPrices.platinum = round(1 / preciousData.rates.XPT);
              if (preciousData.rates.XPD) spotPrices.palladium = round(1 / preciousData.rates.XPD);
              source = 'live';
            }
          }
        } catch (e) {
          console.error("Error fetching precious metals:", e);
        }

        // Try industrial metals separately (may fail on free plan)
        const industrialSymbols = 'XCU,XAL,FE,NI';
        const industrialUrl = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=${industrialSymbols}`;
        
        console.log("Fetching industrial metal prices from Metals-API...");
        try {
          const industrialResponse = await fetch(industrialUrl, { headers: { "Accept": "application/json" } });
          if (industrialResponse.ok) {
            const industrialData = await industrialResponse.json();
            console.log("Industrial metals response:", JSON.stringify(industrialData).substring(0, 300));
            
            if (industrialData.success && industrialData.rates) {
              const round = (n: number, decimals = 2) => Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
              
              if (industrialData.rates.XCU) spotPrices.copper = round((1 / industrialData.rates.XCU) * 14.5833);
              if (industrialData.rates.XAL) spotPrices.aluminum = round((1 / industrialData.rates.XAL) * 14.5833);
              if (industrialData.rates.FE) spotPrices.iron = round((1 / industrialData.rates.FE) / 2204.62, 3);
              if (industrialData.rates.NI) spotPrices.nickel = round((1 / industrialData.rates.NI) * 14.5833);
              source = 'live';
            }
          }
        } catch (e) {
          console.error("Error fetching industrial metals:", e);
        }

        // Try to get fluctuation data for % changes
        let fluctuation: FluctuationData | undefined;
        const marketCache = await getMarketDataCache(supabase);
        if (marketCache.data?.fluctuation) {
          fluctuation = marketCache.data.fluctuation;
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            spotPrices,
            fluctuation,
            source,
            lastUpdated: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error fetching all metals:", error);
        return new Response(
          JSON.stringify({ 
            success: true, 
            spotPrices: defaultSpotPrices,
            source: 'default',
            lastUpdated: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action. Valid: get-prices, refresh, get-market-data, get-timeseries, get-fluctuation, get-news, get-all-metals, status' }),
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
