import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import { VoltMarketImageUpload } from './VoltMarketImageUpload';
import { Database } from '@/integrations/supabase/types';

type VoltMarketListingType = Database['public']['Enums']['voltmarket_listing_type'];
type VoltMarketPropertyType = Database['public']['Enums']['voltmarket_property_type'];

interface ListingData {
  id: string;
  title: string;
  description: string;
  listing_type: VoltMarketListingType;
  asking_price: number;
  power_capacity_mw: number;
  location: string;
  property_type?: VoltMarketPropertyType;
  zoning?: string;
  total_acreage?: number;
  available_acreage?: number;
  utility_provider?: string;
  transmission_access?: boolean;
  environmental_permits?: boolean;
  status: string;
}

export const VoltMarketEditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (id && profile?.id) {
      fetchListing();
    }
  }, [id, profile?.id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select('*')
        .eq('id', id)
        .eq('seller_id', profile!.id)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: "Error",
          description: "Failed to load listing or you don't have permission to edit it",
          variant: "destructive"
        });
        navigate('/voltmarket/dashboard');
        return;
      }

      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ListingData, value: any) => {
    if (!listing) return;
    setListing({ ...listing, [field]: value });
  };

  const handleSave = async () => {
    if (!listing || !profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('voltmarket_listings')
        .update({
          title: listing.title,
          description: listing.description,
          listing_type: listing.listing_type,
          asking_price: listing.asking_price,
          power_capacity_mw: listing.power_capacity_mw,
          location: listing.location,
          property_type: listing.property_type,
          zoning: listing.zoning,
          total_acreage: listing.total_acreage,
          available_acreage: listing.available_acreage,
          utility_provider: listing.utility_provider,
          transmission_access: listing.transmission_access,
          environmental_permits: listing.environmental_permits,
          updated_at: new Date().toISOString()
        })
        .eq('id', listing.id)
        .eq('seller_id', profile.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
      
      navigate('/voltmarket/dashboard');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading listing...</h2>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing not found</h2>
          <Button onClick={() => navigate('/voltmarket/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/voltmarket/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={listing.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter listing title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={listing.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your property or listing"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="listing_type">Listing Type *</Label>
                  <Select value={listing.listing_type} onValueChange={(value: VoltMarketListingType) => handleInputChange('listing_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site_sale">Site Sale</SelectItem>
                      <SelectItem value="site_lease">Site Lease</SelectItem>
                      <SelectItem value="hosting">Hosting</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={listing.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asking_price">Asking Price ($) *</Label>
                  <Input
                    id="asking_price"
                    type="number"
                    value={listing.asking_price}
                    onChange={(e) => handleInputChange('asking_price', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="power_capacity_mw">Power Capacity (MW) *</Label>
                  <Input
                    id="power_capacity_mw"
                    type="number"
                    step="0.1"
                    value={listing.power_capacity_mw}
                    onChange={(e) => handleInputChange('power_capacity_mw', parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select value={listing.property_type || ''} onValueChange={(value: VoltMarketPropertyType) => handleInputChange('property_type', value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_center">Data Center</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="total_acreage">Total Acreage</Label>
                  <Input
                    id="total_acreage"
                    type="number"
                    step="0.1"
                    value={listing.total_acreage || ''}
                    onChange={(e) => handleInputChange('total_acreage', parseFloat(e.target.value) || null)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="available_acreage">Available Acreage</Label>
                  <Input
                    id="available_acreage"
                    type="number"
                    step="0.1"
                    value={listing.available_acreage || ''}
                    onChange={(e) => handleInputChange('available_acreage', parseFloat(e.target.value) || null)}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="zoning">Zoning</Label>
                  <Input
                    id="zoning"
                    value={listing.zoning || ''}
                    onChange={(e) => handleInputChange('zoning', e.target.value)}
                    placeholder="e.g., Industrial, Commercial"
                  />
                </div>

                <div>
                  <Label htmlFor="utility_provider">Utility Provider</Label>
                  <Input
                    id="utility_provider"
                    value={listing.utility_provider || ''}
                    onChange={(e) => handleInputChange('utility_provider', e.target.value)}
                    placeholder="e.g., PG&E, ConEd"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <VoltMarketImageUpload 
                listingId={listing.id}
                existingImages={images}
                onImagesChange={setImages}
                bucket="listing-images"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/voltmarket/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};