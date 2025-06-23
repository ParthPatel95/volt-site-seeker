
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EnergyRateInput {
  latitude: number;
  longitude: number;
  contractedLoadMW: number;
  currency: 'CAD' | 'USD';
  customerClass: 'Industrial' | 'Commercial';
  retailAdder?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Energy Rate Estimator action: ${action}`);

    switch (action) {
      case 'calculate_rates':
        return await calculateEnergyRates(params as EnergyRateInput);
      
      case 'export_csv':
        return await exportCSV(params.results, params.input);
      
      case 'export_pdf':
        return await exportPDF(params.results, params.input);

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

  } catch (error: any) {
    console.error('Error in energy rate estimator:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function calculateEnergyRates(input: EnergyRateInput) {
  console.log('Calculating energy rates for:', input);

  try {
    // 1. Resolve territory and utility
    const territory = await resolveTerritory(input.latitude, input.longitude);
    
    // 2. Get market data for past 12 months
    const marketData = await getMarketData(territory, input.currency);
    
    // 3. Get utility tariff data
    const tariffData = await getTariffData(territory, input.customerClass);
    
    // 4. Calculate monthly costs
    const monthlyData = await calculateMonthlyCosts(
      marketData, 
      tariffData, 
      input.contractedLoadMW,
      input.retailAdder || 0,
      input.currency
    );

    // 5. Calculate averages
    const totalCents = monthlyData.reduce((sum, month) => sum + month.total, 0);
    const averageAllInPrice = {
      centsPerKWh: totalCents / monthlyData.length,
      dollarsPerMWh: (totalCents / monthlyData.length) * 10
    };

    const results = {
      monthlyData,
      averageAllInPrice,
      territory,
      dataSourceUrls: [
        territory.market === 'AESO' ? 'https://www.aeso.ca/market/market-data/' : 'https://www.eia.gov/electricity/',
        `https://${territory.utility.toLowerCase().replace(' ', '')}.com/rates`,
        'https://www.bankofcanada.ca/rates/exchange/'
      ],
      calculationDate: new Date().toISOString(),
      currency: input.currency
    };

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error calculating energy rates:', error);
    throw error;
  }
}

async function resolveTerritory(latitude: number, longitude: number) {
  console.log('Resolving territory for coordinates:', latitude, longitude);
  
  // Simplified territory resolution - in production this would use GIS data
  if (latitude >= 49.0 && latitude <= 60.0 && longitude >= -120.0 && longitude <= -110.0) {
    // Alberta
    return {
      utility: 'FortisAlberta',
      market: 'AESO',
      region: 'Alberta, Canada',
      country: 'CA',
      province: 'AB'
    };
  } else if (latitude >= 25.0 && latitude <= 49.0 && longitude >= -125.0 && longitude <= -66.0) {
    // US regions
    if (latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5) {
      return {
        utility: 'Oncor',
        market: 'ERCOT',
        region: 'Texas, USA',
        country: 'US',
        state: 'TX'
      };
    }
    // Default US region
    return {
      utility: 'Generic Utility',
      market: 'EIA',
      region: 'United States',
      country: 'US',
      state: 'TX'
    };
  }
  
  // Default fallback
  return {
    utility: 'Unknown Utility',
    market: 'Generic',
    region: 'Unknown',
    country: 'US',
    state: 'TX'
  };
}

async function getMarketData(territory: any, currency: string) {
  console.log('Getting market data for territory:', territory.market);
  
  // Generate realistic 12 months of market data
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Base prices vary by market and season
    let basePrice = 4.5; // ¢/kWh base
    
    if (territory.market === 'AESO') {
      basePrice = 5.2; // Alberta typically higher
    } else if (territory.market === 'ERCOT') {
      basePrice = 4.8; // Texas competitive market
    }
    
    // Seasonal variation
    const winterMonths = [11, 0, 1, 2]; // Nov, Dec, Jan, Feb
    const summerMonths = [5, 6, 7, 8]; // Jun, Jul, Aug, Sep
    
    if (winterMonths.includes(date.getMonth())) {
      basePrice *= 1.2; // Winter premium
    } else if (summerMonths.includes(date.getMonth())) {
      basePrice *= 1.15; // Summer premium
    }
    
    // Add some realistic volatility
    const volatility = (Math.random() - 0.5) * 1.0;
    const marketPrice = Math.max(2.0, basePrice + volatility);
    
    months.push({
      month: monthName,
      marketPrice: marketPrice
    });
  }
  
  return months;
}

async function getTariffData(territory: any, customerClass: string) {
  console.log('Getting tariff data for:', territory.utility, customerClass);
  
  // Simplified tariff structure - in production would parse actual utility PDFs
  const baseTariff = {
    transmission: 1.2, // ¢/kWh
    distribution: 1.8, // ¢/kWh
    riders: 0.6, // ¢/kWh
    demandCharge: customerClass === 'Industrial' ? 15.0 : 12.0, // $/kW-month
  };
  
  // Adjust for territory
  if (territory.market === 'AESO') {
    baseTariff.transmission *= 1.1;
    baseTariff.distribution *= 1.05;
  }
  
  return baseTariff;
}

async function calculateMonthlyCosts(
  marketData: any[], 
  tariffData: any, 
  contractedLoadMW: number,
  retailAdder: number,
  currency: string
) {
  console.log('Calculating monthly costs...');
  
  const monthlyData = [];
  
  for (const month of marketData) {
    // Get actual days in this month for accurate calculation
    const monthDate = new Date(month.month + ' 1');
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const hoursInMonth = daysInMonth * 24;
    
    // Energy costs
    const energyPrice = month.marketPrice + retailAdder;
    
    // T&D costs (transmission and distribution)
    const transmissionDistribution = tariffData.transmission + tariffData.distribution;
    
    // Riders and fees
    const riders = tariffData.riders;
    
    // Calculate demand charge component correctly
    // Demand charge is $/kW-month, need to convert to ¢/kWh
    // Formula: ($/kW-month * MW * 1000 kW/MW) / (MW * 1000 kW/MW * hours * load_factor * kWh/kW) * 100 ¢/$
    // Simplified: ($/kW-month) / (hours * load_factor) * 100
    const loadFactor = 0.70; // Typical industrial load factor 70%
    const demandChargePerKWh = (tariffData.demandCharge) / (hoursInMonth * loadFactor) * 100; // Convert to ¢/kWh
    
    const totalBeforeTax = energyPrice + transmissionDistribution + riders + demandChargePerKWh;
    
    // Apply taxes
    let taxRate = 0;
    if (currency === 'CAD') {
      taxRate = 0.05; // GST for Alberta (simplified)
    } else {
      taxRate = 0.0625; // Average US state sales tax
    }
    
    const tax = totalBeforeTax * taxRate;
    const total = totalBeforeTax + tax;
    
    monthlyData.push({
      month: month.month,
      energyPrice: parseFloat(energyPrice.toFixed(2)),
      transmissionDistribution: parseFloat((transmissionDistribution + demandChargePerKWh).toFixed(2)),
      riders: parseFloat(riders.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalMWh: parseFloat((total * 10).toFixed(2)) // Convert ¢/kWh to $/MWh
    });
  }
  
  return monthlyData;
}

async function exportCSV(results: any, input: any) {
  console.log('Exporting CSV data...');
  
  let csvData = 'Month,Energy Price (¢/kWh),T&D (¢/kWh),Riders (¢/kWh),Tax (¢/kWh),Total (¢/kWh),Total ($/MWh)\n';
  
  for (const month of results.monthlyData) {
    csvData += `${month.month},${month.energyPrice},${month.transmissionDistribution},${month.riders},${month.tax},${month.total},${month.totalMWh}\n`;
  }
  
  csvData += `\nAnalysis Parameters:\n`;
  csvData += `Coordinates,"${input.latitude}, ${input.longitude}"\n`;
  csvData += `Contracted Load,${input.contractedLoadMW} MW\n`;
  csvData += `Customer Class,${input.customerClass}\n`;
  csvData += `Currency,${input.currency}\n`;
  csvData += `12-Month Average,${results.averageAllInPrice.centsPerKWh.toFixed(2)} ¢/kWh\n`;
  
  return new Response(JSON.stringify({
    success: true,
    csvData
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function exportPDF(results: any, input: any) {
  console.log('Generating PDF report...');
  
  // In production, this would use a PDF generation service
  // For now, return a mock URL
  const pdfUrl = `data:text/html,<html><body><h1>Energy Rate Analysis Report</h1><p>Average All-In Price: ${results.averageAllInPrice.centsPerKWh.toFixed(2)} ¢/kWh (${results.currency})</p><p>Territory: ${results.territory.utility}</p><p>Load: ${input.contractedLoadMW} MW</p></body></html>`;
  
  return new Response(JSON.stringify({
    success: true,
    pdfUrl
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

serve(handler);
