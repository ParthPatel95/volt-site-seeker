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

    // Return cached data if valid and it's live data
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
      
      // Cache the response (prioritize live data)
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

  // Pool Price API - Updated for API Gateway
  async getPoolPrice(startDate?: string, endDate?: string): Promise<AESOResponse<AESOPoolPrice>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOPoolPrice>('pool-price', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
    });
  }

  // Load Forecast API
  async getLoadForecast(startDate?: string, endDate?: string): Promise<AESOResponse<AESOLoadForecast>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOLoadForecast>('load-forecast', {
      startDate: startDate || today,
      endDate: endDate || startDate || today
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

  // System Margins API
  async getSystemMargins(): Promise<AESOResponse<AESOSystemMargins>> {
    return this.callAESOEndpoint<AESOSystemMargins>('system-margins');
  }

  // Intertie Flows API
  async getIntertieFlows(): Promise<AESOResponse<AESOIntertieFlows>> {
    return this.callAESOEndpoint<AESOIntertieFlows>('intertie-flows');
  }

  // Generic endpoint caller for new endpoints
  async callEndpoint<T = any>(
    endpoint: string, 
    params: Record<string, string> = {}
  ): Promise<AESOResponse<T>> {
    return this.callAESOEndpoint<T>(endpoint, params);
  }

  // Legacy compatibility methods - Updated to use new endpoints
  async fetchCurrentPrices(): Promise<AESOResponse<AESOPoolPrice>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOPoolPrice>('pool-price', {
      startDate: today,
      endDate: today
    });
  }

  async fetchLoadForecast(): Promise<AESOResponse<AESOLoadForecast>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOLoadForecast>('load-forecast', {
      startDate: today,
      endDate: today
    });
  }

  async fetchGenerationMix(): Promise<AESOResponse<AESOGeneration>> {
    const today = new Date().toISOString().split('T')[0];
    return this.callAESOEndpoint<AESOGeneration>('generation', {
      startDate: today,
      endDate: today
    });
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
