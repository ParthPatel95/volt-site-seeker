
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  TrendingUp, 
  Activity,
  Database,
  Zap,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { useFERCData } from '@/hooks/useFERCData';

export function FERCDashboard() {
  const { 
    interconnectionQueue, 
    generatorData, 
    loading, 
    refetch 
  } = useFERCData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">FERC Data Dashboard</h2>
          <p className="text-muted-foreground">Federal Energy Regulatory Commission data and analytics</p>
        </div>
        <Button 
          onClick={refetch}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Interconnection Queue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Interconnection Queue Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {interconnectionQueue ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{interconnectionQueue.summary.total_projects.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{(interconnectionQueue.summary.total_capacity_mw / 1000).toFixed(1)} GW</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Queue Time</p>
                <p className="text-2xl font-bold">{interconnectionQueue.summary.average_queue_time_months}</p>
                <p className="text-xs text-muted-foreground">months</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Solar Projects</p>
                <p className="text-2xl font-bold">{(interconnectionQueue.summary.solar_capacity_mw / 1000).toFixed(1)} GW</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading interconnection queue data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technology Breakdown */}
      {interconnectionQueue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Technology Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Solar Capacity</span>
                  <div className="text-right">
                    <div className="font-semibold">{(interconnectionQueue.summary.solar_capacity_mw / 1000).toFixed(1)} GW</div>
                    <div className="text-xs text-muted-foreground">
                      {((interconnectionQueue.summary.solar_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Wind Capacity</span>
                  <div className="text-right">
                    <div className="font-semibold">{(interconnectionQueue.summary.wind_capacity_mw / 1000).toFixed(1)} GW</div>
                    <div className="text-xs text-muted-foreground">
                      {((interconnectionQueue.summary.wind_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage Capacity</span>
                  <div className="text-right">
                    <div className="font-semibold">{(interconnectionQueue.summary.storage_capacity_mw / 1000).toFixed(1)} GW</div>
                    <div className="text-xs text-muted-foreground">
                      {((interconnectionQueue.summary.storage_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Other Technologies</span>
                  <div className="text-right">
                    <div className="font-semibold">{(interconnectionQueue.summary.other_capacity_mw / 1000).toFixed(1)} GW</div>
                    <div className="text-xs text-muted-foreground">
                      {((interconnectionQueue.summary.other_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Recent Queue Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interconnectionQueue.queue_items && interconnectionQueue.queue_items.length > 0 ? (
                <div className="space-y-4">
                  {interconnectionQueue.queue_items.slice(0, 3).map((item) => (
                    <div key={item.queue_id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.project_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.technology_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.county}, {item.state}
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {item.capacity_mw} MW
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Target: {new Date(item.interconnection_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <Badge variant={item.status === 'Under Review' ? 'default' : 'secondary'} className="text-xs">
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Queue #{item.queue_position}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground text-sm">No queue items available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generator Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Active Generators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatorData && generatorData.generators ? (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatorData.generators.map((generator) => (
                  <div key={generator.plant_id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="space-y-2">
                      <h4 className="font-medium">{generator.plant_name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Operator:</span>
                          <span>{generator.operator}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span className="font-medium">{generator.capacity_mw} MW</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Type:</span>
                          <Badge variant="outline" className="text-xs">{generator.fuel_type}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{generator.county}, {generator.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commercial Date:</span>
                          <span>{new Date(generator.commercial_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading generator data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
