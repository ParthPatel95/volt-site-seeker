
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { BTCROIResults, BTCNetworkData, SensitivityData } from './types/btc_roi_types';

interface BTCROISensitivityChartProps {
  roiResults: BTCROIResults | null;
  networkData: BTCNetworkData | null;
}

export const BTCROISensitivityChart: React.FC<BTCROISensitivityChartProps> = ({
  roiResults,
  networkData
}) => {
  const sensitivityData = useMemo(() => {
    if (!roiResults || !networkData) return [];

    const scenarios: SensitivityData[] = [
      {
        scenario: 'Best Case',
        btcPriceChange: 20,
        difficultyChange: -10,
        dailyProfit: roiResults.dailyNetProfit * 1.35,
        monthlyProfit: roiResults.monthlyNetProfit * 1.35,
        yearlyProfit: roiResults.yearlyNetProfit * 1.35,
        roi12Month: roiResults.roi12Month * 1.35
      },
      {
        scenario: 'Base Case',
        btcPriceChange: 0,
        difficultyChange: 0,
        dailyProfit: roiResults.dailyNetProfit,
        monthlyProfit: roiResults.monthlyNetProfit,
        yearlyProfit: roiResults.yearlyNetProfit,
        roi12Month: roiResults.roi12Month
      },
      {
        scenario: 'Worst Case',
        btcPriceChange: -20,
        difficultyChange: 20,
        dailyProfit: roiResults.dailyNetProfit * 0.45,
        monthlyProfit: roiResults.monthlyNetProfit * 0.45,
        yearlyProfit: roiResults.yearlyNetProfit * 0.45,
        roi12Month: roiResults.roi12Month * 0.45
      }
    ];

    return scenarios;
  }, [roiResults, networkData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'monthlyProfit' 
                ? `Monthly Profit: $${entry.value.toLocaleString()}`
                : `12-Month ROI: ${entry.value.toFixed(1)}%`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show chart if we have data, even if it's minimal
  const hasData = roiResults && networkData;
  
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sensitivity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Configure parameters and calculate to see sensitivity analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Sensitivity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Scenario Summary Table */}
          <div className="grid grid-cols-3 gap-4">
            {sensitivityData.map((scenario) => (
              <div 
                key={scenario.scenario}
                className={`p-4 rounded-lg border-2 ${
                  scenario.scenario === 'Best Case' ? 'bg-green-50 border-green-200' :
                  scenario.scenario === 'Base Case' ? 'bg-blue-50 border-blue-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <h3 className="font-semibold text-center mb-2">{scenario.scenario}</h3>
                <div className="text-xs text-center space-y-1">
                  <div>BTC: {scenario.btcPriceChange > 0 ? '+' : ''}{scenario.btcPriceChange}%</div>
                  <div>Difficulty: {scenario.difficultyChange > 0 ? '+' : ''}{scenario.difficultyChange}%</div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-lg font-bold">
                    {scenario.roi12Month.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">12-Month ROI</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="scenario" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="monthlyProfit" 
                  fill="#3b82f6" 
                  name="Monthly Profit ($)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="roi12Month" 
                  fill="#10b981" 
                  name="12-Month ROI (%)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Key Insights:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Best case assumes +20% BTC price and -10% difficulty adjustment</li>
              <li>• Worst case assumes -20% BTC price and +20% difficulty adjustment</li>
              <li>• Sensitivity analysis helps understand risk/reward scenarios</li>
              <li>• Consider diversification strategies based on sensitivity ranges</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
