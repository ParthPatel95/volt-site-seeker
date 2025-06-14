
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        loadCompanies(); // Refresh the companies list
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
    // Refresh companies list to include the newly analyzed company
    loadCompanies();
  };

  const handleInvestigateAlert = (alert: DistressAlert) => {
    console.log('Investigating alert:', alert);
    toast({
      title: "Alert Investigation",
      description: `Investigating alert for ${alert.company_name}`,
    });
  };

  return (
    <div className="h-screen overflow-y-auto bg-background p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Corporate Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of corporate distress signals and power infrastructure opportunities
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="font-medium text-red-800">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      <Tabs defaultValue="ai-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="ai-analysis" className="text-xs">AI Analysis</TabsTrigger>
          <TabsTrigger value="companies" className="text-xs">Companies</TabsTrigger>
          <TabsTrigger value="news-intel" className="text-xs">News Intel</TabsTrigger>
          <TabsTrigger value="power-forecast" className="text-xs">Power Forecast</TabsTrigger>
          <TabsTrigger value="competitors" className="text-xs">Competitors</TabsTrigger>
          <TabsTrigger value="investment-scoring" className="text-xs">Investment</TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
          <TabsTrigger value="due-diligence" className="text-xs">Due Diligence</TabsTrigger>
          <TabsTrigger value="social-sentiment" className="text-xs">Social</TabsTrigger>
          <TabsTrigger value="supply-chain" className="text-xs">Supply Chain</TabsTrigger>
          <TabsTrigger value="esg" className="text-xs">ESG</TabsTrigger>
          <TabsTrigger value="nlp-query" className="text-xs">NLP Query</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-analysis" className="space-y-6">
          <AICompanyAnalyzer onAnalysisComplete={handleAIAnalysisComplete} />
          
          {aiAnalysis && (
            <AIAnalysisDisplay analysis={aiAnalysis} />
          )}
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <CompanyFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            industryFilter={industryFilter}
            onIndustryChange={setIndustryFilter}
            disabled={loading}
          />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-muted-foreground mb-4">
                {searchTerm || industryFilter !== 'all' ? 'No Companies Found' : 'No Companies Analyzed Yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || industryFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms.' 
                  : 'Use the AI Analysis tab to analyze companies and see them here.'}
              </p>
            </div>
          ) : (
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

        <TabsContent value="news-intel">
          <NewsIntelligencePanel />
        </TabsContent>

        <TabsContent value="power-forecast">
          <PowerForecastingPanel />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitorAnalysisPanel />
        </TabsContent>

        <TabsContent value="investment-scoring">
          <InvestmentScoringPanel />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioOptimizerPanel />
        </TabsContent>

        <TabsContent value="due-diligence">
          <DueDiligencePanel />
        </TabsContent>

        <TabsContent value="social-sentiment">
          <SocialSentimentPanel />
        </TabsContent>

        <TabsContent value="supply-chain">
          <SupplyChainPanel />
        </TabsContent>

        <TabsContent value="esg">
          <ESGAnalysisPanel />
        </TabsContent>

        <TabsContent value="nlp-query">
          <NaturalLanguageQueryPanel />
        </TabsContent>

        {/* Additional tabs in the second row for larger screens */}
        <div className="lg:block hidden">
          <TabsList className="grid w-full grid-cols-4 mt-4">
            <TabsTrigger value="market-timing" className="text-xs">Market Timing</TabsTrigger>
            <TabsTrigger value="alert-config" className="text-xs">Alert Config</TabsTrigger>
            <TabsTrigger value="distress-alerts" className="text-xs">Distress Alerts</TabsTrigger>
            <TabsTrigger value="manual-analysis" className="text-xs">Manual Analysis</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="market-timing">
          <MarketTimingPanel />
        </TabsContent>

        <TabsContent value="alert-config">
          <AlertConfigurationPanel />
        </TabsContent>

        <TabsContent value="distress-alerts">
          <DistressAlertsPanel 
            alerts={distressAlerts} 
            onInvestigate={handleInvestigateAlert}
          />
        </TabsContent>

        <TabsContent value="manual-analysis" className="space-y-6">
          <CompanyAnalysisForm
            onAnalyze={handleAnalyze}
            loading={loadingStates.analyzing}
          />
        </TabsContent>

        {/* Legacy tabs for compatibility */}
        <div className="lg:hidden">
          <TabsList className="grid w-full grid-cols-3 mt-4">
            <TabsTrigger value="industry-intel" className="text-xs">Industry Intel</TabsTrigger>
            <TabsTrigger value="linkedin-intel" className="text-xs">LinkedIn Intel</TabsTrigger>
            <TabsTrigger value="legacy-alerts" className="text-xs">Legacy Alerts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="industry-intel">
          <IndustryIntelligencePanel />
        </TabsContent>

        <TabsContent value="linkedin-intel">
          <LinkedInIntelligencePanel />
        </TabsContent>

        <TabsContent value="legacy-alerts">
          <DistressAlertsPanel 
            alerts={distressAlerts} 
            onInvestigate={handleInvestigateAlert}
          />
        </TabsContent>
      </Tabs>

      <CompanyDetailsModal
        company={selectedCompany}
        open={!!selectedCompany}
        onOpenChange={(open) => !open && setSelectedCompany(null)}
      />
    </div>
  );
}
