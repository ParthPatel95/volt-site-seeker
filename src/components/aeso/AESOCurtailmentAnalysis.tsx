import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  AlertOctagon, 
  Download, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Zap,
  BarChart3
} from 'lucide-react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface RawHourlyData {
  datetime: string;
  price: number;
  date: string;
  hour: number;
}

interface CurtailmentEvent {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  peakPrice: number;
  averagePrice: number;
  totalCost: number;
}

interface CurtailmentSummary {
  totalEvents: number;
  totalHours: number;
  averageDuration: number;
  percentageOfTime: number;
  totalCostAvoided: number;
  averageEventPrice: number;
  peakEventPrice: number;
}

interface AESOCurtailmentAnalysisProps {
  rawHourlyData: RawHourlyData[];
  loading: boolean;
  timePeriodLabel: string;
}

const PRESET_THRESHOLDS = [50, 60, 75, 100, 150, 200];

export function AESOCurtailmentAnalysis({ 
  rawHourlyData, 
  loading, 
  timePeriodLabel 
}: AESOCurtailmentAnalysisProps) {
  const { formatCurrency } = useCurrencyConversion();
  const [priceThreshold, setPriceThreshold] = useState<number>(60);
  const [customThreshold, setCustomThreshold] = useState<string>('60');

  // Analyze curtailment events based on threshold
  const { events, summary } = useMemo(() => {
    if (!rawHourlyData || rawHourlyData.length === 0) {
      return { events: [], summary: null };
    }

    // Sort data chronologically
    const sortedData = [...rawHourlyData].sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    const curtailmentEvents: CurtailmentEvent[] = [];
    let currentEvent: {
      startIdx: number;
      hours: RawHourlyData[];
    } | null = null;

    // Identify consecutive hours above threshold
    for (let i = 0; i < sortedData.length; i++) {
      const hour = sortedData[i];
      const isAboveThreshold = hour.price >= priceThreshold;

      if (isAboveThreshold) {
        if (!currentEvent) {
          // Start new event
          currentEvent = {
            startIdx: i,
            hours: [hour]
          };
        } else {
          // Continue current event
          currentEvent.hours.push(hour);
        }
      } else {
        if (currentEvent) {
          // End current event and save it
          const eventHours = currentEvent.hours;
          const startHour = eventHours[0];
          const endHour = eventHours[eventHours.length - 1];
          
          curtailmentEvents.push({
            id: curtailmentEvents.length + 1,
            date: startHour.date,
            startTime: `${startHour.hour.toString().padStart(2, '0')}:00`,
            endTime: `${((endHour.hour + 1) % 24).toString().padStart(2, '0')}:00`,
            durationHours: eventHours.length,
            peakPrice: Math.max(...eventHours.map(h => h.price)),
            averagePrice: eventHours.reduce((sum, h) => sum + h.price, 0) / eventHours.length,
            totalCost: eventHours.reduce((sum, h) => sum + h.price, 0)
          });
          
          currentEvent = null;
        }
      }
    }

    // Don't forget the last event if still open
    if (currentEvent) {
      const eventHours = currentEvent.hours;
      const startHour = eventHours[0];
      const endHour = eventHours[eventHours.length - 1];
      
      curtailmentEvents.push({
        id: curtailmentEvents.length + 1,
        date: startHour.date,
        startTime: `${startHour.hour.toString().padStart(2, '0')}:00`,
        endTime: `${((endHour.hour + 1) % 24).toString().padStart(2, '0')}:00`,
        durationHours: eventHours.length,
        peakPrice: Math.max(...eventHours.map(h => h.price)),
        averagePrice: eventHours.reduce((sum, h) => sum + h.price, 0) / eventHours.length,
        totalCost: eventHours.reduce((sum, h) => sum + h.price, 0)
      });
    }

    // Calculate summary statistics
    const totalHours = curtailmentEvents.reduce((sum, e) => sum + e.durationHours, 0);
    const totalCostAvoided = curtailmentEvents.reduce((sum, e) => sum + e.totalCost, 0);
    
    const summary: CurtailmentSummary = {
      totalEvents: curtailmentEvents.length,
      totalHours,
      averageDuration: curtailmentEvents.length > 0 ? totalHours / curtailmentEvents.length : 0,
      percentageOfTime: (totalHours / sortedData.length) * 100,
      totalCostAvoided,
      averageEventPrice: curtailmentEvents.length > 0 
        ? curtailmentEvents.reduce((sum, e) => sum + e.averagePrice, 0) / curtailmentEvents.length 
        : 0,
      peakEventPrice: curtailmentEvents.length > 0 
        ? Math.max(...curtailmentEvents.map(e => e.peakPrice)) 
        : 0
    };

    // Sort events by date (most recent first) for display
    const sortedEvents = [...curtailmentEvents].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { events: sortedEvents, summary };
  }, [rawHourlyData, priceThreshold]);

  const handleThresholdChange = (value: string) => {
    setCustomThreshold(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setPriceThreshold(numValue);
    }
  };

  const handlePresetClick = (preset: number) => {
    setPriceThreshold(preset);
    setCustomThreshold(preset.toString());
  };

  const exportToCSV = () => {
    if (events.length === 0) return;

    const headers = ['Event #', 'Date', 'Start Time', 'End Time', 'Duration (hrs)', 'Peak Price (CAD)', 'Avg Price (CAD)', 'Total Cost (CAD)'];
    const rows = events.map(e => [
      e.id,
      e.date,
      e.startTime,
      e.endTime,
      e.durationHours,
      e.peakPrice.toFixed(2),
      e.averagePrice.toFixed(2),
      e.totalCost.toFixed(2)
    ]);

    const csvContent = [
      `Price Curtailment Analysis - Threshold: $${priceThreshold} CAD/MWh`,
      `Period: ${timePeriodLabel}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `curtailment_analysis_${priceThreshold}cad_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-orange-600" />
            Price Curtailment Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Analyze when price curtailment would be triggered based on your threshold
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Calendar className="w-3 h-3 mr-1" />
          {timePeriodLabel}
        </Badge>
      </div>

      {/* Threshold Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Price Threshold Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_THRESHOLDS.map((preset) => (
              <Button
                key={preset}
                variant={priceThreshold === preset ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
              >
                ${preset}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="custom-threshold" className="whitespace-nowrap">
              Custom:
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="custom-threshold"
                type="number"
                value={customThreshold}
                onChange={(e) => handleThresholdChange(e.target.value)}
                className="pl-7 w-32"
                min="1"
                step="1"
              />
            </div>
            <span className="text-sm text-muted-foreground">CAD/MWh</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.totalEvents}</p>
                  <p className="text-xs text-muted-foreground">curtailment periods</p>
                </div>
                <AlertOctagon className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalHours}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.percentageOfTime.toFixed(1)}% of period
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.averageDuration.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">hours per event</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peak Event Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${summary.peakEventPrice.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">CAD/MWh maximum</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost Avoided Summary */}
      {summary && summary.totalCostAvoided > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Potential Cost Avoided by Curtailment
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  ${summary.totalCostAvoided.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  If 1 MW load was curtailed during all {summary.totalHours} hours above ${priceThreshold}/MWh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            Curtailment Events ({events.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={events.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertOctagon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No curtailment events found above ${priceThreshold} CAD/MWh</p>
              <p className="text-sm mt-1">Try lowering the price threshold</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="text-right">Peak Price</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 50).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.id}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.startTime}</TableCell>
                      <TableCell>{event.endTime}</TableCell>
                      <TableCell className="text-right">
                        {event.durationHours} hr{event.durationHours !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        ${event.peakPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${event.averagePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${event.totalCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {events.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing first 50 of {events.length} events. Export CSV for full data.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AESOCurtailmentAnalysis;
