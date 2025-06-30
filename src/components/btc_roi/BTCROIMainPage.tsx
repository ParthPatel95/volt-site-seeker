
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BTCROILiveStatsCard } from './BTCROILiveStatsCard';
import { BTCROIMiningModeSelector } from './BTCROIMiningModeSelector';
import { BTCROIInputForm } from './BTCROIInputForm';
import { BTCROIOutputTable } from './BTCROIOutputTable';
import { BTCROIHostingOutputTable } from './BTCROIHostingOutputTable';
import { BTCROIHostingAnalytics } from './BTCROIHostingAnalytics';
import { BTCROISensitivityChart } from './BTCROISensitivityChart';
import { BTCROIASICCatalog } from './BTCROIASICCatalog';
import { BTCROIProfitabilityHeatmap } from './BTCROIProfitabilityHeatmap';
import { BTCROILineChart } from './BTCROILineChart';
import { BTCROIStoredCalculations } from './BTCROIStoredCalculations';
import { BTCROIOnboardingWizard } from './onboarding/BTCROIOnboardingWizard';
import { BTCROIAlertsSystem } from './alerts/BTCROIAlertsSystem';
import { BTCROIAdvancedAnalytics } from './analytics/BTCROIAdvancedAnalytics';
import { BTCROIReportExporter } from './reporting/BTCROIReportExporter';
import { useBTCROICalculator } from './hooks/useBTCROICalculator';
import { Bitcoin, Calculator, TrendingUp, Grid3X3, Building2, BarChart3, Zap, Bell, FileText, Sparkles, HelpCircle } from 'lucide-react';

export const BTCROIMainPage = () => {
  const [miningMode, setMiningMode] = useState<'hosting' | 'self'>('hosting');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { 
    networkData, 
    formData, 
    setFormData, 
    roiResults,
    hostingResults,
    calculateMiningROI,
    calculateHostingROI,
    saveCurrentCalculation,
    isLoading 
  } = useBTCROICalculator();

  // Check if user is new (for onboarding)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('btc-roi-onboarding-completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('btc-roi-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('btc-roi-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleCalculate = () => {
    if (miningMode === 'hosting') {
      calculateHostingROI();
    } else {
      calculateMiningROI();
    }
  };

  const handleSaveCalculation = (siteName?: string) => {
    saveCurrentCalculation(miningMode, siteName);
  };

  const currentResults = miningMode === 'hosting' ? hostingResults : roiResults;

  return (
    <>
      {/* Onboarding Wizard */}
      {showOnboarding && (
        <BTCROIOnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Header with Quick Actions */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Bitcoin className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                BTC Mining ROI Lab
              </h1>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4">
              Professional Bitcoin mining profitability calculator with real-time market data and comprehensive analytics
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Take Tour
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                What's New
              </Button>
            </div>
          </div>

          {/* Live Network Stats */}
          <BTCROILiveStatsCard networkData={networkData} />

          {/* Mining Mode Selector */}
          <div className="max-w-2xl mx-auto">
            <BTCROIMiningModeSelector 
              mode={miningMode} 
              onModeChange={setMiningMode} 
            />
          </div>

          {/* Main Calculator Section */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Input Form - Takes 2 columns */}
            <div className="xl:col-span-2">
              <BTCROIInputForm
                mode={miningMode}
                formData={formData}
                onFormDataChange={setFormData}
                onCalculate={handleCalculate}
                isLoading={isLoading}
              />
            </div>

            {/* Results - Takes 3 columns */}
            <div className="xl:col-span-3">
              {miningMode === 'hosting' ? (
                <BTCROIHostingOutputTable hostingResults={hostingResults} />
              ) : (
                <BTCROIOutputTable roiResults={roiResults} />
              )}
            </div>
          </div>

          {/* Advanced Features Tabs */}
          <Tabs defaultValue="analytics" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-4xl grid-cols-3 md:grid-cols-6 h-12">
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="alerts" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Alerts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="charts" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Charts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="catalog" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Hardware</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="scenarios" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Scenarios</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {/* Advanced Analytics */}
                  {currentResults && networkData && (
                    <BTCROIAdvancedAnalytics
                      data={{
                        btcPrice: networkData.currentPrice || 0,
                        hashRate: formData.hashrate || 0,
                        difficulty: networkData.difficulty || 0,
                        powerCost: formData.powerRate || 0,
                        profitability: miningMode === 'hosting' 
                          ? hostingResults?.profitMarginPercent || 0
                          : roiResults?.roi12Month || 0,
                        roi: miningMode === 'hosting'
                          ? hostingResults?.roi12Month || 0
                          : roiResults?.roi12Month || 0
                      }}
                    />
                  )}
                  
                  {/* Enhanced Analytics for Hosting */}
                  {miningMode === 'hosting' && hostingResults && (
                    <BTCROIHostingAnalytics hostingResults={hostingResults} />
                  )}
                  
                  {/* Stored Calculations */}
                  <BTCROIStoredCalculations
                    currentCalculationType={miningMode}
                    currentResults={currentResults}
                    onSaveCalculation={handleSaveCalculation}
                  />
                </div>
                
                <div className="space-y-6">
                  {/* Quick Summary Card */}
                  {currentResults && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Quick Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {miningMode === 'hosting' && hostingResults ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">Annual Profit:</span>
                              <span className="font-bold text-lg text-green-600">
                                ${hostingResults.netProfit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">12-Month ROI:</span>
                              <span className="font-bold text-lg text-blue-600">
                                {hostingResults.roi12Month.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                              <span className="font-bold text-lg text-purple-600">
                                {hostingResults.profitMarginPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">Payback Period:</span>
                              <span className="font-bold text-lg text-orange-600">
                                {hostingResults.paybackPeriodYears.toFixed(1)} years
                              </span>
                            </div>
                          </div>
                        ) : roiResults && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">Daily Profit:</span>
                              <span className="font-bold text-lg text-green-600">
                                ${roiResults.dailyNetProfit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">Monthly Profit:</span>
                              <span className="font-bold text-lg text-blue-600">
                                ${roiResults.monthlyNetProfit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">12-Month ROI:</span>
                              <span className="font-bold text-lg text-purple-600">
                                {roiResults.roi12Month.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                              <span className="text-sm font-medium text-gray-700">Break Even:</span>
                              <span className="font-bold text-lg text-orange-600">
                                {roiResults.breakEvenDays.toFixed(0)} days
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <BTCROIAlertsSystem
                currentBTCPrice={networkData?.currentPrice || 0}
                currentProfitability={
                  miningMode === 'hosting' 
                    ? hostingResults?.profitMarginPercent || 0
                    : roiResults?.roi12Month || 0
                }
                networkDifficulty={networkData?.difficulty || 0}
              />
            </TabsContent>

            <TabsContent value="reports">
              <BTCROIReportExporter
                calculationData={currentResults}
                networkData={networkData}
                mode={miningMode}
              />
            </TabsContent>

            <TabsContent value="charts">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Sensitivity Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BTCROISensitivityChart roiResults={roiResults} networkData={networkData} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BTCROILineChart roiResults={roiResults} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="catalog">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    ASIC Hardware Catalog
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select mining hardware and automatically populate your calculator with specifications
                  </p>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5" />
                    Profitability Scenarios
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Explore how different BTC prices and electricity costs affect your profitability
                  </p>
                </CardHeader>
                <CardContent>
                  <BTCROIProfitabilityHeatmap 
                    formData={formData} 
                    networkData={networkData}
                    mode={miningMode}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};
