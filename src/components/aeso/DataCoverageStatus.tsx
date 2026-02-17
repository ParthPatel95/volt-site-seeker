import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Play, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CoverageData {
  totalRecords: number;
  dateRange: { start: string; end: string };
  columns: {
    name: string;
    label: string;
    filled: number;
    total: number;
    percent: number;
    backfillAction?: string;
  }[];
}

export function DataCoverageStatus() {
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const fetchCoverage = useCallback(async () => {
    setLoading(true);
    try {
      const { count: total } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true });

      const totalRecords = total || 0;

      // Parallel count queries for each category
      const [genRes, gasRes, smpRes, reserveRes, weatherRes, demandRes, dateStartRes, dateEndRes] = await Promise.all([
        supabase.from('aeso_training_data').select('*', { count: 'exact', head: true }).not('generation_gas', 'is', null),
        supabase.from('aeso_training_data').select('*', { count: 'exact', head: true }).not('gas_price_aeco', 'is', null),
        supabase.from('aeso_training_data').select('*', { count: 'exact', head: true }).not('system_marginal_price', 'is', null),
        supabase.from('aeso_training_data').select('*', { count: 'exact', head: true }).not('operating_reserve', 'is', null),
        supabase.from('aeso_training_data').select('*', { count: 'exact', head: true }).not('temperature_calgary', 'is', null),
        supabase.from('aeso_training_data').select('*', { count: 'exact', head: true }).not('ail_mw', 'is', null),
        supabase.from('aeso_training_data').select('timestamp').order('timestamp', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('aeso_training_data').select('timestamp').order('timestamp', { ascending: false }).limit(1).maybeSingle(),
      ]);

      setCoverage({
        totalRecords,
        dateRange: {
          start: dateStartRes.data?.timestamp?.split('T')[0] || 'N/A',
          end: dateEndRes.data?.timestamp?.split('T')[0] || 'N/A',
        },
        columns: [
          { name: 'generation', label: 'Generation Mix', filled: genRes.count || 0, total: totalRecords, percent: totalRecords ? Math.round(((genRes.count || 0) / totalRecords) * 100) : 0, backfillAction: 'generation' },
          { name: 'gas_price', label: 'Gas Price (AECO)', filled: gasRes.count || 0, total: totalRecords, percent: totalRecords ? Math.round(((gasRes.count || 0) / totalRecords) * 100) : 0, backfillAction: 'gas_price' },
          { name: 'smp', label: 'System Marginal Price', filled: smpRes.count || 0, total: totalRecords, percent: totalRecords ? Math.round(((smpRes.count || 0) / totalRecords) * 100) : 0, backfillAction: 'smp' },
          { name: 'reserves', label: 'Operating Reserves', filled: reserveRes.count || 0, total: totalRecords, percent: totalRecords ? Math.round(((reserveRes.count || 0) / totalRecords) * 100) : 0 },
          { name: 'weather', label: 'Weather Data', filled: weatherRes.count || 0, total: totalRecords, percent: totalRecords ? Math.round(((weatherRes.count || 0) / totalRecords) * 100) : 0, backfillAction: 'weather' },
          { name: 'demand', label: 'Demand (AIL)', filled: demandRes.count || 0, total: totalRecords, percent: totalRecords ? Math.round(((demandRes.count || 0) / totalRecords) * 100) : 0, backfillAction: 'demand' },
        ]
      });
    } catch (err) {
      console.error('Failed to fetch coverage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoverage(); }, [fetchCoverage]);

  const runBackfill = async (action: string) => {
    setRunningAction(action);
    try {
      let functionName = '';
      let body: any = {};

      switch (action) {
        case 'gas_price':
          functionName = 'aeso-gas-price-backfill';
          break;
        case 'generation':
          functionName = 'aeso-generation-csv-backfill';
          body = { mode: 'info' };
          break;
        case 'smp':
          functionName = 'aeso-comprehensive-backfill';
          body = { phase: 'smp', batchMonths: 6 };
          break;
        case 'weather':
          functionName = 'aeso-comprehensive-backfill';
          body = { phase: 'weather', batchMonths: 3 };
          break;
        case 'demand':
          functionName = 'aeso-comprehensive-backfill';
          body = { phase: 'demand', batchMonths: 3 };
          break;
        default:
          throw new Error('Unknown action');
      }

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;

      if (action === 'generation' && data?.mode === 'info') {
        toast.info('Generation backfill requires manual CSV upload', {
          description: 'Download CSVs from AESO and upload via the Generation tab',
          duration: 8000,
        });
      } else {
        toast.success(`${action} backfill complete`, {
          description: `Updated ${data?.trainingRecordsUpdated || data?.recordsUpdated || data?.recordsInserted || 0} records`,
        });
        fetchCoverage();
      }
    } catch (err: any) {
      toast.error(`Backfill failed: ${err.message}`);
    } finally {
      setRunningAction(null);
    }
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600 dark:text-green-400';
    if (percent >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return '[&>div]:bg-green-500';
    if (percent >= 50) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
  };

  if (loading && !coverage) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Loading data coverage...</span>
        </CardContent>
      </Card>
    );
  }

  if (!coverage) return null;

  const overallPercent = Math.round(
    coverage.columns.reduce((sum, c) => sum + c.percent, 0) / coverage.columns.length
  );

  return (
    <Card className="border hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Training Data Coverage</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {coverage.totalRecords.toLocaleString()} records
            </Badge>
            <Badge variant="outline" className="text-xs">
              {coverage.dateRange.start} → {coverage.dateRange.end}
            </Badge>
            <Button variant="ghost" size="icon-sm" onClick={fetchCoverage} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall progress */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Overall</span>
          <Progress value={overallPercent} className={`flex-1 ${getProgressColor(overallPercent)}`} />
          <span className={`text-sm font-bold min-w-[40px] text-right ${getStatusColor(overallPercent)}`}>
            {overallPercent}%
          </span>
        </div>

        {/* Per-column breakdown */}
        {coverage.columns.map((col) => (
          <div key={col.name} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground min-w-[100px] truncate">{col.label}</span>
            <Progress value={col.percent} className={`flex-1 h-1.5 ${getProgressColor(col.percent)}`} />
            <span className={`text-xs font-medium min-w-[32px] text-right ${getStatusColor(col.percent)}`}>
              {col.percent}%
            </span>
            {col.backfillAction && col.percent < 95 && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                disabled={!!runningAction}
                onClick={() => runBackfill(col.backfillAction!)}
              >
                {runningAction === col.backfillAction ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                Fill
              </Button>
            )}
            {col.percent >= 95 && (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
