import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { VoltMarketImageUpload } from './VoltMarketImageUpload';
import { VoltMarketDocumentUpload } from './VoltMarketDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Zap, Camera, FileText } from 'lucide-react';
import { GooglePlacesInput } from '@/components/ui/google-places-input';

export const VoltMarketCreateListing: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    listing_type: 'site_sale' as 'site_sale' | 'site_lease' | 'hosting' | 'equipment',
    asking_price: 0,
    lease_rate: 0,
    power_rate_per_kw: 0,
    power_capacity_mw: 0,
    available_power_mw: 0,
    square_footage: 0,
    is_location_confidential: false,
    property_type: 'other' as 'other' | 'industrial' | 'warehouse' | 'data_center' | 'land' | 'office',
    facility_tier: '',
    cooling_type: '',
    hosting_types: [] as string[],
    minimum_commitment_months: 0,
    equipment_type: 'other' as 'other' | 'asic' | 'gpu' | 'cooling' | 'generator' | 'ups' | 'transformer',
    brand: '',
    model: '',
    specs: {},
    equipment_condition: 'new' as 'new' | 'used' | 'refurbished',
    manufacture_year: new Date().getFullYear(),
    quantity: 1,
    shipping_terms: ''
  });

  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Profile:', profile);
    console.log('Form data:', formData);
    
    if (!profile) {
      console.error('No profile found');
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a listing",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.location || !formData.listing_type) {
      console.error('Missing required fields:', { title: formData.title, location: formData.location, listing_type: formData.listing_type });
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating listing with data:', {
        ...formData,
        seller_id: profile.id,
        status: 'active'
      });

      // First create the listing
      const { data: listing, error: listingError } = await supabase
        .from('voltmarket_listings')
        .insert({
          ...formData,
          seller_id: profile.id,
          status: 'active' as const
        })
        .select()
        .single();

      console.log('Listing creation result:', { listing, listingError });

      if (listingError) {
        console.error('Listing error details:', listingError);
        throw listingError;
      }

      // Then save images to the listing_images table
      if (images.length > 0) {
        console.log('Saving images:', images);
        const imageInserts = images.map((imageUrl, index) => ({
          listing_id: listing.id,
          image_url: imageUrl,
          sort_order: index
        }));

        const { error: imageError } = await supabase
          .from('voltmarket_listing_images')
          .insert(imageInserts);

        if (imageError) {
          console.error('Error saving images:', imageError);
        }
      }

      // Then save documents to the documents table
      if (documents.length > 0) {
        console.log('Saving documents:', documents);
        const documentInserts = documents.map((doc) => ({
          listing_id: listing.id,
          uploader_id: profile.id,
          file_name: doc.name,
          file_url: doc.url,
          file_type: doc.type,
          file_size: doc.size,
          document_type: doc.document_type,
          description: doc.description || null,
          is_private: true
        }));

        const { error: documentError } = await supabase
          .from('voltmarket_documents')
          .insert(documentInserts);

        if (documentError) {
          console.error('Error saving documents:', documentError);
        } else {
          console.log('Documents saved successfully');
        }
      }

      console.log('Listing created successfully');
      toast({
        title: "Listing Created",
        description: "Your listing has been published successfully"
      });

      navigate('/voltmarket/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: `Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  if (!profile || profile.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
            <p className="text-gray-600 mt-2">Only verified sellers can create listings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">List your site, hosting facility, or equipment</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., 50MW Data Center Site - Texas"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="listing_type">Listing Type *</Label>
                  <Select value={formData.listing_type} onValueChange={(value: 'site_sale' | 'site_lease' | 'hosting' | 'equipment') => 
                    setFormData(prev => ({ ...prev, listing_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site_sale">Site for Sale</SelectItem>
                      <SelectItem value="site_lease">Site for Lease</SelectItem>
                      <SelectItem value="hosting">Hosting</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <GooglePlacesInput
                    value={formData.location}
                    onChange={(location, placeId, coordinates) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        location,
                        latitude: coordinates?.lat || null,
                        longitude: coordinates?.lng || null
                      }));
                    }}
                    placeholder="e.g., Dallas, TX or full address"
                    className="w-full"
                  />
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ✓ Coordinates found ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_location_confidential"
                    checked={formData.is_location_confidential}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_location_confidential: !!checked }))}
                  />
                  <Label htmlFor="is_location_confidential">Keep exact location confidential</Label>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your listing in detail..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoltMarketImageUpload
                  existingImages={images}
                  onImagesChange={setImages}
                  maxImages={20}
                  bucket="listing-images"
                />
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoltMarketDocumentUpload
                  existingDocuments={documents}
                  onDocumentsChange={setDocuments}
                  maxDocuments={10}
                />
              </CardContent>
            </Card>

            {/* Pricing & Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Pricing & Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.listing_type === 'site_sale') && (
                    <div>
                      <Label htmlFor="asking_price">Asking Price ($)</Label>
                      <Input
                        id="asking_price"
                        type="number"
                        value={formData.asking_price || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          asking_price: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {(formData.listing_type === 'site_lease') && (
                    <div>
                      <Label htmlFor="lease_rate">Monthly Lease Rate ($)</Label>
                      <Input
                        id="lease_rate"
                        type="number"
                        value={formData.lease_rate || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          lease_rate: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {(formData.listing_type === 'hosting') && (
                    <div>
                      <Label htmlFor="power_rate_per_kw">Power Rate ($/kW)</Label>
                      <Input
                        id="power_rate_per_kw"
                        type="number"
                        step="0.001"
                        value={formData.power_rate_per_kw || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          power_rate_per_kw: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0.050"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="power_capacity_mw">Power Capacity (MW)</Label>
                    <Input
                      id="power_capacity_mw"
                      type="number"
                      step="0.1"
                      value={formData.power_capacity_mw || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        power_capacity_mw: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="square_footage">Square Footage</Label>
                    <Input
                      id="square_footage"
                      type="number"
                      value={formData.square_footage || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        square_footage: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="0"
                    />
                  </div>

                  {(formData.listing_type === 'site_sale' || formData.listing_type === 'site_lease') && (
                    <>
                      <div>
                        <Label htmlFor="facility_tier">Facility Tier</Label>
                        <Select value={formData.facility_tier} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, facility_tier: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tier-1">Tier 1</SelectItem>
                            <SelectItem value="tier-2">Tier 2</SelectItem>
                            <SelectItem value="tier-3">Tier 3</SelectItem>
                            <SelectItem value="tier-4">Tier 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cooling_type">Cooling Type</Label>
                        <Select value={formData.cooling_type} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, cooling_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cooling type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="air-cooled">Air Cooled</SelectItem>
                            <SelectItem value="liquid-cooled">Liquid Cooled</SelectItem>
                            <SelectItem value="immersion">Immersion</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {formData.listing_type === 'equipment' && (
                    <>
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="e.g., Bitmain"
                        />
                      </div>

                      <div>
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="e.g., Antminer S19 Pro"
                        />
                      </div>

                      <div>
                        <Label htmlFor="equipment_condition">Condition</Label>
                        <Select value={formData.equipment_condition} onValueChange={(value: 'new' | 'used' | 'refurbished') => 
                          setFormData(prev => ({ ...prev, equipment_condition: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                            <SelectItem value="refurbished">Refurbished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            quantity: parseInt(e.target.value) || 1 
                          }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/voltmarket/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Listing'}
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
