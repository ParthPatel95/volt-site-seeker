
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchParametersProps {
  location: string;
  propertyType: string;
  onLocationChange: (location: string) => void;
  onPropertyTypeChange: (type: string) => void;
}

export function SearchParameters({ 
  location, 
  propertyType, 
  onLocationChange, 
  onPropertyTypeChange 
}: SearchParametersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Texas, Dallas, Houston..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="property-type">Property Type</Label>
        <Select value={propertyType} onValueChange={onPropertyTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="data_center">Data Center</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
