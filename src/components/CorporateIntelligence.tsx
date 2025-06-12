
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  TrendingDown, 
  AlertTriangle, 
  Search,
  Activity,
  DollarSign,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type DistressAlertRow = Database['public']['Tables']['distress_alerts']['Row'];

interface Company {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  sector: string;
  market_cap?: number;
  financial_health_score?: number;
  distress_signals?: string[];
  power_usage_estimate?: number;
  locations?: any;
  analyzed_at: string;
}

interface DistressAlert {
  id: string;
  company_name: string;
  alert_type: string;
  distress_level: number;
  signals: string[];
  power_capacity: number;
  potential_value: number;
  created_at: string;
}

interface LoadingStates {
  analyzing: boolean;
  scanning: boolean;
  detecting: boolean;
  monitoring: boolean;
}

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
  const [newCompany, setNewCompany] = useState('');
  const [newTicker, setNewTicker] = useState('');
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
          market_cap: row.market_cap || undefined,
          financial_health_score: row.financial_health_score || undefined,
          distress_signals: row.distress_signals || undefined,
          power_usage_estimate: row.power_usage_estimate ? Number(row.power_usage_estimate) : undefined,
          locations: row.locations,
          analyzed_at: row.analyzed_at
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
          distress_level: row.distress_level,
          signals: row.signals,
          power_capacity: Number(row.power_capacity),
          potential_value: Number(row.potential_value),
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

  const analyzeCompany = async () => {
    if (!newCompany.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a company name",
        variant: "destructive"
      });
      return;
    }
    
    setLoadingState('analyzing', true);
    try {
      console.log('Analyzing company:', newCompany);
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'analyze_company',
          company_name: newCompany.trim(),
          ticker: newTicker.trim() || undefined
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      console.log('Analysis result:', data);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${newCompany}`,
      });

      setNewCompany('');
      setNewTicker('');
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

  const viewCompanyDetails = async (company: Company) => {
    console.log('Viewing company details:', company);
    toast({
      title: "Company Details",
      description: `Viewing details for ${company.name}`,
    });
  };

  const investigateAlert = async (alert: DistressAlert) => {
    console.log('Investigating alert:', alert);
    toast({
      title: "Investigation Started",
      description: `Investigating ${alert.company_name}`,
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.ticker?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const getHealthColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDistressColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

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

      {/* Add Company Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Add Company Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Company name"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className="flex-1"
              disabled={loading.analyzing}
            />
            <Input
              placeholder="Ticker (optional)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="w-32"
              disabled={loading.analyzing}
            />
            <Button onClick={analyzeCompany} disabled={loading.analyzing || !newCompany.trim()}>
              {loading.analyzing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distress Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              High Priority Distress Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{alert.company_name}</h4>
                      <Badge className={`text-white ${getDistressColor(alert.distress_level)}`}>
                        {alert.distress_level}% Distress
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {alert.power_capacity} MW
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${(alert.potential_value / 1000000).toFixed(1)}M value
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {alert.signals.map((signal, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => investigateAlert(alert)}>
                    Investigate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isAnyLoading}
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter} disabled={isAnyLoading}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Materials">Materials</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <div className="grid gap-4">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                    {company.ticker && (
                      <Badge variant="outline">{company.ticker}</Badge>
                    )}
                    <Badge className={`text-white ${getHealthColor(company.financial_health_score)}`}>
                      Health: {company.financial_health_score || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{company.industry} • {company.sector}</span>
                    <div className="flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      {Array.isArray(company.locations) ? company.locations.length : 0} locations
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => viewCompanyDetails(company)}>
                  View Details
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">
                      ${company.market_cap ? (company.market_cap / 1000000000).toFixed(1) : 'N/A'}B
                    </p>
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">{company.power_usage_estimate || 'N/A'} MW</p>
                    <p className="text-xs text-muted-foreground">Est. Power Usage</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">{company.distress_signals?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Distress Signals</p>
                  </div>
                </div>
              </div>

              {company.distress_signals && company.distress_signals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {company.distress_signals.map((signal, idx) => (
                    <Badge key={idx} variant="destructive" className="text-xs">
                      {signal}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
