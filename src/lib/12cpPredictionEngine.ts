/**
 * 12CP Prediction Engine
 * Data-driven algorithm for predicting 12 Coincident Peak events
 * Based on historical AESO patterns
 */

import { ScheduledPeakEvent, calculateDaysUntil, getDayName } from './calendarExport';
import { YearlyTop12Data, AllTimePeakHour } from '@/hooks/useHistorical12CPPeaks';

interface PeakPatternAnalysis {
  peakMonthFrequency: { [month: number]: number };
  peakHourFrequency: { [hour: number]: number };
  peakDayOfWeekFrequency: { [day: string]: number };
  peakDateFrequency: { [dayOfMonth: number]: number };
  avgYoYGrowth: number;
  allTimePeak: number;
}

/**
 * Analyze historical peak patterns from data
 */
export const analyzePeakPatterns = (
  yearlyData: YearlyTop12Data[],
  topPeaks: AllTimePeakHour[]
): PeakPatternAnalysis => {
  const peakMonthFrequency: { [month: number]: number } = {};
  const peakHourFrequency: { [hour: number]: number } = {};
  const peakDayOfWeekFrequency: { [day: string]: number } = {};
  const peakDateFrequency: { [dayOfMonth: number]: number } = {};

  // Analyze top 50 peaks
  topPeaks.forEach((peak) => {
    const date = new Date(peak.timestamp);
    const month = date.getMonth() + 1;
    const hour = peak.hour;
    const dayOfWeek = peak.dayOfWeek;
    const dayOfMonth = date.getDate();

    peakMonthFrequency[month] = (peakMonthFrequency[month] || 0) + 1;
    peakHourFrequency[hour] = (peakHourFrequency[hour] || 0) + 1;
    peakDayOfWeekFrequency[dayOfWeek] = (peakDayOfWeekFrequency[dayOfWeek] || 0) + 1;
    peakDateFrequency[dayOfMonth] = (peakDateFrequency[dayOfMonth] || 0) + 1;
  });

  // Calculate YoY growth from yearly data
  const sortedYears = [...yearlyData].sort((a, b) => a.year - b.year);
  const growthRates: number[] = [];
  for (let i = 1; i < sortedYears.length; i++) {
    const prevMax = sortedYears[i - 1].yearMaxDemand;
    const currMax = sortedYears[i].yearMaxDemand;
    if (prevMax > 0) {
      growthRates.push(((currMax - prevMax) / prevMax) * 100);
    }
  }
  const avgYoYGrowth = growthRates.length > 0
    ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length
    : 3.0;

  const allTimePeak = topPeaks[0]?.demandMW || 12785;

  return {
    peakMonthFrequency,
    peakHourFrequency,
    peakDayOfWeekFrequency,
    peakDateFrequency,
    avgYoYGrowth,
    allTimePeak,
  };
};

/**
 * Calculate confidence score for a predicted peak
 */
export const calculateConfidence = (
  dayOfWeek: string,
  dayOfMonth: number,
  month: number,
  patterns: PeakPatternAnalysis,
  rank: number
): number => {
  let base = 50;

  // Day of week boost (based on historical frequency)
  const dayFreq = patterns.peakDayOfWeekFrequency[dayOfWeek] || 0;
  if (dayFreq >= 10) base += 20;
  else if (dayFreq >= 7) base += 15;
  else if (dayFreq >= 4) base += 10;
  else base += 5;

  // Date range boost (Dec 11-14 highest, 17-20 second, 21-24 third)
  if (dayOfMonth >= 11 && dayOfMonth <= 14) base += 15;
  else if (dayOfMonth >= 17 && dayOfMonth <= 20) base += 12;
  else if (dayOfMonth >= 21 && dayOfMonth <= 24) base += 8;
  else if (dayOfMonth >= 9 && dayOfMonth <= 10) base += 6;

  // Month boost
  if (month === 12) base += 10; // December
  else if (month === 1) base -= 5; // January (less certain)

  // Rank-based decay (later predictions are less certain)
  base -= (rank - 1) * 2;

  // Cap between 40-95
  return Math.max(40, Math.min(95, base));
};

/**
 * Project demand for a given rank
 */
export const projectDemand = (
  rank: number,
  allTimePeak: number,
  avgGrowth: number
): { min: number; max: number; median: number } => {
  // Apply growth rate (with 3% as baseline if data unavailable)
  const growthRate = 1 + (Math.max(avgGrowth, 2) / 100);
  const basePeak = Math.round(allTimePeak * growthRate);

  // Each subsequent rank decreases by ~40 MW (based on 2025 pattern)
  // The gap between #1 and #12 in 2025 was ~200 MW
  const stepDecrease = (rank - 1) * 18;

  return {
    min: Math.round(basePeak - stepDecrease - 50),
    max: Math.round(basePeak - stepDecrease + 50),
    median: Math.round(basePeak - stepDecrease),
  };
};

/**
 * Generate December 2026 calendar with day-of-week mapping
 */
const getDecember2026Calendar = (): { day: number; dayName: string }[] => {
  const calendar: { day: number; dayName: string }[] = [];
  for (let day = 1; day <= 31; day++) {
    calendar.push({
      day,
      dayName: getDayName(2026, 11, day), // 11 = December (0-indexed)
    });
  }
  return calendar;
};

/**
 * Generate January 2027 calendar
 */
const getJanuary2027Calendar = (): { day: number; dayName: string }[] => {
  const calendar: { day: number; dayName: string }[] = [];
  for (let day = 1; day <= 31; day++) {
    calendar.push({
      day,
      dayName: getDayName(2027, 0, day), // 0 = January
    });
  }
  return calendar;
};

/**
 * Get risk level based on confidence
 */
const getRiskLevel = (confidence: number): 'critical' | 'high' | 'moderate' | 'low' => {
  if (confidence >= 85) return 'critical';
  if (confidence >= 70) return 'high';
  if (confidence >= 55) return 'moderate';
  return 'low';
};

/**
 * Generate improved 12CP predictions based on historical patterns
 */
export const generateImprovedPredictions = (
  yearlyData: YearlyTop12Data[],
  topPeaks: AllTimePeakHour[]
): ScheduledPeakEvent[] => {
  const patterns = analyzePeakPatterns(yearlyData, topPeaks);
  const predictions: ScheduledPeakEvent[] = [];

  const dec2026 = getDecember2026Calendar();
  const jan2027 = getJanuary2027Calendar();

  // Priority days in December based on historical patterns
  // Fri > Thu > Sat for highest peaks
  const priorityDays = ['Friday', 'Thursday', 'Saturday'];

  // December predictions - targeting high-probability dates
  const decemberCandidates = dec2026
    .filter((d) => d.day >= 9 && d.day <= 24) // Core peak window
    .filter((d) => priorityDays.includes(d.dayName))
    .map((d) => ({
      ...d,
      confidence: calculateConfidence(d.dayName, d.day, 12, patterns, 1),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  // Select top 9 December dates
  let rank = 1;
  decemberCandidates.slice(0, 9).forEach((candidate) => {
    const demand = projectDemand(rank, patterns.allTimePeak, patterns.avgYoYGrowth);
    const confidence = calculateConfidence(candidate.dayName, candidate.day, 12, patterns, rank);
    const scheduledDate = new Date(2026, 11, candidate.day);

    predictions.push({
      id: `dec-2026-${candidate.day}`,
      rank,
      scheduledDate,
      displayDate: `${candidate.dayName}, December ${candidate.day}, 2026`,
      timeWindow: {
        start: '01:00',
        end: '03:00',
        timezone: 'MST',
      },
      expectedDemandMW: demand,
      confidenceScore: confidence,
      riskLevel: getRiskLevel(confidence),
      weatherCondition: 'Sustained temperature < -20°C required',
      historicalReference: getHistoricalReference(candidate.day, 12, topPeaks),
      daysUntilEvent: calculateDaysUntil(scheduledDate),
      isUpcoming: calculateDaysUntil(scheduledDate) <= 30 && calculateDaysUntil(scheduledDate) > 0,
      isPast: calculateDaysUntil(scheduledDate) < 0,
      monthGroup: 'december',
    });
    rank++;
  });

  // January predictions - 3 slots
  // Based on historical patterns: Jan 12, 22, 23 had significant peaks
  const januaryCandidates = jan2027
    .filter((d) => [12, 15, 22, 23].includes(d.day))
    .map((d) => ({
      ...d,
      confidence: calculateConfidence(d.dayName, d.day, 1, patterns, rank),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  januaryCandidates.slice(0, 3).forEach((candidate) => {
    const demand = projectDemand(rank, patterns.allTimePeak, patterns.avgYoYGrowth);
    const confidence = calculateConfidence(candidate.dayName, candidate.day, 1, patterns, rank);
    const scheduledDate = new Date(2027, 0, candidate.day);

    predictions.push({
      id: `jan-2027-${candidate.day}`,
      rank,
      scheduledDate,
      displayDate: `${candidate.dayName}, January ${candidate.day}, 2027`,
      timeWindow: {
        start: '01:00',
        end: '03:00',
        timezone: 'MST',
      },
      expectedDemandMW: demand,
      confidenceScore: confidence,
      riskLevel: getRiskLevel(confidence),
      weatherCondition: 'Extended cold snap required (<-25°C)',
      historicalReference: getHistoricalReference(candidate.day, 1, topPeaks),
      daysUntilEvent: calculateDaysUntil(scheduledDate),
      isUpcoming: calculateDaysUntil(scheduledDate) <= 30 && calculateDaysUntil(scheduledDate) > 0,
      isPast: calculateDaysUntil(scheduledDate) < 0,
      monthGroup: 'january',
    });
    rank++;
  });

  // Sort by confidence (highest first), then by date
  return predictions
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .map((p, i) => ({ ...p, rank: i + 1 }));
};

/**
 * Get historical reference for a predicted date
 */
const getHistoricalReference = (
  dayOfMonth: number,
  month: number,
  topPeaks: AllTimePeakHour[]
): string => {
  // Find closest historical peak
  const sameMonthPeaks = topPeaks.filter((p) => p.month === month);
  const closestPeak = sameMonthPeaks.find((p) => {
    const peakDate = new Date(p.timestamp).getDate();
    return Math.abs(peakDate - dayOfMonth) <= 2;
  });

  if (closestPeak) {
    const date = new Date(closestPeak.timestamp);
    return `${closestPeak.monthName} ${date.getDate()}, ${closestPeak.year}: ${closestPeak.demandMW.toLocaleString()} MW`;
  }

  // Default reference
  if (month === 12) {
    const topDecPeak = topPeaks[0];
    return `Dec 12, 2025: ${topDecPeak?.demandMW.toLocaleString() || '12,785'} MW (record)`;
  }

  return 'Based on historical January cold snap patterns';
};

/**
 * Get prediction summary stats
 */
export const getPredictionSummary = (predictions: ScheduledPeakEvent[]) => {
  const decemberPeaks = predictions.filter((p) => p.monthGroup === 'december');
  const januaryPeaks = predictions.filter((p) => p.monthGroup === 'january');
  const criticalPeaks = predictions.filter((p) => p.riskLevel === 'critical');
  const upcomingPeaks = predictions.filter((p) => p.isUpcoming);

  return {
    totalPredictions: predictions.length,
    decemberCount: decemberPeaks.length,
    januaryCount: januaryPeaks.length,
    criticalCount: criticalPeaks.length,
    upcomingCount: upcomingPeaks.length,
    expectedMaxDemand: Math.max(...predictions.map((p) => p.expectedDemandMW.max)),
    averageConfidence: Math.round(
      predictions.reduce((sum, p) => sum + p.confidenceScore, 0) / predictions.length
    ),
  };
};
