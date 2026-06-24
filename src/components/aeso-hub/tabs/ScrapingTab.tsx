import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle, Building2, CheckCircle2, Download, ExternalLink, FileWarning,
  Globe2, Key, Loader2, Newspaper, Play, RefreshCw, Radar, Satellite,
  Search, Sparkles, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  useScrapingSources, useScrapingJobs, useRunScraper, useSeedScrapers, useRecentScrapeItems,
  type ScrapingSource, type ScrapingJob, type RecentScrapeItem,
} from '@/hooks/useScraping';

// AESO Hub > Scraping. Restructured into three working surfaces:
//   * Sources  — every data-collection source, secret status, run-now.
//   * Finds    — a searchable / filterable / sortable / exportable table of
//                everything scraped across all sources.
//   * Runs     — full run history with per-run errors.
// A stats band sits above the tabs so the headline numbers are always visible.

const TYPE_LABEL: Record<ScrapingSource['type'], string> = {
  real_estate: 'Property listings',
  news: 'News & press',
  osm: 'OSM discovery',
  satellite: 'Satellite',
  registry: 'Registry / geocoder',
  corporate: 'Corporate',
  social: 'Social',
};

const TYPE_ICON: Record<ScrapingSource['type'], typeof Building2> = {
  real_estate: Building2,
  news: Newspaper,
  osm: Globe2,
  satellite: Satellite,
  registry: Radar,
  corporate: Building2,
  social: Sparkles,
};

const SOURCE_ICON: Record<RecentScrapeItem['source'], typeof Building2> = {
  'gem-listings': Building2,
  'industrial-news': Newspaper,
  'osm-discovery': Globe2,
};

const SOURCE_LABEL: Record<RecentScrapeItem['source'], string> = {
  'gem-listings': 'Property',
  'industrial-news': 'News',
  'osm-discovery': 'OSM site',
};

export function ScrapingTab() {
  const sourcesQ = useScrapingSources();
  const jobsQ = useScrapingJobs(40);
  const itemsQ = useRecentScrapeItems(200);
  const run = useRunScraper();
  const seed = useSeedScrapers();

  const runningKeys = useMemo(
    () => new Set((jobsQ.data ?? []).filter((j) => j.status === 'running').map((j) => j.scraper_key ?? '')),
    [jobsQ.data],
  );

  const latestByKey = useMemo(() => {
    const map = new Map<string, ScrapingJob>();
    for (const j of jobsQ.data ?? []) {
      if (!j.scraper_key) continue;
      const cur = map.get(j.scraper_key);
      if (!cur || j.started_at > cur.started_at) map.set(j.scraper_key, j);
    }
    return map;
  }, [jobsQ.data]);

  const runOne = async (scraperKey: string) => {
    try {
      const res = await run.mutateAsync({ scraper_key: scraperKey });
      const job = res.jobs[0];
      if (!job) { toast.warning('No job row returned — check console'); return; }
      if (job.status === 'failed') toast.error(`${scraperKey} failed: ${job.errors?.[0] ?? 'unknown error'}`);
      else toast.success(`${scraperKey}: ${job.items_found ?? 0} found · ${job.items_new ?? 0} new`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run failed');
    }
  };

  const runAll = async () => {
    if ((sourcesQ.data?.length ?? 0) === 0) {
      toast.warning('No scrapers registered yet — hit "Seed sources" first.');
      return;
    }
    try {
      const res = await run.mutateAsync({ scraper_key: 'all' });
      const ok = res.jobs.filter((j) => j.status === 'completed').length;
      const failed = res.jobs.filter((j) => j.status === 'failed').length;
      toast.success(`Ran ${res.ran} sources — ${ok} ok, ${failed} failed`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run-all failed');
    }
  };

  const seedSources = async () => {
    try {
      const res = await seed.mutateAsync();
      toast.success(`Seeded ${res.seeded} scrapers — ready to run`);
    } catch (e) {
      const needs = (e as Error & { needs?: string[] }).needs;
      if (needs?.includes('migration')) {
        toast.error('Migration not applied. Apply 20260618220000_aeso_hub_scraping_orchestrator.sql once, then try again.', { duration: 10000 });
      } else {
        toast.error(e instanceof Error ? e.message : 'Seed failed');
      }
    }
  };

  const sourcesEmpty = !sourcesQ.isLoading && (sourcesQ.data?.length ?? 0) === 0;
  const items = useMemo(() => itemsQ.data ?? [], [itemsQ.data]);

  // Headline analytics across all finds.
  const stats = useMemo(() => {
    const bySource = { 'gem-listings': 0, 'industrial-news': 0, 'osm-discovery': 0 } as Record<RecentScrapeItem['source'], number>;
    const byRegion: Record<string, number> = {};
    const bySignal: Record<string, number> = {};
    let last24h = 0;
    const dayAgo = Date.now() - 86400000;
    for (const it of items) {
      bySource[it.source] = (bySource[it.source] ?? 0) + 1;
      if (it.region) byRegion[it.region] = (byRegion[it.region] ?? 0) + 1;
      for (const s of it.signals ?? []) bySignal[s] = (bySignal[s] ?? 0) + 1;
      if (new Date(it.at).getTime() >= dayAgo) last24h++;
    }
    const topSignals = Object.entries(bySignal).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { total: items.length, bySource, byRegion, topSignals, last24h };
  }, [items]);

  return (
    <div className="space-y-6">
      <Header runAll={runAll} runAllPending={run.isPending} sourceCount={sourcesQ.data?.length ?? 0} />

      {sourcesEmpty && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">No scrapers registered yet</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                Click <strong>Seed sources</strong> to register the five canonical scrapers. Idempotent — safe to re-run.
              </p>
            </div>
            <Button onClick={seedSources} disabled={seed.isPending}>
              {seed.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Seed sources
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats band — always visible */}
      <StatsBand stats={stats} sourceCount={sourcesQ.data?.length ?? 0}
        activeRunning={runningKeys.size} loading={itemsQ.isLoading} />

      <Tabs defaultValue="finds" className="w-full">
        <TabsList>
          <TabsTrigger value="finds"><Search className="w-4 h-4 mr-2" />Finds<Badge variant="secondary" className="ml-2 text-[10px]">{stats.total}</Badge></TabsTrigger>
          <TabsTrigger value="sources"><Radar className="w-4 h-4 mr-2" />Sources<Badge variant="secondary" className="ml-2 text-[10px]">{sourcesQ.data?.length ?? 0}</Badge></TabsTrigger>
          <TabsTrigger value="runs"><RefreshCw className="w-4 h-4 mr-2" />Runs<Badge variant="secondary" className="ml-2 text-[10px]">{jobsQ.data?.length ?? 0}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="finds" className="mt-4">
          <FindsExplorer items={items} loading={itemsQ.isLoading} onRefresh={() => itemsQ.refetch()} />
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sourcesQ.isLoading && Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="py-6"><div className="h-24 bg-muted/50 animate-pulse rounded" /></CardContent></Card>
            ))}
            {sourcesQ.data?.map((s) => (
              <SourceCard key={s.id} source={s} latest={latestByKey.get(s.scraper_key)}
                running={runningKeys.has(s.scraper_key)} onRun={() => runOne(s.scraper_key)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="runs" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Run history</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => jobsQ.refetch()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <RunHistory jobs={jobsQ.data ?? []} loading={jobsQ.isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Header({ runAll, runAllPending, sourceCount }: {
  runAll: () => void; runAllPending: boolean; sourceCount: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scraping</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Every data source feeding Hidden Gems and the registry — properties, closure news,
          OSM discovery, satellite NDVI, and the coordinate refiner. Browse, filter, and export
          everything scraped; every run is tracked with errors visible.
        </p>
      </div>
      <Button onClick={runAll} disabled={runAllPending}>
        {runAllPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
        Run all active sources
        <Badge variant="secondary" className="ml-2 text-[10px] font-normal">{sourceCount}</Badge>
      </Button>
    </div>
  );
}

type Stats = {
  total: number;
  bySource: Record<RecentScrapeItem['source'], number>;
  byRegion: Record<string, number>;
  topSignals: [string, number][];
  last24h: number;
};

function StatsBand({ stats, sourceCount, activeRunning, loading }: {
  stats: Stats; sourceCount: number; activeRunning: number; loading: boolean;
}) {
  const kpis = [
    { label: 'Total finds', value: stats.total },
    { label: 'New (24h)', value: stats.last24h },
    { label: 'Active sources', value: sourceCount },
    { label: 'Running now', value: activeRunning },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border/60">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card p-4">
            <div className="text-2xl font-bold tabular-nums">{loading ? '—' : k.value.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      {stats.topSignals.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-widest mr-1">Top signals</span>
          {stats.topSignals.map(([sig, n]) => (
            <Badge key={sig} variant="secondary" className="text-[10px]">
              {sig.replace(/_/g, ' ')} <span className="ml-1 tabular-nums opacity-70">{n}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Finds explorer ───────────────────────────────────────────────────────────

type SortKey = 'recent' | 'oldest' | 'title';

function toCsv(rows: RecentScrapeItem[]): string {
  const header = ['source', 'title', 'detail', 'region', 'signals', 'url', 'scraped_at'];
  const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""').replace(/\s+/g, ' ').trim()}"`;
  const lines = rows.map((r) => [
    r.source, r.title ?? '', r.detail ?? '', r.region ?? '',
    (r.signals ?? []).join('; '), r.url ?? '', r.at,
  ].map((v) => esc(String(v))).join(','));
  return [header.join(','), ...lines].join('\n');
}

function FindsExplorer({ items, loading, onRefresh }: {
  items: RecentScrapeItem[]; loading: boolean; onRefresh: () => void;
}) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | RecentScrapeItem['source']>('all');
  const [region, setRegion] = useState<string>('all');
  const [signal, setSignal] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('recent');

  const regions = useMemo(
    () => Array.from(new Set(items.map((i) => i.region).filter(Boolean))) as string[],
    [items],
  );
  const signals = useMemo(
    () => Array.from(new Set(items.flatMap((i) => i.signals ?? []))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter((it) => {
      if (source !== 'all' && it.source !== source) return false;
      if (region !== 'all' && it.region !== region) return false;
      if (signal !== 'all' && !(it.signals ?? []).includes(signal)) return false;
      if (q && !(`${it.title} ${it.detail ?? ''}`.toLowerCase().includes(q))) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === 'title') return (a.title ?? '').localeCompare(b.title ?? '');
      const ta = new Date(a.at).getTime(); const tb = new Date(b.at).getTime();
      return sort === 'oldest' ? ta - tb : tb - ta;
    });
    return out;
  }, [items, query, source, region, signal, sort]);

  const hasFilters = query || source !== 'all' || region !== 'all' || signal !== 'all';
  const clearFilters = () => { setQuery(''); setSource('all'); setRegion('all'); setSignal('all'); };

  const exportCsv = () => {
    if (filtered.length === 0) { toast.warning('Nothing to export'); return; }
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wattbyte-scrape-finds-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or detail…" className="pl-9 h-9" />
          </div>
          <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="gem-listings">Property</SelectItem>
              <SelectItem value="industrial-news">News</SelectItem>
              <SelectItem value="osm-discovery">OSM site</SelectItem>
            </SelectContent>
          </Select>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={signal} onValueChange={setSignal}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Signal" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Any signal</SelectItem>
              {signals.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title A→Z</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button size="sm" variant="ghost" className="h-9" onClick={clearFilters}>
              <X className="w-3.5 h-3.5 mr-1" />Clear
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">{filtered.length} of {items.length}</span>
            <Button size="sm" variant="outline" className="h-9" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="w-3.5 h-3.5 mr-1.5" />CSV
            </Button>
            <Button size="sm" variant="ghost" className="h-9" onClick={onRefresh}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Nothing scraped yet. Run a source from the <strong>Sources</strong> tab to populate this.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No finds match these filters.</div>
        ) : (
          <div className="max-h-[640px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[110px]">Source</TableHead>
                  <TableHead>Title / detail</TableHead>
                  <TableHead className="w-[70px]">Region</TableHead>
                  <TableHead className="w-[200px]">Signals</TableHead>
                  <TableHead className="w-[90px] text-right">Found</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((it) => {
                  const Icon = SOURCE_ICON[it.source];
                  return (
                    <TableRow key={`${it.source}-${it.id}`}>
                      <TableCell className="align-top">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Icon className="w-3 h-3" />{SOURCE_LABEL[it.source]}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium text-sm leading-snug">
                          {it.url
                            ? <a href={it.url} target="_blank" rel="noreferrer"
                                 className="text-primary hover:underline inline-flex items-start gap-1">
                                <span className="line-clamp-1">{it.title}</span>
                                <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                              </a>
                            : <span className="line-clamp-1">{it.title}</span>}
                        </div>
                        {it.detail && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{it.detail}</p>}
                      </TableCell>
                      <TableCell className="align-top">
                        {it.region && <Badge variant="outline" className="text-[10px]">{it.region}</Badge>}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1">
                          {(it.signals ?? []).slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s.replace(/_/g, ' ')}</Badge>
                          ))}
                          {(it.signals?.length ?? 0) > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{it.signals!.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatDistanceToNow(new Date(it.at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Source card ────────────────────────────────────────────────────────────────

function SourceCard({ source, latest, running, onRun }: {
  source: ScrapingSource; latest?: ScrapingJob; running: boolean; onRun: () => void;
}) {
  const Icon = TYPE_ICON[source.type] ?? Radar;
  const needsSecrets = (source.required_secrets?.length ?? 0) > 0;
  const lastRun = latest?.started_at ?? source.last_run;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm leading-tight">{source.name}</CardTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[source.type]}</Badge>
              <Badge variant="outline" className={`text-[10px] ${
                source.status === 'error' ? 'border-rose-500/40 text-rose-600' : 'border-emerald-500/40 text-emerald-700'
              }`}>{source.status}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pb-4">
        {source.description && <p className="text-xs text-muted-foreground line-clamp-3">{source.description}</p>}
        <div className="text-xs text-muted-foreground space-y-0.5">
          {lastRun ? <div>Last run: {formatDistanceToNow(new Date(lastRun), { addSuffix: true })}</div> : <div>Never run</div>}
          {latest && latest.status !== 'running' && (
            <div className="tabular-nums">
              {latest.items_found ?? 0} found · <span className="text-emerald-700">{latest.items_new ?? 0} new</span>
              {latest.status === 'failed' && <span className="text-rose-600"> · failed</span>}
            </div>
          )}
          {latest?.errors && latest.errors.length > 0 && (
            <div className="text-rose-600 text-[11px] truncate" title={latest.errors.join('\n')}>⚠ {latest.errors[0]}</div>
          )}
        </div>
        {needsSecrets && (
          <div className="text-[11px] text-amber-700 bg-amber-500/5 border border-amber-500/20 rounded p-1.5 flex items-start gap-1.5">
            <Key className="w-3 h-3 mt-0.5 shrink-0" />
            <span>Requires <span className="font-mono">{source.required_secrets!.join(', ')}</span> in Supabase secrets.</span>
          </div>
        )}
        <div className="mt-auto pt-1">
          <Button size="sm" className="w-full" onClick={onRun} disabled={running}>
            {running ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Running</> : <><Play className="w-3.5 h-3.5 mr-1.5" />Run now</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RunHistory({ jobs, loading }: { jobs: ScrapingJob[]; loading: boolean }) {
  if (loading) return <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (jobs.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        No runs yet. Use <strong>Run now</strong> on any source to start one.
      </div>
    );
  }
  return (
    <div className="divide-y divide-border">
      {jobs.map((j) => {
        const dur = j.completed_at && j.started_at
          ? `${Math.max(0, Math.round((new Date(j.completed_at).getTime() - new Date(j.started_at).getTime()) / 1000))}s`
          : '—';
        return (
          <div key={j.id} className="px-5 py-3 flex items-start gap-3">
            <StatusDot status={j.status} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                <span className="truncate">{j.source_name}</span>
                <code className="text-[10px] text-muted-foreground font-mono">{j.scraper_key}</code>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {formatDistanceToNow(new Date(j.started_at), { addSuffix: true })} · {dur}
                {j.status !== 'running' && (
                  <> · <span>{j.items_found ?? 0} found</span> · <span className="text-emerald-700">{j.items_new ?? 0} new</span></>
                )}
              </div>
              {j.errors && j.errors.length > 0 && (
                <details className="mt-1.5">
                  <summary className="text-[11px] text-rose-600 cursor-pointer flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{j.errors.length} error{j.errors.length === 1 ? '' : 's'}
                  </summary>
                  <ul className="mt-1 ml-4 text-[11px] text-muted-foreground list-disc space-y-0.5">
                    {j.errors.slice(0, 5).map((e, i) => <li key={i} className="break-words">{e}</li>)}
                    {j.errors.length > 5 && <li className="italic">…{j.errors.length - 5} more</li>}
                  </ul>
                </details>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDot({ status }: { status: ScrapingJob['status'] }) {
  if (status === 'running') return <Loader2 className="w-4 h-4 mt-1 text-primary animate-spin shrink-0" />;
  if (status === 'failed') return <FileWarning className="w-4 h-4 mt-1 text-rose-600 shrink-0" />;
  return <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-600 shrink-0" />;
}
