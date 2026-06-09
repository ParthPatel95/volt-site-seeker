import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import {
  LayoutDashboard, Zap, Cable, Thermometer, Truck, Satellite, BookOpen,
  Download, ExternalLink, Loader2, AlertTriangle, ScanSearch, ChevronLeft, ChevronRight,
  Gauge, Compass, Target, Factory, Activity, MapPin, Radio, Server, Cloud, Globe2, Wifi,
} from 'lucide-react';
import type { SiteReport as SiteReportT } from '@/hooks/useAlbertaSiteReport';
import type { OsmPowerResponse } from '@/types/site-intel';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';

// ────────────────────────────────────────────────────────────────────────────
// Top-level workspace
// ────────────────────────────────────────────────────────────────────────────

type PanelKey = 'overview' | 'power' | 'connectivity' | 'climate' | 'logistics' | 'imagery' | 'methodology';

const NAV: { key: PanelKey; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'power', label: 'Power (Open Infra)', icon: Zap },
  { key: 'connectivity', label: 'Connectivity', icon: Cable },
  { key: 'climate', label: 'Climate & Risk', icon: Thermometer },
  { key: 'logistics', label: 'Logistics', icon: Truck },
  { key: 'imagery', label: 'Imagery & AI', icon: Satellite },
  { key: 'methodology', label: 'Methodology', icon: BookOpen },
];

export function SiteWorkspace({ report }: { report: SiteReportT }) {
  const [panel, setPanel] = useState<PanelKey>('overview');
  const [collapsed, setCollapsed] = useState(true);
  const { lat, lng } = report.location;

  // Always-on OSM power scan (used by Overview KPIs + Power panel).
  const [radius, setRadius] = useState(8000);
  const [osm, setOsm] = useState<OsmPowerResponse | null>(null);
  const [osmLoading, setOsmLoading] = useState(true);
  const [osmError, setOsmError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOsmLoading(true); setOsmError(null);
    supabase.functions.invoke('osm-power-infrastructure', { body: { lat, lng, radius_m: radius } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { setOsmError(error.message); return; }
        if (data?.error) { setOsmError(data.error); return; }
        setOsm(data);
      })
      .finally(() => { if (!cancelled) setOsmLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng, radius]);

  const [pdfPending, setPdfPending] = useState(false);

  const handlePdf = async () => {
    setPdfPending(true);
    try {
      // Lazy-load jspdf + jspdf-autotable so the PDF libs are not in the main
      // bundle. The dynamic imports also let powerModelExport.ts share the
      // same async chunk (Rollup deduplicates) without dragging jspdf into
      // SiteWorkspace's static graph.
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Alberta Site Intelligence Report', 14, 18);
      doc.setFontSize(10);
      doc.text(`Location: ${report.location.label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`}`, 14, 26);
      doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 14, 32);

      if (osm?.substations?.length) {
        autoTable(doc, {
          startY: 38,
          head: [['OSM Substation', 'Operator', 'Max kV', 'Type', 'Distance (km)']],
          body: osm.substations.slice(0, 15).map((s) => [
            s.name ?? '—', s.operator ?? '—', s.max_kv ?? '—', s.substation_type ?? '—', s.distance_km,
          ]),
          headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
        });
      }
      autoTable(doc, {
        head: [['Carrier POP', 'City', 'Distance', 'YYC ms']],
        body: report.fiber.nearest_pops.map(p => [
          `${p.carrier} – ${p.facility_name}`, p.city, `${p.distance_km?.toFixed(1)} km`, p.latency_to_yyc_ms ?? '—',
        ]),
        headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
      });
      doc.save(`site-intel-${Date.now()}.pdf`);
    } catch (e) {
      console.error('Site Intel PDF export failed:', e);
      alert('PDF export failed to load. Please try again or check your network.');
    } finally {
      setPdfPending(false);
    }
  };

  return (
    <div className="@container flex w-full min-h-[600px] border border-border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 border-r border-border bg-secondary/30 transition-all ${collapsed ? 'w-12' : 'w-44'}`}>
        <div className="flex items-center justify-between p-2 border-b border-border">
          {!collapsed && <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Workspace</span>}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto p-1 rounded hover:bg-secondary text-muted-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
        <nav className="p-1.5 space-y-0.5">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = panel === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setPanel(n.key)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded text-xs font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                }`}
                title={n.label}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{n.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
            </div>
            <h3 className="text-sm font-semibold truncate">
              {report.location.label ?? 'Site Intelligence'}
            </h3>
          </div>
          <Badge variant="outline" className="text-xs">
            Score {report.hyperscaler_score?.total ?? '—'}/100 · {report.hyperscaler_score?.grade ?? '—'}
          </Badge>
          <Button onClick={handlePdf} size="sm" variant="outline" disabled={pdfPending}>
            {pdfPending
              ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              : <Download className="w-3.5 h-3.5 mr-1.5" />}
            Export PDF
          </Button>
        </header>

        {/* KPI strip */}
        <KpiStrip report={report} osm={osm} />

        {/* Panel content */}
        <main className="flex-1 min-w-0 overflow-auto p-4 space-y-4">
          {panel === 'overview' && <OverviewPanel report={report} osm={osm} onJump={setPanel} />}
          {panel === 'power' && (
            <PowerPanel
              osm={osm}
              loading={osmLoading}
              error={osmError}
              radius={radius}
              onRadius={setRadius}
              lat={lat}
              lng={lng}
            />
          )}
          {panel === 'connectivity' && <ConnectivityPanel report={report} />}
          {panel === 'climate' && <ClimateRiskPanel report={report} />}
          {panel === 'logistics' && <LogisticsPanel report={report} />}
          {panel === 'imagery' && <ImageryPanel report={report} />}
          {panel === 'methodology' && <MethodologyPanel report={report} osm={osm} />}
        </main>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Shared atoms
// ────────────────────────────────────────────────────────────────────────────

function Kpi({ label, value, sub, tone = 'default' }: { label: string; value: React.ReactNode; sub?: string; tone?: 'default' | 'good' | 'warn' | 'bad' }) {
  const toneClass =
    tone === 'good' ? 'border-emerald-500/30 bg-emerald-500/5'
    : tone === 'warn' ? 'border-amber-500/30 bg-amber-500/5'
    : tone === 'bad'  ? 'border-rose-500/30 bg-rose-500/5'
    : 'border-border bg-secondary/30';
  return (
    <div className={`rounded border p-2.5 ${toneClass}`}>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold leading-tight mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5 truncate" title={sub}>{sub}</div>}
    </div>
  );
}

function Section({ icon, title, subtitle, right, children }: { icon?: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">{icon}<h4 className="font-semibold text-sm">{title}</h4></div>
        {right}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      {children}
    </Card>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: (React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {headers.map(h => <th key={h} className="text-left font-medium py-1.5 px-2 text-muted-foreground">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-secondary/40">
              {r.map((c, j) => <td key={j} className="py-1.5 px-2 align-top">{c}</td>)}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={headers.length} className="text-center py-3 text-muted-foreground">No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function fmtKm(n?: number | null) {
  if (n === undefined || n === null) return '—';
  return `${n.toFixed(2)} km`;
}

function bearingLabel(deg?: number | null) {
  if (deg === null || deg === undefined) return '—';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return `${Math.round(deg)}° ${dirs[Math.round(deg / 22.5) % 16]}`;
}

// ────────────────────────────────────────────────────────────────────────────
// KPI strip
// ────────────────────────────────────────────────────────────────────────────

function KpiStrip({ report, osm }: { report: SiteReportT; osm: OsmPowerResponse | null }) {
  const fiberKm = report.fiber.nearest_pops[0]?.distance_km;
  const waterKm = report.gas_and_water.nearest_water_sources[0]?.distance_km;
  const maxKv = osm?.summary?.max_voltage_kv;
  const nearestSubKm = osm?.summary?.nearest_substation_km;
  const tx = osm?.summary?.nearest_transmission_substation;

  return (
    <div className="px-4 py-3 border-b border-border bg-secondary/20 grid grid-cols-2 @md:grid-cols-3 @3xl:grid-cols-6 gap-2">
      <Kpi label="Max kV nearby (OSM)" value={maxKv ? `${maxKv} kV` : '—'} sub={tx?.name ?? undefined} tone={maxKv >= 240 ? 'good' : maxKv >= 138 ? 'good' : maxKv ? 'warn' : 'default'} />
      <Kpi label="Nearest substation" value={fmtKm(nearestSubKm)} sub={osm?.substations?.[0]?.operator ?? undefined} tone={nearestSubKm < 2 ? 'good' : nearestSubKm < 5 ? 'warn' : 'default'} />
      <Kpi label="Tx substations ≤25 km" value={osm?.counts?.transmission_substations ?? '—'} sub="OSM tagged" />
      <Kpi label="Fiber POP" value={fmtKm(fiberKm)} sub={report.fiber.nearest_pops[0]?.carrier ?? undefined} tone={fiberKm < 5 ? 'good' : fiberKm < 20 ? 'warn' : 'bad'} />
      <Kpi label="Water source" value={fmtKm(waterKm)} sub={report.gas_and_water.nearest_water_sources[0]?.name ?? undefined} />
      <Kpi label="Hyperscaler score" value={`${report.hyperscaler_score?.total ?? '—'}/100`} sub={`Grade ${report.hyperscaler_score?.grade ?? '—'}`} tone={(report.hyperscaler_score?.total ?? 0) >= 70 ? 'good' : 'warn'} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Overview
// ────────────────────────────────────────────────────────────────────────────

function OverviewPanel({ report, osm, onJump }: { report: SiteReportT; osm: OsmPowerResponse | null; onJump: (p: PanelKey) => void }) {
  const breakdown = Object.entries(report.hyperscaler_score?.breakdown ?? {});
  const tx = osm?.summary?.nearest_transmission_substation;
  return (
    <>
      <Section icon={<LayoutDashboard className="w-4 h-4" />} title="Decision summary"
        subtitle="At-a-glance read of the site across the seven hyperscaler dimensions.">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {breakdown.map(([k, v]: any) => (
            <div key={k} className="border border-border rounded p-2 bg-secondary/30">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{k}</div>
              <div className="text-base font-semibold">{v.score}<span className="text-xs text-muted-foreground">/{v.max}</span></div>
              <div className="text-[10px] text-muted-foreground line-clamp-2" title={v.detail}>{v.detail}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={<Zap className="w-4 h-4" />} title="Power posture (Open Infrastructure)"
          right={<Button size="sm" variant="ghost" onClick={() => onJump('power')} className="h-7 text-xs">Open panel <ChevronRight className="w-3 h-3 ml-1" /></Button>}>
          {tx ? (
            <div className="text-xs space-y-1">
              <div><strong>{tx.name ?? 'Unnamed transmission substation'}</strong> at {fmtKm(tx.distance_km)}</div>
              <div className="text-muted-foreground">Max voltage: {tx.max_kv ?? '—'} kV · Operator: {tx.operator ?? 'Not tagged'} · Bearing: {bearingLabel(tx.bearing_deg)}</div>
              <div className="text-muted-foreground">Transmission substations within {Math.round((osm.radius_m ?? 8000) / 1000)} km: <strong>{osm.counts.transmission_substations}</strong> · Distribution: <strong>{osm.counts.distribution_substations}</strong> · Generation: <strong>{osm.counts.generation}</strong></div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No transmission substations tagged in OSM within current radius. Try increasing radius in the Power panel.</p>
          )}
        </Section>

        <Section icon={<Cable className="w-4 h-4" />} title="Connectivity at a glance"
          right={<Button size="sm" variant="ghost" onClick={() => onJump('connectivity')} className="h-7 text-xs">Open panel <ChevronRight className="w-3 h-3 ml-1" /></Button>}>
          <div className="text-xs space-y-1">
            <div>Nearest POP: <strong>{report.fiber.nearest_pops[0]?.carrier ?? '—'}</strong> · {report.fiber.nearest_pops[0]?.facility_name ?? '—'} ({fmtKm(report.fiber.nearest_pops[0]?.distance_km)})</div>
            <div className="text-muted-foreground">IXPs nearby: {report.fiber.nearest_ixps?.length ?? 0} · Long-haul routes: {report.fiber.nearest_long_haul_routes.length}</div>
          </div>
        </Section>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Power panel — OSM-only, with analytics
// ────────────────────────────────────────────────────────────────────────────

function PowerPanel({ osm, loading, error, radius, onRadius, lat, lng }: {
  osm: OsmPowerResponse | null; loading: boolean; error: string | null;
  radius: number; onRadius: (r: number) => void; lat: number; lng: number;
}) {
  if (loading) {
    return <Card className="p-8 text-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Querying OpenStreetMap / OpenInfraMap…</Card>;
  }
  if (error) {
    return <Card className="p-4 text-xs text-rose-600">OSM lookup failed: {error}</Card>;
  }
  if (!osm) return null;

  const subs = osm.substations ?? [];
  const gen = osm.generation ?? [];
  const lines = osm.power_lines ?? [];

  return (
    <>
      <Section
        icon={<Zap className="w-4 h-4" />}
        title="Open Infrastructure scan"
        subtitle={`Live OpenStreetMap Overpass query · radius ${Math.round(radius / 1000)} km · ${osm.queried_at?.slice(0, 16).replace('T', ' ')} UTC · ${osm.attribution}`}
        right={
          <div className="flex items-center gap-2">
            <Label className="text-[10px] text-muted-foreground">Radius</Label>
            <ToggleGroup type="single" value={String(radius)} onValueChange={(v) => v && onRadius(Number(v))}>
              <ToggleGroupItem value="3000" className="text-[10px] px-2 h-6">3</ToggleGroupItem>
              <ToggleGroupItem value="8000" className="text-[10px] px-2 h-6">8</ToggleGroupItem>
              <ToggleGroupItem value="15000" className="text-[10px] px-2 h-6">15</ToggleGroupItem>
              <ToggleGroupItem value="25000" className="text-[10px] px-2 h-6">25 km</ToggleGroupItem>
            </ToggleGroup>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Kpi label="Substations" value={osm.counts.substations} sub={`${osm.counts.transmission_substations} tx · ${osm.counts.distribution_substations} dist`} />
          <Kpi label="Generation sites" value={osm.counts.generation} sub={osm.summary.total_generation_mw ? `${osm.summary.total_generation_mw.toLocaleString()} MW tagged` : 'No MW tags'} />
          <Kpi label="Power line segments" value={osm.counts.power_lines} />
          <Kpi label="Max kV nearby" value={osm.summary.max_voltage_kv ? `${osm.summary.max_voltage_kv} kV` : '—'} tone={osm.summary.max_voltage_kv >= 138 ? 'good' : 'warn'} />
          <Kpi label="OSM data completeness" value={`${osm.summary.data_completeness_pct}%`} sub="name · operator · voltage" tone={osm.summary.data_completeness_pct >= 70 ? 'good' : 'warn'} />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={<Gauge className="w-4 h-4" />} title="Voltage profile" subtitle="Features tagged in OSM by voltage class">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={osm.voltage_profile} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <RTooltip wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="substations" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="lines" stackId="a" fill="hsl(var(--muted-foreground))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Stacked: substations + line segments. Closest example per class shown below.</div>
          <MiniTable
            headers={['Class', 'Subs', 'Lines', 'Nearest substation', 'Nearest line']}
            rows={osm.voltage_profile.map((v) => [
              v.bucket,
              v.substations,
              v.lines,
              v.nearest_substation_name ? `${v.nearest_substation_name} (${fmtKm(v.nearest_substation_km)})` : (v.nearest_substation_km != null ? fmtKm(v.nearest_substation_km) : '—'),
              v.nearest_line_km != null ? fmtKm(v.nearest_line_km) : '—',
            ])}
          />
        </Section>

        <Section icon={<Compass className="w-4 h-4" />} title="Bearing dial" subtitle="Where transmission assets (≥69 kV) cluster around the site">
          <BearingDial dial={osm.bearing_dial} />
        </Section>
      </div>

      <Section icon={<Target className="w-4 h-4" />} title="Interconnect candidates" subtitle="Top OSM-tagged transmission substations scored by distance, voltage, type and operator certainty.">
        {osm.interconnect_candidates.length === 0 ? (
          <p className="text-xs text-muted-foreground">No transmission-class substations tagged in OSM within current radius.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {osm.interconnect_candidates.map((c, i) => (
              <div key={c.osm_id} className="border border-border rounded p-3 bg-secondary/20">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Rank #{i + 1}</div>
                    <div className="font-semibold text-sm leading-tight">{c.name ?? 'Unnamed substation'}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Score {c.score}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div><strong className="text-foreground">{c.max_kv ?? '—'} kV</strong> · {fmtKm(c.distance_km)} · {bearingLabel(c.bearing_deg)}</div>
                  <div>Operator: {c.operator ?? <em>Not tagged</em>}</div>
                  <div>Type: {c.substation_type ?? <em>Not tagged</em>}</div>
                  <div className="italic text-[10px] mt-1">{c.rationale}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary inline-flex items-center gap-1 hover:underline">OSM <ExternalLink className="w-3 h-3" /></a>
                  <a href={c.openinframap_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary inline-flex items-center gap-1 hover:underline">OpenInfraMap <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={<Activity className="w-4 h-4" />} title="Distance decay" subtitle="How far you have to look before assets appear">
          <MiniTable
            headers={['Asset', 'Nearest', 'Median', 'p90', 'Count']}
            rows={[
              ['Transmission subs (≥69 kV)', fmtKm(osm.distance_decay.transmission_substations.nearest_km), fmtKm(osm.distance_decay.transmission_substations.median_km), fmtKm(osm.distance_decay.transmission_substations.p90_km), osm.distance_decay.transmission_substations.count],
              ['Distribution subs (<69 kV)', fmtKm(osm.distance_decay.distribution_substations.nearest_km), fmtKm(osm.distance_decay.distribution_substations.median_km), fmtKm(osm.distance_decay.distribution_substations.p90_km), osm.distance_decay.distribution_substations.count],
              ['Power lines', fmtKm(osm.distance_decay.power_lines.nearest_km), fmtKm(osm.distance_decay.power_lines.median_km), fmtKm(osm.distance_decay.power_lines.p90_km), osm.distance_decay.power_lines.count],
              ['Generation', fmtKm(osm.distance_decay.generation.nearest_km), fmtKm(osm.distance_decay.generation.median_km), fmtKm(osm.distance_decay.generation.p90_km), osm.distance_decay.generation.count],
            ]}
          />
        </Section>

        <Section icon={<Factory className="w-4 h-4" />} title="Generation neighbors" subtitle="Power plants and generators tagged in OSM nearby">
          {gen.length === 0 ? (
            <p className="text-xs text-muted-foreground">No generation features tagged within current radius.</p>
          ) : (
            <MiniTable
              headers={['Name', 'Source', 'Output', 'Operator', 'Distance', 'OSM']}
              rows={gen.slice(0, 8).map(g => [
                g.name ?? <em className="text-muted-foreground">Unnamed</em>,
                g.source ?? '—',
                g.output_mw ? `${g.output_mw} MW` : (g.output_raw ?? '—'),
                g.operator ?? '—',
                fmtKm(g.distance_km),
                <a key="u" href={g.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a>,
              ])}
            />
          )}
        </Section>
      </div>

      <Section icon={<Zap className="w-4 h-4" />} title="All OSM-tagged substations">
        <MiniTable
          headers={['Name', 'Type', 'Operator', 'Max kV', 'Sub type', 'Location', 'Distance', 'Bearing', 'OSM']}
          rows={subs.slice(0, 25).map(s => [
            s.name ?? <em className="text-muted-foreground">Unnamed</em>,
            <Badge key="t" variant="outline" className="text-[9px]">{s.power}</Badge>,
            s.operator ?? '—',
            s.max_kv ? <strong>{s.max_kv} kV</strong> : '—',
            s.substation_type ?? '—',
            s.location ?? '—',
            fmtKm(s.distance_km),
            bearingLabel(s.bearing_deg),
            <a key="u" href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a>,
          ])}
        />
      </Section>

      <Section icon={<Cable className="w-4 h-4" />} title="Power lines within radius">
        <MiniTable
          headers={['Name / ref', 'Type', 'Operator', 'Max kV', 'Cables', 'Circuits', 'Location', 'Distance', 'OSM']}
          rows={lines.slice(0, 25).map(l => [
            l.name ?? <em className="text-muted-foreground">Untagged</em>,
            <Badge key="t" variant="outline" className="text-[9px]">{l.power}</Badge>,
            l.operator ?? '—',
            l.max_kv ? <strong>{l.max_kv} kV</strong> : '—',
            l.cables ?? '—',
            l.circuits ?? '—',
            l.location ?? '—',
            fmtKm(l.distance_km),
            <a key="u" href={l.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a>,
          ])}
        />
        <p className="text-[10px] text-muted-foreground mt-2">
          Distances for lines use the nearest vertex along the polyline (not centroid). Missing values mean the OSM way has no tag — we never invent them.
          <a href={`https://openinframap.org/#13/${lat}/${lng}`} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 ml-2 hover:underline">View on OpenInfraMap <ExternalLink className="w-3 h-3" /></a>
        </p>
      </Section>
    </>
  );
}

// SVG compass dial — 12 sectors, opacity scaled to relative count.
function BearingDial({ dial }: { dial: { sector: number; angle_from: number; angle_to: number; count: number }[] }) {
  const max = Math.max(1, ...dial.map(s => s.count));
  const cx = 120, cy = 120, R = 100;
  function arcPath(start: number, end: number) {
    const s = (start - 90) * Math.PI / 180;
    const e = (end - 90) * Math.PI / 180;
    const x1 = cx + R * Math.cos(s), y1 = cy + R * Math.sin(s);
    const x2 = cx + R * Math.cos(e), y2 = cy + R * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  }
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 240 240" className="w-44 h-44">
        {dial.map(s => {
          const opacity = 0.15 + 0.85 * (s.count / max);
          return <path key={s.sector} d={arcPath(s.angle_from, s.angle_to)}
            fill={s.count > 0 ? `hsl(var(--primary))` : `hsl(var(--muted))`}
            fillOpacity={s.count > 0 ? opacity : 0.2}
            stroke="hsl(var(--background))" strokeWidth={1} />;
        })}
        <circle cx={cx} cy={cy} r={20} fill="hsl(var(--background))" stroke="hsl(var(--border))" />
        <text x={cx} y={cy - 110} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">N</text>
        <text x={cx + 110} y={cy + 4} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">E</text>
        <text x={cx} y={cy + 118} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">S</text>
        <text x={cx - 110} y={cy + 4} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">W</text>
      </svg>
      <div className="text-xs space-y-1">
        <div className="text-muted-foreground text-[10px] uppercase">Highest concentration</div>
        {dial.slice().sort((a, b) => b.count - a.count).slice(0, 3).map(s => (
          <div key={s.sector}>{s.angle_from}°–{s.angle_to}°: <strong>{s.count}</strong></div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Connectivity
// ────────────────────────────────────────────────────────────────────────────

function ConnectivityPanel({ report }: { report: SiteReportT }) {
  const { lat, lng } = report.location;
  const fiber = report.fiber;
  const depth = report.connectivity_depth;
  const score = fiber.score ?? null;
  const peeringHubs = fiber.peering_hubs ?? [];

  // Live external scan
  const [live, setLive] = useState<any | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLiveLoading(true); setLiveError(null); setLive(null);
    supabase.functions.invoke('fiber-depth-lookup', { body: { lat, lng } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { setLiveError(error.message); return; }
        if (data?.error) { setLiveError(data.error); return; }
        setLive(data);
      })
      .finally(() => { if (!cancelled) setLiveLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  return (
    <>
      {/* Fiber score */}
      {score && (
        <Section icon={<Gauge className="w-4 h-4" />} title="Fiber connectivity score" subtitle="100-point composite scored from real curated data">
          <div className="grid grid-cols-2 @3xl:grid-cols-5 gap-2">
            <Kpi label="Total" value={`${score.total}/100`} sub={`Grade ${score.grade}`} tone={score.total >= 70 ? 'good' : score.total >= 50 ? 'warn' : 'bad'} />
            {Object.entries(score.breakdown ?? {}).map(([k, v]: any) => (
              <Kpi key={k} label={k.replace(/_/g, ' ')} value={`${v.score}/${v.max}`} sub={v.detail} />
            ))}
          </div>
        </Section>
      )}

      {/* Top routes */}
      {fiber.top_routes?.length > 0 && (
        <Section icon={<Activity className="w-4 h-4" />} title="Top carrier routes" subtitle="Ranked POP × peering-hub combinations by latency + distance">
          <MiniTable
            headers={['#', 'Carrier', 'POP', 'City', 'Site→POP', 'Peering hub', 'Latency', 'Score']}
            rows={fiber.top_routes.map((r: any) => [
              <strong key="r">{r.rank}</strong>,
              r.carrier, r.pop, r.pop_city,
              `${r.site_to_pop_km} km`, r.hub,
              r.latency_ms != null ? `${r.latency_ms} ms` : '—',
              <Badge key="s" variant="outline" className="text-[9px]">{r.composite}</Badge>,
            ])}
          />
        </Section>
      )}

      {/* Carrier POPs (verbose) */}
      <Section icon={<Cable className="w-4 h-4" />} title="Carrier POPs" subtitle="Nearest fiber points of presence with modeled latency to peering hubs">
        <MiniTable
          headers={['Carrier', 'Facility', 'City', 'Distance', 'YYC', 'YEG', 'SEA', 'ORD', 'Source']}
          rows={(fiber.nearest_pops ?? []).map((p: any) => [
            <strong key="c">{p.carrier}</strong>,
            p.facility_name, p.city, fmtKm(p.distance_km),
            p.latency_to_yyc_ms != null ? `${p.latency_to_yyc_ms} ms` : '—',
            p.latency_to_yeg_ms != null ? `${p.latency_to_yeg_ms} ms` : '—',
            p.latency_to_sea_ms != null ? `${p.latency_to_sea_ms} ms` : '—',
            p.latency_to_ord_ms != null ? `${p.latency_to_ord_ms} ms` : '—',
            p.source_url ? <a key="u" href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a> : '—',
          ])}
        />
      </Section>

      {/* Carrier POP details */}
      {depth?.carrier_pop_details && depth.carrier_pop_details.length > 0 && (
        <Section icon={<Server className="w-4 h-4" />} title="POP facility details" subtitle="Building owner, services and access for nearest carrier facilities">
          <MiniTable
            headers={['Facility', 'Address', 'Building owner', 'Lit services', 'X-connect fee', 'MMR', '24×7', 'Distance']}
            rows={depth.carrier_pop_details.map((d: any) => [
              <strong key="f">{d.facility_name ?? d.name ?? '—'}</strong>,
              d.address ?? '—',
              d.building_owner ?? '—',
              d.lit_services ?? d.services ?? '—',
              d.cross_connect_fee_usd != null ? `$${d.cross_connect_fee_usd}` : '—',
              d.mmr_available === true ? 'Yes' : d.mmr_available === false ? 'No' : '—',
              d.access_24x7 === true ? 'Yes' : d.access_24x7 === false ? 'No' : '—',
              fmtKm(d.distance_km),
            ])}
          />
        </Section>
      )}

      {/* Long-haul routes */}
      {fiber.nearest_long_haul_routes?.length > 0 && (
        <Section icon={<Globe2 className="w-4 h-4" />} title="Long-haul fiber routes" subtitle="Inter-city backbone segments passing nearby">
          <MiniTable
            headers={['Route', 'Carrier', 'A endpoint', 'Z endpoint', 'Fiber pairs', 'Status', 'Distance']}
            rows={fiber.nearest_long_haul_routes.map((r: any) => [
              <strong key="n">{r.route_name ?? r.name ?? '—'}</strong>,
              r.carrier ?? '—',
              r.endpoint_a ?? r.start_city ?? '—',
              r.endpoint_z ?? r.end_city ?? '—',
              r.fiber_pair_count ?? r.pairs ?? '—',
              r.lit_or_dark ?? r.status ?? '—',
              fmtKm(r.distance_km),
            ])}
          />
        </Section>
      )}

      {/* Dark fiber inventory */}
      {depth?.dark_fiber_segments_nearby && depth.dark_fiber_segments_nearby.length > 0 && (
        <Section icon={<Cable className="w-4 h-4" />} title="Dark fiber inventory" subtitle="Unlit strands available for IRU lease">
          <MiniTable
            headers={['Segment', 'Vendor', 'Strands available', 'IRU term', 'Distance']}
            rows={depth.dark_fiber_segments_nearby.map((d: any) => [
              d.segment_name ?? d.name ?? '—',
              d.vendor ?? d.operator ?? '—',
              d.strands_available ?? d.available_strands ?? '—',
              d.iru_term_years ? `${d.iru_term_years} yr` : '—',
              fmtKm(d.distance_km),
            ])}
          />
        </Section>
      )}

      {/* Last-mile providers */}
      {depth?.last_mile_in_municipality && (
        <Section icon={<Wifi className="w-4 h-4" />} title="Last-mile providers" subtitle={depth.last_mile_in_municipality.population_centre ?? 'In the host municipality'}>
          <MiniTable
            headers={['Provider', 'Technology', 'Max down', 'Max up', 'Tier']}
            rows={(depth.last_mile_in_municipality.providers ?? []).map((p: any) => [
              <strong key="p">{p.provider ?? p.name ?? '—'}</strong>,
              p.technology ?? p.tech ?? '—',
              p.max_download_mbps != null ? `${p.max_download_mbps} Mbps` : '—',
              p.max_upload_mbps != null ? `${p.max_upload_mbps} Mbps` : '—',
              p.tier ?? p.pricing_tier ?? '—',
            ])}
          />
        </Section>
      )}

      {/* IXPs */}
      {fiber.nearest_ixps?.length > 0 && (
        <Section icon={<Cable className="w-4 h-4" />} title="Internet exchanges (curated)">
          <MiniTable
            headers={['IXP', 'City', 'Participants', 'Peak Gbps', 'Distance']}
            rows={fiber.nearest_ixps.map((x: any) => [x.name, x.city, x.participant_count ?? '—', x.peak_traffic_gbps ?? '—', fmtKm(x.distance_km)])}
          />
        </Section>
      )}

      {/* Cloud reach */}
      {fiber.cloud_reach?.length > 0 && (
        <Section icon={<Cloud className="w-4 h-4" />} title="Cloud region reach" subtitle="Modeled one-way fiber latency to public-cloud regions">
          <MiniTable
            headers={['Provider', 'Region', 'Code', 'Distance', 'Modeled latency', 'Source']}
            rows={fiber.cloud_reach.slice(0, 12).map((c: any) => [
              <strong key="p">{c.provider}</strong>,
              c.region_name, c.region_code,
              `${c.distance_km} km`,
              `${c.modeled_latency_ms_one_way} ms`,
              c.source_url ? <a key="u" href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a> : '—',
            ])}
          />
        </Section>
      )}

      {/* Peering hubs */}
      {peeringHubs.length > 0 && (
        <Section icon={<Compass className="w-4 h-4" />} title="Distance to peering hubs">
          <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-2">
            {peeringHubs.map((h: any) => {
              const km = Math.round(haversineFromReport(lat, lng, h.lat, h.lng));
              const ms = Math.round(km * 0.007 * 10) / 10;
              return <Kpi key={h.code} label={`${h.code} · ${h.name}`} value={`${km} km`} sub={`~${ms} ms one-way`} />;
            })}
          </div>
        </Section>
      )}

      {/* Live external fiber scan */}
      <Section icon={<Radio className="w-4 h-4" />} title="Live fiber & telecom scan"
        subtitle={liveLoading ? 'Querying PeeringDB · OpenStreetMap · ISED…' : live ? `PeeringDB · OSM · ISED · ${live.queried_at?.slice(0, 16).replace('T', ' ')} UTC` : '—'}>
        {liveLoading && <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Fetching live data…</div>}
        {liveError && <div className="text-xs text-rose-600">Live scan failed: {liveError}</div>}
        {live && (
          <div className="space-y-4">
            {/* PeeringDB facilities */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-semibold">PeeringDB facilities <Badge variant="outline" className="text-[9px] ml-1">{live.peeringdb?.facility_count ?? 0}</Badge></h5>
                <span className="text-[10px] text-muted-foreground">{live.peeringdb?.attribution}</span>
              </div>
              <MiniTable
                headers={['Facility', 'Org', 'City', 'Networks', 'IXes', 'Distance', 'Source']}
                rows={(live.peeringdb?.facilities ?? []).slice(0, 15).map((f: any) => [
                  <strong key="n">{f.name}</strong>,
                  f.org ?? '—', f.city ?? '—',
                  f.net_count ?? '—', f.ix_count ?? '—',
                  fmtKm(f.distance_km),
                  <a key="u" href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a>,
                ])}
              />
            </div>

            {/* PeeringDB IXPs */}
            {live.peeringdb?.ixps?.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold mb-1">PeeringDB internet exchanges (Canada)</h5>
                <MiniTable
                  headers={['IXP', 'City', 'Networks', 'IPv6', 'Media', 'Source']}
                  rows={live.peeringdb.ixps.slice(0, 12).map((x: any) => [
                    <strong key="n">{x.name}</strong>,
                    x.city ?? '—', x.net_count ?? '—',
                    x.proto_ipv6 ? 'Yes' : 'No',
                    x.media ?? '—',
                    <a key="u" href={x.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a>,
                  ])}
                />
              </div>
            )}

            {/* OSM telecom */}
            {live.osm_telecom?.items?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-semibold">OSM telecom & data-center assets <Badge variant="outline" className="text-[9px] ml-1">{live.osm_telecom.counts.total}</Badge></h5>
                  <span className="text-[10px] text-muted-foreground">
                    {live.osm_telecom.counts.comms_towers} towers · {live.osm_telecom.counts.data_centers} DCs · {live.osm_telecom.counts.telecom_offices} offices
                  </span>
                </div>
                <MiniTable
                  headers={['Name', 'Kind', 'Operator', 'Height', 'Distance', 'Bearing', 'OSM']}
                  rows={live.osm_telecom.items.slice(0, 20).map((t: any) => [
                    t.name ?? <em className="text-muted-foreground">Unnamed</em>,
                    <Badge key="k" variant="outline" className="text-[9px]">{t.kind}</Badge>,
                    t.operator ?? '—',
                    t.height_m != null ? `${t.height_m} m` : '—',
                    fmtKm(t.distance_km),
                    bearingLabel(t.bearing_deg),
                    <a key="u" href={t.source_url} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="w-3 h-3 inline" /></a>,
                  ])}
                />
              </div>
            )}

            {/* ISED broadband */}
            {live.ised_broadband && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-semibold">ISED National Broadband (hex {live.ised_broadband.hex_id ?? '—'})</h5>
                  <a href={live.ised_broadband.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary inline-flex items-center gap-1 hover:underline">Dataset <ExternalLink className="w-3 h-3" /></a>
                </div>
                <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-2">
                  <Kpi label="Max download" value={live.ised_broadband.max_download_mbps ? `${live.ised_broadband.max_download_mbps} Mbps` : '—'} />
                  <Kpi label="Max upload" value={live.ised_broadband.max_upload_mbps ? `${live.ised_broadband.max_upload_mbps} Mbps` : '—'} />
                  <Kpi label="Technologies" value={live.ised_broadband.technologies ?? '—'} />
                  <Kpi label="Providers" value={live.ised_broadband.providers ?? '—'} />
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}

// inline haversine helper (avoids importing utils for one call site)
function haversineFromReport(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ────────────────────────────────────────────────────────────────────────────
// Climate & Risk
// ────────────────────────────────────────────────────────────────────────────

function ClimateRiskPanel({ report }: { report: SiteReportT }) {
  return (
    <>
      {report.climate && (
        <Section icon={<Thermometer className="w-4 h-4" />} title="Climate & cooling" subtitle={`ECCC normals · ${report.climate.station_name}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Kpi label="Mean annual T" value={`${report.climate.mean_annual_dry_bulb_c ?? '—'} °C`} />
            <Kpi label="ASHRAE 0.4% DB" value={`${report.climate.ashrae_04_design_db_c ?? '—'} °C`} />
            <Kpi label="Free-cool <18°C" value={(report.climate.free_cooling_hours_below_18c ?? 0).toLocaleString()} sub="hrs/yr" />
            <Kpi label="Evap >24°C" value={(report.climate.evap_hours_above_24c ?? 0).toLocaleString()} sub="hrs/yr" />
          </div>
        </Section>
      )}
      {report.risk && (
        <Section icon={<AlertTriangle className="w-4 h-4" />} title="Natural hazards" subtitle={report.risk.region_name}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Kpi label="Seismic PGA" value={`${report.risk.seismic_pga_g ?? '—'} g`} sub={report.risk.seismic_rating ?? ''} />
            <Kpi label="Wildfire" value={report.risk.wildfire_rating ?? '—'} />
            <Kpi label="Flood" value={report.risk.flood_rating ?? '—'} />
            <Kpi label="Tornado" value={report.risk.tornado_rating ?? '—'} />
          </div>
        </Section>
      )}
      <Section icon={<Thermometer className="w-4 h-4" />} title="Natural gas & water">
        <MiniTable
          headers={['Gas pipeline', 'Operator', 'Diameter', 'Distance']}
          rows={report.gas_and_water.nearest_gas_pipelines.map((g: any) => [g.name, g.operator, `${g.diameter_mm} mm`, fmtKm(g.distance_km)])}
        />
        <p className="text-xs font-semibold mt-3 mb-1">Water sources</p>
        <MiniTable
          headers={['Source', 'Type', 'Distance']}
          rows={report.gas_and_water.nearest_water_sources.map((w: any) => [w.name, w.type, fmtKm(w.distance_km)])}
        />
      </Section>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Logistics
// ────────────────────────────────────────────────────────────────────────────

function LogisticsPanel({ report }: { report: SiteReportT }) {
  return (
    <>
      <Section icon={<Truck className="w-4 h-4" />} title="Industrial parks">
        <MiniTable
          headers={['Park', 'Municipality', 'Available power', 'Distance']}
          rows={report.logistics.nearest_industrial_parks.map((p: any) => [p.name, p.municipality, p.available_power_mw ? `${p.available_power_mw} MW` : '—', fmtKm(p.distance_km)])}
        />
      </Section>
      <Section icon={<Truck className="w-4 h-4" />} title="Transport assets">
        <MiniTable
          headers={['Type', 'Asset', 'Operator', 'Distance']}
          rows={(report.logistics.nearest_logistics_assets ?? []).map((l: any) => [l.asset_type.replace(/_/g, ' '), l.name, l.operator ?? '—', fmtKm(l.distance_km)])}
        />
      </Section>
      <Section icon={<Truck className="w-4 h-4" />} title="Population & workforce centres">
        <MiniTable
          headers={['Centre', 'Population 2021', 'Labour force', 'Distance']}
          rows={(report.logistics.nearest_population_centres ?? []).map((p: any) => [p.name, p.population_2021?.toLocaleString() ?? '—', p.labour_force_2021?.toLocaleString() ?? '—', fmtKm(p.distance_km)])}
        />
      </Section>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Imagery & AI
// ────────────────────────────────────────────────────────────────────────────

function ImageryPanel({ report }: { report: SiteReportT }) {
  const { lat, lng } = report.location;
  const [zoom, setZoom] = useState(18);
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [scan, setScan] = useState<any | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImgLoading(true); setImgError(null); setImgB64(null);
    supabase.functions.invoke('site-satellite-image', { body: { lat, lng, zoom } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { setImgError(error.message); return; }
        if (data?.error) { setImgError(data.error); return; }
        setImgB64(data?.image_base64 ?? null);
        setMapsUrl(data?.maps_url ?? null);
      })
      .finally(() => { if (!cancelled) setImgLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng, zoom]);

  const runScan = async () => {
    setScanLoading(true); setScanError(null); setScan(null);
    const { data, error } = await supabase.functions.invoke('site-asset-vision', { body: { lat, lng, zoom } });
    setScanLoading(false);
    if (error) { setScanError(error.message); return; }
    if (data?.error) { setScanError(data.error); return; }
    setScan(data);
  };

  return (
    <Section icon={<Satellite className="w-4 h-4" />} title="Satellite & AI asset scan">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Label className="text-xs">Zoom</Label>
        <ToggleGroup type="single" value={String(zoom)} onValueChange={(v) => v && setZoom(Number(v))}>
          <ToggleGroupItem value="14" className="text-xs px-2 h-7">Area</ToggleGroupItem>
          <ToggleGroupItem value="16" className="text-xs px-2 h-7">Neighborhood</ToggleGroupItem>
          <ToggleGroupItem value="18" className="text-xs px-2 h-7">Site</ToggleGroupItem>
          <ToggleGroupItem value="19" className="text-xs px-2 h-7">Close-up</ToggleGroupItem>
        </ToggleGroup>
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 ml-auto">
            Open in Google Maps <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="rounded border border-border overflow-hidden bg-muted/30 aspect-square max-w-md">
        {imgLoading && <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading imagery…</div>}
        {imgError && <div className="w-full h-full flex items-center justify-center text-xs text-rose-600 p-4 text-center">{imgError}</div>}
        {imgB64 && <img src={`data:image/png;base64,${imgB64}`} alt={`Satellite ${lat.toFixed(5)}, ${lng.toFixed(5)}`} className="w-full h-full object-cover" />}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Imagery © Google · {lat.toFixed(5)}, {lng.toFixed(5)} · zoom {zoom}</p>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={runScan} disabled={scanLoading}>
          {scanLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanSearch className="w-4 h-4 mr-2" />}
          {scanLoading ? 'Analyzing…' : scan ? 'Re-run AI scan' : 'Run AI asset scan'}
        </Button>
      </div>
      {scanError && <p className="text-xs text-rose-600 mt-2">{scanError}</p>}
      {scan?.summary && <p className="text-xs text-muted-foreground mt-3 italic">{scan.summary}</p>}
      {Array.isArray(scan?.detections) && scan.detections.length > 0 && (
        <div className="mt-3">
          <MiniTable
            headers={['Type', 'Label', 'Confidence', 'Bearing', 'Dist (m)']}
            rows={scan.detections.map((d: any) => [
              <span key="t" className="text-[11px] font-mono">{d.type}</span>,
              d.label,
              <Badge key="cf" variant="outline" className="text-[9px]">{d.confidence}</Badge>,
              d.approx_bearing_deg != null ? `${Math.round(d.approx_bearing_deg)}°` : '—',
              d.approx_distance_m != null ? Math.round(d.approx_distance_m) : '—',
            ])}
          />
        </div>
      )}
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Methodology
// ────────────────────────────────────────────────────────────────────────────

function MethodologyPanel({ report, osm }: { report: SiteReportT; osm: OsmPowerResponse | null }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-2">Methodology & data provenance</p>
      <div className="text-xs space-y-2">
        <div>
          <strong>Power model:</strong> 100% sourced from OpenStreetMap via the live Overpass API. No internal/curated transmission table is consulted for the Power panel. Voltages are parsed from raw OSM <code>voltage</code> tags (kV).
        </div>
        <div>
          <strong>Distance:</strong> Haversine between site and feature centroid. Power lines use nearest-vertex along the polyline (not centroid).
        </div>
        <div>
          <strong>Interconnect score:</strong> distance (0–40) + voltage (0–35) + substation type (0–15) + operator tagged (0–10).
        </div>
        <div>
          <strong>Attribution:</strong> {osm?.attribution ?? '© OpenStreetMap contributors · openinframap.org'}. Climate data: ECCC. Seismic: NRCan. Fiber/IXP: PeeringDB and operator pages. Population: StatsCan 2021.
        </div>
        {report.data_provenance?.sources?.length ? (
          <>
            <Separator className="my-2" />
            <p className="font-semibold">Primary sources</p>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              {report.data_provenance.sources.map(s => <li key={s}>{s}</li>)}
            </ul>
          </>
        ) : null}
      </div>
    </Card>
  );
}