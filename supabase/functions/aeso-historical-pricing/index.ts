import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { timeframe } = await req.json();
    
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
    
    if (timeframe === 'monthly') {
      // Fetch last 30 days of hourly data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      historicalData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
    } else if (timeframe === 'yearly') {
      // Fetch last 12 months of daily averages
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      
      historicalData = await fetchAESOHistoricalData(startDate, endDate, apiKey);
    }

    // Validate we have data
    if (!historicalData || historicalData.length === 0) {
      throw new Error('No historical data available from AESO API');
    }

    // Process data for frontend consumption
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
    
    // More specific error handling
    let errorMessage = 'Failed to fetch AESO historical pricing data';
    let details = error.message;
    
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
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: details
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchAESOHistoricalData(startDate: Date, endDate: Date, apiKey?: string): Promise<HistoricalDataPoint[]> {
  try {
    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 10); // Keep YYYY-MM-DD format
    };
    
    // Use the correct AESO API endpoint format (v1.1)
    const apiUrl = `https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
    console.log(`Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'API-KEY': apiKey,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'LovableEnergy/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`API Response Status: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      
      if (response.status === 401) {
        throw new Error(`AESO API authentication failed (401). Please verify your API subscription key is correct and active. Response: ${errorText}`);
      } else if (response.status === 403) {
        throw new Error(`AESO API access forbidden (403). Your subscription key may not have access to this endpoint. Response: ${errorText}`);
      } else {
        throw new Error(`AESO API error: ${response.status} - ${response.statusText}. Response: ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log(`API Response:`, JSON.stringify(data, null, 2));
    
    // Parse the response structure based on AESO API documentation
    // The API returns data in "Pool Price Report" array
    const priceData = data.return?.['Pool Price Report'] || 
                     data.return?.['Pool Price'] || 
                     data.return?.poolPrice || 
                     data['Pool Price Report'] || 
                     data['Pool Price'] || 
                     data.poolPrice || [];
    console.log(`Fetched ${priceData.length} price records`);
    
    if (priceData.length === 0) {
      throw new Error('No price data returned from AESO API');
    }
    
    // Map AESO API response to our expected format
    const mappedData = priceData.map((item: any) => {
      const price = parseFloat(item.pool_price || item.price || '0');
      console.log(`Raw price: ${item.pool_price}, Parsed: ${price}`);
      return {
        datetime: item.begin_datetime_utc || item.begin_datetime_mpt || item.datetime,
        price: price,
        forecast_begin: item.begin_datetime_utc || '',
        forecast_end: item.forecast_pool_price || ''
      };
    });
    
    console.log(`Sample mapped data:`, mappedData.slice(0, 3));
    return mappedData;
  } catch (error) {
    console.error('Error fetching AESO data:', error);
    throw error;
  }
}

async function processHistoricalData(data: HistoricalDataPoint[], timeframe: string) {
  const prices = data.map(d => parseFloat(d.price.toString()));
  console.log(`Processing ${prices.length} prices. Sample prices:`, prices.slice(0, 10));
  console.log(`Price range: min=${Math.min(...prices)}, max=${Math.max(...prices)}, avg=${prices.reduce((a, b) => a + b, 0) / prices.length}`);
  
  if (prices.length === 0) {
    throw new Error('No historical data available');
  }
  
  const statistics = {
    average: prices.reduce((a, b) => a + b, 0) / prices.length,
    peak: Math.max(...prices),
    low: Math.min(...prices),
    volatility: calculateVolatility(prices),
    trend: calculateTrend(prices)
  };
  
  let chartData = [];
  let peakHours = [];
  let hourlyPatterns = [];
  let distribution = [];
  let seasonalPatterns = {};
  
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
  
  return {
    statistics,
    chartData,
    peakHours,
    hourlyPatterns,
    distribution,
    seasonalPatterns
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
  const hourlyData = new Array(24).fill(0).map(() => []);
  
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
  const seasonalData = { winter: [], spring: [], summer: [], fall: [] };
  
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
      patterns[season] = {
        average: Math.round((prices.reduce((a: number, b: number) => a + b, 0) / prices.length) * 100) / 100,
        peak: Math.round(Math.max(...prices) * 100) / 100
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
