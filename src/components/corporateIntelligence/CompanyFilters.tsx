
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CompanyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  industryFilter: string;
  onIndustryChange: (value: string) => void;
  disabled?: boolean;
}

export function CompanyFilters({ 
  searchTerm, 
  onSearchChange, 
  industryFilter, 
  onIndustryChange, 
  disabled 
}: CompanyFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={disabled}
            />
          </div>
          <Select value={industryFilter} onValueChange={onIndustryChange} disabled={disabled}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
              <SelectItem value="Materials">Materials</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
