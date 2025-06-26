
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
    console.log('Generating ERCOT data...');
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
    console.log('Generating AESO data...');
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
    
    // Generate 8760 hours (1 year) of realistic ERCOT pricing in USD
    for (let i = 0; i < 8760; i++) {
      const timestamp = new Date(now.getTime() - (8760 - i) * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      const month = timestamp.getMonth();
      
      // Base price around $35/MWh (realistic ERCOT average)
      let basePrice = 35;
      
      // Seasonal adjustment (higher in summer due to AC load)
      if (month >= 5 && month <= 8) {
        basePrice *= 1.8; // Summer premium
      } else if (month >= 11 || month <= 1) {
        basePrice *= 1.3; // Winter heating
      }
      
      // Daily pattern (higher during peak hours)
      if (hour >= 14 && hour <= 19) {
        basePrice *= 2.5; // Peak hours (2-7 PM)
      } else if (hour >= 7 && hour <= 13) {
        basePrice *= 1.3; // Morning/midday
      } else if (hour >= 20 && hour <= 22) {
        basePrice *= 1.2; // Evening
      } else {
        basePrice *= 0.6; // Off-peak hours
      }
      
      // Add volatility with occasional spikes
      const volatility = Math.random();
      if (volatility > 0.995) {
        basePrice *= 25; // Extreme spike (very rare)
      } else if (volatility > 0.98) {
        basePrice *= 8; // Major spike
      } else if (volatility > 0.9) {
        basePrice *= 2.5; // Price spike
      } else {
        basePrice *= (0.7 + Math.random() * 0.6); // Normal variation
      }
      
      const pricePerMWh = Math.max(basePrice, 10); // Floor price
      
      prices.push({
        timestamp,
        pricePerMWh,
        pricePerKWh: pricePerMWh / 1000
      });
    }
    
    console.log('Generated ERCOT prices, average:', this.calculateAverage(prices).toFixed(2), 'USD/MWh');
    return prices;
  }

  private static generateRealisticAESOData(): HourlyPrice[] {
    const prices: HourlyPrice[] = [];
    const now = new Date();
    
    // Generate 8760 hours (1 year) of realistic AESO pricing (in CAD)
    for (let i = 0; i < 8760; i++) {
      const timestamp = new Date(now.getTime() - (8760 - i) * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      const month = timestamp.getMonth();
      
      // Base price around $65 CAD/MWh (realistic AESO average)
      let basePrice = 65;
      
      // Seasonal adjustment (higher in winter due to heating demand)
      if (month >= 10 || month <= 2) {
        basePrice *= 2.2; // Winter premium
      } else if (month >= 5 && month <= 8) {
        basePrice *= 1.2; // Summer moderate increase
      }
      
      // Daily pattern
      if (hour >= 17 && hour <= 20) {
        basePrice *= 2.0; // Peak hours (5-8 PM)
      } else if (hour >= 7 && hour <= 16) {
        basePrice *= 1.3; // Business hours
      } else {
        basePrice *= 0.7; // Off-peak
      }
      
      // Add volatility (Alberta has significant price swings)
      const volatility = Math.random();
      if (volatility > 0.99) {
        basePrice *= 20; // Extreme spike
      } else if (volatility > 0.95) {
        basePrice *= 6; // Price spike
      } else {
        basePrice *= (0.6 + Math.random() * 0.8); // Normal variation
      }
      
      const pricePerMWh = Math.max(basePrice, 15); // Floor price in CAD
      
      prices.push({
        timestamp,
        pricePerMWh,
        pricePerKWh: pricePerMWh / 1000 // Still in CAD
      });
    }
    
    console.log('Generated AESO prices, average:', this.calculateAverage(prices).toFixed(2), 'CAD/MWh');
    return prices;
  }

  private static calculateAverage(prices: HourlyPrice[]): number {
    return prices.reduce((sum, price) => sum + price.pricePerMWh, 0) / prices.length;
  }

  private static getFallbackData(region: 'ERCOT' | 'AESO'): RegionalEnergyData {
    // Fallback prices: ERCOT in USD, AESO in CAD
    const fallbackPrice = region === 'ERCOT' ? 45 : 75; // USD vs CAD
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
