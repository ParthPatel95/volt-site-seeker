import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
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
  List, Boxes, Radar, Globe2, Bookmark, BookmarkCheck, LocateFixed, BadgeCheck,
} from 'lucide-react';
import {
  useHiddenGems, useGemListings, useGemWatchlist, useFacilityRefine,
  type GemListing,
} from '@/hooks/useHiddenGems';
import { computeDistressScore, type ScoredGem } from '@/lib/hidden-gems';
import { INDUSTRY_DIRECTORY, INDUSTRY_BY_KEY } from '@/lib/industries';
import { toast } from 'sonner';
import { GemDetailDialog } from './GemDetailDialog';

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
  /** Pre-filter to a single facility_type when arriving from the Industries directory. */
  initialIndustry?: string | null;
  /** Notify parent when the user changes the industry filter from inside the panel. */
  onIndustryChange?: (industryKey: string | null) => void;
}

type Watchlist = ReturnType<typeof useGemWatchlist>;
type SortKey = 'gem_score' | 'distress' | 'mw';

export function HiddenGemsPanel({
  onAnalyze, analyzing, initialIndustry, onIndustryChange,
}: Props) {
  const [minMw, setMinMw] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [state, setState] = useState<string>('all');
  const [industry, setIndustry] = useState<string>(initialIndustry ?? 'all');
  const [sortBy, setSortBy] = useState<SortKey>('gem_score');
  // Full report click opens this detail dialog first; the dialog has the
  // route into Site Lookup (with an optional refine-then-open path that
  // fixes the locality-coords problem before analysis).
  const [detailGem, setDetailGem] = useState<ScoredGem | null>(null);

  const openDetail = (gem: ScoredGem) => setDetailGem(gem);
  const handleOpenInSiteLookup = (loc: { lat: number; lng: number; label?: string }) => {
    setDetailGem(null);
    onAnalyze(loc);
  };
  const [view, setView] = useState<'list' | '3d' | 'saved'>('list');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filters = useMemo(() => ({
    minMw: minMw ? Number(minMw) : undefined,
    statuses: status === 'all' ? undefined : [status],
    states: state === 'all' ? undefined : [state],
    facilityTypes: industry === 'all' ? undefined : [industry],
  }), [minMw, status, state, industry]);

  const { gems: gemsRaw, ctxByState, totalFacilities, isLoading, error } = useHiddenGems(filters);

  // Notify parent when industry changes, and absorb the prop on prop change
  // (so jumping back into Industries → Site Intel with a different industry
  // updates the filter rather than being stuck on the first value).
  useEffect(() => {
    onIndustryChange?.(industry === 'all' ? null : industry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry]);
  useEffect(() => {
    if (initialIndustry && initialIndustry !== industry) setIndustry(initialIndustry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndustry]);

  // Attach distress + sort. Distress is always present on every facility row;
  // the user picks the sort key explicitly so we never quietly re-rank.
  const gems = useMemo(() => {
    const withDistress = gemsRaw.map((g) => ({
      ...g,
      distress: computeDistressScore(g.facility),
    }));
    return withDistress.sort((a, b) => {
      if (sortBy === 'distress') return b.distress.score - a.distress.score;
      if (sortBy === 'mw') return (b.derivedMw ?? 0) - (a.derivedMw ?? 0);
      return b.total - a.total; // gem_score
    });
  }, [gemsRaw, sortBy]);
  const watchlist = useGemWatchlist();
  const refine = useFacilityRefine();
  const gemListings = useGemListings();

  const runRefineAll = async () => {
    try {
      const res = await refine.mutateAsync({ all_unverified: true, limit: 25 });
      const failed = res.results.filter((r) => !r.refined || r.error);
      toast.success(`Refined ${res.refined} facilities via Places + parcel snap + live OSM`, {
        description: !res.google_key_present
          ? 'GOOGLE_MAPS_API_KEY not set — only OSM grid checks ran'
          : failed.length ? `${failed.length} need review — see console` : undefined,
      });
      if (failed.length) console.warn('facility-refine issues:', failed);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refine failed');
    }
  };

  const savedCount = watchlist.entries.length;

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
            Idle or distressed plants whose existing grid interconnection is the asset. Every score factor
            cites its evidence; "Refine" replaces seeded coordinates with Google-geocoded locations and
            live OSM substation measurements.
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
          <div className="space-y-1">
            <Label className="text-xs">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">All industries</SelectItem>
                {INDUSTRY_DIRECTORY.map((i) => (
                  <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sort by</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gem_score">Gem score (default)</SelectItem>
                <SelectItem value="distress">Distress signal</SelectItem>
                <SelectItem value="mw">Estimated MW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs"
            disabled={refine.isPending} onClick={runRefineAll}>
            {refine.isPending
              ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              : <LocateFixed className="w-3.5 h-3.5 mr-1" />}
            Refine unverified
          </Button>
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant={view === 'list' ? 'default' : 'outline'} className="h-8 text-xs"
              onClick={() => setView('list')}>
              <List className="w-3.5 h-3.5 mr-1" /> List
            </Button>
            <Button size="sm" variant={view === '3d' ? 'default' : 'outline'} className="h-8 text-xs"
              onClick={() => setView('3d')}>
              <Boxes className="w-3.5 h-3.5 mr-1" /> 3D Map
            </Button>
            <Button size="sm" variant={view === 'saved' ? 'default' : 'outline'} className="h-8 text-xs"
              onClick={() => setView('saved')}>
              <Bookmark className="w-3.5 h-3.5 mr-1" /> Saved{savedCount > 0 ? ` (${savedCount})` : ''}
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
      ) : view === 'saved' ? (
        <SavedView
          gems={gems}
          listings={gemListings.listings}
          watchlist={watchlist}
          onOpenDetail={openDetail}
          analyzing={analyzing}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      ) : (
        <div className="space-y-2">
          {gems.map((g) => (
            <GemRow
              key={g.facility.id}
              gem={g}
              expanded={expanded === g.facility.id}
              onToggle={() => setExpanded(expanded === g.facility.id ? null : g.facility.id)}
              onOpenDetail={openDetail}
              analyzing={analyzing}
              watchlist={watchlist}
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

      {view !== 'saved' && <ListingSignals listingsApi={gemListings} watchlist={watchlist} />}

      <GemDetailDialog
        gem={detailGem}
        open={detailGem !== null}
        onOpenChange={(open) => { if (!open) setDetailGem(null); }}
        onOpenInSiteLookup={handleOpenInSiteLookup}
      />
    </div>
  );
}

// ── Saved view ───────────────────────────────────────────────────────────────

function SavedView({
  gems, listings, watchlist, onOpenDetail, analyzing, expanded, setExpanded,
}: {
  gems: ScoredGem[];
  listings: GemListing[];
  watchlist: Watchlist;
  onOpenDetail: (gem: ScoredGem) => void;
  analyzing?: boolean;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  const savedFacilities = gems.filter((g) => watchlist.isSaved('facility', g.facility.id));
  const savedListings = listings.filter((l) => watchlist.isSaved('listing', l.id));

  if (watchlist.entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nothing saved yet — use the <Bookmark className="w-3.5 h-3.5 inline mx-1" /> button on any
          facility or scraped listing to build your watchlist.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {savedFacilities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            Saved facilities ({savedFacilities.length})
          </h3>
          {savedFacilities.map((g) => (
            <GemRow
              key={g.facility.id}
              gem={g}
              expanded={expanded === g.facility.id}
              onToggle={() => setExpanded(expanded === g.facility.id ? null : g.facility.id)}
              onOpenDetail={onOpenDetail}
              analyzing={analyzing}
              watchlist={watchlist}
            />
          ))}
        </div>
      )}
      {savedListings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            Saved listings ({savedListings.length})
          </h3>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {savedListings.map((l) => (
                  <ListingRow key={l.id} listing={l} watchlist={watchlist} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {savedFacilities.length === 0 && savedListings.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Saved items exist but aren't in the current dataset (check filters or rescan listings).
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Save button ──────────────────────────────────────────────────────────────

function SaveButton({
  watchlist, type, id,
}: {
  watchlist: Watchlist;
  type: 'facility' | 'listing';
  id: string;
}) {
  const saved = watchlist.isSaved(type, id);
  return (
    <Button
      size="sm" variant="ghost" className="h-7 w-7 p-0"
      title={saved ? 'Remove from saved' : 'Save for later'}
      disabled={watchlist.toggle.isPending}
      onClick={async () => {
        try {
          const res = await watchlist.toggle.mutateAsync({ type, id });
          toast.success(res.saved ? 'Saved to watchlist' : 'Removed from watchlist');
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Could not update watchlist');
        }
      }}
    >
      {saved
        ? <BookmarkCheck className="w-4 h-4 text-primary" />
        : <Bookmark className="w-4 h-4" />}
    </Button>
  );
}

// ── Scraped listing signals ──────────────────────────────────────────────────

function ListingRow({ listing: l, watchlist }: { listing: GemListing; watchlist: Watchlist }) {
  return (
    <div className="flex items-start gap-3 text-xs border-b border-border last:border-0 pb-2 last:pb-0">
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
      <SaveButton watchlist={watchlist} type="listing" id={l.id} />
    </div>
  );
}

function ListingSignals({
  listingsApi, watchlist,
}: {
  listingsApi: ReturnType<typeof useGemListings>;
  watchlist: Watchlist;
}) {
  const { listings, isLoading, scan } = listingsApi;

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
          each with its source URL and the query that found it. Save any listing to your watchlist with
          the bookmark button.
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
              <ListingRow key={l.id} listing={l} watchlist={watchlist} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Registry row ─────────────────────────────────────────────────────────────

function GemRow({
  gem: g, expanded, onToggle, onOpenDetail, analyzing, watchlist,
}: {
  gem: ScoredGem;
  expanded: boolean;
  onToggle: () => void;
  onOpenDetail: (gem: ScoredGem) => void;
  analyzing?: boolean;
  watchlist: Watchlist;
}) {
  const f = g.facility;
  const refine = useFacilityRefine();
  const distress = useMemo(() => computeDistressScore(f), [f]);
  const industryLabel = INDUSTRY_BY_KEY[f.facility_type]?.label ?? f.facility_type.replace(/_/g, ' ');
  // Coordinates the user can trust: 'site' (Places ROOFTOP) and 'parcel'
  // (snapped to an OSM industrial polygon). 'locality' is the town-centre
  // bug, 'unverified' means we couldn't refine at all.
  const trustedCoords = f.coordinates_precision === 'site' || f.coordinates_precision === 'parcel';

  const runRefine = async () => {
    try {
      const res = await refine.mutateAsync({ facility_id: f.id });
      const r = res.results[0];
      if (r?.refined) {
        const provider = r.provider?.replace(/_/g, ' ') ?? 'provider';
        toast.success(`Coords refined via ${provider} → ${r.precision}, moved ${r.moved_km} km`, {
          description: typeof r.osm_substation_km === 'number'
            ? `OSM: nearest substation ${r.osm_substation_km.toFixed(1)} km${r.osm_max_voltage_kv ? `, up to ${r.osm_max_voltage_kv} kV` : ''}`
            : undefined,
        });
      } else if (r?.needs?.includes('google_key')) {
        toast.error('Set GOOGLE_MAPS_API_KEY on the edge function to refine coordinates');
      } else {
        toast.error(r?.error ?? 'Refine produced no updates');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refine failed');
    }
  };

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className={`text-xs font-bold ${GRADE_TONE[g.grade]}`}>
            {g.total} · {g.grade}
          </Badge>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate flex items-center gap-1.5">
              {f.name}
              {trustedCoords && (
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-label="Coordinates verified" />
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {f.operator ?? '—'} · {industryLabel} · {f.municipality ?? '—'} · {f.state ?? 'AB'}
            </div>
          </div>
          {/* Distress signal — partner-outreach priority */}
          {distress.band !== 'quiet' && distress.band !== 'unknown' && (
            <Badge
              variant="outline"
              className={`text-[10px] font-bold ${
                distress.band === 'severe'
                  ? 'border-rose-500/40 text-rose-600 bg-rose-500/5'
                  : distress.band === 'elevated'
                    ? 'border-amber-500/40 text-amber-700 bg-amber-500/5'
                    : 'border-sky-500/40 text-sky-700 bg-sky-500/5'
              }`}
              title={distress.factors.join(' · ')}
            >
              {distress.band === 'severe' ? '🔴' : distress.band === 'elevated' ? '🟠' : '🟡'} Distress {distress.score}
            </Badge>
          )}
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
          <SaveButton watchlist={watchlist} type="facility" id={f.id} />
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={analyzing}
            onClick={() => onOpenDetail(g)}>
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
                Coords: {f.lat.toFixed(3)}, {f.lng.toFixed(3)} ({f.coordinates_precision}
                {f.coord_provider ? ` · ${f.coord_provider.replace(/_/g, ' ')}` : ' · seeded'})
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
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs"
                disabled={refine.isPending} onClick={runRefine}>
                {refine.isPending
                  ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  : <LocateFixed className="w-3 h-3 mr-1" />}
                Refine location & grid (live)
              </Button>
              {f.osm_checked_at && (
                <span className="text-[10px] text-muted-foreground">
                  Last OSM check {f.osm_checked_at.slice(0, 10)}
                </span>
              )}
            </div>
            {f.notes && <p className="text-[11px] text-muted-foreground italic">{f.notes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
