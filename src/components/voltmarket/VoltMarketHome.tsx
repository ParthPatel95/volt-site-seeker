
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Building2, 
  Server, 
  Zap, 
  MapPin,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const VoltMarketHome: React.FC = () => {
  const featuredListings = [
    {
      id: '1',
      title: '150MW Data Center Site - Texas',
      location: 'Dallas, TX',
      price: '$45M',
      type: 'Site Sale',
      capacity: '150MW',
      image: null
    },
    {
      id: '2', 
      title: 'Bitcoin Mining Hosting - 50MW Available',
      location: 'Wyoming',
      price: '$0.045/kWh',
      type: 'Hosting',
      capacity: '50MW',
      image: null
    },
    {
      id: '3',
      title: 'Industrial Equipment Package',
      location: 'California',
      price: '$2.5M',
      type: 'Equipment',
      capacity: '25MW',
      image: null
    }
  ];

  const stats = [
    { label: 'Active Listings', value: '247', icon: Building2 },
    { label: 'Total Capacity', value: '2.8GW', icon: Zap },
    { label: 'Verified Sellers', value: '156', icon: Users },
    { label: 'Successful Deals', value: '$850M', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Power Infrastructure Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect buyers and sellers of power infrastructure assets, sites, and services worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voltmarket/listings">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Search className="w-5 h-5 mr-2" />
                Browse Listings
              </Button>
            </Link>
            <Link to="/voltmarket/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                List Your Asset
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium power infrastructure opportunities from verified sellers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{listing.type}</Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{listing.price}</div>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Zap className="w-4 h-4 mr-1" />
                    <span className="text-sm">{listing.capacity}</span>
                  </div>
                  <Link to={`/voltmarket/listings/${listing.id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/voltmarket/listings">
              <Button variant="outline" size="lg">
                View All Listings
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/voltmarket/listings?type=site_sale" className="group">
              <Card className="hover:shadow-lg transition-shadow group-hover:border-blue-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sites for Sale</h3>
                  <p className="text-gray-600 text-sm">Industrial sites and facilities</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/voltmarket/listings?type=site_lease" className="group">
              <Card className="hover:shadow-lg transition-shadow group-hover:border-green-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sites for Lease</h3>
                  <p className="text-gray-600 text-sm">Flexible lease agreements</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/voltmarket/listings?type=hosting" className="group">
              <Card className="hover:shadow-lg transition-shadow group-hover:border-purple-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Server className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Hosting Services</h3>
                  <p className="text-gray-600 text-sm">Colocation and hosting</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/voltmarket/listings?type=equipment" className="group">
              <Card className="hover:shadow-lg transition-shadow group-hover:border-orange-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <Zap className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Equipment</h3>
                  <p className="text-gray-600 text-sm">Power and mining equipment</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-gray-600">Secure, verified, and professional</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
              <p className="text-gray-600">All sellers go through identity and business verification</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Listings</h3>
              <p className="text-gray-600">Every listing is reviewed for accuracy and completeness</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Dedicated support team with industry expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of industry professionals buying and selling power infrastructure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voltmarket/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Create Account
              </Button>    
            </Link>
            <Link to="/voltmarket/listings">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
