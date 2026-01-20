import { UnifiedDataPoint, UnifiedAnalyticsFilters } from '@/hooks/useUnifiedAnalyticsData';

export interface HighPriceEvent {
  timestamp: string;
  price: number;
  demand: number | null;
  temperature: number | null;
  windGeneration: number | null;
  reserveMargin: number | null;
  hour: number;
  dayOfWeek: number | null;
  season: string | null;
}

export interface DailyPriceStats {
  date: string;
  high: number;
  low: number;
  average: number;
  count: number;
}

export function generateCSVContent(
  data: UnifiedDataPoint[],
  filters: UnifiedAnalyticsFilters,
  includeHeaders: boolean = true
): string {
  const lines: string[] = [];

  // Add metadata header
  if (includeHeaders) {
    lines.push('# AESO Unified Analytics Export');
    lines.push(`# Date Range: ${filters.startDate} to ${filters.endDate}`);
    lines.push(`# Categories: ${getActiveCategories(filters).join(', ')}`);
    lines.push(`# Total Records: ${data.length}`);
    lines.push(`# Exported: ${new Date().toISOString()}`);
    lines.push('');
  }

  // Build headers based on filters
  const headers: string[] = ['Timestamp', 'Date', 'Hour', 'Day_of_Week', 'Month', 'Season', 'Is_Weekend', 'Is_Holiday'];
  
  if (filters.includeWeather) {
    headers.push('Temp_Calgary_C', 'Temp_Edmonton_C', 'Wind_Speed_kmh', 'Cloud_Cover_%', 'HDD', 'CDD');
  }
  
  if (filters.includePrices) {
    headers.push('Pool_Price_CAD', 'Price_Lag_24h', 'Price_Rolling_Avg_24h', 'Price_Volatility_6h');
  }
  
  if (filters.includeDemand) {
    headers.push('Demand_MW', 'Demand_Ramp_Rate', 'Is_Morning_Ramp', 'Is_Evening_Peak');
  }
  
  if (filters.includeReserves) {
    headers.push('Operating_Reserve_MW', 'Reserve_Price_CAD', 'Spinning_Reserve_MW', 'Supplemental_Reserve_MW', 'Reserve_Margin_%');
  }
  
  if (filters.includeGeneration) {
    headers.push('Gen_Gas_MW', 'Gen_Wind_MW', 'Gen_Solar_MW', 'Gen_Hydro_MW', 'Gen_Coal_MW', 'Gen_Other_MW', 'Renewable_Penetration_%');
  }
  
  if (filters.includeInterties) {
    headers.push('Intertie_BC_MW', 'Intertie_SK_MW', 'Intertie_MT_MW', 'Net_Interchange_MW');
  }

  lines.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values: (string | number | null)[] = [
      row.timestamp,
      row.date,
      row.hour,
      row.day_of_week,
      row.month,
      row.season || '',
      row.is_weekend ? 1 : 0,
      row.is_holiday ? 1 : 0,
    ];

    if (filters.includeWeather) {
      values.push(
        formatNumber(row.temp_calgary, 1),
        formatNumber(row.temp_edmonton, 1),
        formatNumber(row.wind_speed, 1),
        formatNumber(row.cloud_cover, 0),
        formatNumber(row.heating_degree_days, 1),
        formatNumber(row.cooling_degree_days, 1)
      );
    }

    if (filters.includePrices) {
      values.push(
        formatNumber(row.pool_price, 2),
        formatNumber(row.price_lag_24h, 2),
        formatNumber(row.price_rolling_avg_24h, 2),
        formatNumber(row.price_volatility_6h, 2)
      );
    }

    if (filters.includeDemand) {
      values.push(
        formatNumber(row.ail_mw, 0),
        formatNumber(row.demand_ramp_rate, 2),
        row.is_morning_ramp,
        row.is_evening_peak
      );
    }

    if (filters.includeReserves) {
      values.push(
        formatNumber(row.operating_reserve, 0),
        formatNumber(row.operating_reserve_price, 2),
        formatNumber(row.spinning_reserve_mw, 0),
        formatNumber(row.supplemental_reserve_mw, 0),
        formatNumber(row.reserve_margin_percent, 1)
      );
    }

    if (filters.includeGeneration) {
      values.push(
        formatNumber(row.generation_gas, 0),
        formatNumber(row.generation_wind, 0),
        formatNumber(row.generation_solar, 0),
        formatNumber(row.generation_hydro, 0),
        formatNumber(row.generation_coal, 0),
        formatNumber(row.generation_other, 0),
        formatNumber(row.renewable_penetration, 1)
      );
    }

    if (filters.includeInterties) {
      values.push(
        formatNumber(row.intertie_bc_flow, 0),
        formatNumber(row.intertie_sask_flow, 0),
        formatNumber(row.intertie_montana_flow, 0),
        formatNumber(row.interchange_net, 0)
      );
    }

    lines.push(values.map(v => v ?? '').join(','));
  }

  return lines.join('\n');
}

export function exportToCSV(
  data: UnifiedDataPoint[],
  filters: UnifiedAnalyticsFilters,
  filename: string = 'aeso-unified-analytics.csv'
): void {
  const csvContent = generateCSVContent(data, filters);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function calculateDailyPriceStats(data: UnifiedDataPoint[]): DailyPriceStats[] {
  const dailyGroups = new Map<string, number[]>();

  for (const row of data) {
    if (row.pool_price !== null) {
      const date = row.date;
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(row.pool_price);
    }
  }

  const dailyStats: DailyPriceStats[] = [];
  for (const [date, prices] of dailyGroups) {
    dailyStats.push({
      date,
      high: Math.max(...prices),
      low: Math.min(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: prices.length,
    });
  }

  return dailyStats.sort((a, b) => a.date.localeCompare(b.date));
}

export function findHighPriceEvents(data: UnifiedDataPoint[], threshold: number = 100): HighPriceEvent[] {
  return data
    .filter(row => row.pool_price !== null && row.pool_price > threshold)
    .map(row => ({
      timestamp: row.timestamp,
      price: row.pool_price!,
      demand: row.ail_mw,
      temperature: row.temp_calgary,
      windGeneration: row.generation_wind,
      reserveMargin: row.reserve_margin_percent,
      hour: row.hour,
      dayOfWeek: row.day_of_week,
      season: row.season,
    }))
    .sort((a, b) => b.price - a.price);
}

export function generateHighPriceEventsCSV(events: HighPriceEvent[], filename: string = 'aeso-high-price-events.csv'): void {
  const headers = [
    'Timestamp', 'Price_CAD', 'Demand_MW', 'Temperature_C', 
    'Wind_Gen_MW', 'Reserve_Margin_%', 'Hour', 'Day_of_Week', 'Season'
  ];
  
  const lines = [
    '# AESO High Price Event Analysis',
    `# Threshold: Events with price > $100/MWh`,
    `# Total Events: ${events.length}`,
    `# Exported: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...events.map(e => [
      e.timestamp,
      formatNumber(e.price, 2),
      formatNumber(e.demand, 0),
      formatNumber(e.temperature, 1),
      formatNumber(e.windGeneration, 0),
      formatNumber(e.reserveMargin, 1),
      e.hour,
      e.dayOfWeek,
      e.season || ''
    ].join(','))
  ];

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateDailyStatsCSV(stats: DailyPriceStats[], filename: string = 'aeso-daily-price-stats.csv'): void {
  const headers = ['Date', 'High_CAD', 'Low_CAD', 'Average_CAD', 'Hours_Count'];
  
  const lines = [
    '# AESO Daily Price Statistics',
    `# Total Days: ${stats.length}`,
    `# Exported: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...stats.map(s => [
      s.date,
      formatNumber(s.high, 2),
      formatNumber(s.low, 2),
      formatNumber(s.average, 2),
      s.count
    ].join(','))
  ];

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper functions
function formatNumber(value: number | null | undefined, decimals: number): string {
  if (value === null || value === undefined) return '';
  return value.toFixed(decimals);
}

function getActiveCategories(filters: UnifiedAnalyticsFilters): string[] {
  const categories: string[] = [];
  if (filters.includeWeather) categories.push('Weather');
  if (filters.includePrices) categories.push('Prices');
  if (filters.includeDemand) categories.push('Demand');
  if (filters.includeReserves) categories.push('Reserves');
  if (filters.includeGeneration) categories.push('Generation');
  if (filters.includeInterties) categories.push('Interties');
  return categories;
}
