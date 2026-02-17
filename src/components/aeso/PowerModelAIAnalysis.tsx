import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, Lightbulb, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FacilityParams, TariffOverrides, AnnualSummary, MonthlyResult } from '@/hooks/usePowerModelCalculator';

interface Props {
  params: FacilityParams;
  tariffOverrides: TariffOverrides;
  annual: AnnualSummary | null;
  monthly: MonthlyResult[];
  breakeven: number;
  autoTrigger?: boolean;
}

interface ParsedSection {
  title: string;
  type: 'summary' | 'drivers' | 'optimization' | 'risk' | 'recommendation' | 'general';
  items: string[];
}

function parseAIResponse(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split('\n');
  let currentSection: ParsedSection | null = null;

  const classifySection = (title: string): ParsedSection['type'] => {
    const lower = title.toLowerCase();
    if (lower.includes('summary') || lower.includes('overview') || lower.includes('executive')) return 'summary';
    if (lower.includes('driver') || lower.includes('cost') || lower.includes('factor')) return 'drivers';
    if (lower.includes('optim') || lower.includes('opportunit') || lower.includes('saving') || lower.includes('recommend')) return 'optimization';
    if (lower.includes('risk') || lower.includes('concern') || lower.includes('warning') || lower.includes('caution')) return 'risk';
    if (lower.includes('action') || lower.includes('next step') || lower.includes('conclusion')) return 'recommendation';
    return 'general';
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      if (currentSection && currentSection.items.length > 0) sections.push(currentSection);
      const title = trimmed.replace(/^#{2,3}\s*/, '');
      currentSection = { title, type: classifySection(title), items: [] };
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && !currentSection) {
      if (currentSection && currentSection.items.length > 0) sections.push(currentSection);
      const title = trimmed.slice(2, -2);
      currentSection = { title, type: classifySection(title), items: [] };
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const item = trimmed.replace(/^[-*•]\s*/, '');
      if (currentSection) {
        currentSection.items.push(item);
      } else {
        currentSection = { title: 'Key Insights', type: 'summary', items: [item] };
      }
    } else {
      if (currentSection) {
        currentSection.items.push(trimmed);
      } else {
        currentSection = { title: 'Executive Summary', type: 'summary', items: [trimmed] };
      }
    }
  }
  if (currentSection && currentSection.items.length > 0) sections.push(currentSection);

  return sections;
}

const sectionConfig: Record<ParsedSection['type'], { icon: React.ReactNode; borderColor: string; bgColor: string; iconColor: string }> = {
  summary: { icon: <Lightbulb className="w-4 h-4" />, borderColor: 'border-l-emerald-500', bgColor: 'bg-emerald-500/5', iconColor: 'text-emerald-500' },
  drivers: { icon: <TrendingUp className="w-4 h-4" />, borderColor: 'border-l-amber-500', bgColor: 'bg-amber-500/5', iconColor: 'text-amber-500' },
  optimization: { icon: <Sparkles className="w-4 h-4" />, borderColor: 'border-l-blue-500', bgColor: 'bg-blue-500/5', iconColor: 'text-blue-500' },
  risk: { icon: <AlertTriangle className="w-4 h-4" />, borderColor: 'border-l-red-500', bgColor: 'bg-red-500/5', iconColor: 'text-red-500' },
  recommendation: { icon: <Shield className="w-4 h-4" />, borderColor: 'border-l-primary', bgColor: 'bg-primary/5', iconColor: 'text-primary' },
  general: { icon: <Lightbulb className="w-4 h-4" />, borderColor: 'border-l-muted-foreground', bgColor: 'bg-muted/30', iconColor: 'text-muted-foreground' },
};

export function PowerModelAIAnalysis({ params, tariffOverrides, annual, monthly, breakeven, autoTrigger }: Props) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  const generateAnalysis = useCallback(async () => {
    if (!annual) return;

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
  }, [annual, params, tariffOverrides, monthly, breakeven, toast]);

  // Auto-trigger on data load
  useEffect(() => {
    if (autoTrigger && annual && !hasAutoTriggered && !analysis && !loading) {
      setHasAutoTriggered(true);
      generateAnalysis();
    }
  }, [autoTrigger, annual, hasAutoTriggered, analysis, loading, generateAnalysis]);

  const parsedSections = analysis ? parseAIResponse(analysis) : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm">AI Cost Intelligence</CardTitle>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">Gemini</Badge>
          </div>
          <Button onClick={generateAnalysis} disabled={loading || !annual} size="sm" className="text-xs h-7">
            {loading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing...</> : <><Sparkles className="w-3 h-3 mr-1" />{analysis ? 'Regenerate' : 'Generate Analysis'}</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-xs">AI analysis will auto-generate when data loads</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-medium">Analyzing your cost model...</p>
            <p className="text-xs text-muted-foreground mt-1">Reviewing {monthly.length} months of data</p>
          </div>
        )}

        {analysis && parsedSections.length > 0 && (
          <div className="space-y-3">
            {parsedSections.map((section, i) => {
              const config = sectionConfig[section.type];
              return (
                <div key={i} className={`border-l-3 ${config.borderColor} ${config.bgColor} rounded-r-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={config.iconColor}>{config.icon}</span>
                    <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {section.items.map((item, j) => {
                      // Check if it looks like a bullet point
                      const isBullet = item.startsWith('**') || section.items.length > 2;
                      const cleaned = item.replace(/\*\*(.*?)\*\*/g, '$1');
                      return (
                        <p key={j} className={`text-xs leading-relaxed text-muted-foreground ${isBullet ? 'flex items-start gap-1.5' : ''}`}>
                          {isBullet && <span className="text-muted-foreground/50 mt-0.5 shrink-0">•</span>}
                          <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Based on your input parameters and historical AESO data. Not financial advice.
              </p>
            </div>
          </div>
        )}

        {/* Fallback if parsing fails */}
        {analysis && parsedSections.length === 0 && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {analysis}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
