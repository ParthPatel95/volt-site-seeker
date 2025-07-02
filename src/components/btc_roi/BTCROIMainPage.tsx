
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  Bitcoin, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Bell, 
  FileText, 
  Grid3X3, 
  HelpCircle,
  DollarSign,
  Activity,
  Target,
  Sparkles
} from 'lucide-react';

export const BTCROIMainPage = () => {
  const [miningMode, setMiningMode] = useState<'hosting' | 'self'>('hosting');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Modern Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Bitcoin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent break-words">
                BTC Mining ROI Lab
              </h1>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
              Professional Bitcoin mining profitability calculator with real-time data and advanced analytics
            </p>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tutorial</span>
                <span className="sm:hidden">Help</span>
              </Button>
              <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>

          {/* Live Network Stats */}
          <BTCROILiveStatsCard networkData={networkData} />

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar - Controls */}
            <div className="xl:col-span-1 space-y-4 sm:space-y-6">
              {/* Mining Mode Selector */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 break-words">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <span>Analysis Mode</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BTCROIMiningModeSelector 
                    mode={miningMode} 
                    onModeChange={setMiningMode} 
                  />
                </CardContent>
              </Card>

              {/* Input Form */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 break-words">
                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span>Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BTCROIInputForm
                    mode={miningMode}
                    formData={formData}
                    onFormDataChange={setFormData}
                    onCalculate={handleCalculate}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>

              {/* Quick Results */}
              {currentResults && (
                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-green-800 break-words">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>Quick Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {miningMode === 'hosting' && hostingResults ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">Annual Profit:</span>
                          <span className="font-bold text-sm sm:text-lg text-green-600 ml-2 break-words">
                            ${hostingResults.netProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">12-Month ROI:</span>
                          <span className="font-bold text-sm sm:text-lg text-blue-600 ml-2 break-words">
                            {hostingResults.roi12Month.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">Profit Margin:</span>
                          <span className="font-bold text-sm sm:text-lg text-purple-600 ml-2 break-words">
                            {hostingResults.profitMarginPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ) : roiResults && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">Daily Profit:</span>
                          <span className="font-bold text-sm sm:text-lg text-green-600 ml-2 break-words">
                            ${roiResults.dailyNetProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">Monthly Profit:</span>
                          <span className="font-bold text-sm sm:text-lg text-blue-600 ml-2 break-words">
                            ${roiResults.monthlyNetProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">12-Month ROI:</span>
                          <span className="font-bold text-sm sm:text-lg text-purple-600 ml-2 break-words">
                            {roiResults.roi12Month.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <div className="flex justify-center overflow-x-auto">
                  <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-4xl h-auto sm:h-12 gap-1 p-1">
                    <TabsTrigger 
                      value="calculator" 
                      className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                      <Calculator className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Results</span>
                      <span className="sm:hidden">Calc</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="analytics" 
                      className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Analytics</span>
                      <span className="sm:hidden">Chart</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="scenarios" 
                      className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                      <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Scenarios</span>
                      <span className="sm:hidden">Scene</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="hardware" 
                      className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Hardware</span>
                      <span className="sm:hidden">HW</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="alerts" 
                      className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Alerts</span>
                      <span className="sm:hidden">Alert</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reports" 
                      className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Reports</span>
                      <span className="sm:hidden">Report</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="calculator" className="space-y-4 sm:space-y-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                        <span>
                          {miningMode === 'hosting' ? 'Hosting Business Analysis' : 'Mining Profitability Analysis'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      {miningMode === 'hosting' ? (
                        <BTCROIHostingOutputTable hostingResults={hostingResults} />
                      ) : (
                        <BTCROIOutputTable roiResults={roiResults} />
                      )}
                    </CardContent>
                  </Card>

                  {/* Enhanced Analytics for Hosting */}
                  {miningMode === 'hosting' && hostingResults && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span>Hosting Analytics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROIHostingAnalytics hostingResults={hostingResults} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Stored Calculations */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                        <span>Saved Calculations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BTCROIStoredCalculations
                        currentCalculationType={miningMode}
                        currentResults={currentResults}
                        onSaveCalculation={handleSaveCalculation}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span>Sensitivity Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROISensitivityChart roiResults={roiResults} networkData={networkData} />
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          <span>Performance Trends</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROILineChart roiResults={roiResults} />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Advanced Analytics */}
                  {currentResults && networkData && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                          <span>Advanced Analytics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROIAdvancedAnalytics
                          data={{
                            btcPrice: networkData.price || 0,
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
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="scenarios">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                        <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                        <span>Profitability Scenarios</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
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

                <TabsContent value="hardware">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                        <span>ASIC Hardware Catalog</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Select mining hardware and automatically populate your calculator
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

                <TabsContent value="alerts">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                        <span>Smart Alerts System</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Set up intelligent alerts for price changes, profitability thresholds, and market conditions
                      </p>
                    </CardHeader>
                    <CardContent>
                      <BTCROIAlertsSystem
                        currentBTCPrice={networkData?.price || 0}
                        currentProfitability={
                          miningMode === 'hosting' 
                            ? hostingResults?.profitMarginPercent || 0
                            : roiResults?.roi12Month || 0
                        }
                        networkDifficulty={networkData?.difficulty || 0}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                        <span>Professional Reports</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Generate professional reports for investors, stakeholders, and tax purposes
                      </p>
                    </CardHeader>
                    <CardContent>
                      <BTCROIReportExporter
                        calculationData={currentResults}
                        networkData={networkData}
                        mode={miningMode}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
