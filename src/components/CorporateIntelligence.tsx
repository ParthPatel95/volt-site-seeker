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
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Corporate Intelligence Hub
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            AI-powered insights for corporate analysis, investment decisions, and market intelligence
          </p>
          
          {/* Quick Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Quick search companies, news, or insights..."
                value={quickSearchTerm}
                onChange={(e) => setQuickSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.action} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                    <CardDescription className="text-xs">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">Error</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Recent Company Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading companies...</p>
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No Companies Analyzed</h3>
                      <p className="text-slate-500 mb-4">Start by analyzing a company to see insights here</p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Analyze Company
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {companies.slice(0, 3).map((company) => (
                        <div key={company.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{company.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{company.industry}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Health: {company.financial_health_score || 'N/A'}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => setSelectedCompany(company)}>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="w-4 h-4 mr-2" />
                    Analyze New Company
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <AICompanyAnalyzer onAnalysisComplete={handleAIAnalysisComplete} />
                {aiAnalysis && <AIAnalysisDisplay analysis={aiAnalysis} />}
              </div>
              <div className="space-y-6">
                <CompanyAnalysisForm onAnalyze={handleAnalyze} loading={loadingStates.analyzing} />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Company Database</CardTitle>
                  </CardHeader>
                  <CardContent>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <TabsContent value="intelligence" className="space-y-6">
            <Tabs defaultValue="news" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="news">News Intel</TabsTrigger>
                <TabsTrigger value="power">Power Forecast</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>
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

          <TabsContent value="portfolio" className="space-y-6">
            <Tabs defaultValue="optimizer" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="optimizer">Portfolio Optimizer</TabsTrigger>
                <TabsTrigger value="investment">Investment Scoring</TabsTrigger>
                <TabsTrigger value="due-diligence">Due Diligence</TabsTrigger>
                <TabsTrigger value="market-timing">Market Timing</TabsTrigger>
              </TabsList>
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

          <TabsContent value="insights" className="space-y-6">
            <Tabs defaultValue="nlp" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nlp">Natural Language Query</TabsTrigger>
                <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
                <TabsTrigger value="esg">ESG Analysis</TabsTrigger>
              </TabsList>
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

          <TabsContent value="settings" className="space-y-6">
            <Tabs defaultValue="alerts" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="alerts">Alert Configuration</TabsTrigger>
                <TabsTrigger value="distress">Distress Alerts</TabsTrigger>
                <TabsTrigger value="industry">Industry Intel</TabsTrigger>
              </TabsList>
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
