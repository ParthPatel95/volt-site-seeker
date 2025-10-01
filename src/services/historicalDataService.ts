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
}

const MAX_YEARS = 20;
const PROVISIONAL_START = new Date('2025-04-01');
const PROVISIONAL_END = new Date('2025-07-31');

export class HistoricalDataService {
  private cachedData: HourlyDataPoint[] | null = null;
  private lastFetch: DateRange | null = null;

  /**
   * Fetch historical AESO data for a date range (max 20 years)
   */
  async getHistoricalData(range: DateRange): Promise<{
    data: HourlyDataPoint[];
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // Validate and clamp date range
    const { startDate, endDate, clamped } = this.validateAndClampRange(range);
    if (clamped) {
      warnings.push(`Your selection exceeds 20 years; showing the most recent 20-year window.`);
    }

    // Check for provisional data
    if (this.isProvisionalPeriod(startDate, endDate)) {
      warnings.push(`⚠️ Apr–Jul 2025 data are provisional and subject to revision.`);
    }

    // Check cache
    if (this.isCacheValid(startDate, endDate)) {
      return { data: this.cachedData!, warnings };
    }

    // Fetch data from AESO via edge function
    try {
      const data = await this.fetchFromAESO(startDate, endDate);
      
      // Cache the result
      this.cachedData = data;
      this.lastFetch = { startDate, endDate };

      return { data, warnings };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Failed to fetch historical data. Please try again.');
    }
  }

  /**
   * Validate date range and clamp to 20 years if necessary
   */
  private validateAndClampRange(range: DateRange): {
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

    if (yearsDiff > MAX_YEARS) {
      // Clamp to most recent 20 years
      startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - MAX_YEARS);
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
      this.lastFetch.endDate.getTime() === endDate.getTime()
    );
  }

  /**
   * Fetch data from AESO API via edge function
   */
  private async fetchFromAESO(startDate: Date, endDate: Date): Promise<HourlyDataPoint[]> {
    // Call the existing edge function for historical data
    const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
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
    // Transform it to our format
    if (Array.isArray(data)) {
      return data.map((point: any) => ({
        ts: point.datetime || point.begin_datetime_utc || point.timestamp,
        price: point.price || 0,
        // Note: AESO pool price API doesn't provide generation/AIL in hourly data
        // These would need to come from separate API calls if needed
        generation: 0,
        ail: 0,
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
