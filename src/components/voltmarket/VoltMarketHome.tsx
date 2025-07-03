
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  MapPin, 
  Zap, 
  Building2,
  ArrowRight,
  DollarSign
} from 'lucide-react';

export const VoltMarketHome: React.FC = () => {
  const featuredListings = [
    {
      id: '1',
      title: '50MW Data Center Site - Texas',
      location: 'Dallas, TX',
      price: '$15M',
      type: 'Site for Sale',
      capacity: '50MW',
      status: 'Available'
    },
    {
      id: '2',
      title: 'Industrial Hosting Facility',
      location: 'Phoenix, AZ',
      price: '$0.05/kWh',
      type: 'Hosting',
      capacity: '25MW',
      status: 'Available'
    },
    {
      id: '3',
      title: 'Antminer S19 Pro Equipment',
      location: 'Multiple Locations',
      price: '$2,500',
      type: 'Equipment',
      capacity: '110TH/s',
      status: 'In Stock'
    }
  ];

  const marketStats = [
    { label: 'Active Listings', value: '150+', icon: Building2 },
    { label: 'Total Capacity', value: '2.5GW', icon: Zap },
    { label: 'Markets Served', value: '12', icon: MapPin },
    { label: 'Verified Users', value: '500+', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Next Power Infrastructure Deal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Browse sites, hosting facilities, and equipment from verified sellers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voltmarket/listings">
              <Button size="lg">
                <Search className="w-4 h-4 mr-2" />
                Browse All Listings
              </Button>
            </Link>
            <Link to="/voltmarket/create-listing">
              <Button size="lg" variant="outline">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {marketStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Listings */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
            <Link to="/voltmarket/listings">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    <Badge variant="secondary">{listing.type}</Badge>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {listing.price}
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Zap className="w-4 h-4 mr-1" />
                      <span className="text-sm">{listing.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={listing.status === 'Available' ? 'default' : 'secondary'}>
                      {listing.status}
                    </Badge>
                    <Link to={`/voltmarket/listings/${listing.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Browse available sites for sale or lease across multiple markets.
              </p>
              <Link to="/voltmarket/listings?type=site">
                <Button className="w-full">Browse Sites</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Hosting Solutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Find hosting facilities with available power capacity.
              </p>
              <Link to="/voltmarket/listings?type=hosting">
                <Button className="w-full">Find Hosting</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Browse mining equipment and infrastructure hardware.
              </p>
              <Link to="/voltmarket/listings?type=equipment">
                <Button className="w-full">Shop Equipment</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
