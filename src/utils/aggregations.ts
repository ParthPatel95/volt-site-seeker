import { HourlyDataPoint } from '@/services/historicalDataService';

export interface YearlyAggregation {
  year: number;
  avgPrice: number;
  count: number;
}

export interface MonthlyHeatmapData {
  year: number;
  month: number;
  avgPrice: number;
  count: number;
}

export interface DailyAggregation {
  date: string;
  avgPrice: number;
  avgGeneration: number;
  avgAIL: number;
  count: number;
}

export interface DurationCurvePoint {
  percentile: number;
  price: number;
  hours: number;
}

export interface RollingStatsPoint {
  date: string;
  rollingMean: number;
  rollingStdev: number;
}

export interface OnOffPeakStats {
  onPeakAvg: number;
  offPeakAvg: number;
  onPeakHours: number;
  offPeakHours: number;
}

/**
 * Aggregate data by year
 */
export function aggregateByYear(data: HourlyDataPoint[]): YearlyAggregation[] {
  const yearMap = new Map<number, { sum: number; count: number }>();

  for (const point of data) {
    const year = new Date(point.ts).getFullYear();
    const existing = yearMap.get(year) || { sum: 0, count: 0 };
    yearMap.set(year, {
      sum: existing.sum + point.price,
      count: existing.count + 1,
    });
  }

  return Array.from(yearMap.entries())
    .map(([year, { sum, count }]) => ({
      year,
      avgPrice: sum / count,
      count,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregate data for monthly heatmap
 */
export function aggregateForHeatmap(data: HourlyDataPoint[]): MonthlyHeatmapData[] {
  const monthMap = new Map<string, { sum: number; count: number }>();

  for (const point of data) {
    const date = new Date(point.ts);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const existing = monthMap.get(key) || { sum: 0, count: 0 };
    monthMap.set(key, {
      sum: existing.sum + point.price,
      count: existing.count + 1,
    });
  }

  return Array.from(monthMap.entries())
    .map(([key, { sum, count }]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        year,
        month,
        avgPrice: sum / count,
        count,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
}

/**
 * Aggregate data by day
 */
export function aggregateByDay(data: HourlyDataPoint[]): DailyAggregation[] {
  const dayMap = new Map<string, {
    priceSum: number;
    genSum: number;
    ailSum: number;
    count: number;
  }>();

  for (const point of data) {
    const date = new Date(point.ts);
    const dateKey = date.toISOString().split('T')[0];
    const existing = dayMap.get(dateKey) || { priceSum: 0, genSum: 0, ailSum: 0, count: 0 };
    
    dayMap.set(dateKey, {
      priceSum: existing.priceSum + point.price,
      genSum: existing.genSum + point.generation,
      ailSum: existing.ailSum + point.ail,
      count: existing.count + 1,
    });
  }

  return Array.from(dayMap.entries())
    .map(([date, { priceSum, genSum, ailSum, count }]) => ({
      date,
      avgPrice: priceSum / count,
      avgGeneration: genSum / count,
      avgAIL: ailSum / count,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate price duration curve
 */
export function generateDurationCurve(data: HourlyDataPoint[]): DurationCurvePoint[] {
  const prices = data.map(d => d.price).sort((a, b) => b - a);
  const totalHours = prices.length;
  
  // Generate points at regular percentiles
  const points: DurationCurvePoint[] = [];
  for (let i = 0; i < prices.length; i++) {
    const percentile = (i / totalHours) * 100;
    const hours = i + 1;
    
    points.push({
      percentile: Math.round(percentile * 100) / 100,
      price: prices[i],
      hours,
    });
  }

  return points;
}

/**
 * Calculate 30-day rolling statistics
 */
export function calculateRollingStats(
  dailyData: DailyAggregation[],
  windowDays: number = 30
): RollingStatsPoint[] {
  if (dailyData.length < windowDays) {
    return [];
  }

  const rolling: RollingStatsPoint[] = [];

  for (let i = windowDays - 1; i < dailyData.length; i++) {
    const window = dailyData.slice(i - windowDays + 1, i + 1);
    const prices = window.map(d => d.avgPrice);
    
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdev = Math.sqrt(variance);

    rolling.push({
      date: dailyData[i].date,
      rollingMean: mean,
      rollingStdev: stdev,
    });
  }

  return rolling;
}

/**
 * Calculate on-peak vs off-peak statistics
 */
export function calculateOnOffPeakStats(
  data: HourlyDataPoint[],
  onPeakStart: number,
  onPeakEnd: number
): OnOffPeakStats {
  let onPeakSum = 0;
  let onPeakCount = 0;
  let offPeakSum = 0;
  let offPeakCount = 0;

  for (const point of data) {
    const hour = new Date(point.ts).getHours();
    
    if (hour >= onPeakStart && hour < onPeakEnd) {
      onPeakSum += point.price;
      onPeakCount++;
    } else {
      offPeakSum += point.price;
      offPeakCount++;
    }
  }

  return {
    onPeakAvg: onPeakCount > 0 ? onPeakSum / onPeakCount : 0,
    offPeakAvg: offPeakCount > 0 ? offPeakSum / offPeakCount : 0,
    onPeakHours: onPeakCount,
    offPeakHours: offPeakCount,
  };
}

/**
 * Calculate correlation coefficient (Pearson's r)
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

