
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Target, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketTimingAnalysis {
  id: string;
  company_id: string;
  market_cycle_phase: string;
  optimal_acquisition_window: any;
  market_conditions_score: number;
  institutional_activity_level: string;
  fire_sale_probability: number;
  timing_recommendation: string;
  key_timing_factors: string[];
  analysis_date: string;
  companies?: {
    name: string;
    industry: string;
  };
}

export function MarketTimingPanel() {
  const [analyses, setAnalyses] = useState<MarketTimingAnalysis[]>([]);
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
        .from('market_timing_analysis')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading market timing analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load market timing analyses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeMarketTiming = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze market timing",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'analyze_market_timing',
          company_name: companyName.trim()
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Market Timing Analysis Complete",
          description: `Analyzed market timing for ${companyName}`,
        });
        loadAnalyses();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error analyzing market timing:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze market timing",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'expansion': return 'default';
      case 'peak': return 'secondary';
      case 'contraction': return 'destructive';
      case 'trough': return 'outline';
      default: return 'secondary';
    }
  };

  const getTimingColor = (recommendation: string) => {
    if (recommendation?.toLowerCase().includes('buy')) return 'default';
    if (recommendation?.toLowerCase().includes('hold')) return 'secondary';
    if (recommendation?.toLowerCase().includes('wait')) return 'destructive';
    return 'secondary';
  };

  const chartData = analyses.slice(0, 10).map(analysis => ({
    company: analysis.companies?.name || 'Unknown',
    conditions: analysis.market_conditions_score,
    fireSale: analysis.fire_sale_probability * 100,
    date: new Date(analysis.analysis_date).toLocaleDateString()
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Market Timing Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered acquisition timing analysis and market cycle assessment
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Market Timing</CardTitle>
          <CardDescription>
            Optimize acquisition timing with AI-powered market cycle analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeMarketTiming()}
            />
            <Button onClick={analyzeMarketTiming} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Timing'}
              <Clock className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Conditions Overview</CardTitle>
            <CardDescription>
              Market conditions and fire sale probability across companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="conditions"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Market Conditions"
                />
                <Area
                  type="monotone"
                  dataKey="fireSale"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Fire Sale Probability"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading market timing analyses...</p>
        </div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Market Timing Analyses
            </h3>
            <p className="text-muted-foreground">
              Analyze market timing for a company to see acquisition recommendations
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
                      <Badge variant={getPhaseColor(analysis.market_cycle_phase)}>
                        {analysis.market_cycle_phase}
                      </Badge>
                      <Badge variant={getTimingColor(analysis.timing_recommendation)}>
                        {analysis.timing_recommendation}
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
                    <h4 className="font-medium mb-2">Market Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Market Conditions:</span>
                        <Badge variant={analysis.market_conditions_score > 70 ? 'default' : 'secondary'}>
                          {analysis.market_conditions_score}/100
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fire Sale Probability:</span>
                        <Badge variant={analysis.fire_sale_probability > 0.5 ? 'destructive' : 'secondary'}>
                          {(analysis.fire_sale_probability * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Institutional Activity:</span>
                        <Badge variant="outline">
                          {analysis.institutional_activity_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Optimal Window</h4>
                    <div className="space-y-1">
                      {analysis.optimal_acquisition_window && Object.entries(analysis.optimal_acquisition_window).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.key_timing_factors && analysis.key_timing_factors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Key Timing Factors
                    </h4>
                    <div className="space-y-1">
                      {analysis.key_timing_factors.slice(0, 3).map((factor, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {factor}
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
