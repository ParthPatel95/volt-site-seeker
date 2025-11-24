import { HourlyDataPoint } from '@/services/historicalDataService';

export interface MonthlyFilterResult {
  filteredData: HourlyDataPoint[];
  removedData: HourlyDataPoint[];
  removedCount: number;
  missingCount: number;
  monthWarnings: string[];
}

/**
 * Apply monthly uptime filter by removing highest-price hours first
 * @param data - Array of hourly data points
 * @param uptimePercentage - Target uptime (0-100)
 * @returns Filtered data with removed hours and warnings
 */
export function applyMonthlyUptimeFilter(
  data: HourlyDataPoint[],
  uptimePercentage: number
): MonthlyFilterResult {
  if (uptimePercentage >= 100) {
    return {
      filteredData: data,
      removedData: [],
      removedCount: 0,
      missingCount: 0,
      monthWarnings: [],
    };
  }

  if (uptimePercentage <= 0) {
    return {
      filteredData: [],
      removedData: data,
      removedCount: data.length,
      missingCount: 0,
      monthWarnings: ['Uptime set to 0%: No data under current filter.'],
    };
  }

  // Group data by calendar month
  const monthlyBuckets = groupByMonth(data);
  const filteredData: HourlyDataPoint[] = [];
  const removedData: HourlyDataPoint[] = [];
  const monthWarnings: string[] = [];
  let totalRemoved = 0;
  let totalMissing = 0;

  // Process each month
  for (const [monthKey, monthData] of Object.entries(monthlyBuckets)) {
    const { filtered, removed, missing, warning, removedHours } = filterMonth(
      monthData,
      uptimePercentage
    );

    filteredData.push(...filtered);
    removedData.push(...removedHours);
    totalRemoved += removed;
    totalMissing += missing;

    if (warning) {
      monthWarnings.push(warning);
    }
  }

  // Sort by timestamp
  filteredData.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  removedData.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  return {
    filteredData,
    removedData,
    removedCount: totalRemoved,
    missingCount: totalMissing,
    monthWarnings,
  };
}

/**
 * Group hourly data by calendar month (YYYY-MM)
 */
function groupByMonth(data: HourlyDataPoint[]): Record<string, HourlyDataPoint[]> {
  const buckets: Record<string, HourlyDataPoint[]> = {};

  for (const point of data) {
    const date = new Date(point.ts);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!buckets[monthKey]) {
      buckets[monthKey] = [];
    }
    buckets[monthKey].push(point);
  }

  return buckets;
}

/**
 * Filter a single month by removing highest-price hours
 */
function filterMonth(
  monthData: HourlyDataPoint[],
  uptimePercentage: number
): {
  filtered: HourlyDataPoint[];
  removedHours: HourlyDataPoint[];
  removed: number;
  missing: number;
  warning: string | null;
} {
  // Calculate expected hours in month (handle DST)
  const firstDate = new Date(monthData[0].ts);
  const totalExpectedHours = getExpectedHoursInMonth(firstDate);
  const actualHours = monthData.length;
  const missingHours = Math.max(0, totalExpectedHours - actualHours);

  // Calculate hours to retain
  const retainHours = Math.max(1, Math.floor(actualHours * (uptimePercentage / 100)));
  const removeHours = actualHours - retainHours;

  // Sort by price (descending) and remove top N
  const sorted = [...monthData].sort((a, b) => b.price - a.price);
  const removedHours = sorted.slice(0, removeHours);
  const filtered = sorted.slice(removeHours).sort((a, b) => 
    new Date(a.ts).getTime() - new Date(b.ts).getTime()
  );

  // Generate warning if missing hours affect filter
  let warning: string | null = null;
  if (missingHours > 0 && missingHours > actualHours * 0.05) {
    const monthStr = firstDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    warning = `${monthStr} has ${missingHours} missing hours; uptime filter capped to available data.`;
  }

  return {
    filtered,
    removedHours,
    removed: removeHours,
    missing: missingHours,
    warning,
  };
}

/**
 * Get expected hours in a calendar month (accounting for DST)
 */
function getExpectedHoursInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Base hours
  let hours = daysInMonth * 24;
  
  // Check for DST transitions (spring forward / fall back)
  // This is a simplified check for Alberta (MT)
  const monthKey = month + 1;
  
  // March: spring forward (lose 1 hour)
  if (monthKey === 3) {
    hours -= 1;
  }
  
  // November: fall back (gain 1 hour)
  if (monthKey === 11) {
    hours += 1;
  }
  
  return hours;
}

/**
 * Get month statistics for filtered data
 */
export function getMonthlyStats(data: HourlyDataPoint[]): Array<{
  month: string;
  totalHours: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}> {
  const monthlyBuckets = groupByMonth(data);
  const stats: Array<any> = [];

  for (const [monthKey, monthData] of Object.entries(monthlyBuckets)) {
    const prices = monthData.map(d => d.price);
    
    stats.push({
      month: monthKey,
      totalHours: monthData.length,
      avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    });
  }

  return stats.sort((a, b) => a.month.localeCompare(b.month));
}
