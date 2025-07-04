import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BTCMiningROIWidget } from '@/components/landing/BTCMiningROIWidget';
import { 
  Battery, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  Search,
  DollarSign,
  Zap,
  MapPin,
  Activity,
  Globe,
  Bitcoin,
  Hash,
  Eye,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface BTCData {
  price: number;
  difficulty: number;
  hashrate: string;
}

export const VoltMarketHomepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [btcData, setBtcData] = useState<BTCData | null>(null);

  // Fetch live BTC data
  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        const response = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
        const data = await response.json();
        setBtcData({
          price: parseFloat(data.data.amount),
          difficulty: 68.5, // Simulated difficulty in TH
          hashrate: '450 EH/s' // Simulated network hashrate
        });
      } catch (error) {
        console.error('Failed to fetch BTC data:', error);
        // Fallback data
        setBtcData({
          price: 107800,
          difficulty: 68.5,
          hashrate: '450 EH/s'
        });
      }
    };

    fetchBTCData();
    const interval = setInterval(fetchBTCData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const marketStats = [
    { label: "Active Listings", value: "1,247", icon: Building2, color: "text-blue-500" },
    { label: "Total Volume", value: "$2.4B", icon: DollarSign, color: "text-green-500" },
    { label: "Active Users", value: "12,847", icon: Users, color: "text-purple-500" },
    { label: "Energy Capacity", value: "5.2 GW", icon: Zap, color: "text-yellow-500" }
  ];

  const featuredListings = [
    {
      id: 1,
      title: "Texas Data Center Site",
      location: "Houston, TX",
      capacity: "150 MW",
      price: "$12.5M",
      type: "Industrial",
      status: "active"
    },
    {
      id: 2,
      title: "Alberta Mining Facility",
      location: "Calgary, AB",
      capacity: "85 MW",
      price: "$8.2M",
      type: "Mining",
      status: "active"
    },
    {
      id: 3,
      title: "Quebec Hydro Complex",
      location: "Montreal, QC",
      capacity: "200 MW",
      price: "$18.7M",
      type: "Renewable",
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-watt-primary/5 via-watt-secondary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Live BTC Price Ticker */}
            {btcData && (
              <div className="mb-8">
                <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-200 max-w-4xl mx-auto">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="w-6 h-6 text-orange-500" />
                          <span className="font-semibold text-gray-900">BTC Price</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          ${btcData.price.toLocaleString()}
                        </div>
                        <Badge className="bg-green-100 text-green-700">Live</Badge>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Hash className="w-4 h-4" />
                            <span>Difficulty</span>
                          </div>
                          <div className="font-semibold text-gray-900">{btcData.difficulty}T</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Activity className="w-4 h-4" />
                            <span>Hashrate</span>
                          </div>
                          <div className="font-semibold text-gray-900">{btcData.hashrate}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Badge className="mb-6 bg-watt-primary/10 text-watt-primary border-watt-primary/20 hover:bg-watt-primary/20 transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Power Infrastructure Marketplace
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Power Your</span>
              <br />
              <span className="bg-watt-gradient bg-clip-text text-transparent">
                Energy Empire
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Buy, sell, and invest in power infrastructure assets. From data centers to mining facilities, 
              discover opportunities across North America's energy landscape.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search power assets, locations, or energy projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-watt-primary transition-all duration-300"
                />
                {searchQuery && (
                  <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-watt-gradient hover:opacity-90">
                    Search
                  </Button>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/voltmarket/listings">
                <Button size="lg" className="group bg-watt-gradient hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-watt-glow hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Browse Listings
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/voltmarket/create-listing">
                <Button size="lg" variant="outline" className="border-2 border-watt-primary text-watt-primary hover:bg-watt-primary hover:text-white font-semibold px-8 py-4 text-lg transition-all duration-300">
                  List Your Asset
                  <Building2 className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {marketStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* BTC Mining ROI Widget Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mining Profitability Calculator
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Calculate real-time Bitcoin mining returns with live market data and energy costs
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <BTCMiningROIWidget />
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-watt-secondary/10 text-watt-secondary border-watt-secondary/20">
              <Eye className="w-4 h-4 mr-2" />
              Featured Opportunities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Power Assets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover high-value energy infrastructure opportunities curated by our team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredListings.map((listing, index) => (
              <Card key={listing.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {listing.status}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-watt-primary">{listing.price}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-watt-primary transition-colors">
                    {listing.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Zap className="w-4 h-4" />
                      <span>{listing.capacity} Capacity</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{listing.type}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-watt-gradient hover:opacity-90 text-white group-hover:scale-105 transition-transform">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Dashboard */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Market Intelligence
            </h2>
            <p className="text-xl text-gray-600">
              Real-time insights from North America's power infrastructure market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">$43.72/MWh</div>
              <div className="text-gray-600">Avg. Power Price</div>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">+15.3%</div>
              <div className="text-gray-600">Price Growth YoY</div>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">847</div>
              <div className="text-gray-600">Active Regions</div>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">99.7%</div>
              <div className="text-gray-600">Transaction Security</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-watt-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Power Your Investment Portfolio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join the future of energy infrastructure investing with VoltMarket
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voltmarket/auth">
              <Button size="lg" className="bg-white text-watt-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl group">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/voltmarket/listings">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-watt-primary font-semibold px-8 py-4 text-lg transition-all duration-300">
                Explore Assets
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};