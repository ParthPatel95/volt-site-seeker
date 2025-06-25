import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Home,
  Search,
  Filter,
  RefreshCw,
  Wind,
  Sun,
  Battery
} from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { useERCOTData } from '@/hooks/useERCOTData';

export const Dashboard = () => {
  const { pricing, loadData, generationMix, loading: aesoLoading } = useAESOData();
  const { pricing: ercotPricing, loading: ercotLoading } = useERCOTData();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock property data - in real app this would come from your property database
  const properties = [
    {
      id: 1,
      address: '123 Industrial Ave, Calgary, AB',
      type: 'Industrial',
      size: '50,000 sq ft',
      powerUsage: '2.5 MW',
      monthlyCost: 15000,
      efficiency: 'B+',
      renewableReady: true
    },
    {
      id: 2,
      address: '456 Commerce St, Edmonton, AB',
      type: 'Commercial',
      size: '25,000 sq ft',
      powerUsage: '1.2 MW',
      monthlyCost: 8500,
      efficiency: 'A-',
      renewableReady: false
    },
    {
      id: 3,
      address: '789 Manufacturing Blvd, Red Deer, AB',
      type: 'Manufacturing',
      size: '75,000 sq ft',
      powerUsage: '4.8 MW',
      monthlyCost: 28000,
      efficiency: 'C+',
      renewableReady: true
    }
  ];

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">VoltScout</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Properties</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Markets</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Analytics</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Power Infrastructure Intelligence</h1>
          <p className="text-gray-600">Real-time market data and property analysis for strategic investments</p>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">AESO Pool Price</CardTitle>
              <Zap className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pricing?.current_price_cents_kwh ? `${pricing.current_price_cents_kwh.toFixed(2)} ¢/kWh` : 'Loading...'}
              </div>
              <p className="text-xs text-blue-200">
                Alberta market rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">System Load</CardTitle>
              <Activity className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadData?.load?.current_mw ? `${(loadData.load.current_mw / 1000).toFixed(1)} GW` : 'Loading...'}
              </div>
              <p className="text-xs text-green-200">Current demand</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Renewables</CardTitle>
              <Wind className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generationMix?.fuel_mix?.renewable_percent || 'Loading...'}%
              </div>
              <p className="text-xs text-purple-200">Of total generation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">ERCOT Price</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ercotPricing?.current_price ? `$${ercotPricing.current_price.toFixed(2)}/MWh` : 'Loading...'}
              </div>
              <p className="text-xs text-orange-200">Texas market rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Price Trends (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Price trend chart would be displayed here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="w-5 h-5 mr-2" />
                Generation Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Natural Gas</span>
                  <span className="font-medium">{generationMix?.fuel_mix?.gas_percent || '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wind</span>
                  <span className="font-medium">{generationMix?.fuel_mix?.wind_percent || '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hydro</span>
                  <span className="font-medium">{generationMix?.fuel_mix?.hydro_percent || '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solar</span>
                  <span className="font-medium">{generationMix?.fuel_mix?.solar_percent || '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coal</span>
                  <span className="font-medium">{generationMix?.fuel_mix?.coal_percent || '0'}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    Property Portfolio
                  </CardTitle>
                  <Badge variant="secondary">{filteredProperties.length} Properties</Badge>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProperty?.id === property.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{property.address}</h3>
                            <Badge variant="outline">{property.type}</Badge>
                            {property.renewableReady && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Sun className="w-3 h-3 mr-1" />
                                Renewable Ready
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Size:</span> {property.size}
                            </div>
                            <div>
                              <span className="font-medium">Power:</span> {property.powerUsage}
                            </div>
                            <div>
                              <span className="font-medium">Monthly Cost:</span> ${property.monthlyCost.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Efficiency:</span> {property.efficiency}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${property.monthlyCost.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Details Sidebar */}
          <div className="space-y-6">
            {selectedProperty ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{selectedProperty.address}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedProperty.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium">{selectedProperty.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Power Usage:</span>
                          <span className="font-medium">{selectedProperty.powerUsage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Efficiency Rating:</span>
                          <span className="font-medium">{selectedProperty.efficiency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Renewable Ready:</span>
                          <span className={`font-medium ${selectedProperty.renewableReady ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedProperty.renewableReady ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Monthly Cost:</span>
                        <span className="font-medium">${selectedProperty.monthlyCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Cost:</span>
                        <span className="font-medium">${(selectedProperty.monthlyCost * 12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per kWh:</span>
                        <span className="font-medium">
                          {pricing?.current_price_cents_kwh ? `${pricing.current_price_cents_kwh.toFixed(2)} ¢` : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Select a property to view details</p>
                </CardContent>
              </Card>
            )}
            
            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Rate (30-day):</span>
                  <span className="font-medium">{pricing?.rates?.monthly_avg ? `${pricing.rates.monthly_avg.toFixed(2)} ¢/kWh` : 'Loading...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Peak Load Today:</span>
                  <span className="font-medium">{loadData?.load?.peak_mw ? `${(loadData.load.peak_mw / 1000).toFixed(1)} GW` : 'Loading...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Renewable %:</span>
                  <span className="font-medium">{generationMix?.fuel_mix?.renewable_percent || 'Loading...'}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Market Condition:</span>
                  <Badge variant={pricing?.market_conditions === 'high_demand' ? 'destructive' : 'default'} className="text-xs">
                    {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
