
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Building2,
  MapPin,
  DollarSign,
  Activity,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalysisResult {
  company_name: string;
  industry: string;
  sector: string;
  market_cap: number;
  power_usage_estimate: number;
  financial_health_score: number;
  distress_signals: string[];
  locations: any[];
  debt_to_equity: number;
  current_ratio: number;
  revenue_growth: number;
  profit_margin: number;
  ai_analysis: {
    power_consumption_reasoning: string;
    risk_assessment: string;
    investment_opportunity: string;
    key_insights: string[];
  };
}

interface AICompanyAnalyzerProps {
  onAnalysisComplete: (analysis: AIAnalysisResult) => void;
}

export function AICompanyAnalyzer({ onAnalysisComplete }: AICompanyAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const { toast } = useToast();

  const analyzeCompanyWithAI = async (company: string) => {
    if (!company.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setError(null);
    setNeedsApiKey(false);
    
    try {
      console.log('Starting AI analysis for company:', company);
      
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'ai_analyze_company',
          company_name: company.trim(),
          analysis_depth: 'comprehensive'
        }
      });

      console.log('AI Analysis response:', { data, error });

      if (error) {
        console.error('AI Analysis error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      if (data?.needsApiKey) {
        setNeedsApiKey(true);
        setError('OpenAI API key is required for AI analysis. Please configure it in the project settings.');
        toast({
          title: "API Key Required",
          description: "OpenAI API key is required for AI analysis. Please configure it in the project settings.",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.analysis) {
        console.log('AI Analysis completed:', data.analysis);
        onAnalysisComplete(data.analysis);
        setCompanyName(''); // Clear the input after successful analysis
        
        toast({
          title: "AI Analysis Complete",
          description: `Comprehensive analysis of ${company} has been completed with enhanced power usage estimates.`,
        });
      } else {
        throw new Error('No analysis data returned from the service');
      }

    } catch (error: any) {
      console.error('Error in AI analysis:', error);
      setError(error.message || 'Analysis failed');
      
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to complete AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !analyzing && companyName.trim()) {
      analyzeCompanyWithAI(companyName);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <Brain className="w-5 h-5 mr-2" />
          AI-Powered Company Analysis
        </CardTitle>
        <div className="text-sm text-blue-600">
          Analyze any company's power consumption, financial health, and investment potential
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsApiKey && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Settings className="w-4 h-4 text-orange-600 mr-2" />
              <span className="font-medium text-orange-800">API Key Required</span>
            </div>
            <p className="text-sm text-orange-700">
              OpenAI API key is required for AI analysis. Please add your OpenAI API key in the project settings to use this feature.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Error</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter company name (e.g., Tesla, Microsoft, Riot Platforms)"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={analyzing}
            />
            <Button 
              onClick={() => analyzeCompanyWithAI(companyName)}
              disabled={analyzing || !companyName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Press Enter to analyze or click the Analyze button
          </div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            AI Analysis Features
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Real-time power usage estimation</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Financial health scoring</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span>Distress signal detection</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>Investment opportunity analysis</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h5 className="font-medium text-green-800 mb-1">Try These Examples:</h5>
          <div className="flex flex-wrap gap-1">
            {['Tesla', 'Microsoft', 'Riot Platforms', 'Marathon Digital', 'Netflix'].map((example) => (
              <Badge 
                key={example}
                variant="outline" 
                className="cursor-pointer hover:bg-green-100 text-xs"
                onClick={() => !analyzing && setCompanyName(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
