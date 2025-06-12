
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MapPin, 
  Zap, 
  DollarSign,
  Building,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

const mockProperties = [
  {
    id: 1,
    title: "Industrial Complex - Dallas North",
    address: "1234 Industrial Blvd, Dallas, TX 75201",
    powerCapacity: "25 MW",
    voltScore: 85,
    price: "$4.2M",
    pricePerMW: "$168K/MW",
    substationDistance: "0.3 mi",
    brokerContact: "John Smith - CBRE",
    propertyType: "Industrial Manufacturing",
    yearBuilt: "1985",
    lotSize: "45 acres",
    status: "Active",
    source: "LoopNet",
    lastUpdated: "2 hours ago"
  },
  {
    id: 2,
    title: "Manufacturing Facility - Austin South",
    address: "5678 Manufacturing Way, Austin, TX 78701",
    powerCapacity: "18 MW",
    voltScore: 72,
    price: "$2.8M",
    pricePerMW: "$156K/MW",
    substationDistance: "0.7 mi",
    brokerContact: "Sarah Johnson - JLL",
    propertyType: "Heavy Manufacturing",
    yearBuilt: "1992",
    lotSize: "32 acres",
    status: "Under Review",
    source: "Direct Contact",
    lastUpdated: "1 day ago"
  },
  {
    id: 3,
    title: "Energy Distribution Hub - Houston",
    address: "9012 Energy Pkwy, Houston, TX 77001",
    powerCapacity: "32 MW",
    voltScore: 91,
    price: "$6.1M",
    pricePerMW: "$191K/MW",
    substationDistance: "0.1 mi",
    brokerContact: "Mike Chen - Cushman & Wakefield",
    propertyType: "Energy/Utility",
    yearBuilt: "2001",
    lotSize: "58 acres",
    status: "Hot Lead",
    source: "LoopNet",
    lastUpdated: "30 minutes ago"
  }
];

export function PropertyList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('voltScore');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot Lead':
        return 'bg-red-500';
      case 'Active':
        return 'bg-green-500';
      case 'Under Review':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Heavy Power Properties</h1>
          <p className="text-muted-foreground">Discovered sites for data center conversion</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-700">
          <ExternalLink className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by location, broker, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
        <select 
          className="px-3 py-2 border rounded-md bg-background"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="voltScore">Sort by VoltScore</option>
          <option value="price">Sort by Price</option>
          <option value="powerCapacity">Sort by Power Capacity</option>
          <option value="distance">Sort by Substation Distance</option>
        </select>
      </div>

      {/* Properties Grid */}
      <div className="space-y-4">
        {mockProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Property Info */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.address}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={property.voltScore > 80 ? "default" : "secondary"}>
                        VoltScore: {property.voltScore}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(property.status)}`}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Property Type:</span>
                      <br />
                      <span className="font-medium">{property.propertyType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lot Size:</span>
                      <br />
                      <span className="font-medium">{property.lotSize}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Year Built:</span>
                      <br />
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source:</span>
                      <br />
                      <span className="font-medium">{property.source}</span>
                    </div>
                  </div>
                </div>

                {/* Power & Financial Info */}
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Zap className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Power Capacity</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{property.powerCapacity}</div>
                    <div className="text-sm text-blue-600">Distance to substation: {property.substationDistance}</div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Investment</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{property.price}</div>
                    <div className="text-sm text-green-600">{property.pricePerMW}</div>
                  </div>
                </div>

                {/* Contact & Actions */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Broker Contact:</div>
                    <div className="font-medium">{property.brokerContact}</div>
                    <div className="text-xs text-muted-foreground">Last updated: {property.lastUpdated}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700">
                      <Building className="w-3 h-3 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <TrendingUp className="w-3 h-3 mr-2" />
                      AI Analysis
                    </Button>
                  </div>
                  
                  <Badge variant="outline" className="w-full justify-center">
                    Status: {property.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
