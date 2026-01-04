
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
        const roi = totalInvestment > 0 ? (yearlyProfit / totalInvestment) * 100 : 0;
        
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
    if (roi >= 100) return 'bg-green-600 text-white';
    if (roi >= 50) return 'bg-green-500 text-white';
    if (roi >= 25) return 'bg-green-400 text-white';
    if (roi >= 10) return 'bg-yellow-400 text-black';
    if (roi >= 0) return 'bg-yellow-300 text-black';
    if (roi >= -25) return 'bg-red-300 text-black';
    if (roi >= -50) return 'bg-red-400 text-white';
    return 'bg-red-600 text-white';
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
            <Info className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading network data for heatmap...</p>
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
          Profitability Heatmap - ROI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">ROI Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600"></div>
              <span>&lt;-50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-400"></div>
              <span>-50% to -25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-300"></div>
              <span>-25% to 0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-300"></div>
              <span>0% to 10%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400"></div>
              <span>10% to 25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-400"></div>
              <span>25% to 50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500"></div>
              <span>50% to 100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-600"></div>
              <span>&gt;100%</span>
            </div>
          </div>

          {/* Current Settings */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Current Configuration:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700">
              <div>Hardware: {formData.units} × {formData.asicModel}</div>
              <div>Hashrate: {(formData.hashrate * formData.units).toLocaleString()} TH/s</div>
              <div>Power: {((formData.powerDraw * formData.units) / 1000).toFixed(1)} kW</div>
              <div>Pool Fee: {formData.poolFee}%</div>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Y-axis label */}
              <div className="flex">
                <div className="w-20 flex items-center justify-center text-sm font-medium transform -rotate-90 whitespace-nowrap">
                  Power Rate ($/kWh)
                </div>
                <div>
                  {/* X-axis labels */}
                  <div className="flex mb-2">
                    <div className="w-16"></div>
                    {btcPrices.map(price => (
                      <div key={price} className="w-16 text-xs text-center font-medium">
                        ${(price/1000)}k
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid */}
                  {powerRates.map(powerRate => (
                    <div key={powerRate} className="flex">
                      <div className="w-16 flex items-center justify-center text-xs font-medium">
                        ${powerRate.toFixed(3)}
                      </div>
                      {btcPrices.map(btcPrice => {
                        const dataPoint = heatmapData.find(
                          d => d.btcPrice === btcPrice && d.powerRate === powerRate
                        );
                        const roi = dataPoint?.roi || 0;
                        const dailyProfit = dataPoint?.dailyProfit || 0;
                        
                        return (
                          <div
                            key={`${btcPrice}-${powerRate}`}
                            className={`w-16 h-12 border border-gray-200 flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-105 hover:shadow-md ${getColorForROI(roi)}`}
                            title={`BTC: $${btcPrice.toLocaleString()}\nPower: $${powerRate}/kWh\nROI: ${roi.toFixed(1)}%\nDaily Profit: $${dailyProfit.toFixed(2)}`}
                          >
                            <div className="text-center">
                              <div className="text-xs font-bold">{roi.toFixed(0)}%</div>
                              <div className="text-[10px] opacity-75">${dailyProfit.toFixed(0)}/d</div>
                            </div>
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

          {/* Insights */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Heatmap Insights:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Each cell shows annual ROI % and daily profit</li>
              <li>• Green zones indicate profitable scenarios</li>
              <li>• Red zones indicate potential losses</li>
              <li>• Use this to identify optimal BTC price and power rate combinations</li>
              <li>• Consider your risk tolerance when evaluating scenarios</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
