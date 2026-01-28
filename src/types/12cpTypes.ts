/**
 * Shared types for 12CP Peak Analysis
 * Extracted to avoid circular dependencies between prediction engine and hooks
 */

export interface AllTimePeakHour {
  rank: number;
  timestamp: string;
  demandMW: number;
  priceAtPeak: number;
  hour: number;
  dayOfWeek: string;
  month: number;
  year: number;
  monthName: string;
}

export interface YearlyTop12Peak {
  year: number;
  rank: number;
  timestamp: string;
  demandMW: number;
  priceAtPeak: number;
  hour: number;
  dayOfWeek: string;
  monthName: string;
  dayOfMonth: number;
  // Weather data
  temperatureCalgary: number | null;
  temperatureEdmonton: number | null;
  windSpeed: number | null;
  cloudCover: number | null;
}

export interface YearlyTop12Data {
  year: number;
  peaks: YearlyTop12Peak[];
  yearMaxDemand: number;
  yearMinOf12: number;
}
