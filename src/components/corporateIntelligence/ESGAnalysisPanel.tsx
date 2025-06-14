
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Shield, Calendar } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ESGScore {
  id: string;
  company_id: string;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  overall_esg_score: number;
  carbon_footprint_mt: number;
  renewable_energy_percent: number;
  sustainability_commitments: string[];
  regulatory_compliance_score: number;
  green_transition_opportunities: string[];
  assessment_date: string;
  companies?: {
    name: string;
    industry: string;
  };
}

export function ESGAnalysisPanel() {
  const [esgScores, setEsgScores] = useState<ESGScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadESGScores();
  }, []);

  const loadESGScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('esg_scores')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      setEsgScores(data || []);
    } catch (error) {
      console.error('Error loading ESG scores:', error);
      toast({
        title: "Error",
        description: "Failed to load ESG scores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeESG = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze ESG scores",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'analyze_esg_scores',
          company_name: companyName.trim()
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "ESG Analysis Complete",
          description: `Analyzed ESG scores for ${companyName}`,
        });
        loadESGScores();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error analyzing ESG:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze ESG scores",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getESGColor = (score: number) => {
    if (score >= 70) return 'default';
    if (score >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            ESG Analysis
          </h2>
          <p className="text-muted-foreground">
            Environmental, Social, and Governance scoring and sustainability analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze ESG Performance</CardTitle>
          <CardDescription>
            Comprehensive ESG scoring and sustainability assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeESG()}
            />
            <Button onClick={analyzeESG} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze ESG'}
              <Leaf className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading ESG scores...</p>
        </div>
      ) : esgScores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No ESG Analyses
            </h3>
            <p className="text-muted-foreground">
              Analyze a company's ESG performance to see sustainability scores
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {esgScores.slice(0, 10).map((esg) => (
            <Card key={esg.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {esg.companies?.name || 'Unknown Company'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getESGColor(esg.overall_esg_score)}>
                        Overall ESG: {esg.overall_esg_score}/100
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(esg.assessment_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">ESG Score Breakdown</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={[
                        {
                          subject: 'Environmental',
                          score: esg.environmental_score,
                          fullMark: 100,
                        },
                        {
                          subject: 'Social',
                          score: esg.social_score,
                          fullMark: 100,
                        },
                        {
                          subject: 'Governance',
                          score: esg.governance_score,
                          fullMark: 100,
                        },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="ESG Score"
                          dataKey="score"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Environmental</span>
                        </div>
                        <Badge variant={getESGColor(esg.environmental_score)}>
                          {esg.environmental_score}/100
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Social</span>
                        </div>
                        <Badge variant={getESGColor(esg.social_score)}>
                          {esg.social_score}/100
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">Governance</span>
                        </div>
                        <Badge variant={getESGColor(esg.governance_score)}>
                          {esg.governance_score}/100
                        </Badge>
                      </div>
                    </div>

                    {(esg.carbon_footprint_mt || esg.renewable_energy_percent) && (
                      <div>
                        <h4 className="font-medium mb-2">Environmental Metrics</h4>
                        <div className="space-y-1 text-sm">
                          {esg.carbon_footprint_mt && (
                            <div className="flex justify-between">
                              <span>Carbon Footprint:</span>
                              <span className="text-muted-foreground">{esg.carbon_footprint_mt} MT CO2</span>
                            </div>
                          )}
                          {esg.renewable_energy_percent && (
                            <div className="flex justify-between">
                              <span>Renewable Energy:</span>
                              <span className="text-muted-foreground">{esg.renewable_energy_percent}%</span>
                            </div>
                          )}
                          {esg.regulatory_compliance_score && (
                            <div className="flex justify-between">
                              <span>Compliance Score:</span>
                              <span className="text-muted-foreground">{esg.regulatory_compliance_score}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {esg.sustainability_commitments && esg.sustainability_commitments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Sustainability Commitments</h4>
                    <div className="flex flex-wrap gap-1">
                      {esg.sustainability_commitments.slice(0, 6).map((commitment, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {commitment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {esg.green_transition_opportunities && esg.green_transition_opportunities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Green Transition Opportunities</h4>
                    <div className="space-y-1">
                      {esg.green_transition_opportunities.slice(0, 3).map((opportunity, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {opportunity}
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
