import { HourlyDataPoint } from '@/services/historicalDataService';

export interface CorrelationData {
  variable1: string;
  variable2: string;
  correlation: number;
  pValue: number;
}

export interface PriceDriver {
  factor: string;
  impact: number;
  percentage: number;
  description: string;
}

export interface AnomalyPoint {
  timestamp: string;
  value: number;
  expectedValue: number;
  zScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

/**
 * Calculate correlation matrix between multiple variables
 */
export function calculateCorrelationMatrix(data: HourlyDataPoint[]): CorrelationData[] {
  if (data.length < 2) return [];

  const variables = [
    { key: 'price', name: 'Price' },
    { key: 'generation', name: 'Wind Generation' },
    { key: 'ail', name: 'Demand (AIL)' },
  ];

  const correlations: CorrelationData[] = [];

  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const var1Data = data.map(d => d[variables[i].key as keyof HourlyDataPoint] as number).filter(v => v != null);
      const var2Data = data.map(d => d[variables[j].key as keyof HourlyDataPoint] as number).filter(v => v != null);

      const minLength = Math.min(var1Data.length, var2Data.length);
      if (minLength < 2) continue;

      const correlation = pearsonCorrelation(
        var1Data.slice(0, minLength),
        var2Data.slice(0, minLength)
      );

      correlations.push({
        variable1: variables[i].name,
        variable2: variables[j].name,
        correlation,
        pValue: 0.01, // Simplified - would need proper statistical test
      });
    }
  }

  return correlations;
}

/**
 * Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Decompose price into contributing factors
 */
export function decomposePriceDrivers(data: HourlyDataPoint[]): PriceDriver[] {
  if (data.length === 0) return [];

  const avgPrice = data.reduce((sum, d) => sum + d.price, 0) / data.length;
  const avgDemand = data.reduce((sum, d) => sum + d.ail, 0) / data.length;
  const avgGeneration = data.reduce((sum, d) => sum + d.generation, 0) / data.length;

  const latest = data[data.length - 1];
  const basePrice = avgPrice;

  // Calculate impacts (simplified model)
  const demandImpact = ((latest.ail - avgDemand) / avgDemand) * basePrice * 0.4;
  const renewableImpact = ((avgGeneration - latest.generation) / avgGeneration) * basePrice * 0.3;
  const timeOfDayImpact = getTimeOfDayImpact(new Date(latest.ts), basePrice);
  const volatilityPremium = calculateVolatilityPremium(data, basePrice);

  const drivers: PriceDriver[] = [
    {
      factor: 'Base Price',
      impact: basePrice,
      percentage: 100,
      description: 'Historical average price',
    },
    {
      factor: 'Demand Impact',
      impact: demandImpact,
      percentage: (demandImpact / basePrice) * 100,
      description: latest.ail > avgDemand ? 'Higher than average demand' : 'Lower than average demand',
    },
    {
      factor: 'Renewable Generation',
      impact: renewableImpact,
      percentage: (renewableImpact / basePrice) * 100,
      description: latest.generation < avgGeneration ? 'Low renewable output' : 'High renewable output',
    },
    {
      factor: 'Time of Day',
      impact: timeOfDayImpact,
      percentage: (timeOfDayImpact / basePrice) * 100,
      description: 'Peak/off-peak adjustment',
    },
    {
      factor: 'Volatility Premium',
      impact: volatilityPremium,
      percentage: (volatilityPremium / basePrice) * 100,
      description: 'Market volatility adjustment',
    },
  ];

  return drivers.filter(d => Math.abs(d.impact) > 0.01);
}

function getTimeOfDayImpact(date: Date, basePrice: number): number {
  const hour = date.getHours();
  
  // Peak hours (7am-10pm) get premium
  if (hour >= 7 && hour <= 22) {
    return basePrice * 0.15;
  }
  
  // Off-peak discount
  return -basePrice * 0.1;
}

function calculateVolatilityPremium(data: HourlyDataPoint[], basePrice: number): number {
  if (data.length < 24) return 0;

  const recentPrices = data.slice(-24).map(d => d.price);
  const stdDev = standardDeviation(recentPrices);
  const avgStdDev = basePrice * 0.2; // Assume 20% is normal volatility

  if (stdDev > avgStdDev) {
    return basePrice * 0.1; // 10% premium for high volatility
  }

  return 0;
}

function standardDeviation(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Detect anomalies in price data using statistical methods
 */
export function detectAnomalies(data: HourlyDataPoint[], windowSize = 168): AnomalyPoint[] {
  if (data.length < windowSize) return [];

  const anomalies: AnomalyPoint[] = [];
  
  for (let i = windowSize; i < data.length; i++) {
    const window = data.slice(i - windowSize, i);
    const prices = window.map(d => d.price);
    
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = standardDeviation(prices);
    
    const currentPrice = data[i].price;
    const zScore = Math.abs((currentPrice - mean) / stdDev);
    
    if (zScore > 2) {
      const factors: string[] = [];
      
      // Analyze contributing factors
      if (data[i].ail > mean * 1.2) factors.push('High demand');
      if (data[i].generation < mean * 0.8) factors.push('Low renewable generation');
      
      const hour = new Date(data[i].ts).getHours();
      if (hour >= 17 && hour <= 20) factors.push('Peak hours');
      
      anomalies.push({
        timestamp: data[i].ts,
        value: currentPrice,
        expectedValue: mean,
        zScore,
        severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
        factors,
      });
    }
  }

  return anomalies;
}

/**
 * Calculate rolling statistics for anomaly detection baseline
 */
export function calculateRollingStats(data: HourlyDataPoint[], windowSize = 168) {
  const result = [];
  
  for (let i = windowSize; i < data.length; i++) {
    const window = data.slice(i - windowSize, i);
    const prices = window.map(d => d.price);
    
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = standardDeviation(prices);
    
    result.push({
      timestamp: data[i].ts,
      mean,
      stdDev,
      upperBound: mean + 2 * stdDev,
      lowerBound: mean - 2 * stdDev,
    });
  }
  
  return result;
}
