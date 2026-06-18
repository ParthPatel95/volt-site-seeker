import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Activity, AlertTriangle, BadgeCheck, ExternalLink, FileSearch, Leaf,
  Loader2, LocateFixed, Mail, MapPin, Phone, Radar, Satellite, ShieldAlert,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ScoredGem } from '@/lib/hidden-gems';
import {
  useFacilityRefine, useFacilityActivityMonitor, useFacilityActivityObservations,
  useGemListings, type GemListing,
} from '@/hooks/useHiddenGems';

// Hidden Gems detail dialog. Single source of truth for "everything we know"
// about a facility — pulled from the registry row plus any scraped listings
// nearby. Surfaces the coordinate-provenance problem (locality vs site)
// explicitly so users don't trust town-centre coords by accident, and offers
// a one-click refine via Google geocoding before sending the candidate to
// the Site Lookup workspace.

interface Props {
  gem: ScoredGem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenInSiteLookup: (loc: { lat: number; lng: number; label?: string }) => void;
}

// Find any scraped listings whose state matches the facility — best-effort
// "have we seen this place for sale?" check until we have proper geocoded
// matching. Filter to within ~30 km of the facility when listing has coords.
function nearbyListings(facilityState: string | undefined, lat: number, lng: number, all: GemListing[]) {
  const KM_PER_DEG = 111;
  const sameState = all.filter((l) => l.state && facilityState && l.state === facilityState);
  return sameState.filter((l) => {
    if (l.lat == null || l.lng == null) return true; // include un-geocoded listings in same state
    const dLat = (l.lat - lat) * KM_PER_DEG;
    const dLng = (l.lng - lng) * KM_PER_DEG * Math.cos((lat * Math.PI) / 180);
    return Math.hypot(dLat, dLng) < 30;
  }).slice(0, 8);
}

export function GemDetailDialog({ gem, open, onOpenChange, onOpenInSiteLookup }: Props) {
  const refine = useFacilityRefine();
  const activityMon = useFacilityActivityMonitor();
  const { listings: allListings } = useGemListings();
  const [refining, setRefining] = useState(false);

  // Hook is gated on gem being non-null; declare it before the early return so
  // hook order stays stable across renders.
  const activityObs = useFacilityActivityObservations(gem?.facility.id ?? null);

  if (!gem) return null;
  const f = gem.facility;
  // Coordinate provenance: 'site' (rooftop) and 'parcel' (OSM industrial
  // polygon snap) are the trusted tiers; 'locality' is the town-centre bug
  // and 'unverified' means we couldn't refine at all.
  const precision = f.coordinates_precision;
  const trusted = precision === 'site' || precision === 'parcel';
  const localityOnly = !trusted;
  const candidates = f.coord_candidates ?? [];
  const consensusKm = f.coord_consensus_km;
  const providerDisagrees = typeof consensusKm === 'number' && consensusKm >= 2;

  const matchedListings = nearbyListings(f.state, f.lat, f.lng, allListings);

  const runRefineThenOpen = async () => {
    setRefining(true);
    try {
      const res = await refine.mutateAsync({ facility_id: f.id });
      const r = res.results[0];
      if (r?.refined) {
        const provider = r.provider?.replace(/_/g, ' ') ?? 'provider';
        toast.success(`Coords refined via ${provider} → ${r.precision}, moved ${r.moved_km} km`);
      } else if (r?.error) {
        toast.warning(`Refine notice: ${r.error}`);
      } else if (r?.needs?.includes('google_key')) {
        toast.error('Google Maps API key missing on the edge function');
      }
      // Hook invalidates the inputs query so coords are fresh on the next render;
      // pass the row's current best-known coords up for the immediate jump.
      onOpenInSiteLookup({ lat: f.lat, lng: f.lng, label: f.name });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refine failed');
    } finally {
      setRefining(false);
    }
  };

  const runActivityCheck = async () => {
    try {
      const res = await activityMon.mutateAsync({ facility_id: f.id });
      const r = res.results[0];
      if (r?.trend === 'rising_vegetation') {
        toast.warning(`Closure signal: ${r.evidence}`);
      } else if (r?.trend === 'recovering') {
        toast.info(`Mild activity drop: ${r.evidence}`);
      } else if (r?.trend === 'stable') {
        toast.success('Site appears active — no vegetation rebound');
      } else if (r?.trend === 'no_data') {
        toast.message('Not enough clear scenes to call a trend');
      } else if (r?.error) {
        toast.error(r.error);
      }
    } catch (e) {
      const needs = (e as Error & { needs?: string[] }).needs;
      if (needs?.includes('sentinel_creds')) {
        toast.error('Set SENTINEL_HUB_CLIENT_ID + SENTINEL_HUB_CLIENT_SECRET as Supabase secrets to enable closure-signal monitoring.');
      } else {
        toast.error(e instanceof Error ? e.message : 'Activity check failed');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-2xl flex items-center gap-2 flex-wrap">
                <span>{f.name}</span>
                {trusted && (
                  <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" aria-label="Location verified" />
                )}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {f.operator ?? '—'} · {f.facility_type.replace(/_/g, ' ')} · {f.municipality ?? '—'} · {f.state ?? 'AB'}
              </DialogDescription>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold">{gem.total} · {gem.grade}</div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {gem.derivedMw != null ? `≈${gem.derivedMw} MW` : 'MW n/a'}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Location provenance — multi-provider consensus, addresses the
            "wrong location" complaint with the new Places-first refiner. */}
        <div className={`rounded-lg border p-3 ${
          localityOnly
            ? 'border-amber-500/30 bg-amber-500/5'
            : providerDisagrees
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-emerald-500/30 bg-emerald-500/5'
        }`}>
          <div className="flex items-start gap-2.5">
            {trusted && !providerDisagrees
              ? <BadgeCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              : <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />}
            <div className="text-xs flex-1">
              <div className="font-medium">
                {precision === 'parcel' && 'Coordinates snapped to the OSM industrial parcel'}
                {precision === 'site' && 'Coordinates rooftop-verified by Google Places'}
                {precision === 'locality' && 'Coordinates are TOWN-CENTRE only — not the actual facility'}
                {precision === 'unverified' && 'Coordinates are unverified seed data'}
                {!precision && 'Coordinates are unverified'}
              </div>
              <div className="text-muted-foreground mt-0.5 font-mono">
                {f.lat.toFixed(5)}, {f.lng.toFixed(5)} · precision: {precision ?? 'unknown'}
                {f.coord_provider && ` · ${f.coord_provider.replace(/_/g, ' ')}`}
                {f.osm_parcel_name && ` · parcel: ${f.osm_parcel_name}`}
              </div>
              {candidates.length > 1 && (
                <div className="text-muted-foreground mt-1.5">
                  {candidates.length} providers checked
                  {typeof consensusKm === 'number' && (
                    <> · max disagreement <strong className={providerDisagrees ? 'text-amber-600' : ''}>{consensusKm.toFixed(2)} km</strong></>
                  )}
                  {providerDisagrees && ' — providers disagree, worth a human eyeball'}
                </div>
              )}
              {localityOnly && (
                <p className="text-muted-foreground mt-1.5">
                  Running the Site Lookup at these coordinates will analyze the town centre, not
                  the plant. Use <strong>Refine &amp; open</strong> below to run Google Places +
                  OSM parcel snap first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Closure-signal activity trend — historical Sentinel-2 NDVI */}
        <div className={`rounded-lg border p-3 ${
          f.activity_trend === 'rising_vegetation'
            ? 'border-rose-500/30 bg-rose-500/5'
            : f.activity_trend === 'recovering'
              ? 'border-amber-500/30 bg-amber-500/5'
              : f.activity_trend === 'stable'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-border bg-muted/30'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              {f.activity_trend === 'rising_vegetation'
                ? <Leaf className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                : f.activity_trend === 'recovering'
                  ? <Leaf className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  : <Satellite className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <div className="text-xs flex-1">
                <div className="font-medium">
                  {f.activity_trend === 'rising_vegetation' && 'Closure signal — vegetation reclaiming the site'}
                  {f.activity_trend === 'recovering' && 'Mild activity drop detected'}
                  {f.activity_trend === 'stable' && 'Site appears active — no vegetation rebound'}
                  {f.activity_trend === 'no_data' && 'Not enough cloud-free Sentinel-2 scenes to call a trend'}
                  {!f.activity_trend && 'Satellite activity not yet checked'}
                </div>
                {f.activity_evidence && (
                  <div className="text-muted-foreground mt-0.5 font-mono">{f.activity_evidence}</div>
                )}
                {f.activity_window_start && f.activity_window_end && (
                  <div className="text-muted-foreground mt-0.5">
                    Window {f.activity_window_start} → {f.activity_window_end}
                    {typeof f.activity_trend_score === 'number' && ` · signal ${f.activity_trend_score}/100`}
                  </div>
                )}
                {activityObs.data && activityObs.data.length > 0 && (
                  <NdviSparkline points={activityObs.data} />
                )}
              </div>
            </div>
            <Button
              size="sm" variant="outline"
              onClick={runActivityCheck}
              disabled={activityMon.isPending}
              className="shrink-0"
            >
              {activityMon.isPending
                ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                : <Activity className="w-3.5 h-3.5 mr-1.5" />}
              Check satellite
            </Button>
          </div>
        </div>

        {/* Scoring factors */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Scoring · {gem.total}/100 · {gem.confidence} confidence
          </div>
          <div className="space-y-1.5">
            {gem.factors.map((factor) => (
              <div key={factor.key} className="text-xs flex items-start gap-3">
                <span className="font-mono tabular-nums w-14 shrink-0 text-right">
                  {factor.score}/{factor.max}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{factor.key.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground"> — {factor.detail}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Facility evidence — provenance, capacity, status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <DetailField label="NAICS" value={f.naics_code} />
          <DetailField label="Capacity"
            value={f.capacity_value != null ? `${f.capacity_value.toLocaleString()} ${f.capacity_unit ?? ''}` : null} />
          <DetailField label="Status"
            value={`${f.status.replace(/_/g, ' ')}${f.status_as_of ? ` (as of ${f.status_as_of})` : ''}`} />
          <DetailField label="Grid voltage"
            value={f.grid_voltage_kv != null ? `${f.grid_voltage_kv} kV` : null} />
          <DetailField label="Last verified" value={f.last_verified} />
          <DetailField label="Estimate basis" value={f.estimate_basis} />
          {f.source_url && (
            <div className="sm:col-span-2 flex items-start gap-2">
              <span className="text-muted-foreground uppercase tracking-widest text-[10px] mt-0.5">Source</span>
              <a href={f.source_url} target="_blank" rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 break-all">
                {f.source_publisher ?? f.source_url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
          {f.status_source_url && (
            <div className="sm:col-span-2 flex items-start gap-2">
              <span className="text-muted-foreground uppercase tracking-widest text-[10px] mt-0.5">Status source</span>
              <a href={f.status_source_url} target="_blank" rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 break-all">
                {f.status_source_url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
          {f.notes && (
            <p className="sm:col-span-2 text-muted-foreground italic">{f.notes}</p>
          )}
        </div>

        {/* Contacts + brokerage */}
        {(f.contact_name || f.contact_email || f.contact_phone || f.broker_name || f.deal_notes) && (
          <>
            <Separator />
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Deal team
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {f.contact_name && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{f.contact_name}</div>
                      {f.contact_role && <div className="text-xs text-muted-foreground">{f.contact_role}</div>}
                    </div>
                  </div>
                )}
                {f.contact_email && (
                  <a href={`mailto:${f.contact_email}`}
                    className="flex items-start gap-2 text-primary hover:underline">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0" /><span>{f.contact_email}</span>
                  </a>
                )}
                {f.contact_phone && (
                  <a href={`tel:${f.contact_phone}`}
                    className="flex items-start gap-2 text-primary hover:underline">
                    <Phone className="w-4 h-4 mt-0.5 shrink-0" /><span>{f.contact_phone}</span>
                  </a>
                )}
                {(f.broker_name || f.broker_url) && (
                  <div className="flex items-start gap-2">
                    <Radar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      {f.broker_url
                        ? <a href={f.broker_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">{f.broker_name ?? 'Broker'}</a>
                        : <span className="font-medium">{f.broker_name}</span>}
                      <div className="text-xs text-muted-foreground">Broker / off-market</div>
                    </div>
                  </div>
                )}
                {f.deal_notes && (
                  <p className="sm:col-span-2 text-xs text-muted-foreground italic">{f.deal_notes}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Matched scraped listings (any active for-sale signal in the same area) */}
        <Separator />
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            For-sale signals matched ({matchedListings.length})
            <Badge variant="outline" className="text-[10px] font-normal">active only</Badge>
          </div>
          {matchedListings.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No active scraped listings near this facility. Stale or removed listings are filtered out automatically.
            </p>
          ) : (
            <div className="space-y-2">
              {matchedListings.map((l) => (
                <div key={l.id} className="flex items-start gap-2 text-xs border-b border-border last:border-0 pb-2 last:pb-0">
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
                      {l.gem_signals.slice(0, 6).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {s.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        Last seen {l.last_seen_at ? new Date(l.last_seen_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action row */}
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {localityOnly
              ? <span>Refine to geocode before opening in Site Lookup for accurate analysis.</span>
              : <span>Coordinates verified — Site Lookup will analyze the actual facility.</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {localityOnly ? (
              <Button onClick={runRefineThenOpen} disabled={refining || refine.isPending}>
                {refining || refine.isPending
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <LocateFixed className="w-4 h-4 mr-2" />}
                Refine &amp; open in Site Lookup
              </Button>
            ) : null}
            <Button
              variant={localityOnly ? 'outline' : 'default'}
              onClick={() => onOpenInSiteLookup({ lat: f.lat, lng: f.lng, label: f.name })}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Open in Site Lookup
              {localityOnly && <ShieldAlert className="w-3.5 h-3.5 ml-1.5 text-amber-600" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <div className="text-muted-foreground uppercase tracking-widest text-[10px]">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

// Minimal SVG sparkline for the NDVI footprint vs baseline series. Doesn't
// pretend to be a chart library — just gives a visual sense of the trend.
function NdviSparkline({
  points,
}: {
  points: Array<{
    observed_at: string;
    ndvi_mean_footprint: number | null;
    ndvi_mean_baseline: number | null;
  }>;
}) {
  const valid = points.filter((p) => p.ndvi_mean_footprint != null);
  if (valid.length < 2) return null;
  const W = 220, H = 36, PAD = 2;
  const ys = valid.flatMap((p) => [p.ndvi_mean_footprint!, p.ndvi_mean_baseline ?? 0]);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0.6);
  const range = Math.max(0.1, maxY - minY);
  const path = (key: 'ndvi_mean_footprint' | 'ndvi_mean_baseline') =>
    valid.map((p, i) => {
      const v = p[key];
      if (v == null) return null;
      const x = PAD + (i / (valid.length - 1)) * (W - 2 * PAD);
      const y = H - PAD - ((v - minY) / range) * (H - 2 * PAD);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).filter(Boolean).join(' ');
  return (
    <svg width={W} height={H} className="mt-2" aria-label="NDVI footprint vs baseline">
      <path d={path('ndvi_mean_baseline')} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} />
      <path d={path('ndvi_mean_footprint')} fill="none" stroke="hsl(var(--watt-bitcoin))" strokeWidth={1.5} />
    </svg>
  );
}
