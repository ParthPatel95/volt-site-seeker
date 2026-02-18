import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, ArrowLeftRight, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend,
} from 'recharts';

interface AncillaryRecord {
  timestamp: string;
  operating_reserve: number | null;
  spinning_reserve_mw: number | null;
  supplemental_reserve_mw: number | null;
  intertie_bc_flow: number | null;
  intertie_sask_flow: number | null;
  intertie_montana_flow: number | null;
  reserve_margin_percent: number | null;
  grid_stress_score: number | null;
}

export function AncillaryServicesAnalytics() {
  const [data, setData] = useState<AncillaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let allData: AncillaryRecord[] = [];
      let offset = 0;
      const batchSize = 1000;

      while (true) {
        const { data: batch, error } = await supabase
          .from('aeso_training_data')
          .select('timestamp, operating_reserve, spinning_reserve_mw, supplemental_reserve_mw, intertie_bc_flow, intertie_sask_flow, intertie_montana_flow, reserve_margin_percent, grid_stress_score')
          .not('operating_reserve', 'is', null)
          .order('timestamp', { ascending: true })
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!batch || batch.length === 0) break;
        allData = allData.concat(batch as AncillaryRecord[]);
        if (batch.length < batchSize) break;
        offset += batchSize;
      }

      setData(allData);
      setLoaded(true);
    } catch (err) {
      console.error('Failed to load ancillary data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loaded) loadData();
  }, [loaded, loadData]);

  // Coverage stats
  const coverage = useMemo(() => {
    const total = data.length;
    const withReserve = data.filter(d => d.operating_reserve != null).length;
    const withIntertie = data.filter(d => d.intertie_bc_flow != null).length;
    const withStress = data.filter(d => d.grid_stress_score != null).length;
    return { total, withReserve, withIntertie, withStress };
  }, [data]);

  // KPIs
  const kpis = useMemo(() => {
    if (data.length === 0) return null;
    const reserves = data.filter(d => d.reserve_margin_percent != null).map(d => d.reserve_margin_percent!);
    const avgReserveMargin = reserves.length > 0 ? reserves.reduce((s, v) => s + v, 0) / reserves.length : 0;
    
    const stressScores = data.filter(d => d.grid_stress_score != null).map(d => d.grid_stress_score!);
    const peakStress = stressScores.length > 0 ? Math.max(...stressScores) : 0;

    const bcFlows = data.filter(d => d.intertie_bc_flow != null).map(d => d.intertie_bc_flow!);
    const netImport = bcFlows.length > 0 ? bcFlows.reduce((s, v) => s + v, 0) : 0;

    return { avgReserveMargin, peakStress, netImport };
  }, [data]);

  // Daily aggregated charts
  const dailyReserve = useMemo(() => {
    const dayMap = new Map<string, { sum: number; count: number }>();
    for (const d of data) {
      if (d.operating_reserve == null) continue;
      const key = d.timestamp.slice(0, 10);
      const entry = dayMap.get(key) || { sum: 0, count: 0 };
      entry.sum += d.operating_reserve;
      entry.count++;
      dayMap.set(key, entry);
    }
    return Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      avgReserve: Math.round(v.sum / v.count),
    }));
  }, [data]);

  const dailyIntertie = useMemo(() => {
    const dayMap = new Map<string, { bc: number; sask: number; mt: number; count: number }>();
    for (const d of data) {
      if (d.intertie_bc_flow == null) continue;
      const key = d.timestamp.slice(0, 10);
      const entry = dayMap.get(key) || { bc: 0, sask: 0, mt: 0, count: 0 };
      entry.bc += d.intertie_bc_flow || 0;
      entry.sask += d.intertie_sask_flow || 0;
      entry.mt += d.intertie_montana_flow || 0;
      entry.count++;
      dayMap.set(key, entry);
    }
    return Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      bc: Math.round(v.bc / v.count),
      sask: Math.round(v.sask / v.count),
      montana: Math.round(v.mt / v.count),
    }));
  }, [data]);

  // Reserve margin histogram
  const reserveHistogram = useMemo(() => {
    const margins = data.filter(d => d.reserve_margin_percent != null).map(d => d.reserve_margin_percent!);
    if (margins.length === 0) return [];
    const min = Math.floor(Math.min(...margins));
    const max = Math.ceil(Math.max(...margins));
    const binWidth = Math.max(1, Math.round((max - min) / 20));
    const bins: { range: string; count: number }[] = [];
    for (let i = min; i < max; i += binWidth) {
      const count = margins.filter(m => m >= i && m < i + binWidth).length;
      bins.push({ range: `${i}%`, count });
    }
    return bins;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading ancillary data...</span>
      </div>
    );
  }

  if (!loaded) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Button onClick={loadData}>Load Ancillary & Grid Data</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Coverage Warning */}
      <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-700 dark:text-amber-400">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Limited Data Coverage (~12%)</p>
          <p className="mt-0.5 text-muted-foreground">Reserve and intertie data is only available from Nov 2025+. {coverage.total.toLocaleString()} records loaded.</p>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-[10px] text-muted-foreground uppercase">Avg Reserve Margin</p>
            <p className="text-lg font-bold text-foreground">{kpis.avgReserveMargin.toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <Activity className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <p className="text-[10px] text-muted-foreground uppercase">Peak Stress Score</p>
            <p className="text-lg font-bold text-foreground">{kpis.peakStress.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <ArrowLeftRight className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <p className="text-[10px] text-muted-foreground uppercase">Net Intertie Flow</p>
            <p className="text-lg font-bold text-foreground">{(kpis.netImport / 1000).toFixed(0)} GWh</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Operating Reserve Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-sm">Operating Reserve</CardTitle>
            </div>
            <CardDescription className="text-xs">Daily average (MW)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyReserve}>
                <defs>
                  <linearGradient id="reserveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v} MW`, 'Reserve']} />
                <Area type="monotone" dataKey="avgReserve" stroke="hsl(150, 60%, 45%)" fill="url(#reserveGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intertie Flows */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
              <CardTitle className="text-sm">Intertie Flows</CardTitle>
            </div>
            <CardDescription className="text-xs">Daily average by interconnection (MW)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyIntertie}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="bc" name="BC" stackId="1" stroke="hsl(220, 70%, 55%)" fill="hsl(220, 70%, 55%)" fillOpacity={0.4} />
                <Area type="monotone" dataKey="sask" name="Saskatchewan" stackId="1" stroke="hsl(45, 70%, 55%)" fill="hsl(45, 70%, 55%)" fillOpacity={0.4} />
                <Area type="monotone" dataKey="montana" name="Montana" stackId="1" stroke="hsl(0, 60%, 55%)" fill="hsl(0, 60%, 55%)" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reserve Margin Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reserve Margin Distribution</CardTitle>
            <CardDescription className="text-xs">{data.filter(d => d.reserve_margin_percent != null).length.toLocaleString()} hourly observations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reserveHistogram}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220, 70%, 55%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
