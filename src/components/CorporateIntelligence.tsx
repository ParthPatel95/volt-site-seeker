
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainContentTabs } from '@/components/corporateIntelligence/MainContentTabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Company, DistressAlert, LoadingStates } from '@/types/corporateIntelligence';

export function CorporateIntelligence() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [distressAlerts, setDistressAlerts] = useState<DistressAlert[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [storedAiAnalyses, setStoredAiAnalyses] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    companies: false,
    analyzing: false,
    distressAlerts: false
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
    fetchDistressAlerts();
    fetchStoredAnalyses();
  }, []);

  const fetchCompanies = async () => {
    setLoadingStates(prev => ({ ...prev, companies: true }));
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error fetching companies",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, companies: false }));
    }
  };

  const fetchDistressAlerts = async () => {
    setLoadingStates(prev => ({ ...prev, distressAlerts: true }));
    try {
      const { data, error } = await supabase
        .from('distress_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDistressAlerts(data || []);
    } catch (error: any) {
      console.error('Error fetching distress alerts:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, distressAlerts: false }));
    }
  };

  const fetchStoredAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_company_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setStoredAiAnalyses(data || []);
    } catch (error: any) {
      console.error('Error fetching stored analyses:', error);
    }
  };

  const handleAnalyze = async (companyName: string, ticker?: string) => {
    setLoadingStates(prev => ({ ...prev, analyzing: true }));
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'analyze_company',
          company_name: companyName,
          ticker: ticker
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Analysis Complete",
          description: `Analysis for ${companyName} completed successfully`,
        });
        fetchStoredAnalyses();
      }
    } catch (error: any) {
      console.error('Error analyzing company:', error);
      toast({
        title: "Analysis Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, analyzing: false }));
    }
  };

  const handleAIAnalysisComplete = (analysis: any) => {
    setAiAnalysis(analysis);
    fetchStoredAnalyses();
  };

  const handleInvestigateAlert = (alert: DistressAlert) => {
    toast({
      title: "Investigating Alert",
      description: `Opening detailed analysis for ${alert.company_name}`,
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">Corporate Intelligence Platform</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    AI-powered business analytics and company intelligence
                  </p>
                </div>
              </div>
              <Button 
                onClick={fetchCompanies}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">{distressAlerts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Analyses</p>
                  <p className="text-2xl font-bold">{storedAiAnalyses.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <MainContentTabs
          companies={filteredCompanies}
          selectedCompany={selectedCompany}
          loading={loading}
          loadingStates={loadingStates}
          searchTerm={searchTerm}
          industryFilter={industryFilter}
          distressAlerts={distressAlerts}
          aiAnalysis={aiAnalysis}
          storedAiAnalyses={storedAiAnalyses}
          onAnalyze={handleAnalyze}
          onAIAnalysisComplete={handleAIAnalysisComplete}
          onSearchChange={setSearchTerm}
          onIndustryChange={setIndustryFilter}
          onSelectCompany={setSelectedCompany}
          onInvestigateAlert={handleInvestigateAlert}
        />
      </div>
    </AppLayout>
  );
}
