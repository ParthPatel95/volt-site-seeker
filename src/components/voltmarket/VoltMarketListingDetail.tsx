
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoltMarketContactButton } from './VoltMarketContactButton';
import { VoltMarketWatchlistButton } from './VoltMarketWatchlistButton';
import { VoltMarketLOIModal } from './VoltMarketLOIModal';
import { VoltMarketDueDiligence } from './VoltMarketDueDiligence';
import { VoltMarketAdvancedDueDiligence } from './VoltMarketAdvancedDueDiligence';
import { VoltMarketListingAnalytics } from './VoltMarketListingAnalytics';
import { VoltMarketRealTimeData } from './VoltMarketRealTimeData';
import { VoltMarketPropertyMap } from './VoltMarketPropertyMap';
import { VoltMarketLocationDisplay } from './VoltMarketLocationDisplay';
import { VoltMarketListingImageGallery } from './VoltMarketListingImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useVoltMarketLOI } from '@/hooks/useVoltMarketLOI';
import { useVoltMarketAccessRequests } from '@/hooks/useVoltMarketAccessRequests';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Zap, 
  Building2, 
  DollarSign, 
  Calendar,
  User,
  FileText,
  Shield
} from 'lucide-react';

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  listing_type: string;
  asking_price: number;
  lease_rate: number;
  power_rate_per_kw: number;
  power_capacity_mw: number;
  created_at: string;
  status: string;
  seller_id: string;
  square_footage?: number;
  facility_tier?: string;
  cooling_type?: string;
  brand?: string;
  model?: string;
  equipment_condition?: string;
  quantity?: number;
  voltmarket_profiles: {
    company_name: string;
    is_id_verified: boolean;
    bio?: string;
  } | null;
}

export const VoltMarketListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLOIModal, setShowLOIModal] = useState(false);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  
  const { profile } = useVoltMarketAuth();
  const { submitLOI } = useVoltMarketLOI();
  const { submitAccessRequest } = useVoltMarketAccessRequests();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkNDAStatus = async () => {
    if (!id || !profile) return;

    try {
      const { data, error } = await supabase
        .from('voltmarket_nda_requests')
        .select('status')
        .eq('listing_id', id)
        .eq('requester_id', profile.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setHasSignedNDA(!!data);
    } catch (error) {
      console.error('Error checking NDA status:', error);
    }
  };

  const fetchListing = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select(`
          *,
          voltmarket_profiles!seller_id(company_name, is_id_verified, bio)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLOISubmit = async (loiData: any) => {
    if (!listing) return;

    try {
      await submitLOI(listing.id, loiData);
      setShowLOIModal(false);
      toast({
        title: "LOI Submitted",
        description: "Your Letter of Intent has been submitted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit LOI. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignNDA = async () => {
    if (!profile || !listing) return;
    
    const result = await submitAccessRequest(listing.id, profile.id, listing.seller_id);
    if (result.success) {
      toast({
        title: "Access Request Submitted",
        description: "Your request has been sent to the listing owner for approval."
      });
    }
  };

  const handleRequestAccess = (documentId: string) => {
    toast({
      title: "Access Requested",
      description: "Your request has been sent to the seller."
    });
  };

  const getPriceDisplay = () => {
    if (!listing) return '';
    
    if (listing.asking_price > 0) {
      return `$${listing.asking_price.toLocaleString()}`;
    } else if (listing.lease_rate > 0) {
      return `$${listing.lease_rate.toLocaleString()}/month`;
    } else if (listing.power_rate_per_kw > 0) {
      return `$${listing.power_rate_per_kw}/kW`;
    }
    return 'Contact for pricing';
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'site_sale': return 'Site for Sale';
      case 'site_lease': return 'Site for Lease';
      case 'hosting': return 'Hosting';
      case 'equipment': return 'Equipment';
      default: return type;
    }
  };

  useEffect(() => {
    // Check authentication first
    if (!profile) {
      navigate('/voltmarket/auth');
      return;
    }
    
    fetchListing();
    checkNDAStatus();
  }, [id, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Listing not found</h2>
            <p className="text-gray-600 mt-2">The listing you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </div>
                <Badge variant="secondary">
                  {getListingTypeLabel(listing.listing_type)}
                </Badge>
                {listing.voltmarket_profiles?.is_id_verified && (
                  <Badge variant="outline" className="text-green-600">
                    Verified Seller
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {getPriceDisplay()}
              </div>
            </div>
            <div className="flex gap-2">
              <VoltMarketWatchlistButton listingId={listing.id} />
              <VoltMarketContactButton listingId={listing.id} sellerId={listing.seller_id} listingTitle={listing.title} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className={`grid w-full ${profile?.id === listing.seller_id ? 'grid-cols-7' : 'grid-cols-6'}`}>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                {profile?.id === listing.seller_id && (
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                )}
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="seller">Seller</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Image Gallery */}
                <VoltMarketListingImageGallery listingId={listing.id} />
                
                {/* Description and Key Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {listing.description || 'No description provided.'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {listing.power_capacity_mw > 0 && (
                          <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Power Capacity</span>
                            </div>
                            <span className="text-lg font-semibold text-blue-600">{listing.power_capacity_mw}MW</span>
                          </div>
                        )}
                        {listing.square_footage && (
                          <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-green-600" />
                              <span className="font-medium">Square Footage</span>
                            </div>
                            <span className="text-lg font-semibold">{listing.square_footage.toLocaleString()} sq ft</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Location</span>
                          </div>
                          <span className="text-lg font-semibold">{listing.location}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Price</span>
                          </div>
                          <span className="text-lg font-semibold text-green-600">{getPriceDisplay()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Details */}
                {(listing.facility_tier || listing.cooling_type || listing.brand || listing.model) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {listing.facility_tier && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Facility Tier</label>
                            <p className="text-lg font-semibold">{listing.facility_tier}</p>
                          </div>
                        )}
                        {listing.cooling_type && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Cooling Type</label>
                            <p className="text-lg font-semibold">{listing.cooling_type}</p>
                          </div>
                        )}
                        {listing.brand && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Brand</label>
                            <p className="text-lg font-semibold">{listing.brand}</p>
                          </div>
                        )}
                        {listing.model && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Model</label>
                            <p className="text-lg font-semibold">{listing.model}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {listing.power_capacity_mw > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Power Capacity</label>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span>{listing.power_capacity_mw}MW</span>
                          </div>
                        </div>
                      )}
                      {listing.square_footage && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Square Footage</label>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span>{listing.square_footage.toLocaleString()} sq ft</span>
                          </div>
                        </div>
                      )}
                      {listing.facility_tier && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Facility Tier</label>
                          <span>{listing.facility_tier}</span>
                        </div>
                      )}
                      {listing.cooling_type && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Cooling Type</label>
                          <span>{listing.cooling_type}</span>
                        </div>
                      )}
                      {listing.brand && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Brand</label>
                          <span>{listing.brand}</span>
                        </div>
                      )}
                      {listing.model && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Model</label>
                          <span>{listing.model}</span>
                        </div>
                      )}
                      {listing.equipment_condition && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Condition</label>
                          <span>{listing.equipment_condition}</span>
                        </div>
                      )}
                      {listing.quantity && listing.quantity > 1 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Quantity</label>
                          <span>{listing.quantity} units</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <VoltMarketDueDiligence
                  listingId={listing.id}
                  hasSignedNDA={hasSignedNDA}
                  onSignNDA={handleSignNDA}
                  onRequestAccess={handleRequestAccess}
                />
              </TabsContent>

              <TabsContent value="analysis">
                <VoltMarketAdvancedDueDiligence
                  listingId={listing.id}
                  listingData={listing}
                />
              </TabsContent>

              {profile?.id === listing.seller_id && (
                <TabsContent value="analytics">
                  <VoltMarketListingAnalytics
                    listingId={listing.id}
                  />
                </TabsContent>
              )}

              <TabsContent value="location">
                {listing.latitude && listing.longitude ? (
                  <VoltMarketPropertyMap
                    listingId={listing.id}
                    height="h-[600px]"
                  />
                ) : (
                  <VoltMarketLocationDisplay
                    location={listing.location}
                    listingTitle={listing.title}
                  />
                )}
              </TabsContent>

              <TabsContent value="seller">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Seller Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.voltmarket_profiles?.company_name || 'Unknown Seller'}</h3>
                        {listing.voltmarket_profiles?.is_id_verified && (
                          <Badge variant="outline" className="text-green-600 mt-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {listing.voltmarket_profiles?.bio && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">About</h4>
                          <p className="text-gray-700">{listing.voltmarket_profiles.bio}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Member Since</h4>
                        <p className="text-gray-600">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <VoltMarketContactButton listingId={listing.id} sellerId={listing.seller_id} listingTitle={listing.title} className="w-full" />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowLOIModal(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit LOI
                </Button>
                <VoltMarketWatchlistButton listingId={listing.id} size="default" variant="outline" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                    {listing.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span>{getListingTypeLabel(listing.listing_type)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* LOI Modal */}
        <VoltMarketLOIModal
          isOpen={showLOIModal}
          onClose={() => setShowLOIModal(false)}
          listingId={listing.id}
          listingTitle={listing.title}
          askingPrice={listing.asking_price}
          onSubmit={handleLOISubmit}
        />
      </div>
    </div>
  );
};
