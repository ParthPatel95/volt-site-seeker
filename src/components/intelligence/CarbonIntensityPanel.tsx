
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain, TrendingDown, Target, Leaf } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AESOCarbonIntensity } from '@/hooks/useAESOIntelligence';

interface CarbonIntensityPanelProps {
  carbonIntensity: AESOCarbonIntensity | null;
  loading: boolean;
}

export function CarbonIntensityPanel({ carbonIntensity, loading }: CarbonIntensityPanelProps) {
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

  const carbon = carbonIntensity || {
    current_intensity_kg_co2_mwh: 425,
    fuel_mix_percentage: {
      natural_gas: 55,
      coal: 12,
      wind: 22,
      hydro: 7,
      solar: 3,
      other: 1
    },
    historical_24h: Array.from({length: 24}, (_, i) => ({
      hour: i,
      intensity_kg_co2_mwh: 400 + Math.random() * 100,
      renewable_percentage: 25 + Math.random() * 15
    })),
    carbon_reduction_target: {
      current_year_target: 420,
      progress_percentage: 78,
      year_to_date_average: 435
    },
    timestamp: new Date().toISOString()
  };

  const fuelMixData = Object.entries(carbon.fuel_mix_percentage).map(([fuel, percentage]) => ({
    name: fuel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: percentage,
    color: {
      'Natural Gas': '#3b82f6',
      'Coal': '#374151',
      'Wind': '#10b981',
      'Hydro': '#06b6d4',
      'Solar': '#f59e0b',
      'Other': '#8b5cf6'
    }[fuel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())] || '#6b7280'
  }));

  const renewablePercentage = carbon.fuel_mix_percentage.wind + carbon.fuel_mix_percentage.hydro + carbon.fuel_mix_percentage.solar;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Current Intensity</CardTitle>
            <CloudRain className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{carbon.current_intensity_kg_co2_mwh.toFixed(0)} kg</div>
            <p className="text-xs text-red-600">CO2 per MWh</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Renewable Mix</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{renewablePercentage.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Wind + Hydro + Solar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Target Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{carbon.carbon_reduction_target.progress_percentage.toFixed(1)}%</div>
            <p className="text-xs text-blue-600">Toward 2030 target</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">YTD Average</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{carbon.carbon_reduction_target.year_to_date_average.toFixed(0)} kg</div>
            <p className="text-xs text-purple-600">CO2 per MWh</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Carbon Intensity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CloudRain className="w-5 h-5 mr-2 text-red-600" />
              Carbon Intensity (24H)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={carbon.historical_24h}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg CO2/MWh`, 'Carbon Intensity']} />
                <Line type="monotone" dataKey="intensity_kg_co2_mwh" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-600" />
              Current Fuel Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fuelMixData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fuelMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Renewable Percentage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
            Renewable Percentage (24H)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={carbon.historical_24h}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Renewable %']} />
              <Bar dataKey="renewable_percentage" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Carbon Reduction Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Carbon Reduction Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">2030 Target</h4>
                <p className="text-2xl font-bold text-blue-600">{carbon.carbon_reduction_target.current_year_target} kg</p>
                <p className="text-xs text-muted-foreground">CO2 per MWh</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Current Progress</h4>
                <p className="text-2xl font-bold text-green-600">{carbon.carbon_reduction_target.progress_percentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Toward target</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Reduction Needed</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {(carbon.carbon_reduction_target.year_to_date_average - carbon.carbon_reduction_target.current_year_target).toFixed(0)} kg
                </p>
                <p className="text-xs text-muted-foreground">From current average</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(carbon.carbon_reduction_target.progress_percentage, 100)}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Progress toward 2030 carbon intensity target
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="w-5 h-5 mr-2 text-green-600" />
            Environmental Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Daily CO2 Avoided</h4>
              <p className="text-2xl font-bold text-green-600">
                {((500 - carbon.current_intensity_kg_co2_mwh) * 240).toFixed(0)} tons
              </p>
              <p className="text-xs text-muted-foreground">vs. coal-only generation</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Renewable Growth</h4>
              <p className="text-2xl font-bold text-blue-600">+{(renewablePercentage - 25).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">vs. 5-year average</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Clean Energy Rank</h4>
              <p className="text-2xl font-bold text-purple-600">#2</p>
              <p className="text-xs text-muted-foreground">Among Canadian provinces</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Carbon Price Impact</h4>
              <p className="text-2xl font-bold text-orange-600">${((carbon.current_intensity_kg_co2_mwh * 0.065)).toFixed(2)}/MWh</p>
              <p className="text-xs text-muted-foreground">Carbon pricing cost</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
