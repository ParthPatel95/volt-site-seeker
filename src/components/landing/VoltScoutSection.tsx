
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Globe, 
  BarChart3, 
  Satellite, 
  Activity, 
  AlertTriangle, 
  Target, 
  Eye, 
  Database, 
  Bot, 
  Zap, 
  ArrowRight 
} from 'lucide-react';

export const VoltScoutSection = () => {
  return (
    <section className="relative z-10 py-12 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-watt-trust rounded-xl flex items-center justify-center mr-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-4xl font-bold text-watt-navy mb-1">
                VoltScout
              </h2>
              <p className="text-lg text-watt-navy/70 text-left">AI-Powered Energy Discovery Platform</p>
            </div>
          </div>
          <p className="text-lg text-watt-navy/70 max-w-4xl mx-auto leading-relaxed">
            Our proprietary AI-powered energy scouting platform that autonomously discovers, analyzes, and ranks power-rich opportunities across North America in real-time
          </p>
        </div>

        {/* Core Features Grid - 6 Cards Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="bg-watt-light border-gray-200 hover:border-watt-trust/50 transition-all group hover:shadow-institutional">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Globe className="w-6 h-6 text-watt-trust group-hover:scale-110 transition-transform" />
                <div className="w-2 h-2 rounded-full bg-watt-success animate-pulse"></div>
              </div>
              <CardTitle className="text-watt-navy text-lg">Live Infrastructure Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-4 text-sm leading-relaxed">
                Real-time substation and transformer mapping across USA/Canada with 24/7 grid monitoring
              </p>
              <div className="space-y-2">
                <div className="text-sm text-watt-trust font-semibold">• 50,000+ substations tracked</div>
                <div className="text-sm text-watt-bitcoin font-semibold">• Live capacity updates</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-watt-light border-gray-200 hover:border-watt-bitcoin/50 transition-all group hover:shadow-institutional">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="w-6 h-6 text-watt-bitcoin group-hover:scale-110 transition-transform" />
                <Badge className="bg-watt-bitcoin/20 text-watt-bitcoin text-xs border-watt-bitcoin/30">AI-Powered</Badge>
              </div>
              <CardTitle className="text-watt-navy text-lg">VoltScore™ AI Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-4 text-sm leading-relaxed">
                Proprietary machine learning algorithm scoring sites 0-100 based on development potential
              </p>
              <div className="space-y-2">
                <div className="text-sm text-watt-success font-semibold">• 97% accuracy rate</div>
                <div className="text-sm text-watt-bitcoin font-semibold">• 15+ scoring factors</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-watt-light border-gray-200 hover:border-watt-success/50 transition-all group hover:shadow-institutional">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Satellite className="w-6 h-6 text-watt-success group-hover:scale-110 transition-transform" />
                <Badge className="bg-watt-success/20 text-watt-success text-xs border-watt-success/30">Computer Vision</Badge>
              </div>
              <CardTitle className="text-watt-navy text-lg">Satellite Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-4 text-sm leading-relaxed">
                AI-powered satellite analysis detecting industrial sites, cooling infrastructure, and land use patterns
              </p>
              <div className="space-y-2">
                <div className="text-sm text-watt-trust font-semibold">• 1m resolution imagery</div>
                <div className="text-sm text-watt-bitcoin font-semibold">• Monthly updates</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-watt-light border-gray-200 hover:border-watt-bitcoin/50 transition-all group hover:shadow-institutional">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-6 h-6 text-watt-bitcoin group-hover:scale-110 transition-transform" />
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <CardTitle className="text-watt-navy text-lg">Power Rate Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-4 text-sm leading-relaxed">
                Predictive analytics for electricity pricing based on grid congestion and weather patterns
              </p>
              <div className="space-y-2">
                <div className="text-sm text-watt-bitcoin font-semibold">• 3-year forecasts</div>
                <div className="text-sm text-watt-bitcoin font-semibold">• Climate modeling</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-watt-light border-gray-200 hover:border-watt-trust/50 transition-all group hover:shadow-institutional">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-6 h-6 text-watt-trust group-hover:scale-110 transition-transform" />
                <Badge className="bg-watt-trust/20 text-watt-trust text-xs border-watt-trust/30">Auto-Alert</Badge>
              </div>
              <CardTitle className="text-watt-navy text-lg">Broker Auto-Alerting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-4 text-sm leading-relaxed">
                Automated broker outreach and utility interconnect queue monitoring with instant notifications
              </p>
              <div className="space-y-2">
                <div className="text-sm text-watt-trust font-semibold">• 2,000+ broker network</div>
                <div className="text-sm text-watt-bitcoin font-semibold">• Queue position tracking</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-watt-light border-gray-200 hover:border-watt-success/50 transition-all group hover:shadow-institutional">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-6 h-6 text-watt-success group-hover:scale-110 transition-transform" />
                <Badge className="bg-watt-success/20 text-watt-success text-xs border-watt-success/30">Hyperscaler Ready</Badge>
              </div>
              <CardTitle className="text-watt-navy text-lg">Data Center Suitability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-4 text-sm leading-relaxed">
                Advanced scoring for hyperscaler requirements including AWS, Google Cloud, and Meta specifications
              </p>
              <div className="space-y-2">
                <div className="text-sm text-watt-trust font-semibold">• Tier compliance check</div>
                <div className="text-sm text-watt-bitcoin font-semibold">• Latency modeling</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Section */}
        <div className="bg-watt-light rounded-3xl p-6 border border-gray-200 mb-8 shadow-institutional">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-watt-navy mb-2">Advanced Analytics Dashboard</h3>
            <p className="text-watt-navy/70">Real-time market intelligence powered by machine learning</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <Eye className="w-6 h-6 text-watt-trust mb-2" />
              <div className="text-xl font-bold text-watt-navy mb-1">24/7</div>
              <div className="text-watt-navy/70 text-xs">Market Surveillance</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <Database className="w-6 h-6 text-watt-success mb-2" />
              <div className="text-xl font-bold text-watt-navy mb-1">50TB+</div>
              <div className="text-watt-navy/70 text-xs">Data Processed Daily</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <Bot className="w-6 h-6 text-watt-bitcoin mb-2" />
              <div className="text-xl font-bold text-watt-navy mb-1">AI Scout</div>
              <div className="text-watt-navy/70 text-xs">Autonomous Discovery</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <Zap className="w-6 h-6 text-watt-trust mb-2" />
              <div className="text-xl font-bold text-watt-navy mb-1">&lt; 1s</div>
              <div className="text-watt-navy/70 text-xs">Alert Response Time</div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/app">
            <Button size="lg" className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 py-4 text-lg shadow-institutional-lg">
              Access VoltScout Platform
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-watt-navy/70 mt-3 text-sm">
            Exclusive access for accredited investors and fund LPs
          </p>
        </div>
      </div>
    </section>
  );
};