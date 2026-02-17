import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, Lightbulb, TrendingUp, AlertTriangle, Shield, CheckCircle2, BarChart3, Brain, Zap, Target } from 'lucide-react';
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

/** Extract key metrics mentioned in the AI response */
function extractQuickStats(text: string): { label: string; value: string }[] {
  const stats: { label: string; value: string }[] = [];
  // Match patterns like "8.8¢/kWh" or "$1.2M" or "23%" etc
  const patterns = [
    { regex: /(\d+\.?\d*)\s*[¢c]\/kWh/i, label: 'All-in Rate' },
    { regex: /\$(\d+\.?\d*)[Mm]/i, label: 'Annual Cost', prefix: '$', suffix: 'M' },
    { regex: /margin.*?(\d+\.?\d*)%/i, label: 'Margin' },
    { regex: /breakeven.*?\$(\d+\.?\d*)/i, label: 'Breakeven', prefix: '$' },
    { regex: /save.*?\$(\d+\.?\d*)[kK]/i, label: 'Savings', prefix: '$', suffix: 'K' },
  ];
  for (const p of patterns) {
    const m = text.match(p.regex);
    if (m) {
      const val = (p as any).prefix ? `${(p as any).prefix}${m[1]}${(p as any).suffix || ''}` : `${m[1]}${(p as any).suffix || '¢/kWh'}`;
      stats.push({ label: p.label, value: val });
      if (stats.length >= 4) break;
    }
  }
  return stats;
}

const LOADING_STAGES = [
  { label: 'Reading cost data...', icon: BarChart3, duration: 2000 },
  { label: 'Analyzing patterns...', icon: Brain, duration: 3000 },
  { label: 'Identifying optimizations...', icon: Target, duration: 2000 },
  { label: 'Generating insights...', icon: Sparkles, duration: 5000 },
];

const sectionConfig: Record<ParsedSection['type'], { icon: React.ReactNode; gradient: string; border: string; bg: string; iconBg: string }> = {
  summary: {
    icon: <Lightbulb className="w-5 h-5" />,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  drivers: {
    icon: <TrendingUp className="w-4 h-4" />,
    gradient: 'from-amber-500/10 to-transparent',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  optimization: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    gradient: 'from-blue-500/10 to-transparent',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  risk: {
    icon: <AlertTriangle className="w-4 h-4" />,
    gradient: 'from-red-500/10 to-transparent',
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    iconBg: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  recommendation: {
    icon: <Shield className="w-4 h-4" />,
    gradient: 'from-primary/10 to-transparent',
    border: 'border-primary/40',
    bg: 'bg-primary/5',
    iconBg: 'bg-primary/15 text-primary',
  },
  general: {
    icon: <Lightbulb className="w-4 h-4" />,
    gradient: 'from-muted/50 to-transparent',
    border: 'border-border',
    bg: 'bg-muted/20',
    iconBg: 'bg-muted text-muted-foreground',
  },
};

export function PowerModelAIAnalysis({ params, tariffOverrides, annual, monthly, breakeven, autoTrigger }: Props) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const generateAnalysis = useCallback(async () => {
    if (!annual) return;
    setLoading(true);
    setAnalysis(null);
    setLoadingStage(0);

    // Animate loading stages
    const stageTimers: NodeJS.Timeout[] = [];
    let elapsed = 0;
    for (let i = 1; i < LOADING_STAGES.length; i++) {
      elapsed += LOADING_STAGES[i - 1].duration;
      stageTimers.push(setTimeout(() => setLoadingStage(i), elapsed));
    }

    try {
      const { data, error } = await supabase.functions.invoke('dashboard-ai-assistant', {
        body: {
          action: 'power-model-analysis',
          powerModelData: {
            params, tariffOverrides, annual,
            monthly: monthly.map(m => ({
              month: m.month, totalHours: m.totalHours, runningHours: m.runningHours,
              curtailedHours: m.curtailedHours, uptimePercent: m.uptimePercent, mwh: m.mwh,
              avgPoolPriceRunning: m.avgPoolPriceRunning, totalDTSCharges: m.totalDTSCharges,
              totalEnergyCharges: m.totalEnergyCharges, totalFortisCharges: m.totalFortisCharges,
              totalAmountDue: m.totalAmountDue, perKwhCAD: m.perKwhCAD, perKwhUSD: m.perKwhUSD,
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
      stageTimers.forEach(clearTimeout);
      setLoading(false);
    }
  }, [annual, params, tariffOverrides, monthly, breakeven, toast]);

  useEffect(() => {
    if (autoTrigger && annual && !hasAutoTriggered && !analysis && !loading) {
      setHasAutoTriggered(true);
      generateAnalysis();
    }
  }, [autoTrigger, annual, hasAutoTriggered, analysis, loading, generateAnalysis]);

  const parsedSections = analysis ? parseAIResponse(analysis) : [];
  const summarySection = parsedSections.find(s => s.type === 'summary');
  const gridSections = parsedSections.filter(s => s.type !== 'summary' && s.type !== 'recommendation');
  const recommendationSection = parsedSections.find(s => s.type === 'recommendation');
  const quickStats = useMemo(() => analysis ? extractQuickStats(analysis) : [], [analysis]);

  return (
    <Card className="overflow-hidden border-border/60">
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI Cost Intelligence
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Gemini 2.0</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {monthly.length > 0 ? `Analyzing ${monthly.length} months of cost data` : 'Load data to begin analysis'}
              </p>
            </div>
          </div>
          <Button onClick={generateAnalysis} disabled={loading || !annual} size="sm" variant={analysis ? 'outline' : 'default'} className="text-xs h-8">
            {loading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing...</> : <><Sparkles className="w-3 h-3 mr-1" />{analysis ? 'Regenerate' : 'Generate Analysis'}</>}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Empty State */}
        {!analysis && !loading && (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto border border-primary/10">
              <Sparkles className="w-7 h-7 text-primary/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">AI Analysis Ready</p>
              <p className="text-xs text-muted-foreground mt-1">Will auto-generate when data loads, or click Generate</p>
            </div>
          </div>
        )}

        {/* Multi-Step Loading */}
        {loading && (
          <div className="py-10 space-y-6">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-pulse" />
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                  <Brain className="w-7 h-7 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              {LOADING_STAGES.map((stage, i) => {
                const StageIcon = stage.icon;
                const isActive = i === loadingStage;
                const isDone = i < loadingStage;
                return (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100' : isDone ? 'opacity-50' : 'opacity-25'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-500/15' : isActive ? 'bg-primary/15' : 'bg-muted/50'}`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <StageIcon className={`w-4 h-4 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && parsedSections.length > 0 && (
          <div className="space-y-5">
            {/* Quick Stats Pills */}
            {quickStats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                    <span className="text-xs font-bold text-foreground">{stat.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <BarChart3 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Data</span>
                  <span className="text-xs font-bold text-foreground">{monthly.length} months</span>
                </div>
              </div>
            )}

            {/* Executive Summary Hero */}
            {summarySection && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/30">
                <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 shrink-0 mt-0.5">
                      <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground mb-2">{summarySection.title}</h3>
                      <div className="space-y-2">
                        {summarySection.items.map((item, j) => (
                          <p key={j} className="text-sm leading-relaxed text-muted-foreground"
                             dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2-Column Insight Grid */}
            {gridSections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gridSections.map((section, i) => {
                  const config = sectionConfig[section.type];
                  return (
                    <div key={i} className={`rounded-xl border-l-4 ${config.border} ${config.bg} p-4 transition-all hover:shadow-sm`}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`p-1.5 rounded-lg ${config.iconBg}`}>
                          {config.icon}
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                      </div>
                      <div className="space-y-2 pl-1">
                        {section.items.map((item, j) => (
                          <div key={j} className="flex items-start gap-2 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30 mt-2 shrink-0" />
                            <p className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors"
                               dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendation Banner */}
            {recommendationSection && (
              <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/15 shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">{recommendationSection.title}</h4>
                    <div className="space-y-1.5">
                      {recommendationSection.items.map((item, j) => (
                        <p key={j} className="text-xs leading-relaxed text-muted-foreground"
                           dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="pt-3 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Analysis based on your input parameters and historical AESO data. Not financial advice.
              </p>
            </div>
          </div>
        )}

        {analysis && parsedSections.length === 0 && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {analysis}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
