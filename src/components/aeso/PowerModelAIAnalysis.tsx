import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FacilityParams, TariffOverrides, AnnualSummary, MonthlyResult } from '@/hooks/usePowerModelCalculator';

interface Props {
  params: FacilityParams;
  tariffOverrides: TariffOverrides;
  annual: AnnualSummary | null;
  monthly: MonthlyResult[];
  breakeven: number;
}

export function PowerModelAIAnalysis({ params, tariffOverrides, annual, monthly, breakeven }: Props) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    if (!annual) {
      toast({ title: 'Load data first', description: 'Load hourly data before generating AI analysis', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('dashboard-ai-assistant', {
        body: {
          action: 'power-model-analysis',
          powerModelData: {
            params,
            tariffOverrides,
            annual,
            monthly: monthly.map(m => ({
              month: m.month,
              totalHours: m.totalHours,
              runningHours: m.runningHours,
              curtailedHours: m.curtailedHours,
              uptimePercent: m.uptimePercent,
              mwh: m.mwh,
              avgPoolPriceRunning: m.avgPoolPriceRunning,
              totalDTSCharges: m.totalDTSCharges,
              totalEnergyCharges: m.totalEnergyCharges,
              totalFortisCharges: m.totalFortisCharges,
              totalAmountDue: m.totalAmountDue,
              perKwhCAD: m.perKwhCAD,
              perKwhUSD: m.perKwhUSD,
            })),
            breakeven,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.response);
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      if (msg.includes('Rate limit') || msg.includes('429')) {
        toast({ title: 'Rate limited', description: 'Please wait a moment and try again.', variant: 'destructive' });
      } else if (msg.includes('credits') || msg.includes('402')) {
        toast({ title: 'AI credits exhausted', description: 'Add credits to continue using AI analysis.', variant: 'destructive' });
      } else {
        toast({ title: 'Analysis failed', description: msg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">AI Cost Analysis</CardTitle>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">Powered by Gemini</Badge>
          </div>
          <Button onClick={generateAnalysis} disabled={loading || !annual} size="sm" className="text-xs h-7">
            {loading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing...</> : <><Sparkles className="w-3 h-3 mr-1" />Generate Analysis</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Click "Generate Analysis" to get AI-powered cost optimization insights</p>
            <p className="text-xs mt-1">Based on your actual model parameters and calculated results — no mock data</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Analyzing your cost model...</p>
          </div>
        )}

        {analysis && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {analysis.split('\n').map((line, i) => {
              if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold mt-4 mb-1">{line.slice(4)}</h3>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold mt-5 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
              if (line.startsWith('- ')) return <li key={i} className="text-xs text-muted-foreground ml-4 list-disc">{line.slice(2)}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>;
            })}
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Analysis based on your input parameters and historical AESO data. Not financial advice.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
