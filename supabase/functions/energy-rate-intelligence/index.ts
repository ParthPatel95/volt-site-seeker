
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { action, ...params } = await req.json()
    
    console.log('Energy Rate Intelligence request:', { action, params })

    switch (action) {
      case 'fetch_current_rates':
        return await fetchCurrentRates(supabase, params)
      case 'calculate_energy_costs':
        return await calculateEnergyCosts(supabase, params)
      case 'get_market_forecast':
        return await getMarketForecast(supabase, params)
      case 'find_best_rates':
        return await findBestRates(supabase, params)
      default:
        throw new Error('Invalid action specified')
    }

  } catch (error) {
    console.error('Energy Rate Intelligence error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Energy rate service failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function fetchCurrentRates(supabase: any, params: any) {
  const { market_code, location } = params

  console.log('Fetching current energy rates for:', { market_code, location })

  // Get market information
  const { data: markets, error: marketError } = await supabase
    .from('energy_markets')
    .select('*')
    .eq('market_code', market_code || 'ERCOT')

  if (marketError) throw marketError

  if (!markets || markets.length === 0) {
    throw new Error('Market not found')
  }

  const market = markets[0]

  // Simulate real-time rate fetching (in production, this would call actual market APIs)
  const currentRates = await simulateMarketRates(market)

  // Store the rates in database
  const { error: insertError } = await supabase
    .from('energy_rates')
    .insert(currentRates.map(rate => ({
      market_id: market.id,
      ...rate
    })))

  if (insertError) {
    console.log('Rate insert error (non-critical):', insertError.message)
  }

  // Get recent historical rates for comparison
  const { data: historicalRates } = await supabase
    .from('energy_rates')
    .select('*')
    .eq('market_id', market.id)
    .order('timestamp', { ascending: false })
    .limit(24)

  const averageRate = historicalRates?.length > 0 
    ? historicalRates.reduce((sum, rate) => sum + Number(rate.price_per_mwh), 0) / historicalRates.length
    : 0

  return new Response(JSON.stringify({
    success: true,
    market: market,
    current_rates: currentRates,
    average_24h: averageRate,
    historical_rates: historicalRates,
    last_updated: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function calculateEnergyCosts(supabase: any, params: any) {
  const { property_id, monthly_consumption_mwh, peak_demand_mw, location } = params

  console.log('Calculating energy costs for property:', property_id)

  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property_id)
    .single()

  // Find applicable utility companies and tariffs
  const { data: utilities } = await supabase
    .from('utility_companies')
    .select(`
      *,
      utility_tariffs (
        *
      )
    `)
    .eq('state', property?.state || location?.state)

  if (!utilities || utilities.length === 0) {
    throw new Error('No utility companies found for this location')
  }

  const costCalculations = []

  for (const utility of utilities) {
    for (const tariff of utility.utility_tariffs || []) {
      if (tariff.minimum_demand_mw && peak_demand_mw < tariff.minimum_demand_mw) continue
      if (tariff.maximum_demand_mw && peak_demand_mw > tariff.maximum_demand_mw) continue

      const calculation = calculateTariffCost(tariff, monthly_consumption_mwh, peak_demand_mw)
      
      costCalculations.push({
        utility_name: utility.company_name,
        tariff_name: tariff.tariff_name,
        tariff_code: tariff.tariff_code,
        monthly_cost: calculation.monthly_cost,
        annual_cost: calculation.monthly_cost * 12,
        cost_per_mwh: calculation.monthly_cost / monthly_consumption_mwh,
        breakdown: calculation.breakdown
      })

      // Store calculation in database
      if (property_id) {
        await supabase
          .from('energy_cost_calculations')
          .insert({
            property_id,
            tariff_id: tariff.id,
            monthly_consumption_mwh,
            peak_demand_mw,
            calculated_monthly_cost: calculation.monthly_cost,
            calculation_details: calculation.breakdown
          })
      }
    }
  }

  // Sort by lowest cost
  costCalculations.sort((a, b) => a.monthly_cost - b.monthly_cost)

  return new Response(JSON.stringify({
    success: true,
    property_id,
    consumption_mwh: monthly_consumption_mwh,
    peak_demand_mw,
    calculations: costCalculations,
    best_rate: costCalculations[0],
    calculated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getMarketForecast(supabase: any, params: any) {
  const { market_code, days = 7 } = params

  // Get historical data for forecasting
  const { data: historicalRates } = await supabase
    .from('energy_rates')
    .select(`
      *,
      energy_markets (market_name, market_code)
    `)
    .eq('energy_markets.market_code', market_code || 'ERCOT')
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false })

  // Simple forecast based on historical trends (in production, use ML models)
  const forecast = generateSimpleForecast(historicalRates, days)

  return new Response(JSON.stringify({
    success: true,
    market_code,
    forecast_period_days: days,
    forecast,
    confidence_level: 'Medium',
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function findBestRates(supabase: any, params: any) {
  const { power_requirements_mw, location, consumption_profile } = params

  console.log('Finding best energy rates for requirements:', params)

  // Get all utility companies in the area
  const { data: utilities } = await supabase
    .from('utility_companies')
    .select(`
      *,
      utility_tariffs (*),
      energy_markets (*)
    `)
    .eq('state', location.state)

  const recommendations = []

  for (const utility of utilities || []) {
    for (const tariff of utility.utility_tariffs || []) {
      if (tariff.minimum_demand_mw && power_requirements_mw < tariff.minimum_demand_mw) continue
      if (tariff.maximum_demand_mw && power_requirements_mw > tariff.maximum_demand_mw) continue

      const estimatedCost = calculateTariffCost(tariff, power_requirements_mw * 24 * 30, power_requirements_mw)
      
      recommendations.push({
        utility: utility.company_name,
        market: utility.energy_markets?.market_name,
        tariff: tariff.tariff_name,
        estimated_monthly_cost: estimatedCost.monthly_cost,
        cost_per_mwh: estimatedCost.monthly_cost / (power_requirements_mw * 24 * 30),
        suitability_score: calculateSuitabilityScore(tariff, power_requirements_mw, consumption_profile),
        contact_info: utility.contact_info
      })
    }
  }

  recommendations.sort((a, b) => a.estimated_monthly_cost - b.estimated_monthly_cost)

  return new Response(JSON.stringify({
    success: true,
    power_requirements_mw,
    location,
    recommendations: recommendations.slice(0, 10),
    total_options: recommendations.length,
    analyzed_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function simulateMarketRates(market: any) {
  // Simulate real-time rates based on market characteristics
  const baseRate = market.market_code === 'ERCOT' ? 35 : 
                   market.market_code === 'CAISO' ? 45 : 
                   market.market_code === 'PJM' ? 40 : 38

  const now = new Date()
  const rates = []

  // Generate hourly rates for next 24 hours
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000)
    const hourlyVariation = Math.sin((timestamp.getHours() - 6) * Math.PI / 12) * 15
    const randomVariation = (Math.random() - 0.5) * 10
    
    rates.push({
      rate_type: 'real_time',
      price_per_mwh: Math.max(0, baseRate + hourlyVariation + randomVariation),
      timestamp: timestamp.toISOString(),
      node_name: `${market.market_code}_HUB`,
      node_id: `${market.market_code}_001`
    })
  }

  return rates
}

function calculateTariffCost(tariff: any, monthly_mwh: number, peak_demand_mw: number) {
  const rateSchedule = tariff.rate_schedule
  const demandCharge = (tariff.demand_charge_per_kw || 0) * peak_demand_mw * 1000
  
  // Simplified calculation - in production, handle complex rate structures
  const energyRate = rateSchedule?.base_rate || 0.05 // $/kWh
  const energyCharge = monthly_mwh * 1000 * energyRate
  
  const totalCost = energyCharge + demandCharge

  return {
    monthly_cost: totalCost,
    breakdown: {
      energy_charge: energyCharge,
      demand_charge: demandCharge,
      rate_used: energyRate,
      peak_demand_mw,
      monthly_mwh
    }
  }
}

function calculateSuitabilityScore(tariff: any, power_mw: number, profile: any) {
  let score = 100
  
  // Penalize if close to limits
  if (tariff.minimum_demand_mw && power_mw < tariff.minimum_demand_mw * 1.2) score -= 20
  if (tariff.maximum_demand_mw && power_mw > tariff.maximum_demand_mw * 0.8) score -= 20
  
  // Bonus for good fit
  if (tariff.minimum_demand_mw && tariff.maximum_demand_mw) {
    const midpoint = (tariff.minimum_demand_mw + tariff.maximum_demand_mw) / 2
    const distance = Math.abs(power_mw - midpoint) / midpoint
    score += Math.max(0, 20 - distance * 20)
  }
  
  return Math.max(0, Math.min(100, score))
}

function generateSimpleForecast(historicalRates: any[], days: number) {
  if (!historicalRates || historicalRates.length === 0) {
    return []
  }

  const avgRate = historicalRates.reduce((sum, rate) => sum + Number(rate.price_per_mwh), 0) / historicalRates.length
  const forecast = []
  
  for (let i = 0; i < days; i++) {
    const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
    const seasonalFactor = Math.sin((futureDate.getMonth() + 1) * Math.PI / 6) * 0.1 + 1
    const weekdayFactor = futureDate.getDay() === 0 || futureDate.getDay() === 6 ? 0.9 : 1.1
    
    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      predicted_price: avgRate * seasonalFactor * weekdayFactor,
      confidence: Math.max(0.6, 0.9 - i * 0.05)
    })
  }
  
  return forecast
}
