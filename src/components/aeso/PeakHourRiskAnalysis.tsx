import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Thermometer
} from 'lucide-react';
import { TwelveCPSavingsData } from '@/hooks/use12CPSavingsAnalytics';

interface PeakHourRiskAnalysisProps {
  savingsData: TwelveCPSavingsData | null;
}

export function PeakHourRiskAnalysis({ savingsData }: PeakHourRiskAnalysisProps) {
  if (!savingsData) return null;

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'hsl(0, 84%, 60%)'; // Red
    if (riskScore >= 50) return 'hsl(38, 92%, 50%)'; // Orange
    if (riskScore >= 30) return 'hsl(48, 96%, 53%)'; // Yellow
    return 'hsl(142, 76%, 36%)'; // Green
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return <Badge className="bg-red-600">High Risk</Badge>;
      case 'Moderate':
        return <Badge className="bg-orange-500">Moderate</Badge>;
      default:
        return <Badge className="bg-green-600">Low Risk</Badge>;
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <div className="space-y-6">
      {/* Peak Hour Risk Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Peak Hour Risk Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Hourly risk scores based on historical peak probability and average prices
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData.peakHourRisks}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="hour" 
                  fontSize={10}
                  tickFormatter={(h) => h % 3 === 0 ? formatHour(h) : ''}
                />
                <YAxis 
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg shadow-lg p-3">
                          <p className="font-semibold">{formatHour(data.hour)}</p>
                          <p className="text-sm text-muted-foreground">{data.seasonalPattern}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">Risk Score: <strong>{data.riskScore}%</strong></p>
                            <p className="text-sm">Avg Price: <strong>${data.avgPriceAtPeak}/MWh</strong></p>
                            <p className="text-sm">Data Points: <strong>{data.occurrences}</strong></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="riskScore" radius={[4, 4, 0, 0]}>
                  {savingsData.peakHourRisks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">High Risk (70%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-muted-foreground">Moderate (50-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-muted-foreground">Low-Moderate (30-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Safe (&lt;30%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Risk & Safe Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* High Risk Hours */}
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              High-Risk Hours (Avoid)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savingsData.highRiskHours.length > 0 ? (
                savingsData.highRiskHours.map(hour => (
                  <Badge key={hour} variant="destructive">
                    {formatHour(hour)}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No consistently high-risk hours identified</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              These hours historically have the highest prices and peak probability
            </p>
          </CardContent>
        </Card>

        {/* Safe Hours */}
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Safe Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savingsData.safeHours.length > 0 ? (
                savingsData.safeHours.map(hour => (
                  <Badge key={hour} className="bg-green-600">
                    {formatHour(hour)}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">All hours have moderate risk</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Maximize operations during these hours for lowest energy costs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            Seasonal Risk Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Winter */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Winter</span>
                {getRiskBadge(savingsData.seasonalInsights.winter.riskLevel)}
              </div>
              <p className="text-2xl font-bold">${savingsData.seasonalInsights.winter.avgPeak}/MWh</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Peak Hour Price</p>
              <p className="text-xs text-muted-foreground mt-2">
                Dec-Feb: Morning heating demand drives peaks
              </p>
            </div>

            {/* Summer */}
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Summer</span>
                {getRiskBadge(savingsData.seasonalInsights.summer.riskLevel)}
              </div>
              <p className="text-2xl font-bold">${savingsData.seasonalInsights.summer.avgPeak}/MWh</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Peak Hour Price</p>
              <p className="text-xs text-muted-foreground mt-2">
                Jun-Aug: Afternoon cooling demand increases risk
              </p>
            </div>

            {/* Shoulder */}
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Shoulder</span>
                {getRiskBadge(savingsData.seasonalInsights.shoulder.riskLevel)}
              </div>
              <p className="text-2xl font-bold">${savingsData.seasonalInsights.shoulder.avgPeak}/MWh</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Peak Hour Price</p>
              <p className="text-xs text-muted-foreground mt-2">
                Mar-May, Sep-Nov: Lower risk, optimal for operations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
