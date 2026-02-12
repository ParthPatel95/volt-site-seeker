import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Download, Search, Clock, DollarSign, Zap } from 'lucide-react';
import type { ShutdownRecord } from '@/hooks/usePowerModelCalculator';

interface Props {
  shutdownLog: ShutdownRecord[];
  fixedPriceCAD?: number;
}

const REASON_COLORS: Record<string, string> = {
  '12CP': 'bg-red-500/10 text-red-600 border-red-500/20',
  'Price': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'UptimeCap': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  '12CP+Price': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const REASON_LABELS: Record<string, string> = {
  '12CP': '12CP Avoidance',
  'Price': 'Price Curtailment',
  'UptimeCap': 'Uptime Cap',
  '12CP+Price': '12CP + Price',
};

const PAGE_SIZE = 50;

export function PowerModelShutdownLog({ shutdownLog, fixedPriceCAD = 0 }: Props) {
  const [page, setPage] = useState(0);
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const months = useMemo(() => {
    const set = new Set<string>();
    shutdownLog.forEach(r => {
      const d = new Date(r.date);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(set).sort();
  }, [shutdownLog]);

  const filtered = useMemo(() => {
    return shutdownLog.filter(r => {
      if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false;
      if (monthFilter !== 'all') {
        const d = new Date(r.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (ym !== monthFilter) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        if (!r.date.includes(s) && !String(r.he).includes(s)) return false;
      }
      return true;
    });
  }, [shutdownLog, reasonFilter, monthFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totals = useMemo(() => {
    const byReason: Record<string, { count: number; savings: number }> = {};
    for (const r of filtered) {
      if (!byReason[r.reason]) byReason[r.reason] = { count: 0, savings: 0 };
      byReason[r.reason].count++;
      byReason[r.reason].savings += r.costAvoided;
    }
    return {
      total: filtered.length,
      totalSavings: filtered.reduce((s, r) => s + r.costAvoided, 0),
      byReason,
    };
  }, [filtered]);

  const exportCSV = () => {
    const header = 'Date,Hour Ending,Pool Price ($/MWh),AIL (MW),Reason,Est. Cost Avoided ($)' + (fixedPriceCAD > 0 ? ',Curtailment Savings ($)' : '') + '\n';
    const rows = filtered.map(r => `${r.date},${r.he},${r.poolPrice.toFixed(2)},${r.ailMW.toFixed(0)},${r.reason},${r.costAvoided.toFixed(2)}` + (fixedPriceCAD > 0 ? `,${r.curtailmentSavings.toFixed(2)}` : '')).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shutdown-log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Shutdown Hours</p>
              <p className="text-lg font-bold">{totals.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Est. Total Savings</p>
              <p className="text-lg font-bold">${(totals.totalSavings / 1000).toFixed(0)}k</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(totals.byReason).map(([reason, data]) => (
          <Card key={reason}>
            <CardContent className="p-3">
              <Badge variant="outline" className={`text-xs mb-1 ${REASON_COLORS[reason] || ''}`}>
                {REASON_LABELS[reason] || reason}
              </Badge>
              <p className="text-sm font-bold">{data.count} hrs</p>
              <p className="text-xs text-muted-foreground">${(data.savings / 1000).toFixed(0)}k saved</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm">Shutdown Hours Log</CardTitle>
              <CardDescription className="text-xs">{filtered.length.toLocaleString()} curtailed hours from real AESO data</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-3 h-3 mr-1" />Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search date..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="h-8 text-sm pl-7" />
            </div>
            <Select value={reasonFilter} onValueChange={v => { setReasonFilter(v); setPage(0); }}>
              <SelectTrigger className="h-8 text-xs w-[150px]"><SelectValue placeholder="Reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="12CP">12CP Avoidance</SelectItem>
                <SelectItem value="Price">Price Curtailment</SelectItem>
                <SelectItem value="UptimeCap">Uptime Cap</SelectItem>
                <SelectItem value="12CP+Price">12CP + Price</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={v => { setMonthFilter(v); setPage(0); }}>
              <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">HE</TableHead>
                  <TableHead className="text-right">Pool Price ($/MWh)</TableHead>
                  <TableHead className="text-right">AIL (MW)</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Est. Cost Avoided</TableHead>
                  {fixedPriceCAD > 0 && <TableHead className="text-right">Savings</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((r, i) => (
                  <TableRow key={`${r.date}-${r.he}-${i}`}>
                    <TableCell className="text-sm">{r.date}</TableCell>
                    <TableCell className="text-right text-sm">{r.he}</TableCell>
                    <TableCell className="text-right text-sm font-medium">${r.poolPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm">{r.ailMW.toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${REASON_COLORS[r.reason] || ''}`}>
                        {REASON_LABELS[r.reason] || r.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">${r.costAvoided.toFixed(2)}</TableCell>
                    {fixedPriceCAD > 0 && (
                      <TableCell className={`text-right text-sm font-medium ${r.curtailmentSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {r.curtailmentSavings >= 0 ? '+' : ''}${r.curtailmentSavings.toFixed(2)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
