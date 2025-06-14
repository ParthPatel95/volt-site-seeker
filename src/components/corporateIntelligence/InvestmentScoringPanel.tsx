
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, AlertTriangle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvestmentScore {
  id: string;
  company_id: string;
  overall_score: number;
  risk_score: number;
  opportunity_score: number;
  timing_score: number;
  confidence_level: number;
  recommendation: string;
  key_factors: string[];
  risk_factors: string[];
  expected_roi_range: any;
  calculated_at: string;
  companies?: {
    name: string;
    industry: string;
  };
}

export function InvestmentScoringPanel() {
  const [scores, setScores] = useState<InvestmentScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investment_scores')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error loading investment scores:', error);
      toast({
        title: "Error",
        description: "Failed to load investment scores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateScores = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to generate investment scores",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'calculate_investment_scores', 
          company_name: companyName.trim() 
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Investment Analysis Complete",
          description: `Generated investment scores for ${companyName}`,
        });
        loadScores();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error generating scores:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to generate investment scores",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = scores.slice(0, 10).map(score => ({
    company: score.companies?.name || 'Unknown',
    overall: score.overall_score,
    risk: score.risk_score,
    opportunity: score.opportunity_score,
    timing: score.timing_score
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            Investment Risk Scoring
          </h2>
          <p className="text-muted-foreground">
            AI-powered investment analysis with risk-return calculations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Investment Scores</CardTitle>
          <CardDescription>
            Comprehensive AI analysis of investment opportunities and risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateScores()}
            />
            <Button onClick={generateScores} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Investment'}
              <Target className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Score Comparison</CardTitle>
            <CardDescription>
              Multi-factor analysis across portfolio companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="overall" fill="#8884d8" name="Overall Score" />
                <Bar dataKey="opportunity" fill="#82ca9d" name="Opportunity" />
                <Bar dataKey="risk" fill="#ffc658" name="Risk Score" />
                <Bar dataKey="timing" fill="#ff7300" name="Timing" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading investment scores...</p>
        </div>
      ) : scores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Investment Scores Generated
            </h3>
            <p className="text-muted-foreground">
              Analyze a company to generate investment risk scores
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scores.slice(0, 10).map((score) => (
            <Card key={score.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {score.companies?.name || 'Unknown Company'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getScoreColor(score.overall_score)}>
                        Overall: {score.overall_score}/100
                      </Badge>
                      <Badge variant="outline">
                        {score.recommendation}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(score.calculated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <Badge variant={getScoreColor(100 - score.risk_score)}>
                        {score.risk_score}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Opportunity Score:</span>
                      <Badge variant={getScoreColor(score.opportunity_score)}>
                        {score.opportunity_score}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Timing Score:</span>
                      <Badge variant={getScoreColor(score.timing_score)}>
                        {score.timing_score}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <Badge variant="secondary">
                        {score.confidence_level}%
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Key Factors
                    </h4>
                    <div className="space-y-1">
                      {score.key_factors?.slice(0, 3).map((factor, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {score.risk_factors && score.risk_factors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Factors
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {score.risk_factors.slice(0, 4).map((risk, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {risk}
                        </Badge>
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
