import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BackfillStatus {
  totalRecords: number;
  coverage: {
    weather: number;
    demand: number;
    generation: number;
  };
  dateRange: {
    start: string | null;
    end: string | null;
  };
  targetRange: {
    start: string;
    end: string;
  };
  estimatedRecordsNeeded: number;
}

export interface BackfillProgress {
  isRunning: boolean;
  currentPhase: 'prices' | 'weather' | 'demand' | 'generation' | 'all' | null;
  totalMonths: number;
  completedMonths: number;
  recordsProcessed: number;
  estimatedTimeRemaining: string;
  errors: string[];
}

const TOTAL_DAYS = (new Date().getFullYear() - 2018 + 1) * 365;

export function useComprehensiveBackfill() {
  const [status, setStatus] = useState<BackfillStatus | null>(null);
  const [progress, setProgress] = useState<BackfillProgress>({
    isRunning: false,
    currentPhase: null,
    totalMonths: TOTAL_DAYS,
    completedMonths: 0,
    recordsProcessed: 0,
    estimatedTimeRemaining: '',
    errors: []
  });
  const [loading, setLoading] = useState(false);
  const [nextStartDate, setNextStartDate] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-comprehensive-backfill', {
        body: { phase: 'status' }
      });

      if (error) throw error;
      setStatus(data);
      return data;
    } catch (error: any) {
      console.error('Failed to fetch backfill status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data status',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startBackfill = useCallback(async (
    phase: 'prices' | 'weather' | 'demand' | 'generation' | 'all' = 'all',
    startYear: number = 2018,
    endYear: number = new Date().getFullYear()
  ) => {
    if (progress.isRunning) {
      toast({
        title: 'Backfill in Progress',
        description: 'Please wait for the current backfill to complete',
        variant: 'destructive'
      });
      return;
    }

    setProgress({
      isRunning: true,
      currentPhase: phase,
      totalMonths: TOTAL_DAYS,
      completedMonths: 0,
      recordsProcessed: 0,
      estimatedTimeRemaining: 'Calculating...',
      errors: []
    });

    const startTime = Date.now();
    let totalRecordsProcessed = 0;
    const allErrors: string[] = [];
    let currentStartDate = nextStartDate || `${startYear}-01-01`;
    let daysProcessed = 0;
    let isComplete = false;

    try {
      while (!isComplete) {
        const { data, error } = await supabase.functions.invoke('aeso-comprehensive-backfill', {
          body: {
            phase,
            startYear,
            endYear,
            startDate: currentStartDate
          }
        });

        if (error) throw error;

        if (!data.success) {
          allErrors.push(data.error || 'Unknown error');
          break;
        }

        // Calculate records processed based on phase
        let recordsThisBatch = 0;
        if (phase === 'all') {
          recordsThisBatch = (data.prices?.recordsInserted || 0) + 
                            (data.weather?.recordsUpdated || 0) + 
                            (data.demand?.recordsUpdated || 0) + 
                            (data.generation?.recordsUpdated || 0);
          isComplete = data.prices?.isComplete && data.weather?.isComplete && 
                       data.demand?.isComplete && data.generation?.isComplete;
        } else {
          recordsThisBatch = data.recordsInserted || data.recordsUpdated || 0;
          isComplete = data.isComplete || false;
          currentStartDate = data.nextStartDate || currentStartDate;
        }

        totalRecordsProcessed += recordsThisBatch;
        daysProcessed += 7; // Each batch is ~7 days

        // Collect errors
        if (data.errors) allErrors.push(...data.errors);
        if (data.prices?.errors) allErrors.push(...data.prices.errors);
        if (data.weather?.errors) allErrors.push(...data.weather.errors);
        if (data.demand?.errors) allErrors.push(...data.demand.errors);
        if (data.generation?.errors) allErrors.push(...data.generation.errors);

        // Calculate estimated time remaining
        const elapsed = Date.now() - startTime;
        const avgTimePerDay = elapsed / Math.max(daysProcessed, 1);
        const remainingDays = TOTAL_DAYS - daysProcessed;
        const estimatedMs = avgTimePerDay * remainingDays;
        const estimatedMinutes = Math.ceil(estimatedMs / 60000);

        setProgress(prev => ({
          ...prev,
          completedMonths: daysProcessed,
          recordsProcessed: totalRecordsProcessed,
          estimatedTimeRemaining: estimatedMinutes > 0 ? `~${estimatedMinutes} min remaining` : 'Almost done...',
          errors: allErrors.slice(-10)
        }));

        // Save checkpoint
        setNextStartDate(currentStartDate);

        // Small delay between batches
        await new Promise(r => setTimeout(r, 300));
      }

      toast({
        title: 'Backfill Complete',
        description: `Successfully processed ${totalRecordsProcessed.toLocaleString()} records`,
      });

      // Refresh status
      await fetchStatus();
      setNextStartDate(null);

    } catch (error: any) {
      console.error('Backfill error:', error);
      allErrors.push(error.message);
      toast({
        title: 'Backfill Error',
        description: error.message || 'An error occurred during backfill',
        variant: 'destructive'
      });
    } finally {
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        currentPhase: null,
        errors: allErrors
      }));
    }
  }, [progress.isRunning, toast, fetchStatus, nextStartDate]);

  const stopBackfill = useCallback(() => {
    // Note: This is a soft stop - it won't stop the current batch
    // but will prevent the next batch from starting
    setProgress(prev => ({
      ...prev,
      isRunning: false,
      currentPhase: null
    }));
    
    toast({
      title: 'Backfill Stopped',
      description: 'The current batch will complete, but no new batches will start',
    });
  }, [toast]);

  return {
    status,
    progress,
    loading,
    fetchStatus,
    startBackfill,
    stopBackfill,
    percentComplete: Math.min(100, Math.round((progress.completedMonths / progress.totalMonths) * 100)),
    daysProcessed: progress.completedMonths,
    totalDays: TOTAL_DAYS
  };
}
