
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Shield, 
  Brain, 
  Satellite, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Star,
  Phone,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { VerifiedHeavyPowerSite } from './realdata_types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox public token
mapboxgl.accessToken = 'pk.eyJ1Ijoidm9sdHNjb3V0IiwiYSI6ImNtYnpqeWtmeDF5YjkycXB2MzQ3YWk0YzIifQ.YkeTxxJcGkgHTpt9miLk6A';

interface RealDataSiteDetailsModalProps {
  site: VerifiedHeavyPowerSite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RealDataSiteDetailsModal({ site, open, onOpenChange }: RealDataSiteDetailsModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const initializeMap = () => {
    if (!mapContainer.current || !site || map.current) return;

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

    // Add a marker for the verified site
    const marker = new mapboxgl.Marker({
      color: site.confidenceScore.level === 'High' ? '#10b981' : 
             site.confidenceScore.level === 'Medium' ? '#f59e0b' : '#ef4444',
      scale: 1.2
    })
      .setLngLat([site.coordinates.lng, site.coordinates.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${site.name}</h3>
          <p class="text-xs text-gray-600">Confidence: ${site.confidenceScore.total}%</p>
          <p class="text-xs">${site.city}, ${site.state}</p>
        </div>
      `))
      .addTo(map.current);

    // Show popup initially
    marker.getPopup().addTo(map.current);
  };

  useEffect(() => {
    if (open && site) {
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

  const getConfidenceBadge = (score: number, level: string) => {
    const colors = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[level as keyof typeof colors]}>{level} ({score}%)</Badge>;
  };

  const getVisualStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Idle': 'bg-yellow-100 text-yellow-800',
      'Likely Abandoned': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const handleViewOnGoogleMaps = () => {
    const url = `https://maps.google.com/?q=${site.coordinates.lat},${site.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            {site.name}
            <Button
              onClick={handleViewOnGoogleMaps}
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Maps
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="gpt-analysis">GPT Analysis</TabsTrigger>
            <TabsTrigger value="satellite">Satellite</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm">{site.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm">{site.city}, {site.state}</p>
                  </div>
                  {site.listingPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Listing Price</label>
                      <p className="text-sm font-semibold">${site.listingPrice.toLocaleString()}</p>
                    </div>
                  )}
                  {site.squareFootage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Square Footage</label>
                      <p className="text-sm">{site.squareFootage.toLocaleString()} sq ft</p>
                    </div>
                  )}
                  {site.yearBuilt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Year Built</label>
                      <p className="text-sm">{site.yearBuilt}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Confidence Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Overall Confidence</label>
                    <div className="mt-1">{getConfidenceBadge(site.confidenceScore.total, site.confidenceScore.level)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Score Breakdown</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Verified Address:</span>
                        <span className="font-medium">+{site.confidenceScore.breakdown.verifiedAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Origin:</span>
                        <span className="font-medium">+{site.confidenceScore.breakdown.apiOrigin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Power Potential:</span>
                        <span className="font-medium">+{site.confidenceScore.breakdown.powerPotential}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satellite Active:</span>
                        <span className="font-medium">+{site.confidenceScore.breakdown.satelliteActive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Operating:</span>
                        <span className="font-medium">+{site.confidenceScore.breakdown.businessOperating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Google Recency:</span>
                        <span className="font-medium">+{site.confidenceScore.breakdown.googleRecency}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Data Sources</label>
                    <p className="text-sm">{site.sources.length} sources verified</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {site.satelliteAnalysis.imageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Satellite Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img
                      src={site.satelliteAnalysis.imageUrl}
                      alt={`Satellite view of ${site.name}`}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Visual Status</label>
                        <div className="mt-1">{getVisualStatusBadge(site.satelliteAnalysis.visualStatus)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Analysis Confidence</label>
                        <p className="text-sm">{site.satelliteAnalysis.analysisConfidence}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Multi-Source Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Verification Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {site.validation.isVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {site.validation.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address Matches</label>
                    <p className="text-sm">{site.validation.addressMatches} of {site.sources.length} sources</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Sources Found</label>
                  <div className="mt-2 space-y-2">
                    {site.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{source.name}</span>
                        <div className="flex items-center gap-2">
                          {source.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-xs text-gray-600">{source.lastChecked}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Google Search Results:</span>
                    <p className="font-medium">{site.validation.googleSearchResults}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">OpenStreetMap Match:</span>
                    <p className="font-medium">{site.validation.openStreetMapMatch ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gpt-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  GPT-4 Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Power Potential</label>
                    <Badge variant={
                      site.gptAnalysis.powerPotential === 'High' ? 'default' :
                      site.gptAnalysis.powerPotential === 'Medium' ? 'secondary' : 
                      'outline'
                    } className="mt-1">
                      {site.gptAnalysis.powerPotential}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Industrial Status</label>
                    <Badge variant="outline" className="mt-1">
                      {site.gptAnalysis.industrialStatus}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">AI Summary</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{site.gptAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recent Activity</label>
                    <p className="text-sm">{site.gptAnalysis.recentActivity ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Confidence Reasons</label>
                    <p className="text-sm">{site.gptAnalysis.confidenceReasons.length} factors</p>
                  </div>
                </div>

                {site.gptAnalysis.abandonedIndicators.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Abandoned Indicators</label>
                    <div className="mt-1 space-y-1">
                      {site.gptAnalysis.abandonedIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          <span>{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satellite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Satellite className="w-5 h-5" />
                  Satellite Image Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {site.satelliteAnalysis.imageUrl && (
                      <img
                        src={site.satelliteAnalysis.imageUrl}
                        alt={`Satellite analysis of ${site.name}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Visual Status</label>
                      <div className="mt-1">{getVisualStatusBadge(site.satelliteAnalysis.visualStatus)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Analysis Confidence</label>
                      <p className="text-sm">{site.satelliteAnalysis.analysisConfidence}%</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Detected Indicators</label>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Overgrowth Detected:</span>
                          <span className={site.satelliteAnalysis.overgrowthDetected ? 'text-red-600' : 'text-green-600'}>
                            {site.satelliteAnalysis.overgrowthDetected ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Empty Areas:</span>
                          <span className={site.satelliteAnalysis.emptyAreas ? 'text-red-600' : 'text-green-600'}>
                            {site.satelliteAnalysis.emptyAreas ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rusted Infrastructure:</span>
                          <span className={site.satelliteAnalysis.rustedInfrastructure ? 'text-red-600' : 'text-green-600'}>
                            {site.satelliteAnalysis.rustedInfrastructure ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Smokestacks:</span>
                          <span className={site.satelliteAnalysis.activeSmokestacks ? 'text-green-600' : 'text-red-600'}>
                            {site.satelliteAnalysis.activeSmokestacks ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Site Location Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Coordinates:</span>
                      <p className="font-mono">{site.coordinates.lat.toFixed(6)}, {site.coordinates.lng.toFixed(6)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <p>{new Date(site.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div 
                    ref={mapContainer} 
                    className="w-full h-96 rounded-lg border"
                    style={{ minHeight: '400px' }}
                  />
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>High-resolution satellite imagery shows site details</span>
                    <span>© Mapbox © OpenStreetMap</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
