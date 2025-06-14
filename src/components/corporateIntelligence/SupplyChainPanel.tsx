
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertCircle, Globe, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupplyChainAnalysis {
  id: string;
  company_id: string;
  supplier_dependencies: string[];
  critical_components: string[];
  disruption_risks: any;
  geographic_exposure: any;
  regulatory_risks: string[];
  mitigation_strategies: string[];
  impact_on_power_consumption: any;
  analysis_date: string;
  companies?: {
    name: string;
    industry: string;
  };
}

export function SupplyChainPanel() {
  const [analyses, setAnalyses] = useState<SupplyChainAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('supply_chain_analysis')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading supply chain analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load supply chain analyses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeSupplyChain = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze supply chain",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'analyze_supply_chain',
          company_name: companyName.trim()
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Supply Chain Analysis Complete",
          description: `Analyzed supply chain for ${companyName}`,
        });
        loadAnalyses();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error analyzing supply chain:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze supply chain",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskLevel = (risks: any) => {
    if (!risks) return 'low';
    const riskCount = Object.keys(risks).length;
    if (riskCount > 5) return 'high';
    if (riskCount > 2) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Supply Chain Analysis
          </h2>
          <p className="text-muted-foreground">
            AI-powered supply chain risk assessment and disruption analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Supply Chain</CardTitle>
          <CardDescription>
            Comprehensive supply chain risk and dependency analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeSupplyChain()}
            />
            <Button onClick={analyzeSupplyChain} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Supply Chain'}
              <Truck className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading supply chain analyses...</p>
        </div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Supply Chain Analyses
            </h3>
            <p className="text-muted-foreground">
              Analyze a company's supply chain to see risk assessments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.slice(0, 10).map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {analysis.companies?.name || 'Unknown Company'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getRiskColor(getRiskLevel(analysis.disruption_risks))}>
                        Risk Level: {getRiskLevel(analysis.disruption_risks)}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(analysis.analysis_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Key Dependencies
                    </h4>
                    <div className="space-y-1">
                      {analysis.supplier_dependencies?.slice(0, 3).map((dependency, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {dependency}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Geographic Exposure
                    </h4>
                    <div className="space-y-1">
                      {analysis.geographic_exposure && Object.entries(analysis.geographic_exposure).slice(0, 3).map(([region, percentage]) => (
                        <div key={region} className="flex justify-between text-sm">
                          <span className="capitalize">{region.replace('_', ' ')}</span>
                          <span className="text-muted-foreground">{String(percentage)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.critical_components && analysis.critical_components.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Critical Components</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.critical_components.slice(0, 6).map((component, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.regulatory_risks && analysis.regulatory_risks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      Regulatory Risks
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.regulatory_risks.slice(0, 4).map((risk, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.mitigation_strategies && analysis.mitigation_strategies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Mitigation Strategies</h4>
                    <div className="space-y-1">
                      {analysis.mitigation_strategies.slice(0, 3).map((strategy, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {strategy}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
