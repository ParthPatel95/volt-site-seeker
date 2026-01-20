import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  Thermometer,
  Zap,
  Battery,
  Wind,
  ArrowLeftRight,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  BarChart3,
  Calendar,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUnifiedAnalyticsData, UnifiedAnalyticsFilters } from '@/hooks/useUnifiedAnalyticsData';
import { 
  exportToCSV, 
  calculateDailyPriceStats, 
  findHighPriceEvents,
  generateHighPriceEventsCSV,
  generateDailyStatsCSV,
  DailyPriceStats,
  HighPriceEvent
} from '@/utils/unifiedExportUtils';

const DATE_PRESETS = [
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last Year', days: 365 },
  { label: 'Last 3 Years', days: 1095 },
  { label: 'All Data', days: 0 },
];

const ROWS_PER_PAGE = 50;

export function UnifiedAnalyticsExport() {
  const { data, stats, loading, filters, fetchData, updateFilters } = useUnifiedAnalyticsData();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyStats, setDailyStats] = useState<DailyPriceStats[]>([]);
  const [highPriceEvents, setHighPriceEvents] = useState<HighPriceEvent[]>([]);
  const [priceThreshold, setPriceThreshold] = useState(100);

  // Calculate derived data when main data changes
  useEffect(() => {
    if (data.length > 0) {
      setDailyStats(calculateDailyPriceStats(data));
      setHighPriceEvents(findHighPriceEvents(data, priceThreshold));
    }
  }, [data, priceThreshold]);

  const handleDatePreset = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0];
    let startDate: string;
    
    if (days === 0) {
      startDate = '2020-01-01';
    } else {
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    updateFilters({ startDate, endDate });
  };

  const handleCategoryToggle = (category: keyof UnifiedAnalyticsFilters) => {
    updateFilters({ [category]: !filters[category] });
  };

  const handleExportAll = () => {
    if (data.length === 0) return;
    const filename = `aeso-analytics-${filters.startDate}-to-${filters.endDate}.csv`;
    exportToCSV(data, filters, filename);
  };

  const handleExportDailyStats = () => {
    if (dailyStats.length === 0) return;
    const filename = `aeso-daily-stats-${filters.startDate}-to-${filters.endDate}.csv`;
    generateDailyStatsCSV(dailyStats, filename);
  };

  const handleExportHighPriceEvents = () => {
    if (highPriceEvents.length === 0) return;
    const filename = `aeso-high-price-events-${filters.startDate}-to-${filters.endDate}.csv`;
    generateHighPriceEventsCSV(highPriceEvents, filename);
  };

  // Pagination
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const formatCorrelation = (value: number | null) => {
    if (value === null) return 'N/A';
    const absValue = Math.abs(value);
    let strength = 'Weak';
    if (absValue > 0.7) strength = 'Strong';
    else if (absValue > 0.4) strength = 'Moderate';
    
    return `${value.toFixed(3)} (${strength})`;
  };

  const getCorrelationColor = (value: number | null) => {
    if (value === null) return 'text-muted-foreground';
    if (value > 0.4) return 'text-green-600 dark:text-green-400';
    if (value < -0.4) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Unified Analytics Export
              </CardTitle>
              <CardDescription className="mt-1">
                Combine weather, prices, demand, reserves, generation and intertie data for comprehensive analysis
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <Database className="w-3 h-3" />
              Real AESO Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDatePreset(preset.days)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => updateFilters({ startDate: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate" className="text-xs">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => updateFilters({ endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Data Categories */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Data Categories
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <CategoryCheckbox
                  id="weather"
                  label="Weather"
                  icon={<Thermometer className="w-4 h-4" />}
                  checked={filters.includeWeather}
                  onChange={() => handleCategoryToggle('includeWeather')}
                />
                <CategoryCheckbox
                  id="prices"
                  label="Prices"
                  icon={<TrendingUp className="w-4 h-4" />}
                  checked={filters.includePrices}
                  onChange={() => handleCategoryToggle('includePrices')}
                />
                <CategoryCheckbox
                  id="demand"
                  label="Demand"
                  icon={<Zap className="w-4 h-4" />}
                  checked={filters.includeDemand}
                  onChange={() => handleCategoryToggle('includeDemand')}
                />
                <CategoryCheckbox
                  id="reserves"
                  label="Reserves"
                  icon={<Battery className="w-4 h-4" />}
                  checked={filters.includeReserves}
                  onChange={() => handleCategoryToggle('includeReserves')}
                />
                <CategoryCheckbox
                  id="generation"
                  label="Generation"
                  icon={<Wind className="w-4 h-4" />}
                  checked={filters.includeGeneration}
                  onChange={() => handleCategoryToggle('includeGeneration')}
                />
                <CategoryCheckbox
                  id="interties"
                  label="Interties"
                  icon={<ArrowLeftRight className="w-4 h-4" />}
                  checked={filters.includeInterties}
                  onChange={() => handleCategoryToggle('includeInterties')}
                />
              </div>
            </div>
          </div>

          {/* Load Data Button */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => fetchData()} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Load Data
                </>
              )}
            </Button>
            
            {data.length > 0 && (
              <>
                <Button variant="outline" onClick={handleExportAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export All Data ({data.length.toLocaleString()} rows)
                </Button>
                <Button variant="outline" onClick={handleExportDailyStats} className="gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Daily Stats
                </Button>
                <Button variant="outline" onClick={handleExportHighPriceEvents} className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Export High Price Events ({highPriceEvents.length})
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Warning Banner */}
      {stats && stats.completeness.overall < 80 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Sparse Data Detected in Selected Range
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Only {stats.completeness.overall}% of records have complete data. 
                  {stats.completeness.completeDataStartDate && (
                    <> For full weather, demand, and generation data, use dates from <strong>{stats.completeness.completeDataStartDate}</strong> onwards.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            title="Total Records"
            value={stats.totalRecords.toLocaleString()}
            subtitle="Hourly data points"
            icon={<Database className="w-4 h-4" />}
          />
          <StatCard
            title="Avg Price"
            value={`$${stats.priceStats.avg.toFixed(2)}`}
            subtitle="CAD/MWh"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            title="Max Price"
            value={`$${stats.priceStats.max.toFixed(2)}`}
            subtitle="CAD/MWh"
            icon={<Zap className="w-4 h-4" />}
            highlight
          />
          <StatCard
            title="Avg Demand"
            value={`${(stats.demandStats.avg / 1000).toFixed(1)} GW`}
            subtitle="Average load"
            icon={<Battery className="w-4 h-4" />}
          />
          <StatCard
            title="High Price Hours"
            value={stats.highPriceHours.toLocaleString()}
            subtitle=">$100/MWh"
            icon={<AlertTriangle className="w-4 h-4" />}
            highlight={stats.highPriceHours > 100}
          />
          <StatCard
            title="Date Range"
            value={`${Math.ceil((new Date(stats.dateRange.end).getTime() - new Date(stats.dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} days`}
            subtitle={`${stats.dateRange.start} to ${stats.dateRange.end}`}
            icon={<Calendar className="w-4 h-4" />}
          />
          <StatCard
            title="Data Quality"
            value={`${stats.completeness.overall}%`}
            subtitle={stats.completeness.overall >= 80 ? 'Complete' : 'Partial'}
            icon={stats.completeness.overall >= 80 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-amber-500" />}
            highlight={stats.completeness.overall < 50}
          />
        </div>
      )}

      {/* Data Completeness Breakdown */}
      {stats && stats.completeness.overall < 100 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4" />
              Data Completeness by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <CompletenessBar label="Weather" value={stats.completeness.weather} />
              <CompletenessBar label="Demand" value={stats.completeness.demand} />
              <CompletenessBar label="Generation" value={stats.completeness.generation} />
              <CompletenessBar label="Reserves" value={stats.completeness.reserves} />
            </div>
            {stats.completeness.completeDataStartDate && (
              <p className="text-xs text-muted-foreground mt-3">
                💡 Tip: Complete data available from {stats.completeness.completeDataStartDate}. Earlier records only contain pool price.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Correlation Analysis */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Correlation Analysis</CardTitle>
            <CardDescription>
              Understanding relationships between variables to identify price drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Temperature vs Price</span>
                </div>
                <p className={`text-xl font-bold ${getCorrelationColor(stats.correlations.tempVsPrice)}`}>
                  {formatCorrelation(stats.correlations.tempVsPrice)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Extreme temperatures often drive higher demand and prices
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Demand vs Price</span>
                </div>
                <p className={`text-xl font-bold ${getCorrelationColor(stats.correlations.demandVsPrice)}`}>
                  {formatCorrelation(stats.correlations.demandVsPrice)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher demand typically correlates with higher prices
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Wind Gen vs Price</span>
                </div>
                <p className={`text-xl font-bold ${getCorrelationColor(stats.correlations.windVsPrice)}`}>
                  {formatCorrelation(stats.correlations.windVsPrice)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Wind generation often has negative correlation with prices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Tabs */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Hourly Data</TabsTrigger>
                <TabsTrigger value="daily">Daily Summary</TabsTrigger>
                <TabsTrigger value="highprice">High Price Events</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScrollArea className="h-[400px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background">Timestamp</TableHead>
                        <TableHead className="sticky top-0 bg-background">Price (CAD)</TableHead>
                        {filters.includeDemand && <TableHead className="sticky top-0 bg-background">Demand (MW)</TableHead>}
                        {filters.includeWeather && <TableHead className="sticky top-0 bg-background">Temp (°C)</TableHead>}
                        {filters.includeGeneration && <TableHead className="sticky top-0 bg-background">Wind (MW)</TableHead>}
                        {filters.includeReserves && <TableHead className="sticky top-0 bg-background">Reserve %</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{row.timestamp}</TableCell>
                          <TableCell className={row.pool_price && row.pool_price > 100 ? 'text-red-600 font-semibold' : ''}>
                            ${row.pool_price?.toFixed(2) ?? 'N/A'}
                          </TableCell>
                          {filters.includeDemand && (
                            <TableCell>{row.ail_mw?.toLocaleString() ?? 'N/A'}</TableCell>
                          )}
                          {filters.includeWeather && (
                            <TableCell>{row.temp_calgary?.toFixed(1) ?? 'N/A'}</TableCell>
                          )}
                          {filters.includeGeneration && (
                            <TableCell>{row.generation_wind?.toLocaleString() ?? 'N/A'}</TableCell>
                          )}
                          {filters.includeReserves && (
                            <TableCell>{row.reserve_margin_percent?.toFixed(1) ?? 'N/A'}%</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1} - {Math.min(currentPage * ROWS_PER_PAGE, data.length)} of {data.length.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="daily">
                <ScrollArea className="h-[400px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background">Date</TableHead>
                        <TableHead className="sticky top-0 bg-background">High (CAD)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Low (CAD)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Average (CAD)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyStats.slice(-100).reverse().map((day, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{day.date}</TableCell>
                          <TableCell className={day.high > 200 ? 'text-red-600 font-semibold' : ''}>
                            ${day.high.toFixed(2)}
                          </TableCell>
                          <TableCell className={day.low < 0 ? 'text-green-600 font-semibold' : ''}>
                            ${day.low.toFixed(2)}
                          </TableCell>
                          <TableCell>${day.average.toFixed(2)}</TableCell>
                          <TableCell>{day.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="highprice">
                <div className="mb-4 flex items-center gap-4">
                  <Label htmlFor="threshold">Price Threshold (CAD/MWh):</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={priceThreshold}
                    onChange={(e) => setPriceThreshold(Number(e.target.value))}
                    className="w-24"
                  />
                  <Badge variant="secondary">
                    {highPriceEvents.length} events found
                  </Badge>
                </div>
                <ScrollArea className="h-[400px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background">Timestamp</TableHead>
                        <TableHead className="sticky top-0 bg-background">Price (CAD)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Demand (MW)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Temp (°C)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Wind (MW)</TableHead>
                        <TableHead className="sticky top-0 bg-background">Season</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highPriceEvents.slice(0, 200).map((event, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{event.timestamp}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            ${event.price.toFixed(2)}
                          </TableCell>
                          <TableCell>{event.demand?.toLocaleString() ?? 'N/A'}</TableCell>
                          <TableCell>{event.temperature?.toFixed(1) ?? 'N/A'}</TableCell>
                          <TableCell>{event.windGeneration?.toLocaleString() ?? 'N/A'}</TableCell>
                          <TableCell className="capitalize">{event.season ?? 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Data Loaded</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select your date range and data categories above, then click "Load Data" to fetch 
              real AESO historical data for analysis and export.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Components
function CategoryCheckbox({ 
  id, 
  label, 
  icon, 
  checked, 
  onChange 
}: { 
  id: string; 
  label: string; 
  icon: React.ReactNode; 
  checked: boolean; 
  onChange: () => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="flex items-center gap-1.5 cursor-pointer">
        {icon}
        {label}
      </Label>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  highlight = false
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-destructive/50' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{title}</span>
        </div>
        <p className={`text-xl font-bold ${highlight ? 'text-destructive' : ''}`}>{value}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function CompletenessBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500';
    if (v >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className={value >= 80 ? 'text-green-600' : value >= 50 ? 'text-amber-600' : 'text-red-600'}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(value)} transition-all`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
