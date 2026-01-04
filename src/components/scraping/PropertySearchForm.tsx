
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Zap } from 'lucide-react';

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
  const [propertyType, setPropertyType] = useState('all_types');
  const [budgetRange, setBudgetRange] = useState('');
  const [powerRequirements, setPowerRequirements] = useState('any');

  const handleSubmit = () => {
    if (!location) return;
    
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
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Texas, Houston, California"
              className="pl-10"
              disabled={isSearching}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property-type" className="text-sm font-medium">Property Type</Label>
          <Select value={propertyType} onValueChange={setPropertyType} disabled={isSearching}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">All Types</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="data_center">Data Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget-range" className="text-sm font-medium">Budget Range</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="budget-range"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              placeholder="e.g., $1M - $5M"
              className="pl-10"
              disabled={isSearching}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="power-requirements" className="text-sm font-medium">Power Requirements</Label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Select value={powerRequirements} onValueChange={setPowerRequirements} disabled={isSearching}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Any power capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any power capacity</SelectItem>
                <SelectItem value="low">5+ MW (Basic Industrial)</SelectItem>
                <SelectItem value="medium">15+ MW (Heavy Industrial)</SelectItem>
                <SelectItem value="high">25+ MW (Data Center Ready)</SelectItem>
                <SelectItem value="enterprise">50+ MW (Hyperscale)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isSearching || !location}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isSearching ? (
          <>
            <Search className="w-4 h-4 mr-2 animate-spin" />
            Searching Properties...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Start Property Discovery
          </>
        )}
      </Button>
    </div>
  );
}
