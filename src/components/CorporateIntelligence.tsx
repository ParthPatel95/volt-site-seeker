
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  TrendingUp, 
  AlertTriangle,
  Briefcase,
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  Globe,
  Leaf,
  Timer,
  Settings,
  Plus
} from 'lucide-react';
import { CompanyAnalysisForm } from './corporateIntelligence/CompanyAnalysisForm';
import { CompanyCard } from './corporateIntelligence/CompanyCard';
import { CompanyFilters } from './corporateIntelligence/CompanyFilters';
import { CompanyDetailsModal } from './corporateIntelligence/CompanyDetailsModal';
import { DistressAlertsPanel } from './corporateIntelligence/DistressAlertsPanel';
import { IndustryIntelligencePanel } from './corporateIntelligence/IndustryIntelligencePanel';
import { LinkedInIntelligencePanel } from './corporateIntelligence/LinkedInIntelligencePanel';
import { AICompanyAnalyzer } from './corporateIntelligence/AICompanyAnalyzer';
import { AIAnalysisDisplay } from './corporateIntelligence/AIAnalysisDisplay';
import { NewsIntelligencePanel } from './corporateIntelligence/NewsIntelligencePanel';
import { PowerForecastingPanel } from './corporateIntelligence/PowerForecastingPanel';
import { CompetitorAnalysisPanel } from './corporateIntelligence/CompetitorAnalysisPanel';
import { InvestmentScoringPanel } from './corporateIntelligence/InvestmentScoringPanel';
import { PortfolioOptimizerPanel } from './corporateIntelligence/PortfolioOptimizerPanel';
import { DueDiligencePanel } from './corporateIntelligence/DueDiligencePanel';
import { SocialSentimentPanel } from './corporateIntelligence/SocialSentimentPanel';
import { SupplyChainPanel } from './corporateIntelligence/SupplyChainPanel';
import { ESGAnalysisPanel } from './corporateIntelligence/ESGAnalysisPanel';
import { NaturalLanguageQueryPanel } from './corporateIntelligence/NaturalLanguageQueryPanel';
import { AlertConfigurationPanel } from './corporateIntelligence/AlertConfigurationPanel';
import { MarketTimingPanel } from './corporateIntelligence/MarketTimingPanel';
import { Company, LoadingStates, DistressAlert } from '@/types/corporateIntelligence';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Filters {
  industry?: string;
  sector?: string;
  minHealthScore?: number;
  distressSignal?: string;
}

export function CorporateIntelligence() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    analyzing: false,
    scanning: false,
    detecting: false,
    monitoring: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [distressAlerts, setDistressAlerts] = useState<DistressAlert[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, [searchTerm, industryFilter]);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (industryFilter && industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading companies:', error);
        setError('Failed to load companies. Please try again.');
        toast({
          title: "Error Loading Companies",
          description: "Failed to load company data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setCompanies(data || []);
    } catch (err: any) {
      console.error('Error in loadCompanies:', err);
      setError('An unexpected error occurred while loading companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (companyName: string) => {
    if (!companyName?.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze",
        variant: "destructive"
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, analyzing: true }));

    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'analyze_company', company_name: companyName.trim() },
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analysis Error",
          description: error.message || "Failed to analyze company",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${companyName}`,
        });
        loadCompanies();
      } else {
        toast({
          title: "Analysis Warning",
          description: data?.message || "Analysis completed with warnings",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error('Error in handleAnalyze:', err);
      toast({
        title: "Analysis Error",
        description: "An unexpected error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, analyzing: false }));
    }
  };

  const handleAIAnalysisComplete = (analysis: any) => {
    setAiAnalysis(analysis);
    loadCompanies();
  };

  const handleInvestigateAlert = (alert: DistressAlert) => {
    console.log('Investigating alert:', alert);
    toast({
      title: "Alert Investigation",
      description: `Investigating alert for ${alert.company_name}`,
    });
  };

  const quickActions = [
    { 
      title: "Analyze Company", 
      description: "AI-powered company analysis",
      icon: Building2, 
      action: "ai-analysis",
      color: "bg-blue-500"
    },
    { 
      title: "News Intelligence", 
      description: "Latest news and market insights",
      icon: FileText, 
      action: "news-intel",
      color: "bg-green-500"
    },
    { 
      title: "Portfolio Optimizer", 
      description: "Optimize investment portfolios",
      icon: Briefcase, 
      action: "portfolio",
      color: "bg-purple-500"
    },
    { 
      title: "Natural Language Query", 
      description: "Ask questions about your data",
      icon: MessageSquare, 
      action: "nlp-query",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container-responsive padding-responsive space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            Corporate Intelligence Hub
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4">
            AI-powered insights for corporate analysis, investment decisions, and market intelligence
          </p>
          
          {/* Quick Search */}
          <div className="max-w-sm sm:max-w-md mx-auto px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Quick search companies, news, or insights..."
                value={quickSearchTerm}
                onChange={(e) => setQuickSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Card key={action.action} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">{action.title}</CardTitle>
                    <CardDescription className="text-xs hidden sm:block">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mx-4 sm:mx-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="font-medium text-red-800 dark:text-red-200 text-sm">Error</span>
              </div>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm min-w-max sm:min-w-0">
              <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Analysis</span>
                <span className="sm:hidden">Analyze</span>
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Intelligence</span>
                <span className="sm:hidden">Intel</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Building2 className="w-5 h-5" />
                    Recent Company Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {loading ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground text-sm">Loading companies...</p>
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">No Companies Analyzed</h3>
                      <p className="text-sm text-slate-500 mb-3 sm:mb-4">Start by analyzing a company to see insights here</p>
                      <Button className="text-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Analyze Company
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {companies.slice(0, 3).map((company) => (
                        <div key={company.id} className="p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm sm:text-base truncate">{company.name}</h4>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{company.industry}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                Health: {company.financial_health_score || 'N/A'}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => setSelectedCompany(company)} className="text-xs">
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <AlertTriangle className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
                  <Button className="w-full justify-start text-sm" variant="outline">
                    <Building2 className="w-4 h-4 mr-2" />
                    Analyze New Company
                  </Button>
                  <Button className="w-full justify-start text-sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button className="w-full justify-start text-sm" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start text-sm" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className="xl:col-span-3 space-y-4 sm:space-y-6">
                <AICompanyAnalyzer onAnalysisComplete={handleAIAnalysisComplete} />
                {aiAnalysis && <AIAnalysisDisplay analysis={aiAnalysis} />}
              </div>
              <div className="space-y-4 sm:space-y-6">
                <CompanyAnalysisForm onAnalyze={handleAnalyze} loading={loadingStates.analyzing} />
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-sm">Company Database</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <CompanyFilters
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      industryFilter={industryFilter}
                      onIndustryChange={setIndustryFilter}
                      disabled={loading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {companies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onViewDetails={() => setSelectedCompany(company)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-4 sm:space-y-6">
            <Tabs defaultValue="news" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-max sm:min-w-0">
                  <TabsTrigger value="news" className="text-xs sm:text-sm">News Intel</TabsTrigger>
                  <TabsTrigger value="power" className="text-xs sm:text-sm">Power Forecast</TabsTrigger>
                  <TabsTrigger value="competitors" className="text-xs sm:text-sm">Competitors</TabsTrigger>
                  <TabsTrigger value="social" className="text-xs sm:text-sm">Social</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="news">
                <NewsIntelligencePanel />
              </TabsContent>
              <TabsContent value="power">
                <PowerForecastingPanel />
              </TabsContent>
              <TabsContent value="competitors">
                <CompetitorAnalysisPanel />
              </TabsContent>
              <TabsContent value="social">
                <SocialSentimentPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4 sm:space-y-6">
            <Tabs defaultValue="optimizer" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-max sm:min-w-0">
                  <TabsTrigger value="optimizer" className="text-xs sm:text-sm">Portfolio Optimizer</TabsTrigger>
                  <TabsTrigger value="investment" className="text-xs sm:text-sm">Investment Scoring</TabsTrigger>
                  <TabsTrigger value="due-diligence" className="text-xs sm:text-sm">Due Diligence</TabsTrigger>
                  <TabsTrigger value="market-timing" className="text-xs sm:text-sm">Market Timing</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="optimizer">
                <PortfolioOptimizerPanel />
              </TabsContent>
              <TabsContent value="investment">
                <InvestmentScoringPanel />
              </TabsContent>
              <TabsContent value="due-diligence">
                <DueDiligencePanel />
              </TabsContent>
              <TabsContent value="market-timing">
                <MarketTimingPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 sm:space-y-6">
            <Tabs defaultValue="nlp" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 min-w-max sm:min-w-0">
                  <TabsTrigger value="nlp" className="text-xs sm:text-sm">Natural Language Query</TabsTrigger>
                  <TabsTrigger value="supply-chain" className="text-xs sm:text-sm">Supply Chain</TabsTrigger>
                  <TabsTrigger value="esg" className="text-xs sm:text-sm">ESG Analysis</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="nlp">
                <NaturalLanguageQueryPanel />
              </TabsContent>
              <TabsContent value="supply-chain">
                <SupplyChainPanel />
              </TabsContent>
              <TabsContent value="esg">
                <ESGAnalysisPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Tabs defaultValue="alerts" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 min-w-max sm:min-w-0">
                  <TabsTrigger value="alerts" className="text-xs sm:text-sm">Alert Configuration</TabsTrigger>
                  <TabsTrigger value="distress" className="text-xs sm:text-sm">Distress Alerts</TabsTrigger>
                  <TabsTrigger value="industry" className="text-xs sm:text-sm">Industry Intel</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="alerts">
                <AlertConfigurationPanel />
              </TabsContent>
              <TabsContent value="distress">
                <DistressAlertsPanel 
                  alerts={distressAlerts} 
                  onInvestigate={handleInvestigateAlert}
                />
              </TabsContent>
              <TabsContent value="industry">
                <IndustryIntelligencePanel />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        <CompanyDetailsModal
          company={selectedCompany}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
        />
      </div>
    </div>
  );
}
