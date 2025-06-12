
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
  locations?: any[];
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

export function CorporateIntelligence() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<DistressAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [newCompany, setNewCompany] = useState('');
  const [newTicker, setNewTicker] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading corporate intelligence data...');
      
      // Load companies from database
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (companiesError) {
        console.error('Error loading companies:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }

      // Load distress alerts from database
      const { data: alertsData, error: alertsError } = await supabase
        .from('distress_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) {
        console.error('Error loading alerts:', alertsError);
      } else {
        setAlerts(alertsData || []);
      }

      console.log('Loaded companies:', companiesData?.length, 'alerts:', alertsData?.length);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const analyzeCompany = async () => {
    if (!newCompany.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Analyzing company:', newCompany);
      
      // Call the corporate intelligence edge function
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'analyze_company',
          company_name: newCompany,
          ticker: newTicker || undefined
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      console.log('Analysis result:', data);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${newCompany}`,
      });

      setNewCompany('');
      setNewTicker('');
      loadData();
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || 'Failed to analyze company',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runIndustryScans = async () => {
    setLoading(true);
    try {
      console.log('Running industry scans...');
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'scan_industries' }
      });

      if (error) {
        console.error('Industry scan error:', error);
        throw error;
      }

      console.log('Industry scan result:', data);

      toast({
        title: "Industry Scan Complete",
        description: `Analyzed ${data?.companies_analyzed || 0} companies`,
      });

      loadData();
    } catch (error: any) {
      console.error('Industry scan failed:', error);
      toast({
        title: "Scan Failed",
        description: error.message || 'Failed to scan industries',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const detectDistress = async () => {
    setLoading(true);
    try {
      console.log('Detecting distress signals...');
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'detect_distress' }
      });

      if (error) {
        console.error('Distress detection error:', error);
        throw error;
      }

      console.log('Distress detection result:', data);

      toast({
        title: "Distress Detection Complete",
        description: `Generated ${data?.alerts_generated || 0} new alerts`,
      });

      loadData();
    } catch (error: any) {
      console.error('Distress detection failed:', error);
      toast({
        title: "Detection Failed",
        description: error.message || 'Failed to detect distress',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const monitorLinkedIn = async () => {
    setLoading(true);
    try {
      console.log('Monitoring LinkedIn...');
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { action: 'monitor_linkedin' }
      });

      if (error) {
        console.error('LinkedIn monitoring error:', error);
        throw error;
      }

      console.log('LinkedIn monitoring result:', data);

      toast({
        title: "LinkedIn Monitoring Complete",
        description: `Analyzed ${data?.posts_analyzed || 0} posts`,
      });

      loadData();
    } catch (error: any) {
      console.error('LinkedIn monitoring failed:', error);
      toast({
        title: "Monitoring Failed",
        description: error.message || 'Failed to monitor LinkedIn',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Corporate Intelligence</h1>
          <p className="text-muted-foreground">Monitor companies and detect investment opportunities</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runIndustryScans} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Scan Industries
          </Button>
          <Button onClick={detectDistress} disabled={loading}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Detect Distress
          </Button>
          <Button onClick={monitorLinkedIn} disabled={loading}>
            <Eye className="w-4 h-4 mr-2" />
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
            />
            <Input
              placeholder="Ticker (optional)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="w-32"
            />
            <Button onClick={analyzeCompany} disabled={loading || !newCompany.trim()}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
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
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
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
                      {company.locations?.length || 0} locations
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

      {filteredCompanies.length === 0 && (
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
    </div>
  );
}
