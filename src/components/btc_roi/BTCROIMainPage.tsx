import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BTCROILiveStatsCard } from './BTCROILiveStatsCard';
import { BTCROIMiningModeSelector } from './BTCROIMiningModeSelector';
import { BTCROIConfigCard } from './BTCROIConfigCard';
import { BTCROIInputModal } from './BTCROIInputModal';
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
  const [showConfigModal, setShowConfigModal] = useState(false);
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

  // Check if configuration has been set up
  const hasConfiguration = () => {
    if (miningMode === 'hosting') {
      return formData.totalLoadKW > 0 && formData.hostingFeeRate > 0;
    } else {
      return formData.hashrate > 0 && formData.powerDraw > 0 && formData.powerRate > 0;
    }
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

      {/* Configuration Modal */}
      <BTCROIInputModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        mode={miningMode}
        formData={formData}
        onFormDataChange={setFormData}
        onCalculate={handleCalculate}
        isLoading={isLoading}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg flex-shrink-0">
                  <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-watt-primary text-center sm:text-left">
                  BTC Mining ROI Lab
                </h1>
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg flex-shrink-0">
                  <Calculator className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto mb-3 sm:mb-4 lg:mb-6 px-2">
              Professional Bitcoin mining profitability calculator with real-time data and advanced analytics
            </p>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1 sm:gap-2 text-xs"
              >
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Help</span>
              </Button>
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
                Live Data
              </Badge>
            </div>
          </div>

          {/* Live Network Stats */}
          <BTCROILiveStatsCard networkData={networkData} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar - Controls */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Mining Mode Selector */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Analysis Mode</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <BTCROIMiningModeSelector 
                    mode={miningMode} 
                    onModeChange={setMiningMode} 
                  />
                </CardContent>
              </Card>

              {/* Configuration Card */}
              <BTCROIConfigCard
                mode={miningMode}
                onOpenConfig={() => setShowConfigModal(true)}
                hasConfiguration={hasConfiguration()}
              />

              {/* Quick Results */}
              {currentResults && (
                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2 text-green-800">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">Quick Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {miningMode === 'hosting' && hostingResults ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Annual Profit:</span>
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-green-600 ml-2 flex-shrink-0">
                            ${hostingResults.netProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">12-Month ROI:</span>
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-blue-600 ml-2 flex-shrink-0">
                            {hostingResults.roi12Month.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Profit Margin:</span>
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-purple-600 ml-2 flex-shrink-0">
                            {hostingResults.profitMarginPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ) : roiResults && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Daily Profit:</span>
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-green-600 ml-2 flex-shrink-0">
                            ${roiResults.dailyNetProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Monthly Profit:</span>
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-blue-600 ml-2 flex-shrink-0">
                            ${roiResults.monthlyNetProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border border-green-200 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">12-Month ROI:</span>
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-purple-600 ml-2 flex-shrink-0">
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
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <div className="w-full overflow-x-auto">
                  <TabsList className="grid grid-cols-6 w-full min-w-max sm:min-w-0 h-auto gap-1 p-1">
                    <TabsTrigger 
                      value="calculator" 
                      className="flex flex-col sm:flex-row items-center gap-1 font-medium text-xs px-2 py-2 min-w-0"
                    >
                      <Calculator className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Results</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="analytics" 
                      className="flex flex-col sm:flex-row items-center gap-1 font-medium text-xs px-2 py-2 min-w-0"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="scenarios" 
                      className="flex flex-col sm:flex-row items-center gap-1 font-medium text-xs px-2 py-2 min-w-0"
                    >
                      <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Scenarios</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="hardware" 
                      className="flex flex-col sm:flex-row items-center gap-1 font-medium text-xs px-2 py-2 min-w-0"
                    >
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Hardware</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="alerts" 
                      className="flex flex-col sm:flex-row items-center gap-1 font-medium text-xs px-2 py-2 min-w-0"
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Alerts</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reports" 
                      className="flex flex-col sm:flex-row items-center gap-1 font-medium text-xs px-2 py-2 min-w-0"
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Reports</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="calculator" className="space-y-4 sm:space-y-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                        <span className="truncate">
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
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span className="truncate">Hosting Analytics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROIHostingAnalytics hostingResults={hostingResults} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Stored Calculations */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                        <span className="truncate">Saved Calculations</span>
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
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span className="truncate">Sensitivity Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROISensitivityChart 
                          roiResults={miningMode === 'self' ? roiResults : null} 
                          networkData={networkData} 
                        />
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          <span className="truncate">Performance Trends</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BTCROILineChart roiResults={miningMode === 'self' ? roiResults : null} />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Advanced Analytics */}
                  {currentResults && networkData && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                          <span className="truncate">Advanced Analytics</span>
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
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                        <span className="truncate">Profitability Scenarios</span>
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
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                        <span className="truncate">ASIC Hardware Catalog</span>
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
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                        <span className="truncate">Smart Alerts System</span>
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
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                        <span className="truncate">Professional Reports</span>
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
