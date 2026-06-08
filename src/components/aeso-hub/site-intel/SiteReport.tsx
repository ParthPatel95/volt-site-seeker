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
} from 'lucide-react';
import type { SiteReport as SiteReportT } from '@/hooks/useAlbertaSiteReport';
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
        <Button onClick={handlePdf} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <HyperscalerScoreCard score={report.hyperscaler_score} />

      <Section icon={<Cable className="w-4 h-4" />} title="Fiber & Network" subtitle="Closest carrier POPs and long-haul corridors">
        <FiberScoreCard score={report.fiber.score} />
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
        <Table headers={['#', 'Carrier', 'POP', 'City', 'Site→POP', 'Hub', 'Latency', 'Score']}
          rows={filteredRoutes.map(r => [
            <Badge key="r" variant="outline">{r.rank}</Badge>, <strong key="c">{r.carrier}</strong>, r.pop, r.pop_city,
            `${r.site_to_pop_km} km`, r.hub, r.latency_ms != null ? `${r.latency_ms} ms` : '—',
            <Badge key="s" variant="secondary">{r.composite}</Badge>,
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
          rows={report.fiber.cloud_reach.map(c => [
            <strong key="p">{c.provider}</strong>,
            <span key="r"><code className="text-[10px]">{c.region_code}</code> <span className="text-muted-foreground"> {c.region_name}</span></span>,
            `${c.distance_km} km`,
            <strong key="l">{c.modeled_latency_ms_one_way} ms</strong>,
            <SourceLink key="s" url={c.source_url} publisher={c.provider} confidence="modeled" />,
          ])} />

        <p className="text-xs font-semibold mt-4 mb-2 flex items-center gap-2"><Network className="w-3 h-3" /> Internet exchanges</p>
        <Table headers={['IXP', 'City', 'Participants', 'Peak (Gbps)', 'Distance', 'Source']}
          rows={report.fiber.nearest_ixps.map(x => [
            <strong key="n">{x.name}</strong>, x.city, x.participant_count ?? '—', x.peak_traffic_gbps ?? '—',
            fmtKm(x.distance_km),
            <SourceLink key="s" url={x.source_url} publisher="PeeringDB" confidence="verified" />,
          ])} />
      </Section>

      <Section icon={<Zap className="w-4 h-4" />} title="Power & Transmission" subtitle="AESO transmission lines, substations, and grid posture">
        <Table headers={['Line', 'kV', 'Owner', 'Distance']}
          rows={report.transmission.nearest_lines.map((t: any) => [t.name, <Badge key="v" variant="outline">{t.voltage_kv} kV</Badge>, t.owner, fmtKm(t.distance_km)])} />
        {report.transmission.nearest_substations.length > 0 && (
          <>
            <p className="text-xs font-semibold mt-4 mb-2">Nearby substations</p>
            <Table headers={['Substation', 'City', 'Voltage', 'Owner', 'Distance']}
              rows={report.transmission.nearest_substations.map((s: any) => [s.name, s.city, s.voltage_level ?? '—', s.utility_owner ?? '—', fmtKm(s.distance_km)])} />
          </>
        )}
        <div className="text-[10px] text-muted-foreground mt-2">Source: AESO Transmission Map — https://www.aeso.ca/grid/projects/</div>
      </Section>

      {report.climate && (
        <Section icon={<Thermometer className="w-4 h-4" />} title="Climate & Cooling" subtitle={`ECCC normals 1991–2020 · ${report.climate.station_name}`}>
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
        <Section icon={<ShieldAlert className="w-4 h-4" />} title="Natural-Hazard Risk" subtitle={report.risk.region_name}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <KV label="Seismic PGA" value={`${report.risk.seismic_pga_g ?? '—'} g`} sub={report.risk.seismic_rating ?? ''} />
            <KV label="Wildfire" value={report.risk.wildfire_rating ?? '—'} />
            <KV label="Flood" value={report.risk.flood_rating ?? '—'} />
            <KV label="Tornado" value={report.risk.tornado_rating ?? '—'} />
          </div>
          <div className="mt-2"><SourceLink url={report.risk.source_url} publisher={report.risk.source_publisher} confidence="verified" /></div>
        </Section>
      )}

      <Section icon={<Flame className="w-4 h-4" />} title="Natural Gas & Water" subtitle="Process fuel and cooling sources">
        <Table headers={['Gas pipeline', 'Operator', 'Diameter', 'Pressure', 'Distance', 'Source']}
          rows={report.gas_and_water.nearest_gas_pipelines.map((g: any) => [g.name, g.operator, `${g.diameter_mm} mm`, `${g.pressure_kpa} kPa`, fmtKm(g.distance_km),
            <SourceLink key="s" url={g.source_url} publisher={g.source_publisher ?? 'CER'} confidence={g.confidence} asOf={g.source_as_of} />])} />
        <p className="text-xs font-semibold mt-4 mb-2 flex items-center gap-2"><Droplets className="w-3 h-3" /> Surface-water sources</p>
        <Table headers={['Source', 'Type', 'Sub-basin', 'Allocation', 'Distance', 'Source']}
          rows={report.gas_and_water.nearest_water_sources.map((w: any) => [w.name, w.type, (w as any).sub_basin ?? '—',
            <Badge key="a" variant={(w as any).allocation_status === 'closed' ? 'destructive' : 'secondary'}>{(w as any).allocation_status ?? 'unknown'}</Badge>,
            fmtKm(w.distance_km),
            <SourceLink key="s" url={w.source_url} publisher={(w as any).source_publisher ?? 'Alberta EPA'} confidence={(w as any).confidence} asOf={(w as any).source_as_of} />])} />
        {report.gas_and_water.nearest_water_licences?.length > 0 && (
          <>
            <p className="text-xs font-semibold mt-4 mb-2">Licensed industrial water diversions (Water Act)</p>
            <Table headers={['Licensee', 'Source', 'Licensed m³/yr', 'Purpose', 'Basin', 'Distance', 'Source']}
              rows={report.gas_and_water.nearest_water_licences.map((l: any) => [
                <strong key="n">{l.licensee}</strong>, l.source_water_body,
                l.licensed_m3_per_year != null ? Number(l.licensed_m3_per_year).toLocaleString() : '—',
                l.purpose ?? '—', l.sub_basin ?? '—', fmtKm(l.distance_km),
                <SourceLink key="s" url={l.source_url} publisher="Alberta EPA" confidence="verified" />,
              ])} />
          </>
        )}
      </Section>

      <Section icon={<Truck className="w-4 h-4" />} title="Site Logistics & Workforce" subtitle="Industrial parks, transport, and labour">
        <Table headers={['Industrial park', 'Municipality', 'Available power', 'Zoning', 'Distance', 'Source']}
          rows={report.logistics.nearest_industrial_parks.map((p: any) => [p.name, p.municipality, p.available_power_mw ? `${p.available_power_mw} MW` : '—', p.zoning ?? '—', fmtKm(p.distance_km),
            <SourceLink key="s" url={p.source_url} publisher={(p as any).source_publisher ?? 'Municipality'} confidence={(p as any).confidence} asOf={(p as any).source_as_of} />])} />
        <p className="text-xs font-semibold mt-4 mb-2">Transport assets (airport · rail · heavy-haul · intermodal)</p>
        <Table headers={['Type', 'Asset', 'Operator', 'Distance', 'Source']}
          rows={report.logistics.nearest_logistics_assets.map((l: any) => [
            <Badge key="t" variant="outline" className="text-[10px]">{l.asset_type.replace(/_/g,' ')}</Badge>,
            l.name, l.operator ?? '—', fmtKm(l.distance_km),
            <SourceLink key="s" url={l.source_url} publisher={(l as any).source_publisher ?? 'Operator'} confidence="verified" />,
          ])} />
        <p className="text-xs font-semibold mt-4 mb-2">Workforce — population centres (StatsCan 2021)</p>
        <Table headers={['Centre', 'Population', 'Labour force', 'Trades (est.)', 'Distance', 'Source']}
          rows={report.logistics.nearest_population_centres.map((p: any) => [
            <strong key="n">{p.name}</strong>, p.population_2021.toLocaleString(),
            p.labour_force_2021?.toLocaleString() ?? '—', p.trades_workers_estimate?.toLocaleString() ?? '—',
            fmtKm(p.distance_km),
            <SourceLink key="s" url={p.source_url} publisher="StatsCan" confidence="verified" asOf="2021-05-11" />,
          ])} />
        <p className="text-xs font-semibold mt-4 mb-2">Drive times</p>
        <Table headers={['Hub', 'Distance', 'Est. drive time']}
          rows={report.logistics.drive_times.map(d => [`${d.hub} (${d.code})`, `${d.distance_km} km`, `${d.drive_hours_est} h`])} />
        <p className="text-[10px] text-muted-foreground mt-2">Drive times estimated at 95 km/h avg highway speed; replace with Routes API for full traffic-aware estimates.</p>
      </Section>

      <Card className="p-4 bg-muted/30">
        <p className="text-xs font-semibold mb-2">Methodology & Data Provenance</p>
        <div className="text-[11px] space-y-1 mb-3">
          <p><strong>Hyperscaler score:</strong> {report.methodology.hyperscaler_score}</p>
          <p><strong>Fiber score:</strong> {report.methodology.fiber_score}</p>
          <p><strong>Modeled latency:</strong> {report.methodology.modeled_latency}</p>
          <p><strong>Distance:</strong> {report.methodology.distance}</p>
        </div>
        <Separator className="my-2" />
        <p className="text-xs font-semibold mb-1">Primary sources</p>
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
          {report.data_provenance.sources.map(s => <li key={s}>{s}</li>)}
        </ul>
        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground">{report.data_provenance.notes}</p>
      </Card>
    </div>
  );
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<h4 className="font-semibold text-sm">{title}</h4></div>
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

function FiberScoreCard({ score }: { score: SiteReportT['fiber']['score'] }) {
  const gradeColor: Record<string, string> = {
    A: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    B: 'bg-lime-500/15 text-lime-700 border-lime-500/30',
    C: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    D: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
    F: 'bg-destructive/15 text-destructive border-destructive/30',
  };
  const entries = Object.entries(score.breakdown) as [string, { score: number; max: number; detail: string }][];
  return (
    <Card className="p-4 bg-muted/40 border-dashed">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg border px-4 py-2 text-center ${gradeColor[score.grade]}`}>
          <div className="text-3xl font-bold leading-none">{score.total}</div>
          <div className="text-xs mt-0.5">Grade {score.grade}</div>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          {entries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="capitalize text-muted-foreground">{k.replace('_', ' ')}</span>
                <span className="font-mono">{v.score}/{v.max}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded mt-1 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(v.score / v.max) * 100}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 truncate" title={v.detail}>{v.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

const HYPERSCALER_GRADE_COLOR: Record<string, string> = {
  A: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  B: 'bg-lime-500/15 text-lime-700 border-lime-500/30',
  C: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  D: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  F: 'bg-destructive/15 text-destructive border-destructive/30',
};

function HyperscalerScoreCard({ score }: { score?: SiteReportT['hyperscaler_score'] }) {
  if (!score) return null;
  const grade = score.grade ?? 'F';
  const entries = Object.entries(score.breakdown ?? {}) as [string, { score: number; max: number; detail: string }][];
  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-muted/30 border-primary/20">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg border px-5 py-3 text-center ${HYPERSCALER_GRADE_COLOR[grade] ?? HYPERSCALER_GRADE_COLOR.F}`}>
          <div className="text-[10px] uppercase tracking-wide opacity-70">Hyperscaler suitability</div>
          <div className="text-4xl font-bold leading-none mt-1">{score.total ?? 0}</div>
          <div className="text-xs mt-1">Grade {grade}</div>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          {entries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="capitalize text-muted-foreground">{k.replace('_', ' ')}</span>
                <span className="font-mono">{v.score}/{v.max}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded mt-1 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${v.max ? (v.score / v.max) * 100 : 0}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 truncate" title={v.detail}>{v.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}