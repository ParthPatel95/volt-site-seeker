
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Factory, Clock, Zap } from 'lucide-react';

interface AESOOutagesPanelProps {
  assetOutages: any;
  loading: boolean;
}

export function AESOOutagesPanel({ assetOutages, loading }: AESOOutagesPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getOutageTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'forced': return 'destructive';
      case 'planned': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'default';
    }
  };

  const getOutageStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'destructive';
      case 'scheduled': return 'secondary';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Outage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Total Outages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetOutages?.total_outages || 0}
            </div>
            <p className="text-xs text-red-200">Active outage events</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Offline Capacity</CardTitle>
            <Factory className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetOutages?.total_outage_capacity_mw ? 
                `${(assetOutages.total_outage_capacity_mw / 1000).toFixed(1)} GW` : '0.0 GW'}
            </div>
            <p className="text-xs text-orange-200">Total capacity offline</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Average Size</CardTitle>
            <Zap className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetOutages?.total_outages && assetOutages?.total_outage_capacity_mw ? 
                `${(assetOutages.total_outage_capacity_mw / assetOutages.total_outages).toFixed(0)} MW` : '0 MW'}
            </div>
            <p className="text-xs text-blue-200">Per outage event</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Outages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Current Asset Outages
            {assetOutages?.timestamp && (
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(assetOutages.timestamp).toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assetOutages?.outages?.length > 0 ? (
            <div className="space-y-4">
              {assetOutages.outages.map((outage: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{outage.asset_name}</h3>
                      <p className="text-sm text-muted-foreground">{outage.reason}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={getOutageTypeColor(outage.outage_type) as any}>
                        {outage.outage_type}
                      </Badge>
                      <Badge variant={getOutageStatusColor(outage.status) as any}>
                        {outage.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-semibold">{outage.capacity_mw.toFixed(0)} MW</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <div className="font-semibold">
                        {new Date(outage.start_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <div className="font-semibold">
                        {outage.end_date ? 
                          new Date(outage.end_date).toLocaleDateString() : 
                          'TBD'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-semibold">
                        {outage.end_date ? 
                          `${Math.ceil((new Date(outage.end_date).getTime() - new Date(outage.start_date).getTime()) / (1000 * 60 * 60 * 24))} days` :
                          'Ongoing'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Impact Assessment */}
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Market Impact:</span>
                      <Badge variant={
                        outage.capacity_mw > 500 ? 'destructive' :
                        outage.capacity_mw > 200 ? 'secondary' : 'outline'
                      }>
                        {outage.capacity_mw > 500 ? 'High' :
                         outage.capacity_mw > 200 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No current outages reported</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outage Impact Analysis */}
      {assetOutages?.outages?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Factory className="w-5 h-5 mr-2 text-blue-600" />
              Outage Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">By Outage Type</h4>
                {['forced', 'planned', 'maintenance'].map(type => {
                  const typeOutages = assetOutages.outages.filter((o: any) => 
                    o.outage_type.toLowerCase() === type
                  );
                  const typeCapacity = typeOutages.reduce((sum: number, o: any) => sum + o.capacity_mw, 0);
                  
                  return (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize text-sm">{type} Outages</span>
                      <div className="text-right">
                        <div className="font-semibold">{typeOutages.length} events</div>
                        <div className="text-sm text-muted-foreground">
                          {(typeCapacity / 1000).toFixed(1)} GW
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Market Implications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Grid Stability Impact:</span>
                    <Badge variant={
                      assetOutages.total_outage_capacity_mw > 1500 ? 'destructive' :
                      assetOutages.total_outage_capacity_mw > 500 ? 'secondary' : 'default'
                    }>
                      {assetOutages.total_outage_capacity_mw > 1500 ? 'High Risk' :
                       assetOutages.total_outage_capacity_mw > 500 ? 'Moderate' : 'Low Risk'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Price Impact Potential:</span>
                    <Badge variant={
                      assetOutages.total_outage_capacity_mw > 1000 ? 'destructive' : 'secondary'
                    }>
                      {assetOutages.total_outage_capacity_mw > 1000 ? 'Upward Pressure' : 'Minimal'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserve Margin Impact:</span>
                    <Badge variant="outline">
                      -{((assetOutages.total_outage_capacity_mw / 16000) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
