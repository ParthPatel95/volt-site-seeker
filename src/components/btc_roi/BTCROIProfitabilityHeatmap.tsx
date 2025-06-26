
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3, Info } from 'lucide-react';
import { BTCROIFormData, BTCNetworkData, HeatmapDataPoint } from './types/btc_roi_types';

interface BTCROIProfitabilityHeatmapProps {
  formData: BTCROIFormData;
  networkData: BTCNetworkData | null;
  mode: 'hosting' | 'self';
}

export const BTCROIProfitabilityHeatmap: React.FC<BTCROIProfitabilityHeatmapProps> = ({
  formData,
  networkData,
  mode
}) => {
  const heatmapData = useMemo(() => {
    if (!networkData) return [];

    const btcPrices = [30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000];
    const powerRates = [0.03, 0.05, 0.08, 0.10, 0.12, 0.15, 0.18, 0.20, 0.25];
    
    const data: HeatmapDataPoint[] = [];

    btcPrices.forEach(btcPrice => {
      powerRates.forEach(powerRate => {
        // Calculate daily profit for this combination
        const hashrateInHs = formData.hashrate * 1e12;
        const networkHashrate = networkData.hashrate;
        const dailyBlocks = 24 * 60 / networkData.avgBlockTime;
        
        const dailyBTCMined = (hashrateInHs / networkHashrate) * dailyBlocks * networkData.blockReward * formData.units;
        const dailyRevenue = dailyBTCMined * btcPrice;
        
        const powerKW = (formData.powerDraw * formData.units) / 1000;
        const coolingMultiplier = 1 + (formData.coolingOverhead / 100);
        const totalPowerKW = powerKW * coolingMultiplier;
        const dailyPowerCost = totalPowerKW * 24 * powerRate;
        
        const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
        const dailyProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
        
        const totalInvestment = formData.hardwareCost * formData.units;
        const yearlyProfit = dailyProfit * 365;
        const roi = (yearlyProfit / totalInvestment) * 100;
        
        data.push({
          btcPrice,
          powerRate,
          roi,
          dailyProfit
        });
      });
    });

    return data;
  }, [formData, networkData, mode]);

  const getColorForROI = (roi: number) => {
    if (roi >= 100) return 'bg-green-600';
    if (roi >= 50) return 'bg-green-500';
    if (roi >= 25) return 'bg-green-400';
    if (roi >= 10) return 'bg-yellow-400';
    if (roi >= 0) return 'bg-yellow-300';
    if (roi >= -25) return 'bg-red-300';
    if (roi >= -50) return 'bg-red-400';
    return 'bg-red-600';
  };

  if (!networkData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            Profitability Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Loading network data for heatmap...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const btcPrices = [30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000];
  const powerRates = [0.03, 0.05, 0.08, 0.10, 0.12, 0.15, 0.18, 0.20, 0.25];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5" />
          Profitability Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-2 text-sm">
            <span>ROI:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600"></div>
              <span>&lt;-50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-400"></div>
              <span>-50% to -25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-300"></div>
              <span>-25% to 0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400"></div>
              <span>0% to 10%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-400"></div>
              <span>10% to 25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500"></div>
              <span>25% to 50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-600"></div>
              <span>&gt;50%</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Y-axis label */}
              <div className="flex">
                <div className="w-20 flex items-center justify-center text-sm font-medium transform -rotate-90">
                  Power Rate ($/kWh)
                </div>
                <div>
                  {/* X-axis labels */}
                  <div className="flex mb-2">
                    <div className="w-16"></div>
                    {btcPrices.map(price => (
                      <div key={price} className="w-16 text-xs text-center">
                        ${(price/1000)}k
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid */}
                  {powerRates.map(powerRate => (
                    <div key={powerRate} className="flex">
                      <div className="w-16 flex items-center justify-center text-xs">
                        ${powerRate.toFixed(3)}
                      </div>
                      {btcPrices.map(btcPrice => {
                        const dataPoint = heatmapData.find(
                          d => d.btcPrice === btcPrice && d.powerRate === powerRate
                        );
                        return (
                          <div
                            key={`${btcPrice}-${powerRate}`}
                            className={`w-16 h-12 border border-gray-200 flex items-center justify-center text-xs font-medium text-white cursor-pointer ${getColorForROI(dataPoint?.roi || 0)}`}
                            title={`BTC: $${btcPrice.toLocaleString()}, Power: $${powerRate}/kWh, ROI: ${dataPoint?.roi.toFixed(1)}%, Daily: $${dataPoint?.dailyProfit.toFixed(2)}`}
                          >
                            {dataPoint?.roi.toFixed(0)}%
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* X-axis label */}
              <div className="text-center text-sm font-medium mt-2">
                BTC Price (USD)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
