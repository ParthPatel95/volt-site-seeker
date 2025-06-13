import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  AlertTriangle, 
  Search,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { Company, DistressAlert, LoadingStates } from '@/types/corporateIntelligence';
import { CompanyAnalysisForm } from '@/components/corporateIntelligence/CompanyAnalysisForm';
import { DistressAlertsPanel } from '@/components/corporateIntelligence/DistressAlertsPanel';
import { CompanyFilters } from '@/components/corporateIntelligence/CompanyFilters';
import { CompanyCard } from '@/components/corporateIntelligence/CompanyCard';
import { CompanyDetailsModal } from '@/components/corporateIntelligence/CompanyDetailsModal';
import { IndustryIntelligencePanel } from '@/components/corporateIntelligence/IndustryIntelligencePanel';
import { LinkedInIntelligencePanel } from '@/components/corporateIntelligence/LinkedInIntelligencePanel';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type DistressAlertRow = Database['public']['Tables']['distress_alerts']['Row'];

export function CorporateIntelligence() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<DistressAlert[]>([]);
  const [loading, setLoading] = useState<LoadingStates>({
    analyzing: false,
    scanning: false,
    detecting: false,
    monitoring: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const setLoadingState = (key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const loadData = async () => {
    try {
      console.log('Loading corporate intelligence data...');
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (companiesError) {
        console.error('Error loading companies:', companiesError);
        toast({
          title: "Error Loading Companies",
          description: companiesError.message,
          variant: "destructive"
        });
      } else {
        const transformedCompanies: Company[] = (companiesData || []).map((row: CompanyRow) => ({
          id: row.id,
          name: row.name,
          ticker: row.ticker || undefined,
          industry: row.industry,
          sector: row.sector,
          market_cap: row.market_cap ? Number(row.market_cap) : undefined,
          financial_health_score: row.financial_health_score || undefined,
          distress_signals: Array.isArray(row.distress_signals) ? row.distress_signals : [],
          power_usage_estimate: row.power_usage_estimate ? Number(row.power_usage_estimate) : undefined,
          locations: row.locations,
          analyzed_at: row.analyzed_at,
          debt_to_equity: row.debt_to_equity ? Number(row.debt_to_equity) : undefined,
          current_ratio: row.current_ratio ? Number(row.current_ratio) : undefined,
          revenue_growth: row.revenue_growth ? Number(row.revenue_growth) : undefined,
          profit_margin: row.profit_margin ? Number(row.profit_margin) : undefined,
        }));
        setCompanies(transformedCompanies);
      }

      const { data: alertsData, error: alertsError } = await supabase
        .from('distress_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) {
        console.error('Error loading alerts:', alertsError);
        toast({
          title: "Error Loading Alerts",
          description: alertsError.message,
          variant: "destructive"
        });
      } else {
        const transformedAlerts: DistressAlert[] = (alertsData || []).map((row: DistressAlertRow) => ({
          id: row.id,
          company_name: row.company_name,
          alert_type: row.alert_type,
          distress_level: Number(row.distress_level) || 0,
          signals: Array.isArray(row.signals) ? row.signals : [],
          power_capacity: Number(row.power_capacity) || 0,
          potential_value: Number(row.potential_value) || 0,
          created_at: row.created_at
        }));
        setAlerts(transformedAlerts);
      }

      console.log('Loaded companies:', companiesData?.length, 'alerts:', alertsData?.length);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    }
  };

  const analyzeCompany = async (companyName: string, ticker: string) => {
    if (!companyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a company name",
        variant: "destructive"
      });
      return;
    }
    
    setLoadingState('analyzing', true);
    try {
      console.log('Analyzing company:', companyName);
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'analyze_company',
          company_name: companyName,
          ticker: ticker || undefined
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      console.log('Analysis result:', data);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${companyName}`,
      });

      await loadData();
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || 'Failed to analyze company. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoadingState('analyzing', false);
    }
  };

  const runIndustryScans = async () => {
    setLoadingState('scanning', true);
    try {
      console.log('Running industry scans...');
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'scan_industries' }
      });

      if (error) {
        console.error('Industry scan error:', error);
        throw new Error(error.message || 'Industry scan failed');
      }

      console.log('Industry scan result:', data);

      toast({
        title: "Industry Scan Complete",
        description: `Successfully analyzed ${data?.companies_analyzed || 0} companies`,
      });

      await loadData();
    } catch (error: any) {
      console.error('Industry scan failed:', error);
      toast({
        title: "Scan Failed",
        description: error.message || 'Failed to scan industries. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoadingState('scanning', false);
    }
  };

  const detectDistress = async () => {
    setLoadingState('detecting', true);
    try {
      console.log('Detecting distress signals...');
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'detect_distress' }
      });

      if (error) {
        console.error('Distress detection error:', error);
        throw new Error(error.message || 'Distress detection failed');
      }

      console.log('Distress detection result:', data);

      toast({
        title: "Distress Detection Complete",
        description: `Generated ${data?.alerts_generated || 0} new alerts`,
      });

      await loadData();
    } catch (error: any) {
      console.error('Distress detection failed:', error);
      toast({
        title: "Detection Failed",
        description: error.message || 'Failed to detect distress signals. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoadingState('detecting', false);
    }
  };

  const monitorLinkedIn = async () => {
    setLoadingState('monitoring', true);
    try {
      console.log('Monitoring LinkedIn...');
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'monitor_linkedin' }
      });

      if (error) {
        console.error('LinkedIn monitoring error:', error);
        throw new Error(error.message || 'LinkedIn monitoring failed');
      }

      console.log('LinkedIn monitoring result:', data);

      toast({
        title: "LinkedIn Monitoring Complete",
        description: `Analyzed ${data?.posts_analyzed || 0} posts`,
      });

      await loadData();
    } catch (error: any) {
      console.error('LinkedIn monitoring failed:', error);
      toast({
        title: "Monitoring Failed",
        description: error.message || 'Failed to monitor LinkedIn. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoadingState('monitoring', false);
    }
  };

  const viewCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const investigateAlert = (alert: DistressAlert) => {
    console.log('Investigating alert:', alert);
    toast({
      title: "Investigation Started",
      description: `Investigating ${alert.company_name}`,
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.ticker && company.ticker.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Corporate Intelligence</h1>
          <p className="text-muted-foreground">Monitor companies and detect investment opportunities</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runIndustryScans} disabled={loading.scanning}>
            {loading.scanning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Scan Industries
          </Button>
          <Button onClick={detectDistress} disabled={loading.detecting}>
            {loading.detecting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
            Detect Distress
          </Button>
          <Button onClick={monitorLinkedIn} disabled={loading.monitoring}>
            {loading.monitoring ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
            Monitor LinkedIn
          </Button>
        </div>
      </div>

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="industry">Industry Intel</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Intel</TabsTrigger>
          <TabsTrigger value="alerts">Distress Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <CompanyAnalysisForm 
            onAnalyze={analyzeCompany} 
            loading={loading.analyzing}
          />

          <CompanyFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            industryFilter={industryFilter}
            onIndustryChange={setIndustryFilter}
            disabled={isAnyLoading}
          />

          <div className="grid gap-4">
            {filteredCompanies.map((company) => (
              <CompanyCard 
                key={company.id} 
                company={company} 
                onViewDetails={viewCompanyDetails}
              />
            ))}
          </div>

          {filteredCompanies.length === 0 && !isAnyLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">No companies found</h3>
                <p className="text-muted-foreground mb-4">
                  Start by analyzing companies or running industry scans
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          <IndustryIntelligencePanel />
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-6">
          <LinkedInIntelligencePanel />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <DistressAlertsPanel 
            alerts={alerts} 
            onInvestigate={investigateAlert}
          />
        </TabsContent>
      </Tabs>

      <CompanyDetailsModal 
        company={selectedCompany}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {isAnyLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">Processing...</h3>
            <p className="text-muted-foreground">
              Please wait while we process your request
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
