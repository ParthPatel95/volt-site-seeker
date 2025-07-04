import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  BarChart3,
  MessageSquare,
  Search,
  DollarSign,
  Award,
  PlayCircle,
  MapPin,
  Calculator,
  Clock,
  Eye,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const VoltMarketEnhancedLanding: React.FC = () => {
  const [countUpStats, setCountUpStats] = useState({
    capacity: 0,
    listings: 0,
    users: 0,
    markets: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    benefits: false,
    testimonials: false
  });

  // Animated counters
  useEffect(() => {
    const timer = setTimeout(() => {
      setCountUpStats({
        capacity: 2.5,
        listings: 150,
        users: 500,
        markets: 12
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target.getAttribute('data-section');
            if (target) {
              setIsVisible(prev => ({ ...prev, [target]: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-section]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Premium Listings",
      description: "Browse verified industrial sites, data centers, and power infrastructure with detailed specifications",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Verified Network",
      description: "Connect with pre-screened buyers and sellers through our rigorous verification process",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "End-to-end encrypted messaging, secure document sharing, and NDA-protected transactions",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Access real-time market data, pricing analytics, and investment insights",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description: "Instant messaging with read receipts, file sharing, and video call integration",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Award,
      title: "Trust & Reviews",
      description: "Comprehensive rating system with verified transaction reviews and badges",
      color: "from-yellow-500 to-yellow-600"
    }
  ];

  const benefits = [
    "List sites for sale or lease",
    "Find hosting opportunities", 
    "Connect with equipment vendors",
    "Secure document sharing",
    "Real-time messaging & notifications",
    "Advanced market analytics",
    "Identity verification system",
    "Payment processing integration"
  ];

  const stats = [
    { number: countUpStats.capacity, label: "Total Capacity Listed", suffix: "GW+" },
    { number: countUpStats.listings, label: "Active Listings", suffix: "+" },
    { number: countUpStats.users, label: "Verified Users", suffix: "+" },
    { number: countUpStats.markets, label: "Markets Served", suffix: "" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "DataCenter Ventures",
      quote: "VoltMarket transformed how we find and evaluate data center opportunities. The verification system gives us confidence in every deal.",
      rating: 5,
      avatar: "SJ",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150"
    },
    {
      name: "Michael Chen",
      company: "Industrial Power Solutions",
      quote: "The real-time analytics and market intelligence features help us make informed investment decisions quickly.",
      rating: 5,
      avatar: "MC",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      name: "Emma Rodriguez",
      company: "Mining Operations LLC",
      quote: "Best platform for connecting with verified power infrastructure providers. The secure messaging is a game-changer.",
      rating: 5,
      avatar: "ER",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  const recentActivity = [
    { action: "New listing", location: "Texas", time: "2 min ago", type: "success" },
    { action: "Deal closed", location: "California", time: "5 min ago", type: "info" },
    { action: "User verified", location: "New York", time: "8 min ago", type: "success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px] animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-blue-800/90" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" data-section="hero">
          <div className={`transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Animated Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Zap className="w-24 h-24 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 w-24 h-24 bg-yellow-400/30 rounded-full animate-ping" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
              </div>
            </div>
            
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
              <Globe className="w-4 h-4 mr-2" />
              Powering the Future of Energy Infrastructure
            </Badge>
            
            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent animate-pulse">
                VoltMarket
              </span>
            </h1>
            
            <p className="text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              The world's premier marketplace for power infrastructure, industrial sites, and energy equipment. 
              Connect with verified professionals and access exclusive opportunities in the energy sector.
            </p>
            
            {/* Interactive Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for sites, hosting, equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-0 rounded-2xl focus:bg-white transition-all duration-300"
                />
                {searchQuery && (
                  <Link to={`/voltmarket/search?q=${encodeURIComponent(searchQuery)}`}>
                    <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Search
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/voltmarket/home">
                <Button size="lg" className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/voltmarket/auth">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-4xl font-bold text-white mb-2">
                    {typeof stat.number === 'number' && stat.number > 0 ? (
                      <span className="inline-block animate-pulse">
                        {stat.number.toFixed(stat.suffix === 'GW+' ? 1 : 0)}{stat.suffix}
                      </span>
                    ) : (
                      <span>0{stat.suffix}</span>
                    )}
                  </div>
                  <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Live Activity Feed */}
            <div className="mt-12 max-w-md mx-auto">
              <h3 className="text-white/80 text-sm font-medium mb-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                Live Activity
              </h3>
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-white/70 text-sm flex items-center justify-between animate-fade-in" style={{ animationDelay: `${index * 0.5}s` }}>
                    <span>{activity.action} in {activity.location}</span>
                    <span className="text-white/50">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60" />
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="py-24 bg-white" data-section="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-blue-100 text-blue-600 hover:bg-blue-200">
              <Star className="w-4 h-4 mr-2" />
              Premium Features
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for Energy Infrastructure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools and features designed specifically for energy professionals and infrastructure investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 0.1}s` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardHeader className="text-center pb-4 relative">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Benefits Section */}
      <div className="py-24 bg-gradient-to-r from-gray-50 to-blue-50" data-section="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible.benefits ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-600 hover:bg-purple-200">
                <TrendingUp className="w-4 h-4 mr-2" />
                Built for Professionals
              </Badge>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Accelerate Your Energy Infrastructure Deals
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're buying, selling, or leasing energy infrastructure, 
                VoltMarket provides the tools, network, and intelligence you need to close deals faster and more securely.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="p-1 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors group-hover:scale-110 duration-300">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`relative transition-all duration-1000 ${isVisible.benefits ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 relative">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Calculator className="w-6 h-6 mr-2" />
                    ROI Calculator Preview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-white/80">
                      <span>Investment:</span>
                      <span className="font-semibold text-yellow-400">$2.5M</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Expected ROI:</span>
                      <span className="font-semibold text-green-400">18.5%</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Payback Period:</span>
                      <span className="font-semibold text-blue-300">3.2 years</span>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <Link to="/voltmarket/auth">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 transition-all duration-300 transform hover:scale-105">
                        Try Calculator
                      </Button>
                    </Link>
                    <Link to="/voltmarket/home">
                      <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-blue-600 py-3 transition-all duration-300">
                        Browse Marketplace
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Testimonials Section */}
      <div className="py-24 bg-white" data-section="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-yellow-100 text-yellow-600 hover:bg-yellow-200">
              <Star className="w-4 h-4 mr-2" />
              Customer Success
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their VoltMarket experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`hover:shadow-2xl transition-all duration-500 border-0 shadow-lg transform hover:-translate-y-2 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {testimonial.image ? (
                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        testimonial.avatar
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px] animate-pulse" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Transform Your Energy Infrastructure Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join VoltMarket today and connect with the largest network of verified energy professionals.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-8 mb-8 flex-wrap">
              <div className="flex items-center text-white/80">
                <Shield className="w-5 h-5 mr-2" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center text-white/80">
                <Clock className="w-5 h-5 mr-2" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center text-white/80">
                <Eye className="w-5 h-5 mr-2" />
                <span>Full Transparency</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/voltmarket/auth">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/voltmarket/home">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all duration-300">
                  Explore Platform
                </Button>
              </Link>
            </div>
            
            <p className="text-blue-200 text-sm mt-4">
              No credit card required • Free 30-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <Zap className="w-8 h-8 text-yellow-400 mr-3" />
                <span className="text-2xl font-bold">VoltMarket</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The premier marketplace for power infrastructure and energy equipment. 
                Connecting verified professionals worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer group">
                  <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2 text-gray-400">
                <Link to="/voltmarket/listings" className="block hover:text-white transition-colors">Browse Listings</Link>
                <Link to="/voltmarket/auth" className="block hover:text-white transition-colors">Create Account</Link>
                <Link to="/voltmarket/verification" className="block hover:text-white transition-colors">Verification</Link>
                <Link to="/voltmarket/analytics" className="block hover:text-white transition-colors">Analytics</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors cursor-pointer">About Us</div>
                <div className="hover:text-white transition-colors cursor-pointer">Contact</div>
                <div className="hover:text-white transition-colors cursor-pointer">Privacy</div>
                <div className="hover:text-white transition-colors cursor-pointer">Terms</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VoltMarket. All rights reserved. Powering the future of energy infrastructure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};