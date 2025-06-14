
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Filter, Search } from 'lucide-react';
import { PowerPropertyCard } from './PowerPropertyCard';

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  power_capacity_mw: number;
  substation_distance_miles: number;
  status: string;
}

interface PowerCapacityDistributionProps {
  properties: PropertyData[];
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline";
}

export function PowerCapacityDistribution({ properties, getStatusColor }: PowerCapacityDistributionProps) {
  if (properties.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-yellow-500" />
            Power Capacity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
              No Power Data Available
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              No properties with power capacity data found in the system. Start by adding properties or running data collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Properties
              </Button>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Run Data Collection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl mb-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Power Capacity Distribution
            </CardTitle>
            <p className="text-slate-500 dark:text-slate-400">
              Overview of power capacity across all properties
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {properties.length} Properties
            </Badge>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            {properties.slice(0, 10).map((property) => (
              <PowerPropertyCard 
                key={property.id} 
                property={property} 
                getStatusColor={getStatusColor} 
              />
            ))}
          </div>
          
          {properties.length > 10 && (
            <div className="text-center py-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                Showing 10 of {properties.length} properties
              </p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Load More Properties
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
