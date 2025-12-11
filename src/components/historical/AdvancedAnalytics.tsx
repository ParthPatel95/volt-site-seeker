import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer, AlertTriangle } from 'lucide-react';
import { historicalDataService, HourlyDataPoint } from '@/services/historicalDataService';
import { applyMonthlyUptimeFilter } from '@/utils/uptimeFilter';
import {
  aggregateByYear,
  aggregateForHeatmap,
  aggregateByDay,
  generateDurationCurve,
  calculateRollingStats,
  calculateOnOffPeakStats,
} from '@/utils/aggregations';
import { AdvancedAnalyticsControls, AnalyticsFilters } from './AdvancedAnalyticsControls';
import { YearlyTrendChart } from './YearlyTrendChart';
import { MonthlyHeatmap } from './MonthlyHeatmap';
import { TimeSeriesChart } from './TimeSeriesChart';
import { DurationCurveChart } from './DurationCurveChart';
import { CorrelationScatter } from './CorrelationScatter';
import { RollingStatsChart } from './RollingStatsChart';
import { OnOffPeakComparison } from './OnOffPeakComparison';
import { exportToCSV, printReport } from '@/utils/exportUtils';
import { useEnergyCredits, defaultCreditSettings } from '@/hooks/useEnergyCredits';
import { CreditSummaryCard } from '@/components/aeso/CreditSummaryCard';

interface AdvancedAnalyticsProps {
  marketType?: 'aeso' | 'ercot';
}

export function AdvancedAnalytics({ marketType = 'aeso' }: AdvancedAnalyticsProps = {}) {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    uptimePercentage: 100,
    granularity: 'daily',
    unit: 'mwh',
    showAIL: false,
    showGeneration: false,
    onPeakStart: 8,
    onPeakEnd: 22,
    creditSettings: defaultCreditSettings,
  });

  const [rawData, setRawData] = useState<HourlyDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<HourlyDataPoint[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getDefaultStartDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 3);
    return date.toISOString().split('T')[0];
  }

  function getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      // Fetch data based on market type
      const { data, warnings: fetchWarnings } = await historicalDataService.getHistoricalData({
        startDate,
        endDate,
        marketType,
      });

      setRawData(data);
      setWarnings(fetchWarnings);

      // Apply uptime filter
      const { filteredData, monthWarnings } = applyMonthlyUptimeFilter(
        data,
        filters.uptimePercentage
      );

      setFilteredData(filteredData);
      setWarnings(prev => [...prev, ...monthWarnings]);
    } catch (err: any) {
      console.error('Error loading data:', err);
      const errorMessage = err.message || 'Failed to load data';
      
      // Add more context to the error
      if (errorMessage.includes('366 days')) {
        setError('AESO API limit: The system is automatically fetching data in smaller chunks. Please try again.');
      } else if (errorMessage.includes('rate limit')) {
        setError('API rate limit reached. Please wait a moment and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reapply filter when uptime percentage changes (without refetching)
  useEffect(() => {
    if (rawData.length > 0) {
      const { filteredData, monthWarnings } = applyMonthlyUptimeFilter(
        rawData,
        filters.uptimePercentage
      );
      setFilteredData(filteredData);
      
      // Only keep fetch warnings, add new month warnings
      const fetchWarnings = warnings.filter(w => !w.includes('has missing hours'));
      setWarnings([...fetchWarnings, ...monthWarnings]);
    }
  }, [filters.uptimePercentage]);

  // Apply credit adjustments
  const creditSettings = filters.creditSettings || defaultCreditSettings;
  const { adjustedData, creditSummary } = useEnergyCredits(filteredData, creditSettings);
  
  // Use credit-adjusted data for aggregations when credits are enabled
  const dataForCharts = creditSettings.enabled ? adjustedData : filteredData;

  // Prepare aggregated data
  const yearlyData = dataForCharts.length > 0 ? aggregateByYear(dataForCharts) : [];
  const heatmapData = dataForCharts.length > 0 ? aggregateForHeatmap(dataForCharts) : [];
  const dailyData = dataForCharts.length > 0 ? aggregateByDay(dataForCharts) : [];
  const durationCurve = dataForCharts.length > 0 ? generateDurationCurve(dataForCharts) : [];
  const rollingStats = dailyData.length >= 30 ? calculateRollingStats(dailyData, 30) : [];
  const onOffPeakStats = dataForCharts.length > 0
    ? calculateOnOffPeakStats(dataForCharts, filters.onPeakStart, filters.onPeakEnd)
    : null;
  
  // Also prepare original data for comparison charts
  const originalDailyData = filteredData.length > 0 ? aggregateByDay(filteredData) : [];

  // Debug logging
  console.log('📊 Advanced Analytics Data:', {
    filteredDataCount: filteredData.length,
    dailyDataCount: dailyData.length,
    durationCurvePoints: durationCurve.length,
    rollingStatsPoints: rollingStats.length,
    firstDurationPoint: durationCurve[0],
    firstRollingPoint: rollingStats[0]
  });

  const handleExportCSV = () => {
    exportToCSV(filteredData, filters, `aeso-data-${filters.startDate}-to-${filters.endDate}.csv`);
  };

  const handlePrint = () => {
    printReport();
  };

  const dismissWarning = (index: number) => {
    setWarnings(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6" id="advanced-analytics-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Advanced Historical Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            {marketType === 'ercot' 
              ? 'Up to 10 years of ERCOT hourly pricing data with uptime filtering'
              : 'Up to 20 years of hourly AESO data with uptime filtering'
            }
          </p>
        </div>
        
        {filteredData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm" className="print:hidden">
              <Printer className="w-4 h-4 mr-2" />
              Print / PDF
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <AdvancedAnalyticsControls
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApply}
        loading={loading}
      />

      {/* Warnings */}
      {warnings.map((warning, index) => (
        <Alert key={index} className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{warning}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissWarning(index)}
              className="h-6 px-2 text-xs"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      ))}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading historical data...</p>
        </div>
      )}

      {/* No Data State */}
      {!loading && filteredData.length === 0 && !error && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No data under current filters</p>
          <p className="text-sm text-muted-foreground mt-2">
            Adjust your settings and click "Apply & Load Data" to view results
          </p>
        </div>
      )}

      {/* Charts */}
      {!loading && filteredData.length > 0 && (
        <div className="space-y-6 print:space-y-4">
          {/* Data Info Banner */}
          <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong>Real {marketType === 'ercot' ? 'ERCOT' : 'AESO'} Data:</strong> All pricing data is fetched directly from {marketType === 'ercot' ? "ERCOT's official Settlement Point Price API" : "AESO's official Pool Price API"}. 
              {filteredData.some(d => d.ail > 0) ? (
                <span> {marketType === 'ercot' ? 'Load' : 'AIL (load)'} data is included for this date range.</span>
              ) : (
                <span> Note: {marketType === 'ercot' ? 'Load' : 'AIL'} and generation data are only available for recent periods due to API limitations.</span>
              )}
              {' '}All displayed prices are actual historical {marketType === 'ercot' ? 'LMP prices from the Texas' : 'pool prices from the Alberta'} electricity market.
            </AlertDescription>
          </Alert>

          {/* Credit Summary Card */}
          {creditSettings.enabled && (
            <CreditSummaryCard summary={creditSummary} unit={filters.unit} />
          )}

          {/* Yearly Trend */}
          <div id="chart-yearly-trend">
            <YearlyTrendChart 
              data={yearlyData} 
              unit={filters.unit}
              originalData={creditSettings.enabled ? aggregateByYear(filteredData) : undefined}
              showComparison={creditSettings.enabled}
            />
          </div>

          {/* Monthly Heatmap */}
          <div id="chart-monthly-heatmap">
            <MonthlyHeatmap data={heatmapData} unit={filters.unit} />
          </div>

          {/* Time Series */}
          <div id="chart-time-series">
            <TimeSeriesChart
              hourlyData={filters.granularity === 'hourly' ? dataForCharts : undefined}
              dailyData={filters.granularity === 'daily' ? dailyData : undefined}
              originalHourlyData={creditSettings.enabled && filters.granularity === 'hourly' ? filteredData : undefined}
              originalDailyData={creditSettings.enabled && filters.granularity === 'daily' ? originalDailyData : undefined}
              granularity={filters.granularity === 'hourly' ? 'hourly' : 'daily'}
              unit={filters.unit}
              showAIL={filters.showAIL}
              showGeneration={filters.showGeneration}
              showComparison={creditSettings.enabled}
            />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
            <div id="chart-duration-curve">
              <DurationCurveChart data={durationCurve} unit={filters.unit} />
            </div>
            
            {filteredData.some(d => d.ail > 0 || d.generation > 0) ? (
              <div id="chart-correlation">
                <CorrelationScatter data={filteredData} unit={filters.unit} />
              </div>
            ) : (
              <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <strong>Correlation Analysis Unavailable:</strong> Generation and AIL data are only available for recent periods (last 31 days). 
                  For extended historical analysis, the AESO API provides pool price data only. 
                  {((new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) / (1000 * 60 * 60 * 24)) <= 31 && (
                    <span> Try refreshing or check back later if data is still being loaded.</span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Rolling Stats */}
          {rollingStats.length > 0 && (
            <div id="chart-rolling-stats">
              <RollingStatsChart data={rollingStats} unit={filters.unit} />
            </div>
          )}

          {/* On/Off Peak */}
          {onOffPeakStats && (
            <div id="chart-on-off-peak">
              <OnOffPeakComparison
                stats={onOffPeakStats}
                unit={filters.unit}
                onPeakStart={filters.onPeakStart}
                onPeakEnd={filters.onPeakEnd}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
