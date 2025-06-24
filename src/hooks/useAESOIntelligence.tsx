
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AESODemandResponse {
  programs: Array<{
    program_id: string;
    program_name: string;
    participant_count: number;
    capacity_mw: number;
    availability_percentage: number;
    activation_price: number;
    response_time_minutes: number;
    status: string;
  }>;
  total_capacity_mw: number;
  available_capacity_mw: number;
  activated_capacity_mw: number;
  timestamp: string;
}

export interface AESOTransmissionLossFactors {
  transmission_loss_factors: Array<{
    zone_name: string;
    loss_factor: number;
    marginal_loss_factor: number;
    congestion_component: number;
    energy_component: number;
    last_updated: string;
  }>;
  system_average_loss: number;
  timestamp: string;
}

export interface AESOMeritOrder {
  merit_order: Array<{
    unit_id: string;
    fuel_type: string;
    capacity_mw: number;
    bid_price: number;
    availability: string;
    dispatch_priority: number;
    ramp_rate: number;
    minimum_run_time: number;
  }>;
  marginal_unit: any;
  system_marginal_price: number;
  timestamp: string;
}

export interface AESOAncillaryServices {
  regulation_up: {
    requirement_mw: number;
    procured_mw: number;
    clearing_price: number;
  };
  regulation_down: {
    requirement_mw: number;
    procured_mw: number;
    clearing_price: number;
  };
  spinning_reserve: {
    requirement_mw: number;
    procured_mw: number;
    clearing_price: number;
  };
  non_spinning_reserve: {
    requirement_mw: number;
    procured_mw: number;
    clearing_price: number;
  };
  total_procurement_cost: number;
  timestamp: string;
}

export interface AESOIntertieFlows {
  british_columbia: {
    scheduled_flow_mw: number;
    actual_flow_mw: number;
    capacity_limit_mw: number;
    congestion_status: string;
  };
  saskatchewan: {
    scheduled_flow_mw: number;
    actual_flow_mw: number;
    capacity_limit_mw: number;
    congestion_status: string;
  };
  montana: {
    scheduled_flow_mw: number;
    actual_flow_mw: number;
    capacity_limit_mw: number;
    congestion_status: string;
  };
  net_import_export_mw: number;
  price_differentials: {
    bc_price_diff: number;
    sk_price_diff: number;
    mt_price_diff: number;
  };
  timestamp: string;
}

export interface AESOWeatherImpact {
  wind_forecast_impact: {
    current_capacity_factor: number;
    forecast_24h: Array<{
      hour: number;
      capacity_factor: number;
      wind_speed_ms: number;
    }>;
    weather_alert: string;
  };
  solar_forecast_impact: {
    current_capacity_factor: number;
    forecast_24h: Array<{
      hour: number;
      capacity_factor: number;
      cloud_cover_percent: number;
      solar_irradiance: number;
    }>;
    weather_alert: string;
  };
  temperature_impact: {
    current_temp_c: number;
    heating_demand_factor: number;
    cooling_demand_factor: number;
  };
  timestamp: string;
}

export interface AESOCarbonIntensity {
  current_intensity_kg_co2_mwh: number;
  fuel_mix_percentage: {
    natural_gas: number;
    coal: number;
    wind: number;
    hydro: number;
    solar: number;
    other: number;
  };
  historical_24h: Array<{
    hour: number;
    intensity_kg_co2_mwh: number;
    renewable_percentage: number;
  }>;
  carbon_reduction_target: {
    current_year_target: number;
    progress_percentage: number;
    year_to_date_average: number;
  };
  timestamp: string;
}

export interface AESOMarketParticipants {
  participants: Array<{
    participant_id: string;
    company_name: string;
    participant_type: string;
    registered_capacity_mw: number;
    market_share_percentage: number;
    bid_frequency: number;
    avg_bid_price: number;
    compliance_status: string;
  }>;
  market_concentration: {
    hhi_index: number;
    top_5_market_share: number;
    competition_level: string;
  };
  trading_statistics: {
    total_trades_24h: number;
    average_trade_size_mw: number;
    price_spread: number;
  };
  timestamp: string;
}

export interface AESOGridReliability {
  system_adequacy: {
    reserve_margin_percentage: number;
    loss_of_load_probability: number;
    expected_unserved_energy_mwh: number;
    adequacy_status: string;
  };
  frequency_regulation: {
    current_frequency_hz: number;
    frequency_deviation_max: number;
    regulation_performance_score: number;
    agt_events_24h: number;
  };
  voltage_stability: {
    voltage_stability_margin: number;
    reactive_power_reserves_mvar: number;
    voltage_violations: number;
    stability_status: string;
  };
  transmission_security: {
    n_minus_1_violations: number;
    thermal_loading_percentage: number;
    contingency_reserves_mw: number;
    security_status: string;
  };
  reliability_indices: {
    saifi: number;
    saidi: number;
    caidi: number;
  };
  timestamp: string;
}

export interface AESOVolatilityAnalytics {
  price_volatility: {
    current_volatility_percentage: number;
    rolling_30d_volatility: number;
    volatility_regime: string;
    volatility_trend: string;
  };
  risk_metrics: {
    value_at_risk_95: number;
    expected_shortfall: number;
    maximum_drawdown: number;
    sharpe_ratio: number;
  };
  price_spikes: {
    spike_threshold: number;
    spikes_24h: number;
    spike_probability_next_hour: number;
    average_spike_duration_hours: number;
  };
  market_stress_indicators: {
    bid_ask_spread: number;
    trading_volume_abnormality: number;
    price_dispersion_index: number;
    market_liquidity_score: number;
  };
  forecasting_models: {
    garch_volatility_forecast: number;
    neural_network_price_forecast: number;
    model_confidence: number;
    forecast_horizon_hours: number;
  };
  timestamp: string;
}

export function useAESOIntelligence() {
  const [demandResponse, setDemandResponse] = useState<AESODemandResponse | null>(null);
  const [transmissionLossFactors, setTransmissionLossFactors] = useState<AESOTransmissionLossFactors | null>(null);
  const [meritOrder, setMeritOrder] = useState<AESOMeritOrder | null>(null);
  const [ancillaryServices, setAncillaryServices] = useState<AESOAncillaryServices | null>(null);
  const [intertieFlows, setIntertieFlows] = useState<AESOIntertieFlows | null>(null);
  const [weatherImpact, setWeatherImpact] = useState<AESOWeatherImpact | null>(null);
  const [carbonIntensity, setCarbonIntensity] = useState<AESOCarbonIntensity | null>(null);
  const [marketParticipants, setMarketParticipants] = useState<AESOMarketParticipants | null>(null);
  const [gridReliability, setGridReliability] = useState<AESOGridReliability | null>(null);
  const [volatilityAnalytics, setVolatilityAnalytics] = useState<AESOVolatilityAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchIntelligenceData = async (dataType: string) => {
    try {
      console.log('Fetching AESO intelligence data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: dataType }
      });

      if (error) {
        console.error('AESO Intelligence API error:', error);
        return null;
      }

      if (data?.success === false) {
        console.error('AESO Intelligence API failed:', data.error);
        return null;
      }

      console.log('AESO intelligence data received:', data);
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO intelligence data:', error);
      return null;
    }
  };

  const getDemandResponse = async () => {
    const data = await fetchIntelligenceData('fetch_demand_response');
    if (data) {
      setDemandResponse(data);
    }
    return data;
  };

  const getTransmissionLossFactors = async () => {
    const data = await fetchIntelligenceData('fetch_transmission_loss_factors');
    if (data) {
      setTransmissionLossFactors(data);
    }
    return data;
  };

  const getMeritOrder = async () => {
    const data = await fetchIntelligenceData('fetch_merit_order');
    if (data) {
      setMeritOrder(data);
    }
    return data;
  };

  const getAncillaryServices = async () => {
    const data = await fetchIntelligenceData('fetch_ancillary_services');
    if (data) {
      setAncillaryServices(data);
    }
    return data;
  };

  const getIntertieFlows = async () => {
    const data = await fetchIntelligenceData('fetch_intertie_flows');
    if (data) {
      setIntertieFlows(data);
    }
    return data;
  };

  const getWeatherImpact = async () => {
    const data = await fetchIntelligenceData('fetch_weather_impact');
    if (data) {
      setWeatherImpact(data);
    }
    return data;
  };

  const getCarbonIntensity = async () => {
    const data = await fetchIntelligenceData('fetch_carbon_intensity');
    if (data) {
      setCarbonIntensity(data);
    }
    return data;
  };

  const getMarketParticipants = async () => {
    const data = await fetchIntelligenceData('fetch_market_participants');
    if (data) {
      setMarketParticipants(data);
    }
    return data;
  };

  const getGridReliability = async () => {
    const data = await fetchIntelligenceData('fetch_grid_reliability');
    if (data) {
      setGridReliability(data);
    }
    return data;
  };

  const getVolatilityAnalytics = async () => {
    const data = await fetchIntelligenceData('fetch_volatility_analytics');
    if (data) {
      setVolatilityAnalytics(data);
    }
    return data;
  };

  const refreshAllIntelligenceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getDemandResponse(),
        getTransmissionLossFactors(),
        getMeritOrder(),
        getAncillaryServices(),
        getIntertieFlows(),
        getWeatherImpact(),
        getCarbonIntensity(),
        getMarketParticipants(),
        getGridReliability(),
        getVolatilityAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data on component mount
  useEffect(() => {
    refreshAllIntelligenceData();
    
    // Set up interval to refresh data every 15 minutes
    const interval = setInterval(refreshAllIntelligenceData, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    demandResponse,
    transmissionLossFactors,
    meritOrder,
    ancillaryServices,
    intertieFlows,
    weatherImpact,
    carbonIntensity,
    marketParticipants,
    gridReliability,
    volatilityAnalytics,
    loading,
    getDemandResponse,
    getTransmissionLossFactors,
    getMeritOrder,
    getAncillaryServices,
    getIntertieFlows,
    getWeatherImpact,
    getCarbonIntensity,
    getMarketParticipants,
    getGridReliability,
    getVolatilityAnalytics,
    refreshAllIntelligenceData
  };
}
