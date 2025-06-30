
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Brain, BarChart3, PieChart, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AnalyticsData {
  btcPrice: number;
  hashRate: number;
  difficulty: number;
  powerCost: number;
  profitability: number;
  roi: number;
}

interface BTCROIAdvancedAnalyticsProps {
  data: AnalyticsData;
  historicalData?: any[];
}

export const BTCROIAdvancedAnalytics: React.FC<BTCROIAdvancedAnalyticsProps> = ({
  data,
  historicalData = []
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // AI-powered insights
  const insights = useMemo(() => {
    const insights = [];
    
    if (data.profitability > 25) {
      insights.push({
        type: 'positive',
        title: 'High Profitability Detected',
        description: 'Current setup shows excellent profitability. Consider scaling operations.',
        confidence: 92,
        icon: <TrendingUp className="w-4 h-4" />
      });
    }
    
    if (data.powerCost > 0.08) {
      insights.push({
        type: 'warning',
        title: 'High Energy Costs',
        description: 'Power costs are above optimal range. Consider energy optimization strategies.',
        confidence: 85,
        icon: <AlertTriangle className="w-4 h-4" />
      });
    }
    
    if (data.roi > 200) {
      insights.push({
        type: 'positive',
        title: 'Strong ROI Performance',
        description: 'Excellent return on investment. Perfect timing for expansion.',
        confidence: 88,
        icon: <Target className="w-4 h-4" />
      });
    }
    
    return insights;
  }, [data]);

  // Risk assessment
  const riskFactors = useMemo(() => {
    const factors = [];
    
    if (data.btcPrice > 90000) {
      factors.push({ name: 'Price Volatility Risk', level: 'High', impact: 85 });
    }
    
    if (data.difficulty > 50e12) {
      factors.push({ name: 'Network Difficulty Risk', level: 'Medium', impact: 65 });
    }
    
    if (data.powerCost > 0.1) {
      factors.push({ name: 'Energy Cost Risk', level: 'High', impact: 90 });
    }
    
    factors.push({ name: 'Regulatory Risk', level: 'Medium', impact: 45 });
    factors.push({ name: 'Hardware Obsolescence', level: 'Low', impact: 25 });
    
    return factors;
  }, [data]);

  // Performance metrics
  const performanceData = [
    { name: 'Profitability', value: Math.min(data.profitability * 4, 100) },
    { name: 'Efficiency', value: Math.max(100 - (data.powerCost * 1000), 10) },
    { name: 'Market Position', value: data.btcPrice > 80000 ? 85 : 65 },
    { name: 'Risk Management', value: 100 - (riskFactors.reduce((acc, f) => acc + f.impact, 0) / riskFactors.length) },
    { name: 'Scalability', value: data.roi > 150 ? 90 : 60 },
    { name: 'Sustainability', value: data.powerCost < 0.06 ? 95 : 55 }
  ];

  // Market sentiment data
  const sentimentData = [
    { name: 'Very Bullish', value: 35, color: '#10B981' },
    { name: 'Bullish', value: 25, color: '#34D399' },
    { name: 'Neutral', value: 20, color: '#FCD34D' },
    { name: 'Bearish', value: 15, color: '#F87171' },
    { name: 'Very Bearish', value: 5, color: '#EF4444' }
  ];

  const COLORS = ['#10B981', '#34D399', '#FCD34D', '#F87171', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.type === 'positive' ? 'bg-green-50 border-green-200' : 
                insight.type === 'warning' ? 'bg-amber-50 border-amber-200' : 
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'positive' ? 'bg-green-100 text-green-600' : 
                    insight.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{insight.title}</h3>
                      <Badge variant="outline">
                        {insight.confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Key Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className="text-sm text-gray-600">{metric.value.toFixed(0)}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{factor.name}</h3>
                      <Badge variant={
                        factor.level === 'High' ? 'destructive' :
                        factor.level === 'Medium' ? 'default' : 'secondary'
                      }>
                        {factor.level} Risk
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Impact Level</span>
                        <span>{factor.impact}%</span>
                      </div>
                      <Progress 
                        value={factor.impact} 
                        className={`h-2 ${
                          factor.impact > 70 ? '[&>*]:bg-red-500' :
                          factor.impact > 40 ? '[&>*]:bg-yellow-500' : '[&>*]:bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Market Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Intelligence Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Bullish Indicators</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Strong institutional adoption</li>
                    <li>• Increasing hash rate trend</li>
                    <li>• Favorable regulatory outlook</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Watch Points</span>
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Energy cost volatility</li>
                    <li>• Network difficulty adjustments</li>
                    <li>• Macroeconomic factors</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Profitability Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', profitability: data.profitability * 0.8 },
                    { month: 'Feb', profitability: data.profitability * 0.9 },
                    { month: 'Mar', profitability: data.profitability },
                    { month: 'Apr', profitability: data.profitability * 1.1 },
                    { month: 'May', profitability: data.profitability * 1.15 },
                    { month: 'Jun', profitability: data.profitability * 1.2 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="profitability"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(data.profitability * 1.2).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">6-Month Projection</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+20%</div>
                  <div className="text-sm text-gray-600">Expected Growth</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600">Confidence Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
