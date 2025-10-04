import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { period = '30days', analysis, shutdownHours, priceThreshold } = await req.json();
    console.log(`🔄 Fetching ERCOT historical pricing for period: ${period}`);
    
    const ercotApiKey = Deno.env.get('ERCOT_API_KEY');
    
    if (!ercotApiKey) {
      console.error('❌ No ERCOT API key found');
      throw new Error('ERCOT API key is not configured');
    }
    
    console.log('✅ ERCOT API key found, length:', ercotApiKey.length);
    console.log('🔑 API key starts with:', ercotApiKey.substring(0, 8) + '...');

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '12months':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '10years':
        startDate.setFullYear(startDate.getFullYear() - 10);
        break;
    }

    // Fetch historical DAM Settlement Point Prices from ERCOT
    // Using the correct API endpoint from ERCOT Public API
    const apiHeaders = {
      'Ocp-Apim-Subscription-Key': ercotApiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const endpoint = 'https://api.ercot.com/api/public-reports/np4-190-cd/dam_stlmnt_pnt_prices';
    console.log('📡 Calling ERCOT API endpoint:', endpoint);
    console.log('📋 Headers:', Object.keys(apiHeaders));
    
    const sppResponse = await fetch(
      `${endpoint}?size=5000`,
      { headers: apiHeaders }
    );
    
    console.log('📥 Response status:', sppResponse.status);
    console.log('📥 Response headers:', Object.fromEntries(sppResponse.headers.entries()));

    if (!sppResponse.ok) {
      const errorText = await sppResponse.text();
      console.error('ERCOT API error:', sppResponse.status, errorText);
      throw new Error(`Failed to fetch ERCOT historical pricing data: ${sppResponse.status}`);
    }

    const sppData = await sppResponse.json();
    console.log('✅ ERCOT historical pricing data received:', {
      dataLength: sppData?.data?.length || 0,
      hasReportMetadata: !!sppData?.report,
      sampleRecord: sppData?.data?.[0]
    });

    // Process the data - filter for time period and Hub Average
    const now = new Date();
    const rawData = sppData?.data || [];
    
    console.log('📊 Processing raw data, first few records:', rawData.slice(0, 3));
    
    const hourlyData = rawData
      .filter((item: any) => {
        // Filter by settlement point - check multiple possible field names
        const settlementPoint = item.settlementPoint || item.SettlementPoint || item.settlement_point || item.SETTLEMENT_POINT;
        if (settlementPoint !== 'HB_HUBAVG') return false;
        
        // Filter by date range if applicable
        const itemDate = new Date(item.deliveryDate || item.DeliveryDate || item.delivery_date || item.DELIVERY_DATE || item.operDay);
        const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (period === '30days') return daysDiff <= 30 && daysDiff >= 0;
        if (period === '12months') return daysDiff <= 365 && daysDiff >= 0;
        if (period === '10years') return daysDiff <= 3650 && daysDiff >= 0;
        
        return true;
      })
      .map((item: any) => {
        // Extract hour ending
        const hourEnding = item.hourEnding || item.HourEnding || item.hour_ending || item.HOUR_ENDING || 0;
        
        // Create timestamp from delivery date and hour
        const deliveryDate = item.deliveryDate || item.DeliveryDate || item.delivery_date || item.DELIVERY_DATE;
        const timestamp = new Date(deliveryDate);
        timestamp.setHours(hourEnding - 1); // Hour ending means the hour just completed
        
        return {
          timestamp: timestamp.toISOString(),
          price: parseFloat(
            item.settlementPointPrice || 
            item.SettlementPointPrice || 
            item.settlement_point_price ||
            item.SETTLEMENT_POINT_PRICE ||
            item.price ||
            item.Price
          ) || 0,
          hour: hourEnding
        };
      })
      .filter((item: any) => item.price > 0 && item.timestamp); // Remove invalid data
    
    console.log('📈 Processed data points:', hourlyData.length);

    // Calculate statistics
    const prices = hourlyData.map((d: any) => d.price).filter((p: number) => p > 0);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    const statistics = {
      average: prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
      median: sortedPrices[Math.floor(sortedPrices.length / 2)],
      min: Math.min(...prices),
      max: Math.max(...prices),
      stdDev: calculateStdDev(prices),
      percentile95: sortedPrices[Math.floor(sortedPrices.length * 0.95)]
    };

    // Chart data - last 100 points for visualization
    const chartData = hourlyData.slice(-100).map((d: any) => ({
      time: new Date(d.timestamp).toLocaleString(),
      price: d.price
    }));

    // Peak hours analysis
    const hourlyPattern = calculateHourlyPattern(hourlyData);
    const peakHours = hourlyPattern
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 5)
      .map(h => ({ ...h, count: hourlyData.filter((d: any) => new Date(d.timestamp).getHours() === h.hour).length }));

    // Price distribution
    const distribution = calculateDistribution(prices);

    // Seasonal pattern
    const seasonalPattern = calculateSeasonalPattern(hourlyData);

    // Predictions (simple trend-based)
    const recentPrices = prices.slice(-24);
    const predictions = {
      nextHour: recentPrices[recentPrices.length - 1] * 1.02,
      nextDay: statistics.average * 1.01,
      confidence: 75
    };

    // Patterns
    const peakHourIndices = [14, 15, 16, 17, 18, 19];
    const peakPrices = hourlyData
      .filter((d: any) => peakHourIndices.includes(new Date(d.timestamp).getHours()))
      .map((d: any) => d.price);
    const offPeakPrices = hourlyData
      .filter((d: any) => !peakHourIndices.includes(new Date(d.timestamp).getHours()))
      .map((d: any) => d.price);

    const patterns = {
      avgPeakPrice: peakPrices.reduce((a, b) => a + b, 0) / peakPrices.length,
      avgOffPeakPrice: offPeakPrices.reduce((a, b) => a + b, 0) / offPeakPrices.length,
      volatilityScore: (statistics.stdDev / statistics.average) * 100
    };

    const responseData = {
      statistics,
      chartData,
      peakHours,
      distribution,
      hourlyPattern,
      seasonalPattern,
      predictions,
      patterns,
      hourlyData
    };

    // Peak shutdown analysis if requested
    let peakAnalysis = null;
    if (analysis === 'peak_shutdown') {
      peakAnalysis = analyzePeakShutdown(hourlyData, shutdownHours, priceThreshold);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        peakAnalysis,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error in ercot-historical-pricing:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

function calculateHourlyPattern(data: any[]): Array<{ hour: number; avgPrice: number }> {
  const hourlyGroups: { [key: number]: number[] } = {};
  
  data.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    if (!hourlyGroups[hour]) hourlyGroups[hour] = [];
    hourlyGroups[hour].push(d.price);
  });

  return Object.entries(hourlyGroups).map(([hour, prices]) => ({
    hour: parseInt(hour),
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length
  })).sort((a, b) => a.hour - b.hour);
}

function calculateDistribution(prices: number[]): Array<{ range: string; count: number; percentage: number }> {
  const ranges = [
    { min: 0, max: 25, label: '$0-25' },
    { min: 25, max: 50, label: '$25-50' },
    { min: 50, max: 100, label: '$50-100' },
    { min: 100, max: 200, label: '$100-200' },
    { min: 200, max: Infinity, label: '$200+' }
  ];

  return ranges.map(range => {
    const count = prices.filter(p => p >= range.min && p < range.max).length;
    return {
      range: range.label,
      count,
      percentage: (count / prices.length) * 100
    };
  });
}

function calculateSeasonalPattern(data: any[]): Array<{ month: string; avgPrice: number }> {
  const monthlyGroups: { [key: string]: number[] } = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  data.forEach(d => {
    const date = new Date(d.timestamp);
    const month = monthNames[date.getMonth()];
    if (!monthlyGroups[month]) monthlyGroups[month] = [];
    monthlyGroups[month].push(d.price);
  });

  return monthNames
    .filter(month => monthlyGroups[month])
    .map(month => ({
      month,
      avgPrice: monthlyGroups[month].reduce((a, b) => a + b, 0) / monthlyGroups[month].length
    }));
}

function analyzePeakShutdown(
  data: any[],
  shutdownHours: number,
  priceThreshold: number
): any {
  const shutdownEvents = [];
  let currentEvent: any = null;

  data.forEach(point => {
    if (point.price > priceThreshold) {
      if (!currentEvent) {
        currentEvent = {
          startTime: point.timestamp,
          prices: [point.price],
          hours: 1
        };
      } else {
        currentEvent.prices.push(point.price);
        currentEvent.hours++;
      }
    } else {
      if (currentEvent && currentEvent.hours >= shutdownHours) {
        const avgPrice = currentEvent.prices.reduce((a: number, b: number) => a + b, 0) / currentEvent.prices.length;
        shutdownEvents.push({
          date: new Date(currentEvent.startTime).toLocaleDateString(),
          duration: currentEvent.hours,
          avgPrice,
          potentialSavings: avgPrice * currentEvent.hours
        });
      }
      currentEvent = null;
    }
  });

  const totalHours = shutdownEvents.reduce((sum, event) => sum + event.duration, 0);
  const totalSavings = shutdownEvents.reduce((sum, event) => sum + event.potentialSavings, 0);

  return {
    totalShutdowns: shutdownEvents.length,
    totalHours,
    averageSavings: shutdownEvents.length > 0 ? totalSavings / shutdownEvents.length : 0,
    shutdownEvents
  };
}
