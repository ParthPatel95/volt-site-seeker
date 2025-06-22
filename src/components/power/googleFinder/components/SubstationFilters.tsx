
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface SubstationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  capacityFilter: string;
  setCapacityFilter: (capacity: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  detectionMethodFilter: string;
  setDetectionMethodFilter: (method: string) => void;
  confidenceFilter: string;
  setConfidenceFilter: (confidence: string) => void;
  onClearFilters: () => void;
  totalResults: number;
  filteredResults: number;
}

export function SubstationFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  capacityFilter,
  setCapacityFilter,
  locationFilter,
  setLocationFilter,
  detectionMethodFilter,
  setDetectionMethodFilter,
  confidenceFilter,
  setConfidenceFilter,
  onClearFilters,
  totalResults,
  filteredResults
}: SubstationFiltersProps) {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || capacityFilter !== 'all' || 
    locationFilter || detectionMethodFilter !== 'all' || confidenceFilter !== 'all';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Results</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredResults} of {totalResults} substations
            </Badge>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-2"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="status" className="text-sm font-medium">Analysis Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              placeholder="Filter by city/state..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="capacity" className="text-sm font-medium">Capacity Range</Label>
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All capacities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Capacities</SelectItem>
                <SelectItem value="0-50">0-50 MW</SelectItem>
                <SelectItem value="50-100">50-100 MW</SelectItem>
                <SelectItem value="100-250">100-250 MW</SelectItem>
                <SelectItem value="250-500">250-500 MW</SelectItem>
                <SelectItem value="500+">500+ MW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="detection" className="text-sm font-medium">Detection Method</Label>
            <Select value={detectionMethodFilter} onValueChange={setDetectionMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="google_maps">Google Maps</SelectItem>
                <SelectItem value="ml_satellite">AI Satellite</SelectItem>
                <SelectItem value="manual">Manual Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="confidence" className="text-sm font-medium">Confidence Level</Label>
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (60-79%)</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
