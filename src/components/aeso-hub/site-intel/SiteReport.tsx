import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import {
  Cable, Zap, Flame, Droplets, Truck, Download, ExternalLink, Filter,
  Thermometer, ShieldAlert, Leaf, Building2, Cloud, Network,
  Users, HardHat, Scale, Wifi, Satellite, ScanSearch, AlertTriangle, Loader2,
} from 'lucide-react';
import type { SiteReport as SiteReportT } from '@/hooks/useAlbertaSiteReport';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function fmtKm(n?: number) {
  if (n === undefined || n === null) return '—';
  return `${n.toFixed(1)} km`;
}

const CONFIDENCE_STYLE: Record<string, string> = {
  verified:  'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  modeled:   'bg-amber-500/15 text-amber-700 border-amber-500/30',
  estimated: 'bg-muted text-muted-foreground border-border',
};

function SourceLink({ url, publisher, confidence, asOf }: { url?: string | null; publisher?: string | null; confidence?: string | null; asOf?: string | null }) {
  if (!url && !publisher) return <span className="text-muted-foreground">—</span>;
  const conf = (confidence ?? 'verified').toLowerCase();
  return (
    <div className="flex items-center gap-1.5">
      {url
        ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            {publisher ?? 'source'} <ExternalLink className="w-3 h-3" />
          </a>
        : <span className="text-[11px] text-muted-foreground">{publisher}</span>}
      <span className={`text-[9px] px-1 rounded border ${CONFIDENCE_STYLE[conf] ?? CONFIDENCE_STYLE.estimated}`}>{conf}</span>
      {asOf && <span className="text-[9px] text-muted-foreground">{asOf.slice(0, 7)}</span>}
    </div>
  );
}

function KV({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="border border-border rounded p-2 bg-secondary/30">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

type RowConfidence = 'verified' | 'modeled' | 'estimated';

function classifyRow(row: any, forced?: RowConfidence): RowConfidence {
  if (forced) return forced;
  if (!row) return 'estimated';
  const conf = (row.confidence ?? '').toString().toLowerCase();
  if (conf === 'verified' || conf === 'modeled' || conf === 'estimated') return conf as RowConfidence;
  // Honest default: a row is only "verified" when it explicitly says so via
  // the `confidence` column. A bare `source_url` is not enough — many of our
  // curated rows carry plausible links to landing pages, not the exact
  // dataset that produced the number.
  return 'estimated';
}

interface CoverageInput { rows: any[]; forcedConfidence?: RowConfidence }

function computeCoverage(inputs: CoverageInput[]) {
  let verified = 0, modeled = 0, estimated = 0, total = 0;
  for (const { rows, forcedConfidence } of inputs) {
    for (const r of rows ?? []) {
      total++;
      const c = classifyRow(r, forcedConfidence);
      if (c === 'verified') verified++;
      else if (c === 'modeled') modeled++;
      else estimated++;
    }
  }
  const pct = total === 0 ? 0 : Math.round(((verified + modeled * 0.5) / total) * 100);
  return { verified, modeled, estimated, total, pct };
}

function CoverageBadge({ inputs }: { inputs: CoverageInput[] }) {
  const { verified, modeled, estimated, total, pct } = computeCoverage(inputs);
  if (total === 0) {
    return <span className="text-[10px] px-2 py-0.5 rounded border bg-muted text-muted-foreground border-border">No data</span>;
  }
  const tone =
    pct >= 80 ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
    : pct >= 50 ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-700 border-rose-500/30';
  return (
    <div
      className={`text-[10px] px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${tone}`}
      title={`${verified} verified · ${modeled} modeled · ${estimated} estimated of ${total} fields`}
    >
      <span className="font-semibold">{pct}% coverage</span>
      <span className="opacity-60">·</span>
      <span>{verified}✓</span>
      {modeled > 0 && <span>{modeled}≈</span>}
      {estimated > 0 && <span>{estimated}~</span>}
    </div>
  );
}

interface Props {
  report: SiteReportT;
}

export function SiteReport({ report }: Props) {
  const topRoutes = report.fiber.top_routes;
  const allCarriers = useMemo(() => [...new Set(topRoutes.map(r => r.carrier))], [topRoutes]);

  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(allCarriers);
  const [maxLatency, setMaxLatency] = useState<number>(60);
  const [minRouteDiversity, setMinRouteDiversity] = useState<number>(1);

  useEffect(() => {
    setSelectedCarriers(allCarriers);
    setMaxLatency(60);
    setMinRouteDiversity(1);
  }, [allCarriers]);

  const hubCarrierDiversity = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const r of topRoutes) {
      if (!map.has(r.hub)) map.set(r.hub, new Set());
      map.get(r.hub)!.add(r.carrier);
    }
    const diversityMap = new Map<string, number>();
    for (const [hub, set] of map) {
      diversityMap.set(hub, set.size);
    }
    return diversityMap;
  }, [topRoutes]);

  const maxHubDiversity = useMemo(() => Math.max(1, ...hubCarrierDiversity.values()), [hubCarrierDiversity]);

  const filteredRoutes = useMemo(() => {
    return topRoutes.filter(r => {
      if (!selectedCarriers.includes(r.carrier)) return false;
      if (r.latency_ms != null && r.latency_ms > maxLatency) return false;
      if ((hubCarrierDiversity.get(r.hub) ?? 0) < minRouteDiversity) return false;
      return true;
    });
  }, [topRoutes, selectedCarriers, maxLatency, minRouteDiversity, hubCarrierDiversity]);

  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Alberta Site Intelligence Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Location: ${report.location.label ?? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}`, 14, 26);
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 14, 32);

    autoTable(doc, {
      startY: 38, head: [['Carrier POP', 'City', 'Distance', 'YYC ms', 'SEA ms', 'ORD ms']],
      body: report.fiber.nearest_pops.map(p => [
        `${p.carrier} – ${p.facility_name}`, p.city, fmtKm(p.distance_km),
        p.latency_to_yyc_ms ?? '—', p.latency_to_sea_ms ?? '—', p.latency_to_ord_ms ?? '—',
      ]),
      headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
    });

    autoTable(doc, {
      head: [['Transmission line', 'kV', 'Owner', 'Distance']],
      body: report.transmission.nearest_lines.map((t: any) => [t.name, t.voltage_kv, t.owner, fmtKm(t.distance_km)]),
      headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
    });

    autoTable(doc, {
      head: [['Gas pipeline', 'Operator', 'Diameter', 'Distance']],
      body: report.gas_and_water.nearest_gas_pipelines.map((g: any) => [g.name, g.operator, `${g.diameter_mm}mm`, fmtKm(g.distance_km)]),
      headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
    });

    autoTable(doc, {
      head: [['Water source', 'Type', 'Distance']],
      body: report.gas_and_water.nearest_water_sources.map((w: any) => [w.name, w.type, fmtKm(w.distance_km)]),
      headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
    });

    autoTable(doc, {
      head: [['Industrial park', 'Municipality', 'Power MW', 'Distance']],
      body: report.logistics.nearest_industrial_parks.map((p: any) => [p.name, p.municipality, p.available_power_mw ?? '—', fmtKm(p.distance_km)]),
      headStyles: { fillColor: [10, 22, 40] }, styles: { fontSize: 8 },
    });

    doc.save(`alberta-site-report-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hyperscaler Site Intelligence Report</h3>
          <p className="text-xs text-muted-foreground">
            {report.location.label ?? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CoverageBadge inputs={[
            { rows: report.fiber.nearest_pops, forcedConfidence: 'verified' },
            { rows: report.fiber.nearest_long_haul_routes, forcedConfidence: 'verified' },
            { rows: report.fiber.nearest_ixps, forcedConfidence: 'verified' },
            { rows: report.fiber.cloud_reach ?? [], forcedConfidence: 'modeled' },
            { rows: report.transmission.nearest_lines, forcedConfidence: 'verified' },
            { rows: report.transmission.nearest_substations ?? [], forcedConfidence: 'verified' },
            { rows: report.climate ? [report.climate] : [], forcedConfidence: 'verified' },
            { rows: report.risk ? [report.risk] : [], forcedConfidence: 'verified' },
            { rows: report.gas_and_water.nearest_gas_pipelines, forcedConfidence: 'verified' },
            { rows: report.gas_and_water.nearest_water_sources, forcedConfidence: 'verified' },
            { rows: report.gas_and_water.nearest_water_licences ?? [], forcedConfidence: 'verified' },
            { rows: report.logistics.nearest_industrial_parks, forcedConfidence: 'estimated' },
            { rows: report.logistics.nearest_logistics_assets ?? [], forcedConfidence: 'verified' },
            { rows: report.logistics.nearest_population_centres ?? [], forcedConfidence: 'verified' },
            { rows: report.workforce?.nearest_centres ?? [], forcedConfidence: 'estimated' },
            { rows: report.workforce?.post_secondary_within_200km ?? [], forcedConfidence: 'estimated' },
            { rows: report.construction?.epc_firms ?? [], forcedConfidence: 'estimated' },
            { rows: report.construction?.union_vs_open_wages ?? [], forcedConfidence: 'estimated' },
            { rows: report.regulatory?.nearest_zone ? [report.regulatory.nearest_zone] : [], forcedConfidence: 'estimated' },
            { rows: report.connectivity_depth?.carrier_pop_details ?? [], forcedConfidence: 'estimated' },
            { rows: report.connectivity_depth?.dark_fiber_segments_nearby ?? [], forcedConfidence: 'estimated' },
          ]} />
          <Button onClick={handlePdf} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>
      <DataAccuracyBanner />

      <Section
        icon={<Cable className="w-4 h-4" />}
        title="Fiber & Network"
        subtitle="Closest carrier POPs and long-haul corridors"
        right={<CoverageBadge inputs={[
          { rows: report.fiber.nearest_pops, forcedConfidence: 'verified' },
          { rows: report.fiber.nearest_long_haul_routes, forcedConfidence: 'verified' },
          { rows: report.fiber.nearest_ixps, forcedConfidence: 'verified' },
          { rows: report.fiber.cloud_reach ?? [], forcedConfidence: 'modeled' },
        ]} />}
      >
        <div className="flex flex-wrap items-end gap-4 mb-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Filter className="w-3 h-3" /> Carriers</Label>
            <ToggleGroup type="multiple" value={selectedCarriers} onValueChange={setSelectedCarriers}>
              {allCarriers.map(c => (
                <ToggleGroupItem key={c} value={c} className="text-xs px-2 py-1 h-7">{c}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-1 w-28">
            <Label className="text-xs">Max latency: {maxLatency} ms</Label>
            <Slider value={[maxLatency]} onValueChange={([v]) => setMaxLatency(v)} min={1} max={60} step={1} />
          </div>
          <div className="space-y-1 w-28">
            <Label className="text-xs">Min route diversity: {minRouteDiversity}</Label>
            <Slider value={[minRouteDiversity]} onValueChange={([v]) => setMinRouteDiversity(Math.min(v, maxHubDiversity))} min={1} max={maxHubDiversity} step={1} />
          </div>
        </div>
        <p className="text-xs font-semibold mt-4 mb-2">Top routes (ranked)</p>
        <Table headers={['#', 'Carrier', 'POP', 'City', 'Site→POP', 'Hub', 'Latency']}
          rows={filteredRoutes.map(r => [
            <Badge key="r" variant="outline">{r.rank}</Badge>, <strong key="c">{r.carrier}</strong>, r.pop, r.pop_city,
            `${r.site_to_pop_km} km`, r.hub, r.latency_ms != null ? `${r.latency_ms} ms` : '—',
          ])} />
        <p className="text-xs font-semibold mt-4 mb-2">Nearest POPs</p>
        <Table headers={['Carrier', 'Facility', 'City', 'Distance', 'Services', 'YYC ms', 'YEG ms', 'SEA ms', 'ORD ms', 'Source']}
          rows={report.fiber.nearest_pops.map(p => [
            <strong key="c">{p.carrier}</strong>, p.facility_name, p.city, fmtKm(p.distance_km),
            <div className="flex flex-wrap gap-1" key="s">{(p.services ?? []).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}</div>,
            p.latency_to_yyc_ms ?? '—', p.latency_to_yeg_ms ?? '—', p.latency_to_sea_ms ?? '—', p.latency_to_ord_ms ?? '—',
            p.source_url ? <a key="u" href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1"><ExternalLink className="w-3 h-3"/></a> : '—',
          ])} />
        <div className="text-xs text-muted-foreground mt-3">
          Long-haul routes within 100 km: {report.fiber.nearest_long_haul_routes.filter(r => (r.distance_km ?? 999) < 100).map(r => `${r.carrier} (${fmtKm(r.distance_km)})`).join(' · ') || 'none'}
        </div>

        <p className="text-xs font-semibold mt-4 mb-2 flex items-center gap-2"><Cloud className="w-3 h-3" /> Hyperscaler cloud reach (modeled one-way latency)</p>
        <Table headers={['Provider', 'Region', 'Distance', 'Modeled latency', 'Source']}
          rows={(report.fiber.cloud_reach ?? []).map(c => [
            <strong key="p">{c.provider}</strong>,
            <span key="r"><code className="text-[10px]">{c.region_code}</code> <span className="text-muted-foreground"> {c.region_name}</span></span>,
            `${c.distance_km} km`,
            <strong key="l">{c.modeled_latency_ms_one_way} ms</strong>,
            <SourceLink key="s" url={c.source_url} publisher={c.provider} confidence="modeled" />,
          ])} />

        <p className="text-xs font-semibold mt-4 mb-2 flex items-center gap-2"><Network className="w-3 h-3" /> Internet exchanges</p>
        <Table headers={['IXP', 'City', 'Participants', 'Peak (Gbps)', 'Distance', 'Source']}
          rows={(report.fiber.nearest_ixps ?? []).map(x => [
            <strong key="n">{x.name}</strong>, x.city, x.participant_count ?? '—', x.peak_traffic_gbps ?? '—',
            fmtKm(x.distance_km),
            <SourceLink key="s" url={x.source_url} publisher="PeeringDB" confidence="verified" />,
          ])} />
      </Section>

      <Section
        icon={<Zap className="w-4 h-4" />}
        title="Power & Transmission"
        subtitle="AESO transmission lines, substations, and grid posture"
        right={<CoverageBadge inputs={[
          { rows: report.transmission.nearest_lines, forcedConfidence: 'verified' },
          { rows: report.transmission.nearest_substations ?? [], forcedConfidence: 'verified' },
        ]} />}
      >
        <Table headers={['Line', 'kV', 'Owner', 'Distance']}
          rows={report.transmission.nearest_lines.map((t: any) => [t.name, <Badge key="v" variant="outline">{t.voltage_kv} kV</Badge>, t.owner, fmtKm(t.distance_km)])} />
        {(report.transmission.nearest_substations ?? []).length > 0 && (
          <>
            <p className="text-xs font-semibold mt-4 mb-2">Nearby substations</p>
            <Table headers={['Substation', 'City', 'Voltage', 'Owner', 'Distance']}
              rows={(report.transmission.nearest_substations ?? []).map((s: any) => [s.name, s.city, s.voltage_level ?? '—', s.utility_owner ?? '—', fmtKm(s.distance_km)])} />
          </>
        )}
        <div className="text-[10px] text-muted-foreground mt-2">Source: AESO Transmission Map — https://www.aeso.ca/grid/projects/</div>
      </Section>

      {report.climate && (
        <Section
          icon={<Thermometer className="w-4 h-4" />}
          title="Climate & Cooling"
          subtitle={`ECCC normals 1991–2020 · ${report.climate.station_name}`}
          right={<CoverageBadge inputs={[{ rows: [report.climate], forcedConfidence: 'verified' }]} />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <KV label="Mean annual T" value={`${report.climate.mean_annual_dry_bulb_c ?? '—'} °C`} />
            <KV label="ASHRAE 0.4% design DB" value={`${report.climate.ashrae_04_design_db_c ?? '—'} °C`} />
            <KV label="ASHRAE 1% design DB" value={`${report.climate.ashrae_1_design_db_c ?? '—'} °C`} />
            <KV label="Mean-coincident WB" value={`${report.climate.ashrae_04_mcwb_c ?? '—'} °C`} />
            <KV label="Free-cool hrs <18 °C" value={(report.climate.free_cooling_hours_below_18c ?? 0).toLocaleString()} />
            <KV label="Free-cool hrs <10 °C" value={(report.climate.free_cooling_hours_below_10c ?? 0).toLocaleString()} />
            <KV label="Evap hrs >24 °C" value={(report.climate.evap_hours_above_24c ?? 0).toLocaleString()} />
            <KV label="ASHRAE zone" value={report.climate.ashrae_climate_zone ?? '—'} />
          </div>
          <div className="mt-2"><SourceLink url={report.climate.source_url} publisher={report.climate.source_publisher} confidence="verified" asOf={report.climate.source_as_of} /></div>
        </Section>
      )}

      {report.risk && (
        <Section
          icon={<ShieldAlert className="w-4 h-4" />}
          title="Natural-Hazard Risk"
          subtitle={report.risk.region_name}
          right={<CoverageBadge inputs={[{ rows: [report.risk], forcedConfidence: 'verified' }]} />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <KV label="Seismic PGA" value={`${report.risk.seismic_pga_g ?? '—'} g`} sub={report.risk.seismic_rating ?? ''} />
            <KV label="Wildfire" value={report.risk.wildfire_rating ?? '—'} />
            <KV label="Flood" value={report.risk.flood_rating ?? '—'} />
            <KV label="Tornado" value={report.risk.tornado_rating ?? '—'} />
          </div>
          <div className="mt-2"><SourceLink url={report.risk.source_url} publisher={report.risk.source_publisher} confidence="verified" /></div>
        </Section>
      )}

      <Section
        icon={<Flame className="w-4 h-4" />}
        title="Natural Gas & Water"
        subtitle="Process fuel and cooling sources"
        right={<CoverageBadge inputs={[
          { rows: report.gas_and_water.nearest_gas_pipelines, forcedConfidence: 'verified' },
          { rows: report.gas_and_water.nearest_water_sources, forcedConfidence: 'verified' },
          { rows: report.gas_and_water.nearest_water_licences ?? [], forcedConfidence: 'verified' },
        ]} />}
      >
        <Table headers={['Gas pipeline', 'Operator', 'Diameter', 'Pressure', 'Distance', 'Source']}
          rows={report.gas_and_water.nearest_gas_pipelines.map((g: any) => [g.name, g.operator, `${g.diameter_mm} mm`, `${g.pressure_kpa} kPa`, fmtKm(g.distance_km),
            <SourceLink key="s" url={g.source_url} publisher={g.source_publisher ?? 'CER'} confidence={g.confidence} asOf={g.source_as_of} />])} />
        <p className="text-xs font-semibold mt-4 mb-2 flex items-center gap-2"><Droplets className="w-3 h-3" /> Surface-water sources</p>
        <Table headers={['Source', 'Type', 'Sub-basin', 'Allocation', 'Distance', 'Source']}
          rows={report.gas_and_water.nearest_water_sources.map((w: any) => [w.name, w.type, (w as any).sub_basin ?? '—',
            <Badge key="a" variant={(w as any).allocation_status === 'closed' ? 'destructive' : 'secondary'}>{(w as any).allocation_status ?? 'unknown'}</Badge>,
            fmtKm(w.distance_km),
            <SourceLink key="s" url={w.source_url} publisher={(w as any).source_publisher ?? 'Alberta EPA'} confidence={(w as any).confidence} asOf={(w as any).source_as_of} />])} />
        {(report.gas_and_water.nearest_water_licences?.length ?? 0) > 0 && (
          <>
            <p className="text-xs font-semibold mt-4 mb-2">Licensed industrial water diversions (Water Act)</p>
            <Table headers={['Licensee', 'Source', 'Licensed m³/yr', 'Purpose', 'Basin', 'Distance', 'Source']}
              rows={(report.gas_and_water.nearest_water_licences ?? []).map((l: any) => [
                <strong key="n">{l.licensee}</strong>, l.source_water_body,
                l.licensed_m3_per_year != null ? Number(l.licensed_m3_per_year).toLocaleString() : '—',
                l.purpose ?? '—', l.sub_basin ?? '—', fmtKm(l.distance_km),
                <SourceLink key="s" url={l.source_url} publisher="Alberta EPA" confidence="verified" />,
              ])} />
          </>
        )}
      </Section>

      <Section
        icon={<Truck className="w-4 h-4" />}
        title="Site Logistics & Workforce"
        subtitle="Industrial parks, transport, and labour"
        right={<CoverageBadge inputs={[
          { rows: report.logistics.nearest_industrial_parks, forcedConfidence: 'estimated' },
          { rows: report.logistics.nearest_logistics_assets ?? [], forcedConfidence: 'verified' },
          { rows: report.logistics.nearest_population_centres ?? [], forcedConfidence: 'verified' },
        ]} />}
      >
        <Table headers={['Industrial park', 'Municipality', 'Available power', 'Zoning', 'Distance', 'Source']}
          rows={report.logistics.nearest_industrial_parks.map((p: any) => [p.name, p.municipality, p.available_power_mw ? `${p.available_power_mw} MW` : '—', p.zoning ?? '—', fmtKm(p.distance_km),
            <SourceLink key="s" url={p.source_url} publisher={(p as any).source_publisher ?? 'Municipality'} confidence={(p as any).confidence} asOf={(p as any).source_as_of} />])} />
        <p className="text-xs font-semibold mt-4 mb-2">Transport assets (airport · rail · heavy-haul · intermodal)</p>
        <Table headers={['Type', 'Asset', 'Operator', 'Distance', 'Source']}
          rows={(report.logistics.nearest_logistics_assets ?? []).map((l: any) => [
            <Badge key="t" variant="outline" className="text-[10px]">{l.asset_type.replace(/_/g,' ')}</Badge>,
            l.name, l.operator ?? '—', fmtKm(l.distance_km),
            <SourceLink key="s" url={l.source_url} publisher={(l as any).source_publisher ?? 'Operator'} confidence="verified" />,
          ])} />
        <p className="text-xs font-semibold mt-4 mb-2">Workforce — population centres (StatsCan 2021)</p>
        <Table headers={['Centre', 'Population', 'Labour force', 'Trades (est.)', 'Distance', 'Source']}
          rows={(report.logistics.nearest_population_centres ?? []).map((p: any) => [
            <strong key="n">{p.name}</strong>, p.population_2021?.toLocaleString() ?? '—',
            p.labour_force_2021?.toLocaleString() ?? '—', p.trades_workers_estimate?.toLocaleString() ?? '—',
            fmtKm(p.distance_km),
            <SourceLink key="s" url={p.source_url} publisher="StatsCan" confidence="verified" asOf="2021-05-11" />,
          ])} />
        <p className="text-xs font-semibold mt-4 mb-2">Drive times</p>
        <Table headers={['Hub', 'Distance', 'Est. drive time']}
          rows={report.logistics.drive_times.map(d => [`${d.hub} (${d.code})`, `${d.distance_km} km`, `${d.drive_hours_est} h`])} />
        <p className="text-[10px] text-muted-foreground mt-2">Drive times estimated at 95 km/h avg highway speed; replace with Routes API for full traffic-aware estimates.</p>
      </Section>

      {report.workforce && (
        <Section
          icon={<Users className="w-4 h-4" />}
          title="Workforce & Talent"
          subtitle="Labour pool, trades supply, and post-secondary pipeline"
          right={<CoverageBadge inputs={[
            { rows: report.workforce.nearest_centres ?? [], forcedConfidence: 'estimated' },
            { rows: report.workforce.post_secondary_within_200km ?? [], forcedConfidence: 'estimated' },
          ]} />}
        >
          <Table headers={['Centre', 'Labour force', 'Unemploy.', '% Post-sec', 'Electricians', 'HVAC techs', 'IT workers', 'Med. electrician $/hr', 'Distance', 'Source']}
            rows={(report.workforce.nearest_centres ?? []).map((w: any) => [
              <strong key="n">{w.centre_name}</strong>,
              w.labour_force?.toLocaleString() ?? '—',
              w.unemployment_rate != null ? `${w.unemployment_rate}%` : '—',
              w.pct_post_secondary != null ? `${w.pct_post_secondary}%` : '—',
              w.electricians_count?.toLocaleString() ?? '—',
              w.hvac_techs_count?.toLocaleString() ?? '—',
              w.it_workers_count?.toLocaleString() ?? '—',
              w.median_wage_electrician != null ? `$${w.median_wage_electrician}` : '—',
              fmtKm(w.distance_km),
              <SourceLink key="s" url={w.source_url} publisher="StatsCan / Alberta LFS" confidence="verified" asOf={w.last_verified} />,
            ])} />
          <p className="text-xs font-semibold mt-4 mb-2">Post-secondary programs within 200 km</p>
          <Table headers={['Institution', 'City', 'Programs', 'Annual relevant grads', 'Distance', 'Source']}
            rows={(report.workforce.post_secondary_within_200km ?? []).map((s: any) => [
              <strong key="n">{s.institution_name}</strong>, s.city ?? '—',
              <div key="p" className="flex flex-wrap gap-1">{(s.program_focus ?? []).map((p: string) => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}</div>,
              s.annual_grads_relevant?.toLocaleString() ?? '—',
              fmtKm(s.distance_km),
              <SourceLink key="src" url={s.source_url} publisher="Institution" confidence="verified" />,
            ])} />
        </Section>
      )}

      {report.construction && (
        <Section
          icon={<HardHat className="w-4 h-4" />}
          title="Construction & EPC Capacity"
          subtitle="Alberta GC/EPC firms and prevailing trade wages"
          right={<CoverageBadge inputs={[
            { rows: report.construction.epc_firms ?? [], forcedConfidence: 'estimated' },
            { rows: report.construction.union_vs_open_wages ?? [], forcedConfidence: 'estimated' },
          ]} />}
        >
          <Table headers={['Firm', 'HQ / Office', 'Mega-project capable', 'Labour model', 'Recent projects', 'Source']}
            rows={(report.construction.epc_firms ?? []).map((f: any) => [
              <strong key="n">{f.firm_name}</strong>, f.hq_city ?? '—',
              f.mega_project_capable ? <Badge key="y" className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">Yes</Badge> : 'No',
              f.union_status ?? '—',
              <span key="rp" className="text-[10px] text-muted-foreground">{Array.isArray(f.recent_projects) ? f.recent_projects.map((p: any) => p.name).join(', ') : '—'}</span>,
              <SourceLink key="s" url={f.source_url} publisher={f.firm_name} confidence="verified" />,
            ])} />
          <p className="text-xs font-semibold mt-4 mb-2">Union vs. open-shop wage table (Alberta Wage &amp; Salary Survey)</p>
          <Table headers={['Trade', 'Union $/hr', 'Open-shop $/hr', 'Benefits loading', 'Source']}
            rows={(report.construction.union_vs_open_wages ?? []).map((w: any) => [
              <strong key="t">{w.trade}</strong>,
              w.union_rate_cad_hr != null ? `$${w.union_rate_cad_hr}` : '—',
              w.open_shop_rate_cad_hr != null ? `$${w.open_shop_rate_cad_hr}` : '—',
              w.benefits_loading_pct != null ? `${w.benefits_loading_pct}%` : '—',
              <SourceLink key="s" url={w.source_url} publisher="GoA" confidence="verified" />,
            ])} />
        </Section>
      )}

      {report.regulatory?.nearest_zone && (
        <Section
          icon={<Scale className="w-4 h-4" />}
          title="Tax, Land & Regulatory"
          subtitle={report.regulatory.nearest_zone.municipality}
          right={<CoverageBadge inputs={[{ rows: [report.regulatory.nearest_zone], forcedConfidence: 'estimated' }]} />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <KV label="Non-res mill rate" value={report.regulatory.nearest_zone.mill_rate_non_residential != null ? `${report.regulatory.nearest_zone.mill_rate_non_residential}` : '—'} />
            <KV label="M&E exempt"
              value={report.regulatory.nearest_zone.machinery_equipment_exempt
                ? <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">Yes</Badge>
                : <Badge variant="outline">No</Badge>} />
            <KV label="School tax rate" value={report.regulatory.nearest_zone.school_tax_rate ?? '—'} />
            <KV label="AER region" value={report.regulatory.nearest_zone.aer_region ?? '—'} />
            <KV label="AUC permit (typical)" value={report.regulatory.nearest_zone.auc_typical_permit_weeks != null ? `${report.regulatory.nearest_zone.auc_typical_permit_weeks} wks` : '—'} />
            <KV label="Treaty area" value={report.regulatory.nearest_zone.treaty_area ?? '—'} />
            <KV label="Indigenous consultation"
              value={report.regulatory.nearest_zone.indigenous_consultation_required
                ? <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">Required</Badge>
                : <Badge variant="outline">Not flagged</Badge>} />
            <KV label="Distance to centre" value={fmtKm(report.regulatory.nearest_zone.distance_km)} />
          </div>
          <div className="mt-2"><SourceLink url={report.regulatory.nearest_zone.source_url} publisher="Municipality / AUC / ACO" confidence="verified" /></div>
        </Section>
      )}

      {report.connectivity_depth && (
        <Section
          icon={<Wifi className="w-4 h-4" />}
          title="Connectivity Depth"
          subtitle="Carrier-hotel access, last-mile providers, dark fiber inventory"
          right={<CoverageBadge inputs={[
            { rows: report.connectivity_depth.carrier_pop_details ?? [], forcedConfidence: 'estimated' },
            { rows: report.connectivity_depth.last_mile_in_municipality ? [report.connectivity_depth.last_mile_in_municipality] : [], forcedConfidence: 'estimated' },
            { rows: report.connectivity_depth.dark_fiber_segments_nearby ?? [], forcedConfidence: 'estimated' },
          ]} />}
        >
          <p className="text-xs font-semibold mb-2">Carrier hotels & MMR facilities</p>
          <Table headers={['Facility', 'City', 'Type', 'Open access', 'X-connect $', 'Carriers on-net', 'Distance', 'Source']}
            rows={(report.connectivity_depth.carrier_pop_details ?? []).map((p: any) => [
              <strong key="n">{p.facility_name}</strong>, p.city ?? '—', p.facility_type ?? '—',
              p.open_access ? <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">Open</Badge> : <Badge variant="outline">Private</Badge>,
              p.cross_connect_fee_estimate_cad != null ? `$${p.cross_connect_fee_estimate_cad}/mo` : '—',
              <div key="c" className="flex flex-wrap gap-1 max-w-[280px]">{(p.carriers_on_net ?? []).map((c: string) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}</div>,
              fmtKm(p.distance_km),
              <SourceLink key="s" url={p.source_url} publisher="Operator" confidence="verified" />,
            ])} />
          {report.connectivity_depth.last_mile_in_municipality && (
            <>
              <p className="text-xs font-semibold mt-4 mb-2">Last-mile providers in {report.connectivity_depth.last_mile_in_municipality.population_centre}</p>
              <Table headers={['Provider', 'Max speed', 'Technology']}
                rows={(report.connectivity_depth.last_mile_in_municipality.providers ?? []).map((pr: any) => [
                  <strong key="n">{pr.name}</strong>, `${pr.max_speed_gbps} Gbps`, pr.technology,
                ])} />
              <div className="mt-1"><SourceLink url={report.connectivity_depth.last_mile_in_municipality.source_url} publisher="CRTC / ISED" confidence="verified" /></div>
            </>
          )}
          <p className="text-xs font-semibold mt-4 mb-2">Dark fiber segments within reach</p>
          <Table headers={['Segment', 'Owner', 'Lit / Dark', 'Conduit owner', 'IFA est.', 'Distance', 'Source']}
            rows={(report.connectivity_depth.dark_fiber_segments_nearby ?? []).map((d: any) => [
              <strong key="n">{d.segment_name}</strong>, d.owner ?? '—', d.lit_or_dark ?? '—',
              d.conduit_owner ?? '—', d.ifa_count_estimate ?? '—',
              fmtKm(d.distance_km),
              d.source_url === 'estimate'
                ? <Badge key="e" variant="outline" className="text-[9px]">estimate</Badge>
                : <SourceLink key="s" url={d.source_url} publisher="Operator" confidence="verified" />,
            ])} />
        </Section>
      )}

      <AerialScanSection report={report} />

      <Card className="p-4 bg-muted/30">
        <p className="text-xs font-semibold mb-2">Methodology & Data Provenance</p>
        <div className="text-[11px] space-y-1 mb-3">
          {report.methodology?.modeled_latency && <p><strong>Modeled latency:</strong> {report.methodology.modeled_latency}</p>}
          {report.methodology?.distance && <p><strong>Distance:</strong> {report.methodology.distance}</p>}
        </div>
        {report.data_provenance?.sources?.length ? (
          <>
            <Separator className="my-2" />
            <p className="text-xs font-semibold mb-1">Primary sources</p>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
              {report.data_provenance.sources.map(s => <li key={s}>{s}</li>)}
            </ul>
          </>
        ) : null}
        {report.data_provenance?.notes && (
          <>
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground">{report.data_provenance.notes}</p>
          </>
        )}
      </Card>
    </div>
  );
}

function AerialScanSection({ report }: { report: SiteReportT }) {
  const { lat, lng } = report.location;
  const [zoom, setZoom] = useState<number>(18);
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);

  const [scan, setScan] = useState<any | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImgLoading(true);
    setImgError(null);
    setImgB64(null);
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
    setScanLoading(true);
    setScanError(null);
    setScan(null);
    const { data, error } = await supabase.functions.invoke('site-asset-vision', { body: { lat, lng, zoom } });
    setScanLoading(false);
    if (error) { setScanError(error.message); return; }
    if (data?.error) { setScanError(data.error); return; }
    setScan(data);
  };

  // Dataset cross-check: find nearby items per detection type
  const datasetByType = useMemo(() => {
    const subs = (report.transmission?.nearest_substations ?? []) as any[];
    const lines = (report.transmission?.nearest_lines ?? []) as any[];
    const gas = (report.gas_and_water?.nearest_gas_pipelines ?? []) as any[];
    const water = (report.gas_and_water?.nearest_water_sources ?? []) as any[];
    const logi = (report.logistics?.nearest_logistics_assets ?? []) as any[];
    return { substation: subs, transmission_line: lines, gas_pipeline: gas, gas_regulator: gas, water_body: water, water_treatment: water, rail: logi };
  }, [report]);

  function isCovered(type: string, distM?: number | null) {
    const arr = (datasetByType as any)[type] as any[] | undefined;
    if (!arr || arr.length === 0) return false;
    const thresholdKm = distM != null ? Math.max(1, distM / 1000 * 1.5) : 1;
    return arr.some(r => (r.distance_km ?? 99) <= thresholdKm);
  }

  const confTone: Record<string, string> = {
    high: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Section
      icon={<Satellite className="w-4 h-4" />}
      title="Aerial Imagery & AI Asset Scan"
      subtitle="Satellite view of the site plus an AI pass that flags visible infrastructure and cross-checks it against our dataset."
    >
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
        {imgB64 && <img src={`data:image/png;base64,${imgB64}`} alt={`Satellite view at ${lat.toFixed(5)}, ${lng.toFixed(5)}`} className="w-full h-full object-cover" />}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Imagery © Google · {lat.toFixed(5)}, {lng.toFixed(5)} · zoom {zoom}</p>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={runScan} disabled={scanLoading}>
          {scanLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanSearch className="w-4 h-4 mr-2" />}
          {scanLoading ? 'Analyzing image…' : scan ? 'Re-run AI scan' : 'Run AI asset scan'}
        </Button>
        {scan?.image_quality && (
          <Badge variant="outline" className="text-[10px]">Image quality: {scan.image_quality}</Badge>
        )}
      </div>
      {scanError && <p className="text-xs text-rose-600 mt-2">{scanError}</p>}

      {scan?.summary && <p className="text-xs text-muted-foreground mt-3 italic">{scan.summary}</p>}

      {Array.isArray(scan?.detections) && scan.detections.length > 0 && (
        <div className="mt-3">
          <Table
            headers={['Type', 'Label', 'Confidence', 'Bearing', 'Dist (m)', 'Cross-check', 'Notes']}
            rows={scan.detections.map((d: any) => {
              const cross = ['substation','transmission_line','gas_pipeline','gas_regulator','water_body','water_treatment','rail'].includes(d.type)
                ? (isCovered(d.type, d.approx_distance_m)
                    ? <Badge key="c" variant="outline" className={`text-[9px] ${confTone.high}`}>in dataset</Badge>
                    : <Badge key="c" variant="outline" className="text-[9px] bg-rose-500/15 text-rose-700 border-rose-500/30 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> possibly missing</Badge>)
                : <span key="c" className="text-[10px] text-muted-foreground">—</span>;
              return [
                <span key="t" className="text-[11px] font-mono">{d.type}</span>,
                <span key="l" className="font-medium">{d.label}</span>,
                <Badge key="cf" variant="outline" className={`text-[9px] ${confTone[d.confidence] ?? confTone.low}`}>{d.confidence}</Badge>,
                d.approx_bearing_deg != null ? `${Math.round(d.approx_bearing_deg)}°` : '—',
                d.approx_distance_m != null ? Math.round(d.approx_distance_m) : '—',
                cross,
                <span key="n" className="text-[10px] text-muted-foreground">{d.notes ?? ''}</span>,
              ];
            })}
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            AI detections are best-effort and may include false positives. Items flagged "possibly missing" deserve a manual review — they may be assets absent from our reference tables (e.g. a new substation).
          </p>
        </div>
      )}
    </Section>
  );
}

function Section({ icon, title, subtitle, right, children }: { icon: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
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

function Table({ headers, rows }: { headers: string[]; rows: (React.ReactNode)[][] }) {
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
          {rows.length === 0 && <tr><td colSpan={headers.length} className="text-center py-3 text-muted-foreground">No data within range</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
