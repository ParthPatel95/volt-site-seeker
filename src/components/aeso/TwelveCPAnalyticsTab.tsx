import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Zap, 
  DollarSign, 
  Calculator,
  Activity,
  Loader2,
  RefreshCw,
  Radio,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useAESORealtimeReserves } from '@/hooks/useAESORealtimeReserves';
import { use12CPSavingsAnalytics } from '@/hooks/use12CPSavingsAnalytics';
import { TwelveCPSavingsSimulator } from './TwelveCPSavingsSimulator';
import { PeakHourRiskAnalysis } from './PeakHourRiskAnalysis';
import { format } from 'date-fns';

export function TwelveCPAnalyticsTab() {
  const [activeSection, setActiveSection] = useState('savings');

  const {
    reserves: realtimeReserves,
    loading: loadingRealtime,
    error: realtimeError,
    lastFetched,
    fetchRealtimeReserves,
    getMarginStatus
  } = useAESORealtimeReserves();

  const {
    savingsData,
    loading: loadingSavings,
    fetch12CPSavingsData
  } = use12CPSavingsAnalytics();

  useEffect(() => {
    fetchRealtimeReserves();
    fetch12CPSavingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-CA', { maximumFractionDigits: decimals }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="savings" className="min-h-[44px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Savings Simulator</span>
            <span className="sm:hidden">Savings</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="min-h-[44px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Peak Hour Risk</span>
            <span className="sm:hidden">Risk</span>
          </TabsTrigger>
          <TabsTrigger value="reserves" className="min-h-[44px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Live Reserves</span>
            <span className="sm:hidden">Reserves</span>
          </TabsTrigger>
        </TabsList>

        {/* Savings Simulator Tab */}
        <TabsContent value="savings" className="mt-6">
          <TwelveCPSavingsSimulator />
        </TabsContent>

        {/* Peak Hour Risk Tab */}
        <TabsContent value="risk" className="mt-6">
          {loadingSavings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading risk analysis...</span>
            </div>
          ) : (
            <PeakHourRiskAnalysis savingsData={savingsData} />
          )}
        </TabsContent>

        {/* Real-Time Reserves Tab */}
        <TabsContent value="reserves" className="mt-6">
          <div className="space-y-6">
            {/* Real-Time Reserves Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Radio className="w-4 h-4 text-green-600 animate-pulse" />
                    Real-Time Operating Reserves
                    <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 border-green-300">
                      Live
                    </Badge>
                  </CardTitle>
                  <Button
                    onClick={fetchRealtimeReserves}
                    disabled={loadingRealtime}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    {loadingRealtime ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingRealtime ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    <span className="ml-2 text-sm text-muted-foreground">Fetching live reserves...</span>
                  </div>
                ) : realtimeReserves ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                        <p className="text-xs text-muted-foreground">Total Reserve</p>
                        <p className="text-xl font-bold text-green-700 dark:text-green-400">
                          {formatNumber(realtimeReserves.total_mw)} MW
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                        <p className="text-xs text-muted-foreground">Spinning (Contingency)</p>
                        <p className="text-xl font-bold">
                          {formatNumber(realtimeReserves.spinning_mw)} MW
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                        <p className="text-xs text-muted-foreground">Required Reserve</p>
                        <p className="text-xl font-bold">
                          {formatNumber(realtimeReserves.required_mw)} MW
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                        <p className="text-xs text-muted-foreground">Reserve Margin</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xl font-bold ${getMarginStatus(realtimeReserves.margin_percent).color}`}>
                            {realtimeReserves.margin_percent > 0 ? '+' : ''}{realtimeReserves.margin_percent}%
                          </p>
                          {realtimeReserves.margin_percent >= 5 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <p className={`text-xs ${getMarginStatus(realtimeReserves.margin_percent).color}`}>
                          {getMarginStatus(realtimeReserves.margin_percent).status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-green-200/50">
                      <span>Source: {realtimeReserves.source || 'AESO CSD API'}</span>
                      <span>
                        Last updated: {lastFetched ? format(lastFetched, 'HH:mm:ss') : '—'} MST
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Shield className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {realtimeError || 'Real-time reserve data temporarily unavailable'}
                    </p>
                    <Button
                      onClick={fetchRealtimeReserves}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Why Reserves Matter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Why Operating Reserves Matter for 12CP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Peak Prediction</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Low reserves often precede system peaks. Monitor reserve levels to anticipate 12CP hours.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Price Correlation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reserve shortages drive price spikes. Tight reserves = higher pool prices and peak risk.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Demand Response</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use reserve alerts as a trigger to curtail load and avoid contributing to system peak.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
