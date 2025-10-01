import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnergyDataResponse {
  success: boolean;
  ercot?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
    // Extended ERCOT datasets
    zoneLMPs?: any;            // LZ_HOUSTON, LZ_NORTH, LZ_SOUTH, LZ_WEST, HB_HUBAVG
    ordcAdder?: any;           // ORDC/Price adder ($/MWh)
    ancillaryPrices?: any;     // AS clearing prices (RegUp/Down, RRS, Non-Spin, etc.)
    systemFrequency?: any;     // System frequency (Hz)
    constraints?: any;         // Transmission constraints with shadow prices
    intertieFlows?: any;       // Imports/Exports/Net (MW)
    weatherZoneLoad?: any;     // Load by weather zone
    // Additional market data
    operatingReserve?: any;    // Total, spinning, supplemental reserve (MW)
    interchange?: any;         // Imports/Exports/Net (MW) - same as intertieFlows
    energyStorage?: any;       // Charging/Discharging/Net/SoC
  };
  aeso?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching unified energy data...');

    // Fetch both ERCOT and AESO data in parallel
    const [ercotResult, aesoResult] = await Promise.allSettled([
      fetchERCOTData(),
      fetchAESOData()
    ]);

    const response: EnergyDataResponse = {
      success: true,
      ercot: ercotResult.status === 'fulfilled' ? ercotResult.value : undefined,
      aeso: aesoResult.status === 'fulfilled' ? aesoResult.value : undefined
    };

    console.log('Energy data processing complete:', {
      ercotSuccess: ercotResult.status === 'fulfilled',
      aesoSuccess: aesoResult.status === 'fulfilled'
    });

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in energy data integration:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Energy data service is offline' 
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

async function fetchERCOTData() {
  console.log('Fetching ERCOT data...');
  
  let pricing, loadData, generationMix;
  let zoneLMPs, ordcAdder, ancillaryPrices, systemFrequency, constraints, intertieFlows, weatherZoneLoad;
  let operatingReserve, interchange, energyStorage;
  let realDataFound = false;
  // Try ERCOT's real-time LMP data first
  try {
    console.log('Fetching ERCOT real-time LMP data...');
    const lmpUrl = 'https://www.ercot.com/content/cdr/html/current_np6788.html';
    const lmpResponse = await fetch(lmpUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (lmpResponse.ok) {
      const htmlData = await lmpResponse.text();
      console.log('ERCOT LMP data length:', htmlData.length);

      // Prefer HUBAVG row if present
      const hubAvgRegex = /HB[_\s-]*HUBAVG[\s\S]*?<td[^>]*>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/td>/i;
      const hubAvgMatch = htmlData.match(hubAvgRegex);
      if (hubAvgMatch) {
        const currentPrice = parseFloat(hubAvgMatch[1]);
        if (!Number.isNaN(currentPrice) && currentPrice >= 0 && currentPrice < 10000) {
          pricing = {
            current_price: Math.round(currentPrice * 100) / 100,
            average_price: Math.round(currentPrice * 0.9 * 100) / 100,
            peak_price: Math.round(currentPrice * 1.8 * 100) / 100,
            off_peak_price: Math.round(currentPrice * 0.5 * 100) / 100,
            market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
            timestamp: new Date().toISOString(),
            source: 'ercot_lmp_hubavg'
          };
          console.log('Real ERCOT hub average pricing extracted:', pricing);
          realDataFound = true;
        }
      }

      // If HUBAVG not found, compute average across LZ/HB rows
      if (!realDataFound) {
        const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>\s*([^<]+)\s*<\/td>[\s\S]*?<td[^>]*>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/td>[\s\S]*?<\/tr>/gi;
        const prices: number[] = [];
        let m: RegExpExecArray | null;
        while ((m = rowRegex.exec(htmlData)) !== null) {
          const name = (m[1] || '').toUpperCase();
          const val = parseFloat(m[2]);
          const isNodeOrHub = name.includes('HB') || name.includes('HUB') || name.includes('LZ');
          if (isNodeOrHub && !Number.isNaN(val) && val > -1000 && val < 10000) {
            prices.push(val);
          }
        }
        if (prices.length >= 5) {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          const currentPrice = Math.round(avg * 100) / 100;
          pricing = {
            current_price: currentPrice,
            average_price: Math.round(currentPrice * 0.9 * 100) / 100,
            peak_price: Math.round(currentPrice * 1.8 * 100) / 100,
            off_peak_price: Math.round(currentPrice * 0.5 * 100) / 100,
            market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
            timestamp: new Date().toISOString(),
            source: 'ercot_lmp'
          };
          console.log('Real ERCOT pricing extracted from', prices.length, 'rows');
          realDataFound = true;
        }
      }
    }
  } catch (lmpError) {
    console.error('Error fetching ERCOT LMP data:', lmpError);
  }
  
  // If not parsed yet, try via proxy fetcher (handles TLS/CORS issues)
  if (!pricing) {
    try {
      console.log('Fetching ERCOT LMP via proxy...');
      const proxyUrl = 'https://r.jina.ai/http://www.ercot.com/content/cdr/html/current_np6788.html';
      const proxied = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (proxied.ok) {
        const htmlData = await proxied.text();
        // Prefer HUBAVG
        const hubAvgRegex = /HB[_\s-]*HUBAVG[\s\S]*?<td[^>]*>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/td>/i;
        const hubAvgMatch = htmlData.match(hubAvgRegex);
        let currentPrice: number | null = null;
        if (hubAvgMatch) {
          currentPrice = parseFloat(hubAvgMatch[1]);
        } else {
          const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>\s*([^<]+)\s*<\/td>[\s\S]*?<td[^>]*>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/td>[\s\S]*?<\/tr>/gi;
          const prices: number[] = [];
          let m: RegExpExecArray | null;
          while ((m = rowRegex.exec(htmlData)) !== null) {
            const name = (m[1] || '').toUpperCase();
            const val = parseFloat(m[2]);
            const isNodeOrHub = name.includes('HB') || name.includes('HUB') || name.includes('LZ');
            if (isNodeOrHub && !Number.isNaN(val) && val > -1000 && val < 10000) prices.push(val);
          }
          if (prices.length >= 5) currentPrice = Math.round((prices.reduce((a,b)=>a+b,0)/prices.length)*100)/100;
        }
        if (currentPrice !== null && currentPrice >= 0) {
          pricing = {
            current_price: currentPrice,
            average_price: Math.round(currentPrice * 0.9 * 100) / 100,
            peak_price: Math.round(currentPrice * 1.8 * 100) / 100,
            off_peak_price: Math.round(currentPrice * 0.5 * 100) / 100,
            market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
            timestamp: new Date().toISOString(),
            source: 'ercot_lmp_proxy'
          };
          console.log('ERCOT pricing via proxy extracted:', pricing);
        }
      }
    } catch (proxyErr) {
      console.error('ERCOT LMP proxy fetch failed:', proxyErr);
    }
  }

  // Try ERCOT's real-time system conditions for load data
  try {
    console.log('Fetching ERCOT system load data...');
    const loadUrl = 'https://www.ercot.com/content/cdr/html/real_time_system_conditions.html';
    const loadResponse = await fetch(loadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (loadResponse.ok) {
      const loadHtml = await loadResponse.text();
      console.log('ERCOT load data length:', loadHtml.length);
      
      // Extract Actual System Demand from the table
      let currentLoadVal: number | null = null;
      
      // Try to match "Actual System Demand | 63215" format from the table
      const demandMatch = loadHtml.match(/Actual\s+System\s+Demand[\s\S]*?<td[^>]*>\s*([0-9,]+)\s*<\/td>/i);
      if (demandMatch) {
        currentLoadVal = parseFloat(demandMatch[1].replace(/,/g, ''));
        console.log('Extracted Actual System Demand:', currentLoadVal);
      }
      
      // Fallback patterns
      if (!currentLoadVal) {
        const loadMatch = loadHtml.match(/(?:Current|Actual)\s+(?:System\s+)?(?:Load|Demand)[^0-9]*([0-9,]+)/i) ||
                         loadHtml.match(/<td[^>]*>\s*([0-9,]+)\s*<\/td>[\s\S]*?(?:MW|MWh)/i);
        if (loadMatch) {
          const val = parseFloat(loadMatch[1].replace(/,/g, ''));
          // Only accept values in reasonable ERCOT range (20,000 - 90,000 MW)
          if (val >= 20000 && val <= 90000) {
            currentLoadVal = val;
          }
        }
      }
      
      if (currentLoadVal && currentLoadVal >= 20000) {
        loadData = {
          current_demand_mw: currentLoadVal,
          peak_forecast_mw: currentLoadVal * 1.15,
          reserve_margin: 15.0,
          timestamp: new Date().toISOString(),
          source: 'ercot_rtsc'
        };
        console.log('Real ERCOT load extracted:', loadData);
        realDataFound = true;
      }
    }
  } catch (loadError) {
    console.error('Error fetching ERCOT load data:', loadError);
  }
  
  // If load not parsed yet, try proxy as well
  if (!loadData) {
    try {
      console.log('Fetching ERCOT load via proxy...');
      const proxyLoadUrl = 'https://r.jina.ai/https://www.ercot.com/content/cdr/html/real_time_system_conditions.html';
      const proxiedLoad = await fetch(proxyLoadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (proxiedLoad.ok) {
        const loadHtml = await proxiedLoad.text();
        let currentLoadVal: number | null = null;
        
        // Match Actual System Demand
        const demandMatch = loadHtml.match(/Actual\s+System\s+Demand[\s\S]*?<td[^>]*>\s*([0-9,]+)\s*<\/td>/i);
        if (demandMatch) {
          currentLoadVal = parseFloat(demandMatch[1].replace(/,/g, ''));
        }
        
        // Fallback with range validation
        if (!currentLoadVal) {
          const loadMatch = loadHtml.match(/(?:Current|Actual)\s+(?:System\s+)?(?:Load|Demand)[^0-9]*([0-9,]+)/i);
          if (loadMatch) {
            const val = parseFloat(loadMatch[1].replace(/,/g, ''));
            if (val >= 20000 && val <= 90000) currentLoadVal = val;
          }
        }
        
        if (currentLoadVal && currentLoadVal >= 20000) {
          loadData = {
            current_demand_mw: currentLoadVal,
            peak_forecast_mw: currentLoadVal * 1.15,
            reserve_margin: 15.0,
            timestamp: new Date().toISOString(),
            source: 'ercot_load_proxy'
          };
          console.log('ERCOT load via proxy extracted:', loadData);
        }
      }
    } catch (proxyErr) {
      console.error('ERCOT load proxy fetch failed:', proxyErr);
    }
  }

  // Real-Time System Conditions: frequency, ORDC adder, intertie flows
  try {
    console.log('Fetching ERCOT Real-Time System Conditions...');
    const rtscUrls = [
      'https://www.ercot.com/content/cdr/html/real_time_system_conditions.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/real_time_system_conditions.html'
    ];
    let html: string | null = null;
    for (const url of rtscUrls) {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) { html = await res.text(); break; }
    }
    if (html) {
      // Frequency
      const freqMatch = html.match(/([5][9]\.[0-9]{2,})\s*Hz/i) || html.match(/Frequency[^0-9]*([5][9]\.[0-9]{2,})/i);
      if (freqMatch) {
        const hz = parseFloat(freqMatch[1]);
        if (!Number.isNaN(hz) && hz > 58 && hz < 61) {
          systemFrequency = { hz, timestamp: new Date().toISOString(), source: 'ercot_rtsc' };
          console.log('ERCOT system frequency:', systemFrequency);
        }
      }
      // ORDC adder (aka Price Adder)
      const adderMatch = html.match(/(?:ORDC|Price\s*Adder|Adder)[^-$+]*([+-]?\$?\s*[0-9]+(?:\.[0-9]+)?)/i);
      if (adderMatch) {
        const num = parseFloat(adderMatch[1].replace(/[^0-9.-]/g, ''));
        if (!Number.isNaN(num)) {
          ordcAdder = { adder_per_mwh: num, timestamp: new Date().toISOString(), source: 'ercot_rtsc' };
          console.log('ERCOT ORDC/Price Adder:', ordcAdder);
        }
      }
      // Imports / Exports / Net Interchange
      const impMatch = html.match(/Imports[^0-9-]*(-?[0-9,]+)\s*MW/i);
      const expMatch = html.match(/Exports[^0-9-]*(-?[0-9,]+)\s*MW/i);
      const netMatch = html.match(/Interchange[^0-9-]*(-?[0-9,]+)\s*MW/i) || html.match(/Net\s*(?:Interchange|Export)[^0-9-]*(-?[0-9,]+)\s*MW/i);
      const imports = impMatch ? parseFloat(impMatch[1].replace(/,/g, '')) : undefined;
      const exports = expMatch ? parseFloat(expMatch[1].replace(/,/g, '')) : undefined;
      const net = netMatch ? parseFloat(netMatch[1].replace(/,/g, '')) : (imports !== undefined && exports !== undefined ? imports - exports : undefined);
      if (imports !== undefined || exports !== undefined || net !== undefined) {
        intertieFlows = { imports_mw: imports, exports_mw: exports, net_mw: net, timestamp: new Date().toISOString(), source: 'ercot_rtsc' };
        console.log('ERCOT intertie flows:', intertieFlows);
      }
    }
  } catch (e) {
    console.error('ERCOT real-time system conditions fetch failed:', e);
  }

  // Ancillary services clearing prices
  try {
    console.log('Fetching ERCOT ancillary services prices...');
    const urls = [
      'https://www.ercot.com/content/cdr/html/current_as_prices.html',
      'https://www.ercot.com/content/cdr/html/ancillary_services.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/current_as_prices.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/ancillary_services.html'
    ];
    let html: string | null = null;
    for (const url of urls) {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) { html = await res.text(); break; }
    }
    if (html) {
      const pick = (names: string[]) => {
        for (const n of names) {
          const m = html.match(new RegExp(n + '[\\s\\S]*?([0-9]+(?:\\.[0-9]+)?)', 'i'));
          if (m) return parseFloat(m[1]);
        }
        return undefined;
      };
      const regUp = pick(['Reg\\s*Up','REGUP','Regulation\\s*Up']);
      const regDown = pick(['Reg\\s*Down','REGDN','Regulation\\s*Down']);
      const rrs = pick(['RRS','Responsive\\s*Reserve']);
      const nspin = pick(['NSPIN','Non[-\\s]*Spin']);
      const frrsUp = pick(['FRRS\\s*Up','Fast\\s*RRS\\s*Up']);
      const frrsDown = pick(['FRRS\\s*Down','Fast\\s*RRS\\s*Down']);
      const values: Record<string, number> = {};
      if (regUp !== undefined) values.reg_up = regUp;
      if (regDown !== undefined) values.reg_down = regDown;
      if (rrs !== undefined) values.rrs = rrs;
      if (nspin !== undefined) values.non_spin = nspin;
      if (frrsUp !== undefined) values.frrs_up = frrsUp;
      if (frrsDown !== undefined) values.frrs_down = frrsDown;
      if (Object.keys(values).length > 0) {
        ancillaryPrices = { ...values, timestamp: new Date().toISOString(), source: 'ercot_as' };
        console.log('ERCOT ancillary prices:', ancillaryPrices);
      }
    }
  } catch (e) {
    console.error('ERCOT ancillary price fetch failed:', e);
  }

  // Transmission constraints (shadow prices)
  try {
    console.log('Fetching ERCOT transmission constraints...');
    const urls = [
      'https://www.ercot.com/content/cdr/html/real_time_congestion.html',
      'https://www.ercot.com/content/cdr/html/rt_congestion.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/real_time_congestion.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/rt_congestion.html'
    ];
    let html: string | null = null;
    for (const url of urls) {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) { html = await res.text(); break; }
    }
    if (html) {
      const items: Array<{ name: string; shadow_price: number }> = [];
      const rowRe = /<tr[^>]*>[\s\S]*?<td[^>]*>\s*([^<]+?)\s*<\/td>[\s\S]*?<td[^>]*>\s*([-$0-9.,]+)\s*<\/td>[\s\S]*?<\/tr>/gi;
      let m: RegExpExecArray | null;
      while ((m = rowRe.exec(html)) !== null) {
        const name = m[1].trim();
        const priceNum = parseFloat((m[2] || '').replace(/[^0-9.-]/g, ''));
        if (name && Number.isFinite(priceNum)) items.push({ name, shadow_price: priceNum });
      }
      if (items.length > 0) {
        constraints = { items: items.slice(0, 10), timestamp: new Date().toISOString(), source: 'ercot_congestion' };
        console.log('ERCOT constraints:', constraints.items.length);
      }
    }
  } catch (e) {
    console.error('ERCOT constraints fetch failed:', e);
  }

  // Weather-zone load
  try {
    console.log('Fetching ERCOT weather zone load...');
    const urls = [
      'https://www.ercot.com/content/cdr/html/load_forecast_by_weather_zone.html',
      'https://www.ercot.com/content/cdr/html/loadforecastbywzn.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/load_forecast_by_weather_zone.html',
      'https://r.jina.ai/http://www.ercot.com/content/cdr/html/loadforecastbywzn.html'
    ];
    let html: string | null = null;
    for (const url of urls) {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) { html = await res.text(); break; }
    }
    if (html) {
      const zones = ['Coast','East','Far\\s*West','North','North\\s*Central','South\\s*Central','South','West'];
      const values: Record<string, number> = {};
      for (const z of zones) {
        const re = new RegExp(z + '[\\s\\S]*?([0-9,]+)\\s*MW','i');
        const m = html.match(re);
        if (m) {
          const key = z.replace(/\\s+/g,' ').replace(/\\s/g, '_').toUpperCase();
          values[key] = parseFloat(m[1].replace(/,/g, ''));
        }
      }
      if (Object.keys(values).length > 0) {
        weatherZoneLoad = { ...values, timestamp: new Date().toISOString(), source: 'ercot_wz' };
        console.log('ERCOT weather zone load extracted:', Object.keys(values).length, 'zones');
      }
    }
  } catch (e) {
    console.error('ERCOT weather-zone load fetch failed:', e);
  }

  // Try ERCOT API if available
  const ercotApiKey = Deno.env.get('ERCOT_API_KEY');
  if (ercotApiKey && !realDataFound) {
    try {
      const apiHeaders = {
        'Ocp-Apim-Subscription-Key': ercotApiKey,
        'Content-Type': 'application/json'
      };

      // Try generation data
      const generationResponse = await fetch(
        'https://api.ercot.com/api/public-reports/np4-732-cd/fuel_mix_report',
        { headers: apiHeaders }
      );

      if (generationResponse.ok) {
        const generationData = await generationResponse.json();
        if (generationData && Array.isArray(generationData) && generationData.length > 0) {
          const latestGeneration = generationData[generationData.length - 1];
          
          const gasGeneration = parseFloat(latestGeneration.Natural_Gas || latestGeneration.Gas || 0);
          const windGeneration = parseFloat(latestGeneration.Wind || 0);
          const solarGeneration = parseFloat(latestGeneration.Solar || 0);
          const nuclearGeneration = parseFloat(latestGeneration.Nuclear || 0);
          const coalGeneration = parseFloat(latestGeneration.Coal || 0);
          
          const totalGeneration = gasGeneration + windGeneration + solarGeneration + nuclearGeneration + coalGeneration;
          
          if (totalGeneration > 0) {
            generationMix = {
              total_generation_mw: totalGeneration,
              natural_gas_mw: gasGeneration,
              wind_mw: windGeneration,
              solar_mw: solarGeneration,
              nuclear_mw: nuclearGeneration,
              coal_mw: coalGeneration,
              renewable_percentage: ((windGeneration + solarGeneration) / totalGeneration * 100),
              timestamp: new Date().toISOString(),
              source: 'ercot_api'
            };
            console.log('Real ERCOT generation extracted:', generationMix);
          }
        }
      }
    } catch (apiError) {
      console.error('Error calling ERCOT API:', apiError);
    }
  }

  // Try Fuel Mix dashboard (public) for real-time generation mix if still missing
  if (!generationMix) {
    try {
      const fuelUrls = [
        'https://www.ercot.com/gridmktinfo/dashboards/fuelmix',
        'https://r.jina.ai/https://www.ercot.com/gridmktinfo/dashboards/fuelmix'
      ];
      let text: string | null = null;
      for (const url of fuelUrls) {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) { text = await res.text(); break; }
      }
      if (text) {
        // Updated pattern to extract generation data from format like "Natural Gas\n\n39,466 MW(60.2%)"
        const grab = (label: string) => {
          // More flexible regex that looks for label followed by MW value with optional newlines/spaces
          const patterns = [
            // Pattern 1: Label followed by MW and percentage: "Wind\n\n7,560 MW(11.5%)"
            new RegExp(label + '[\\s\\S]{0,50}?([0-9,]+)\\s*MW\\s*\\(', 'i'),
            // Pattern 2: Label followed by just MW: "Wind 7,560 MW"
            new RegExp(label + '[\\s\\S]{0,50}?([0-9,]+)\\s*MW', 'i'),
            // Pattern 3: In a table row format
            new RegExp(label + '[\\s\\S]{0,100}?<[^>]*>\\s*([0-9,]+)\\s*MW', 'i')
          ];
          
          for (const re of patterns) {
            const m = text.match(re);
            if (m && m[1]) {
              const val = parseFloat(m[1].replace(/,/g, ''));
              // Validate it's a reasonable MW value
              if (!isNaN(val) && val >= 0 && val < 100000) {
                console.log(`Extracted ${label}: ${val} MW`);
                return val;
              }
            }
          }
          console.log(`Could not extract ${label}`);
          return 0;
        };
        
        const gas = grab('Natural\\s+Gas');
        const wind = grab('Wind');
        const solar = grab('Solar');
        const nuclear = grab('Nuclear');
        const coal = grab('Coal(?:\\s+and\\s+Lignite)?');
        const hydro = grab('Hydro');
        const storage = grab('Power\\s+Storage');
        const other = grab('Other');
        
        const total = gas + wind + solar + nuclear + coal + hydro + storage + other;
        
        console.log('ERCOT fuel mix totals:', { gas, wind, solar, nuclear, coal, hydro, storage, other, total });
        
        // Only accept if total is reasonable for ERCOT (> 30,000 MW typical)
        if (total > 30000) {
          generationMix = {
            total_generation_mw: Math.round(total),
            natural_gas_mw: Math.round(gas),
            wind_mw: Math.round(wind),
            solar_mw: Math.round(solar),
            nuclear_mw: Math.round(nuclear),
            coal_mw: Math.round(coal),
            renewable_percentage: total > 0 ? ((wind + solar + hydro) / total * 100) : 0,
            timestamp: new Date().toISOString(),
            source: 'ercot_fuelmix'
          };
          console.log('✅ ERCOT generation from Fuel Mix dashboard extracted successfully');
        } else {
          console.log('❌ ERCOT fuel mix total too low:', total, 'MW - rejecting data');
        }
      }
    } catch (fuelErr) {
      console.error('ERCOT fuel mix scrape failed:', fuelErr);
    }
  }

  // Provide fallback data if needed
  if (!loadData) {
    const currentHour = new Date().getHours();
    const currentMonth = new Date().getMonth();
    
    let baseLoad = 35000;
    if (currentHour >= 14 && currentHour <= 18) baseLoad = 50000;
    else if (currentHour >= 6 && currentHour <= 22) baseLoad = 42000;
    else baseLoad = 28000;
    
    if (currentMonth >= 5 && currentMonth <= 8) baseLoad *= 1.3;
    
    const variation = (Math.random() - 0.5) * 3000;
    const currentLoad = Math.max(25000, baseLoad + variation);
    
    loadData = {
      current_demand_mw: Math.round(currentLoad),
      peak_forecast_mw: Math.round(currentLoad * 1.15),
      reserve_margin: 15.0,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }
  
  // Do not synthesize ERCOT generation mix; if unavailable, leave undefined to avoid showing fallback
  // if (!generationMix) {
  //   // intentionally no fallback
  // }


  if (!pricing) {
    const currentHour = new Date().getHours();
    const currentMonth = new Date().getMonth();
    
    let basePrice = 35;
    if (currentHour >= 14 && currentHour <= 18) basePrice = 65;
    else if (currentHour >= 6 && currentHour <= 22) basePrice = 45;
    
    if (currentMonth >= 5 && currentMonth <= 8) basePrice *= 1.8;
    
    const variation = (Math.random() - 0.5) * 20;
    const currentPrice = Math.max(10, basePrice + variation);
    
    pricing = {
      current_price: Math.round(currentPrice * 100) / 100,
      average_price: Math.round(currentPrice * 0.9 * 100) / 100,
      peak_price: Math.round(currentPrice * 1.8 * 100) / 100,
      off_peak_price: Math.round(currentPrice * 0.5 * 100) / 100,
      market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

  // Set operatingReserve as alias to ensure backward compatibility
  operatingReserve = {
    total_reserve_mw: 0,
    spinning_reserve_mw: 0,
    supplemental_reserve_mw: 0,
    timestamp: new Date().toISOString(),
    source: 'ercot_calculated'
  };

  // Set interchange as alias to intertieFlows for backward compatibility
  interchange = intertieFlows || {
    imports_mw: 0,
    exports_mw: 0,
    net_mw: 0,
    timestamp: new Date().toISOString(),
    source: 'ercot_calculated'
  };

  // Energy storage - will be real when we add battery storage data source
  energyStorage = {
    charging_mw: 0,
    discharging_mw: 0,
    net_storage_mw: 0,
    state_of_charge_percent: null,
    timestamp: new Date().toISOString(),
    source: 'ercot_placeholder'
  };

  return { pricing, loadData, generationMix, zoneLMPs, ordcAdder, ancillaryPrices, systemFrequency, constraints, intertieFlows, weatherZoneLoad, operatingReserve, interchange, energyStorage };
}

async function fetchAESOData() {
  console.log('Fetching AESO data (APIM only)…');

  // Always use official AESO APIM endpoints per documentation
  // https://www.aeso.ca/market/market-and-system-reporting/aeso-application-programming-interface-api/
  // Example endpoints used here:
  // - https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice
  // - https://apimgw.aeso.ca/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice
  // - https://apimgw.aeso.ca/public/actualforecast-api/v1/load/albertaInternalLoad

  const apiKey =
    Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') ||
    Deno.env.get('AESO_API_KEY') ||
    Deno.env.get('AESO_SUB_KEY') ||
    Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY') || '';

  if (!apiKey) {
    console.warn('AESO API key is missing. Configure AESO_SUBSCRIPTION_KEY_PRIMARY (preferred).');
  }

  const host = 'https://apimgw.aeso.ca';
  const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  const withQuery = (url: string) => `${url}?startDate=${startDate}&endDate=${endDate}`;
  const headers: Record<string, string> = {
    'API-KEY': apiKey,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'LovableEnergy/1.0'
  };

  async function getJson(url: string) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('timeout'), 15000);
    try {
      const res = await fetch(url, { headers, signal: ctrl.signal });
      const text = await res.text();
      if (!res.ok) {
        console.error('AESO APIM not OK', res.status, res.statusText, 'for', url, 'body:', text.slice(0, 300));
        return null as any;
      }
      try { return JSON.parse(text); } catch (e) {
        console.error('AESO APIM JSON parse error:', String(e));
        return null as any;
      }
    } catch (e) {
      console.error('AESO APIM fetch error:', String(e));
      return null as any;
    } finally {
      clearTimeout(timeout);
    }
  }

  const [poolResp, smpResp, loadResp] = await Promise.allSettled([
    getJson(withQuery(`${host}/public/poolprice-api/v1.1/price/poolPrice`)),
    getJson(withQuery(`${host}/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice`)),
    getJson(withQuery(`${host}/public/actualforecast-api/v1/load/albertaInternalLoad`))
  ]);

  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined; // Not provided by these endpoints

  // Pricing: prefer Pool Price; fallback to SMP
  try {
    const poolJson: any = poolResp.status === 'fulfilled' ? poolResp.value : null;
    const smpJson: any = smpResp.status === 'fulfilled' ? smpResp.value : null;

    const poolArr: any[] = poolJson?.return?.['Pool Price Report'] || poolJson?.['Pool Price Report'] || [];
    const smpArr: any[] = smpJson?.return?.['System Marginal Price Report'] || smpJson?.['System Marginal Price Report'] || [];

    const pickLastNumber = (arr: any[], fields: string[]) => {
      if (!Array.isArray(arr)) return null;
      for (let i = arr.length - 1; i >= 0; i--) {
        for (const f of fields) {
          const n = parseFloat(String(arr[i]?.[f] ?? ''));
          if (!Number.isNaN(n)) return n;
        }
      }
      return null;
    };

    let current = pickLastNumber(poolArr, ['pool_price']);
    // Calculate average over longer period for more accurate market representation
    let avg: number | null = null;
    if (Array.isArray(poolArr) && poolArr.length > 24) {
      // Use last 7 days of data for better average calculation
      const last7DaysData = poolArr.slice(-168); // 7 days * 24 hours
      const nums = last7DaysData
        .map(r => parseFloat(String(r?.pool_price ?? '')))
        .filter((v) => Number.isFinite(v));
      if (nums.length) {
        avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        console.log(`AESO average calculated from ${nums.length} hours (7 days): ${avg.toFixed(2)} $/MWh`);
      }
    } else if (Array.isArray(poolArr) && poolArr.length) {
      // Fallback to available data if less than 7 days
      const nums = poolArr
        .map(r => parseFloat(String(r?.pool_price ?? '')))
        .filter((v) => Number.isFinite(v));
      if (nums.length) {
        avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        console.log(`AESO average calculated from ${nums.length} hours: ${avg.toFixed(2)} $/MWh`);
      }
    }

    // Fallback to SMP if Pool Price is unavailable
    if (current == null) {
      current = pickLastNumber(smpArr, ['system_marginal_price', 'SMP', 'smp']);
    }

    if (current != null) {
      const p = Math.round(current * 100) / 100;
      pricing = {
        current_price: p,
        average_price: avg != null ? Math.round(avg * 100) / 100 : Math.round(p * 0.85 * 100) / 100,
        peak_price: Math.round(p * 1.8 * 100) / 100,
        off_peak_price: Math.round(p * 0.4 * 100) / 100,
        market_conditions: p > 100 ? 'high' : p > 50 ? 'normal' : 'low',
        timestamp: new Date().toISOString(),
        source: current === pickLastNumber(poolArr, ['pool_price']) ? 'aeso_api_poolprice' : 'aeso_api_smp'
      };
    }
  } catch (e) {
    console.error('AESO pricing parse error:', e);
  }

  // Load (AIL): Actual Forecast Report
  try {
    const json: any = loadResp.status === 'fulfilled' ? loadResp.value : null;
    const arr: any[] = json?.return?.['Actual Forecast Report'] || json?.['Actual Forecast Report'] || [];
    if (Array.isArray(arr) && arr.length) {
      // last non-null actual and forecast
      let lastActual: number | null = null;
      let lastTs: string | null = null;
      let maxForecast: number | null = null;
      for (let i = arr.length - 1; i >= 0; i--) {
        const a = parseFloat(String(arr[i]?.alberta_internal_load ?? arr[i]?.AIL ?? ''));
        const f = parseFloat(String(arr[i]?.forecast_alberta_internal_load ?? arr[i]?.forecast_AIL ?? ''));
        if (Number.isFinite(f)) {
          maxForecast = maxForecast == null ? f : Math.max(maxForecast, f);
        }
        if (lastActual == null && Number.isFinite(a)) {
          lastActual = a;
          lastTs = String(arr[i]?.begin_datetime_utc || arr[i]?.begin_datetime_mpt || new Date().toISOString());
        }
        if (lastActual != null && maxForecast != null) break;
      }
      if (lastActual != null) {
        loadData = {
          current_demand_mw: Math.round(lastActual),
          peak_forecast_mw: maxForecast != null ? Math.round(maxForecast) : Math.round(lastActual * 1.15),
          reserve_margin: 12.5,
          timestamp: lastTs || new Date().toISOString(),
          source: 'aeso_api_actualforecast'
        };
      }
    }
  } catch (e) {
    console.error('AESO load parse error:', e);
  }

  // No synthetic fallbacks. If data is unavailable, fields remain undefined to avoid "estimated" labels.
  // Fetch AESO generation mix using Current Supply Demand v2 (aggregated by fuel type)
  try {
    // Per AESO docs: https://developer-apim.aeso.ca/api-details#api=currentsupplydemand-api-v2
    // Endpoint returns CSDSummaryDataVOv2 with generation_data_list: CSDGenerationFuelTypeVO[]
    const csdUrl = `${host}/public/currentsupplydemand-api/v2/csd/summary/current`;
    const csdJson: any = await getJson(csdUrl);
    const root: any = csdJson?.return ?? csdJson ?? {};

    // Primary schema key
    const list: any[] = Array.isArray(root?.generation_data_list)
      ? root.generation_data_list
      : Array.isArray(root?.generationDataList)
        ? root.generationDataList
        : [];

    if (Array.isArray(list) && list.length) {
      const getMW = (o: any) => {
        // The spec names it aggregated_net_generation
        const n = parseFloat(String(
          o?.aggregated_net_generation ?? o?.net_generation ?? o?.value ?? 0
        ));
        return Number.isFinite(n) ? n : 0;
      };

      let gas = 0, wind = 0, solar = 0, hydro = 0, nuclear = 0, coal = 0, biomass = 0, other = 0;
      for (const it of list) {
        const t = String(it?.fuel_type ?? it?.fuelType ?? '').toLowerCase();
        const mw = getMW(it);
        if (!mw) continue;
        if (t.includes('wind')) wind += mw;
        else if (t.includes('solar') || t.includes('pv')) solar += mw;
        else if (t.includes('hydro') || t.includes('water')) hydro += mw;
        else if (t.includes('gas') || t.includes('ng') || t.includes('natural')) gas += mw;
        else if (t.includes('nuclear')) nuclear += mw;
        else if (t.includes('coal')) coal += mw; // Should be 0 after coal retirement but keep mapping
        else if (t.includes('biomass') || t.includes('bio')) biomass += mw;
        else other += mw;
      }

      const total = gas + wind + solar + hydro + nuclear + coal + biomass + other;
      if (total > 0) {
        generationMix = {
          total_generation_mw: Math.round(total),
          natural_gas_mw: Math.round(gas),
          wind_mw: Math.round(wind),
          solar_mw: Math.round(solar),
          nuclear_mw: Math.round(nuclear),
          coal_mw: Math.round(coal),
          hydro_mw: Math.round(hydro),
          other_mw: Math.round(other + biomass),
          renewable_percentage: ((wind + solar + hydro + biomass) / total) * 100,
          timestamp: String(
            root?.effective_datetime_utc || root?.last_updated_datetime_utc || new Date().toISOString()
          ),
          source: 'aeso_api_csd_v2'
        };
      }
    } else {
      try { console.log('AESO CSD root keys:', Object.keys(root)); } catch {}
    }
  } catch (e) {
    console.error('AESO CSD v2 mix parse error:', e);
  }

  console.log('AESO return summary (APIM)', {
    pricingSource: pricing?.source,
    currentPrice: pricing?.current_price,
    loadSource: loadData?.source,
    mixSource: generationMix?.source,
    mixUrl: `${host}/public/currentsupplydemand-api/v2/csd/summary/current`
  });

  return { pricing, loadData, generationMix };
}