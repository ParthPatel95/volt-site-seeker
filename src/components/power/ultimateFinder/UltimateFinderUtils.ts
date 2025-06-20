
import { supabase } from '@/integrations/supabase/client';
import { FinderResult, SearchStats } from './UltimateFinderTypes';

export const calculateRateEstimation = async (result: FinderResult, searchRegion: 'alberta' | 'texas') => {
  try {
    const defaultPowerRequirement = 50;
    
    const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
      body: {
        action: 'calculate_energy_costs',
        monthly_consumption_mwh: defaultPowerRequirement * 24 * 30,
        peak_demand_mw: defaultPowerRequirement,
        location: { state: searchRegion === 'texas' ? 'TX' : 'AB' },
        substation_info: {
          voltage_level: result.voltage_level,
          capacity: result.capacity_estimate,
          utility_owner: result.utility_owner
        }
      }
    });

    if (error) throw error;

    const baseRate = searchRegion === 'texas' ? 0.045 : 0.065;
    const demandCharge = searchRegion === 'texas' ? 15 : 18;
    
    let rateMultiplier = 1.0;
    if (result.voltage_level.includes('500kV') || result.voltage_level.includes('345kV')) {
      rateMultiplier = 0.85;
    } else if (result.voltage_level.includes('138kV')) {
      rateMultiplier = 0.92;
    }

    const estimatedRate = baseRate * rateMultiplier;
    const monthlyEnergyConsumption = defaultPowerRequirement * 24 * 30;
    const monthlyEnergyCost = monthlyEnergyConsumption * estimatedRate * 1000;
    const monthlyDemandCost = defaultPowerRequirement * 1000 * demandCharge;
    const totalMonthlyCost = monthlyEnergyCost + monthlyDemandCost;

    return {
      estimated_rate_per_kwh: estimatedRate,
      demand_charge_per_kw: demandCharge,
      monthly_cost_estimate: totalMonthlyCost,
      annual_cost_estimate: totalMonthlyCost * 12,
      rate_tier: defaultPowerRequirement > 100 ? 'Ultra-Large Industrial' : 'Large Industrial',
      utility_market: searchRegion === 'texas' ? 'ERCOT Competitive' : 'Alberta Regulated'
    };
  } catch (error) {
    console.error('Rate estimation error:', error);
    const fallbackRate = searchRegion === 'texas' ? 0.05 : 0.07;
    const defaultPowerRequirement = 50;
    const monthlyConsumption = defaultPowerRequirement * 24 * 30;
    const monthlyCost = monthlyConsumption * fallbackRate * 1000 + (defaultPowerRequirement * 1000 * 15);
    
    return {
      estimated_rate_per_kwh: fallbackRate,
      demand_charge_per_kw: 15,
      monthly_cost_estimate: monthlyCost,
      annual_cost_estimate: monthlyCost * 12,
      rate_tier: 'Large Industrial',
      utility_market: searchRegion === 'texas' ? 'ERCOT' : 'Alberta'
    };
  }
};

export const consolidateAllSources = async (regulatory: any, satellite: any, google: any, database: any[]) => {
  const allResults: FinderResult[] = [];
  let stats: SearchStats = {
    total_found: 0,
    regulatory_sources: 0,
    satellite_detections: 0,
    validated_locations: 0,
    high_confidence: 0
  };

  if (regulatory?.data?.substations_found) {
    stats.regulatory_sources = regulatory.data.substations_found;
  }

  if (google?.substations) {
    google.substations.forEach((sub: any, idx: number) => {
      allResults.push({
        id: `google_${sub.place_id}`,
        name: sub.name,
        coordinates: { lat: sub.latitude, lng: sub.longitude },
        confidence_score: 85,
        source: 'Google Maps Places API',
        voltage_level: '138kV',
        capacity_estimate: '100 MVA',
        utility_owner: 'Unknown',
        validation_status: 'pending',
        infrastructure_features: ['Verified location', 'Public data'],
        discovery_method: 'Google Maps Search'
      });
    });
  }

  if (satellite?.detections) {
    satellite.detections.forEach((detection: any, idx: number) => {
      allResults.push({
        id: `satellite_${idx}`,
        name: `Satellite Detection ${detection.coordinates.lat.toFixed(4)}, ${detection.coordinates.lng.toFixed(4)}`,
        coordinates: detection.coordinates,
        confidence_score: detection.confidence_score,
        source: 'Satellite ML Analysis',
        voltage_level: detection.voltage_indicators[0] || '138kV',
        capacity_estimate: detection.capacity_estimate,
        validation_status: 'pending',
        infrastructure_features: detection.infrastructure_features,
        discovery_method: 'AI/ML Satellite Analysis'
      });
    });
    stats.satellite_detections = satellite.detections.length;
  }

  database.forEach((sub, idx) => {
    allResults.push({
      id: `db_${sub.id}`,
      name: sub.name,
      coordinates: { lat: sub.latitude, lng: sub.longitude },
      confidence_score: 95,
      source: 'Database Record',
      voltage_level: sub.voltage_level || '138kV',
      capacity_estimate: `${sub.capacity_mva} MVA`,
      utility_owner: sub.utility_owner,
      validation_status: 'confirmed',
      infrastructure_features: ['Verified substation'],
      discovery_method: 'Database Integration'
    });
  });

  stats.total_found = allResults.length;
  stats.validated_locations = allResults.filter(r => r.validation_status === 'confirmed').length;
  stats.high_confidence = allResults.filter(r => r.confidence_score >= 90).length;

  return { results: allResults, stats };
};

export const storeNewSubstations = async (results: FinderResult[], selectedCity: string, searchRegion: 'alberta' | 'texas') => {
  const newSubstations = [];
  
  for (const result of results) {
    const { data: existing } = await supabase
      .from('substations')
      .select('id')
      .eq('latitude', result.coordinates.lat)
      .eq('longitude', result.coordinates.lng)
      .single();

    if (!existing) {
      newSubstations.push({
        name: result.name,
        latitude: result.coordinates.lat,
        longitude: result.coordinates.lng,
        capacity_mva: parseInt(result.capacity_estimate.split(' ')[0]) || 100,
        voltage_level: result.voltage_level,
        utility_owner: result.utility_owner || 'Unknown',
        city: selectedCity !== 'All Cities' ? selectedCity : (searchRegion === 'texas' ? 'Texas' : 'Alberta'),
        state: searchRegion === 'texas' ? 'TX' : 'AB',
        coordinates_source: result.source.toLowerCase().replace(/\s+/g, '_'),
        status: 'active',
        interconnection_type: 'transmission',
        load_factor: 0.75
      });
    }
  }

  if (newSubstations.length > 0) {
    const { error } = await supabase
      .from('substations')
      .insert(newSubstations);

    if (error) {
      console.error('Error storing substations:', error);
      throw error;
    }

    console.log(`Stored ${newSubstations.length} new substations`);
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
  if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};
