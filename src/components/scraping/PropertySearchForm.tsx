
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Zap, Globe } from 'lucide-react';

interface PropertySearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  isSearching: boolean;
}

export interface SearchParams {
  location: string;
  propertyType: string;
  budgetRange: string;
  powerRequirements: string;
}

export function PropertySearchForm({ onSearch, isSearching }: PropertySearchFormProps) {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [powerRequirements, setPowerRequirements] = useState('');

  const handleSubmit = () => {
    if (!location || !propertyType) return;
    
    onSearch({
      location,
      propertyType,
      budgetRange,
      powerRequirements
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Texas, California, Ontario, Houston, Toronto"
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              <span>USA: All 50 states, major cities</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              <span>Canada: All provinces & territories</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property-type" className="text-sm font-medium">Property Type *</Label>
          <Select value={propertyType} onValueChange={setPropertyType} disabled={isSearching}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="data_center">Data Center</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="mixed_use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget-range" className="text-sm font-medium">Budget Range</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="budget-range"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              placeholder="e.g., $1M - $5M, Under $10M, $5M+"
              className="pl-10"
              disabled={isSearching}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="power-requirements" className="text-sm font-medium">Power Requirements</Label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="power-requirements"
              value={powerRequirements}
              onChange={(e) => setPowerRequirements(e.target.value)}
              placeholder="e.g., 10MW+, High capacity, Grid access"
              className="pl-10"
              disabled={isSearching}
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isSearching || !location || !propertyType}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isSearching ? (
          <>
            <Search className="w-4 h-4 mr-2 animate-pulse" />
            Searching Multiple Sources...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Search All Sources (Google + APIs)
          </>
        )}
      </Button>
      
      <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
        <div className="font-medium mb-1">Enhanced Search Coverage:</div>
        <div className="space-y-1">
          <div>• Google search across LoopNet, Crexi, Commercial Cafe, Showcase, and more</div>
          <div>• Direct API access to major real estate platforms</div>
          <div>• Canadian MLS and Realtor.ca integration</div>
          <div>• US Government and commercial property databases</div>
          <div>• No synthetic data - only real properties from verified sources</div>
        </div>
      </div>
    </div>
  );
}
