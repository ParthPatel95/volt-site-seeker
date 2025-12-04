
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Search, 
  Building2, 
  TrendingDown, 
  FileText, 
  Newspaper, 
  Leaf,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function AnalysisTab() {
  const { state } = useIntelligenceHub();
  const { toast } = useToast();
  
  const [companyName, setCompanyName] = useState('');
  const [ticker, setTicker] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const handleAnalyze = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'analyze_company',
          companyName: companyName.trim(),
          ticker: ticker.trim() || undefined
        }
      });

      if (error) throw error;
      
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${companyName}`,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: "Analysis Failed",
        description: "Could not complete company analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick analyze from discovered opportunities
  const recentDistressed = state.opportunities
    .filter(o => o.type === 'distressed_company')
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Analysis Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            AI-Powered Company Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter company name..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker (Optional)</Label>
              <Input
                id="ticker"
                placeholder="e.g., AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                disabled={isAnalyzing}
              />
            </div>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !companyName.trim()}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Company
              </>
            )}
          </Button>

          {/* Quick Analyze from Discoveries */}
          {recentDistressed.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Quick analyze from discoveries:</p>
              <div className="flex flex-wrap gap-2">
                {recentDistressed.map(opp => (
                  <Button
                    key={opp.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setCompanyName(opp.name);
                      setTicker(opp.ticker || '');
                    }}
                    disabled={isAnalyzing}
                  >
                    {opp.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{analysisResult.companyName || companyName}</CardTitle>
              <Badge variant={analysisResult.distressScore > 70 ? "destructive" : "secondary"}>
                Distress Score: {analysisResult.distressScore || 'N/A'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
              <TabsList className="grid grid-cols-5 h-auto">
                <TabsTrigger value="overview" className="text-xs py-2">Overview</TabsTrigger>
                <TabsTrigger value="financial" className="text-xs py-2">Financial</TabsTrigger>
                <TabsTrigger value="news" className="text-xs py-2">News</TabsTrigger>
                <TabsTrigger value="esg" className="text-xs py-2">ESG</TabsTrigger>
                <TabsTrigger value="due" className="text-xs py-2">Due Diligence</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard 
                    label="Financial Health" 
                    value={analysisResult.financialHealth || 'Analyzing...'} 
                    icon={TrendingDown}
                    status={analysisResult.financialHealth === 'Stable' ? 'success' : 'warning'}
                  />
                  <MetricCard 
                    label="Industry" 
                    value={analysisResult.industry || 'N/A'} 
                    icon={Building2}
                  />
                  <MetricCard 
                    label="Market Cap" 
                    value={analysisResult.marketCap || 'N/A'} 
                    icon={FileText}
                  />
                  <MetricCard 
                    label="ESG Rating" 
                    value={analysisResult.esgRating || 'N/A'} 
                    icon={Leaf}
                  />
                </div>
                {analysisResult.summary && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                    <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="financial" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Financial analysis details would appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="news" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Recent news and sentiment analysis would appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="esg" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>ESG metrics and sustainability data would appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="due" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Due diligence checklist and findings would appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!analysisResult && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">AI Analysis Ready</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter a company name above to receive comprehensive AI-powered analysis including financial health, news sentiment, ESG metrics, and due diligence findings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  status?: 'success' | 'warning' | 'error';
}

function MetricCard({ label, value, icon: Icon, status }: MetricCardProps) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${status ? statusColors[status] : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
