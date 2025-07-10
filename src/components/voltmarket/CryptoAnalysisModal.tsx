import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  Globe, 
  Twitter, 
  Github, 
  FileText,
  Calendar,
  Coins,
  Activity,
  BarChart3,
  Hash
} from 'lucide-react';

interface CryptoDetails {
  symbol: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  tags: string[];
  website: string | null;
  technicalDoc: string | null;
  twitter: string | null;
  reddit: string | null;
  sourceCode: string | null;
  price: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  volumeChange24h: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  percentChange30d: number;
  percentChange60d: number;
  percentChange90d: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  platform: any;
  contractAddress: any;
  performance: any;
  dateAdded: string;
  lastUpdated: string;
  isMineable: boolean;
  fullyDilutedMarketCap: number;
  dominance: number;
}

interface CryptoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoDetails: CryptoDetails | null;
  loading: boolean;
}

const formatNumber = (num: number | null, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
};

const formatSupply = (num: number | null) => {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
};

const PercentageChange: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-600">{label}</span>
    <div className={`flex items-center gap-1 font-semibold ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{value >= 0 ? '+' : ''}{value.toFixed(2)}%</span>
    </div>
  </div>
);

export const CryptoAnalysisModal: React.FC<CryptoAnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  cryptoDetails, 
  loading 
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {cryptoDetails?.logo && (
              <img 
                src={cryptoDetails.logo} 
                alt={cryptoDetails.name} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-xl font-bold">
              {cryptoDetails?.name || 'Loading...'} ({cryptoDetails?.symbol})
            </span>
            {cryptoDetails?.marketCapRank && (
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                Rank #{cryptoDetails.marketCapRank}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-purple-600">Loading detailed analysis...</span>
          </div>
        ) : cryptoDetails ? (
          <div className="space-y-6">
            {/* Price & Market Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-700 mb-3">Price</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(cryptoDetails.price)}
                    </p>
                    <PercentageChange value={cryptoDetails.percentChange24h} label="24h Change" />
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-purple-700 mb-3">Market Data</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market Cap:</span>
                        <span className="font-semibold">{formatNumber(cryptoDetails.marketCap)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">24h Volume:</span>
                        <span className="font-semibold">{formatNumber(cryptoDetails.volume24h)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dominance:</span>
                        <span className="font-semibold">{cryptoDetails.dominance?.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-purple-700 mb-3">Supply</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Circulating:</span>
                        <span className="font-semibold">{formatSupply(cryptoDetails.circulatingSupply)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">{formatSupply(cryptoDetails.totalSupply)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max:</span>
                        <span className="font-semibold">{formatSupply(cryptoDetails.maxSupply)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Price Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <PercentageChange value={cryptoDetails.percentChange1h} label="1 Hour" />
                  <PercentageChange value={cryptoDetails.percentChange24h} label="24 Hours" />
                  <PercentageChange value={cryptoDetails.percentChange7d} label="7 Days" />
                  <PercentageChange value={cryptoDetails.percentChange30d} label="30 Days" />
                  <PercentageChange value={cryptoDetails.percentChange60d} label="60 Days" />
                  <PercentageChange value={cryptoDetails.percentChange90d} label="90 Days" />
                </div>
              </CardContent>
            </Card>

            {/* About & Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  About {cryptoDetails.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cryptoDetails.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {cryptoDetails.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {cryptoDetails.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-700">
                        {tag}
                      </Badge>
                    ))}
                    {cryptoDetails.isMineable && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        <Hash className="w-3 h-3 mr-1" />
                        Mineable
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    {cryptoDetails.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cryptoDetails.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {cryptoDetails.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cryptoDetails.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {cryptoDetails.sourceCode && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cryptoDetails.sourceCode} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Source Code
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {cryptoDetails.technicalDoc && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cryptoDetails.technicalDoc} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          Whitepaper
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-600" />
                  Technical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{cryptoDetails.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date Added:</span>
                    <span className="font-semibold">{new Date(cryptoDetails.dateAdded).toLocaleDateString()}</span>
                  </div>
                  {cryptoDetails.platform && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Platform:</span>
                      <span className="font-semibold">{cryptoDetails.platform.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-semibold">{new Date(cryptoDetails.lastUpdated).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Failed to load cryptocurrency details. Please try again.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};