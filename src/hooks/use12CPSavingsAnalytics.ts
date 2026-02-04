import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyDemandPeak {
  month: string;
  monthLabel: string;
  avgDemandMW: number;
  peakDemandMW: number;
  peakTimestamp: string;
  peakHour: number;
  priceAtPeak: number;
  avgPrice: number;
  totalHours: number;
  dayOfWeek: string;
}

export interface SavingsSimulatorResult {
  withoutStrategy: {
    energyCost: number;
    transmissionCost: number;
    totalCost: number;
  };
  withStrategy: {
    energyCost: number;
    transmissionCost: number;
    totalCost: number;
    hoursAvoided: number;
  };
  savings: {
    amount: number;
    percentage: number;
    transmissionSavings: number;
    energySavings: number;
  };
}

export interface PeakHourRisk {
  hour: number;
  riskScore: number; // 0-100 based on demand percentile
  occurrences: number;
  avgDemandMW: number;
  avgPriceAtHour: number;
  seasonalPattern: string;
}

export interface TwelveCPSavingsData {
  monthlyPeaks: MonthlyDemandPeak[];
  annualAvgDemandMW: number;
  annualPeakDemandMW: number;
  annualAvgPrice: number;
  totalPotentialSavings: number;
  peakHourRisks: PeakHourRisk[];
  highRiskHours: number[];
  safeHours: number[];
  maxHistoricalDemandMW: number;
  dataDateRange: { start: string; end: string };
  recordCount: number;
  seasonalInsights: {
    winter: { avgPeakDemandMW: number; avgPeakPrice: number; riskLevel: string };
    summer: { avgPeakDemandMW: number; avgPeakPrice: number; riskLevel: string };
    shoulder: { avgPeakDemandMW: number; avgPeakPrice: number; riskLevel: string };
  };
}

import { TRANSMISSION_ADDER, TRANSMISSION_RATE_PER_KW_MONTH } from '@/constants/tariff-rates';

export function use12CPSavingsAnalytics() {
  const [savingsData, setSavingsData] = useState<TwelveCPSavingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetch12CPSavingsData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      // Fetch data with demand (ail_mw) as the primary metric for 12CP
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, hour_of_day, month, ail_mw, day_of_week')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('ail_mw', 'is', null) // Demand is required for 12CP
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Demand Data",
          description: "No demand data available for 12CP analysis.",
          variant: "destructive"
        });
        return;
      }

      // Track data range for display
      const firstRecord = data[0];
      const lastRecord = data[data.length - 1];

      // Group by month
      const monthlyGroups: { [key: string]: typeof data } = {};
      data.forEach(row => {
        const date = new Date(row.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = [];
        }
        monthlyGroups[monthKey].push(row);
      });

      // Calculate monthly peaks based on DEMAND (ail_mw), not price
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthlyPeaks: MonthlyDemandPeak[] = [];

      Object.entries(monthlyGroups).forEach(([month, rows]) => {
        // Calculate average demand
        const avgDemandMW = rows.reduce((s, r) => s + (r.ail_mw || 0), 0) / rows.length;
        const avgPrice = rows.reduce((s, r) => s + (r.pool_price || 0), 0) / rows.length;
        
        // Find the actual peak demand hour for this month (12CP methodology)
        let peakRecord = rows[0];
        rows.forEach(r => {
          if ((r.ail_mw || 0) > (peakRecord.ail_mw || 0)) {
            peakRecord = r;
          }
        });

        const peakDate = new Date(peakRecord.timestamp);
        const peakHour = peakRecord.hour_of_day ?? peakDate.getHours();
        const dayOfWeek = dayNames[peakDate.getDay()];

        const [year, m] = month.split('-');
        const monthLabel = `${monthNames[parseInt(m) - 1]} ${year.slice(2)}`;

        monthlyPeaks.push({
          month,
          monthLabel,
          avgDemandMW: Math.round(avgDemandMW),
          peakDemandMW: Math.round(peakRecord.ail_mw || 0),
          peakTimestamp: peakRecord.timestamp,
          peakHour,
          priceAtPeak: Math.round((peakRecord.pool_price || 0) * 100) / 100,
          avgPrice: Math.round(avgPrice * 100) / 100,
          totalHours: rows.length,
          dayOfWeek
        });
      });

      // Sort by month
      monthlyPeaks.sort((a, b) => a.month.localeCompare(b.month));

      // Calculate annual statistics
      const annualAvgDemandMW = monthlyPeaks.reduce((s, m) => s + m.avgDemandMW, 0) / monthlyPeaks.length;
      const annualPeakDemandMW = Math.max(...monthlyPeaks.map(m => m.peakDemandMW));
      const annualAvgPrice = monthlyPeaks.reduce((s, m) => s + m.avgPrice, 0) / monthlyPeaks.length;
      const maxHistoricalDemandMW = Math.max(...data.map(r => r.ail_mw || 0));

      // Calculate hourly demand risk distribution (12CP is based on demand, not price)
      const hourlyDemands: { [hour: number]: { demandSum: number; priceSum: number; count: number } } = {};
      data.forEach(row => {
        const hour = row.hour_of_day ?? new Date(row.timestamp).getHours();
        if (!hourlyDemands[hour]) hourlyDemands[hour] = { demandSum: 0, priceSum: 0, count: 0 };
        hourlyDemands[hour].demandSum += row.ail_mw || 0;
        hourlyDemands[hour].priceSum += row.pool_price || 0;
        hourlyDemands[hour].count++;
      });

      const peakHourRisks: PeakHourRisk[] = [];

      for (let hour = 0; hour < 24; hour++) {
        const hourData = hourlyDemands[hour] || { demandSum: 0, priceSum: 0, count: 0 };
        const avgDemandMW = hourData.count > 0 ? hourData.demandSum / hourData.count : 0;
        const avgPriceAtHour = hourData.count > 0 ? hourData.priceSum / hourData.count : 0;
        
        // Risk score based on demand percentile relative to max historical demand
        // This is the correct 12CP methodology - risk based on demand, not price
        const percentile = avgDemandMW / maxHistoricalDemandMW;
        let riskScore = 0;
        if (percentile >= 0.95) riskScore = 90;      // Top 5% = Very High
        else if (percentile >= 0.90) riskScore = 70; // Top 10% = High
        else if (percentile >= 0.85) riskScore = 50; // Top 15% = Moderate
        else if (percentile >= 0.80) riskScore = 30; // Top 20% = Low-Moderate
        else riskScore = 10;                          // Below 80% = Safe

        let seasonalPattern = 'Mixed';
        if (hour >= 6 && hour <= 9) seasonalPattern = 'Morning Ramp';
        else if (hour >= 16 && hour <= 20) seasonalPattern = 'Evening Peak';
        else if (hour >= 0 && hour <= 5) seasonalPattern = 'Off-Peak';
        else if (hour >= 10 && hour <= 15) seasonalPattern = 'Midday';
        else seasonalPattern = 'Late Evening';

        peakHourRisks.push({
          hour,
          riskScore,
          occurrences: hourData.count,
          avgDemandMW: Math.round(avgDemandMW),
          avgPriceAtHour: Math.round(avgPriceAtHour * 100) / 100,
          seasonalPattern
        });
      }

      // Sort by risk score and identify high/safe hours
      const sortedByRisk = [...peakHourRisks].sort((a, b) => b.riskScore - a.riskScore);
      const highRiskHours = sortedByRisk.filter(h => h.riskScore >= 70).map(h => h.hour);
      const safeHours = sortedByRisk.filter(h => h.riskScore <= 30).map(h => h.hour);

      // Seasonal insights based on DEMAND peaks
      const winterMonths = monthlyPeaks.filter(m => ['01', '02', '11', '12'].includes(m.month.split('-')[1]));
      const summerMonths = monthlyPeaks.filter(m => ['06', '07', '08'].includes(m.month.split('-')[1]));
      const shoulderMonths = monthlyPeaks.filter(m => ['03', '04', '05', '09', '10'].includes(m.month.split('-')[1]));

      const getSeasonStats = (months: MonthlyDemandPeak[]) => {
        if (months.length === 0) return { avgPeakDemandMW: 0, avgPeakPrice: 0, riskLevel: 'Unknown' };
        const avgPeakDemand = months.reduce((s, m) => s + m.peakDemandMW, 0) / months.length;
        const avgPeakPrice = months.reduce((s, m) => s + m.priceAtPeak, 0) / months.length;
        let riskLevel = 'Low';
        // Winter typically has highest demand in Alberta due to heating
        if (avgPeakDemand > annualPeakDemandMW * 0.95) riskLevel = 'High';
        else if (avgPeakDemand > annualPeakDemandMW * 0.85) riskLevel = 'Moderate';
        return { avgPeakDemandMW: Math.round(avgPeakDemand), avgPeakPrice: Math.round(avgPeakPrice * 100) / 100, riskLevel };
      };

      // Total potential savings (simplified: avoiding 12 peaks saves ~100% of 12CP component)
      // Per AESO methodology: 12CP contribution = sum of loads at 12 monthly peaks
      const avgPriceAtPeaks = monthlyPeaks.reduce((s, m) => s + m.priceAtPeak, 0) / monthlyPeaks.length;
      const totalPotentialSavings = (avgPriceAtPeaks - annualAvgPrice) * 12; // 12 peak hours

      setSavingsData({
        monthlyPeaks,
        annualAvgDemandMW: Math.round(annualAvgDemandMW),
        annualPeakDemandMW: Math.round(annualPeakDemandMW),
        annualAvgPrice: Math.round(annualAvgPrice * 100) / 100,
        totalPotentialSavings: Math.round(totalPotentialSavings * 100) / 100,
        peakHourRisks,
        highRiskHours,
        safeHours,
        maxHistoricalDemandMW: Math.round(maxHistoricalDemandMW),
        dataDateRange: {
          start: firstRecord.timestamp,
          end: lastRecord.timestamp
        },
        recordCount: data.length,
        seasonalInsights: {
          winter: getSeasonStats(winterMonths),
          summer: getSeasonStats(summerMonths),
          shoulder: getSeasonStats(shoulderMonths)
        }
      });

      toast({
        title: "12CP Analysis Complete",
        description: `Analyzed ${data.length.toLocaleString()} demand records across ${monthlyPeaks.length} months.`
      });

    } catch (error: any) {
      console.error('Error fetching 12CP savings data:', error);
      toast({
        title: "Error Loading 12CP Data",
        description: error.message || "Failed to fetch demand-based analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateSavings = useCallback((
    facilityMW: number,
    annualOperatingHours: number,
    strategyType: 'full' | 'partial' | 'none'
  ): SavingsSimulatorResult | null => {
    if (!savingsData) return null;

    const avgPrice = savingsData.annualAvgPrice;
    
    // Calculate average price during peak demand hours (from monthly peaks)
    const avgPriceAtPeaks = savingsData.monthlyPeaks.reduce((s, m) => s + m.priceAtPeak, 0) / savingsData.monthlyPeaks.length;

    // Without strategy: operate all hours at average price + full transmission
    const withoutEnergyMWh = facilityMW * annualOperatingHours;
    const withoutEnergyCost = withoutEnergyMWh * avgPrice;
    
    // Transmission cost calculation based on Rate 65 methodology
    // Full 12CP contribution = operating at full capacity during all 12 monthly peaks
    // Annual transmission = facilityMW * 1000 kW * $7.11/kW/month * 12 months
    const withoutTransmissionCost = facilityMW * 1000 * TRANSMISSION_RATE_PER_KW_MONTH * 12;

    // With strategy: avoid peaks during system demand maximums
    let hoursAvoided = 0;
    let transmissionReduction = 0;

    switch (strategyType) {
      case 'full':
        hoursAvoided = 12;
        transmissionReduction = 1.0; // 100% transmission savings from avoiding all 12CP
        break;
      case 'partial':
        hoursAvoided = 6;
        transmissionReduction = 0.5; // 50% transmission savings
        break;
      case 'none':
        hoursAvoided = 0;
        transmissionReduction = 0;
        break;
    }

    // Energy saved by avoiding peak hours (operate at avg instead of peak price)
    const energySavedPerHour = facilityMW * (avgPriceAtPeaks - avgPrice);
    const totalEnergySavings = energySavedPerHour * hoursAvoided;

    // Transmission savings from 12CP avoidance (the main benefit)
    const transmissionSavings = withoutTransmissionCost * transmissionReduction;

    const withEnergyCost = withoutEnergyCost - totalEnergySavings;
    const withTransmissionCost = withoutTransmissionCost - transmissionSavings;

    const totalBaseCost = withoutEnergyCost + withoutTransmissionCost;
    const savingsPercentage = totalBaseCost > 0 
      ? Math.round(((totalEnergySavings + transmissionSavings) / totalBaseCost) * 100 * 100) / 100
      : 0;

    return {
      withoutStrategy: {
        energyCost: Math.round(withoutEnergyCost),
        transmissionCost: Math.round(withoutTransmissionCost),
        totalCost: Math.round(totalBaseCost)
      },
      withStrategy: {
        energyCost: Math.round(withEnergyCost),
        transmissionCost: Math.round(withTransmissionCost),
        totalCost: Math.round(withEnergyCost + withTransmissionCost),
        hoursAvoided
      },
      savings: {
        amount: Math.round(totalEnergySavings + transmissionSavings),
        percentage: savingsPercentage,
        transmissionSavings: Math.round(transmissionSavings),
        energySavings: Math.round(totalEnergySavings)
      }
    };
  }, [savingsData]);

  return {
    savingsData,
    loading,
    fetch12CPSavingsData,
    calculateSavings,
    transmissionAdder: TRANSMISSION_ADDER,
    transmissionRatePerKW: TRANSMISSION_RATE_PER_KW_MONTH
  };
}
