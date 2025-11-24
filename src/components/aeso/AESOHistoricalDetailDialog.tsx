import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface DetailedPeriodData {
  period: string;
  days: number;
  average: number;
  dataPoints: number;
  allHourlyData: Array<{ ts: string; price: number }>;
  removedHours: Array<{ ts: string; price: number }>;
  stats: {
    min: number;
    max: number;
    median: number;
    stdDev: number;
    totalMWh: number;
  };
}

interface AESOHistoricalDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailedPeriodData | null;
}

export function AESOHistoricalDetailDialog({ open, onOpenChange, data }: AESOHistoricalDetailDialogProps) {
  if (!data) return null;

  const calculatePercentiles = () => {
    const sorted = [...data.allHourlyData].sort((a, b) => a.price - b.price);
    const p25 = sorted[Math.floor(sorted.length * 0.25)]?.price || 0;
    const p75 = sorted[Math.floor(sorted.length * 0.75)]?.price || 0;
    const p90 = sorted[Math.floor(sorted.length * 0.90)]?.price || 0;
    return { p25, p75, p90 };
  };

  const percentiles = calculatePercentiles();
  const removedPercentage = ((data.removedHours.length / (data.allHourlyData.length + data.removedHours.length)) * 100).toFixed(1);
  const avgRemovedPrice = data.removedHours.length > 0 
    ? data.removedHours.reduce((sum, h) => sum + h.price, 0) / data.removedHours.length 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            {data.period} Market Analysis
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown with 95% uptime filter applied
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Market Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">${data.average.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">CAD/MWh</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Price Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-3 h-3 text-destructive" />
                    <span className="font-semibold">${data.stats.max.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <span className="font-semibold">${data.stats.min.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">${data.stats.stdDev.toFixed(2)}</span>
                  <Badge variant="outline" className="text-xs">σ</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Std. Deviation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hours Removed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{data.removedHours.length}</span>
                  <Badge variant="destructive" className="text-xs">{removedPercentage}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Top {removedPercentage}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Price Distribution</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">25th Percentile:</span>
                      <span className="font-semibold">${percentiles.p25.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Median (50th):</span>
                      <span className="font-semibold">${data.stats.median.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">75th Percentile:</span>
                      <span className="font-semibold">${percentiles.p75.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">90th Percentile:</span>
                      <span className="font-semibold">${percentiles.p90.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Removed Hours Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours Analyzed:</span>
                      <span className="font-semibold">{data.allHourlyData.length + data.removedHours.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours Included:</span>
                      <span className="font-semibold text-green-600">{data.allHourlyData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours Removed:</span>
                      <span className="font-semibold text-destructive">{data.removedHours.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Removed Price:</span>
                      <span className="font-semibold">${avgRemovedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      The 95% uptime filter removes the highest {removedPercentage}% of hourly prices 
                      ({data.removedHours.length} hours) to simulate controlled load management during 
                      peak price events. This results in an average price reduction of 
                      ${(avgRemovedPrice - data.average).toFixed(2)} CAD/MWh.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Tables */}
          <Tabs defaultValue="included" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="included" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Included Hours ({data.allHourlyData.length})
              </TabsTrigger>
              <TabsTrigger value="removed" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Removed Hours ({data.removedHours.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="included" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">All Hourly Prices (95% Uptime)</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {data.allHourlyData.length} hours included in average calculation
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead className="text-right">Price (CAD/MWh)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allHourlyData.map((hour, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-sm">
                              {format(new Date(hour.ts), 'yyyy-MM-dd HH:mm')}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${hour.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="removed" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Removed High-Price Hours</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Top {removedPercentage}% highest-priced hours excluded from calculations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead className="text-right">Price (CAD/MWh)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.removedHours.map((hour, idx) => (
                          <TableRow key={idx} className="bg-destructive/5">
                            <TableCell className="font-mono text-sm">
                              {format(new Date(hour.ts), 'yyyy-MM-dd HH:mm')}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-destructive">
                              ${hour.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
