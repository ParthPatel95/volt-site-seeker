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
      ercot: ercotResult.status === 'fulfilled' ? ercotResult.value : null,
      aeso: aesoResult.status === 'fulfilled' ? aesoResult.value : null
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

  // Try ERCOT's system load data
  try {
    console.log('Fetching ERCOT system load data...');
    const loadUrl = 'https://www.ercot.com/content/cdr/html/CURRENT_DASL_OP_HSL.html';
    const loadResponse = await fetch(loadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (loadResponse.ok) {
      const loadHtml = await loadResponse.text();
      console.log('ERCOT load data length:', loadHtml.length);
      
      // Extract current system load
      let currentLoadVal: number | null = null;
      const loadMatch = loadHtml.match(/Current[^0-9]*([0-9,]+)/i) ||
                       loadHtml.match(/System\s+Load[^0-9]*([0-9,]+)/i) ||
                       loadHtml.match(/System\s+Demand[^0-9]*([0-9,]+)/i) ||
                       loadHtml.match(/([0-9,]+)\s*MW\s*(?:Current|Actual)/i);
      if (loadMatch) {
        currentLoadVal = parseFloat(loadMatch[1].replace(/,/g, ''));
      }
      // Table-based fallback: capture number in the next TD after a label cell
      if (!currentLoadVal) {
        const rowNumMatch = loadHtml.match(/<tr[^>]*>[\s\S]*?(?:Current|System)[\s\S]*?(?:Demand|Load)[\s\S]*?<td[^>]*>\s*([0-9,]+)\s*<\/td>[\s\S]*?<\/tr>/i);
        if (rowNumMatch) {
          currentLoadVal = parseFloat(rowNumMatch[1].replace(/,/g, ''));
        }
      }
      if (currentLoadVal && currentLoadVal > 0) {
        loadData = {
          current_demand_mw: currentLoadVal,
          peak_forecast_mw: currentLoadVal * 1.15,
          reserve_margin: 15.0,
          timestamp: new Date().toISOString(),
          source: 'ercot_load_html'
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
      const proxyLoadUrl = 'https://r.jina.ai/http://www.ercot.com/content/cdr/html/CURRENT_DASL_OP_HSL.html';
      const proxiedLoad = await fetch(proxyLoadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (proxiedLoad.ok) {
        const loadHtml = await proxiedLoad.text();
        let currentLoadVal: number | null = null;
        const loadMatch = loadHtml.match(/Current[^0-9]*([0-9,]+)/i) ||
                         loadHtml.match(/System\s+Load[^0-9]*([0-9,]+)/i) ||
                         loadHtml.match(/System\s+Demand[^0-9]*([0-9,]+)/i) ||
                         loadHtml.match(/([0-9,]+)\s*MW\s*(?:Current|Actual)/i) ||
                         loadHtml.match(/<tr[^>]*>[\s\S]*?(?:Current|System)[\s\S]*?(?:Demand|Load)[\s\S]*?<td[^>]*>\s*([0-9,]+)\s*<\/td>[\s\S]*?<\/tr>/i);
        if (loadMatch) currentLoadVal = parseFloat(loadMatch[1].replace(/,/g, ''));
        if (currentLoadVal && currentLoadVal > 0) {
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
  
  if (!generationMix) {
    const totalGeneration = loadData ? loadData.current_demand_mw * 1.03 : 45000;
    const currentHour = new Date().getHours();
    
    let solarMW = 0;
    if (currentHour >= 6 && currentHour <= 19) {
      const solarFactor = Math.sin(((currentHour - 6) / 13) * Math.PI);
      solarMW = totalGeneration * 0.12 * solarFactor;
    }
    
    const windFactor = 0.2 + (Math.random() * 0.4);
    const windMW = totalGeneration * 0.35 * windFactor;
    const gasMW = totalGeneration - solarMW - windMW - (totalGeneration * 0.11);
    
    generationMix = {
      total_generation_mw: Math.round(totalGeneration),
      natural_gas_mw: Math.round(Math.max(0, gasMW)),
      wind_mw: Math.round(windMW),
      solar_mw: Math.round(solarMW),
      nuclear_mw: Math.round(totalGeneration * 0.08),
      coal_mw: Math.round(totalGeneration * 0.03),
      renewable_percentage: Math.round(((windMW + solarMW) / totalGeneration * 100)),
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

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

  return { pricing, loadData, generationMix };
}

async function fetchAESOData() {
  console.log('Fetching AESO data...');

  let pricing, loadData, generationMix;
  let realDataFound = false;

  // Try AESO's Current Supply and Demand report first
  try {
    console.log('Trying AESO CSD Report for real-time data...');
    const csdUrl = 'https://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet';
    const csdResponse = await fetch(csdUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (csdResponse.ok) {
      const htmlText = await csdResponse.text();
      console.log('AESO CSD data received, length:', htmlText.length);

      // Extract Pool Price
      const poolPriceMatch = htmlText.match(/Pool\s+Price[^$]*\$([0-9,]+\.?[0-9]*)/i) ||
                             htmlText.match(/System\s+Marginal\s+Price[^$]*\$([0-9,]+\.?[0-9]*)/i) ||
                             htmlText.match(/>Current\s+Pool\s+Price<[^$]*\$([0-9,]+\.?[0-9]*)/i);
      
      if (poolPriceMatch) {
        const currentPrice = parseFloat(poolPriceMatch[1].replace(/,/g, ''));
        if (currentPrice >= 0) {
          pricing = {
            current_price: currentPrice,
            average_price: currentPrice * 0.85,
            peak_price: currentPrice * 1.8,
            off_peak_price: currentPrice * 0.4,
            market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
            timestamp: new Date().toISOString(),
            source: 'aeso_csd'
          };
          console.log('Real AESO pricing extracted:', pricing);
          realDataFound = true;
        }
      }

      // Extract Alberta Internal Load
      const loadMatch = htmlText.match(/Alberta\s+Internal\s+Load[^0-9]*([0-9,]+)/i) ||
                       htmlText.match(/Total\s+Internal\s+Load[^0-9]*([0-9,]+)/i) ||
                       htmlText.match(/System\s+Load[^0-9]*([0-9,]+)/i);
      
      if (loadMatch) {
        const currentLoad = parseFloat(loadMatch[1].replace(/,/g, ''));
        if (currentLoad > 0) {
          loadData = {
            current_demand_mw: currentLoad,
            peak_forecast_mw: currentLoad * 1.3,
            reserve_margin: 12.5,
            capacity_margin: 15.0,
            forecast_date: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            source: 'aeso_csd'
          };
          console.log('Real AESO load extracted:', loadData);
          realDataFound = true;
        }
      }

      // Extract generation data
      const gasMatch = htmlText.match(/GAS[^0-9]*([0-9,]+)/i);
      const windMatch = htmlText.match(/WIND[^0-9]*([0-9,]+)/i);
      const hydroMatch = htmlText.match(/HYDRO[^0-9]*([0-9,]+)/i);
      const coalMatch = htmlText.match(/COAL[^0-9]*([0-9,]+)/i);
      
      if (gasMatch || windMatch || hydroMatch || coalMatch) {
        const gasGen = gasMatch ? parseFloat(gasMatch[1].replace(/,/g, '')) : 0;
        const windGen = windMatch ? parseFloat(windMatch[1].replace(/,/g, '')) : 0;
        const hydroGen = hydroMatch ? parseFloat(hydroMatch[1].replace(/,/g, '')) : 0;
        const coalGen = coalMatch ? parseFloat(coalMatch[1].replace(/,/g, '')) : 0;
        const totalGen = gasGen + windGen + hydroGen + coalGen;
        
        if (totalGen > 0) {
          generationMix = {
            total_generation_mw: totalGen,
            natural_gas_mw: gasGen,
            wind_mw: windGen,
            hydro_mw: hydroGen,
            coal_mw: coalGen,
            solar_mw: 0,
            other_mw: 0,
            renewable_percentage: ((windGen + hydroGen) / totalGen * 100),
            timestamp: new Date().toISOString(),
            source: 'aeso_csd'
          };
          console.log('Real AESO generation extracted:', generationMix);
          realDataFound = true;
        }
      }
    }
  } catch (csdError) {
    console.error('Error fetching AESO CSD data:', csdError);
  }

  // If CSD HTML failed, try via proxy reader (handles TLS issues)
  if (!pricing || !loadData || !generationMix) {
    try {
      console.log('Trying AESO CSD via proxy...');

      // Try multiple proxy variants (some endpoints are picky about contentType and scheme)
      const proxyUrls = [
        'https://r.jina.ai/http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet?contentType=html',
        'https://r.jina.ai/http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet',
      ];

      let proxyText: string | null = null;
      for (const url of proxyUrls) {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          proxyText = await res.text();
          console.log('AESO CSD proxy data len:', proxyText.length, 'from', url);
          break;
        }
      }

      // As a last resort, try CSV via proxy and parse text
      if (!proxyText) {
        const csvUrl = 'https://r.jina.ai/http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet?contentType=csv';
        const resCsv = await fetch(csvUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (resCsv.ok) {
          proxyText = await resCsv.text();
          console.log('AESO CSD proxy CSV len:', proxyText.length);
        }
      }

      if (proxyText) {
        const text = proxyText;

        // Flexible number extractors that work on HTML or plain text
        const num = (s: string | undefined | null) => {
          if (!s) return null;
          const m = s.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/);
          return m ? parseFloat(m[1].replace(/,/g, '')) : null;
        };

        // Pricing
        if (!pricing) {
          const priceMatch = text.match(/(?:Pool|System)\s+(?:Marginal\s+)?Price[^0-9$]*\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/i);
          const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
          if (price !== null && price >= 0) {
            pricing = {
              current_price: price,
              average_price: price * 0.85,
              peak_price: price * 1.8,
              off_peak_price: price * 0.4,
              market_conditions: price > 100 ? 'high' : price > 50 ? 'normal' : 'low',
              timestamp: new Date().toISOString(),
              source: 'aeso_csd_proxy'
            };
            realDataFound = true;
          } else {
            // CSV heuristic: find a line with "Pool Price" and grab the first number
            const line = text.split(/\r?\n/).find(l => /pool\s*price/i.test(l));
            const priceCsv = num(line || '');
            if (priceCsv !== null && priceCsv >= 0) {
              pricing = {
                current_price: priceCsv,
                average_price: priceCsv * 0.85,
                peak_price: priceCsv * 1.8,
                off_peak_price: priceCsv * 0.4,
                market_conditions: priceCsv > 100 ? 'high' : priceCsv > 50 ? 'normal' : 'low',
                timestamp: new Date().toISOString(),
                source: 'aeso_csd_proxy'
              };
              realDataFound = true;
            }
          }
        }

        // Load
        if (!loadData) {
          const loadMatch = text.match(/(?:Alberta|Total)\s+Internal\s+Load[^0-9]*([0-9,]+)/i) ||
                            text.match(/System\s+Load[^0-9]*([0-9,]+)/i) ||
                            text.match(/AIES\s+(?:Demand|Load)[^0-9]*([0-9,]+)/i);
          const currentLoad = loadMatch ? parseFloat(loadMatch[1].replace(/,/g, '')) : null;

          if (currentLoad && currentLoad > 0) {
            loadData = {
              current_demand_mw: currentLoad,
              peak_forecast_mw: currentLoad * 1.3,
              reserve_margin: 12.5,
              capacity_margin: 15.0,
              forecast_date: new Date().toISOString(),
              timestamp: new Date().toISOString(),
              source: 'aeso_csd_proxy'
            };
            realDataFound = true;
          } else {
            // CSV heuristic: find a line that looks like AIL/AIES load
            const line = text.split(/\r?\n/).find(l => /(AIES|Alberta).*?(Load|Demand)/i.test(l));
            const loadCsv = num(line || '');
            if (loadCsv && loadCsv > 0) {
              loadData = {
                current_demand_mw: loadCsv,
                peak_forecast_mw: loadCsv * 1.3,
                reserve_margin: 12.5,
                capacity_margin: 15.0,
                forecast_date: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                source: 'aeso_csd_proxy'
              };
              realDataFound = true;
            }
          }
        }

        // Generation (best-effort on text output)
        if (!generationMix) {
          const gas = num((text.match(/GAS[^0-9]*([0-9,]+)/i) || [])[1]);
          const wind = num((text.match(/WIND[^0-9]*([0-9,]+)/i) || [])[1]);
          const hydro = num((text.match(/HYDRO[^0-9]*([0-9,]+)/i) || [])[1]);
          const coal = num((text.match(/COAL[^0-9]*([0-9,]+)/i) || [])[1]);
          const vals = [gas, wind, hydro, coal].map(v => v || 0);
          const totalGen = vals.reduce((a, b) => a + b, 0);
          if (totalGen > 0) {
            generationMix = {
              total_generation_mw: totalGen,
              natural_gas_mw: vals[0],
              wind_mw: vals[1],
              hydro_mw: vals[2],
              coal_mw: vals[3],
              solar_mw: 0,
              other_mw: 0,
              renewable_percentage: ((vals[1] + vals[2]) / totalGen * 100),
              timestamp: new Date().toISOString(),
              source: 'aeso_csd_proxy'
            };
            realDataFound = true;
          }
        }
      }
    } catch (proxyErr) {
      console.error('AESO CSD proxy fetch failed:', proxyErr);
    }
  }

  const aesoApiKey = Deno.env.get('AESO_API_KEY');
  const aesoSubKey = Deno.env.get('AESO_SUB_KEY');
  
  if ((aesoApiKey && aesoSubKey) && !realDataFound) {
    try {
      console.log('Trying AESO API with keys...');
      const apiHeaders = {
        'X-API-Key': aesoApiKey,
        'Ocp-Apim-Subscription-Key': aesoSubKey,
        'Content-Type': 'application/json'
      };

      const priceResponse = await fetch(
        'https://api.aeso.ca/report/v1.1/price/poolPrice',
        { headers: apiHeaders }
      );
      
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData?.return?.Pool_Price_Report?.length > 0) {
          const latest = priceData.return.Pool_Price_Report[priceData.return.Pool_Price_Report.length - 1];
          const price = parseFloat(latest.price || latest.system_marginal_price || 0);
          
          if (price > 0) {
            pricing = {
              current_price: price,
              average_price: price * 0.85,
              peak_price: price * 1.8,
              off_peak_price: price * 0.4,
              market_conditions: price > 100 ? 'high' : price > 50 ? 'normal' : 'low',
              timestamp: new Date().toISOString(),
              source: 'aeso_api'
            };
            realDataFound = true;
          }
        }
      }
    } catch (apiError) {
      console.error('AESO API error:', apiError);
    }
  }

  // Provide fallback data if needed
  if (!pricing) {
    const currentHour = new Date().getHours();
    const basePrice = currentHour >= 7 && currentHour <= 22 ? 85 : 45;
    const randomVariation = (Math.random() - 0.5) * 20;
    const currentPrice = Math.max(20, basePrice + randomVariation);
    
    pricing = {
      current_price: currentPrice,
      average_price: currentPrice * 0.85,
      peak_price: currentPrice * 1.8,
      off_peak_price: currentPrice * 0.4,
      market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

  if (!loadData) {
    const currentHour = new Date().getHours();
    const baseLoad = currentHour >= 7 && currentHour <= 22 ? 12000 : 9500;
    const randomVariation = (Math.random() - 0.5) * 1000;
    const currentLoad = Math.max(8000, baseLoad + randomVariation);
    
    loadData = {
      current_demand_mw: currentLoad,
      peak_forecast_mw: currentLoad * 1.3,
      reserve_margin: 12.5,
      capacity_margin: 15.0,
      forecast_date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

  if (!generationMix && loadData) {
    const totalGeneration = loadData.current_demand_mw;
    
    generationMix = {
      total_generation_mw: totalGeneration,
      natural_gas_mw: totalGeneration * 0.45,
      wind_mw: totalGeneration * 0.25,
      solar_mw: totalGeneration * 0.08,
      coal_mw: totalGeneration * 0.12,
      hydro_mw: totalGeneration * 0.10,
      renewable_percentage: 43.0,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

  return { pricing, loadData, generationMix };
}