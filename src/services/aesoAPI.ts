import { supabase } from '@/integrations/supabase/client';

export interface AESOResponse<T = any> {
  success: boolean;
  data: T;
  source: 'aeso_api' | 'fallback' | 'emergency_fallback';
  endpoint?: string;
  error?: string;
  timestamp: string;
}

export interface AESOPoolPrice {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  timestamp: string;
  market_conditions: string;
  cents_per_kwh: number;
  rolling_30day_avg?: number;
  forecast_price?: number;
}

export interface AESOLoadForecast {
  current_demand_mw: number;
  peak_forecast_mw: number;
  forecast_date: string;
  capacity_margin: number;
  reserve_margin: number;
}

export interface AESOGeneration {
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  coal_mw: number;
  other_mw: number;
  total_generation_mw: number;
  renewable_percentage: number;
  timestamp: string;
}

export interface AESOSystemMargins {
  operating_reserve: number;
  contingency_reserve: number;
  regulation_up: number;
  regulation_down: number;
  timestamp: string;
}

export interface AESOIntertieFlows {
  bc_flow_mw: number;
  saskatchewan_flow_mw: number;
  montana_flow_mw: number;
  total_import_mw: number;
  timestamp: string;
}

export interface AESOSystemMarginalPrice {
  smp_price: number;
  timestamp: string;
  forecast_smp: number;
}

export interface AESOOutages {
  total_outages: number;
  generation_outages_mw: number;
  transmission_outages: number;
  timestamp: string;
}

export class AESOAPIService {
  private static instance: AESOAPIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 90 * 1000; // 90 seconds cache for live data

  static getInstance(): AESOAPIService {
    if (!AESOAPIService.instance) {
      AESOAPIService.instance = new AESOAPIService();
    }
    return AESOAPIService.instance;
  }

  private getCacheKey(endpoint: string, params: Record<string, string> = {}): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private isCacheValid(cacheEntry: { data: any; timestamp: number }): boolean {
    return Date.now() - cacheEntry.timestamp < this.CACHE_TTL;
  }

  private async callAESOEndpoint<T>(
    endpoint: string, 
    params: Record<string, string> = {}
  ): Promise<AESOResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached) && cached.data?.source === 'aeso_api') {
      console.log(`📋 Using cached LIVE AESO data for ${endpoint}`);
      return cached.data;
    }

    try {
      console.log(`🌐 Calling AESO API Gateway: ${endpoint}`, params);
      
      const response = await supabase.functions.invoke('aeso-data-integration', {
        body: { endpoint, params }
      });

      if (response.error) {
        console.error('❌ Supabase function error:', response.error);
        throw new Error(`Function error: ${response.error.message}`);
      }

      const result = response.data as AESOResponse<T>;
      
      if (result.source === 'aeso_api') {
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        console.log(`✅ LIVE AESO data cached for ${endpoint}`);
      }
      
      console.log(`✅ AESO API Gateway call successful: ${endpoint}`, result.source);
      return result;

    } catch (error) {
      console.error(`💥 AESO API Gateway call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Pool Price API
  async getPoolPrice(startDate?: string, endDate?: string): Promise<AESOResponse<AESOPoolPrice>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOPoolPrice>('pool-price', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // System Marginal Price API
  async getSystemMarginalPrice(startDate?: string, endDate?: string): Promise<AESOResponse<AESOSystemMarginalPrice>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOSystemMarginalPrice>('system-marginal-price', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // Load Forecast API - Updated with proper parameters
  async getLoadForecast(startDate?: string, endDate?: string, dataType?: 'forecast' | 'actual'): Promise<AESOResponse<AESOLoadForecast>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOLoadForecast>('load-forecast', {
      startDate: startDate || today,
      endDate: endDate || startDate || today,
      dataType: dataType || 'forecast',
      responseFormat: 'json'
    });
  }

  // Generation API
  async getGeneration(startDate?: string, endDate?: string): Promise<AESOResponse<AESOGeneration>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOGeneration>('generation', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // Generation Forecast API
  async getGenerationForecast(startDate?: string, endDate?: string): Promise<AESOResponse<AESOGeneration>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOGeneration>('generation-forecast', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // Intertie Flows API
  async getIntertieFlows(startDate?: string, endDate?: string): Promise<AESOResponse<AESOIntertieFlows>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOIntertieFlows>('intertie-flows', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // System Margins API
  async getSystemMargins(): Promise<AESOResponse<AESOSystemMargins>> {
    return this.callAESOEndpoint<AESOSystemMargins>('system-margins');
  }

  // Outages API - Updated to use the correct endpoint
  async getOutages(startDate?: string, endDate?: string): Promise<AESOResponse<AESOOutages>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOOutages>('outages', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // Supply Adequacy API
  async getSupplyAdequacy(): Promise<AESOResponse<any>> {
    return this.callAESOEndpoint('supply-adequacy');
  }

  // Ancillary Services API
  async getAncillaryServices(): Promise<AESOResponse<any>> {
    return this.callAESOEndpoint('ancillary-services');
  }

  // Merit Order API
  async getMeritOrder(): Promise<AESOResponse<any>> {
    return this.callAESOEndpoint('merit-order');
  }

  // Grid Status API
  async getGridStatus(): Promise<AESOResponse<any>> {
    return this.callAESOEndpoint('grid-status');
  }

  // Generic endpoint caller for new endpoints
  async callEndpoint<T = any>(
    endpoint: string, 
    params: Record<string, string> = {}
  ): Promise<AESOResponse<T>> {
    return this.callAESOEndpoint<T>(endpoint, params);
  }

  // Legacy compatibility methods - Updated to use proper parameters
  async fetchCurrentPrices(): Promise<AESOResponse<AESOPoolPrice>> {
    return this.getPoolPrice();
  }

  async fetchLoadForecast(): Promise<AESOResponse<AESOLoadForecast>> {
    return this.getLoadForecast();
  }

  async fetchGenerationMix(): Promise<AESOResponse<AESOGeneration>> {
    return this.getGeneration();
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ AESO API Gateway cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  isLiveDataAvailable(response: AESOResponse): boolean {
    return response.source === 'aeso_api';
  }

  getDataSourceLabel(response: AESOResponse): string {
    switch (response.source) {
      case 'aeso_api':
        return 'Live AESO API Gateway';
      case 'fallback':
        return 'Simulated Data (API Issue)';
      case 'emergency_fallback':
        return 'Emergency Fallback';
      default:
        return 'Unknown Source';
    }
  }
}

// Export singleton instance
export const aesoAPI = AESOAPIService.getInstance();

// Legacy exports for backward compatibility
export const useAESOAPI = () => aesoAPI;
