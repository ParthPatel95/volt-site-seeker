
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { BTCROIResults } from './types/btc_roi_types';

interface BTCROILineChartProps {
  roiResults: BTCROIResults | null;
}

export const BTCROILineChart: React.FC<BTCROILineChartProps> = ({ roiResults }) => {
  const chartData = useMemo(() => {
    if (!roiResults) return [];

    const months = 18;
    const data = [];
    let cumulativeProfit = 0;
    let cumulativeBTC = 0;

    for (let month = 0; month <= months; month++) {
      if (month > 0) {
        cumulativeProfit += roiResults.monthlyNetProfit;
        cumulativeBTC += roiResults.dailyBTCMined * 30;
      }

      data.push({
        month,
        cumulativeProfit: cumulativeProfit - roiResults.totalInvestment, // Net after investment
        cumulativeBTC,
        breakEvenLine: 0,
        investment: month === 0 ? -roiResults.totalInvestment : -roiResults.totalInvestment
      });
    }

    return data;
  }, [roiResults]);

  if (!roiResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            ROI Timeline Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Calculate ROI to see timeline projection</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          ROI Timeline Chart (18 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'USD ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'cumulativeBTC') {
                    return [`${value.toFixed(4)} BTC`, 'Cumulative BTC Mined'];
                  }
                  return [`$${value.toLocaleString()}`, name];
                }}
                labelFormatter={(month) => `Month ${month}`}
              />
              <Legend />
              
              {/* Break-even line */}
              <Line
                type="monotone"
                dataKey="breakEvenLine"
                stroke="#6b7280"
                strokeDasharray="5 5"
                dot={false}
                name="Break-even Line"
              />
              
              {/* Cumulative profit line */}
              <Line
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Net Cumulative Profit"
              />
              
              {/* Investment line (initial cost) */}
              <Line
                type="monotone"
                dataKey="investment"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Initial Investment"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {roiResults.breakEvenDays.toFixed(0)} days
            </div>
            <div className="text-sm text-gray-600">Break-even Point</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              ${(roiResults.yearlyNetProfit * 1.5).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">18-Month Profit</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {((roiResults.yearlyNetProfit * 1.5 / roiResults.totalInvestment) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">18-Month ROI</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
