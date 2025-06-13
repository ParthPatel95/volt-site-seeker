
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Zap, TestTube, Brain } from 'lucide-react';

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

  const runQATest = () => {
    // Run QA test with known good parameters
    onSearch({
      location: 'Texas',
      propertyType: 'industrial',
      budgetRange: '$1M - $10M',
      powerRequirements: 'medium'
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-blue-600" />
            <span className="font-semibold text-blue-800">QA Testing Mode Active</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runQATest}
            disabled={isSearching}
            className="text-blue-700 border-blue-300"
          >
            <TestTube className="w-4 h-4 mr-1" />
            Run QA Test
          </Button>
        </div>
        <p className="text-sm text-blue-700">
          Testing real property data retrieval across multiple sources. Each search validates data accuracy and system reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Texas, Houston, California"
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <div className="text-xs text-gray-500">
            QA Test locations: Texas, California, Houston, Dallas, Los Angeles
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
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            <Brain className="w-4 h-4 mr-2 animate-pulse" />
            Running QA Test - Analyzing Sources...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Start Property Discovery (QA Mode)
          </>
        )}
      </Button>
      
      <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
        <div className="font-medium mb-1 flex items-center">
          <TestTube className="w-3 h-3 mr-1" />
          QA Test Coverage:
        </div>
        <div className="space-y-1">
          <div>✅ Real estate platforms (LoopNet, CREXI style)</div>
          <div>✅ Public records and government data</div>
          <div>✅ Data validation and quality checks</div>
          <div>✅ Error handling and fallback systems</div>
          <div>✅ Database storage and retrieval</div>
        </div>
      </div>
    </div>
  );
}
