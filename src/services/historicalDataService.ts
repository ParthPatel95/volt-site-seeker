import { supabase } from '@/integrations/supabase/client';

export interface HourlyDataPoint {
  ts: string; // ISO timestamp
  price: number; // $/MWh
  generation: number; // MW
  ail: number; // MW (Alberta Internal Load)
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  marketType?: 'aeso' | 'ercot';
}

const MAX_YEARS = 20;
const PROVISIONAL_START = new Date('2025-04-01');
const PROVISIONAL_END = new Date('2025-07-31');

export class HistoricalDataService {
  private cachedData: HourlyDataPoint[] | null = null;
  private lastFetch: DateRange | null = null;

  /**
   * Fetch historical AESO or ERCOT data for a date range (max 20 years)
   */
  async getHistoricalData(range: DateRange): Promise<{
    data: HourlyDataPoint[];
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const marketType = range.marketType || 'aeso';
    const maxYears = marketType === 'ercot' ? 10 : 20;

    // Validate and clamp date range
    const { startDate, endDate, clamped } = this.validateAndClampRange(range, maxYears);
    if (clamped) {
      warnings.push(`Your selection exceeds ${maxYears} years; showing the most recent ${maxYears}-year window.`);
    }

    // Check for provisional data (AESO only)
    if (marketType === 'aeso' && this.isProvisionalPeriod(startDate, endDate)) {
      warnings.push(`⚠️ Apr–Jul 2025 data are provisional and subject to revision.`);
    }

    // Check cache
    if (this.isCacheValid(startDate, endDate)) {
      return { data: this.cachedData!, warnings };
    }

    // Fetch data from AESO/ERCOT via edge function
    try {
      const data = await this.fetchFromAESO(startDate, endDate, marketType);
      
      // Cache the result
      this.cachedData = data;
      this.lastFetch = { startDate, endDate, marketType };

      return { data, warnings };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Failed to fetch historical data. Please try again.');
    }
  }

  /**
   * Validate date range and clamp to max years if necessary
   */
  private validateAndClampRange(range: DateRange, maxYears: number = MAX_YEARS): {
    startDate: Date;
    endDate: Date;
    clamped: boolean;
  } {
    let { startDate, endDate } = range;
    let clamped = false;

    // Ensure end is after start
    if (endDate <= startDate) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    // Calculate year difference
    const yearsDiff = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (yearsDiff > maxYears) {
      // Clamp to most recent max years
      startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - maxYears);
      clamped = true;
    }

    return { startDate, endDate, clamped };
  }

  /**
   * Check if range includes provisional period (Apr-Jul 2025)
   */
  private isProvisionalPeriod(startDate: Date, endDate: Date): boolean {
    return (
      (startDate <= PROVISIONAL_END && endDate >= PROVISIONAL_START)
    );
  }

  /**
   * Check if cached data is valid for the requested range
   */
  private isCacheValid(startDate: Date, endDate: Date): boolean {
    if (!this.cachedData || !this.lastFetch) return false;

    return (
      this.lastFetch.startDate.getTime() === startDate.getTime() &&
      this.lastFetch.endDate.getTime() === endDate.getTime() &&
      this.lastFetch.marketType === (this.lastFetch.marketType || 'aeso')
    );
  }

  /**
   * Fetch data from AESO or ERCOT API via edge function
   */
  private async fetchFromAESO(startDate: Date, endDate: Date, marketType: 'aeso' | 'ercot' = 'aeso'): Promise<HourlyDataPoint[]> {
    const functionName = marketType === 'ercot' ? 'ercot-historical-pricing' : 'aeso-historical-pricing';
    
    // Call the appropriate edge function for historical data
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        timeframe: 'custom',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    if (error) throw error;

    // Transform response to our format
    return this.transformAESOData(data);
  }

  /**
   * Transform AESO API response to our internal format
   */
  private transformAESOData(data: any): HourlyDataPoint[] {
    // If we have rawHourlyData from existing endpoint
    if (data.rawHourlyData) {
      return data.rawHourlyData.map((point: any) => ({
        ts: point.timestamp || point.date,
        price: point.price || 0,
        generation: point.generation || 0,
        ail: point.ail || point.load || 0,
      }));
    }

    // For custom date range, the edge function returns the raw AESO data
    // Transform it to our format with AIL and generation data
    if (Array.isArray(data)) {
      return data.map((point: any) => ({
        ts: point.ts || point.datetime || point.begin_datetime_utc || point.timestamp,
        price: point.price || 0,
        generation: point.generation || 0,
        ail: point.ail || 0,
      }));
    }

    console.warn('No valid data format found in AESO response');
    return [];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastFetch = null;
  }
}

// Singleton instance
export const historicalDataService = new HistoricalDataService();
