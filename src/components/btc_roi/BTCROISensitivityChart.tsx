
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
        dailyProfit: roiResults.dailyNetProfit * 1.35, // Estimated impact
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
        dailyProfit: roiResults.dailyNetProfit * 0.45, // Estimated impact
        monthlyProfit: roiResults.monthlyNetProfit * 0.45,
        yearlyProfit: roiResults.yearlyNetProfit * 0.45,
        roi12Month: roiResults.roi12Month * 0.45
      }
    ];

    return scenarios;
  }, [roiResults, networkData]);

  if (!roiResults) {
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
            <p className="text-gray-500">Calculate ROI to see sensitivity analysis</p>
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
              <BarChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'roi12Month' ? `${value.toFixed(1)}%` : `$${value.toLocaleString()}`,
                    name === 'roi12Month' ? '12-Month ROI' : 'Monthly Profit'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="monthlyProfit" 
                  fill="#3b82f6" 
                  name="Monthly Profit ($)"
                />
                <Bar 
                  dataKey="roi12Month" 
                  fill="#10b981" 
                  name="12-Month ROI (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
