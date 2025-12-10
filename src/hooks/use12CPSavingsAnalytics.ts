import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyPriceComparison {
  month: string;
  monthLabel: string;
  avgPrice: number;
  peakHourPrice: number;
  savingsOpportunity: number;
  totalHours: number;
  peakHour: number;
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
  riskScore: number; // 0-100
  occurrences: number;
  avgPriceAtPeak: number;
  seasonalPattern: string;
}

export interface TwelveCPSavingsData {
  monthlyComparisons: MonthlyPriceComparison[];
  annualAvgPrice: number;
  annualPeakPrice: number;
  totalPotentialSavings: number;
  peakHourRisks: PeakHourRisk[];
  highRiskHours: number[];
  safeHours: number[];
  seasonalInsights: {
    winter: { avgPeak: number; riskLevel: string };
    summer: { avgPeak: number; riskLevel: string };
    shoulder: { avgPeak: number; riskLevel: string };
  };
}

const TRANSMISSION_ADDER = 11.73; // $/MWh CAD

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

      // Fetch price data with hour info
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, hour_of_day, month, ail_mw')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('pool_price', 'is', null)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Price Data",
          description: "No price data available for savings analysis.",
          variant: "destructive"
        });
        return;
      }

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

      // Calculate monthly comparisons
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyComparisons: MonthlyPriceComparison[] = [];

      Object.entries(monthlyGroups).forEach(([month, rows]) => {
        // Calculate average price
        const avgPrice = rows.reduce((s, r) => s + (r.pool_price || 0), 0) / rows.length;
        
        // Find peak hour with highest average price
        const hourlyPrices: { [hour: number]: number[] } = {};
        rows.forEach(r => {
          const hour = r.hour_of_day ?? new Date(r.timestamp).getHours();
          if (!hourlyPrices[hour]) hourlyPrices[hour] = [];
          hourlyPrices[hour].push(r.pool_price || 0);
        });

        let peakHour = 17; // Default
        let peakHourPrice = avgPrice;
        Object.entries(hourlyPrices).forEach(([h, prices]) => {
          const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
          if (avg > peakHourPrice) {
            peakHourPrice = avg;
            peakHour = parseInt(h);
          }
        });

        const [year, m] = month.split('-');
        const monthLabel = `${monthNames[parseInt(m) - 1]} ${year.slice(2)}`;

        monthlyComparisons.push({
          month,
          monthLabel,
          avgPrice: Math.round(avgPrice * 100) / 100,
          peakHourPrice: Math.round(peakHourPrice * 100) / 100,
          savingsOpportunity: Math.round((peakHourPrice - avgPrice) * 100) / 100,
          totalHours: rows.length,
          peakHour
        });
      });

      // Sort by month
      monthlyComparisons.sort((a, b) => a.month.localeCompare(b.month));

      // Calculate annual averages
      const annualAvgPrice = monthlyComparisons.reduce((s, m) => s + m.avgPrice, 0) / monthlyComparisons.length;
      const annualPeakPrice = monthlyComparisons.reduce((s, m) => s + m.peakHourPrice, 0) / monthlyComparisons.length;

      // Calculate peak hour risk distribution
      const hourCounts: { [hour: number]: { count: number; totalPrice: number } } = {};
      data.forEach(row => {
        const hour = row.hour_of_day ?? new Date(row.timestamp).getHours();
        if (!hourCounts[hour]) hourCounts[hour] = { count: 0, totalPrice: 0 };
        hourCounts[hour].count++;
        hourCounts[hour].totalPrice += row.pool_price || 0;
      });

      const maxCount = Math.max(...Object.values(hourCounts).map(h => h.count));
      const peakHourRisks: PeakHourRisk[] = [];

      for (let hour = 0; hour < 24; hour++) {
        const hourData = hourCounts[hour] || { count: 0, totalPrice: 0 };
        const avgPriceAtHour = hourData.count > 0 ? hourData.totalPrice / hourData.count : 0;
        
        // Risk score based on price relative to average
        let riskScore = 0;
        if (avgPriceAtHour > annualAvgPrice * 1.5) riskScore = 90;
        else if (avgPriceAtHour > annualAvgPrice * 1.2) riskScore = 70;
        else if (avgPriceAtHour > annualAvgPrice) riskScore = 50;
        else if (avgPriceAtHour > annualAvgPrice * 0.8) riskScore = 30;
        else riskScore = 10;

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
          avgPriceAtPeak: Math.round(avgPriceAtHour * 100) / 100,
          seasonalPattern
        });
      }

      // Sort by risk score and identify high/safe hours
      const sortedByRisk = [...peakHourRisks].sort((a, b) => b.riskScore - a.riskScore);
      const highRiskHours = sortedByRisk.filter(h => h.riskScore >= 70).map(h => h.hour);
      const safeHours = sortedByRisk.filter(h => h.riskScore <= 30).map(h => h.hour);

      // Seasonal insights (simplified)
      const winterMonths = monthlyComparisons.filter(m => ['01', '02', '11', '12'].includes(m.month.split('-')[1]));
      const summerMonths = monthlyComparisons.filter(m => ['06', '07', '08'].includes(m.month.split('-')[1]));
      const shoulderMonths = monthlyComparisons.filter(m => ['03', '04', '05', '09', '10'].includes(m.month.split('-')[1]));

      const getSeasonStats = (months: MonthlyPriceComparison[]) => {
        if (months.length === 0) return { avgPeak: 0, riskLevel: 'Unknown' };
        const avg = months.reduce((s, m) => s + m.peakHourPrice, 0) / months.length;
        let riskLevel = 'Low';
        if (avg > annualPeakPrice * 1.2) riskLevel = 'High';
        else if (avg > annualPeakPrice) riskLevel = 'Moderate';
        return { avgPeak: Math.round(avg * 100) / 100, riskLevel };
      };

      // Calculate total potential savings (12 hours avoided per year at peak hour price difference)
      const totalPotentialSavings = monthlyComparisons.reduce((s, m) => s + m.savingsOpportunity, 0);

      setSavingsData({
        monthlyComparisons,
        annualAvgPrice: Math.round(annualAvgPrice * 100) / 100,
        annualPeakPrice: Math.round(annualPeakPrice * 100) / 100,
        totalPotentialSavings: Math.round(totalPotentialSavings * 100) / 100,
        peakHourRisks,
        highRiskHours,
        safeHours,
        seasonalInsights: {
          winter: getSeasonStats(winterMonths),
          summer: getSeasonStats(summerMonths),
          shoulder: getSeasonStats(shoulderMonths)
        }
      });

      toast({
        title: "Savings Analysis Complete",
        description: `Analyzed ${monthlyComparisons.length} months of price data.`
      });

    } catch (error: any) {
      console.error('Error fetching 12CP savings data:', error);
      toast({
        title: "Error Loading Savings Data",
        description: error.message || "Failed to fetch savings analysis data.",
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
    const peakPrice = savingsData.annualPeakPrice;

    // Without strategy: operate all hours at average price + full transmission
    const withoutEnergyMWh = facilityMW * annualOperatingHours;
    const withoutEnergyCost = withoutEnergyMWh * avgPrice;
    const withoutTransmissionCost = facilityMW * TRANSMISSION_ADDER * 8760; // Full transmission charges

    // With strategy: avoid 12 peak hours per year (or partial)
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

    // Energy saved by avoiding peak hours (operate at avg instead of peak)
    const energySavedPerHour = facilityMW * (peakPrice - avgPrice);
    const totalEnergySavings = energySavedPerHour * hoursAvoided;

    // Transmission savings from 12CP avoidance
    const transmissionSavings = withoutTransmissionCost * transmissionReduction;

    const withEnergyCost = withoutEnergyCost - totalEnergySavings;
    const withTransmissionCost = withoutTransmissionCost - transmissionSavings;

    return {
      withoutStrategy: {
        energyCost: Math.round(withoutEnergyCost),
        transmissionCost: Math.round(withoutTransmissionCost),
        totalCost: Math.round(withoutEnergyCost + withoutTransmissionCost)
      },
      withStrategy: {
        energyCost: Math.round(withEnergyCost),
        transmissionCost: Math.round(withTransmissionCost),
        totalCost: Math.round(withEnergyCost + withTransmissionCost),
        hoursAvoided
      },
      savings: {
        amount: Math.round(totalEnergySavings + transmissionSavings),
        percentage: Math.round(((totalEnergySavings + transmissionSavings) / (withoutEnergyCost + withoutTransmissionCost)) * 100 * 100) / 100,
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
    transmissionAdder: TRANSMISSION_ADDER
  };
}
