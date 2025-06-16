
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Zap, 
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  RefreshCw,
  Factory,
  Gauge
} from 'lucide-react';
import { useFERCData } from '@/hooks/useFERCData';

export function FERCDashboard() {
  const { 
    interconnectionQueue, 
    generatorData, 
    loading, 
    refetch 
  } = useFERCData();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'under review': return 'secondary';
      case 'feasibility study': return 'default';
      case 'system impact study': return 'outline';
      case 'approved': return 'default';
      default: return 'secondary';
    }
  };

  const getTechnologyIcon = (tech: string) => {
    switch (tech.toLowerCase()) {
      case 'solar': case 'solar pv': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'wind': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'battery storage': return <Gauge className="w-4 h-4 text-purple-500" />;
      default: return <Factory className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">FERC Data Dashboard</h2>
          <p className="text-muted-foreground">Federal Energy Regulatory Commission interconnection and generator data</p>
        </div>
        <Button 
          onClick={refetch}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      {interconnectionQueue?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{interconnectionQueue.summary.total_projects.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">{(interconnectionQueue.summary.total_capacity_mw / 1000).toFixed(1)} GW</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Solar + Wind</p>
                  <p className="text-2xl font-bold">
                    {((interconnectionQueue.summary.solar_capacity_mw + interconnectionQueue.summary.wind_capacity_mw) / 1000).toFixed(1)} GW
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Queue Time</p>
                  <p className="text-2xl font-bold">{interconnectionQueue.summary.average_queue_time_months} mo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interconnection Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Interconnection Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {interconnectionQueue?.queue_items ? (
            <div className="space-y-4">
              {interconnectionQueue.queue_items.map((item) => (
                <div key={item.queue_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        {getTechnologyIcon(item.technology_type)}
                        <h3 className="font-semibold">{item.project_name}</h3>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p className="font-medium">{item.capacity_mw} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Technology</p>
                          <p className="font-medium">{item.technology_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{item.county}, {item.state}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Queue Position</p>
                          <p className="font-medium">#{item.queue_position}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{item.transmission_owner}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Target: {new Date(item.interconnection_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${(item.estimated_cost / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading interconnection queue...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generator Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Factory className="w-5 h-5 mr-2 text-green-600" />
            Active Generators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatorData?.generators ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatorData.generators.map((generator) => (
                <div key={generator.plant_id} className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getTechnologyIcon(generator.fuel_type)}
                      <h3 className="font-semibold">{generator.plant_name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Operator</p>
                        <p className="font-medium">{generator.operator}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capacity</p>
                        <p className="font-medium">{generator.capacity_mw} MW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fuel Type</p>
                        <p className="font-medium">{generator.fuel_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Commercial Date</p>
                        <p className="font-medium">{new Date(generator.commercial_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{generator.county}, {generator.state}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Factory className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading generator data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
