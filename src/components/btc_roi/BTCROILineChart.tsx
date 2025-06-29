
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
        cumulativeProfit: cumulativeProfit - roiResults.totalInvestment,
        cumulativeBTC,
        breakEvenLine: 0,
        investment: month === 0 ? -roiResults.totalInvestment : -roiResults.totalInvestment,
        netPosition: cumulativeProfit - roiResults.totalInvestment
      });
    }

    return data;
  }, [roiResults]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`Month ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'cumulativeProfit') {
              return (
                <p key={index} style={{ color: entry.color }}>
                  Net Position: ${entry.value.toLocaleString()}
                </p>
              );
            }
            if (entry.dataKey === 'cumulativeBTC') {
              return (
                <p key={index} style={{ color: entry.color }}>
                  Total BTC: {entry.value.toFixed(4)}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

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
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'USD ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Break-even line */}
              <Line
                type="monotone"
                dataKey="breakEvenLine"
                stroke="#6b7280"
                strokeDasharray="5 5"
                dot={false}
                name="Break-even Line"
                strokeWidth={2}
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
                strokeDasharray="8 4"
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

        {/* Timeline Insights */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Timeline Analysis:</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <p>• Initial investment: ${roiResults.totalInvestment.toLocaleString()}</p>
            <p>• Monthly net profit: ${roiResults.monthlyNetProfit.toLocaleString()}</p>
            <p>• Break-even occurs at month {Math.ceil(roiResults.breakEvenDays / 30)}</p>
            <p>• 18-month projected profit: ${(roiResults.yearlyNetProfit * 1.5).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
