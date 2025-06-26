
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Bitcoin className="w-6 h-6 sm:w-10 sm:h-10 text-orange-500" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">BTC Mining ROI Lab</h1>
            <Calculator className="w-5 h-5 sm:w-8 sm:h-8 text-orange-500" />
          </div>
          <p className="text-gray-600 text-sm sm:text-lg px-4">
            Live Bitcoin mining profitability analyzer with real-time network data
          </p>
        </div>

        {/* Live Network Stats */}
        <BTCROILiveStatsCard networkData={networkData} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="calculator" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[500px] mx-auto h-auto p-1">
            <TabsTrigger value="calculator" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Calculator</span>
              <span className="sm:hidden">Calc</span>
            </TabsTrigger>
            <TabsTrigger value="sensitivity" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Analysis</span>
              <span className="sm:hidden">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>ASICs</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Heatmap</span>
              <span className="sm:hidden">Heat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
