import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EnhancedSignUpForm } from '@/components/EnhancedSignUpForm';
import { 
  Zap, 
  TrendingUp, 
  MapPin, 
  Brain, 
  Shield, 
  ArrowRight,
  BarChart3,
  Globe,
  Cpu,
  Building,
  Lock,
  Satellite,
  Activity,
  Target,
  AlertTriangle,
  Database,
  Eye,
  Bot,
  Bitcoin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Landing = () => {
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', { email, message });
  };

  // Enhanced chart data with more compelling numbers
  const aiGrowthData = [
    { year: '2020', aiDataCenters: 2.1, bitcoinMining: 8.5, totalDemand: 15.2 },
    { year: '2021', aiDataCenters: 3.8, bitcoinMining: 12.3, totalDemand: 22.4 },
    { year: '2022', aiDataCenters: 7.2, bitcoinMining: 15.1, totalDemand: 31.8 },
    { year: '2023', aiDataCenters: 15.4, bitcoinMining: 18.7, totalDemand: 48.9 },
    { year: '2024', aiDataCenters: 28.6, bitcoinMining: 22.1, totalDemand: 67.3 },
    { year: '2025', aiDataCenters: 45.2, bitcoinMining: 25.8, totalDemand: 89.7 },
    { year: '2026', aiDataCenters: 68.9, bitcoinMining: 29.4, totalDemand: 125.1 }
  ];

  const powerCostComparison = [
    { region: 'Rural Texas', cost: 2.8, capacity: '500MW+' },
    { region: 'Ohio Valley', cost: 3.4, capacity: '300MW+' },
    { region: 'Wyoming', cost: 3.9, capacity: '200MW+' },
    { region: 'Washington State', cost: 4.2, capacity: '400MW+' },
    { region: 'Virginia (Tier 1)', cost: 6.8, capacity: '100MW+' },
    { region: 'California Bay Area', cost: 18.4, capacity: '50MW+' }
  ];

  const bitcoinMiningReturns = [
    { hashrate: '1 EH/s', monthlyRevenue: 245000, powerCost: 108000, netProfit: 137000 },
    { hashrate: '5 EH/s', monthlyRevenue: 1225000, powerCost: 540000, netProfit: 685000 },
    { hashrate: '10 EH/s', monthlyRevenue: 2450000, powerCost: 1080000, netProfit: 1370000 },
    { hashrate: '25 EH/s', monthlyRevenue: 6125000, powerCost: 2700000, netProfit: 3425000 }
  ];

  const aiHpcDemandGrowth = [
    { quarter: 'Q1 2023', training: 45, inference: 28, hpc: 15 },
    { quarter: 'Q2 2023', training: 52, inference: 34, hpc: 18 },
    { quarter: 'Q3 2023', training: 68, inference: 41, hpc: 22 },
    { quarter: 'Q4 2023', training: 89, inference: 53, hpc: 27 },
    { quarter: 'Q1 2024', training: 124, inference: 68, hpc: 34 },
    { quarter: 'Q2 2024', training: 156, inference: 87, hpc: 41 }
  ];

  const chartConfig = {
    aiDataCenters: { label: "AI Data Centers (GW)", color: "#0EA5E9" },
    bitcoinMining: { label: "Bitcoin Mining (GW)", color: "#F59E0B" },
    totalDemand: { label: "Total Demand (GW)", color: "#10B981" },
    cost: { label: "Cost (¢/kWh)", color: "#8B5CF6" },
    training: { label: "AI Training", color: "#0EA5E9" },
    inference: { label: "AI Inference", color: "#F59E0B" },
    hpc: { label: "HPC Workloads", color: "#10B981" }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 via-electric-yellow/5 to-neon-green/10"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-br from-electric-blue via-electric-yellow to-neon-green rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-1 bg-slate-950 rounded-md flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" className="text-electric-blue">
                <path
                  fill="currentColor"
                  d="M13 0L6 12h5l-2 12 7-12h-5l2-12z"
                />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              Watt<Bitcoin className="inline w-7 h-7 mx-0" /><span className="-ml-1">yte</span>
            </h1>
            <p className="text-xs text-slate-300">Infrastructure Fund</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link to="/voltscout" className="text-slate-200 hover:text-electric-blue transition-colors">
            VoltScout
          </Link>
          <Button 
            onClick={() => setShowSignUpForm(true)}
            variant="outline" 
            className="border-electric-blue/50 text-black hover:bg-electric-blue/10 hover:text-electric-blue bg-white"
          >
            Request Access
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 border-electric-blue/50 text-electric-blue bg-electric-blue/10">
            Fund I • $25M Target • 2.0-2.5x MOIC
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Turning Power<br />into Profit
          </h1>
          
          <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Next-generation infrastructure fund acquiring power-rich land across North America 
            for AI, HPC, and crypto data centers. Backed by 675MW+ of deal experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowSignUpForm(true)}
              size="lg" 
              className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-8 py-4 text-lg"
            >
              Join Investor Room
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-500 text-black hover:bg-slate-800 hover:text-white px-8 py-4 text-lg bg-white">
              View Pipeline
            </Button>
          </div>
        </div>
      </section>

      {/* Market Opportunity with Enhanced Charts */}
      <section className="relative z-10 py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Explosive Market Opportunity
            </h2>
            <p className="text-slate-200 text-lg max-w-2xl mx-auto">
              AI revolution and Bitcoin adoption creating unprecedented demand for power infrastructure
            </p>
          </div>
          
          {/* Primary Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* AI & Bitcoin Power Demand Growth */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-electric-blue" />
                  Digital Infrastructure Power Demand
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Exponential growth in AI and Bitcoin mining power requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="aiDataCenters" 
                        stackId="1"
                        stroke="#0EA5E9" 
                        fill="#0EA5E9"
                        fillOpacity={0.6}
                        name="AI Data Centers (GW)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bitcoinMining" 
                        stackId="1"
                        stroke="#F59E0B" 
                        fill="#F59E0B"
                        fillOpacity={0.6}
                        name="Bitcoin Mining (GW)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 text-center">
                  <p className="text-electric-blue font-semibold text-sm">125+ GW total demand by 2026</p>
                </div>
              </CardContent>
            </Card>

            {/* Power Cost Arbitrage */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-electric-yellow" />
                  Power Cost Arbitrage Opportunity
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Massive cost differentials across North American markets
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={powerCostComparison} layout="horizontal" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                      <YAxis 
                        dataKey="region" 
                        type="category" 
                        stroke="#9CA3AF" 
                        width={80}
                        fontSize={11}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="cost" 
                        fill="#10B981"
                        name="Cost (¢/kWh)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 text-center">
                  <p className="text-neon-green font-semibold text-sm">85% cost savings in target markets</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Bitcoin Mining Economics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bitcoin className="w-5 h-5 text-electric-yellow" />
                  Bitcoin Mining Revenue Potential
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Monthly net profit by mining operation scale (at current BTC price)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bitcoinMiningReturns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="hashrate" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, '']}
                      />
                      <Bar 
                        dataKey="netProfit" 
                        fill="#F59E0B"
                        name="Monthly Net Profit"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 text-center">
                  <p className="text-electric-yellow font-semibold text-sm">$3.4M+ monthly profit potential at 25 EH/s</p>
                </div>
              </CardContent>
            </Card>

            {/* AI/HPC Compute Demand */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-electric-blue" />
                  AI & HPC Workload Growth
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Quarterly compute demand by workload type (PetaFLOPs)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiHpcDemandGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="quarter" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="training" 
                        stroke="#0EA5E9" 
                        strokeWidth={3}
                        name="AI Training"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="inference" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        name="AI Inference"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hpc" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="HPC Workloads"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 text-center">
                  <p className="text-electric-blue font-semibold text-sm">340% growth in AI training demand YoY</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-electric-blue mb-2">$127B</div>
              <div className="text-slate-300 text-sm">Total Addressable Market</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-electric-yellow mb-2">6.5x</div>
              <div className="text-slate-300 text-sm">Demand vs Supply Gap</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">45%</div>
              <div className="text-slate-300 text-sm">Market Share - AI/ML</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-warm-orange mb-2">25%</div>
              <div className="text-slate-300 text-sm">Market Share - Crypto</div>
            </div>
          </div>
        </div>
      </section>

      {/* Fund Overview */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Fund I Overview
            </h2>
            <p className="text-slate-200 text-lg max-w-2xl mx-auto">
              Strategic acquisition and development of undervalued power assets for premium digital infrastructure
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-electric-yellow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Target Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-electric-blue">2.0-2.5x</div>
                  <div className="text-slate-300">MOIC</div>
                  <div className="text-2xl font-bold text-electric-yellow">30-40%</div>
                  <div className="text-slate-300">Net IRR</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Current Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-neon-green">700MW+</div>
                  <div className="text-slate-300">Power Capacity</div>
                  <div className="text-2xl font-bold text-electric-blue">1,000+</div>
                  <div className="text-slate-300">Acres</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-electric-yellow to-warm-orange rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Exit Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-electric-yellow">~2 Year</div>
                  <div className="text-slate-300">Hold Period</div>
                  <div className="text-lg font-semibold text-warm-orange">Data Center Premium</div>
                  <div className="text-slate-300">Exit Value</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Our Thesis
            </h2>
            <p className="text-2xl text-slate-200 font-semibold">
              Power Arbitrage → Data Center Gold
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-electric-blue/20 rounded-lg flex items-center justify-center mt-1">
                  <Cpu className="w-4 h-4 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">AI/HPC Explosion</h3>
                  <p className="text-slate-200">Exponential demand for compute power driving unprecedented data center expansion</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-electric-yellow/20 rounded-lg flex items-center justify-center mt-1">
                  <Zap className="w-4 h-4 text-electric-yellow" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Power Scarcity</h3>
                  <p className="text-slate-200">Limited high-capacity power sites creating massive value arbitrage opportunities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-neon-green/20 rounded-lg flex items-center justify-center mt-1">
                  <Building className="w-4 h-4 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Industrial Transformation</h3>
                  <p className="text-slate-200">Converting undervalued industrial sites into premium digital infrastructure real estate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6 text-center text-white">Value Creation Model</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-200">Industrial Land</span>
                  <span className="text-neon-green font-bold">$50k/acre</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-electric-blue" />
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-200">Power Infrastructure</span>
                  <span className="text-electric-blue font-bold">+$200k/MW</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-electric-yellow" />
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-electric-blue/20 to-electric-yellow/20 rounded-lg border border-electric-blue/30">
                  <span className="text-white font-semibold">Data Center Ready</span>
                  <span className="text-electric-yellow font-bold">$500k+/acre</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VoltScout Platform */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-green rounded-lg flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-5xl font-bold text-white">
                  VoltScout
                </h2>
                <p className="text-sm text-slate-300">Powered by Advanced AI</p>
              </div>
            </div>
            <p className="text-xl text-slate-200 max-w-4xl mx-auto leading-relaxed">
              Our proprietary AI-powered energy scouting platform that autonomously discovers, analyzes, and ranks power-rich opportunities across North America in real-time
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group hover:shadow-2xl hover:shadow-electric-blue/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Globe className="w-8 h-8 text-electric-blue group-hover:scale-110 transition-transform" />
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-white">Live Infrastructure Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Real-time substation and transformer mapping across USA/Canada with 24/7 grid monitoring</p>
                <div className="text-sm text-electric-blue font-semibold">• 50,000+ substations tracked</div>
                <div className="text-sm text-electric-yellow font-semibold">• Live capacity updates</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-yellow/50 transition-all group hover:shadow-2xl hover:shadow-electric-yellow/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-8 h-8 text-electric-yellow group-hover:scale-110 transition-transform" />
                  <Badge className="bg-electric-yellow/20 text-electric-yellow text-xs">AI-Powered</Badge>
                </div>
                <CardTitle className="text-white">VoltScore™ AI Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Proprietary machine learning algorithm scoring sites 0-100 based on development potential</p>
                <div className="text-sm text-neon-green font-semibold">• 97% accuracy rate</div>
                <div className="text-sm text-electric-yellow font-semibold">• 15+ scoring factors</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group hover:shadow-2xl hover:shadow-neon-green/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Satellite className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform" />
                  <Badge className="bg-neon-green/20 text-neon-green text-xs">Computer Vision</Badge>
                </div>
                <CardTitle className="text-white">Satellite Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">AI-powered satellite analysis detecting industrial sites, cooling infrastructure, and land use patterns</p>
                <div className="text-sm text-electric-blue font-semibold">• 1m resolution imagery</div>
                <div className="text-sm text-electric-yellow font-semibold">• Monthly updates</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group hover:shadow-2xl hover:shadow-warm-orange/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Activity className="w-8 h-8 text-warm-orange group-hover:scale-110 transition-transform" />
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-white">Power Rate Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Predictive analytics for electricity pricing based on grid congestion and weather patterns</p>
                <div className="text-sm text-warm-orange font-semibold">• 3-year forecasts</div>
                <div className="text-sm text-electric-yellow font-semibold">• Climate modeling</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group hover:shadow-2xl hover:shadow-electric-blue/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="w-8 h-8 text-electric-blue group-hover:scale-110 transition-transform" />
                  <Badge className="bg-electric-blue/20 text-electric-blue text-xs">Auto-Alert</Badge>
                </div>
                <CardTitle className="text-white">Broker Auto-Alerting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Automated broker outreach and utility interconnect queue monitoring with instant notifications</p>
                <div className="text-sm text-bright-cyan font-semibold">• 2,000+ broker network</div>
                <div className="text-sm text-electric-yellow font-semibold">• Queue position tracking</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group hover:shadow-2xl hover:shadow-neon-green/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform" />
                  <Badge className="bg-neon-green/20 text-neon-green text-xs">Hyperscaler Ready</Badge>
                </div>
                <CardTitle className="text-white">Data Center Suitability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Advanced scoring for hyperscaler requirements including AWS, Google Cloud, and Meta specifications</p>
                <div className="text-sm text-electric-blue font-semibold">• Tier compliance check</div>
                <div className="text-sm text-electric-yellow font-semibold">• Latency modeling</div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Section */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-8 border border-slate-700/50 mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">Advanced Analytics Dashboard</h3>
              <p className="text-slate-200">Real-time market intelligence powered by machine learning</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Eye className="w-8 h-8 text-bright-cyan mb-3" />
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-slate-300 text-sm">Market Surveillance</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Database className="w-8 h-8 text-neon-green mb-3" />
                <div className="text-2xl font-bold text-white mb-1">50TB+</div>
                <div className="text-slate-300 text-sm">Data Processed Daily</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Bot className="w-8 h-8 text-electric-yellow mb-3" />
                <div className="text-2xl font-bold text-white mb-1">AI Scout</div>
                <div className="text-slate-300 text-sm">Autonomous Discovery</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Zap className="w-8 h-8 text-electric-blue mb-3" />
                <div className="text-2xl font-bold text-white mb-1">&lt; 1s</div>
                <div className="text-slate-300 text-sm">Alert Response Time</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/voltscout">
              <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-12 py-6 text-xl">
                Access VoltScout Platform
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <p className="text-slate-300 mt-4 text-sm">
              Exclusive access for accredited investors and fund LPs
            </p>
          </div>
        </div>
      </section>

      {/* LP Portal Access */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Lock className="w-8 h-8 text-electric-blue" />
            <h2 className="text-4xl font-bold text-white">Secure LP Portal</h2>
          </div>
          
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Exclusive access to VoltScout's internal reports, site leads, and fund investment dashboards
          </p>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-white">Portal Features</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                  <span className="text-slate-200">Real-time fund performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-yellow rounded-full"></div>
                  <span className="text-slate-200">Property acquisition reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                  <span className="text-slate-200">VoltScout analytics dashboard</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warm-orange rounded-full"></div>
                  <span className="text-slate-200">Monthly investor updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-bright-cyan rounded-full"></div>
                  <span className="text-slate-200">Exit opportunity pipeline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                  <span className="text-slate-200">Direct team communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Sign-Up Section */}
      {showSignUpForm && (
        <section className="relative z-10 py-20 px-6 bg-slate-900/80">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">
                Get Access
              </h2>
              <p className="text-slate-200 text-lg">
                Join accredited investors backing the future of digital infrastructure
              </p>
            </div>
            
            <EnhancedSignUpForm />
            
            <div className="text-center mt-6">
              <Button 
                variant="ghost" 
                onClick={() => setShowSignUpForm(false)}
                className="text-slate-400 hover:text-white"
              >
                Close Form
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-electric-blue via-electric-yellow to-neon-green rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-1 bg-slate-950 rounded-md flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" className="text-electric-blue">
                  <path
                    fill="currentColor"
                    d="M13 0L6 12h5l-2 12 7-12h-5l2-12z"
                  />
                </svg>
              </div>
            </div>
            <span className="text-3xl font-bold text-white flex items-center">
              Watt<Bitcoin className="inline w-8 h-8 mx-0" /><span className="-ml-1">yte</span>
            </span>
          </div>
          <p className="text-slate-300 mb-4">
            Turning power into profit through intelligent infrastructure investment
          </p>
          <p className="text-slate-400 text-sm">
            © 2024 WattByte Infrastructure Fund. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
