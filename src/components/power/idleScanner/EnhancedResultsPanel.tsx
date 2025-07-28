
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  Trash2, 
  Download, 
  MapPin, 
  Zap, 
  Factory, 
  TrendingUp,
  Building2,
  Target
} from 'lucide-react';
import { EnhancedVerifiedSite, AdvancedFilters } from './enhanced_types';
import { IdleIndustrySiteDetailsModal } from './IdleIndustrySiteDetailsModal';

interface EnhancedResultsPanelProps {
  sites: EnhancedVerifiedSite[];
  selectedSites: string[];
  filters: AdvancedFilters;
  loading: boolean;
  onSiteSelect: (siteId: string) => void;
  onBulkSelect: (siteIds: string[]) => void;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onDeleteSite: (siteId: string) => void;
  onBulkDelete: (siteIds: string[]) => void;
  onExport: (format: 'csv' | 'json') => void;
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<EnhancedVerifiedSite | null>(null);

  const handleViewDetails = (site: EnhancedVerifiedSite) => {
    setSelectedSite(site);
    setDetailsModalOpen(true);
    onViewDetails(site);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onBulkSelect(sites.map(site => site.id));
    } else {
      onBulkSelect([]);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPowerPotentialColor = (potential: string) => {
    const colors = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    };
    return colors[potential as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading industrial sites...</p>
        </CardContent>
      </Card>
    );
  }

  if (sites.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Sites Found</h3>
          <p className="text-gray-500">Start an enhanced scan to discover industrial sites with available power capacity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Factory className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="truncate">Enhanced Results ({sites.length} sites found)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {selectedSites.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBulkDelete(selectedSites)}
                  className="whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  Delete Selected ({selectedSites.length})
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onExport('csv')} className="whitespace-nowrap">
                  <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => onExport('json')} className="whitespace-nowrap">
                  <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                  Export JSON
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 p-3 rounded-lg min-w-0">
                <div className="text-sm text-blue-600">Total Sites</div>
                <div className="text-xl font-bold text-blue-800 truncate">{sites.length}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg min-w-0">
                <div className="text-sm text-green-600">Available Power</div>
                <div className="text-xl font-bold text-green-800 truncate">
                  {Math.round(sites.reduce((sum, site) => sum + (site.estimated_free_mw || 0), 0))} MW
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg min-w-0">
                <div className="text-sm text-orange-600">High Confidence</div>
                <div className="text-xl font-bold text-orange-800 truncate">
                  {sites.filter(site => site.confidence_score >= 80).length}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg min-w-0">
                <div className="text-sm text-purple-600">High Potential</div>
                <div className="text-xl font-bold text-purple-800 truncate">
                  {sites.filter(site => site.power_potential === 'High').length}
                </div>
              </div>
            </div>

            {/* Sites Table */}
            <div className="w-full overflow-hidden border rounded-lg">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 min-w-[48px]">
                        <Checkbox
                          checked={selectedSites.length === sites.length && sites.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-[150px]">Site Name</TableHead>
                      <TableHead className="min-w-[120px]">Location</TableHead>
                      <TableHead className="min-w-[100px]">Industry</TableHead>
                      <TableHead className="min-w-[100px]">Power Potential</TableHead>
                      <TableHead className="min-w-[90px]">Available MW</TableHead>
                      <TableHead className="min-w-[90px]">Confidence</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedSites.includes(site.id)}
                            onCheckedChange={(checked) => onSiteSelect(site.id)}
                          />
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div>
                            <div className="font-medium truncate">{site.name}</div>
                            <div className="text-sm text-gray-500 truncate">{site.facility_type}</div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm truncate">{site.city}, {site.state}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="text-sm truncate">{site.industry_type}</div>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <Badge className={`${getPowerPotentialColor(site.power_potential || 'Unknown')} whitespace-nowrap`}>
                            {site.power_potential || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            <span className="font-medium truncate">{site.estimated_free_mw || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <Badge className={`${getConfidenceColor(site.confidence_score)} whitespace-nowrap`}>
                            {site.confidence_score}%
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <Badge variant={site.business_status === 'active' ? 'default' : 'secondary'} className="whitespace-nowrap">
                            {site.business_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(site)}
                              className="flex-shrink-0"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDeleteSite(site.id)}
                              className="flex-shrink-0"
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
            </div>
          </div>
        </CardContent>
      </Card>

      <IdleIndustrySiteDetailsModal
        site={selectedSite}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  );
}
