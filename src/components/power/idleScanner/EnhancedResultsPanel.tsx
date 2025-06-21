
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  MapPin, 
  Zap, 
  Factory,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Satellite,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  Database
} from 'lucide-react';
import { EnhancedVerifiedSite, AdvancedFilters } from './enhanced_types';

interface EnhancedResultsPanelProps {
  sites: EnhancedVerifiedSite[];
  selectedSites: string[];
  filters: AdvancedFilters;
  loading: boolean;
  onSiteSelect: (siteId: string) => void;
  onBulkSelect: (siteIds: string[]) => void;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onDeleteSite: (siteId: string) => void;
  onBulkDelete: () => void;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  onViewDetails: (site: EnhancedVerifiedSite) => void;
}

export function EnhancedResultsPanel({
  sites,
  selectedSites,
  filters,
  loading,
  onSiteSelect,
  onBulkSelect,
  onFiltersChange,
  onDeleteSite,
  onBulkDelete,
  onExport,
  onViewDetails
}: EnhancedResultsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<string>('confidence_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort sites
  const filteredSites = sites
    .filter(site => 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.industry_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy as keyof EnhancedVerifiedSite] || 0;
      const bVal = b[sortBy as keyof EnhancedVerifiedSite] || 0;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' ? 
        (aVal as number) - (bVal as number) : 
        (bVal as number) - (aVal as number);
    });

  const handleSelectAll = () => {
    if (selectedSites.length === filteredSites.length) {
      onBulkSelect([]);
    } else {
      onBulkSelect(filteredSites.map(site => site.id));
    }
  };

  const getConfidenceBadge = (score: number, level: string) => {
    const colors = {
      'High': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Low': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return (
      <Badge className={colors[level as keyof typeof colors]}>
        {level} ({score})
      </Badge>
    );
  };

  const getVisualStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Idle':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Likely Abandoned':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPowerPotentialBadge = (potential: string) => {
    const colors = {
      'High': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-purple-100 text-purple-800',
      'Low': 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={colors[potential as keyof typeof colors]}>
        {potential}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Enhanced Site Results
            <Badge variant="outline">{filteredSites.length} of {sites.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="cards">Card View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">📊 Results ({filteredSites.length})</TabsTrigger>
            <TabsTrigger value="filters">🔍 Advanced Filters</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {/* Search and Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search sites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confidence_score">Confidence Score</SelectItem>
                    <SelectItem value="idle_score">Idle Score</SelectItem>
                    <SelectItem value="estimated_free_mw">Free MW</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="industry_type">Industry Type</SelectItem>
                    <SelectItem value="created_at">Date Found</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('csv')}
                  disabled={filteredSites.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('json')}
                  disabled={filteredSites.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                {selectedSites.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete ({selectedSites.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Results Display */}
            {viewMode === 'table' ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedSites.length === filteredSites.length && filteredSites.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Site Information</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Power Potential</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sources</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedSites.includes(site.id)}
                            onCheckedChange={() => onSiteSelect(site.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold">{site.name}</div>
                            <div className="text-sm text-gray-600">{site.industry_type}</div>
                            {site.naics_code && (
                              <div className="text-xs text-gray-500">NAICS: {site.naics_code}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{site.city}, {site.state}</span>
                          </div>
                          {site.substation_distance_km && (
                            <div className="text-xs text-gray-500">
                              {site.substation_distance_km.toFixed(1)}km to substation
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getConfidenceBadge(site.confidence_score, site.confidence_level)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getPowerPotentialBadge(site.power_potential)}
                            {site.estimated_free_mw && (
                              <div className="text-sm text-gray-600">
                                {site.estimated_free_mw}MW available
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getVisualStatusIcon(site.visual_status)}
                            <span className="text-sm">{site.visual_status}</span>
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {site.business_status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="font-medium">{site.verified_sources_count} sources</div>
                            <div className="text-gray-500">
                              {site.data_sources.slice(0, 2).join(', ')}
                              {site.data_sources.length > 2 && ` +${site.data_sources.length - 2}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewDetails(site)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteSite(site.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSites.map((site) => (
                  <Card key={site.id} className={`cursor-pointer transition-all ${selectedSites.includes(site.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{site.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{site.industry_type}</p>
                        </div>
                        <Checkbox
                          checked={selectedSites.includes(site.id)}
                          onCheckedChange={() => onSiteSelect(site.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{site.city}, {site.state}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getConfidenceBadge(site.confidence_score, site.confidence_level)}
                        {getPowerPotentialBadge(site.power_potential)}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          {getVisualStatusIcon(site.visual_status)}
                          <span>{site.visual_status}</span>
                        </div>
                        {site.estimated_free_mw && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>{site.estimated_free_mw}MW</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        <div>{site.verified_sources_count} sources verified</div>
                        <div>Found: {new Date(site.created_at).toLocaleDateString()}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onViewDetails(site)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteSite(site.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredSites.length === 0 && !loading && (
              <div className="text-center py-12">
                <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No sites found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Confidence Score Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Confidence Score Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minConfidenceScore}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      minConfidenceScore: parseInt(e.target.value) || 0
                    })}
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxConfidenceScore}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      maxConfidenceScore: parseInt(e.target.value) || 100
                    })}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Power Potential */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Power Potential</label>
                <div className="space-y-2">
                  {['High', 'Medium', 'Low'].map(potential => (
                    <div key={potential} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.powerPotential.includes(potential)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFiltersChange({
                              ...filters,
                              powerPotential: [...filters.powerPotential, potential]
                            });
                          } else {
                            onFiltersChange({
                              ...filters,
                              powerPotential: filters.powerPotential.filter(p => p !== potential)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{potential}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Visual Status</label>
                <div className="space-y-2">
                  {['Active', 'Idle', 'Likely Abandoned'].map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.visualStatus.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFiltersChange({
                              ...filters,
                              visualStatus: [...filters.visualStatus, status]
                            });
                          } else {
                            onFiltersChange({
                              ...filters,
                              visualStatus: filters.visualStatus.filter(s => s !== status)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free MW Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Free MW Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min MW"
                    value={filters.minFreeMW}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      minFreeMW: parseInt(e.target.value) || 0
                    })}
                    className="w-24"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max MW"
                    value={filters.maxFreeMW}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      maxFreeMW: parseInt(e.target.value) || 1000
                    })}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onFiltersChange({
                  minConfidenceScore: 0,
                  maxConfidenceScore: 100,
                  minIdleScore: 0,
                  maxIdleScore: 100,
                  minFreeMW: 0,
                  maxFreeMW: 1000,
                  maxSubstationDistance: 50,
                  powerPotential: [],
                  visualStatus: [],
                  industryTypes: [],
                  businessStatus: [],
                  dataSourcesRequired: [],
                  hasEnvironmentalPermits: null,
                  minSquareFootage: null,
                  maxListingPrice: null,
                  yearBuiltRange: null
                })}
              >
                Clear Filters
              </Button>
              <Button onClick={() => {}}>
                Apply Filters
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{sites.length}</div>
                  <div className="text-sm text-gray-600">Total Sites Discovered</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {sites.filter(s => s.confidence_level === 'High').length}
                  </div>
                  <div className="text-sm text-gray-600">High Confidence Sites</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {Math.round(sites.reduce((sum, s) => sum + (s.estimated_free_mw || 0), 0))}MW
                  </div>
                  <div className="text-sm text-gray-600">Total Available Power</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
