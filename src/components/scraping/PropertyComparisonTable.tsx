import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowUpDown, Star, StarOff, Search, ExternalLink, Download,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyRow {
  address?: string;
  city?: string;
  state?: string;
  asking_price?: number;
  square_footage?: number;
  lot_size_acres?: number;
  listing_url?: string;
  power_infrastructure?: {
    estimated_power_capacity_mw?: number;
    substation_distance_miles?: number;
    utility_provider?: string;
  };
  bitcoin_mining_suitability?: {
    score?: number;
  };
  eia_electricity_rate?: number;
}

interface PropertyComparisonTableProps {
  properties: PropertyRow[];
}

type SortKey = 'score' | 'price' | 'power' | 'substation' | 'pricePerMw';
type SortDir = 'asc' | 'desc';

export function PropertyComparisonTable({ properties }: PropertyComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter, setFilter] = useState('');
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load existing shortlisted items on mount
  useEffect(() => {
    const loadShortlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('property_shortlist')
        .select('property_id')
        .eq('user_id', user.id);
      if (data && data.length > 0) {
        setShortlisted(new Set(data.map((r: any) => r.property_id)));
      }
    };
    loadShortlist();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const toggleShortlist = async (property: PropertyRow) => {
    const id = property.listing_url || `${property.address}-${property.city}`;
    const next = new Set(shortlisted);
    if (next.has(id)) {
      next.delete(id);
      // Remove from DB
      const { data: { user: delUser } } = await supabase.auth.getUser();
      if (delUser) {
        await supabase.from('property_shortlist').delete().eq('property_id', id).eq('user_id', delUser.id);
      }
    } else {
      next.add(id);
      // Add to DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('property_shortlist').upsert({
          user_id: user.id,
          property_id: id,
        });
      }
    }
    setShortlisted(next);
  };

  const getValue = (p: PropertyRow, key: SortKey): number => {
    switch (key) {
      case 'score': return p.bitcoin_mining_suitability?.score || 0;
      case 'price': return p.asking_price || 0;
      case 'power': return p.power_infrastructure?.estimated_power_capacity_mw || 0;
      case 'substation': return p.power_infrastructure?.substation_distance_miles || 999;
      case 'pricePerMw': {
        const mw = p.power_infrastructure?.estimated_power_capacity_mw;
        return mw && mw > 0 && p.asking_price ? p.asking_price / mw : 999999999;
      }
    }
  };

  const sorted = useMemo(() => {
    let filtered = properties;
    if (filter) {
      const lc = filter.toLowerCase();
      filtered = properties.filter(
        (p) =>
          p.address?.toLowerCase().includes(lc) ||
          p.city?.toLowerCase().includes(lc) ||
          p.state?.toLowerCase().includes(lc)
      );
    }
    return [...filtered].sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [properties, sortKey, sortDir, filter]);

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 text-xs font-medium"
      onClick={() => toggleSort(k)}
    >
      {label}
      <ArrowUpDown className="w-3 h-3 ml-1" />
    </Button>
  );

  if (properties.length === 0) return null;

  return (
    <Card className="border-border">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            📊 Comparative Ranking ({properties.length} properties)
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
                className="h-7 text-xs pl-7 w-40"
              />
            </div>
            {shortlisted.size > 0 && (
              <Badge variant="secondary" className="text-xs">
                ⭐ {shortlisted.size} shortlisted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs"><SortBtn k="score" label="Score" /></TableHead>
                <TableHead className="text-xs"><SortBtn k="price" label="Price" /></TableHead>
                <TableHead className="text-xs"><SortBtn k="power" label="MW" /></TableHead>
                <TableHead className="text-xs"><SortBtn k="pricePerMw" label="$/MW" /></TableHead>
                <TableHead className="text-xs"><SortBtn k="substation" label="Sub. Dist" /></TableHead>
                <TableHead className="text-xs">Utility</TableHead>
                <TableHead className="text-xs">Rate</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p, idx) => {
                const id = p.listing_url || `${p.address}-${p.city}`;
                const mw = p.power_infrastructure?.estimated_power_capacity_mw;
                const pricePerMw = mw && mw > 0 && p.asking_price
                  ? (p.asking_price / mw).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : '—';
                const score = p.bitcoin_mining_suitability?.score;

                return (
                  <TableRow key={idx} className={shortlisted.has(id) ? 'bg-accent/10' : ''}>
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleShortlist(p)}
                      >
                        {shortlisted.has(id) ? (
                          <Star className="w-3 h-3 fill-[hsl(var(--chart-4))] text-[hsl(var(--chart-4))]" />
                        ) : (
                          <StarOff className="w-3 h-3 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {p.address || `${p.city}, ${p.state}`}
                    </TableCell>
                    <TableCell>
                      {score != null && (
                        <Badge
                          variant={score >= 7 ? 'default' : score >= 4 ? 'secondary' : 'outline'}
                          className={`text-xs ${score >= 7 ? 'bg-[hsl(var(--data-positive))]' : score >= 4 ? 'bg-[hsl(var(--data-warning))]' : ''}`}
                        >
                          {score}/10
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.asking_price ? `$${(p.asking_price / 1e6).toFixed(1)}M` : '—'}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {mw ? `${mw} MW` : '—'}
                    </TableCell>
                    <TableCell className="text-xs">${pricePerMw}</TableCell>
                    <TableCell className="text-xs">
                      {p.power_infrastructure?.substation_distance_miles != null
                        ? `${p.power_infrastructure.substation_distance_miles} mi`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {p.power_infrastructure?.utility_provider || '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {(p as any).eia_electricity_rate
                        ? `${((p as any).eia_electricity_rate * 100).toFixed(1)}¢`
                        : '—'}
                    </TableCell>
                    <TableCell className="p-2">
                      {p.listing_url && (
                        <a href={p.listing_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
