
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Zap, 
  Factory, 
  Calendar, 
  Phone, 
  Globe, 
  Star, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  Building2,
  DollarSign,
  Ruler,
  Target,
  Shield,
  TrendingUp,
  Database,
  Eye,
  Satellite
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedVerifiedSite } from './enhanced_types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox public token
mapboxgl.accessToken = 'pk.eyJ1Ijoidm9sdHNjb3V0IiwiYSI6ImNtYnpqeWtmeDF5YjkycXB2MzQ3YWk0YzIifQ.YkeTxxJcGkgHTpt9miLk6A';

interface IdleIndustrySiteDetailsModalProps {
  site: EnhancedVerifiedSite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SiteDetails {
  name: string;
  address: string;
  photos: string[];
  reviews: any[];
  businessStatus: string;
  rating: number | null;
  openingHours: string[];
  phoneNumber: string | null;
  website: string | null;
  error?: string;
}

export function IdleIndustrySiteDetailsModal({ site, open, onOpenChange }: IdleIndustrySiteDetailsModalProps) {
  const [siteDetails, setSiteDetails] = useState<SiteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const fetchSiteDetails = async () => {
    if (!site) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: {
          action: 'get_site_details',
          coordinates: site.coordinates,
          siteName: site.name
        }
      });

      if (error) throw error;
      setSiteDetails(data?.details || null);
    } catch (error: any) {
      console.error('Error fetching site details:', error);
      toast({
        title: "Details Error",
        description: "Failed to fetch additional site details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !site?.coordinates || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [site.coordinates.lng, site.coordinates.lat],
      zoom: 16,
      pitch: 45,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add a marker for the industrial site
    const marker = new mapboxgl.Marker({
      color: '#f59e0b',
      scale: 1.2
    })
      .setLngLat([site.coordinates.lng, site.coordinates.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${site.name}</h3>
          <p class="text-xs text-gray-600">${site.industry_type}</p>
          <p class="text-xs">${site.city}, ${site.state}</p>
        </div>
      `))
      .addTo(map.current);

    // Show popup initially
    marker.getPopup().addTo(map.current);
  };

  useEffect(() => {
    if (open && site) {
      fetchSiteDetails();
      // Initialize map with a slight delay to ensure the container is rendered
      setTimeout(initializeMap, 100);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, site]);

  if (!site) return null;

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

  const getBusinessStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'operational': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[status?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const formatNumber = (value: number | null | undefined, suffix = '') => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value) + suffix;
  };

  const handleViewOnGoogleMaps = () => {
    if (site.coordinates) {
      const url = `https://maps.google.com/?q=${site.coordinates.lat},${site.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Factory className="w-6 h-6 text-orange-600" />
            {site.name}
            {site.coordinates && (
              <Button
                onClick={handleViewOnGoogleMaps}
                size="sm"
                variant="outline"
                className="ml-auto"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Maps
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="power">Power Analysis</TabsTrigger>
            <TabsTrigger value="business">Business Info</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Confidence Score</p>
                      <Badge className={getConfidenceColor(site.confidence_score)}>
                        {site.confidence_score}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Power Potential</p>
                      <Badge className={getPowerPotentialColor(site.power_potential || 'Unknown')}>
                        {site.power_potential || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Business Status</p>
                      <Badge className={getBusinessStatusColor(site.business_status)}>
                        {site.business_status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Idle Score</p>
                      <p className="text-lg font-bold">{site.idle_score}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Factory className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Industry Type</label>
                    <p className="text-sm">{site.industry_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Facility Type</label>
                    <p className="text-sm">{site.facility_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">NAICS Code</label>
                    <p className="text-sm">{site.naics_code || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Discovery Method</label>
                    <p className="text-sm">{site.discovery_method || 'Multi-source scan'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data Sources</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {site.data_sources?.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source.replace(/_/g, ' ')}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">No sources specified</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm">{site.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">City</label>
                    <p className="text-sm">{site.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">State/Province</label>
                    <p className="text-sm">{site.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ZIP Code</label>
                    <p className="text-sm">{site.zip_code || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jurisdiction</label>
                    <p className="text-sm">{site.jurisdiction}</p>
                  </div>
                  {site.coordinates && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Coordinates</label>
                      <p className="text-sm">{site.coordinates.lat.toFixed(6)}, {site.coordinates.lng.toFixed(6)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            {site.coordinates ? (
              <Card>
                <CardHeader>
                  <CardTitle>Satellite View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={mapContainer} className="w-full h-96 rounded-lg" />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Coordinates Available</h3>
                  <p className="text-gray-500">Location coordinates are not available for this site.</p>
                </CardContent>
              </Card>
            )}

            {site.substation_distance_km && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Infrastructure Proximity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Distance to Nearest Substation</label>
                      <p className="text-sm">{site.substation_distance_km} km</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transmission Access</label>
                      <Badge className={site.transmission_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {site.transmission_access ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="power" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Power Consumption Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Historical Peak (MW)</label>
                    <p className="text-lg font-semibold">{formatNumber(site.historical_peak_mw)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Estimated (MW)</label>
                    <p className="text-lg font-semibold">{formatNumber(site.estimated_current_mw)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Available Capacity (MW)</label>
                    <p className="text-lg font-semibold text-green-600">{formatNumber(site.estimated_free_mw)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Capacity Utilization</label>
                    <p className="text-lg font-semibold">{formatNumber(site.capacity_utilization, '%')}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Assessment Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Power Potential</label>
                    <Badge className={getPowerPotentialColor(site.power_potential || 'Unknown')}>
                      {site.power_potential || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Confidence Level</label>
                    <Badge className={getConfidenceColor(site.confidence_score)}>
                      {site.confidence_level} ({site.confidence_score}%)
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Idle Score</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${site.idle_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{site.idle_score}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Status</label>
                    <Badge className={getBusinessStatusColor(site.business_status)}>
                      {site.business_status || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Property Type</label>
                    <p className="text-sm">{site.property_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Year Built</label>
                    <p className="text-sm">{site.year_built || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Zoning</label>
                    <p className="text-sm">{site.zoning || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Regulatory & Environmental
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Environmental Permits</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {site.environmental_permits?.length ? 
                        site.environmental_permits.map((permit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permit}
                          </Badge>
                        )) : 
                        <span className="text-sm text-gray-500">No permits listed</span>
                      }
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Validation Status</label>
                    <Badge variant={site.validation_status === 'verified' ? 'default' : 'secondary'}>
                      {site.validation_status || 'Pending'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Risk Factors</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {site.risk_factors?.length ? 
                        site.risk_factors.map((risk, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-red-600">
                            {risk}
                          </Badge>
                        )) : 
                        <span className="text-sm text-gray-500">No risks identified</span>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Listing Price</label>
                    <p className="text-lg font-semibold">{formatCurrency(site.listing_price)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Price per Sq Ft</label>
                    <p className="text-lg font-semibold">{formatCurrency(site.price_per_sqft)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Square Footage</label>
                    <p className="text-lg font-semibold">{formatNumber(site.square_footage, ' sq ft')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lot Size</label>
                    <p className="text-lg font-semibold">{formatNumber(site.lot_size_acres, ' acres')}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {site.market_data ? (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Market Data</label>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(site.market_data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No market data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data & Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Verified Sources Count</label>
                    <p className="text-lg font-semibold">{site.verified_sources_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Verified</label>
                    <p className="text-sm">{site.last_verified_at ? new Date(site.last_verified_at).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Scanned</label>
                    <p className="text-sm">{site.last_scan_at ? new Date(site.last_scan_at).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-sm">{new Date(site.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="w-5 h-5" />
                    Visual Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Visual Status</label>
                    <Badge variant={site.visual_status === 'Active' ? 'default' : 'secondary'}>
                      {site.visual_status || 'Unknown'}
                    </Badge>
                  </div>
                  {site.satellite_image_url && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Satellite Image</label>
                      <img 
                        src={site.satellite_image_url} 
                        alt="Satellite view"
                        className="w-full h-32 object-cover rounded-lg mt-1"
                      />
                    </div>
                  )}
                  {site.satellite_analysis && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Satellite Analysis</label>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(site.satellite_analysis, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
