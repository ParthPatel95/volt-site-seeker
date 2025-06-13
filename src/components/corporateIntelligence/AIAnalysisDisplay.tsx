
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
  Lightbulb,
  Target
} from 'lucide-react';
import { formatCurrency, formatPercentage, getHealthColor } from '@/utils/corporateIntelligence';

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

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResult;
}

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700">
            <Brain className="w-5 h-5 mr-2" />
            AI Analysis: {analysis.company_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.power_usage_estimate} MW
              </div>
              <p className="text-sm text-muted-foreground">AI-Estimated Power Usage</p>
            </div>
            <div className="text-center">
              <Badge className={`${getHealthColor(analysis.financial_health_score)} text-white text-lg px-3 py-1`}>
                {analysis.financial_health_score}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">Financial Health Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analysis.market_cap)}
              </div>
              <p className="text-sm text-muted-foreground">Market Capitalization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Power Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-600" />
            Power Consumption Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-700">
            {analysis.ai_analysis.power_consumption_reasoning}
          </p>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
            Financial Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold">{formatPercentage(analysis.revenue_growth)}</div>
              <p className="text-xs text-muted-foreground">Revenue Growth</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold">{formatPercentage(analysis.profit_margin)}</div>
              <p className="text-xs text-muted-foreground">Profit Margin</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold">
                {analysis.debt_to_equity ? analysis.debt_to_equity.toFixed(2) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Debt-to-Equity</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold">
                {analysis.current_ratio ? analysis.current_ratio.toFixed(2) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Current Ratio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-700 mb-4">
            {analysis.ai_analysis.risk_assessment}
          </p>
          
          {analysis.distress_signals && analysis.distress_signals.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-red-700">Identified Risk Signals:</span>
              <div className="flex flex-wrap gap-2">
                {analysis.distress_signals.map((signal, idx) => (
                  <Badge key={idx} className="bg-red-100 text-red-800 border-red-200">
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-green-600" />
            Investment Opportunity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-700">
            {analysis.ai_analysis.investment_opportunity}
          </p>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-orange-600" />
            Key AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.ai_analysis.key_insights.map((insight, idx) => (
              <div key={idx} className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Data */}
      {analysis.locations && analysis.locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Facility Locations ({analysis.locations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.locations.slice(0, 6).map((location, idx) => (
                <div key={idx} className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <Building2 className="w-4 h-4 mr-2 text-gray-600" />
                  <div>
                    <span className="text-sm font-medium">{location.city}, {location.state}</span>
                    <p className="text-xs text-muted-foreground">{location.facility_type}</p>
                  </div>
                </div>
              ))}
              {analysis.locations.length > 6 && (
                <div className="col-span-full text-center text-sm text-muted-foreground">
                  +{analysis.locations.length - 6} more locations
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
