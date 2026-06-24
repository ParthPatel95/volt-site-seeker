import { useMemo, useState } from 'react';
import { ArrowRight, Filter, Search, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useHiddenGems } from '@/hooks/useHiddenGems';
import {
  INDUSTRY_DIRECTORY, INDUSTRY_GROUPS, minProductionFor10MW,
  type IndustryGroup, type IndustryInfo,
} from '@/lib/industries';
import { computeDistressScore } from '@/lib/hidden-gems';

// Browsable directory of every heavy-power industry the Hidden Gems
// taxonomy understands, with per-industry site counts pulled from the live
// registry and links into the Hidden Gems list pre-filtered to each one.
//
// The directory and the registry share one source of truth (facility_type
// strings + ENERGY_INTENSITY_MWH_PER_TONNE), so the numbers here can't drift
// from what the rest of the app shows.

type State = 'all' | 'AB' | 'TX';

export function IndustriesTab({
  onPickIndustry,
}: {
  onPickIndustry?: (industryKey: string) => void;
}) {
  const { gems, totalFacilities, isLoading } = useHiddenGems();
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<IndustryGroup | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<State>('all');

  // Aggregate registry into per-industry buckets — sites in registry,
  // ≥10 MW sites, sites with elevated/severe distress.
  const stats = useMemo(() => {
    const byType = new Map<string, {
      total: number;
      tenMwPlus: number;
      ab: number;
      tx: number;
      distressed: number;
      totalMw: number;
    }>();
    for (const g of gems) {
      const t = g.facility.facility_type;
      const cur = byType.get(t) ?? { total: 0, tenMwPlus: 0, ab: 0, tx: 0, distressed: 0, totalMw: 0 };
      cur.total++;
      if ((g.derivedMw ?? 0) >= 10) cur.tenMwPlus++;
      if (g.facility.state === 'TX') cur.tx++;
      else cur.ab++;
      const d = computeDistressScore(g.facility);
      if (d.band === 'severe' || d.band === 'elevated') cur.distressed++;
      cur.totalMw += g.derivedMw ?? 0;
      byType.set(t, cur);
    }
    return byType;
  }, [gems]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INDUSTRY_DIRECTORY.filter((i) => {
      if (groupFilter !== 'all' && i.group !== groupFilter) return false;
      if (q && !i.label.toLowerCase().includes(q) && !i.key.includes(q) && !i.description.toLowerCase().includes(q)) return false;
      if (stateFilter !== 'all') {
        const s = stats.get(i.key);
        if (!s) return false;
        if (stateFilter === 'AB' && s.ab === 0) return false;
        if (stateFilter === 'TX' && s.tx === 0) return false;
      }
      return true;
    });
  }, [query, groupFilter, stateFilter, stats]);

  // Group rollup for the header.
  const totals = useMemo(() => {
    let coveredIndustries = 0;
    let tenMwPlus = 0;
    let distressed = 0;
    let totalMw = 0;
    for (const i of INDUSTRY_DIRECTORY) {
      const s = stats.get(i.key);
      if (!s) continue;
      coveredIndustries++;
      tenMwPlus += s.tenMwPlus;
      distressed += s.distressed;
      totalMw += s.totalMw;
    }
    return { coveredIndustries, tenMwPlus, distressed, totalMw };
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Heavy-power industries</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Every industry type WattByte tracks for power-acquisition leads in Alberta and
          Texas, with the production threshold at which a site crosses the 10 MW
          partner-target bar and the count of known sites in our registry. Click any card
          to open the matching sites in Hidden Gems.
        </p>
      </div>

      {/* KPI band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border/60">
        {[
          { label: 'Industry types', value: INDUSTRY_DIRECTORY.length, suffix: '' },
          { label: 'In registry', value: totals.coveredIndustries, suffix: ' types' },
          { label: 'Sites ≥10 MW', value: totals.tenMwPlus, suffix: '' },
          { label: 'Distressed sites', value: totals.distressed, suffix: '' },
        ].map((k) => (
          <div key={k.label} className="bg-card p-5">
            <div className="text-2xl font-bold tabular-nums">{k.value.toLocaleString()}{k.suffix}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search industries…"
            className="pl-9"
          />
        </div>
        <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v as IndustryGroup | 'all')}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {INDUSTRY_GROUPS.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as State)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sites in any state</SelectItem>
            <SelectItem value="AB">Sites in Alberta</SelectItem>
            <SelectItem value="TX">Sites in Texas</SelectItem>
          </SelectContent>
        </Select>
        {!isLoading && (
          <span className="text-xs text-muted-foreground ml-auto">
            {visible.length} of {INDUSTRY_DIRECTORY.length} industries · {totalFacilities} sites in registry
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((i) => (
          <IndustryCard
            key={i.key}
            info={i}
            stats={stats.get(i.key)}
            onPick={onPickIndustry}
          />
        ))}
        {visible.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No industries match these filters.
          </div>
        )}
      </div>
    </div>
  );
}

function IndustryCard({
  info,
  stats,
  onPick,
}: {
  info: IndustryInfo;
  stats?: { total: number; tenMwPlus: number; ab: number; tx: number; distressed: number; totalMw: number };
  onPick?: (industryKey: string) => void;
}) {
  const minTons = minProductionFor10MW(info);
  const unit = info.capacityUnit;
  const known = stats?.total ?? 0;
  const tenMw = stats?.tenMwPlus ?? 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{info.label}</CardTitle>
          <Badge variant="outline" className="text-[10px] shrink-0">{info.group}</Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          {info.key}{info.naics ? ` · NAICS ${info.naics}` : ''}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{info.description}</p>

        {/* Intensity + 10 MW threshold */}
        <div className="grid grid-cols-2 gap-3 text-xs rounded-lg border border-border bg-muted/30 p-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
              Electrical intensity
            </div>
            <div className="font-bold tabular-nums flex items-baseline gap-1">
              <Zap className="w-3 h-3 text-watt-bitcoin" />
              {info.intensityMwhPerTonne > 0
                ? <>{info.intensityMwhPerTonne.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] font-normal text-muted-foreground">MWh/{unit === 'm3/yr' ? 'm³' : 't'}</span></>
                : <span className="text-muted-foreground">published as MW</span>}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
              ≥10 MW at
            </div>
            <div className="font-bold tabular-nums">
              {minTons != null
                ? <>{minTons.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span></>
                : <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        </div>

        {/* Operators */}
        {(info.operators?.AB?.length || info.operators?.TX?.length) && (
          <div className="text-xs">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Known operators
            </div>
            <div className="flex flex-wrap gap-1">
              {(info.operators?.AB ?? []).map((op) => (
                <Badge key={op} variant="secondary" className="text-[10px]">🇨🇦 {op}</Badge>
              ))}
              {(info.operators?.TX ?? []).map((op) => (
                <Badge key={op} variant="secondary" className="text-[10px]">🇺🇸 {op}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Registry coverage */}
        <div className="grid grid-cols-3 gap-2 text-xs border-t border-border pt-3">
          <Stat label="In registry" value={known} color="text-foreground" />
          <Stat label="≥10 MW" value={tenMw} color="text-watt-bitcoin" />
          <Stat label="Distressed" value={stats?.distressed ?? 0} color={stats?.distressed ? 'text-rose-600' : 'text-muted-foreground'} />
        </div>

        <div className="mt-auto pt-1">
          <Button
            size="sm"
            variant={known ? 'default' : 'outline'}
            className="w-full"
            onClick={() => onPick?.(info.key)}
            disabled={!onPick}
          >
            {known ? `View ${known} site${known === 1 ? '' : 's'}` : 'No sites yet — discover via OSM'}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className={`text-base font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
