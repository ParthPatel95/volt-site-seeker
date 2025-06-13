
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
import { Company, LoadingStates, DistressAlert } from '@/types/corporateIntelligence';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    loadCompanies();
  }, [searchTerm, industryFilter]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (industryFilter && industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading companies:', error);
        return;
      }

      setCompanies(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (companyName: string) => {
    setLoadingStates((prev) => ({ ...prev, analyzing: true }));

    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'analyze_company', company_name: companyName },
      });

      if (error) {
        console.error('Analysis error:', error);
        return;
      }

      loadCompanies();
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
    // Add investigation logic here
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

      <Tabs defaultValue="ai-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="distress-alerts">Distress Alerts</TabsTrigger>
          <TabsTrigger value="industry-intel">Industry Intel</TabsTrigger>
          <TabsTrigger value="linkedin-intel">LinkedIn Intel</TabsTrigger>
          <TabsTrigger value="manual-analysis">Manual Analysis</TabsTrigger>
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
              <h3 className="text-xl font-medium text-muted-foreground mb-4">No Companies Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or analyze some companies first.</p>
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

        <TabsContent value="distress-alerts">
          <DistressAlertsPanel 
            alerts={distressAlerts} 
            onInvestigate={handleInvestigateAlert}
          />
        </TabsContent>

        <TabsContent value="industry-intel">
          <IndustryIntelligencePanel />
        </TabsContent>

        <TabsContent value="linkedin-intel">
          <LinkedInIntelligencePanel />
        </TabsContent>

        <TabsContent value="manual-analysis" className="space-y-6">
          <CompanyAnalysisForm
            onAnalyze={handleAnalyze}
            loading={loadingStates.analyzing}
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
