import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VoltMarketHostingCalculator } from './VoltMarketHostingCalculator';
import { VoltMarketEnergyData } from './VoltMarketEnergyData';
import { CryptoMarketData } from './CryptoMarketData';
import { supabase } from '@/integrations/supabase/client';
import { 
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
  BarChart3,
  Target,
  Bolt,
  Factory
} from 'lucide-react';

interface BTCData {
  price: number;
  difficulty: number;
  hashrate: string;
}

interface CryptoData {
  cryptos: {
    BTC?: any;
    ETH?: any; 
    LTC?: any;
    BCH?: any;
    DOGE?: any;
    XMR?: any;
  };
}

export const VoltMarketHomepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [btcData, setBtcData] = useState<BTCData | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);

  // Fetch live BTC data
  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        // Use our secure edge function to fetch BTC data from CoinMarketCap
        const { data, error } = await supabase.functions.invoke('fetch-btc-data');
        
        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }
        
        setBtcData({
          price: data.price,
          difficulty: data.difficulty,
          hashrate: data.hashrate
        });
        
        // Set crypto data for the new component
        setCryptoData({
          cryptos: data.cryptos || {}
        });
      } catch (error) {
        // Only log error once to avoid spam, use fallback data
        if (!btcData) {
          console.log('Using fallback BTC data due to API issues');
          setBtcData({
            price: 107800,
            difficulty: 68.5,
            hashrate: '450 EH/s'
          });
        }
      }
    };

    fetchBTCData();
    const interval = setInterval(fetchBTCData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const miningIntelligence = [
    { label: "BTC Hash Rate", value: "785 EH/s", icon: Hash, color: "text-orange-500" },
    { label: "Mining Revenue", value: "$42.3M", icon: DollarSign, color: "text-green-500" },
    { label: "Active Miners", value: "2,847", icon: Users, color: "text-purple-500" },
    { label: "Network Difficulty", value: "101.7T", icon: Zap, color: "text-blue-500" }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-background">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-watt-gradient opacity-5" />
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">

            <div className="space-y-8">
              <Badge className="bg-watt-primary/10 text-watt-primary border-watt-primary/20 hover:bg-watt-primary/20 transition-all duration-300 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Global Energy Infrastructure Marketplace
              </Badge>

              <div className="space-y-6 relative z-10">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-gray-900 block">GridBazaar</span>
                  <span className="text-watt-primary block mt-2">
                    Energy Infrastructure
                  </span>
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  The world's most advanced energy infrastructure marketplace with real-time analytics and AI-powered insights. 
                  Join the revolution in energy asset trading.
                </p>
              </div>

              {/* Enhanced Search Bar */}
              <div className="max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-watt-gradient rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl border-2 border-gray-200 hover:border-watt-primary/30 transition-all duration-300 shadow-lg">
                    <div className="flex items-center p-2">
                      <Search className="ml-4 text-gray-400 w-6 h-6" />
                      <Input
                        placeholder="Search power assets, locations, mining facilities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-0 text-lg px-4 py-4 focus:ring-0 bg-transparent"
                      />
                      {searchQuery && (
                        <Button className="mr-2 bg-watt-gradient hover:opacity-90 px-6 py-3 rounded-xl">
                          Search
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/voltmarket/listings">
                  <Button size="lg" className="group bg-watt-gradient hover:opacity-90 font-semibold px-10 py-4 text-lg shadow-watt-glow hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                    Explore Marketplace
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/voltmarket/create-listing">
                  <Button size="lg" variant="outline" className="border-2 border-watt-primary text-watt-primary hover:bg-watt-primary hover:text-primary-foreground font-semibold px-10 py-4 text-lg transition-all duration-300 rounded-2xl">
                    List Your Asset
                    <Building2 className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Mining Market Intelligence */}
              {cryptoData && (
                <div className="max-w-6xl mx-auto pt-8">
                  <CryptoMarketData cryptos={cryptoData.cryptos} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why GridBazaar Leads */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
              <BarChart3 className="w-4 h-4 mr-2" />
              Market Leadership
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why GridBazaar
              <span className="text-blue-600 block">
                Leads the Market
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The first and only marketplace built specifically for energy infrastructure professionals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                {
                  title: "Industry-First Real-Time Integration",
                  description: "Only platform with live AESO, ERCOT, and energy market data integration for instant pricing and market conditions.",
                  icon: "📊"
                },
                {
                  title: "Most Advanced Mining Economics",
                  description: "Comprehensive ROI calculations with real-time difficulty adjustments, energy costs, and profitability forecasting.",
                  icon: "⚖️"
                },
                {
                  title: "Specialized Energy Focus",
                  description: "Purpose-built for energy infrastructure, not generic real estate. Every feature designed for energy professionals.",
                  icon: "🎯"
                },
                {
                  title: "Professional-Grade Analytics",
                  description: "Institutional-level analysis tools with risk assessment, ESG compliance, and portfolio optimization.",
                  icon: "📈"
                }
              ].map((advantage, index) => (
                <div key={index} className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{advantage.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{advantage.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 rounded-3xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-watt-primary to-watt-secondary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-5xl">👑</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Market Leadership</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  GridBazaar processes over $2B in energy infrastructure opportunities with 99.9% uptime and enterprise-grade security.
                </p>
                <Badge className="bg-gradient-to-r from-watt-primary to-watt-secondary text-white px-6 py-2 text-lg">
                  #1 Energy Infrastructure Platform
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-100 text-green-700 border-green-200">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Opportunity
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Massive Market
              <span className="text-green-600 block">
                Opportunity
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The global energy infrastructure market represents unprecedented investment opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                value: "$2.8T",
                label: "Global Energy Infrastructure Market",
                description: "Total addressable market size",
                trend: "+8.2% CAGR",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                value: "$890B",
                label: "Annual Energy Investment",
                description: "Yearly capital deployment",
                trend: "+12% YoY",
                gradient: "from-green-500 to-green-600"
              },
              {
                value: "450GW",
                label: "Renewable Capacity Growth",
                description: "New capacity needed by 2030",
                trend: "+15% annually",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                value: "$1.2T",
                label: "Mining Infrastructure Value",
                description: "Bitcoin mining market cap",
                trend: "+45% growth",
                gradient: "from-orange-500 to-orange-600"
              }
            ].map((stat, index) => (
              <Card key={index} className="group text-center p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-lg">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                <div className="text-sm text-gray-500 mb-4">{stat.description}</div>
                <Badge className="bg-green-50 text-green-600 border-green-200">
                  {stat.trend}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mining Analytics & Energy Data Section */}
      <section className="py-20 bg-gradient-to-br from-watt-light/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-watt-primary/10 text-watt-primary border-watt-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Live Analytics
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Mining Economics &
              <span className="text-watt-secondary block">
                Market Intelligence
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time profitability calculations and energy market data from North America's largest power grids
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-watt-glow border border-watt-primary/10">
              <VoltMarketHostingCalculator />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-watt-glow border border-watt-success/10">
              <VoltMarketEnergyData />
            </div>
          </div>
        </div>
      </section>


      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-watt-secondary/10 text-watt-secondary border-watt-secondary/20">
              <Target className="w-4 h-4 mr-2" />
              Advanced Technology Stack
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Industry-Leading
              <span className="text-watt-accent block">
                Technology
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most sophisticated technology powering the energy infrastructure marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "AI-Powered Analysis",
                description: "Advanced machine learning algorithms for asset valuation and risk assessment",
                features: ["Real-time market analysis", "Predictive modeling", "Risk scoring"],
                icon: "🧠",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                title: "Real-Time Energy Data",
                description: "Live integration with AESO, ERCOT, and other energy market operators",
                features: ["Live pricing feeds", "Market conditions", "Grid analytics"],
                icon: "⚡",
                gradient: "from-yellow-500 to-orange-600"
              },
              {
                title: "Due Diligence Automation",
                description: "Comprehensive automated analysis and documentation workflows",
                features: ["Document verification", "Compliance checks", "Risk reports"],
                icon: "📋",
                gradient: "from-green-500 to-emerald-600"
              },
              {
                title: "Enterprise Security",
                description: "Bank-grade security with advanced encryption and compliance frameworks",
                features: ["Multi-factor auth", "Encrypted transactions", "Audit trails"],
                icon: "🛡️",
                gradient: "from-red-500 to-pink-600"
              }
            ].map((tech, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg">
                <div className="absolute inset-0 bg-watt-gradient opacity-0 group-hover:opacity-5 transition-opacity rounded-lg"></div>
                <CardContent className="p-8 text-center relative">
                  <div className={`w-20 h-20 bg-gradient-to-br ${tech.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-3xl">{tech.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-watt-primary transition-colors">
                    {tech.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {tech.description}
                  </p>
                  <div className="space-y-2">
                    {tech.features.map((feature, i) => (
                      <div key={i} className="flex items-center justify-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>




      {/* Platform Features Section */}
      <section className="py-20 bg-gradient-to-br from-background to-watt-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-watt-accent/10 text-watt-accent border-watt-accent/20">
              <Bolt className="w-4 h-4 mr-2" />
              Professional Tools
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Professional-Grade
              <span className="text-watt-primary block">
                Tools & Analytics
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From discovery to transaction, GridBazaar provides comprehensive tools for energy infrastructure investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-Time Analytics */}
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-watt-success/5 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-watt-success/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-watt-success" />
                </div>
                <CardTitle className="text-xl group-hover:text-watt-success transition-colors">
                  Real-Time Market Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Live energy pricing from AESO, ERCOT, and global markets. Track renewable generation, demand patterns, and price volatility.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-watt-success/10 text-watt-success border-watt-success/20 text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Updates
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                    Global Coverage
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mining Economics */}
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-watt-primary/5 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-watt-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bitcoin className="w-6 h-6 text-watt-primary" />
                </div>
                <CardTitle className="text-xl group-hover:text-watt-primary transition-colors">
                  Mining Profitability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Advanced calculators for hosting vs self-mining economics. Real-time BTC pricing, difficulty adjustments, and ROI projections.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-watt-primary/10 text-watt-primary border-watt-primary/20 text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    ROI Analysis
                  </Badge>
                  <Badge className="bg-green-50 text-green-600 border-green-200 text-xs">
                    Live BTC Data
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Asset Discovery */}
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-watt-secondary/5 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-watt-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-watt-secondary" />
                </div>
                <CardTitle className="text-xl group-hover:text-watt-secondary transition-colors">
                  Asset Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive database of power infrastructure. From data centers to renewable facilities, find the perfect investment opportunity.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-watt-secondary/10 text-watt-secondary border-watt-secondary/20 text-xs">
                    <Building2 className="w-3 h-3 mr-1" />
                    1,247 Assets
                  </Badge>
                  <Badge className="bg-purple-50 text-purple-600 border-purple-200 text-xs">
                    Global Reach
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Due Diligence */}
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-watt-accent/5 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-watt-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-watt-accent" />
                </div>
                <CardTitle className="text-xl group-hover:text-watt-accent transition-colors">
                  Expert Due Diligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Professional analysis and verification services. Technical assessments, financial modeling, and risk evaluation by industry experts.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-watt-accent/10 text-watt-accent border-watt-accent/20 text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    Expert Team
                  </Badge>
                  <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                    Verified Reports
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Secure Transactions */}
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-green-50/50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                  Secure Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Enterprise-grade security for high-value transactions. Escrow services, legal documentation, and compliance management.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Bank-Grade Security
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                    $2.4B Volume
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Management */}
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                  Portfolio Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI-powered portfolio analysis and optimization. Track performance, manage risk, and identify new opportunities across your energy assets.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                  <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs">
                    Smart Analytics
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-watt-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Join the Revolution
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Ready to Transform
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Your Portfolio?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connect with verified energy professionals and access the most advanced marketplace for energy infrastructure assets
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link to="/voltmarket/auth">
                <Button size="lg" className="group bg-white text-watt-primary hover:bg-gray-100 font-bold px-10 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl rounded-2xl">
                  Start Investing Today
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/voltmarket/listings">
                <Button size="lg" variant="outline" className="border-2 border-white hover:bg-white hover:text-watt-primary backdrop-blur-sm font-bold px-10 py-4 text-lg transition-all duration-300 rounded-2xl">
                  Explore Marketplace
                  <Eye className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};