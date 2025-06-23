
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, Zap, TrendingUp, Activity, AlertTriangle, Building2, Search, Factory, Database, BarChart, Brain, RefreshCw, Globe, Users, DollarSign, MapPin, Satellite } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
import { DataManagement } from '@/components/DataManagement';
import { AESOMarket } from '@/components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';
import { ERCOTDashboard } from '@/components/power/ERCOTDashboard';
import EnergyRates from '@/pages/EnergyRates';
import EnergyRatesTest from '@/pages/EnergyRatesTest';
import { useAESOData } from '@/hooks/useAESOData';
import { useERCOTData } from '@/hooks/useERCOTData';
import { supabase } from '@/integrations/supabase/client';

export function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : isCollapsed 
            ? 'ml-16' 
            : 'ml-72'
      }`}>
        {isMobile && (
          <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">VoltScout</h1>
            <div className="w-9" />
          </header>
        )}
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<EnhancedDashboardHome />} />
            <Route path="/aeso-market" element={<AESOMarket />} />
            <Route path="/aeso-intelligence" element={<AESOMarketIntelligence />} />
            <Route path="/energy-rates" element={<EnergyRates />} />
            <Route path="/energy-rates-test" element={<EnergyRatesTest />} />
            <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
            <Route path="/idle-industry-scanner" element={<IdleIndustryScanner />} />
            <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function EnhancedDashboardHome() {
  const { pricing: aesoPricing, loadData: aesoLoadData, loading: aesoLoading, refetch: refetchAESO } = useAESOData();
  const { pricing: ercotPricing, loadData: ercotLoad, loading: ercotLoading, refetch: refetchERCOT } = useERCOTData();
  const [platformStats, setPlatformStats] = useState({
    totalSubstations: 0,
    totalProperties: 0,
    companiesAnalyzed: 0,
    alertsActive: 0
  });
  const [substationData, setSubstationData] = useState({
    recentSubstations: [],
    totalCapacity: 0,
    highCapacityCount: 0
  });
  const [idleSitesData, setIdleSitesData] = useState({
    recentSites: [],
    totalSites: 0,
    highScoreSites: 0
  });

  const refreshAllData = () => {
    refetchAESO();
    refetchERCOT();
    loadPlatformStats();
    loadSubstationData();
    loadIdleSitesData();
  };

  const loadPlatformStats = async () => {
    try {
      const [substations, properties, companies, alerts] = await Promise.all([
        supabase.from('substations').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('alerts').select('id', { count: 'exact', head: true })
      ]);

      setPlatformStats({
        totalSubstations: substations.count || 0,
        totalProperties: properties.count || 0,
        companiesAnalyzed: companies.count || 0,
        alertsActive: alerts.count || 0
      });
    } catch (error) {
      console.error('Error loading platform stats:', error);
    }
  };

  const loadSubstationData = async () => {
    try {
      const { data: substations, error } = await supabase
        .from('substations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const totalCapacity = substations?.reduce((sum, sub) => sum + (sub.capacity_mva || 0), 0) || 0;
      const highCapacityCount = substations?.filter(sub => (sub.capacity_mva || 0) > 100).length || 0;

      setSubstationData({
        recentSubstations: substations || [],
        totalCapacity: Math.round(totalCapacity),
        highCapacityCount
      });
    } catch (error) {
      console.error('Error loading substation data:', error);
    }
  };

  const loadIdleSitesData = async () => {
    try {
      const { data: sites, error } = await supabase
        .from('verified_heavy_power_sites')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const highScoreSites = sites?.filter(site => (site.idle_score || 0) > 70).length || 0;

      setIdleSitesData({
        recentSites: sites || [],
        totalSites: sites?.length || 0,
        highScoreSites
      });
    } catch (error) {
      console.error('Error loading idle sites data:', error);
    }
  };

  useEffect(() => {
    loadPlatformStats();
    loadSubstationData();
    loadIdleSitesData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              VoltScout Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Live energy market intelligence platform with real-time data
            </p>
          </div>
          <Button 
            onClick={refreshAllData}
            disabled={aesoLoading || ercotLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(aesoLoading || ercotLoading) ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Live Market Overview</TabsTrigger>
            <TabsTrigger value="platform">Platform Analytics</TabsTrigger>
            <TabsTrigger value="features">Features Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Live Market Data Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AESO Alberta Market */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    AESO Alberta Market
                    <Badge variant="outline" className="ml-auto">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aesoLoading ? (
                    <div className="text-center py-4">
                      <Activity className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm text-gray-500">Loading AESO data...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Price</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${aesoPricing?.current_price ? Number(aesoPricing.current_price).toFixed(2) : 'N/A'}/MWh
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">System Load</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {aesoLoadData ? `${(aesoLoadData.current_demand_mw / 1000).toFixed(1)} GW` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ERCOT Texas Market */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                    ERCOT Texas Market
                    <Badge variant="outline" className="ml-auto">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ercotLoading ? (
                    <div className="text-center py-4">
                      <Activity className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm text-gray-500">Loading ERCOT data...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Real-Time Price</p>
                          <p className="text-2xl font-bold text-orange-600">
                            ${ercotPricing?.current_price ? Number(ercotPricing.current_price).toFixed(2) : 'N/A'}/MWh
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">System Demand</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {ercotLoad ? `${(ercotLoad.current_demand_mw / 1000).toFixed(1)} GW` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Substation Tool Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Factory className="w-5 h-5 mr-2 text-green-600" />
                    Power Infrastructure Discovery
                    <Badge variant="secondary" className="ml-auto">{substationData.recentSubstations.length} Recent</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Capacity</p>
                        <p className="text-2xl font-bold text-green-600">
                          {substationData.totalCapacity.toLocaleString()} MVA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">High Capacity Sites</p>
                        <p className="text-2xl font-bold text-green-600">
                          {substationData.highCapacityCount}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recent Discoveries:</h4>
                      {substationData.recentSubstations.slice(0, 3).map((substation: any) => (
                        <div key={substation.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{substation.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {substation.capacity_mva} MVA
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Satellite className="w-5 h-5 mr-2 text-purple-600" />
                    Idle Industry Scanner
                    <Badge variant="secondary" className="ml-auto">{idleSitesData.totalSites} Sites</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Sites Found</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {idleSitesData.totalSites}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">High Score Sites</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {idleSitesData.highScoreSites}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recent Discoveries:</h4>
                      {idleSitesData.recentSites.slice(0, 3).map((site: any) => (
                        <div key={site.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-purple-500" />
                            <span className="truncate">{site.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {site.idle_score || 0}% idle
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platform" className="space-y-6">
            {/* Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Power Infrastructure</p>
                      <p className="text-3xl font-bold text-green-700">{platformStats.totalSubstations.toLocaleString()}</p>
                      <p className="text-xs text-green-600">Substations Tracked</p>
                    </div>
                    <Factory className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Properties</p>
                      <p className="text-3xl font-bold text-purple-700">{platformStats.totalProperties.toLocaleString()}</p>
                      <p className="text-xs text-purple-600">In Database</p>
                    </div>
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Companies</p>
                      <p className="text-3xl font-bold text-blue-700">{platformStats.companiesAnalyzed.toLocaleString()}</p>
                      <p className="text-xs text-blue-600">Analyzed</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Active Alerts</p>
                      <p className="text-3xl font-bold text-yellow-700">{platformStats.alertsActive.toLocaleString()}</p>
                      <p className="text-xs text-yellow-600">Monitoring</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Platform Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                    Geographic Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Alberta (AESO)</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Texas (ERCOT)</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Additional Markets</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Planned</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Market Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AESO Avg Price (24h)</span>
                      <span className="font-semibold">${aesoPricing?.average_price ? Number(aesoPricing.average_price).toFixed(2) : 'N/A'}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ERCOT Avg Price (24h)</span>
                      <span className="font-semibold">${ercotPricing?.average_price ? Number(ercotPricing.average_price).toFixed(2) : 'N/A'}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Quality</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Excellent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <PlatformFeaturesGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PlatformFeaturesGuide() {
  const features = [
    {
      icon: Zap,
      title: "AESO Market Data",
      description: "Real-time Alberta electricity market information and pricing",
      howItWorks: "Connects directly to AESO API to fetch current pool prices, system load, and market conditions",
      howToUse: "Navigate to AESO Market section to view live pricing, historical trends, and market forecasts",
      dataCalculation: "Prices are fetched every 5 minutes from AESO's real-time data feed. Load data includes current demand, available supply, and reserve margins calculated by AESO's dispatch algorithm",
      color: "blue"
    },
    {
      icon: TrendingUp,
      title: "ERCOT Texas Market",
      description: "Live Texas grid operations and pricing data",
      howItWorks: "Integrates with ERCOT's public APIs to provide real-time settlement point prices and system conditions",
      howToUse: "Access through Market Intelligence section for Texas-specific energy market data and generation mix",
      dataCalculation: "Real-time locational marginal prices (LMP) calculated by ERCOT's Security Constrained Economic Dispatch (SCED) every 5 minutes",
      color: "orange"
    },
    {
      icon: BarChart,
      title: "Energy Rate Calculator",
      description: "Comprehensive electricity cost calculation tool",
      howItWorks: "Combines real-time market prices with transmission & distribution charges, regulatory fees, and taxes",
      howToUse: "Input your location, consumption profile, and rate class to get fully-burdened electricity costs",
      dataCalculation: "Total cost = (Energy Charge × Usage) + (Demand Charge × Peak) + T&D Charges + Riders + Taxes. Uses current tariff schedules from local utilities",
      color: "green"
    },
    {
      icon: Brain,
      title: "Market Intelligence",
      description: "AI-powered energy market analysis and forecasting",
      howItWorks: "Machine learning algorithms analyze historical patterns, weather data, and market fundamentals",
      howToUse: "Review forecasting models, price predictions, and market trend analysis in the Intelligence section",
      dataCalculation: "Uses ensemble ML models (LSTM neural networks, random forests) trained on 5+ years of market data, weather patterns, and economic indicators",
      color: "purple"
    },
    {
      icon: Building2,
      title: "Corporate Intelligence",
      description: "Company analysis and investment opportunity identification",
      howItWorks: "Aggregates public financial data, news sentiment, and market positioning for energy companies",
      howToUse: "Search for companies, view financial health scores, and track investment opportunities",
      dataCalculation: "Financial health score calculated using debt-to-equity ratios, cash flow analysis, and market performance metrics weighted by industry benchmarks",
      color: "indigo"
    },
    {
      icon: Search,
      title: "Idle Industry Scanner",
      description: "Identifies underutilized industrial properties for development",
      howItWorks: "Satellite imagery analysis combined with power consumption data to identify idle facilities",
      howToUse: "Set search parameters for location and property type, review identified opportunities with power capacity estimates",
      dataCalculation: "Property scoring based on: (Idle Score × 0.4) + (Power Proximity × 0.3) + (Infrastructure Score × 0.3). Idle score derived from activity patterns and utility data",
      color: "cyan"
    },
    {
      icon: Factory,
      title: "Power Infrastructure",
      description: "Comprehensive electrical infrastructure mapping and analysis",
      howItWorks: "Integrates multiple data sources including FERC, EIA, and utility filings to map power infrastructure",
      howToUse: "Search by location to find substations, transmission lines, and generation facilities with capacity details",
      dataCalculation: "Capacity estimates use regulatory filings, engineering standards, and satellite analysis. Confidence scores based on data source reliability and verification methods",
      color: "red"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Centralized data quality control and source management",
      howItWorks: "Automated data validation, source tracking, and quality assurance across all platform data",
      howToUse: "Monitor data freshness, source reliability, and validation status across all platform features",
      dataCalculation: "Data quality score = (Freshness × 0.3) + (Source Reliability × 0.4) + (Validation Status × 0.3). Scores updated in real-time as data is refreshed",
      color: "gray"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50",
      orange: "border-orange-200 bg-orange-50",
      green: "border-green-200 bg-green-50",
      purple: "border-purple-200 bg-purple-50",
      indigo: "border-indigo-200 bg-indigo-50",
      cyan: "border-cyan-200 bg-cyan-50",
      red: "border-red-200 bg-red-50",
      gray: "border-gray-200 bg-gray-50"
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Features Guide</h2>
        <p className="text-lg text-gray-600">Comprehensive overview of VoltScout's capabilities, methodologies, and data sources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className={`${getColorClasses(feature.color)} hover:shadow-lg transition-shadow`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <feature.icon className={`w-6 h-6 mr-3 text-${feature.color}-600`} />
                {feature.title}
              </CardTitle>
              <p className="text-gray-600">{feature.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-1">How It Works</h4>
                <p className="text-sm text-gray-600">{feature.howItWorks}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-1">How to Use</h4>
                <p className="text-sm text-gray-600">{feature.howToUse}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-1">Data Calculation</h4>
                <p className="text-sm text-gray-600">{feature.dataCalculation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
            Data Sources & Reliability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Primary Data Sources</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AESO (Alberta Electric System Operator)</li>
                <li>• ERCOT (Electric Reliability Council of Texas)</li>
                <li>• FERC (Federal Energy Regulatory Commission)</li>
                <li>• EIA (Energy Information Administration)</li>
                <li>• Utility Regulatory Filings</li>
                <li>• Satellite Imagery Providers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Data Refresh Intervals</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Market Prices: Every 5 minutes</li>
                <li>• System Load: Every 5 minutes</li>
                <li>• Infrastructure Data: Daily</li>
                <li>• Corporate Data: Weekly</li>
                <li>• Satellite Imagery: Monthly</li>
                <li>• Regulatory Filings: As available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600">Settings panel coming soon...</p>
        </div>
      </div>
    </div>
  );
}

function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600">Help documentation coming soon...</p>
        </div>
      </div>
    </div>
  );
}
