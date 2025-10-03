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
      console.error('No ERCOT API key found');
      throw new Error('ERCOT API key is not configured');
    }

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
    // Using the Day-Ahead Market (DAM) Settlement Point Prices API
    const sppResponse = await fetch(
      `https://api.ercot.com/api/public-reports/np4-190-cd/dam_hourly_lmp`,
      {
        headers: { 
          'Ocp-Apim-Subscription-Key': ercotApiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!sppResponse.ok) {
      const errorText = await sppResponse.text();
      console.error('ERCOT API error:', sppResponse.status, errorText);
      throw new Error(`Failed to fetch ERCOT historical pricing data: ${sppResponse.status}`);
    }

    const sppData = await sppResponse.json();
    console.log('✅ ERCOT historical pricing data received:', sppData?.data?.length || 0, 'records');

    // Process the data - ERCOT API returns data in specific format
    const rawData = Array.isArray(sppData) ? sppData : (sppData?.data || []);
    const hourlyData = rawData
      .filter((item: any) => item.SettlementPoint === 'HB_HUBAVG') // Focus on Hub Average
      .map((item: any) => ({
        timestamp: item.DeliveryDate || item.DeliveryHour || item.OperDay,
        price: parseFloat(item.SettlementPointPrice || item.LMP || item.Price) || 0,
        demand: parseFloat(item.SystemLoad || item.Load) || undefined
      }))
      .filter((item: any) => item.price > 0); // Remove invalid data

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
