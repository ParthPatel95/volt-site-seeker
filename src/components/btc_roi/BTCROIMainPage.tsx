
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BTCROILiveStatsCard } from './BTCROILiveStatsCard';
import { BTCROIMiningModeSelector } from './BTCROIMiningModeSelector';
import { BTCROIInputForm } from './BTCROIInputForm';
import { BTCROIOutputTable } from './BTCROIOutputTable';
import { BTCROIHostingOutputTable } from './BTCROIHostingOutputTable';
import { BTCROISensitivityChart } from './BTCROISensitivityChart';
import { BTCROIASICCatalog } from './BTCROIASICCatalog';
import { BTCROIProfitabilityHeatmap } from './BTCROIProfitabilityHeatmap';
import { BTCROILineChart } from './BTCROILineChart';
import { useBTCROICalculator } from './hooks/useBTCROICalculator';
import { Bitcoin, Calculator, TrendingUp, Grid3X3, Building2 } from 'lucide-react';

export const BTCROIMainPage = () => {
  const [miningMode, setMiningMode] = useState<'hosting' | 'self'>('hosting');
  const { 
    networkData, 
    formData, 
    setFormData, 
    roiResults,
    hostingResults,
    calculateMiningROI,
    calculateHostingROI,
    isLoading 
  } = useBTCROICalculator();

  const handleCalculate = () => {
    if (miningMode === 'hosting') {
      calculateHostingROI();
    } else {
      calculateMiningROI();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4 flex-wrap">
            <Bitcoin className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-500 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 break-words text-center">
              BTC Mining ROI Lab
            </h1>
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 flex-shrink-0" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm md:text-lg px-2 sm:px-4 max-w-4xl mx-auto leading-relaxed">
            Live Bitcoin mining profitability analyzer with real-time network data and hosting profitability tools
          </p>
        </div>

        {/* Live Network Stats */}
        <div className="px-1 sm:px-0">
          <BTCROILiveStatsCard networkData={networkData} />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="calculator" className="space-y-4 sm:space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-[320px] h-auto p-1">
              <TabsTrigger 
                value="calculator" 
                className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 px-1 sm:px-3 min-w-0"
              >
                {miningMode === 'hosting' ? 
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : 
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                }
                <span className="truncate">{miningMode === 'hosting' ? 'Host' : 'Mine'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sensitivity" 
                className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 px-1 sm:px-3 min-w-0"
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="catalog" 
                className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 px-1 sm:px-3 min-w-0"
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">ASICs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="heatmap" 
                className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 px-1 sm:px-3 min-w-0"
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Heat</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calculator" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                <BTCROIMiningModeSelector 
                  mode={miningMode} 
                  onModeChange={setMiningMode} 
                />
                <BTCROIInputForm
                  mode={miningMode}
                  formData={formData}
                  onFormDataChange={setFormData}
                  onCalculate={handleCalculate}
                  isLoading={isLoading}
                />
              </div>
              <div className="order-1 lg:order-2 min-w-0">
                {miningMode === 'hosting' ? (
                  <BTCROIHostingOutputTable hostingResults={hostingResults} />
                ) : (
                  <BTCROIOutputTable roiResults={roiResults} />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensitivity" className="min-w-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="order-2 xl:order-1 min-w-0">
                <BTCROISensitivityChart roiResults={roiResults} networkData={networkData} />
              </div>
              <div className="order-1 xl:order-2 min-w-0">
                <BTCROILineChart roiResults={roiResults} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="catalog" className="min-w-0">
            <BTCROIASICCatalog onSelectASIC={(asic) => {
              setFormData(prev => ({
                ...prev,
                asicModel: asic.model,
                hashrate: asic.hashrate,
                powerDraw: asic.powerDraw,
                hardwareCost: asic.price,
                totalLoadKW: miningMode === 'hosting' ? (asic.powerDraw * prev.units) / 1000 : prev.totalLoadKW
              }));
            }} />
          </TabsContent>

          <TabsContent value="heatmap" className="min-w-0">
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
