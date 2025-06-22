
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-orange-600" />
              Enhanced Results ({sites.length} sites found)
            </div>
            <div className="flex gap-2">
              {selectedSites.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBulkDelete(selectedSites)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedSites.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('json')}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-600">Total Sites</div>
                <div className="text-xl font-bold text-blue-800">{sites.length}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-600">Available Power</div>
                <div className="text-xl font-bold text-green-800">
                  {Math.round(sites.reduce((sum, site) => sum + (site.estimated_free_mw || 0), 0))} MW
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-orange-600">High Confidence</div>
                <div className="text-xl font-bold text-orange-800">
                  {sites.filter(site => site.confidence_score >= 80).length}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-600">High Potential</div>
                <div className="text-xl font-bold text-purple-800">
                  {sites.filter(site => site.power_potential === 'High').length}
                </div>
              </div>
            </div>

            {/* Sites Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedSites.length === sites.length && sites.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Power Potential</TableHead>
                    <TableHead>Available MW</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSites.includes(site.id)}
                          onCheckedChange={(checked) => onSiteSelect(site.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-gray-500">{site.facility_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{site.city}, {site.state}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{site.industry_type}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPowerPotentialColor(site.power_potential || 'Unknown')}>
                          {site.power_potential || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span className="font-medium">{site.estimated_free_mw || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getConfidenceColor(site.confidence_score)}>
                          {site.confidence_score}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={site.business_status === 'active' ? 'default' : 'secondary'}>
                          {site.business_status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(site)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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
