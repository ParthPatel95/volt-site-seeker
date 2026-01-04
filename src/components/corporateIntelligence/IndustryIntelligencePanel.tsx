
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IndustryData {
  id: string;
  industry: string;
  company_name: string;
  ticker: string | null;
  market_cap: number | null;
  power_intensity: string | null;
  financial_health: number | null;
  risk_level: string | null;
  scanned_at: string;
}

export function IndustryIntelligencePanel() {
  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIndustryData();
  }, []);

  const loadIndustryData = async () => {
    setLoading(true);
    try {
      console.log('Loading industry intelligence data...');
      
      const { data, error } = await supabase
        .from('industry_intelligence')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading industry data:', error);
        toast({
          title: "Error Loading Industry Data",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const transformedData: IndustryData[] = (data || []).map((row) => ({
        id: row.id,
        industry: row.industry,
        company_name: row.company_name,
        ticker: row.ticker,
        market_cap: row.market_cap ? Number(row.market_cap) : null,
        power_intensity: row.power_intensity,
        financial_health: row.financial_health ? Number(row.financial_health) : null,
        risk_level: row.risk_level,
        scanned_at: row.scanned_at
      }));

      setIndustryData(transformedData);
      console.log('Industry data loaded:', transformedData.length, 'records');

    } catch (error) {
      console.error('Error loading industry data:', error);
      toast({
        title: "Error",
        description: "Failed to load industry intelligence data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getRiskColor = (risk: string | null) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getPowerIntensityColor = (intensity: string | null) => {
    switch (intensity?.toLowerCase()) {
      case 'extreme':
        return 'bg-red-600';
      case 'very_high':
        return 'bg-orange-500';
      case 'high':
        return 'bg-yellow-500';
      case 'medium':
        return 'bg-blue-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const groupedByIndustry = industryData.reduce((acc, item) => {
    if (!acc[item.industry]) {
      acc[item.industry] = [];
    }
    acc[item.industry].push(item);
    return acc;
  }, {} as Record<string, IndustryData[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Industry Intelligence ({industryData.length} companies)
          </div>
          <Button variant="outline" size="sm" onClick={loadIndustryData} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading industry intelligence...</p>
          </div>
        ) : industryData.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No Industry Data Found</h3>
            <p className="text-muted-foreground">Run industry scans to see company intelligence data here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByIndustry).map(([industry, companies]) => (
              <div key={industry} className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-700">{industry}</h3>
                <div className="grid gap-3">
                  {companies.map((company) => (
                    <div key={company.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{company.company_name}</h4>
                            {company.ticker && (
                              <Badge variant="outline">{company.ticker}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Market Cap:</span>
                              <p className="font-medium">{formatCurrency(company.market_cap)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Health Score:</span>
                              <p className="font-medium">{company.financial_health || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk Level:</span>
                              <Badge className={`${getRiskColor(company.risk_level)} text-white`}>
                                {company.risk_level || 'Unknown'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Power Intensity:</span>
                              <Badge className={`${getPowerIntensityColor(company.power_intensity)} text-white`}>
                                {company.power_intensity?.replace('_', ' ') || 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Scanned: {formatDate(company.scanned_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
