import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle, Building2, CheckCircle2, ExternalLink, FileWarning, Globe2,
  Key, Loader2, Newspaper, Play, RefreshCw, Radar, Satellite, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles as SparklesIcon } from 'lucide-react';
import {
  useScrapingSources, useScrapingJobs, useRunScraper, useSeedScrapers, useRecentScrapeItems,
  type ScrapingSource, type ScrapingJob, type RecentScrapeItem,
} from '@/hooks/useScraping';

// AESO Hub > Scraping. One screen to:
//   * see every data-collection source we've built (properties, news, OSM
//     discovery, satellite activity, geocoder), with last-run + secret
//     status,
//   * trigger a run with one click,
//   * watch the run finish (the jobs query auto-polls while anything is
//     running),
//   * skim recent finds across every source.

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

export function ScrapingTab() {
  const sourcesQ = useScrapingSources();
  const jobsQ = useScrapingJobs(30);
  const itemsQ = useRecentScrapeItems(12);
  const run = useRunScraper();
  const seed = useSeedScrapers();

  // Index running jobs by scraper_key so the source cards know to disable.
  const runningKeys = useMemo(
    () => new Set((jobsQ.data ?? []).filter((j) => j.status === 'running').map((j) => j.scraper_key ?? '')),
    [jobsQ.data],
  );

  // Latest job per scraper_key for the "last run" summary on each card.
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
      if (!job) {
        toast.warning('No job row returned — check console');
        return;
      }
      const failed = job.status === 'failed';
      const summary = job.status === 'running'
        ? 'Running…'
        : `${job.items_found ?? 0} found · ${job.items_new ?? 0} new`;
      if (failed) toast.error(`${scraperKey} failed: ${job.errors?.[0] ?? 'unknown error'}`);
      else toast.success(`${scraperKey}: ${summary}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run failed');
    }
  };

  const runAll = async () => {
    if ((sourcesQ.data?.length ?? 0) === 0) {
      toast.warning(
        'No scrapers registered yet — hit "Seed sources" above to register them.',
      );
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
        toast.error(
          'Migration not applied. Apply ' +
          '20260618220000_aeso_hub_scraping_orchestrator.sql once, then try again.',
          { duration: 10000 },
        );
      } else {
        toast.error(e instanceof Error ? e.message : 'Seed failed');
      }
    }
  };

  const sourcesEmpty = !sourcesQ.isLoading && (sourcesQ.data?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <Header runAll={runAll} runAllPending={run.isPending} sourcesQ={sourcesQ.data?.length ?? 0} />

      {/* Setup-required panel when no sources exist (migration applied but
          seed never ran, or first-time bootstrap on a fresh project). */}
      {sourcesEmpty && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">No scrapers registered yet</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                Click <strong>Seed sources</strong> to register the five canonical
                scrapers (properties, news, OSM discovery, satellite NDVI, coordinate
                refiner). This is idempotent — safe to re-run any time.
              </p>
            </div>
            <Button onClick={seedSources} disabled={seed.isPending}>
              {seed.isPending
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <SparklesIcon className="w-4 h-4 mr-2" />}
              Seed sources
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sourcesQ.isLoading && Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}><CardContent className="py-6"><div className="h-24 bg-muted/50 animate-pulse rounded" /></CardContent></Card>
        ))}
        {sourcesQ.data?.map((s) => (
          <SourceCard
            key={s.id}
            source={s}
            latest={latestByKey.get(s.scraper_key)}
            running={runningKeys.has(s.scraper_key)}
            onRun={() => runOne(s.scraper_key)}
          />
        ))}
      </div>

      {/* Run history + Recent finds */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent runs</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => jobsQ.refetch()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <RunHistory jobs={jobsQ.data ?? []} loading={jobsQ.isLoading} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent finds</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => itemsQ.refetch()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <RecentFinds items={itemsQ.data ?? []} loading={itemsQ.isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Header({ runAll, runAllPending, sourcesQ }: {
  runAll: () => void; runAllPending: boolean; sourcesQ: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scraping</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          One screen for every data source feeding Hidden Gems and the registry — properties,
          industrial closure news, OSM site discovery, satellite NDVI, and the coordinate
          refiner. Every run is tracked with errors visible; only sources with their secrets set
          will return live data.
        </p>
      </div>
      <Button onClick={runAll} disabled={runAllPending}>
        {runAllPending
          ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          : <Play className="w-4 h-4 mr-2" />}
        Run all active sources
        <Badge variant="secondary" className="ml-2 text-[10px] font-normal">{sourcesQ}</Badge>
      </Button>
    </div>
  );
}

function SourceCard({ source, latest, running, onRun }: {
  source: ScrapingSource;
  latest?: ScrapingJob;
  running: boolean;
  onRun: () => void;
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
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  source.status === 'error'
                    ? 'border-rose-500/40 text-rose-600'
                    : 'border-emerald-500/40 text-emerald-700'
                }`}
              >
                {source.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pb-4">
        {source.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">{source.description}</p>
        )}

        {/* Latest run + items */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          {lastRun
            ? <div>Last run: {formatDistanceToNow(new Date(lastRun), { addSuffix: true })}</div>
            : <div>Never run</div>}
          {latest && latest.status !== 'running' && (
            <div className="tabular-nums">
              {latest.items_found ?? 0} found · <span className="text-emerald-700">{latest.items_new ?? 0} new</span>
              {latest.status === 'failed' && (
                <span className="text-rose-600"> · failed</span>
              )}
            </div>
          )}
          {latest?.errors && latest.errors.length > 0 && (
            <div className="text-rose-600 text-[11px] truncate" title={latest.errors.join('\n')}>
              ⚠ {latest.errors[0]}
            </div>
          )}
        </div>

        {needsSecrets && (
          <div className="text-[11px] text-amber-700 bg-amber-500/5 border border-amber-500/20 rounded p-1.5 flex items-start gap-1.5">
            <Key className="w-3 h-3 mt-0.5 shrink-0" />
            <span>
              Requires: <span className="font-mono">{source.required_secrets!.join(', ')}</span> in
              Supabase edge-function secrets.
            </span>
          </div>
        )}

        <div className="mt-auto pt-1">
          <Button size="sm" className="w-full" onClick={onRun} disabled={running}>
            {running
              ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Running</>
              : <><Play className="w-3.5 h-3.5 mr-1.5" />Run now</>}
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
        No runs yet. Use <strong>Run now</strong> on any source above to start one.
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
                    <AlertTriangle className="w-3 h-3" />
                    {j.errors.length} error{j.errors.length === 1 ? '' : 's'}
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

function RecentFinds({ items, loading }: { items: RecentScrapeItem[]; loading: boolean }) {
  if (loading) return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nothing scraped yet. Run a source to populate this list.
      </div>
    );
  }
  return (
    <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
      {items.map((it) => {
        const Icon = SOURCE_ICON[it.source];
        return (
          <div key={`${it.source}-${it.id}`} className="text-xs border-b border-border last:border-0 pb-3 last:pb-0">
            <div className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium leading-snug">
                  {it.url
                    ? <a href={it.url} target="_blank" rel="noreferrer"
                         className="text-primary hover:underline inline-flex items-center gap-1">
                        <span className="line-clamp-2">{it.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    : <span className="line-clamp-2">{it.title}</span>}
                </div>
                {it.detail && (
                  <p className="text-muted-foreground line-clamp-2 mt-0.5">{it.detail}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <Badge variant="outline" className="text-[9px] font-mono">{it.source}</Badge>
                  {it.region && <Badge variant="outline" className="text-[9px]">{it.region}</Badge>}
                  {(it.signals ?? []).slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                      {s.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {formatDistanceToNow(new Date(it.at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDot({ status }: { status: ScrapingJob['status'] }) {
  if (status === 'running') {
    return <Loader2 className="w-4 h-4 mt-1 text-primary animate-spin shrink-0" />;
  }
  if (status === 'failed') {
    return <FileWarning className="w-4 h-4 mt-1 text-rose-600 shrink-0" />;
  }
  return <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-600 shrink-0" />;
}
