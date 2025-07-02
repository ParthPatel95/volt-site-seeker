
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin, DollarSign, Zap, Upload } from 'lucide-react';

export const VoltMarketCreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    listing_type: '',
    title: '',
    description: '',
    location: '',
    asking_price: '',
    lease_rate: '',
    power_capacity_mw: '',
    available_power_mw: '',
    power_rate_per_kw: '',
    square_footage: '',
    property_type: '',
    facility_tier: '',
    cooling_type: '',
    equipment_type: '',
    brand: '',
    model: '',
    equipment_condition: '',
    manufacture_year: '',
    quantity: '1',
    minimum_commitment_months: '',
    hosting_types: [] as string[],
    specs: {} as Record<string, any>,
    is_location_confidential: false,
    shipping_terms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.listing_type || !formData.title || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const listingData = {
        seller_id: profile.id,
        listing_type: formData.listing_type as any,
        title: formData.title,
        description: formData.description || null,
        location: formData.location,
        asking_price: formData.asking_price ? parseFloat(formData.asking_price) : null,
        lease_rate: formData.lease_rate ? parseFloat(formData.lease_rate) : null,
        power_capacity_mw: formData.power_capacity_mw ? parseFloat(formData.power_capacity_mw) : null,
        available_power_mw: formData.available_power_mw ? parseFloat(formData.available_power_mw) : null,
        power_rate_per_kw: formData.power_rate_per_kw ? parseFloat(formData.power_rate_per_kw) : null,
        square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
        property_type: formData.property_type || null,
        facility_tier: formData.facility_tier || null,
        cooling_type: formData.cooling_type || null,
        equipment_type: formData.equipment_type || null,
        brand: formData.brand || null,
        model: formData.model || null,
        equipment_condition: formData.equipment_condition || null,
        manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : null,
        quantity: parseInt(formData.quantity),
        minimum_commitment_months: formData.minimum_commitment_months ? parseInt(formData.minimum_commitment_months) : null,
        hosting_types: formData.hosting_types.length > 0 ? formData.hosting_types : null,
        specs: Object.keys(formData.specs).length > 0 ? formData.specs : null,
        is_location_confidential: formData.is_location_confidential,
        shipping_terms: formData.shipping_terms || null,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('voltmarket_listings')
        .insert(listingData)
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        toast({
          title: "Error",
          description: "Failed to create listing. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Listing created successfully!",
      });

      navigate(`/voltmarket/listings/${data.id}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">List your site, hosting service, or equipment on VoltMarket</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="listing-type">Listing Type *</Label>
                <Select value={formData.listing_type} onValueChange={(value) => updateFormData('listing_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site_sale">Site for Sale</SelectItem>
                    <SelectItem value="site_lease">Site for Lease</SelectItem>
                    <SelectItem value="hosting">Hosting Service</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Enter a descriptive title for your listing"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Provide detailed information about your listing..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="City, State, Country"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidential"
                  checked={formData.is_location_confidential}
                  onCheckedChange={(checked) => updateFormData('is_location_confidential', checked === true)}
                />
                <Label htmlFor="confidential" className="text-sm">
                  Keep exact location confidential (only show general area)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.listing_type === 'site_sale' || formData.listing_type === 'equipment') && (
                <div>
                  <Label htmlFor="asking-price">Asking Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="asking-price"
                      value={formData.asking_price}
                      onChange={(e) => updateFormData('asking_price', e.target.value)}
                      placeholder="Enter price"
                      className="pl-10"
                      type="number"
                    />
                  </div>
                </div>
              )}

              {formData.listing_type === 'site_lease' && (
                <div>
                  <Label htmlFor="lease-rate">Lease Rate (per month)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="lease-rate"
                      value={formData.lease_rate}
                      onChange={(e) => updateFormData('lease_rate', e.target.value)}
                      placeholder="Enter monthly lease rate"
                      className="pl-10"
                      type="number"
                    />
                  </div>
                </div>
              )}

              {formData.listing_type === 'hosting' && (
                <div>
                  <Label htmlFor="power-rate">Power Rate (per kW)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="power-rate"
                      value={formData.power_rate_per_kw}
                      onChange={(e) => updateFormData('power_rate_per_kw', e.target.value)}
                      placeholder="Enter rate per kW"
                      className="pl-10"
                      type="number"
                      step="0.001"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="power-capacity">Power Capacity (MW)</Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="power-capacity"
                      value={formData.power_capacity_mw}
                      onChange={(e) => updateFormData('power_capacity_mw', e.target.value)}
                      placeholder="Enter power capacity"
                      className="pl-10"
                      type="number"
                      step="0.1"
                    />
                  </div>
                </div>

                {formData.listing_type === 'hosting' && (
                  <div>
                    <Label htmlFor="available-power">Available Power (MW)</Label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="available-power"
                        value={formData.available_power_mw}
                        onChange={(e) => updateFormData('available_power_mw', e.target.value)}
                        placeholder="Enter available power"
                        className="pl-10"
                        type="number"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input
                    id="sqft"
                    value={formData.square_footage}
                    onChange={(e) => updateFormData('square_footage', e.target.value)}
                    placeholder="Enter square footage"
                    type="number"
                  />
                </div>

                {formData.listing_type === 'equipment' && (
                  <>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        value={formData.quantity}
                        onChange={(e) => updateFormData('quantity', e.target.value)}
                        placeholder="Enter quantity"
                        type="number"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Equipment specific fields */}
              {formData.listing_type === 'equipment' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipment-type">Equipment Type</Label>
                    <Select value={formData.equipment_type} onValueChange={(value) => updateFormData('equipment_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asic_miner">ASIC Miner</SelectItem>
                        <SelectItem value="gpu_rig">GPU Rig</SelectItem>
                        <SelectItem value="transformer">Transformer</SelectItem>
                        <SelectItem value="generator">Generator</SelectItem>
                        <SelectItem value="cooling_system">Cooling System</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formData.equipment_condition} onValueChange={(value) => updateFormData('equipment_condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="for_parts">For Parts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => updateFormData('brand', e.target.value)}
                      placeholder="Enter brand"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => updateFormData('model', e.target.value)}
                      placeholder="Enter model"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Listing"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/voltmarket/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
