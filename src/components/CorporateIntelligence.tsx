import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { QuickSearchSection } from './corporateIntelligence/QuickSearchSection';
import { QuickActionsGrid } from './corporateIntelligence/QuickActionsGrid';
import { MainContentTabs } from './corporateIntelligence/MainContentTabs';
import { CompanyDetailsModal } from './corporateIntelligence/CompanyDetailsModal';
import { Company, LoadingStates, DistressAlert } from '@/types/corporateIntelligence';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const handleAnalyze = async (companyName: string, ticker?: string) => {
    console.log('handleAnalyze called with:', { companyName, ticker });
    
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
        body: { 
          action: 'analyze_company', 
          company_name: companyName.trim(),
          ticker: ticker?.trim() || ''
        },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container-responsive padding-responsive space-y-4 sm:space-y-6 lg:space-y-8">
        <QuickSearchSection 
          quickSearchTerm={quickSearchTerm}
          onQuickSearchChange={setQuickSearchTerm}
        />

        <QuickActionsGrid />

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

        <MainContentTabs
          companies={companies}
          selectedCompany={selectedCompany}
          loading={loading}
          loadingStates={loadingStates}
          searchTerm={searchTerm}
          industryFilter={industryFilter}
          distressAlerts={distressAlerts}
          aiAnalysis={aiAnalysis}
          onAnalyze={handleAnalyze}
          onAIAnalysisComplete={handleAIAnalysisComplete}
          onSearchChange={setSearchTerm}
          onIndustryChange={setIndustryFilter}
          onSelectCompany={setSelectedCompany}
          onInvestigateAlert={handleInvestigateAlert}
        />

        <CompanyDetailsModal
          company={selectedCompany}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
        />
      </div>
    </div>
  );
}
