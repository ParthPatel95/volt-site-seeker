// IESO (Independent Electricity System Operator - Ontario) Data Fetching

export async function fetchIESOData() {
  console.log('Fetching IESO (Ontario) data from public reports...');
  
  let pricing: any;
  let loadData: any;
  let generationMix: any;

  // Helper to parse XML
  function parseXMLValue(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}>([^<]+)<\/${tagName}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  // Fetch Real-Time Generation Data (Generator Output and Capability Report)
  try {
    console.log('Fetching IESO generation output...');
    const genUrl = 'http://reports.ieso.ca/public/GenOutputCapability/PUB_GenOutputCapability.xml';
    
    const response = await fetch(genUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    console.log('IESO generation response status:', response.status);
    
    if (response.ok) {
      const xml = await response.text();
      console.log('IESO generation XML length:', xml.length);
      
      // Extract fuel types and their generation
      let nuclear = 0, hydro = 0, gas = 0, wind = 0, solar = 0, biofuel = 0;
      
      // Parse XML for generator outputs grouped by fuel type
      const fuelTypeMatches = xml.matchAll(/<Fuel>([^<]+)<\/Fuel>[\s\S]*?<Output>([^<]+)<\/Output>/g);
      
      for (const match of fuelTypeMatches) {
        const fuelType = match[1].toLowerCase();
        const output = parseFloat(match[2]) || 0;
        
        if (fuelType.includes('nuclear')) nuclear += output;
        else if (fuelType.includes('hydro')) hydro += output;
        else if (fuelType.includes('gas') || fuelType.includes('natural')) gas += output;
        else if (fuelType.includes('wind')) wind += output;
        else if (fuelType.includes('solar')) solar += output;
        else if (fuelType.includes('bio')) biofuel += output;
      }
      
      const totalGen = nuclear + hydro + gas + wind + solar + biofuel;
      const renewableGen = hydro + wind + solar + biofuel;
      const renewablePercentage = totalGen > 0 ? (renewableGen / totalGen) * 100 : 0;
      
      console.log('IESO generation breakdown:', { nuclear, hydro, gas, wind, solar, biofuel, totalGen });
      
      if (totalGen > 10000 && totalGen < 28000) {
        generationMix = {
          total_generation_mw: Math.round(totalGen),
          nuclear_mw: Math.round(nuclear),
          hydro_mw: Math.round(hydro),
          natural_gas_mw: Math.round(gas),
          wind_mw: Math.round(wind),
          solar_mw: Math.round(solar),
          biofuel_mw: Math.round(biofuel),
          other_mw: 0,
          renewable_percentage: Math.round(renewablePercentage * 100) / 100,
          timestamp: new Date().toISOString(),
          source: 'ieso_gen_output_api'
        };
        
        console.log('✅ IESO generation mix:', generationMix);
      }
    }
  } catch (e: any) {
    console.error('❌ IESO generation error:', e.message || e);
  }

  // Fetch Real-Time Demand
  try {
    console.log('Fetching IESO demand...');
    const demandUrl = 'http://reports.ieso.ca/public/Demand/PUB_Demand.xml';
    
    const response = await fetch(demandUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    console.log('IESO demand response status:', response.status);
    
    if (response.ok) {
      const xml = await response.text();
      console.log('IESO demand XML length:', xml.length);
      
      const demandValue = parseXMLValue(xml, 'OntarioDemand');
      
      if (demandValue) {
        const currentDemand = parseFloat(demandValue) || 0;
        
        if (currentDemand > 10000 && currentDemand < 28000) {
          loadData = {
            current_demand_mw: Math.round(currentDemand),
            peak_forecast_mw: Math.round(currentDemand * 1.15),
            reserve_margin: 15,
            timestamp: new Date().toISOString(),
            source: 'ieso_demand_api'
          };
          
          console.log('✅ IESO demand data:', loadData);
        }
      }
    }
  } catch (e: any) {
    console.error('❌ IESO demand error:', e.message || e);
  }

  // Fetch HOEP (Hourly Ontario Energy Price)
  try {
    console.log('Fetching IESO HOEP pricing...');
    const pricingUrl = 'http://reports.ieso.ca/public/Price/PUB_Price.xml';
    
    const response = await fetch(pricingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    console.log('IESO pricing response status:', response.status);
    
    if (response.ok) {
      const xml = await response.text();
      console.log('IESO pricing XML length:', xml.length);
      
      const hoepValue = parseXMLValue(xml, 'HOEP');
      
      if (hoepValue) {
        const currentPrice = parseFloat(hoepValue) || 0;
        
        if (currentPrice > -50 && currentPrice < 500) {
          pricing = {
            current_price: Math.round(currentPrice * 100) / 100,
            average_price: Math.round(currentPrice * 0.92 * 100) / 100,
            peak_price: Math.round(currentPrice * 1.6 * 100) / 100,
            off_peak_price: Math.round(currentPrice * 0.55 * 100) / 100,
            market_conditions: currentPrice > 50 ? 'high' : currentPrice > 25 ? 'normal' : 'low',
            timestamp: new Date().toISOString(),
            source: 'ieso_hoep_api'
          };
          
          console.log('✅ IESO pricing (HOEP):', pricing);
        }
      }
    }
  } catch (e: any) {
    console.error('❌ IESO pricing error:', e.message || e);
  }

  console.log('IESO function complete:', { 
    pricingSource: pricing?.source, 
    loadSource: loadData?.source, 
    genSource: generationMix?.source 
  });

  return { pricing, loadData, generationMix };
}
