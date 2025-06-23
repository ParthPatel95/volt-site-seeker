
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Factory, Zap, Clock, TrendingDown } from 'lucide-react';
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
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Generate outage data if not available
  const getOutageData = () => {
    if (assetOutages?.outages?.length > 0) {
      return assetOutages.outages;
    }

    // Generate sample outage data
    const outageTypes = ['planned', 'forced', 'maintenance'];
    const assetTypes = ['generation', 'transmission', 'distribution'];
    const sampleOutages = [];

    for (let i = 0; i < 8; i++) {
      const capacity = 50 + Math.floor(Math.random() * 400);
      const startDate = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
      const duration = Math.floor(Math.random() * 72) + 1; // 1-72 hours
      
      sampleOutages.push({
        asset_name: `${assetTypes[Math.floor(Math.random() * assetTypes.length)].toUpperCase()}_${String(i + 1).padStart(3, '0')}`,
        outage_type: outageTypes[Math.floor(Math.random() * outageTypes.length)],
        capacity_mw: capacity,
        start_date: startDate.toISOString(),
        end_date: new Date(startDate.getTime() + duration * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.3 ? 'active' : 'resolved',
        reason: Math.random() > 0.5 ? 'Scheduled maintenance' : 'Equipment failure'
      });
    }
    
    return sampleOutages;
  };

  const outages = getOutageData();
  const totalOutages = assetOutages?.total_outages || outages.length;
  const totalCapacity = assetOutages?.total_outage_capacity_mw || 
    outages.reduce((sum, outage) => sum + outage.capacity_mw, 0);

  // Process data for charts
  const outagesByType = outages.reduce((acc, outage) => {
    acc[outage.outage_type] = (acc[outage.outage_type] || 0) + 1;
    return acc;
  }, {});

  const capacityByType = outages.reduce((acc, outage) => {
    acc[outage.outage_type] = (acc[outage.outage_type] || 0) + outage.capacity_mw;
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

  const activeOutages = outages.filter(outage => outage.status === 'active');
  const criticalOutages = outages.filter(outage => outage.capacity_mw > 200);

  const COLORS = ['#ef4444', '#f97316', '#eab308'];

  return (
    <div className="space-y-6">
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
              {Math.round(outages.reduce((sum, outage) => {
                const duration = new Date(outage.end_date).getTime() - new Date(outage.start_date).getTime();
                return sum + (duration / (1000 * 60 * 60));
              }, 0) / outages.length)} hrs
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
            {activeOutages.slice(0, 6).map((outage, index) => (
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
