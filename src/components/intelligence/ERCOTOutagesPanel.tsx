import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Factory, TrendingDown, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetOutage {
  total_outages?: number;
  total_capacity_mw?: number;
  outages_by_type?: Array<{
    type: string;
    count: number;
    capacity_mw: number;
  }>;
}

interface ERCOTOutagesPanelProps {
  assetOutages?: AssetOutage | null;
  loading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'];

export function ERCOTOutagesPanel({ assetOutages, loading }: ERCOTOutagesPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Check if we have real outage data
  const hasRealData = assetOutages && 
    (assetOutages.total_outages !== undefined || 
     (assetOutages.outages_by_type && assetOutages.outages_by_type.length > 0));

  if (!hasRealData) {
    return (
      <Alert className="border-muted bg-muted/50">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-muted-foreground">
          <span className="font-medium">No ERCOT Outage Data Available</span> — Generation asset outage 
          information requires authenticated access to ERCOT data services. Real-time outage data is 
          not currently available through the public API.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Generation Asset Outages</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Live Data
            </Badge>
            <Badge variant="outline">
              {assetOutages.total_outages || 0} Active
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Outages by Resource Type</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetOutages.outages_by_type || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'count') return [value, 'Outages'];
                      if (name === 'capacity_mw') return [`${value} MW`, 'Capacity'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Impact Summary</h4>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Total Offline Capacity</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    {((assetOutages.total_capacity_mw || 0) / 1000).toFixed(1)} GW
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {(assetOutages.outages_by_type || []).map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div>
                        <p className="font-medium text-sm">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.count} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.capacity_mw.toFixed(0)} MW</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Factory className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Outage Impact Assessment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Current outages represent approximately {(((assetOutages.total_capacity_mw || 0) / 80000) * 100).toFixed(1)}% 
                of total ERCOT generation capacity. Monitor system reliability and reserve margins during peak demand periods.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
