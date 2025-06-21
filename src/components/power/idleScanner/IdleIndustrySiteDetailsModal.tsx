
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Zap, Factory, Calendar, Phone, Globe, Star, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IdleIndustrySite } from './types';

interface IdleIndustrySiteDetailsModalProps {
  site: IdleIndustrySite | null;
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

  const fetchSiteDetails = async () => {
    if (!site) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('idle-industry-scanner', {
        body: {
          action: 'get_site_details',
          coordinates: site.coordinates,
          siteName: site.name
        }
      });

      if (error) throw error;

      setSiteDetails(data.details);
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

  useEffect(() => {
    if (open && site) {
      fetchSiteDetails();
    }
  }, [open, site]);

  if (!site) return null;

  const getIdleScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-800">Critical ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-orange-100 text-orange-800">High ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium ({score})</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low ({score})</Badge>;
  };

  const getRetrofitCostBadge = (cost: string) => {
    const colors = {
      'L': 'bg-green-100 text-green-800',
      'M': 'bg-yellow-100 text-yellow-800', 
      'H': 'bg-red-100 text-red-800'
    };
    const labels = { 'L': 'Low', 'M': 'Medium', 'H': 'High' };
    return <Badge className={colors[cost as keyof typeof colors]}>{labels[cost as keyof typeof labels]}</Badge>;
  };

  const getBusinessStatusBadge = (status: string) => {
    const statusColors = {
      'OPERATIONAL': 'bg-green-100 text-green-800',
      'CLOSED_TEMPORARILY': 'bg-yellow-100 text-yellow-800',
      'CLOSED_PERMANENTLY': 'bg-red-100 text-red-800',
      'UNKNOWN': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ')}
    </Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Factory className="w-6 h-6 text-orange-600" />
            {site.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location & Basic Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm">{site.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">City, State</label>
                    <p className="text-sm">{site.city}, {site.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Industry Type</label>
                    <p className="text-sm">{site.industryType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">NAICS Code</label>
                    <p className="text-sm">{site.naicsCode}</p>
                  </div>
                  {site.operationalStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Operational Status</label>
                      <div className="mt-1">{getBusinessStatusBadge(site.operationalStatus)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Power Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Historical Peak</label>
                    <p className="text-lg font-semibold">{site.historicalPeakMW} MW</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estimated Free Capacity</label>
                    <p className="text-lg font-semibold text-green-600">{site.estimatedFreeMW} MW</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Capacity Utilization</label>
                    <p className="text-sm">{site.capacityUtilization}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Substation Distance</label>
                    <p className="text-sm">{site.substationDistanceKm.toFixed(1)} km</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {siteDetails?.photos && siteDetails.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Facility Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {siteDetails.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${site.name} photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Idle Score Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Idle Score</label>
                    <div className="mt-1">{getIdleScoreBadge(site.idleScore)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Confidence Level</label>
                    <p className="text-sm">{site.confidenceLevel}%</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Analysis Evidence</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{site.evidenceText}</p>
                </div>

                {site.visionAnalysis && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vision Analysis Indicators</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {Object.entries(site.visionAnalysis).map(([key, value]) => (
                        typeof value === 'number' && (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span>{(value * 100).toFixed(1)}%</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recommended Strategy</label>
                    <Badge variant="secondary" className="mt-1">
                      {site.recommendedStrategy.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Retrofit Cost Class</label>
                    <div className="mt-1">{getRetrofitCostBadge(site.retrofitCostClass)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Facility Information</label>
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Facility Size:</span>
                      <span>{site.facilitySize?.toLocaleString()} sq ft</span>
                    </div>
                    {site.yearBuilt && (
                      <div className="flex justify-between">
                        <span>Year Built:</span>
                        <span>{site.yearBuilt}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading additional details...</p>
                </div>
              </div>
            ) : siteDetails ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Google Places Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Business Name</label>
                        <p className="text-sm">{siteDetails.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <p className="text-sm">{siteDetails.address}</p>
                      </div>
                      {siteDetails.rating && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Rating</label>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{siteDetails.rating}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-600">Business Status</label>
                        <div className="mt-1">{getBusinessStatusBadge(siteDetails.businessStatus)}</div>
                      </div>
                    </div>

                    {siteDetails.phoneNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{siteDetails.phoneNumber}</span>
                        </div>
                      </div>
                    )}

                    {siteDetails.website && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Website</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={siteDetails.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {siteDetails.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {siteDetails.openingHours && siteDetails.openingHours.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Opening Hours</label>
                        <div className="mt-1 space-y-1">
                          {siteDetails.openingHours.map((hours, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Clock className="w-3 h-3" />
                              <span>{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {siteDetails.reviews && siteDetails.reviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {siteDetails.reviews.map((review, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{review.author_name}</span>
                            </div>
                            <p className="text-sm text-gray-600">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No additional details available</p>
                <Button 
                  onClick={fetchSiteDetails} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Retry Loading Details
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
