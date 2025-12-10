import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Monthly12CPData {
  month: string;
  peakDemandMW: number;
  peakTimestamp: string;
  poolPriceAtPeak: number;
  hourOfDay: number;
  dayOfWeek: string;
}

export interface OperatingReservesData {
  timestamp: string;
  totalReserve: number;
  spinningReserve: number;
  supplementalReserve: number;
  reservePrice: number;
  reserveMarginPercent: number;
}

export interface TwelveCPSummary {
  averageMonthlyPeak: number;
  peakHourDistribution: { hour: number; count: number }[];
  yearOverYearChange: number;
  estimatedTransmissionCost: number;
  monthlyPeaks: Monthly12CPData[];
}

export interface ReservesSummary {
  avgTotalReserve: number;
  avgSpinningReserve: number;
  avgSupplementalReserve: number;
  avgReservePrice: number;
  minReserveEvent: { timestamp: string; reserve: number } | null;
  maxReserveEvent: { timestamp: string; reserve: number } | null;
  reserveMarginTrend: 'improving' | 'declining' | 'stable';
  historicalData: OperatingReservesData[];
}

export function useAESO12CPAnalytics() {
  const [twelveCPData, setTwelveCPData] = useState<TwelveCPSummary | null>(null);
  const [reservesData, setReservesData] = useState<ReservesSummary | null>(null);
  const [loading12CP, setLoading12CP] = useState(false);
  const [loadingReserves, setLoadingReserves] = useState(false);
  const { toast } = useToast();

  const fetch12CPData = useCallback(async (months: number = 12) => {
    setLoading12CP(true);
    try {
      // Query aeso_training_data to find monthly peak demand hours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, ail_mw, pool_price, hour_of_day, day_of_week')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('ail_mw', 'is', null)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No 12CP Data",
          description: "No demand data available for 12CP analysis.",
          variant: "destructive"
        });
        return;
      }

      // Group by month and find peak for each month
      const monthlyGroups: { [key: string]: typeof data } = {};
      data.forEach(row => {
        const date = new Date(row.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = [];
        }
        monthlyGroups[monthKey].push(row);
      });

      // Find peak for each month
      const monthlyPeaks: Monthly12CPData[] = [];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      Object.entries(monthlyGroups).forEach(([month, rows]) => {
        const peakRow = rows.reduce((max, row) => 
          (row.ail_mw || 0) > (max.ail_mw || 0) ? row : max
        , rows[0]);

        if (peakRow && peakRow.ail_mw) {
          const peakDate = new Date(peakRow.timestamp);
          monthlyPeaks.push({
            month,
            peakDemandMW: peakRow.ail_mw,
            peakTimestamp: peakRow.timestamp,
            poolPriceAtPeak: peakRow.pool_price || 0,
            hourOfDay: peakRow.hour_of_day || peakDate.getHours(),
            dayOfWeek: dayNames[peakRow.day_of_week ?? peakDate.getDay()]
          });
        }
      });

      // Sort by month descending
      monthlyPeaks.sort((a, b) => b.month.localeCompare(a.month));

      // Calculate peak hour distribution
      const hourCounts: { [hour: number]: number } = {};
      monthlyPeaks.forEach(peak => {
        hourCounts[peak.hourOfDay] = (hourCounts[peak.hourOfDay] || 0) + 1;
      });
      const peakHourDistribution = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count);

      // Calculate average monthly peak
      const averageMonthlyPeak = monthlyPeaks.reduce((sum, p) => sum + p.peakDemandMW, 0) / monthlyPeaks.length;

      // Calculate year-over-year change (compare current year avg to previous year)
      const currentYear = new Date().getFullYear();
      const currentYearPeaks = monthlyPeaks.filter(p => p.month.startsWith(String(currentYear)));
      const prevYearPeaks = monthlyPeaks.filter(p => p.month.startsWith(String(currentYear - 1)));
      
      let yearOverYearChange = 0;
      if (currentYearPeaks.length > 0 && prevYearPeaks.length > 0) {
        const currentAvg = currentYearPeaks.reduce((s, p) => s + p.peakDemandMW, 0) / currentYearPeaks.length;
        const prevAvg = prevYearPeaks.reduce((s, p) => s + p.peakDemandMW, 0) / prevYearPeaks.length;
        yearOverYearChange = ((currentAvg - prevAvg) / prevAvg) * 100;
      }

      // Estimated transmission cost (using standard $11.73/MWh adder)
      const estimatedTransmissionCost = 11.73;

      setTwelveCPData({
        averageMonthlyPeak,
        peakHourDistribution,
        yearOverYearChange,
        estimatedTransmissionCost,
        monthlyPeaks
      });

      toast({
        title: "12CP Data Loaded",
        description: `Analyzed ${monthlyPeaks.length} monthly coincident peaks.`
      });

    } catch (error: any) {
      console.error('Error fetching 12CP data:', error);
      toast({
        title: "Error Loading 12CP Data",
        description: error.message || "Failed to fetch 12CP analysis data.",
        variant: "destructive"
      });
    } finally {
      setLoading12CP(false);
    }
  }, [toast]);

  const fetchOperatingReservesData = useCallback(async (days: number = 30) => {
    setLoadingReserves(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, operating_reserve, operating_reserve_price, spinning_reserve_mw, supplemental_reserve_mw, ail_mw, available_capacity_mw')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('operating_reserve', 'is', null)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Reserves Data",
          description: "No operating reserves data available for analysis.",
          variant: "destructive"
        });
        return;
      }

      // Transform data
      const historicalData: OperatingReservesData[] = data.map(row => ({
        timestamp: row.timestamp,
        totalReserve: row.operating_reserve || 0,
        spinningReserve: row.spinning_reserve_mw || 0,
        supplementalReserve: row.supplemental_reserve_mw || 0,
        reservePrice: row.operating_reserve_price || 0,
        reserveMarginPercent: row.available_capacity_mw && row.ail_mw 
          ? ((row.available_capacity_mw - row.ail_mw) / row.available_capacity_mw) * 100 
          : 0
      }));

      // Calculate summary statistics
      const validData = historicalData.filter(d => d.totalReserve > 0);
      const avgTotalReserve = validData.reduce((s, d) => s + d.totalReserve, 0) / validData.length;
      const avgSpinningReserve = validData.reduce((s, d) => s + d.spinningReserve, 0) / validData.length;
      const avgSupplementalReserve = validData.reduce((s, d) => s + d.supplementalReserve, 0) / validData.length;
      const avgReservePrice = validData.reduce((s, d) => s + d.reservePrice, 0) / validData.length;

      // Find min/max reserve events
      const sortedByReserve = [...validData].sort((a, b) => a.totalReserve - b.totalReserve);
      const minReserveEvent = sortedByReserve.length > 0 
        ? { timestamp: sortedByReserve[0].timestamp, reserve: sortedByReserve[0].totalReserve }
        : null;
      const maxReserveEvent = sortedByReserve.length > 0 
        ? { timestamp: sortedByReserve[sortedByReserve.length - 1].timestamp, reserve: sortedByReserve[sortedByReserve.length - 1].totalReserve }
        : null;

      // Determine trend (compare first half to second half)
      const midPoint = Math.floor(validData.length / 2);
      const firstHalfAvg = validData.slice(0, midPoint).reduce((s, d) => s + d.totalReserve, 0) / midPoint;
      const secondHalfAvg = validData.slice(midPoint).reduce((s, d) => s + d.totalReserve, 0) / (validData.length - midPoint);
      
      let reserveMarginTrend: 'improving' | 'declining' | 'stable' = 'stable';
      const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      if (changePercent > 5) reserveMarginTrend = 'improving';
      else if (changePercent < -5) reserveMarginTrend = 'declining';

      setReservesData({
        avgTotalReserve,
        avgSpinningReserve,
        avgSupplementalReserve,
        avgReservePrice,
        minReserveEvent,
        maxReserveEvent,
        reserveMarginTrend,
        historicalData
      });

      toast({
        title: "Reserves Data Loaded",
        description: `Analyzed ${validData.length} operating reserve data points.`
      });

    } catch (error: any) {
      console.error('Error fetching reserves data:', error);
      toast({
        title: "Error Loading Reserves Data",
        description: error.message || "Failed to fetch operating reserves data.",
        variant: "destructive"
      });
    } finally {
      setLoadingReserves(false);
    }
  }, [toast]);

  const calculateTransmissionChargeImpact = useCallback((demandMW: number, transmissionRate: number = 11.73) => {
    // Simplified transmission charge calculation
    // Real 12CP billing is based on facility load during system peaks
    const annualTransmissionCost = demandMW * transmissionRate * 8760; // $/year
    const monthlyTransmissionCost = annualTransmissionCost / 12;
    const perMWhCost = transmissionRate;

    return {
      annualCost: annualTransmissionCost,
      monthlyCost: monthlyTransmissionCost,
      perMWhCost,
      demandCharge: demandMW * transmissionRate * 12 // 12 months of peak demand charges
    };
  }, []);

  return {
    twelveCPData,
    reservesData,
    loading12CP,
    loadingReserves,
    fetch12CPData,
    fetchOperatingReservesData,
    calculateTransmissionChargeImpact
  };
}
