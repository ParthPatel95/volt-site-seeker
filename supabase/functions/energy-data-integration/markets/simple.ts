// NOTE: SPP and IESO markets do not have publicly available real-time APIs
// These functions return estimated data based on typical market characteristics
// to provide useful information even without live data

export async function fetchSPPData() {
  console.log('⚠️ SPP: No public API available - returning estimated data');
  
  // SPP (Southwest Power Pool) typical characteristics:
  // - Mix: Coal ~30%, Gas ~40%, Wind ~25%, Nuclear ~5%
  // - Average price: $25-35/MWh
  // - Load: ~40,000-50,000 MW
  
  const now = new Date();
  const hour = now.getHours();
  
  // Price varies by time of day
  const basePrice = 30;
  const timeMultiplier = (hour >= 16 && hour <= 20) ? 1.4 : // Peak hours
                        (hour >= 0 && hour <= 6) ? 0.7 :    // Off-peak
                        1.0;                                  // Normal
  
  const currentPrice = basePrice * timeMultiplier * (0.9 + Math.random() * 0.2);
  
  // Load varies by time of day
  const baseLoad = 45000;
  const loadMultiplier = (hour >= 14 && hour <= 18) ? 1.15 :
                         (hour >= 0 && hour <= 6) ? 0.85 :
                         1.0;
  
  const currentLoad = Math.round(baseLoad * loadMultiplier);
  
  // Generation mix with some variation
  const windVariation = 0.8 + Math.random() * 0.4; // Wind can vary significantly
  const totalGen = currentLoad * 1.15; // Generation > Load for reserves
  
  const windMW = Math.round(totalGen * 0.25 * windVariation);
  const gasMW = Math.round(totalGen * 0.40);
  const coalMW = Math.round(totalGen * 0.30);
  const nuclearMW = Math.round(totalGen * 0.05);
  const otherMW = Math.round(totalGen - (windMW + gasMW + coalMW + nuclearMW));
  
  return {
    pricing: {
      current_price: Math.round(currentPrice * 100) / 100,
      average_price: 30,
      peak_price: 42,
      off_peak_price: 21,
      market_conditions: currentPrice > 35 ? 'high' : currentPrice < 25 ? 'low' : 'normal',
      timestamp: now.toISOString(),
      source: 'spp_estimated'
    },
    loadData: {
      current_demand_mw: currentLoad,
      peak_forecast_mw: Math.round(baseLoad * 1.15),
      reserve_margin: 15,
      timestamp: now.toISOString(),
      source: 'spp_estimated'
    },
    generationMix: {
      total_generation_mw: Math.round(totalGen),
      natural_gas_mw: gasMW,
      coal_mw: coalMW,
      nuclear_mw: nuclearMW,
      wind_mw: windMW,
      solar_mw: Math.round(totalGen * 0.02 * (hour >= 9 && hour <= 18 ? 1 : 0)), // Solar only during day
      hydro_mw: 0,
      other_mw: otherMW,
      renewable_percentage: Math.round(((windMW + (hour >= 9 && hour <= 18 ? totalGen * 0.02 : 0)) / totalGen) * 100 * 100) / 100,
      timestamp: now.toISOString(),
      source: 'spp_estimated'
    }
  };
}

export async function fetchIESOData() {
  console.log('⚠️ IESO: No public API available - returning estimated data');
  
  // IESO (Ontario) typical characteristics:
  // - Mix: Nuclear ~60%, Hydro ~24%, Gas ~10%, Wind ~6%
  // - Average price: CAD $25-35/MWh
  // - Load: ~16,000-20,000 MW
  
  const now = new Date();
  const hour = now.getHours();
  
  // Price in CAD
  const basePrice = 28;
  const timeMultiplier = (hour >= 16 && hour <= 20) ? 1.3 :
                        (hour >= 0 && hour <= 6) ? 0.8 :
                        1.0;
  
  const currentPrice = basePrice * timeMultiplier * (0.9 + Math.random() * 0.2);
  
  // Load varies by time of day
  const baseLoad = 18000;
  const loadMultiplier = (hour >= 17 && hour <= 19) ? 1.12 :
                         (hour >= 1 && hour <= 5) ? 0.88 :
                         1.0;
  
  const currentLoad = Math.round(baseLoad * loadMultiplier);
  
  // Ontario has very stable nuclear + hydro base
  const totalGen = currentLoad * 1.12;
  const nuclearMW = Math.round(totalGen * 0.60);
  const hydroMW = Math.round(totalGen * 0.24);
  const windMW = Math.round(totalGen * 0.06 * (0.7 + Math.random() * 0.6));
  const gasMW = Math.round(totalGen * 0.10);
  const solarMW = Math.round(totalGen * 0.01 * (hour >= 9 && hour <= 17 ? 1 : 0));
  const otherMW = Math.round(totalGen - (nuclearMW + hydroMW + windMW + gasMW + solarMW));
  
  const renewableMW = hydroMW + windMW + solarMW;
  
  return {
    pricing: {
      current_price: Math.round(currentPrice * 100) / 100,
      average_price: 28,
      peak_price: 36.4,
      off_peak_price: 22.4,
      market_conditions: currentPrice > 33 ? 'high' : currentPrice < 24 ? 'low' : 'normal',
      timestamp: now.toISOString(),
      source: 'ieso_estimated'
    },
    loadData: {
      current_demand_mw: currentLoad,
      peak_forecast_mw: Math.round(baseLoad * 1.12),
      reserve_margin: 18,
      timestamp: now.toISOString(),
      source: 'ieso_estimated'
    },
    generationMix: {
      total_generation_mw: Math.round(totalGen),
      natural_gas_mw: gasMW,
      nuclear_mw: nuclearMW,
      hydro_mw: hydroMW,
      wind_mw: windMW,
      solar_mw: solarMW,
      biofuel_mw: 0,
      other_mw: otherMW,
      renewable_percentage: Math.round((renewableMW / totalGen) * 100 * 100) / 100,
      timestamp: now.toISOString(),
      source: 'ieso_estimated'
    }
  };
}
