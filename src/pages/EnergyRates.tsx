
import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Calculator, TrendingUp, MapPin, Zap } from 'lucide-react';
import { EnergyRateEstimator } from '@/components/energy/EnergyRateEstimator';
import { EnergyRateIntelligence } from '@/components/energy/EnergyRateIntelligence';
import { useEnergyRates } from '@/hooks/useEnergyRates';

export default function EnergyRates() {
  const [activeTab, setActiveTab] = useState('estimator');
  const { currentRates, markets, utilities, loading } = useEnergyRates();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="w-6 h-6 mr-2" />
              Energy Rates & Intelligence
            </CardTitle>
            <p className="text-muted-foreground">
              Comprehensive energy rate analysis, estimation, and market intelligence tools.
            </p>
          </CardHeader>
        </Card>

        {/* Current Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Rate</p>
                  <p className="text-2xl font-bold">
                    ${currentRates?.current_rate?.toFixed(2) || '45.50'}/MWh
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Peak Demand</p>
                  <p className="text-2xl font-bold">
                    ${currentRates?.peak_demand_rate?.toFixed(2) || '65.30'}/MWh
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Markets</p>
                  <p className="text-2xl font-bold">{markets?.length || 4}</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilities</p>
                  <p className="text-2xl font-bold">{utilities?.length || 12}</p>
                </div>
                <Calculator className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="estimator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Rate Estimator
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estimator" className="space-y-6">
            <EnergyRateEstimator />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <EnergyRateIntelligence />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
