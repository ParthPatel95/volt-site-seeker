import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Grid3X3 } from 'lucide-react';

interface DataRow {
  pool_price: number;
  ail_mw: number | null;
  temperature_edmonton: number | null;
  wind_speed: number | null;
  gas_price_aeco: number | null;
}

interface Props {
  data: DataRow[];
}

const VARIABLES = [
  { key: 'pool_price', label: 'Pool Price' },
  { key: 'ail_mw', label: 'Demand' },
  { key: 'temperature_edmonton', label: 'Temperature' },
  { key: 'wind_speed', label: 'Wind Speed' },
  { key: 'gas_price_aeco', label: 'Gas Price' },
];

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 3) return 0;
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  return denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
}

function getCellColor(r: number): string {
  const abs = Math.abs(r);
  if (abs > 0.7) return r > 0 ? 'bg-emerald-500/70 text-white' : 'bg-red-500/70 text-white';
  if (abs > 0.4) return r > 0 ? 'bg-emerald-500/40 text-foreground' : 'bg-red-500/40 text-foreground';
  if (abs > 0.2) return r > 0 ? 'bg-emerald-500/20 text-foreground' : 'bg-red-500/20 text-foreground';
  return 'bg-muted/50 text-muted-foreground';
}

export function CorrelationMatrix({ data }: Props) {
  // Compute matrix
  const matrix = useMemo(() => {
    if (data.length < 10) return null;

    const getValues = (key: string): number[] => {
      return data
        .map(d => (d as any)[key])
        .filter((v): v is number => v != null && !isNaN(v));
    };

    // Build aligned arrays for each pair
    const result: { row: string; cols: { col: string; r: number }[] }[] = [];

    for (const vRow of VARIABLES) {
      const cols: { col: string; r: number }[] = [];
      for (const vCol of VARIABLES) {
        if (vRow.key === vCol.key) {
          cols.push({ col: vCol.label, r: 1 });
          continue;
        }
        // Get aligned pairs
        const pairs: { x: number; y: number }[] = [];
        for (const d of data) {
          const x = (d as any)[vRow.key];
          const y = (d as any)[vCol.key];
          if (x != null && y != null && !isNaN(x) && !isNaN(y)) {
            pairs.push({ x, y });
          }
        }
        const r = pairs.length >= 10
          ? pearson(pairs.map(p => p.x), pairs.map(p => p.y))
          : 0;
        cols.push({ col: vCol.label, r: Math.round(r * 100) / 100 });
      }
      result.push({ row: vRow.label, cols });
    }
    return result;
  }, [data]);

  // Strongest predictor
  const strongestPredictor = useMemo(() => {
    if (!matrix) return null;
    const priceRow = matrix.find(r => r.row === 'Pool Price');
    if (!priceRow) return null;
    let best = { label: '', r: 0 };
    for (const col of priceRow.cols) {
      if (col.col === 'Pool Price') continue;
      if (Math.abs(col.r) > Math.abs(best.r)) {
        best = { label: col.col, r: col.r };
      }
    }
    return best;
  }, [matrix]);

  if (!matrix) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Not enough data to compute correlations
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">Correlation Matrix</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Pearson r-values between key market variables · {data.length.toLocaleString()} records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Strongest predictor callout */}
        {strongestPredictor && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              <strong>Strongest price predictor:</strong> {strongestPredictor.label} (r = {strongestPredictor.r.toFixed(2)})
            </span>
          </div>
        )}

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-muted-foreground font-medium" />
                {VARIABLES.map(v => (
                  <th key={v.key} className="p-1.5 text-center text-muted-foreground font-medium min-w-[60px]">
                    {v.label.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.row}>
                  <td className="p-1.5 font-medium text-foreground whitespace-nowrap">{row.row}</td>
                  {row.cols.map(col => (
                    <td key={col.col} className="p-1">
                      <div className={`p-1.5 rounded text-center font-mono text-[11px] ${getCellColor(col.r)}`}>
                        {col.r.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Badge variant="outline" className="text-[10px] bg-emerald-500/20">{'Strong positive (>0.7)'}</Badge>
          <Badge variant="outline" className="text-[10px] bg-red-500/20">{'Strong negative (<-0.7)'}</Badge>
          <Badge variant="outline" className="text-[10px] bg-muted/50">Weak (±0.2)</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
