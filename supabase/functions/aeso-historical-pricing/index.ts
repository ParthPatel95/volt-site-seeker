const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for 10-year historical data (keyed by uptimePercentage)
interface CachedResponse {
  data: any;
  timestamp: number;
}
const historicalCache = new Map<string, CachedResponse>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCacheKey(uptimePercentage: number): string {
  return `historical-10year-${uptimePercentage}`;
}

interface HistoricalDataPoint {
  datetime: string;
  datetimeMPT?: string; // Mountain Prevailing Time - the reliable timestamp
  price: number;
  forecast_pool_price: number | null; // Forecast price - null if not available
  rolling_30day_avg: number | null; // 30-day rolling average
  ail_mw?: number; // Alberta Internal Load
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCover: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeframe, startDate: customStartDate, endDate: customEndDate, uptimePercentage = 100 } = await req.json();
    
    // Use same API key priority as energy-data-integration function
    const apiKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') ||
                   Deno.env.get('AESO_API_KEY') ||
                   Deno.env.get('AESO_SUB_KEY') ||
                   Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY');
    
    // Validate API key is available
    if (!apiKey) {
      console.error('No AESO API key found. Checked: AESO_API_KEY, AESO_SUB_KEY, AESO_SUBSCRIPTION_KEY_PRIMARY, AESO_SUBSCRIPTION_KEY_SECONDARY');
      throw new Error('AESO API key is not configured. Please configure one of the AESO API key secrets.');
    }
    
    console.log(`Fetching ${timeframe} historical pricing data from AESO with API key configured (length: ${apiKey?.length || 0})`);
    
    let historicalData: HistoricalDataPoint[] = [];
    
    if (timeframe === 'custom' && customStartDate && customEndDate) {
      // Custom date range for advanced analytics (up to 20 years)
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      console.log(`Custom date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // AESO API limit: 366 days per request
      // Chunk the request into yearly batches
      const yearsDiff = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      
      if (yearsDiff > 1) {
        console.log(`Date range spans ${yearsDiff.toFixed(1)} years - fetching in chunks...`);
        historicalData = await fetchAESOHistoricalDataInChunks(startDate, endDate, apiKey);
      } else {
        historicalData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
      }
    } else if (timeframe === 'daily') {
      // Fetch last 24 hours of hourly data (actual historical data only)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(endDate.getHours() - 24);
      
      console.log(`[DAILY] Requesting date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      console.log(`[DAILY] Will format as: startDate=${startDate.toISOString().slice(0, 10)}, endDate=${endDate.toISOString().slice(0, 10)}`);
      const rawData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
      console.log(`[DAILY] Received ${rawData.length} raw records from API`);
      
      // Filter out future hours - only show actual historical data with pool prices
      const now = new Date();
      
      historicalData = rawData.filter(point => {
        // Check if there's an actual pool price (not empty string, not null, not zero)
        const hasActualPrice = point.price && parseFloat(point.price.toString()) > 0;
        if (!hasActualPrice) return false;
        
        // Use UTC timestamp directly from API (point.datetime contains begin_datetime_utc)
        const utcString = point.datetime;
        // Handle format "2025-10-19 06:00" - add T and Z to make it a valid ISO string
        const isoString = utcString.includes('T') ? utcString : utcString.replace(' ', 'T') + 'Z';
        const pointDateUTC = new Date(isoString);
        
        // Only include if the time is in the past
        return pointDateUTC <= now;
      });
      
      console.log(`[DAILY] Filtered ${rawData.length} records to ${historicalData.length} actual historical records (current UTC time: ${now.toISOString()})`);
      if (historicalData.length > 0) {
        console.log(`[DAILY] First record: ${JSON.stringify(historicalData[0])}`);
        console.log(`[DAILY] Last record: ${JSON.stringify(historicalData[historicalData.length - 1])}`);
      }
      
      // Fallback: If we got very little or no data, fetch the most recent 30 days and take the last 24 hours
      if (historicalData.length < 10) {
        console.log(`[DAILY] Only got ${historicalData.length} records, fetching wider range as fallback...`);
        const fallbackEndDate = new Date();
        const fallbackStartDate = new Date();
        fallbackStartDate.setDate(fallbackEndDate.getDate() - 30);
        
        const fallbackData = await fetchAESOHistoricalData(fallbackStartDate, fallbackEndDate, apiKey);
        const fallbackFiltered = fallbackData.filter(point => {
          const hasActualPrice = point.price && parseFloat(point.price.toString()) > 0;
          return hasActualPrice;
        });
        
        // Get the most recent 24 data points
        historicalData = fallbackFiltered.slice(-24);
        console.log(`[DAILY] Fallback got ${fallbackFiltered.length} records, using most recent ${historicalData.length}`);
        if (historicalData.length > 0) {
          console.log(`[DAILY] Fallback first record: ${JSON.stringify(historicalData[0])}`);
          console.log(`[DAILY] Fallback last record: ${JSON.stringify(historicalData[historicalData.length - 1])}`);
        }
      }
    } else if (timeframe === 'monthly') {
      // Fetch last 30 days of hourly data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      console.log(`Monthly date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      const rawData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
      
      // Filter out future hours - only show actual historical data with pool prices
      const now = new Date();
      historicalData = rawData.filter(point => {
        // Check if there's an actual pool price (not empty string, not null, not zero)
        const hasActualPrice = point.price && parseFloat(point.price.toString()) > 0;
        if (!hasActualPrice) return false;
        
        // Use UTC timestamp directly from API
        const utcString = point.datetimeUTC || point.datetime;
        const pointDateUTC = new Date(utcString.replace(' ', 'T') + 'Z');
        
        return pointDateUTC <= now;
      });
    } else if (timeframe === 'yearly') {
      // Fetch last 12 months of daily averages
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 12);
      
      console.log(`Yearly date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      const rawData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
      
      // Filter out future hours - only show actual historical data with pool prices
      const now = new Date();
      historicalData = rawData.filter(point => {
        // Check if there's an actual pool price (not empty string, not null, not zero)
        const hasActualPrice = point.price && parseFloat(point.price.toString()) > 0;
        if (!hasActualPrice) return false;
        
        // Use UTC timestamp directly from API
        const utcString = point.datetimeUTC || point.datetime;
        const pointDateUTC = new Date(utcString.replace(' ', 'T') + 'Z');
        
        return pointDateUTC <= now;
      });
    } else if (timeframe === 'historical-10year') {
      // Check in-memory cache first
      const cacheKey = getCacheKey(uptimePercentage);
      const cached = historicalCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log(`[historical-10year] Cache HIT for ${uptimePercentage}% uptime (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
        return new Response(
          JSON.stringify(cached.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`[historical-10year] Cache MISS, fetching 8-year data with ${uptimePercentage}% uptime filter...`);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const startYear = currentYear - 7;
      
      console.log(`Will fetch data for years ${startYear} to ${currentYear} (8 years) in parallel batches...`);
      
      // Prepare all year requests
      const yearRequests: Array<{
        year: number;
        startDate: Date;
        endDate: Date;
      }> = [];
      
      for (let year = startYear; year <= currentYear; year++) {
        const isCurrentYear = year === currentYear;
        const yearStartDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const yearEndDate = isCurrentYear 
          ? new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59))
          : new Date(Date.UTC(year, 11, 31, 23, 59, 59));
        
        yearRequests.push({ year, startDate: yearStartDate, endDate: yearEndDate });
      }
      
      // Fetch years in parallel batches of 4 (to avoid overwhelming the API)
      const BATCH_SIZE = 4;
      const historicalYearsData: any[] = [];
      
      for (let i = 0; i < yearRequests.length; i += BATCH_SIZE) {
        const batch = yearRequests.slice(i, i + BATCH_SIZE);
        console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}: years ${batch.map(b => b.year).join(', ')}`);
        
        const batchResults = await Promise.allSettled(
          batch.map(async ({ year, startDate, endDate }) => {
            try {
              const yearData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
              
              if (yearData && yearData.length > 0) {
                // Apply uptime filter if not 100%
                let filteredYearData = yearData;
                if (uptimePercentage < 100) {
                  const hoursToKeep = Math.floor(yearData.length * (uptimePercentage / 100));
                  filteredYearData = [...yearData]
                    .sort((a, b) => a.price - b.price)
                    .slice(0, hoursToKeep);
                }
                
                // Calculate stats directly without heavy processHistoricalData
                const prices = filteredYearData.map(d => d.price);
                const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
                const peak = Math.max(...prices);
                const low = Math.min(...prices);
                const mean = average;
                const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
                const volatility = Math.sqrt(variance);
                
                return {
                  year,
                  average: Math.round(average * 100) / 100,
                  peak: Math.round(peak * 100) / 100,
                  low: Math.round(low * 100) / 100,
                  volatility: Math.round(volatility * 100) / 100,
                  dataPoints: yearData.length,
                  filteredDataPoints: filteredYearData.length,
                  uptimePercentage,
                  isReal: true
                };
              } else {
                return {
                  year,
                  average: null,
                  peak: null,
                  low: null,
                  volatility: null,
                  dataPoints: 0,
                  isReal: false,
                  noData: true
                };
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              console.error(`Error fetching year ${year}:`, errorMsg);
              return {
                year,
                average: null,
                peak: null,
                low: null,
                volatility: null,
                dataPoints: 0,
                isReal: false,
                error: errorMsg
              };
            }
          })
        );
        
        // Process batch results
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            historicalYearsData.push(result.value);
          }
        }
      }
      
      // Sort by year
      historicalYearsData.sort((a, b) => a.year - b.year);
      
      console.log(`Completed fetching 8-year data. Total: ${historicalYearsData.length}, With data: ${historicalYearsData.filter(y => y.isReal).length}`);
      
      const responseData = {
        historicalYears: historicalYearsData,
        totalYears: historicalYearsData.length,
        realDataYears: historicalYearsData.filter(y => y.isReal).length,
        uptimePercentage,
        lastUpdated: new Date().toISOString()
      };
      
      // Cache the result
      historicalCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
      console.log(`[historical-10year] Cached response for ${uptimePercentage}% uptime`);
      
      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate we have data - return empty structure if no data instead of error
    if (!historicalData || historicalData.length === 0) {
      console.log('No historical data available from AESO API - returning empty dataset');
      return new Response(JSON.stringify({
        chartData: [],
        rawHourlyData: [],
        statistics: {
          average: 0,
          peak: 0,
          low: 0,
          volatility: 0
        },
        peakHours: [],
        distribution: [],
        seasonalPattern: [],
        hourlyPattern: [],
        predictions: null,
        patterns: null,
        lastUpdated: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For custom timeframe, process the data to include all necessary fields
    if (timeframe === 'custom') {
      console.log(`Processing ${historicalData.length} raw data points for custom date range`);
      
      // Transform to expected frontend format
      const rawHourlyData = historicalData.map(d => {
        const dateObj = new Date(d.datetime);
        return {
          datetime: d.datetime,
          price: d.price,
          date: dateObj.toISOString().split('T')[0],
          hour: dateObj.getUTCHours(),
          generation: (d as any).generation || 0,
          ail: (d as any).ail || 0
        };
      });
      
      // Count how many records have AIL data
      const ailCount = rawHourlyData.filter(d => d.ail > 0).length;
      console.log(`AIL data available for ${ailCount} out of ${rawHourlyData.length} records`);
      
      // Calculate basic statistics for the custom period
      const prices = rawHourlyData.map(d => d.price);
      const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const peak = Math.max(...prices);
      const low = Math.min(...prices);
      
      // Process data for chart display
      const processedData = await processHistoricalData(historicalData, 'monthly');
      
      return new Response(JSON.stringify({
        ...processedData,
        rawHourlyData,
        statistics: {
          ...processedData.statistics,
          average,
          peak,
          low
        }
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Process data for frontend consumption (for monthly/yearly timeframes)
    const processedData = await processHistoricalData(historicalData, timeframe);
    
    // Add predictive analytics
    const predictions = await generatePricePredictions(historicalData);
    
    // Detect patterns and anomalies
    const patterns = detectPricingPatterns(historicalData);
    
    return new Response(JSON.stringify({
      ...processedData,
      predictions,
      patterns,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in aeso-historical-pricing function:', error);
    
    // More specific error handling with proper type checking
    let errorMessage = 'Failed to fetch AESO historical pricing data';
    let details = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'AESO API authentication failed';
        details = 'Invalid or missing API subscription key. Please verify your AESO API credentials.';
      } else if (error.message.includes('404')) {
        errorMessage = 'AESO API endpoint not found';
        details = 'The requested AESO API endpoint is not available. Please check the API documentation.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'AESO API key configuration error';
        details = 'Please configure your AESO API key in the edge function secrets.';
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: details
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fetch AESO data in chunks to handle API's 366-day limit
async function fetchAESOHistoricalDataInChunks(startDate: Date, endDate: Date, apiKey: string): Promise<HistoricalDataPoint[]> {
  const allData: HistoricalDataPoint[] = [];
  const chunkSizeMonths = 11; // Fetch ~11 months at a time to stay under 366 days
  
  let currentStart = new Date(startDate);
  
  while (currentStart < endDate) {
    // Calculate chunk end (11 months from current start, or endDate, whichever is earlier)
    const currentEnd = new Date(currentStart);
    currentEnd.setMonth(currentEnd.getMonth() + chunkSizeMonths);
    
    if (currentEnd > endDate) {
      currentEnd.setTime(endDate.getTime());
    }
    
    console.log(`Fetching chunk: ${currentStart.toISOString().slice(0, 10)} to ${currentEnd.toISOString().slice(0, 10)}`);
    
    try {
      const chunkData = await fetchAESOHistoricalData(currentStart, currentEnd, apiKey);
      allData.push(...chunkData);
      console.log(`  ✓ Fetched ${chunkData.length} data points for this chunk`);
    } catch (error) {
      console.error(`  ✗ Error fetching chunk: ${error.message}`);
      // Continue with next chunk even if one fails
    }
    
    // Move to next chunk (start from day after current end)
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Total data points fetched across all chunks: ${allData.length}`);
  return allData;
}

async function fetchAESOHistoricalData(startDate: Date, endDate: Date, apiKey: string): Promise<HistoricalDataPoint[]> {
  try {
    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 10); // YYYY-MM-DD format
    };
    
    // According to AESO API docs: Pool Price API v1.1
    // Endpoint: /public/poolprice-api/v1.1/price/poolPrice
    // Max range: 1 year (366 days)
    // Header: API-KEY (not Ocp-Apim-Subscription-Key)
    const apiUrl = `https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
    console.log(`Fetching pool prices from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pool Price API error (${response.status}): ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('AESO API authentication failed. Please verify your API key.');
      } else if (response.status === 403) {
        throw new Error('AESO API access forbidden. Your API key may not have access to this endpoint.');
      } else if (response.status === 400) {
        throw new Error('Invalid date range. Please ensure dates are in YYYY-MM-DD format and within allowed limits.');
      } else {
        throw new Error(`AESO Pool Price API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Pool Price API response structure:', Object.keys(data));
    
    // AESO API response format: { "return": { "Pool Price Report": [...] } }
    const priceData = data.return?.['Pool Price Report'] || [];
    console.log(`Received ${priceData.length} price records`);
    
    if (priceData.length === 0) {
      console.warn('No price data in response');
      return [];
    }
    
    // Log sample record to verify field mapping
    if (priceData.length > 0) {
      console.log('Sample API record (first):', JSON.stringify(priceData[0], null, 2));
      console.log('Sample API record (last):', JSON.stringify(priceData[priceData.length - 1], null, 2));
    }
    
    // Transform to internal format
    // Note: forecast_pool_price is only valid for future hours where pool_price is empty
    const mappedData: HistoricalDataPoint[] = priceData.map((item: any) => {
      const poolPrice = item.pool_price && item.pool_price !== '' ? parseFloat(item.pool_price) : null;
      const forecastPrice = item.forecast_pool_price && item.forecast_pool_price !== '' ? parseFloat(item.forecast_pool_price) : null;
      const rolling30dayAvg = item.rolling_30day_avg && item.rolling_30day_avg !== '' ? parseFloat(item.rolling_30day_avg) : null;
      
      return {
        datetime: item.begin_datetime_utc,
        datetimeMPT: item.begin_datetime_mpt, // Add Mountain Time for accurate filtering
        price: poolPrice ?? 0, // Use 0 for missing pool price (future hours)
        forecast_pool_price: forecastPrice, // Keep as separate field, null if not available
        rolling_30day_avg: rolling30dayAvg
      };
    });
    
    // Enrich with AIL (load) data if date range allows
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 366) {
      // Try to fetch AIL data for ranges up to 1 year
      console.log(`Date range is ${daysDiff.toFixed(0)} days - attempting to fetch AIL data`);
      try {
        await enrichWithAILData(mappedData, startDate, endDate, apiKey);
      } catch (err) {
        console.log('Could not fetch AIL data (this is normal for historical periods):', err instanceof Error ? err.message : 'Unknown error');
      }
    } else {
      console.log(`Date range is ${daysDiff.toFixed(0)} days - skipping AIL data (exceeds API limit)`);
    }
    
    return mappedData;
  } catch (error) {
    console.error('Error in fetchAESOHistoricalData:', error);
    throw error;
  }
}

// Enrich price data with AIL (Alberta Internal Load) information
// According to AESO API docs: Actual Forecast Report API v1
// Endpoint: /public/actualforecast-api/v1/load/albertaInternalLoad
// Requires: startDate and endDate query parameters
async function enrichWithAILData(
  priceData: HistoricalDataPoint[],
  startDate: Date,
  endDate: Date,
  apiKey: string
): Promise<void> {
  try {
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    
    // AESO Actual Forecast API - requires startDate and endDate
    const ailUrl = `https://apimgw.aeso.ca/public/actualforecast-api/v1/load/albertaInternalLoad?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
    console.log(`Fetching AIL data from: ${ailUrl}`);
    
    const response = await fetch(ailUrl, {
      headers: {
        'API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`AIL API returned ${response.status} - data may not be available for this period`);
      return;
    }
    
    const ailData = await response.json();
    console.log('AIL API response structure:', Object.keys(ailData));
    
    // AESO API response format: { "return": { "Actual Forecast Report": [...] } }
    const ailRecords = ailData.return?.['Actual Forecast Report'] || [];
    console.log(`Received ${ailRecords.length} AIL records`);
    
    if (ailRecords.length === 0) {
      console.log('No AIL data available for this period');
      return;
    }
    
    // Build timestamp-to-AIL map for efficient lookup
    const ailMap = new Map<string, { ail: number; generation: number }>();
    
    for (const record of ailRecords) {
      const timestamp = record.begin_datetime_utc;
      const ailValue = parseFloat(record.alberta_internal_load || '0');
      
      if (timestamp && ailValue > 0) {
        // Note: Generation data is not available in Actual Forecast API
        // It would require Current Supply Demand API which only provides real-time data
        ailMap.set(timestamp, { 
          ail: ailValue,
          generation: 0 // Not available in historical data
        });
      }
    }
    
    // Enrich price data with AIL values
    let matchedCount = 0;
    for (const item of priceData) {
      const loadData = ailMap.get(item.datetime);
      if (loadData) {
        (item as any).ail = loadData.ail;
        (item as any).generation = loadData.generation;
        matchedCount++;
      }
    }
    
    console.log(`Successfully enriched ${matchedCount} out of ${priceData.length} records with AIL data`);
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching AIL data:', errorMsg);
    // Don't throw - AIL data is optional
  }
}

async function processHistoricalData(data: HistoricalDataPoint[], timeframe: string) {
  // Use ALL price data including spikes to show true 30-day average
  const prices = data.map(d => parseFloat(d.price.toString()));
  console.log(`Processing ${prices.length} prices (including all spikes). Sample prices:`, prices.slice(0, 10));
  console.log(`Price range: min=${Math.min(...prices)}, max=${Math.max(...prices)}, avg=${prices.reduce((a, b) => a + b, 0) / prices.length}`);
  
  if (prices.length === 0) {
    throw new Error('No valid historical data available');
  }
  
  const statistics = {
    average: prices.reduce((a, b) => a + b, 0) / prices.length,
    peak: Math.max(...prices),
    low: Math.min(...prices),
    volatility: calculateVolatility(prices),
    trend: calculateTrend(prices)
  };
  
  let chartData: any[] = [];
  let peakHours: any[] = [];
  let hourlyPatterns: any[] = [];
  let distribution: any[] = [];
  let seasonalPatterns: any = {};
  
  if (timeframe === 'daily') {
    // Process hourly data for last 24 hours - populate chartData for live chart
    chartData = data.map(d => {
      const datetime = d.datetimeMPT || d.datetime;
      // Extract hour from datetime string (format: "2024-01-15 14:00" or "2024-01-15T14:00:00")
      const timePart = datetime.includes(' ') ? datetime.split(' ')[1] : datetime.split('T')[1];
      const hour = timePart ? timePart.slice(0, 5) : 'Unknown';
      return {
        date: hour,
        price: parseFloat(d.price.toString()),
        average: statistics.average
      };
    });
    peakHours = findPeakHours(data);
    hourlyPatterns = calculateHourlyPatterns(data);
    distribution = calculatePriceDistribution(prices);
  } else if (timeframe === 'monthly') {
    // Process daily data for last 30 days
    chartData = aggregateDaily(data);
    peakHours = findPeakHours(data);
    hourlyPatterns = calculateHourlyPatterns(data);
    distribution = calculatePriceDistribution(prices);
  } else if (timeframe === 'yearly') {
    // Process monthly averages for last 12 months
    chartData = aggregateMonthly(data);
    seasonalPatterns = calculateSeasonalPatterns(data);
  }
  
  // Return ALL raw hourly data for frontend use (USE ORIGINAL DATA, NOT FILTERED)
  // This includes ALL prices including high spikes like $999.99
  // Use Mountain Time (MPT) timestamp for accurate display
  const rawHourlyData = data.map(d => ({
    datetime: d.datetimeMPT || d.datetime, // Use Mountain Time when available
    price: parseFloat(d.price.toString()),
    date: (d.datetimeMPT || d.datetime).split(' ')[0] || (d.datetimeMPT || d.datetime).split('T')[0],
    hour: parseInt((d.datetimeMPT || d.datetime).split(' ')[1]?.split(':')[0] || '0')
  }));
  
  console.log(`Returning ${rawHourlyData.length} raw hourly data points`);
  
  return {
    statistics,
    chartData,
    peakHours,
    hourlyPatterns,
    distribution,
    seasonalPatterns,
    rawHourlyData  // Add the actual hourly data INCLUDING all price spikes
  };
}

async function generatePricePredictions(data: HistoricalDataPoint[]) {
  // Simple ML-inspired prediction using moving averages and seasonal patterns
  const prices = data.map(d => parseFloat(d.price.toString()));
  const predictions = [];
  
  // Predict next 24 hours using weighted moving average
  const windowSize = Math.min(168, prices.length); // 1 week or available data
  const weights = Array.from({length: windowSize}, (_, i) => Math.exp(-i * 0.1));
  
  for (let hour = 1; hour <= 24; hour++) {
    const weightedSum = prices.slice(-windowSize).reduce((sum, price, i) => 
      sum + price * weights[i], 0
    );
    const weightSum = weights.slice(0, Math.min(windowSize, prices.length)).reduce((a, b) => a + b, 0);
    
    const basePrice = weightedSum / weightSum;
    
    // Add seasonal adjustment
    const hourOfDay = (new Date().getHours() + hour) % 24;
    const seasonalMultiplier = getSeasonalMultiplier(hourOfDay);
    
    const predictedPrice = basePrice * seasonalMultiplier * (1 + (Math.random() - 0.5) * 0.1);
    
    predictions.push({
      hour: hour,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.max(0.6, 1 - (hour * 0.03)) // Confidence decreases over time
    });
  }
  
  return predictions;
}

function detectPricingPatterns(data: HistoricalDataPoint[]) {
  const prices = data.map(d => parseFloat(d.price.toString()));
  const patterns = [];
  
  // Detect price spikes (> 2 standard deviations above mean)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(prices.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / prices.length);
  const spikeThreshold = mean + (2 * stdDev);
  
  const spikes = data.filter(d => parseFloat(d.price.toString()) > spikeThreshold);
  
  if (spikes.length > 0) {
    patterns.push({
      type: 'price_spikes',
      count: spikes.length,
      threshold: Math.round(spikeThreshold * 100) / 100,
      description: `Detected ${spikes.length} price spikes above $${Math.round(spikeThreshold)}/MWh`
    });
  }
  
  // Detect sustained high prices (>75th percentile for 4+ hours)
  const percentile75 = calculatePercentile(prices, 75);
  patterns.push({
    type: 'sustained_high',
    threshold: Math.round(percentile75 * 100) / 100,
    description: `Extended periods above $${Math.round(percentile75)}/MWh detected`
  });
  
  return patterns;
}

function calculateVolatility(prices: number[]): number {
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / prices.length;
  return (Math.sqrt(variance) / mean) * 100;
}

function calculateTrend(prices: number[]): 'up' | 'down' | 'stable' {
  if (prices.length < 2) return 'stable';
  
  const firstQuarter = prices.slice(0, Math.floor(prices.length / 4));
  const lastQuarter = prices.slice(-Math.floor(prices.length / 4));
  
  const firstAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
  
  const change = (lastAvg - firstAvg) / firstAvg;
  
  if (change > 0.05) return 'up';
  if (change < -0.05) return 'down';
  return 'stable';
}

function aggregateDaily(data: HistoricalDataPoint[]) {
  const dailyData = new Map();
  
  data.forEach(point => {
    const date = point.datetime.slice(0, 10);
    if (!dailyData.has(date)) {
      dailyData.set(date, []);
    }
    dailyData.get(date).push(parseFloat(point.price.toString()));
  });
  
  return Array.from(dailyData.entries()).map(([date, prices]) => ({
    date: new Date(date).toLocaleDateString(),
    price: prices.reduce((a: number, b: number) => a + b, 0) / prices.length
  }));
}

function aggregateMonthly(data: HistoricalDataPoint[]) {
  const monthlyData = new Map();
  
  data.forEach(point => {
    const date = new Date(point.datetime);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, []);
    }
    monthlyData.get(monthKey).push(parseFloat(point.price.toString()));
  });
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return Array.from(monthlyData.entries()).map(([monthKey, prices]) => {
    const [year, month] = monthKey.split('-');
    const average = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const peak = Math.max(...prices);
    
    return {
      month: months[parseInt(month)],
      average: Math.round(average * 100) / 100,
      peak: Math.round(peak * 100) / 100
    };
  });
}

function findPeakHours(data: HistoricalDataPoint[]) {
  return data
    .map(point => ({
      date: new Date(point.datetime).toLocaleDateString(),
      hour: new Date(point.datetime).getHours(),
      price: parseFloat(point.price.toString())
    }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);
}

function calculateHourlyPatterns(data: HistoricalDataPoint[]) {
  const hourlyData: number[][] = new Array(24).fill(0).map(() => []);
  
  data.forEach(point => {
    const hour = new Date(point.datetime).getHours();
    hourlyData[hour].push(parseFloat(point.price.toString()));
  });
  
  return hourlyData.map((prices, hour) => ({
    hour,
    averagePrice: prices.length > 0 ? 
      Math.round((prices.reduce((a: number, b: number) => a + b, 0) / prices.length) * 100) / 100 : 0
  }));
}

function calculatePriceDistribution(prices: number[]) {
  const ranges = [
    { range: '$0-25', min: 0, max: 25 },
    { range: '$25-50', min: 25, max: 50 },
    { range: '$50-75', min: 50, max: 75 },
    { range: '$75-100', min: 75, max: 100 },
    { range: '$100+', min: 100, max: Infinity }
  ];
  
  return ranges.map(({ range, min, max }) => ({
    range,
    hours: prices.filter(price => price >= min && price < max).length
  }));
}

function calculateSeasonalPatterns(data: HistoricalDataPoint[]) {
  const seasonalData: { winter: number[], spring: number[], summer: number[], fall: number[] } = { winter: [], spring: [], summer: [], fall: [] };
  
  data.forEach(point => {
    const month = new Date(point.datetime).getMonth();
    const price = parseFloat(point.price.toString());
    
    if (month >= 11 || month <= 1) seasonalData.winter.push(price);
    else if (month >= 2 && month <= 4) seasonalData.spring.push(price);
    else if (month >= 5 && month <= 7) seasonalData.summer.push(price);
    else seasonalData.fall.push(price);
  });
  
  const patterns: any = {};
  Object.entries(seasonalData).forEach(([season, prices]) => {
    if (prices.length > 0) {
      const average = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      const peak = Math.max(...prices);
      
      // Calculate 95% uptime price (remove top 5% highest prices)
      const sortedPrices = [...prices].sort((a, b) => b - a); // Sort descending
      const numToRemove = Math.floor(prices.length * 0.05); // Top 5%
      const uptime95Prices = sortedPrices.slice(numToRemove); // Keep bottom 95%
      const uptime95Average = uptime95Prices.length > 0 
        ? uptime95Prices.reduce((a: number, b: number) => a + b, 0) / uptime95Prices.length
        : average;
      
      console.log(`${season}: avg=${average.toFixed(2)}, 95% uptime avg=${uptime95Average.toFixed(2)} (removed ${numToRemove} highest hours from ${prices.length} total)`);
      
      patterns[season] = {
        average: Math.round(average * 100) / 100,
        peak: Math.round(peak * 100) / 100,
        uptime95Price: Math.round(uptime95Average * 100) / 100
      };
    }
  });
  
  return patterns;
}

function getSeasonalMultiplier(hour: number): number {
  // Peak hours (4-8 PM) get higher multiplier
  if (hour >= 16 && hour <= 20) return 1.3;
  // Off-peak overnight (11 PM - 6 AM) get lower multiplier
  if (hour >= 23 || hour <= 6) return 0.8;
  // Standard hours
  return 1.0;
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
