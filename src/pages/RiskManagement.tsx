import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, TrendingDown, BarChart3, FileText, RefreshCw } from 'lucide-react';

interface RiskMetric {
  category: string;
  current_score: number;
  threshold: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  last_updated: string;
}

interface PortfolioRisk {
  total_value: number;
  var_95: number;
  expected_shortfall: number;
  sharpe_ratio: number;
  max_drawdown: number;
  concentration_risk: number;
}

interface StressTestResult {
  scenario: string;
  impact_percentage: number;
  projected_loss: number;
  recovery_time_months: number;
}

interface RiskReport {
  executive_summary: string;
  key_risks: string[];
  recommendations: string[];
  risk_metrics: RiskMetric[];
  portfolio_risk: PortfolioRisk;
  stress_tests: StressTestResult[];
}

export default function RiskManagement() {
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();

  const generateRiskReport = async () => {
    setLoading(true);
    try {
      // Since we don't have a specific risk management edge function yet,
      // we'll simulate the data structure that would come from such a function
      const mockReport: RiskReport = {
        executive_summary: "Current portfolio risk level is moderate with some concentration concerns in the Texas energy market. Recent regulatory changes may impact near-term returns.",
        key_risks: [
          "Geographic concentration in ERCOT region (65% of portfolio)",
          "Regulatory changes affecting renewable energy incentives",
          "Market volatility in electricity pricing",
          "Counterparty credit risk with smaller energy companies",
          "Technology obsolescence risk in older power infrastructure"
        ],
        recommendations: [
          "Diversify geographic exposure to include AESO and other markets",
          "Increase allocation to regulated utilities for stability",
          "Implement hedging strategies for electricity price exposure",
          "Enhance due diligence on counterparty creditworthiness",
          "Consider technology upgrade reserves for aging assets"
        ],
        risk_metrics: [
          {
            category: "Market Risk",
            current_score: 7.2,
            threshold: 8.0,
            trend: "increasing",
            last_updated: new Date().toISOString()
          },
          {
            category: "Credit Risk",
            current_score: 5.8,
            threshold: 7.0,
            trend: "stable",
            last_updated: new Date().toISOString()
          },
          {
            category: "Operational Risk",
            current_score: 4.3,
            threshold: 6.0,
            trend: "decreasing",
            last_updated: new Date().toISOString()
          },
          {
            category: "Liquidity Risk",
            current_score: 6.1,
            threshold: 7.5,
            trend: "stable",
            last_updated: new Date().toISOString()
          },
          {
            category: "Regulatory Risk",
            current_score: 8.5,
            threshold: 8.0,
            trend: "increasing",
            last_updated: new Date().toISOString()
          }
        ],
        portfolio_risk: {
          total_value: 125000000,
          var_95: 8750000,
          expected_shortfall: 12100000,
          sharpe_ratio: 1.42,
          max_drawdown: 0.18,
          concentration_risk: 0.65
        },
        stress_tests: [
          {
            scenario: "ERCOT Grid Emergency",
            impact_percentage: -15.2,
            projected_loss: 19000000,
            recovery_time_months: 8
          },
          {
            scenario: "Renewable Energy Policy Reversal",
            impact_percentage: -22.8,
            projected_loss: 28500000,
            recovery_time_months: 14
          },
          {
            scenario: "Interest Rate Shock (+300bps)",
            impact_percentage: -12.7,
            projected_loss: 15875000,
            recovery_time_months: 6
          },
          {
            scenario: "Carbon Tax Implementation",
            impact_percentage: -8.4,
            projected_loss: 10500000,
            recovery_time_months: 4
          }
        ]
      };

      setRiskReport(mockReport);
      setLastUpdate(new Date().toLocaleString());
      
      toast({
        title: "Risk Report Generated",
        description: "Comprehensive risk analysis completed successfully",
      });
    } catch (error) {
      console.error('Error generating risk report:', error);
      toast({
        title: "Error",
        description: "Failed to generate risk report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRiskReport();
  }, []);

  const getRiskColor = (score: number, threshold: number) => {
    const percentage = (score / 10) * 100;
    if (score >= threshold) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Risk Management Dashboard
              </h1>
              <p className="text-muted-foreground">
                Comprehensive risk analytics and portfolio monitoring
              </p>
              {lastUpdate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {lastUpdate}
                </p>
              )}
            </div>
            <Button onClick={generateRiskReport} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : riskReport ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Risk Metrics</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio Risk</TabsTrigger>
              <TabsTrigger value="stress">Stress Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{riskReport.executive_summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Risks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Key Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskReport.key_risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      Risk Mitigation Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskReport.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              {/* Risk Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {riskReport.risk_metrics.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {metric.category}
                        {getTrendIcon(metric.trend)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">
                            <span className={getRiskColor(metric.current_score, metric.threshold)}>
                              {metric.current_score.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">/10</span>
                          </span>
                          <Badge variant={metric.current_score >= metric.threshold ? "destructive" : "secondary"}>
                            {metric.current_score >= metric.threshold ? "Above Threshold" : "Within Limits"}
                          </Badge>
                        </div>
                        
                        <Progress 
                          value={(metric.current_score / 10) * 100} 
                          className="h-2"
                        />
                        
                        <div className="text-xs text-muted-foreground">
                          Threshold: {metric.threshold}/10 • Trend: {metric.trend}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              {/* Portfolio Risk Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Value at Risk (95%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(riskReport.portfolio_risk.var_95)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maximum expected loss over 1 day at 95% confidence
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expected Shortfall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(riskReport.portfolio_risk.expected_shortfall)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average loss in worst 5% of scenarios
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sharpe Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {riskReport.portfolio_risk.sharpe_ratio.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Risk-adjusted return measure
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maximum Drawdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {(riskReport.portfolio_risk.max_drawdown * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Largest peak-to-trough decline
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Concentration Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {(riskReport.portfolio_risk.concentration_risk * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Largest single market exposure
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(riskReport.portfolio_risk.total_value)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current market value
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stress" className="space-y-6">
              {/* Stress Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Stress Test Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskReport.stress_tests.map((test, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{test.scenario}</h4>
                          <Badge variant={Math.abs(test.impact_percentage) > 20 ? "destructive" : "secondary"}>
                            {test.impact_percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Projected Loss</div>
                            <div className="font-semibold text-red-600">
                              {formatCurrency(test.projected_loss)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Impact</div>
                            <div className="font-semibold">
                              {test.impact_percentage.toFixed(1)}% decline
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Recovery Time</div>
                            <div className="font-semibold">
                              {test.recovery_time_months} months
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No risk data available. Click "Refresh Report" to generate analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}