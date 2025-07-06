import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator,
  TrendingUp,
  TrendingDown,
  Building2,
  Zap,
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Gauge
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialMetrics {
  revenue: number;
  expenses: number;
  ebitda: number;
  cashFlow: number;
  debtToEquity: number;
  currentRatio: number;
  roi: number;
  paybackPeriod: number;
}

interface PropertyAssessment {
  marketValue: number;
  replacement_cost: number;
  condition_score: number;
  infrastructure_grade: string;
  power_efficiency: number;
  location_score: number;
  risk_factors: string[];
  opportunities: string[];
}

interface DueDiligenceReport {
  id: string;
  financial_analysis: any;
  property_assessment: any;
  risk_assessment: any;
  valuation_analysis: any;
  recommendations: string[];
  executive_summary: string;
  created_at: string;
}

interface VoltMarketAdvancedDueDiligenceProps {
  listingId: string;
  listingData: any;
}

export const VoltMarketAdvancedDueDiligence: React.FC<VoltMarketAdvancedDueDiligenceProps> = ({
  listingId,
  listingData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [report, setReport] = useState<DueDiligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Sample financial metrics (would come from actual analysis)
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    revenue: 2500000,
    expenses: 1800000,
    ebitda: 700000,
    cashFlow: 650000,
    debtToEquity: 0.35,
    currentRatio: 2.1,
    roi: 12.5,
    paybackPeriod: 8.2
  });

  // Sample property assessment
  const [propertyAssessment, setPropertyAssessment] = useState<PropertyAssessment>({
    marketValue: listingData?.asking_price || 15000000,
    replacement_cost: 18000000,
    condition_score: 8.5,
    infrastructure_grade: 'A-',
    power_efficiency: 92.3,
    location_score: 7.8,
    risk_factors: [
      'Market volatility in energy sector',
      'Regulatory changes in environmental standards',
      'Aging transmission infrastructure nearby'
    ],
    opportunities: [
      'Expansion potential on adjacent land',
      'Renewable energy integration opportunity',
      'Strategic location for energy storage'
    ]
  });

  const generateDueDiligenceReport = async () => {
    setGenerating(true);
    try {
      // Simulate AI-powered analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport: DueDiligenceReport = {
        id: `report_${Date.now()}`,
        financial_analysis: {
          profitability_score: 82,
          liquidity_score: 78,
          leverage_score: 85,
          efficiency_score: 79,
          growth_potential: 75
        },
        property_assessment: {
          structural_integrity: 90,
          power_infrastructure: 88,
          location_value: 85,
          market_position: 82,
          future_viability: 87
        },
        risk_assessment: {
          overall_risk: 'Medium',
          financial_risk: 'Low',
          operational_risk: 'Medium',
          market_risk: 'Medium',
          regulatory_risk: 'Low'
        },
        valuation_analysis: {
          fair_value: listingData?.asking_price * 0.95,
          upside_potential: 15,
          downside_protection: 8,
          confidence_level: 78
        },
        recommendations: [
          'Recommended for acquisition with minor price adjustment',
          'Consider upgrading power monitoring systems',
          'Negotiate extended due diligence period for environmental assessment',
          'Structure deal with performance-based contingencies'
        ],
        executive_summary: 'This energy infrastructure asset presents a compelling investment opportunity with strong fundamentals and manageable risk profile. The property demonstrates solid cash flow generation potential and strategic location advantages.',
        created_at: new Date().toISOString()
      };
      
      setReport(newReport);
      
      toast({
        title: "Analysis Complete",
        description: "Due diligence report has been generated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate due diligence report.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-watt-success';
      case 'medium': return 'text-watt-warning';
      case 'high': return 'text-watt-error';
      default: return 'text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-watt-success';
    if (score >= 60) return 'text-watt-warning';
    return 'text-watt-error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Advanced Due Diligence Analysis
            </CardTitle>
            <Button 
              onClick={generateDueDiligenceReport}
              disabled={generating}
              className="bg-watt-gradient hover:opacity-90"
            >
              {generating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate AI Report
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Key Metrics Cards */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-watt-success" />
                  <span className="text-sm font-medium">Market Value</span>
                </div>
                <p className="text-2xl font-bold">${(propertyAssessment.marketValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Est. current value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-watt-primary" />
                  <span className="text-sm font-medium">ROI Potential</span>
                </div>
                <p className="text-2xl font-bold">{financialMetrics.roi}%</p>
                <p className="text-xs text-muted-foreground">Annual return</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-watt-warning" />
                  <span className="text-sm font-medium">Risk Score</span>
                </div>
                <p className="text-2xl font-bold">7.2</p>
                <p className="text-xs text-muted-foreground">Medium risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-watt-secondary" />
                  <span className="text-sm font-medium">Payback</span>
                </div>
                <p className="text-2xl font-bold">{financialMetrics.paybackPeriod}y</p>
                <p className="text-xs text-muted-foreground">Investment recovery</p>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          {report && (
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{report.executive_summary}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Recommendations:</h4>
                  <ul className="space-y-1">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-watt-success mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Annual Revenue</Label>
                    <p className="text-lg font-semibold">${(financialMetrics.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">EBITDA</Label>
                    <p className="text-lg font-semibold">${(financialMetrics.ebitda / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cash Flow</Label>
                    <p className="text-lg font-semibold">${(financialMetrics.cashFlow / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Ratio</Label>
                    <p className="text-lg font-semibold">{financialMetrics.currentRatio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Ratios */}
            {report && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(report.financial_analysis).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-sm capitalize">{key.replace('_', ' ')}</Label>
                        <span className={`text-sm font-semibold ${getScoreColor(Number(value))}`}>
                          {String(value)}/100
                        </span>
                      </div>
                      <Progress value={Number(value)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="property">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Property Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Condition Score</Label>
                    <p className="text-lg font-semibold">{propertyAssessment.condition_score}/10</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Infrastructure Grade</Label>
                    <p className="text-lg font-semibold">{propertyAssessment.infrastructure_grade}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Power Efficiency</Label>
                    <p className="text-lg font-semibold">{propertyAssessment.power_efficiency}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location Score</Label>
                    <p className="text-lg font-semibold">{propertyAssessment.location_score}/10</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Scores */}
            {report && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Health Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(report.property_assessment).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-sm capitalize">{key.replace('_', ' ')}</Label>
                        <span className={`text-sm font-semibold ${getScoreColor(Number(value))}`}>
                          {String(value)}/100
                        </span>
                      </div>
                      <Progress value={Number(value)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Risk Factors & Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-watt-warning" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {propertyAssessment.risk_factors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-watt-warning mt-0.5" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-watt-success" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {propertyAssessment.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-watt-success mt-0.5" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(report.risk_assessment).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <Label className="text-sm capitalize">{key.replace('_', ' ')}</Label>
                      <Badge className={getRiskColor(value as string)}>
                        {value as string}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Mitigation Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-watt-success mt-0.5" />
                      Diversify energy portfolio to reduce market exposure
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-watt-success mt-0.5" />
                      Implement comprehensive insurance coverage
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-watt-success mt-0.5" />
                      Establish maintenance reserves for equipment upgrades
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-watt-success mt-0.5" />
                      Monitor regulatory changes and adapt accordingly
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="valuation">
          {report && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Asking Price</p>
                      <p className="text-2xl font-bold">${(listingData?.asking_price / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Fair Value</p>
                      <p className="text-2xl font-bold text-watt-primary">${(report.valuation_analysis.fair_value / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Upside Potential</p>
                      <p className="text-2xl font-bold text-watt-success">+{report.valuation_analysis.upside_potential}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge className="text-lg px-4 py-2 bg-watt-success/10 text-watt-success">
                      RECOMMENDED BUY
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Confidence Level: {report.valuation_analysis.confidence_level}%
                    </p>
                  </div>
                  <p className="text-center text-muted-foreground">
                    This asset presents a compelling investment opportunity with strong fundamentals, 
                    manageable risk profile, and attractive returns potential.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};