import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Brain, RefreshCw, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomatedInsightsPanelProps {
  dashboardId: string;
  market: string;
  timeRange: string;
}

export function AutomatedInsightsPanel({ dashboardId, market, timeRange }: AutomatedInsightsPanelProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInsights();
  }, [dashboardId, timeRange]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-insights', {
        body: { dashboardId, market, timeRange }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setInsights(data.insights);
    } catch (error: any) {
      console.error('Error loading insights:', error);
      toast({
        title: 'Failed to load insights',
        description: 'Could not generate AI insights at this time',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseInsights = (text: string) => {
    const sections = {
      summary: '',
      insights: [] as string[],
      opportunities: [] as string[],
      risks: [] as string[]
    };

    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.includes('Executive Summary')) {
        currentSection = 'summary';
      } else if (trimmed.includes('Key Insights')) {
        currentSection = 'insights';
      } else if (trimmed.includes('Trading Opportunities') || trimmed.includes('Opportunities')) {
        currentSection = 'opportunities';
      } else if (trimmed.includes('Risk Alerts') || trimmed.includes('Risks')) {
        currentSection = 'risks';
      } else if (trimmed.match(/^[-*•]\s/)) {
        const item = trimmed.replace(/^[-*•]\s/, '');
        if (currentSection === 'insights') sections.insights.push(item);
        else if (currentSection === 'opportunities') sections.opportunities.push(item);
        else if (currentSection === 'risks') sections.risks.push(item);
      } else if (currentSection === 'summary' && !trimmed.includes('**')) {
        sections.summary += (sections.summary ? ' ' : '') + trimmed;
      }
    });

    return sections;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Generating AI Insights...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  const parsed = parseInsights(insights);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Market Insights
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadInsights}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Executive Summary */}
        {parsed.summary && (
          <div className="p-3 bg-card rounded-lg border">
            <p className="text-sm text-foreground leading-relaxed">{parsed.summary}</p>
          </div>
        )}

        {/* Key Insights */}
        {parsed.insights.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4" />
              Key Insights
            </h4>
            <ul className="space-y-1.5">
              {parsed.insights.map((insight, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trading Opportunities */}
        {parsed.opportunities.length > 0 && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              Opportunities
            </h4>
            <ul className="space-y-1.5">
              {parsed.opportunities.map((opp, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Alerts */}
        {parsed.risks.length > 0 && (
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Risk Alerts
            </h4>
            <ul className="space-y-1.5">
              {parsed.risks.map((risk, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-amber-600 dark:text-amber-400">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
