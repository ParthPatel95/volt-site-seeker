import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Sparkles, Activity, BarChart3 } from 'lucide-react';
import { CryptoAnalysisModal } from './CryptoAnalysisModal';
import { supabase } from '@/integrations/supabase/client';

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
    XMR?: CryptoData;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [cryptoDetails, setCryptoDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const cryptoList = Object.values(cryptos).filter(Boolean) as CryptoData[];

  const handleCryptoClick = async (symbol: string) => {
    setSelectedCrypto(symbol);
    setModalOpen(true);
    setLoading(true);
    setCryptoDetails(null);

    try {
      console.log('Fetching crypto details for:', symbol);
      const { data, error } = await supabase.functions.invoke('crypto-details', {
        body: { symbol }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        console.error('No data returned from function');
        throw new Error('No data returned from function');
      }

      console.log('Setting crypto details:', data);
      setCryptoDetails(data);
    } catch (error) {
      console.error('Error fetching crypto details:', error);
      // You could show a toast here
    } finally {
      setLoading(false);
    }
  };

  if (cryptoList.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Activity className="w-6 h-6 text-purple-600" />
            Mining Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-purple-600">
            <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            <p>Loading live cryptocurrency data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-purple-100/50">
        <CardTitle className="flex items-center gap-3 text-purple-800">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            <span>Mining Market Intelligence</span>
          </div>
          <Badge 
            variant="outline" 
            className="ml-auto bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none shadow-sm animate-pulse"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
        </CardTitle>
        <p className="text-sm text-purple-600/80 font-medium">
          Real-time data for top proof-of-work cryptocurrencies
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cryptoList.map((crypto) => (
            <div 
              key={crypto.symbol} 
              onClick={() => handleCryptoClick(crypto.symbol)}
              className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border border-purple-100/50 hover:shadow-md hover:scale-105 transition-all duration-300 hover:border-purple-200 cursor-pointer min-h-[160px] flex flex-col"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {crypto.symbol.substring(0, 2)}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{crypto.symbol}</h3>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    crypto.percentChange24h >= 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {crypto.percentChange24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {crypto.percentChange24h >= 0 ? '+' : ''}{crypto.percentChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">{crypto.name}</p>
                    <p className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {formatPrice(crypto.price)}
                    </p>
                  </div>
                  
                  {/* Click indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Market Cap</span>
                      <span className="font-semibold text-gray-800">{formatNumber(crypto.marketCap)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 font-medium">24h Volume</span>
                      <span className="font-semibold text-gray-800">{formatNumber(crypto.volume24h)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-purple-600/70">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Last updated: {cryptoList[0]?.lastUpdated ? new Date(cryptoList[0].lastUpdated).toLocaleTimeString() : 'Just now'}</span>
        </div>
      </CardContent>

      {/* Crypto Analysis Modal */}
      <CryptoAnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cryptoDetails={cryptoDetails}
        loading={loading}
      />
    </Card>
  );
};