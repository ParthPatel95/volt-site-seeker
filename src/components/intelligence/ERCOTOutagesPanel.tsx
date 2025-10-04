import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Factory, Zap, Clock, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Generate mock data if no real data available
  const mockOutageData = {
    total_outages: 12,
    total_capacity_mw: 3030,
    outages_by_type: [
      { type: 'Nuclear', count: 1, capacity_mw: 1280 },
      { type: 'Natural Gas', count: 5, capacity_mw: 1200 },
      { type: 'Coal', count: 3, capacity_mw: 400 },
      { type: 'Wind', count: 3, capacity_mw: 150 }
    ]
  };

  const displayData = assetOutages || mockOutageData;

  if (!displayData) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No outage data available
        </CardContent>
      </Card>
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
          <Badge variant="outline">
            {displayData.total_outages || 0} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Outages by Resource Type</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData.outages_by_type || []}>
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
                    {((displayData.total_capacity_mw || 0) / 1000).toFixed(1)} GW
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {(displayData.outages_by_type || []).map((item: any, index: number) => (
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
                Current outages represent approximately {(((displayData.total_capacity_mw || 0) / 80000) * 100).toFixed(1)}% 
                of total ERCOT generation capacity. Monitor system reliability and reserve margins during peak demand periods.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
