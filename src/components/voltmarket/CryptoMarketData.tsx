import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  lastUpdated: string;
}

interface CryptoMarketDataProps {
  cryptos: {
    BTC?: CryptoData;
    ETH?: CryptoData;
    LTC?: CryptoData;
    BCH?: CryptoData;
    DOGE?: CryptoData;
  };
}

const formatNumber = (num: number, decimals = 2) => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
};

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
};

export const CryptoMarketData: React.FC<CryptoMarketDataProps> = ({ cryptos }) => {
  const cryptoList = Object.values(cryptos).filter(Boolean) as CryptoData[];

  if (cryptoList.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle>Cryptocurrency Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Loading cryptocurrency data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Top Mined Cryptocurrencies</span>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Live Market Data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cryptoList.map((crypto) => (
            <div key={crypto.symbol} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{crypto.symbol}</h3>
                <div className={`flex items-center gap-1 ${crypto.percentChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {crypto.percentChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {crypto.percentChange24h >= 0 ? '+' : ''}{crypto.percentChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">{crypto.name}</p>
                  <p className="text-xl font-bold">{formatPrice(crypto.price)}</p>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap:</span>
                    <span className="font-medium">{formatNumber(crypto.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">24h Volume:</span>
                    <span className="font-medium">{formatNumber(crypto.volume24h)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {cryptoList[0]?.lastUpdated ? new Date(cryptoList[0].lastUpdated).toLocaleTimeString() : 'Just now'}
        </div>
      </CardContent>
    </Card>
  );
};