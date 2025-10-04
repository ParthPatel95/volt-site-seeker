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
    
    // Try both primary and secondary keys like AESO implementation
    const ercotApiKey = 
      Deno.env.get('ERCOT_API_KEY')?.trim() ||
      Deno.env.get('ERCOT_API_KEY_SECONDARY')?.trim();
    
    if (!ercotApiKey) {
      console.error('❌ No ERCOT API key found. Please configure ERCOT_API_KEY or ERCOT_API_KEY_SECONDARY');
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

    // ERCOT API endpoints are returning 404. Instead, scrape historical data from ERCOT website
    // This matches the working approach in energy-data-integration function
    console.log('📊 Fetching ERCOT historical pricing from public website...');
    
    // Fetch DAM Settlement Point Prices from ERCOT's public display
    const damSppUrl = 'https://www.ercot.com/content/cdr/html/dam_spp.html';
    const damResponse = await fetch(damSppUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!damResponse.ok) {
      console.error('❌ Failed to fetch DAM SPP page:', damResponse.status);
      throw new Error(`Failed to fetch ERCOT historical pricing: ${damResponse.status}`);
    }
    
    const htmlContent = await damResponse.text();
    console.log('✅ Fetched DAM SPP HTML, length:', htmlContent.length);
    
    // Parse the HTML to extract HB_HUBAVG prices
    const hourlyData: any[] = [];
    const rows = htmlContent.match(/<tr[^>]*>.*?<\/tr>/gs) || [];
    
    console.log('📋 Found', rows.length, 'table rows');
    
    for (const row of rows) {
      // Extract cells from row
      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs) || [];
      if (cells.length < 3) continue;
      
      // Parse cell contents
      const cellValues = cells.map(cell => 
        cell.replace(/<[^>]*>/g, '').trim()
      );
      
      // Look for rows with date, hour, and HB_HUBAVG price
      if (cellValues.length >= 3) {
        const dateStr = cellValues[0];
        const hourStr = cellValues[1];
        const priceStr = cellValues.find((val, idx) => {
          // HB_HUBAVG is typically in column 3-5
          return idx >= 2 && !isNaN(parseFloat(val)) && parseFloat(val) > 0;
        });
        
        if (dateStr && hourStr && priceStr) {
          const price = parseFloat(priceStr);
          if (!isNaN(price) && price > 0) {
            // Create timestamp from date and hour
            try {
              const dateParts = dateStr.split('/');
              if (dateParts.length === 3) {
                const month = parseInt(dateParts[0]) - 1;
                const day = parseInt(dateParts[1]);
                const year = parseInt(dateParts[2]);
                const hour = parseInt(hourStr) - 1; // Hour ending format
                
                const timestamp = new Date(year, month, day, hour);
                
                hourlyData.push({
                  timestamp: timestamp.toISOString(),
                  price: price,
                  hour: parseInt(hourStr)
                });
              }
            } catch (e) {
              // Skip invalid dates
            }
          }
        }
      }
    }
    
    console.log('✅ Extracted', hourlyData.length, 'historical price points');
    
    // Filter by period
    const now = new Date();
    const filteredData = hourlyData.filter((item: any) => {
      const itemDate = new Date(item.timestamp);
      const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (period === '30days') return daysDiff <= 30 && daysDiff >= 0;
      if (period === '12months') return daysDiff <= 365 && daysDiff >= 0;
      if (period === '10years') return daysDiff <= 3650 && daysDiff >= 0;
      
      return true;
    });
    
    console.log('📈 Filtered to', filteredData.length, 'data points for period:', period);

    // Calculate statistics from filtered data
    const prices = filteredData.map((d: any) => d.price).filter((p: number) => p > 0);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    const statistics = {
      average: prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
      median: sortedPrices[Math.floor(sortedPrices.length / 2)],
      min: Math.min(...prices),
      max: Math.max(...prices),
      stdDev: calculateStdDev(prices),
      percentile95: sortedPrices[Math.floor(sortedPrices.length * 0.95)]
    };

    // Chart data - use filtered data
    const chartData = filteredData.slice(-100).map((d: any) => ({
      time: new Date(d.timestamp).toLocaleString(),
      price: d.price
    }));

    // Peak hours analysis from filtered data
    const hourlyPattern = calculateHourlyPattern(filteredData);
    const peakHours = hourlyPattern
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 5)
      .map(h => ({ ...h, count: filteredData.filter((d: any) => new Date(d.timestamp).getHours() === h.hour).length }));

    // Price distribution
    const distribution = calculateDistribution(prices);

    // Seasonal pattern from filtered data
    const seasonalPattern = calculateSeasonalPattern(filteredData);

    // Predictions (simple trend-based)
    const recentPrices = prices.slice(-24);
    const predictions = {
      nextHour: recentPrices[recentPrices.length - 1] * 1.02,
      nextDay: statistics.average * 1.01,
      confidence: 75
    };

    // Patterns from filtered data
    const peakHourIndices = [14, 15, 16, 17, 18, 19];
    const peakPrices = filteredData
      .filter((d: any) => peakHourIndices.includes(new Date(d.timestamp).getHours()))
      .map((d: any) => d.price);
    const offPeakPrices = filteredData
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
      hourlyData: filteredData
    };

    // Peak shutdown analysis if requested (use filtered data)
    let peakAnalysis = null;
    if (analysis === 'peak_shutdown') {
      peakAnalysis = analyzePeakShutdown(filteredData, shutdownHours, priceThreshold);
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
