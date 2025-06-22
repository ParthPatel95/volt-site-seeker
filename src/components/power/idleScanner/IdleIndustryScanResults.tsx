
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
  TrendingUp
} from 'lucide-react';
import { IdleIndustrySite } from './types';
import { IdleIndustrySiteDetailsModal } from './IdleIndustrySiteDetailsModal';

interface IdleIndustryScanResultsProps {
  sites: IdleIndustrySite[];
  selectedSites: string[];
  loading: boolean;
  onSiteSelect: (siteId: string) => void;
  onBulkSelect: (siteIds: string[]) => void;
  onDeleteSite: (siteId: string) => void;
  onBulkDelete: (siteIds: string[]) => void;
  onExport: (format: 'csv' | 'json') => void;
  onViewDetails: (site: IdleIndustrySite) => void;
}

export function IdleIndustryScanResults({
  sites,
  selectedSites,
  loading,
  onSiteSelect,
  onBulkSelect,
  onDeleteSite,
  onBulkDelete,
  onExport,
  onViewDetails
}: IdleIndustryScanResultsProps) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<IdleIndustrySite | null>(null);

  const handleViewDetails = (site: IdleIndustrySite) => {
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

  const getIdleScoreColor = (score: number) => {
    if (score >= 70) return 'bg-red-100 text-red-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatPowerCapacity = (capacity: number | null | undefined) => {
    if (!capacity) return 'N/A';
    return `${capacity.toFixed(1)} MW`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Scanning for idle industrial sites...</p>
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
          <p className="text-gray-500">Start a scan to discover idle industrial sites with available power capacity.</p>
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
              Scan Results ({sites.length} sites found)
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
                  {Math.round(sites.reduce((sum, site) => sum + (site.estimatedFreeMW || 0), 0))} MW
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-orange-600">High Confidence</div>
                <div className="text-xl font-bold text-orange-800">
                  {sites.filter(site => site.confidenceLevel >= 80).length}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-600">Idle Sites</div>
                <div className="text-xl font-bold text-purple-800">
                  {sites.filter(site => site.idleScore >= 50).length}
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
                    <TableHead>Power Capacity</TableHead>
                    <TableHead>Idle Score</TableHead>
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
                          <div className="text-sm text-gray-500">{site.industryType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{site.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{site.industryType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span className="font-medium">{formatPowerCapacity(site.estimatedFreeMW)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getIdleScoreColor(site.idleScore)}>
                          {site.idleScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getConfidenceColor(site.confidenceLevel)}>
                          {site.confidenceLevel}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={site.operationalStatus === 'active' ? 'default' : 'secondary'}>
                          {site.operationalStatus || 'unknown'}
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

      {/* Details Modal */}
      {selectedSite && (
        <IdleIndustrySiteDetailsModal
          site={{
            ...selectedSite,
            // Map IdleIndustrySite properties to EnhancedVerifiedSite properties
            industry_type: selectedSite.industryType,
            business_status: selectedSite.operationalStatus || 'unknown',
            transmission_access: false,
            confidence_score: selectedSite.confidenceLevel,
            idle_score: selectedSite.idleScore,
            data_sources: [],
            verified_sources_count: 0,
            property_type: 'Industrial',
            last_verified_at: null,
            satellite_analysis: selectedSite.visionAnalysis || null,
            listing_price: null,
            price_per_sqft: null,
            square_footage: selectedSite.facilitySize || null,
            lot_size_acres: null,
            year_built: selectedSite.yearBuilt || null,
            environmental_permits: [],
            risk_factors: [],
            confidence_level: selectedSite.confidenceLevel >= 80 ? 'High' : selectedSite.confidenceLevel >= 60 ? 'Medium' : 'Low',
            market_data: null,
            created_at: selectedSite.discoveredAt,
            updated_at: selectedSite.lastSatelliteUpdate || selectedSite.discoveredAt,
            deleted_at: null,
            created_by: null,
            address: selectedSite.address,
            last_scan_at: selectedSite.lastSatelliteUpdate || selectedSite.discoveredAt,
            validation_status: 'pending',
            city: selectedSite.city,
            state: selectedSite.state,
            zip_code: null,
            facility_type: 'Industrial',
            satellite_image_url: null,
            visual_status: null,
            discovery_method: 'scanner',
            power_potential: selectedSite.confidenceLevel >= 80 ? 'High' : selectedSite.confidenceLevel >= 60 ? 'Medium' : 'Low',
            coordinates: selectedSite.coordinates ? {
              lat: selectedSite.coordinates.lat,
              lng: selectedSite.coordinates.lng
            } : null,
            historical_peak_mw: selectedSite.historicalPeakMW || null,
            estimated_current_mw: null,
            estimated_free_mw: selectedSite.estimatedFreeMW || null,
            capacity_utilization: selectedSite.capacityUtilization || null,
            substation_distance_km: selectedSite.substationDistanceKm || null,
            naics_code: selectedSite.naicsCode || null,
            zoning: null,
            jurisdiction: selectedSite.state,
            regulatory_status: null,
            scan_id: null
          }}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />
      )}
    </>
  );
}
