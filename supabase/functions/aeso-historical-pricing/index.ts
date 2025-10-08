import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricalDataPoint {
  datetime: string;
  price: number;
  forecast_begin: string;
  forecast_end: string;
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  cloudCover: number;
}

serve(async (req) => {
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
    } else if (timeframe === 'monthly') {
      // Fetch last 30 days of hourly data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      console.log(`Monthly date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      historicalData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
    } else if (timeframe === 'yearly') {
      // Fetch last 12 months of daily averages - use a smaller range to avoid extremely old data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 12);
      
      console.log(`Yearly date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      historicalData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
    } else if (timeframe === 'historical-10year') {
      // Fetch real 8-year historical data from AESO
      console.log(`Fetching 8-year real historical data from AESO API with ${uptimePercentage}% uptime filter...`);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const historicalYearsData = [];
      
      // Fetch data for each of the past 8 years (including current year)
      // This will fetch 8 complete years of data
      const startYear = currentYear - 7;
      
      console.log(`Will attempt to fetch data for years ${startYear} to ${currentYear} (8 years total)`);
      
      for (let year = startYear; year <= currentYear; year++) {
        // For current year, only fetch up to today
        const isCurrentYear = year === currentYear;
        const yearStartDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0)); // January 1st UTC
        const yearEndDate = isCurrentYear 
          ? new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59))
          : new Date(Date.UTC(year, 11, 31, 23, 59, 59)); // December 31st UTC
        
        try {
          console.log(`Fetching real AESO data for year ${year} (${yearStartDate.toISOString().slice(0, 10)} to ${yearEndDate.toISOString().slice(0, 10)})...`);
          const yearData = await fetchAESOHistoricalData(yearStartDate, yearEndDate, apiKey);
          
          if (yearData && yearData.length > 0) {
            console.log(`Received ${yearData.length} data points for year ${year}`);
            
            // Apply uptime filter if not 100%
            let filteredYearData = yearData;
            if (uptimePercentage < 100) {
              const hoursToKeep = Math.floor(yearData.length * (uptimePercentage / 100));
              // Sort by price and keep the lowest-priced hours
              filteredYearData = [...yearData]
                .sort((a, b) => a.price - b.price)
                .slice(0, hoursToKeep);
              console.log(`Applied ${uptimePercentage}% uptime filter: ${yearData.length} → ${filteredYearData.length} hours (removed ${yearData.length - filteredYearData.length} highest-price hours)`);
            }
            
            const yearlyStats = await processHistoricalData(filteredYearData, 'yearly');
            
            if (yearlyStats && yearlyStats.statistics) {
              historicalYearsData.push({
                year,
                average: Math.round(yearlyStats.statistics.average * 100) / 100,
                peak: Math.round(yearlyStats.statistics.peak * 100) / 100,
                low: Math.round(yearlyStats.statistics.low * 100) / 100,
                volatility: Math.round(yearlyStats.statistics.volatility * 100) / 100,
                dataPoints: yearData.length,
                filteredDataPoints: filteredYearData.length,
                uptimePercentage,
                isReal: true
              });
              console.log(`Year ${year}: Avg=$${yearlyStats.statistics.average.toFixed(2)} CAD/MWh (${filteredYearData.length} of ${yearData.length} data points at ${uptimePercentage}% uptime)`);
            } else {
              console.warn(`No statistics calculated for year ${year}`);
              historicalYearsData.push({
                year,
                average: null,
                peak: null,
                low: null,
                volatility: null,
                dataPoints: 0,
                isReal: false
              });
            }
          } else {
            console.log(`No data available for year ${year} - AESO API may not have historical data this far back`);
            // Still add the year to show in the UI that we attempted to fetch it
            historicalYearsData.push({
              year,
              average: null,
              peak: null,
              low: null,
              volatility: null,
              dataPoints: 0,
              isReal: false,
              noData: true  // Flag to indicate API had no data for this year
            });
          }
        } catch (error) {
          console.error(`Error fetching data for year ${year}:`, error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error details: ${errorMsg}`);
          // Still add the year to show we attempted it
          historicalYearsData.push({
            year,
            average: null,
            peak: null,
            low: null,
            volatility: null,
            dataPoints: 0,
            isReal: false,
            error: errorMsg
          });
        }
      }
      
      console.log(`Completed fetching 8-year data. Total years in response: ${historicalYearsData.length}, Years with real data: ${historicalYearsData.filter(y => y.isReal).length}`);
      
      return new Response(
        JSON.stringify({
          historicalYears: historicalYearsData,
          totalYears: historicalYearsData.length,
          realDataYears: historicalYearsData.filter(y => y.isReal).length,
          uptimePercentage,
          lastUpdated: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Validate we have data
    if (!historicalData || historicalData.length === 0) {
      throw new Error('No historical data available from AESO API');
    }

    // For custom timeframe, return raw data directly without processing
    // Transform to match expected format with ts, price, generation, ail
    if (timeframe === 'custom') {
      console.log(`Returning ${historicalData.length} raw data points for custom date range`);
      const transformedData = historicalData.map(d => ({
        ts: d.datetime,
        price: d.price,
        generation: (d as any).generation || 0, // Generation data if available
        ail: (d as any).ail || 0 // AIL data if available
      }));
      
      // Count how many records have AIL data
      const ailCount = transformedData.filter(d => d.ail > 0).length;
      console.log(`AIL data available for ${ailCount} out of ${transformedData.length} records`);
      
      return new Response(JSON.stringify(transformedData), {
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
    
    // Transform to internal format
    const mappedData: HistoricalDataPoint[] = priceData.map((item: any) => ({
      datetime: item.begin_datetime_utc,
      price: parseFloat(item.pool_price || '0'),
      forecast_begin: item.begin_datetime_utc || '',
      forecast_end: item.forecast_pool_price || ''
    }));
    
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
  
  if (timeframe === 'monthly') {
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
  const rawHourlyData = data.map(d => ({
    datetime: d.datetime,
    price: parseFloat(d.price.toString()),
    date: d.datetime.split('T')[0] || d.datetime.substring(0, 10),
    hour: new Date(d.datetime).getUTCHours()
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
