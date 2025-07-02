
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Zap, 
  Server, 
  MapPin, 
  TrendingUp,
  Shield,
  Users,
  MessageSquare,
  FileText,
  ArrowRight
} from 'lucide-react';

export const VoltMarketHome: React.FC = () => {
  const featuredListings = [
    {
      id: 1,
      title: "150MW Data Center Site - Texas",
      type: "site_sale",
      location: "Dallas, TX",
      price: "$45M",
      power: "150MW",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "ASIC Hosting - 5MW Available",
      type: "hosting",
      location: "Wyoming",
      price: "$0.045/kWh",
      power: "5MW",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Antminer S19 Pro - 100 Units",
      type: "equipment",
      location: "California",
      price: "$2,200/unit",
      power: "3.25kW",
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    {
      title: "Sites for Sale",
      description: "Data centers, industrial facilities, and power-ready sites",
      icon: Building2,
      color: "bg-blue-100 text-blue-600",
      href: "/voltmarket/listings?type=site_sale"
    },
    {
      title: "Sites for Lease",
      description: "Flexible leasing options for your power needs",
      icon: MapPin,
      color: "bg-green-100 text-green-600",
      href: "/voltmarket/listings?type=site_lease"
    },
    {
      title: "Hosting Services",
      description: "Professional hosting for mining and computing",
      icon: Server,
      color: "bg-purple-100 text-purple-600",
      href: "/voltmarket/listings?type=hosting"
    },
    {
      title: "Equipment",
      description: "Mining hardware, cooling, and power equipment",
      icon: Zap,
      color: "bg-orange-100 text-orange-600",
      href: "/voltmarket/listings?type=equipment"
    }
  ];

  const features = [
    {
      title: "Secure Transactions",
      description: "NDA workflows and secure document sharing",
      icon: Shield
    },
    {
      title: "Professional Network",
      description: "Connect with verified industry professionals",
      icon: Users
    },
    {
      title: "Direct Messaging",
      description: "Communicate directly with buyers and sellers",
      icon: MessageSquare
    },
    {
      title: "Due Diligence",
      description: "Access detailed documentation and reports",
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Global Power Infrastructure Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with data center sites, hosting providers, and equipment vendors. 
              The professional marketplace for the power infrastructure industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/voltmarket/listings">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Browse Marketplace
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/voltmarket/auth">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What are you looking for?
            </h2>
            <p className="text-xl text-gray-600">
              Find exactly what you need in our specialized categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to={category.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                      <category.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Listings
              </h2>
              <p className="text-xl text-gray-600">
                Discover the latest opportunities in the marketplace
              </p>
            </div>
            <Link to="/voltmarket/listings">
              <Button variant="outline">
                View All Listings
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {listing.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">{listing.location}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{listing.price}</span>
                    <span className="text-sm text-gray-500">{listing.power}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose VoltMarket?
            </h2>
            <p className="text-xl text-gray-600">
              Professional-grade features for serious industry professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Marketplace?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Connect with thousands of industry professionals and find your next opportunity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voltmarket/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Today
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
