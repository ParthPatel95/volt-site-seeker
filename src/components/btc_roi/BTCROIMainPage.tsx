
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BTCROILiveStatsCard } from './BTCROILiveStatsCard';
import { BTCROIMiningModeSelector } from './BTCROIMiningModeSelector';
import { BTCROIInputForm } from './BTCROIInputForm';
import { BTCROIOutputTable } from './BTCROIOutputTable';
import { BTCROISensitivityChart } from './BTCROISensitivityChart';
import { BTCROIASICCatalog } from './BTCROIASICCatalog';
import { BTCROIProfitabilityHeatmap } from './BTCROIProfitabilityHeatmap';
import { BTCROILineChart } from './BTCROILineChart';
import { useBTCROICalculator } from './hooks/useBTCROICalculator';
import { Bitcoin, Calculator, TrendingUp, Grid3X3 } from 'lucide-react';

export const BTCROIMainPage = () => {
  const [miningMode, setMiningMode] = useState<'hosting' | 'self'>('hosting');
  const { 
    networkData, 
    formData, 
    setFormData, 
    roiResults, 
    calculateROI,
    isLoading 
  } = useBTCROICalculator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bitcoin className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-800">BTC Mining ROI Lab</h1>
            <Calculator className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-600 text-lg">
            Live Bitcoin mining profitability analyzer with real-time network data
          </p>
        </div>

        {/* Live Network Stats */}
        <BTCROILiveStatsCard networkData={networkData} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] mx-auto">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="sensitivity" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              ASICs
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Heatmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <BTCROIMiningModeSelector 
                  mode={miningMode} 
                  onModeChange={setMiningMode} 
                />
                <BTCROIInputForm
                  mode={miningMode}
                  formData={formData}
                  onFormDataChange={setFormData}
                  onCalculate={calculateROI}
                  isLoading={isLoading}
                />
              </div>
              <div>
                <BTCROIOutputTable roiResults={roiResults} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensitivity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BTCROISensitivityChart roiResults={roiResults} networkData={networkData} />
              <BTCROILineChart roiResults={roiResults} />
            </div>
          </TabsContent>

          <TabsContent value="catalog">
            <BTCROIASICCatalog onSelectASIC={(asic) => {
              setFormData(prev => ({
                ...prev,
                asicModel: asic.model,
                hashrate: asic.hashrate,
                powerDraw: asic.powerDraw,
                hardwareCost: asic.price
              }));
            }} />
          </TabsContent>

          <TabsContent value="heatmap">
            <BTCROIProfitabilityHeatmap 
              formData={formData} 
              networkData={networkData}
              mode={miningMode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
