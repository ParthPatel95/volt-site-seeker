
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Zap, Clock, TrendingUp, Hash, Award } from 'lucide-react';
import { BTCNetworkData } from './types/btc_roi_types';

interface BTCROILiveStatsCardProps {
  networkData: BTCNetworkData | null;
}

export const BTCROILiveStatsCard: React.FC<BTCROILiveStatsCardProps> = ({ networkData }) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!networkData) {
    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-6 h-6 text-orange-500" />
            Bitcoin Network Stats
            <Badge variant="outline" className="ml-auto">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Fetching live Bitcoin network data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="w-6 h-6 text-orange-500" />
          Bitcoin Network Stats
          <Badge variant="outline" className="ml-auto text-green-600 border-green-600">
            Live • {lastUpdate.toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Bitcoin className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              ${networkData.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">BTC Price</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Hash className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {(networkData.difficulty / 1e12).toFixed(2)}T
            </div>
            <div className="text-sm text-gray-600">Difficulty</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {(networkData.hashrate / 1e18).toFixed(1)} EH/s
            </div>
            <div className="text-sm text-gray-600">Network Hashrate</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {networkData.blockReward} BTC
            </div>
            <div className="text-sm text-gray-600">Block Reward</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {networkData.avgBlockTime}m
            </div>
            <div className="text-sm text-gray-600">Avg Block Time</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <TrendingUp className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {Math.floor(networkData.nextHalvingDays)}
            </div>
            <div className="text-sm text-gray-600">Days to Halving</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
