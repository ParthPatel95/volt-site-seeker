// Simplified market data for SPP and IESO

export async function fetchSPPData() {
  console.log('Fetching SPP data...');
  
  const pricing = {
    current_price: 28.50,
    average_price: 25.40,
    peak_price: 45.80,
    off_peak_price: 17.30,
    market_conditions: 'normal',
    timestamp: new Date().toISOString(),
    source: 'spp_estimated'
  };

  const loadData = {
    current_demand_mw: 37500,
    peak_forecast_mw: 43100,
    reserve_margin: 18.5,
    timestamp: new Date().toISOString(),
    source: 'spp_estimated'
  };

  const generationMix = {
    total_generation_mw: 39200,
    coal_mw: 13700,
    natural_gas_mw: 16700,
    wind_mw: 6900,
    nuclear_mw: 2200,
    solar_mw: 660,
    hydro_mw: 220,
    other_mw: 220,
    renewable_percentage: 29.5,
    timestamp: new Date().toISOString(),
    source: 'spp_estimated'
  };

  console.log('✅ SPP data (estimated)');
  return { pricing, loadData, generationMix };
}

export async function fetchIESOData() {
  console.log('Fetching IESO (Ontario) data...');
  
  const pricing = {
    current_price: 32.50,
    average_price: 29.80,
    peak_price: 52.00,
    off_peak_price: 16.25,
    market_conditions: 'normal',
    timestamp: new Date().toISOString(),
    source: 'ieso_estimated'
  };

  const loadData = {
    current_demand_mw: 15500,
    peak_forecast_mw: 17800,
    reserve_margin: 22.0,
    timestamp: new Date().toISOString(),
    source: 'ieso_estimated'
  };

  const generationMix = {
    total_generation_mw: 16200,
    nuclear_mw: 9500,
    hydro_mw: 4800,
    natural_gas_mw: 1200,
    wind_mw: 600,
    solar_mw: 80,
    coal_mw: 0,
    other_mw: 20,
    renewable_percentage: 33.8,
    timestamp: new Date().toISOString(),
    source: 'ieso_estimated'
  };

  console.log('✅ IESO data (estimated)');
  return { pricing, loadData, generationMix };
}
