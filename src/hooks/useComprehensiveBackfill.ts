import { useState, useCallback, useRef } from 'react';
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

const START_YEAR = 2018;
const TOTAL_MONTHS = (new Date().getFullYear() - START_YEAR + 1) * 12;
const BATCH_MONTHS = 2; // Process 2 months per batch to stay under 60s timeout

export function useComprehensiveBackfill() {
  const [status, setStatus] = useState<BackfillStatus | null>(null);
  const [progress, setProgress] = useState<BackfillProgress>({
    isRunning: false,
    currentPhase: null,
    totalMonths: TOTAL_MONTHS,
    completedMonths: 0,
    recordsProcessed: 0,
    estimatedTimeRemaining: '',
    errors: []
  });
  const [loading, setLoading] = useState(false);
  const offsetRef = useRef<number>(0);
  const stopRequestedRef = useRef<boolean>(false);
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
    startYear: number = START_YEAR,
    endYear: number = new Date().getFullYear(),
    resumeFromOffset: number = 0
  ) => {
    if (progress.isRunning) {
      toast({
        title: 'Backfill in Progress',
        description: 'Please wait for the current backfill to complete',
        variant: 'destructive'
      });
      return;
    }

    stopRequestedRef.current = false;
    offsetRef.current = resumeFromOffset;

    setProgress({
      isRunning: true,
      currentPhase: phase,
      totalMonths: TOTAL_MONTHS,
      completedMonths: resumeFromOffset,
      recordsProcessed: 0,
      estimatedTimeRemaining: 'Calculating...',
      errors: []
    });

    const startTime = Date.now();
    let totalRecordsProcessed = 0;
    const allErrors: string[] = [];
    let isComplete = false;
    let batchCount = 0;

    try {
      while (!isComplete && !stopRequestedRef.current) {
        batchCount++;
        console.log(`Backfill batch ${batchCount}: offset=${offsetRef.current}, phase=${phase}`);

        const { data, error } = await supabase.functions.invoke('aeso-comprehensive-backfill', {
          body: {
            phase,
            startYear,
            endYear,
            batchMonths: BATCH_MONTHS,
            offsetMonths: offsetRef.current
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          allErrors.push(error.message || 'Edge function error');
          // Continue trying from next offset
          offsetRef.current += BATCH_MONTHS;
          if (offsetRef.current >= TOTAL_MONTHS) {
            isComplete = true;
          }
          continue;
        }

        if (!data.success && data.error) {
          allErrors.push(data.error);
          // Continue trying
          offsetRef.current += BATCH_MONTHS;
          if (offsetRef.current >= TOTAL_MONTHS) {
            isComplete = true;
          }
          continue;
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
          offsetRef.current = data.prices?.nextOffsetMonths || (offsetRef.current + BATCH_MONTHS);
        } else {
          recordsThisBatch = data.recordsInserted || data.recordsUpdated || 0;
          isComplete = data.isComplete || false;
          offsetRef.current = data.nextOffsetMonths || (offsetRef.current + BATCH_MONTHS);
        }

        totalRecordsProcessed += recordsThisBatch;

        // Collect errors
        if (data.errors) allErrors.push(...data.errors);
        if (data.prices?.errors) allErrors.push(...data.prices.errors);
        if (data.weather?.errors) allErrors.push(...data.weather.errors);
        if (data.demand?.errors) allErrors.push(...data.demand.errors);
        if (data.generation?.errors) allErrors.push(...data.generation.errors);

        // Calculate estimated time remaining
        const elapsed = Date.now() - startTime;
        const monthsCompleted = offsetRef.current;
        const avgTimePerMonth = elapsed / Math.max(monthsCompleted - resumeFromOffset, 1);
        const remainingMonths = TOTAL_MONTHS - monthsCompleted;
        const estimatedMs = avgTimePerMonth * remainingMonths;
        const estimatedMinutes = Math.ceil(estimatedMs / 60000);

        setProgress(prev => ({
          ...prev,
          completedMonths: monthsCompleted,
          recordsProcessed: totalRecordsProcessed,
          estimatedTimeRemaining: estimatedMinutes > 0 ? `~${estimatedMinutes} min remaining` : 'Almost done...',
          errors: allErrors.slice(-10)
        }));

        // Small delay between batches to avoid overwhelming the API
        await new Promise(r => setTimeout(r, 500));
      }

      if (stopRequestedRef.current) {
        toast({
          title: 'Backfill Paused',
          description: `Paused at month ${offsetRef.current}. You can resume later.`,
        });
      } else {
        toast({
          title: 'Backfill Complete',
          description: `Successfully processed ${totalRecordsProcessed.toLocaleString()} records`,
        });
      }

      // Refresh status
      await fetchStatus();

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
  }, [progress.isRunning, toast, fetchStatus]);

  const stopBackfill = useCallback(() => {
    stopRequestedRef.current = true;
    toast({
      title: 'Stopping Backfill',
      description: 'Current batch will complete, then pause.',
    });
  }, [toast]);

  const resumeBackfill = useCallback((phase: 'prices' | 'weather' | 'demand' | 'generation' | 'all' = 'all') => {
    startBackfill(phase, START_YEAR, new Date().getFullYear(), offsetRef.current);
  }, [startBackfill]);

  return {
    status,
    progress,
    loading,
    fetchStatus,
    startBackfill,
    stopBackfill,
    resumeBackfill,
    percentComplete: Math.min(100, Math.round((progress.completedMonths / TOTAL_MONTHS) * 100)),
    monthsProcessed: progress.completedMonths,
    totalMonths: TOTAL_MONTHS,
    currentOffset: offsetRef.current
  };
}
