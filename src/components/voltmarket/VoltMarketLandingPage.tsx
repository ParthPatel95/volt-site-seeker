
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const VoltMarketLandingPage: React.FC = () => {
  const features = [
    {
      icon: Building2,
      title: "Site Listings",
      description: "Browse and list industrial sites, data centers, and power infrastructure"
    },
    {
      icon: Users,
      title: "Verified Community",
      description: "Connect with verified buyers and sellers in the energy industry"
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Protected messaging and document sharing with NDA support"
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Access real-time market data and pricing insights"
    }
  ];

  const benefits = [
    "List sites for sale or lease",
    "Find hosting opportunities", 
    "Connect with equipment vendors",
    "Secure document sharing",
    "Real-time messaging",
    "Market analytics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <Zap className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              VoltMarket
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The premier marketplace for power infrastructure, industrial sites, and energy equipment. 
              Connect with verified buyers and sellers in the energy industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/voltmarket/home">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Marketplace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/voltmarket/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Energy Infrastructure
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for the modern energy marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <Icon className="w-12 h-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Built for Energy Professionals
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're looking to buy, sell, or lease energy infrastructure, 
                VoltMarket provides the tools and community you need to succeed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of energy professionals already using VoltMarket.
              </p>
              <Link to="/voltmarket/auth">
                <Button className="w-full" size="lg">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">VoltMarket</span>
            </div>
            <p className="text-gray-400">
              The premier marketplace for power infrastructure and energy equipment
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
