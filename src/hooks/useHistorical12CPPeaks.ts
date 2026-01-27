import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Historical12CPPeak {
  month: string;           // e.g., "2025-12"
  monthLabel: string;      // e.g., "Dec 25"
  peakTimestamp: string;   // ISO timestamp of actual peak
  peakDemandMW: number;    // Actual AIL at peak
  peakHour: number;        // Hour of day (0-23)
  priceAtPeak: number;     // Pool price during the peak hour
  dayOfWeek: string;       // e.g., "Friday"
  year: number;
}

export interface HistoricalPeakStats {
  allTimePeakMW: number;
  allTimePeakDate: string;
  avgMonthlyPeakMW: number;
  peaksByYear: { [year: number]: Historical12CPPeak[] };
  commonPeakHours: { hour: number; count: number }[];
  winterAvgPeakMW: number;
  summerAvgPeakMW: number;
}

export interface HistoricalPeaksData {
  peaks: Historical12CPPeak[];
  stats: HistoricalPeakStats;
  dateRange: { start: string; end: string };
  recordCount: number;
  yearsAnalyzed: number;
}

type YearRange = 1 | 2 | 4;

export function useHistorical12CPPeaks() {
  const [peaksData, setPeaksData] = useState<HistoricalPeaksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<YearRange>(1);
  const { toast } = useToast();

  const fetchHistoricalPeaks = useCallback(async (years: YearRange = 1) => {
    setLoading(true);
    setSelectedRange(years);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);

      // Fetch all demand data for the period
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, hour_of_day, ail_mw, day_of_week')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('ail_mw', 'is', null)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Historical Data",
          description: "No demand data available for the selected period.",
          variant: "destructive"
        });
        setPeaksData(null);
        return;
      }

      // Group by month to find monthly peaks
      const monthlyGroups: { [key: string]: typeof data } = {};
      data.forEach(row => {
        const date = new Date(row.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = [];
        }
        monthlyGroups[monthKey].push(row);
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const peaks: Historical12CPPeak[] = [];

      // Find the peak demand hour for each month
      Object.entries(monthlyGroups).forEach(([month, rows]) => {
        // Find the actual peak demand record for this month
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

        peaks.push({
          month,
          monthLabel,
          peakTimestamp: peakRecord.timestamp,
          peakDemandMW: Math.round(peakRecord.ail_mw || 0),
          peakHour,
          priceAtPeak: Math.round((peakRecord.pool_price || 0) * 100) / 100,
          dayOfWeek,
          year: parseInt(year)
        });
      });

      // Sort by demand (highest first) for display, but also keep chronological for trends
      const peaksSortedByDemand = [...peaks].sort((a, b) => b.peakDemandMW - a.peakDemandMW);
      const peaksSortedByMonth = [...peaks].sort((a, b) => a.month.localeCompare(b.month));

      // Calculate statistics
      const allTimePeak = peaksSortedByDemand[0];
      const avgMonthlyPeakMW = peaks.reduce((s, p) => s + p.peakDemandMW, 0) / peaks.length;

      // Group peaks by year
      const peaksByYear: { [year: number]: Historical12CPPeak[] } = {};
      peaks.forEach(p => {
        if (!peaksByYear[p.year]) peaksByYear[p.year] = [];
        peaksByYear[p.year].push(p);
      });

      // Find most common peak hours
      const hourCounts: { [hour: number]: number } = {};
      peaks.forEach(p => {
        hourCounts[p.peakHour] = (hourCounts[p.peakHour] || 0) + 1;
      });
      const commonPeakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Winter vs Summer peaks (Alberta winters typically have higher peaks)
      const winterMonthNums = ['01', '02', '11', '12'];
      const summerMonthNums = ['06', '07', '08'];
      const winterPeaks = peaks.filter(p => winterMonthNums.includes(p.month.split('-')[1]));
      const summerPeaks = peaks.filter(p => summerMonthNums.includes(p.month.split('-')[1]));
      
      const winterAvgPeakMW = winterPeaks.length > 0 
        ? winterPeaks.reduce((s, p) => s + p.peakDemandMW, 0) / winterPeaks.length 
        : 0;
      const summerAvgPeakMW = summerPeaks.length > 0 
        ? summerPeaks.reduce((s, p) => s + p.peakDemandMW, 0) / summerPeaks.length 
        : 0;

      const stats: HistoricalPeakStats = {
        allTimePeakMW: allTimePeak?.peakDemandMW || 0,
        allTimePeakDate: allTimePeak?.peakTimestamp || '',
        avgMonthlyPeakMW: Math.round(avgMonthlyPeakMW),
        peaksByYear,
        commonPeakHours,
        winterAvgPeakMW: Math.round(winterAvgPeakMW),
        summerAvgPeakMW: Math.round(summerAvgPeakMW)
      };

      const yearsAnalyzed = Object.keys(peaksByYear).length;

      setPeaksData({
        peaks: peaksSortedByMonth, // Chronological order for display
        stats,
        dateRange: {
          start: data[0].timestamp,
          end: data[data.length - 1].timestamp
        },
        recordCount: data.length,
        yearsAnalyzed
      });

      toast({
        title: "Historical Peaks Loaded",
        description: `Found ${peaks.length} monthly peaks across ${yearsAnalyzed} years.`
      });

    } catch (error: any) {
      console.error('Error fetching historical 12CP peaks:', error);
      toast({
        title: "Error Loading Historical Data",
        description: error.message || "Failed to fetch historical peaks.",
        variant: "destructive"
      });
      setPeaksData(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const formatPeakHour = useCallback((hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }, []);

  return {
    peaksData,
    loading,
    selectedRange,
    fetchHistoricalPeaks,
    formatPeakHour
  };
}
