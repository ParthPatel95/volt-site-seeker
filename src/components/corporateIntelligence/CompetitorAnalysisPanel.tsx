
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompetitorAnalysis {
  id: string;
  company_id: string;
  competitor_name: string;
  market_share_estimate: number;
  power_usage_comparison: number;
  competitive_advantages: string[];
  competitive_weaknesses: string[];
  market_positioning: string;
  analysis_date: string;
  companies?: {
    name: string;
    industry: string;
  };
}

export function CompetitorAnalysisPanel() {
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([]);
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
        .from('competitor_analysis')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading competitor analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load competitor analyses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompetitors = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze competitors",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'analyze_competitors', 
          company_name: companyName.trim() 
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Competitor Analysis Complete",
          description: `Analyzed ${data.competitors_analyzed} competitors for ${companyName}`,
        });
        loadAnalyses();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error analyzing competitors:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze competitors",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Competitor Analysis
          </h2>
          <p className="text-muted-foreground">
            AI-powered competitive intelligence and market positioning analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Competitors</CardTitle>
          <CardDescription>
            Generate competitive intelligence for any company's market landscape
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeCompetitors()}
            />
            <Button onClick={analyzeCompetitors} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Competitors'}
              <Search className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading competitor analyses...</p>
        </div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Competitor Analyses Found
            </h3>
            <p className="text-muted-foreground">
              Analyze a company to generate competitive intelligence
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {analysis.competitor_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        vs {analysis.companies?.name || 'Unknown'}
                      </Badge>
                      <Badge variant="secondary">
                        {(analysis.market_share_estimate * 100).toFixed(1)}% market share
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{analysis.power_usage_comparison} MW</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Market Positioning</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysis.market_positioning}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Competitive Advantages
                      </h4>
                      <div className="space-y-1">
                        {analysis.competitive_advantages?.map((advantage, index) => (
                          <div key={index} className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                            {advantage}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        Competitive Weaknesses
                      </h4>
                      <div className="space-y-1">
                        {analysis.competitive_weaknesses?.map((weakness, index) => (
                          <div key={index} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                            {weakness}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
