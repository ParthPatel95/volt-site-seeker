
import { RegionalEnergyData, HourlyPrice } from '../types/btc_roi_types';

export class RegionalEnergyService {
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private static cache: Map<string, { data: RegionalEnergyData; timestamp: number }> = new Map();

  static async getRegionalEnergyData(region: 'ERCOT' | 'AESO'): Promise<RegionalEnergyData> {
    const cacheKey = region;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      let data: RegionalEnergyData;
      
      if (region === 'ERCOT') {
        data = await this.fetchERCOTData();
      } else {
        data = await this.fetchAESOData();
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching ${region} data:`, error);
      return this.getFallbackData(region);
    }
  }

  private static async fetchERCOTData(): Promise<RegionalEnergyData> {
    // In a real implementation, this would fetch from ERCOT API
    // For now, we'll simulate with realistic data based on recent trends
    const hourlyPrices = this.generateRealisticERCOTData();
    
    return {
      region: 'ERCOT',
      hourlyPrices,
      averagePrice: this.calculateAverage(hourlyPrices),
      peakPrice: Math.max(...hourlyPrices.map(h => h.pricePerMWh)),
      offPeakPrice: Math.min(...hourlyPrices.map(h => h.pricePerMWh)),
      lastUpdated: new Date()
    };
  }

  private static async fetchAESOData(): Promise<RegionalEnergyData> {
    // In a real implementation, this would fetch from AESO API
    // For now, we'll simulate with realistic data based on recent trends
    const hourlyPrices = this.generateRealisticAESOData();
    
    return {
      region: 'AESO',
      hourlyPrices,
      averagePrice: this.calculateAverage(hourlyPrices),
      peakPrice: Math.max(...hourlyPrices.map(h => h.pricePerMWh)),
      offPeakPrice: Math.min(...hourlyPrices.map(h => h.pricePerMWh)),
      lastUpdated: new Date()
    };
  }

  private static generateRealisticERCOTData(): HourlyPrice[] {
    const prices: HourlyPrice[] = [];
    const now = new Date();
    
    // Generate 8760 hours (1 year) of realistic ERCOT pricing
    for (let i = 0; i < 8760; i++) {
      const timestamp = new Date(now.getTime() - (8760 - i) * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      const month = timestamp.getMonth();
      
      // Base price around $36/MWh (2023 average)
      let basePrice = 36;
      
      // Seasonal adjustment (higher in summer)
      if (month >= 5 && month <= 8) {
        basePrice *= 1.4; // Summer premium
      }
      
      // Daily pattern (higher during peak hours)
      if (hour >= 14 && hour <= 18) {
        basePrice *= 1.8; // Peak hours
      } else if (hour >= 7 && hour <= 13) {
        basePrice *= 1.3; // Mid-day
      } else if (hour >= 19 && hour <= 22) {
        basePrice *= 1.2; // Evening
      }
      
      // Add volatility (ERCOT can spike dramatically)
      const volatility = Math.random();
      if (volatility > 0.95) {
        basePrice *= 50; // Extreme spike (rare)
      } else if (volatility > 0.85) {
        basePrice *= 5; // Price spike
      } else {
        basePrice *= (0.5 + Math.random() * 1.5); // Normal variation
      }
      
      const pricePerMWh = Math.max(basePrice, 0);
      
      prices.push({
        timestamp,
        pricePerMWh,
        pricePerKWh: pricePerMWh / 1000
      });
    }
    
    return prices;
  }

  private static generateRealisticAESOData(): HourlyPrice[] {
    const prices: HourlyPrice[] = [];
    const now = new Date();
    
    // Generate 8760 hours (1 year) of realistic AESO pricing
    for (let i = 0; i < 8760; i++) {
      const timestamp = new Date(now.getTime() - (8760 - i) * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      const month = timestamp.getMonth();
      
      // Base price around $70/MWh (2024 stabilized level, down from 2023 highs)
      let basePrice = 70;
      
      // Seasonal adjustment (higher in winter due to heating demand)
      if (month >= 10 || month <= 2) {
        basePrice *= 1.6; // Winter premium
      } else if (month >= 5 && month <= 8) {
        basePrice *= 1.2; // Summer moderate increase
      }
      
      // Daily pattern
      if (hour >= 17 && hour <= 20) {
        basePrice *= 1.7; // Peak hours
      } else if (hour >= 7 && hour <= 16) {
        basePrice *= 1.3; // Business hours
      }
      
      // Add volatility (Alberta has significant price swings)
      const volatility = Math.random();
      if (volatility > 0.98) {
        basePrice *= 20; // Extreme spike
      } else if (volatility > 0.9) {
        basePrice *= 3; // Price spike
      } else {
        basePrice *= (0.3 + Math.random() * 1.7); // Normal variation
      }
      
      const pricePerMWh = Math.max(basePrice, 0);
      
      prices.push({
        timestamp,
        pricePerMWh,
        pricePerKWh: pricePerMWh / 1000
      });
    }
    
    return prices;
  }

  private static calculateAverage(prices: HourlyPrice[]): number {
    return prices.reduce((sum, price) => sum + price.pricePerMWh, 0) / prices.length;
  }

  private static getFallbackData(region: 'ERCOT' | 'AESO'): RegionalEnergyData {
    const fallbackPrice = region === 'ERCOT' ? 36 : 70; // USD/MWh
    const hourlyPrices: HourlyPrice[] = [];
    
    for (let i = 0; i < 8760; i++) {
      hourlyPrices.push({
        timestamp: new Date(),
        pricePerMWh: fallbackPrice,
        pricePerKWh: fallbackPrice / 1000
      });
    }
    
    return {
      region,
      hourlyPrices,
      averagePrice: fallbackPrice,
      peakPrice: fallbackPrice * 2,
      offPeakPrice: fallbackPrice * 0.5,
      lastUpdated: new Date()
    };
  }
}
