import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketPortfolio } from '@/hooks/useVoltMarketPortfolio';
import { 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  BarChart3,
  Target,
  Zap,
  Brain,
  Activity,
  DollarSign,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Rocket,
  Shield,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Tooltip, Legend } from 'recharts';

interface AdvancedMetrics {
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  diversificationScore: number;
  riskScore: number;
  esgScore: number;
  liquidityScore: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const VoltMarketAdvancedPortfolio: React.FC = () => {
  const { portfolios, loading } = useVoltMarketPortfolio();
  const { toast } = useToast();
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [activeView, setActiveView] = useState('overview');

  // Mock advanced metrics calculation
  const advancedMetrics = useMemo((): AdvancedMetrics => {
    const selectedPortfolioData = portfolios.find(p => p.id === selectedPortfolio);
    if (!selectedPortfolioData) {
      return {
        totalValue: 0,
        totalReturn: 0,
        returnPercentage: 0,
        sharpeRatio: 0,
        volatility: 0,
        maxDrawdown: 0,
        diversificationScore: 0,
        riskScore: 0,
        esgScore: 0,
        liquidityScore: 0
      };
    }

    return {
      totalValue: selectedPortfolioData.total_value || 0,
      totalReturn: selectedPortfolioData.metrics?.totalReturn || 0,
      returnPercentage: selectedPortfolioData.metrics?.returnPercentage || 0,
      sharpeRatio: Math.random() * 2 + 0.5, // Mock data
      volatility: Math.random() * 30 + 10,
      maxDrawdown: Math.random() * -20,
      diversificationScore: Math.random() * 40 + 60,
      riskScore: Math.random() * 40 + 30,
      esgScore: Math.random() * 30 + 70,
      liquidityScore: Math.random() * 40 + 40
    };
  }, [portfolios, selectedPortfolio]);

  // Generate mock performance data
  useEffect(() => {
    if (selectedPortfolio) {
      const data = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: 1000000 + Math.random() * 500000 - 250000,
        benchmark: 1000000 + Math.random() * 300000 - 150000
      }));
      setPerformanceData(data);

      // Generate AI insights
      const insights = [
        "Energy sector showing strong momentum with 15% outperformance vs benchmark",
        "Recommended to increase renewable energy allocation by 12%",
        "Market volatility suggests defensive positioning in utilities",
        "ESG factors indicate strong long-term value creation potential",
        "Geopolitical risks suggest diversification into North American assets"
      ];
      setAiInsights(insights);
    }
  }, [selectedPortfolio]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const selectedPortfolioData = portfolios.find(p => p.id === selectedPortfolio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Header with AI-Powered Badge */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Advanced Portfolio Analytics
              </h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Real-time insights, risk analytics, and performance optimization for energy infrastructure investments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Real-time Analytics
            </Badge>
          </div>
        </div>

        {/* Portfolio Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolios.map((portfolio) => (
            <Card 
              key={portfolio.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPortfolio === portfolio.id
                  ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950'
                  : 'hover:shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'
              }`}
              onClick={() => setSelectedPortfolio(portfolio.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{portfolio.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {portfolio.portfolio_type}
                      </Badge>
                    </div>
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Value</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(portfolio.total_value || 0)}
                      </span>
                    </div>
                    
                    {portfolio.metrics && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Return</span>
                        <div className="flex items-center gap-1">
                          {portfolio.metrics.returnPercentage >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          )}
                          <span className={portfolio.metrics.returnPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {formatPercentage(portfolio.metrics.returnPercentage)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Progress 
                      value={Math.min(100, (portfolio.total_value || 0) / 10000000 * 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Analytics Dashboard */}
        {selectedPortfolioData && (
          <div className="space-y-8">
            {/* Quick Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                  <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatCurrency(advancedMetrics.totalValue)}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">Total Value</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatPercentage(advancedMetrics.returnPercentage)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Return</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {advancedMetrics.sharpeRatio.toFixed(2)}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">Sharpe Ratio</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {advancedMetrics.volatility.toFixed(1)}%
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300">Volatility</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 text-center">
                  <PieChart className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {advancedMetrics.diversificationScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">Diversification</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <Globe className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {advancedMetrics.esgScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">ESG Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="performance" className="text-sm">Performance</TabsTrigger>
                <TabsTrigger value="risk" className="text-sm">Risk Analysis</TabsTrigger>
                <TabsTrigger value="allocation" className="text-sm">Allocation</TabsTrigger>
                <TabsTrigger value="insights" className="text-sm">AI Insights</TabsTrigger>
                <TabsTrigger value="optimization" className="text-sm">Optimization</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Performance vs Benchmark
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
                          <Line type="monotone" dataKey="benchmark" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Risk Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Risk Score</span>
                          <Badge variant={getScoreBadgeVariant(100 - advancedMetrics.riskScore)}>
                            {(100 - advancedMetrics.riskScore).toFixed(0)}/100
                          </Badge>
                        </div>
                        <Progress value={100 - advancedMetrics.riskScore} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Liquidity Score</span>
                          <Badge variant={getScoreBadgeVariant(advancedMetrics.liquidityScore)}>
                            {advancedMetrics.liquidityScore.toFixed(0)}/100
                          </Badge>
                        </div>
                        <Progress value={advancedMetrics.liquidityScore} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">ESG Rating</span>
                          <Badge variant={getScoreBadgeVariant(advancedMetrics.esgScore)}>
                            {advancedMetrics.esgScore.toFixed(0)}/100
                          </Badge>
                        </div>
                        <Progress value={advancedMetrics.esgScore} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI-Powered Insights
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Rocket className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Increase Solar Exposure</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Apply
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium">Reduce Risk Exposure</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Apply
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Diversify Geographically</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Market Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-l-4 border-yellow-400">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Regulatory Changes</div>
                          <div className="text-yellow-700 dark:text-yellow-300">New energy policies may impact solar investments</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-400">
                        <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Market Opportunity</div>
                          <div className="text-blue-700 dark:text-blue-300">Wind energy sector showing strong momentum</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};