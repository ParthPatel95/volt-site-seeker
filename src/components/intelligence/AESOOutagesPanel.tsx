
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Factory, Zap, Clock, TrendingDown, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AESOOutagesPanelProps {
  assetOutages: any;
  loading: boolean;
}

export function AESOOutagesPanel({ assetOutages, loading }: AESOOutagesPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Check if we have real outage data
  const hasRealData = assetOutages?.outages?.length > 0;

  if (!hasRealData) {
    return (
      <Alert className="border-muted bg-muted/50">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-muted-foreground">
          <span className="font-medium">No Outage Data Available</span> — Asset outage information 
          requires authenticated access to AESO data services. Real-time outage data is not currently 
          available through the public API.
        </AlertDescription>
      </Alert>
    );
  }

  // Use only real data - no mock generation
  const outages = assetOutages.outages;
  const totalOutages = assetOutages?.total_outages || outages.length;
  const totalCapacity = assetOutages?.total_outage_capacity_mw || 
    outages.reduce((sum: number, outage: any) => sum + (outage.capacity_mw || 0), 0);

  // Process data for charts
  const outagesByType = outages.reduce((acc: any, outage: any) => {
    acc[outage.outage_type] = (acc[outage.outage_type] || 0) + 1;
    return acc;
  }, {});

  const capacityByType = outages.reduce((acc: any, outage: any) => {
    acc[outage.outage_type] = (acc[outage.outage_type] || 0) + (outage.capacity_mw || 0);
    return acc;
  }, {});

  const pieData = Object.entries(outagesByType).map(([type, count]) => ({
    name: type,
    value: count,
    capacity: capacityByType[type]
  }));

  const barData = Object.entries(capacityByType).map(([type, capacity]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    capacity: capacity,
    count: outagesByType[type]
  }));

  const activeOutages = outages.filter((outage: any) => outage.status === 'active');
  const criticalOutages = outages.filter((outage: any) => (outage.capacity_mw || 0) > 200);

  const COLORS = ['#ef4444', '#f97316', '#eab308'];

  return (
    <div className="space-y-6">
      {/* Live Data Badge */}
      <div className="flex justify-end">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Live Data
        </Badge>
      </div>

      {/* Outage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Outages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{totalOutages}</div>
            <p className="text-xs text-red-600">Active: {activeOutages.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Offline Capacity</CardTitle>
            <Factory className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {(totalCapacity / 1000).toFixed(1)} GW
            </div>
            <p className="text-xs text-orange-600">Total MW: {totalCapacity.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Critical Outages</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{criticalOutages.length}</div>
            <p className="text-xs text-yellow-600">&gt;200 MW capacity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {outages.length > 0 ? Math.round(outages.reduce((sum: number, outage: any) => {
                const duration = new Date(outage.end_date).getTime() - new Date(outage.start_date).getTime();
                return sum + (duration / (1000 * 60 * 60));
              }, 0) / outages.length) : 0} hrs
            </div>
            <p className="text-xs text-blue-600">Per outage</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              Outage Capacity by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'capacity' ? `${value} MW` : `${value} outages`,
                    name === 'capacity' ? 'Capacity' : 'Count'
                  ]}
                />
                <Bar dataKey="capacity" fill="#ef4444" name="capacity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Outages by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value} outages`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Outages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Factory className="w-5 h-5 mr-2 text-blue-600" />
            Current Active Outages
            <Badge variant="outline" className="ml-auto">
              {activeOutages.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeOutages.slice(0, 6).map((outage: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{outage.asset_name}</span>
                    <Badge variant={
                      outage.outage_type === 'forced' ? 'destructive' :
                      outage.outage_type === 'planned' ? 'default' : 'secondary'
                    }>
                      {outage.outage_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {outage.reason}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Started: {new Date(outage.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{outage.capacity_mw} MW</div>
                  <div className="text-sm text-muted-foreground">
                    {outage.status === 'active' ? 'Ongoing' : 'Resolved'}
                  </div>
                </div>
              </div>
            ))}
            {activeOutages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Factory className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active outages detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
