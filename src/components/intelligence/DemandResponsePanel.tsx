
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Zap, Clock, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AESODemandResponse } from '@/hooks/useAESOIntelligence';

interface DemandResponsePanelProps {
  demandResponse: AESODemandResponse | null;
  loading: boolean;
}

export function DemandResponsePanel({ demandResponse, loading }: DemandResponsePanelProps) {
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

  const programs = demandResponse?.programs || [];
  const totalCapacity = demandResponse?.total_capacity_mw || 1200;
  const availableCapacity = demandResponse?.available_capacity_mw || 950;
  const activatedCapacity = demandResponse?.activated_capacity_mw || 250;

  // Prepare chart data
  const capacityData = programs.map(program => ({
    name: program.program_name.split(' ')[0], // Shortened name
    capacity: program.capacity_mw,
    availability: program.availability_percentage,
    status: program.status
  }));

  const statusData = [
    { name: 'Available', value: availableCapacity, color: '#10b981' },
    { name: 'Activated', value: activatedCapacity, color: '#f59e0b' }
  ];

  const responseTimeData = programs.map(program => ({
    name: program.program_name.split(' ')[0],
    responseTime: program.response_time_minutes,
    activationPrice: program.activation_price
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total DR Capacity</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{(totalCapacity / 1000).toFixed(1)} GW</div>
            <p className="text-xs text-green-600">{programs.length} active programs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Available Now</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{(availableCapacity / 1000).toFixed(1)} GW</div>
            <p className="text-xs text-blue-600">{((availableCapacity/totalCapacity)*100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Currently Activated</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{(activatedCapacity / 1000).toFixed(1)} GW</div>
            <p className="text-xs text-orange-600">{programs.filter(p => p.status === 'activated').length} programs active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {(programs.reduce((sum, p) => sum + p.response_time_minutes, 0) / programs.length || 15).toFixed(0)} min
            </div>
            <p className="text-xs text-purple-600">Average across all programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity by Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              DR Capacity by Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={capacityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} MW`, 'Capacity']} />
                <Bar dataKey="capacity" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Availability Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Current DR Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${(value/1000).toFixed(1)} GW`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${(value as number/1000).toFixed(1)} GW`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Program Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Demand Response Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Program</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Capacity</th>
                  <th className="text-left p-2">Participants</th>
                  <th className="text-left p-2">Availability</th>
                  <th className="text-left p-2">Response Time</th>
                  <th className="text-left p-2">Activation Price</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{program.program_id}</td>
                    <td className="p-2">{program.program_name}</td>
                    <td className="p-2">{program.capacity_mw} MW</td>
                    <td className="p-2">{program.participant_count}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ 
                            backgroundColor: program.availability_percentage > 90 ? '#10b981' : 
                                           program.availability_percentage > 70 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                        {program.availability_percentage}%
                      </div>
                    </td>
                    <td className="p-2">{program.response_time_minutes} min</td>
                    <td className="p-2">${program.activation_price}/MWh</td>
                    <td className="p-2">
                      <Badge 
                        variant={program.status === 'available' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {program.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Market Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Peak Load Reduction</h4>
              <p className="text-2xl font-bold text-green-600">{(totalCapacity / 12000 * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Potential peak demand reduction</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Price Suppression</h4>
              <p className="text-2xl font-bold text-blue-600">$12.5/MWh</p>
              <p className="text-xs text-muted-foreground">Estimated price reduction during activation</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">System Reliability</h4>
              <p className="text-2xl font-bold text-purple-600">+2.8%</p>
              <p className="text-xs text-muted-foreground">Improvement in reserve margin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
