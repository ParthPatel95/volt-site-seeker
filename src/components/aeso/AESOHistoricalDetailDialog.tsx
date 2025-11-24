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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="truncate">{data.period} Market Analysis</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Detailed breakdown with 95% uptime filter applied
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
          {/* Market Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Average Price</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold">${data.average.toFixed(2)}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">CAD/MWh</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Price Range</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <TrendingUp className="w-3 h-3 text-destructive flex-shrink-0" />
                    <span className="font-semibold">${data.stats.max.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <TrendingDown className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="font-semibold">${data.stats.min.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Volatility</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold">${data.stats.stdDev.toFixed(2)}</span>
                  <Badge variant="outline" className="text-[10px] sm:text-xs">σ</Badge>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Std. Deviation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Hours Removed</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold">{data.removedHours.length}</span>
                  <Badge variant="destructive" className="text-[10px] sm:text-xs">{removedPercentage}%</Badge>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Top {removedPercentage}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Market Insights */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold mb-2">Price Distribution</h4>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">25th Percentile:</span>
                      <span className="font-semibold">${percentiles.p25.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Median (50th):</span>
                      <span className="font-semibold">${data.stats.median.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">75th Percentile:</span>
                      <span className="font-semibold">${percentiles.p75.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">90th Percentile:</span>
                      <span className="font-semibold">${percentiles.p90.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold mb-2">Removed Hours Analysis</h4>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Hours Analyzed:</span>
                      <span className="font-semibold">{data.allHourlyData.length + data.removedHours.length}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Hours Included:</span>
                      <span className="font-semibold text-green-600">{data.allHourlyData.length}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Hours Removed:</span>
                      <span className="font-semibold text-destructive">{data.removedHours.length}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Avg Removed Price:</span>
                      <span className="font-semibold">${avgRemovedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-muted-foreground">
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
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="included" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Included ({data.allHourlyData.length})</span>
              </TabsTrigger>
              <TabsTrigger value="removed" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Removed ({data.removedHours.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="included" className="mt-3 sm:mt-4">
              <Card>
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-6">
                  <CardTitle className="text-sm sm:text-base">All Hourly Prices (95% Uptime)</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {data.allHourlyData.length} hours included in average calculation
                  </p>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="max-h-64 sm:max-h-96 overflow-auto border rounded-lg">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm min-w-[140px] sm:min-w-[180px]">Timestamp</TableHead>
                            <TableHead className="text-right text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]">Price (CAD/MWh)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.allHourlyData.map((hour, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                                {format(new Date(hour.ts), 'yyyy-MM-dd HH:mm')}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-xs sm:text-sm whitespace-nowrap">
                                ${hour.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="removed" className="mt-3 sm:mt-4">
              <Card>
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-6">
                  <CardTitle className="text-sm sm:text-base">Removed High-Price Hours</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Top {removedPercentage}% highest-priced hours excluded from calculations
                  </p>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="max-h-64 sm:max-h-96 overflow-auto border rounded-lg">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm min-w-[140px] sm:min-w-[180px]">Timestamp</TableHead>
                            <TableHead className="text-right text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]">Price (CAD/MWh)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.removedHours.map((hour, idx) => (
                            <TableRow key={idx} className="bg-destructive/5">
                              <TableCell className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                                {format(new Date(hour.ts), 'yyyy-MM-dd HH:mm')}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-destructive text-xs sm:text-sm whitespace-nowrap">
                                ${hour.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
