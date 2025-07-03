
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  PlayCircle
} from 'lucide-react';

export const VoltMarketLandingPage: React.FC = () => {
  const features = [
    {
      icon: Building2,
      title: "Premium Listings",
      description: "Browse verified industrial sites, data centers, and power infrastructure with detailed specifications"
    },
    {
      icon: Users,
      title: "Verified Network",
      description: "Connect with pre-screened buyers and sellers through our rigorous verification process"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "End-to-end encrypted messaging, secure document sharing, and NDA-protected transactions"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Access real-time market data, pricing analytics, and investment insights"
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description: "Instant messaging with read receipts, file sharing, and video call integration"
    },
    {
      icon: Award,
      title: "Trust & Reviews",
      description: "Comprehensive rating system with verified transaction reviews and badges"
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
    { number: "2.5GW+", label: "Total Capacity Listed" },
    { number: "150+", label: "Active Listings" },
    { number: "500+", label: "Verified Users" },
    { number: "12", label: "Markets Served" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "DataCenter Ventures",
      quote: "VoltMarket transformed how we find and evaluate data center opportunities. The verification system gives us confidence in every deal.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      company: "Industrial Power Solutions",
      quote: "The real-time analytics and market intelligence features help us make informed investment decisions quickly.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emma Rodriguez",
      company: "Mining Operations LLC",
      quote: "Best platform for connecting with verified power infrastructure providers. The secure messaging is a game-changer.",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-blue-800/90" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Zap className="w-20 h-20 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 w-20 h-20 bg-yellow-400/20 rounded-full animate-ping" />
              </div>
            </div>
            
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300">
              <Globe className="w-4 h-4 mr-2" />
              Powering the Future of Energy Infrastructure
            </Badge>
            
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                VoltMarket
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              The world's premier marketplace for power infrastructure, industrial sites, and energy equipment. 
              Connect with verified professionals and access exclusive opportunities in the energy sector.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/voltmarket/home">
                <Button size="lg" className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-600 hover:bg-blue-200">
              <Star className="w-4 h-4 mr-2" />
              Premium Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-600 hover:bg-purple-200">
                <TrendingUp className="w-4 h-4 mr-2" />
                Built for Professionals
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Accelerate Your Energy Infrastructure Deals
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're buying, selling, or leasing energy infrastructure, 
                VoltMarket provides the tools, network, and intelligence you need to close deals faster and more securely.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="p-1 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <PlayCircle className="w-6 h-6 mr-2" />
                    Ready to Get Started?
                  </h3>
                  <p className="text-blue-100 mb-6">
                    Join thousands of energy professionals already using VoltMarket to accelerate their infrastructure deals.
                  </p>
                  <div className="space-y-3">
                    <Link to="/voltmarket/auth">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 transition-all duration-300 transform hover:scale-105">
                        Create Free Account
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

      {/* Testimonials Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-600 hover:bg-yellow-200">
              <Star className="w-4 h-4 mr-2" />
              Customer Success
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their VoltMarket experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
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

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Energy Infrastructure Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join VoltMarket today and connect with the largest network of verified energy professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voltmarket/auth">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/voltmarket/home">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all duration-300">
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
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
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors cursor-pointer">Browse Listings</div>
                <div className="hover:text-white transition-colors cursor-pointer">Create Account</div>
                <div className="hover:text-white transition-colors cursor-pointer">Verification</div>
                <div className="hover:text-white transition-colors cursor-pointer">Analytics</div>
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
