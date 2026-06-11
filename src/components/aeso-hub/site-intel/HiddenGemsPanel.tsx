import { lazy, Suspense, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Gem, Loader2, ChevronDown, ChevronUp, ExternalLink, FileSearch, AlertTriangle,
  List, Boxes, Radar, Globe2,
} from 'lucide-react';
import { useHiddenGems, useGemListings } from '@/hooks/useHiddenGems';
import type { ScoredGem } from '@/lib/hidden-gems';
import { toast } from 'sonner';

// three.js scene is heavy — load it only when the user opens the 3D view.
const HiddenGems3D = lazy(() => import('./HiddenGems3D'));

const STATUS_OPTIONS = [
  'closed', 'announced_closure', 'for_sale', 'idle', 'curtailed', 'unknown', 'operating',
] as const;

const GRADE_TONE: Record<ScoredGem['grade'], string> = {
  A: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  B: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
  C: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  D: 'bg-muted text-muted-foreground border-border',
};

const CONFIDENCE_TONE: Record<ScoredGem['confidence'], string> = {
  high: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-red-600 dark:text-red-400',
};

interface Props {
  /** Open the full Site Intelligence report for a candidate. */
  onAnalyze: (loc: { lat: number; lng: number; label?: string }) => void;
  analyzing?: boolean;
}

export function HiddenGemsPanel({ onAnalyze, analyzing }: Props) {
  const [minMw, setMinMw] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [state, setState] = useState<string>('all');
  const [view, setView] = useState<'list' | '3d'>('list');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filters = useMemo(() => ({
    minMw: minMw ? Number(minMw) : undefined,
    statuses: status === 'all' ? undefined : [status],
    states: state === 'all' ? undefined : [state],
  }), [minMw, status, state]);

  const { gems, ctxByState, totalFacilities, isLoading, error } = useHiddenGems(filters);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gem className="w-4 h-4 text-primary" />
              Hidden Gems — power-intensive industrial registry
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {totalFacilities} facilities tracked (AB + TX) · ranked deterministically, no synthetic scores
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Idle or distressed plants whose existing grid interconnection is the asset — electrolysis
            chemicals, EAF steel, mechanical pulp, cement, LNG e-drive, fabs. Every score factor cites
            its evidence; MW estimates use a documented per-industry intensity model, never defaults.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 pt-0">
          <div className="space-y-1">
            <Label className="text-xs">Region</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">AB + TX</SelectItem>
                <SelectItem value="AB">Alberta</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Min estimated MW</Label>
            <Input
              type="number" min={0} placeholder="e.g. 25" value={minMw}
              onChange={(e) => setMinMw(e.target.value)} className="h-8 w-32"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant={view === 'list' ? 'default' : 'outline'} className="h-8 text-xs"
              onClick={() => setView('list')}>
              <List className="w-3.5 h-3.5 mr-1" /> List
            </Button>
            <Button size="sm" variant={view === '3d' ? 'default' : 'outline'} className="h-8 text-xs"
              onClick={() => setView('3d')}>
              <Boxes className="w-3.5 h-3.5 mr-1" /> 3D Map
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30">
          <CardContent className="py-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error.message}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-12 flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading registry and grid layers…
          </CardContent>
        </Card>
      ) : view === '3d' ? (
        <Suspense fallback={
          <Card><CardContent className="py-12 flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading 3D scene…
          </CardContent></Card>
        }>
          {ctxByState && (
            <HiddenGems3D gems={gems} ctxByState={ctxByState} onAnalyze={onAnalyze} />
          )}
        </Suspense>
      ) : (
        <div className="space-y-2">
          {gems.map((g) => (
            <GemRow
              key={g.facility.id}
              gem={g}
              expanded={expanded === g.facility.id}
              onToggle={() => setExpanded(expanded === g.facility.id ? null : g.facility.id)}
              onAnalyze={onAnalyze}
              analyzing={analyzing}
            />
          ))}
          {gems.length === 0 && !error && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No facilities match these filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ListingSignals />
    </div>
  );
}

// ── Scraped listing signals ──────────────────────────────────────────────────

function ListingSignals() {
  const { listings, isLoading, scan } = useGemListings();

  const runScan = async (region: 'alberta' | 'texas' | 'both') => {
    try {
      const res = await scan.mutateAsync(region);
      toast.success(
        `Scan complete: ${res.listings_stored} signal listings stored from ${res.results_scanned} results`,
        res.errors?.length ? { description: `${res.errors.length} query error(s) — see console` } : undefined,
      );
      if (res.errors?.length) console.warn('gem-listing-scanner errors:', res.errors);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Listing scan failed');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Radar className="w-4 h-4 text-primary" />
            For-sale signals — scraped listings
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs"
              disabled={scan.isPending} onClick={() => runScan('both')}>
              {scan.isPending
                ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                : <Globe2 className="w-3 h-3 mr-1" />}
              Scan AB + TX now
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Live Firecrawl search of commercial listings for gem keywords (substation, MW/MVA quoted,
          former plant, transmission, rail). Only listings with at least one matched signal are kept,
          each with its source URL and the query that found it. If the scraper key isn't configured the
          scan fails loudly — placeholder listings are never shown.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading stored listings…
          </div>
        ) : listings.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No scraped listings yet — run a scan to search current listings.
          </p>
        ) : (
          <div className="space-y-2">
            {listings.map((l) => (
              <div key={l.id} className="flex items-start gap-3 text-xs border-b border-border last:border-0 pb-2 last:pb-0">
                <Badge variant="outline" className="font-mono tabular-nums shrink-0 mt-0.5">
                  {l.signal_score}
                </Badge>
                <div className="min-w-0 flex-1">
                  <a href={l.listing_url} target="_blank" rel="noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1">
                    <span className="truncate">{l.title ?? l.listing_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  {l.description_excerpt && (
                    <p className="text-muted-foreground line-clamp-2 mt-0.5">{l.description_excerpt}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {l.gem_signals.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                        {s.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {l.state && <Badge variant="outline" className="text-[9px] px-1.5 py-0">{l.state}</Badge>}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      via "{l.search_query}" · {new Date(l.scraped_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Registry row ─────────────────────────────────────────────────────────────

function GemRow({
  gem: g, expanded, onToggle, onAnalyze, analyzing,
}: {
  gem: ScoredGem;
  expanded: boolean;
  onToggle: () => void;
  onAnalyze: Props['onAnalyze'];
  analyzing?: boolean;
}) {
  const f = g.facility;
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className={`text-xs font-bold ${GRADE_TONE[g.grade]}`}>
            {g.total} · {g.grade}
          </Badge>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{f.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {f.operator ?? '—'} · {f.facility_type.replace(/_/g, ' ')} · {f.municipality ?? '—'} · {f.state ?? 'AB'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold tabular-nums">
              {g.derivedMw != null ? `≈${g.derivedMw} MW` : 'MW n/a'}
            </div>
            <div className={`text-[10px] uppercase ${CONFIDENCE_TONE[g.confidence]}`}>
              {g.confidence} confidence
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {f.status.replace(/_/g, ' ')}
          </Badge>
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={analyzing}
            onClick={() => onAnalyze({ lat: f.lat, lng: f.lng, label: f.name })}>
            <FileSearch className="w-3 h-3 mr-1" /> Full report
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onToggle}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {g.factors.map((factor) => (
                <div key={factor.key} className="text-xs flex items-start gap-2">
                  <span className="font-mono tabular-nums w-14 shrink-0 text-right">
                    {factor.score}/{factor.max}
                  </span>
                  <span>
                    <span className="font-medium">{factor.key.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground"> — {factor.detail}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <span>
                Coords: {f.lat.toFixed(3)}, {f.lng.toFixed(3)} ({f.coordinates_precision})
              </span>
              {f.naics_code && <span>NAICS {f.naics_code}</span>}
              {f.capacity_value != null && (
                <span>Capacity {f.capacity_value.toLocaleString()} {f.capacity_unit}</span>
              )}
              {f.source_url && (
                <a href={f.source_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline">
                  {f.source_publisher ?? 'Source'} <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {f.last_verified
                ? <span>Verified {f.last_verified}</span>
                : <span className="text-amber-600 dark:text-amber-400">Seeded — not yet re-verified</span>}
            </div>
            {f.notes && <p className="text-[11px] text-muted-foreground italic">{f.notes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
