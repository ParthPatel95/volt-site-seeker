import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { VoltMarketImageUpload } from './VoltMarketImageUpload';
import { VoltMarketDocumentUpload } from './VoltMarketDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Zap, Camera, FileText, MapPin, Settings, Tag, ChevronLeft, ChevronRight, CheckCircle, Wand2 } from 'lucide-react';
import { GooglePlacesInput } from '@/components/ui/google-places-input';

const categoryTags = [
  'Greenfield',
  'Brownfield', 
  'Powered Land',
  'Operational Facility',
  'Modular Containers',
  'Substation Access',
  'Transformer Onsite',
  'Behind-the-Meter',
  'Renewable Site'
];

const steps = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Specifications', icon: Settings },
  { id: 3, title: 'Media & Tags', icon: Camera },
  { id: 4, title: 'Review', icon: CheckCircle }
];

export const VoltMarketCreateListing: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [autoDescription, setAutoDescription] = useState('');
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

  // Auto-generate description based on form data
  useEffect(() => {
    generateDescription();
  }, [formData, selectedTags]);

  const generateDescription = () => {
    const { title, listing_type, power_capacity_mw, square_footage } = formData;
    
    let description = '';
    
    if (title) description += `${title}\n\n`;
    
    if (listing_type === 'site_sale' || listing_type === 'site_lease') {
      description += `This property offers `;
      if (power_capacity_mw > 0) description += `${power_capacity_mw}MW of power capacity `;
      if (square_footage > 0) description += `with ${square_footage} square feet `;
      description += `located in ${formData.location || '[Location]'}.\n\n`;
      
      if (selectedTags.length > 0) {
        description += `Features: ${selectedTags.join(', ')}\n`;
      }
    } else if (listing_type === 'hosting') {
      description += `Professional hosting facility with ${power_capacity_mw}MW capacity available for cryptocurrency mining operations.\n\n`;
      description += `Competitive rates starting at $${formData.power_rate_per_kw}/kW.\n`;
    } else if (listing_type === 'equipment') {
      description += `${formData.equipment_condition} ${formData.brand} ${formData.model} equipment available.\n\n`;
      if (formData.quantity > 1) description += `Quantity available: ${formData.quantity} units\n`;
    }

    setAutoDescription(description.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a listing",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.location || !formData.listing_type) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check authentication before proceeding
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to create a listing",
          variant: "destructive"
        });
        navigate('/voltmarket/auth');
        return;
      }

      // Create listing with auto-generated description and tags
      const listingData = {
        title: formData.title,
        description: autoDescription || formData.description,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        listing_type: formData.listing_type,
        asking_price: formData.asking_price,
        lease_rate: formData.lease_rate,
        power_rate_per_kw: formData.power_rate_per_kw,
        power_capacity_mw: formData.power_capacity_mw,
        available_power_mw: formData.available_power_mw,
        square_footage: formData.square_footage,
        is_location_confidential: formData.is_location_confidential,
        property_type: formData.property_type,
        facility_tier: formData.facility_tier,
        cooling_type: formData.cooling_type,
        hosting_types: formData.hosting_types,
        minimum_commitment_months: formData.minimum_commitment_months,
        equipment_type: formData.equipment_type,
        brand: formData.brand,
        model: formData.model,
        specs: formData.specs,
        equipment_condition: formData.equipment_condition,
        manufacture_year: formData.manufacture_year,
        quantity: formData.quantity,
        shipping_terms: formData.shipping_terms,
        seller_id: profile.id,
        status: 'active' as const
      };

      const { data: listing, error: listingError } = await supabase
        .from('voltmarket_listings')
        .insert(listingData)
        .select()
        .single();

      if (listingError) {
        console.error('Listing creation error:', listingError);
        toast({
          title: "Error Creating Listing",
          description: `Database error: ${listingError.message || JSON.stringify(listingError)}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Save images
      if (images.length > 0) {
        const imageInserts = images.map((imageUrl, index) => ({
          listing_id: listing.id,
          image_url: imageUrl,
          sort_order: index
        }));

        await supabase.from('voltmarket_listing_images').insert(imageInserts);
      }

      // Save documents
      if (documents.length > 0) {
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

        await supabase.from('voltmarket_documents').insert(documentInserts);
      }

      toast({
        title: "Listing Created",
        description: "Your listing has been published successfully"
      });

      navigate('/voltmarket/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return formData.title && formData.location && formData.listing_type;
    }
    return true;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">Follow the steps below to create your listing</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isCurrent ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-200 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-16 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
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
              </CardContent>
            </Card>
          )}

          {/* Step 2: Specifications */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Specifications & Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(value: 'other' | 'industrial' | 'warehouse' | 'data_center' | 'land' | 'office') => 
                      setFormData(prev => ({ ...prev, property_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="data_center">Data Center</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="facility_tier">Facility Tier</Label>
                    <Input
                      id="facility_tier"
                      value={formData.facility_tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, facility_tier: e.target.value }))}
                      placeholder="e.g., Tier 3, Tier 4"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.listing_type === 'site_sale' && (
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

                  {formData.listing_type === 'site_lease' && (
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

                  {formData.listing_type === 'hosting' && (
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
                </div>

                {/* Equipment specific fields */}
                {formData.listing_type === 'equipment' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Media & Tags */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Photos */}
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

              {/* Documents */}
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

              {/* Category Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Category Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Choose one or more tags that best describe your listing:</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Selected tags:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="default">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review & Auto-Generated Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-4 h-4" />
                    <Label>Auto-Generated Description</Label>
                  </div>
                  <Textarea
                    value={autoDescription}
                    onChange={(e) => setAutoDescription(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This description was automatically generated based on your inputs. You can edit it above.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Title:</strong> {formData.title}
                  </div>
                  <div>
                    <strong>Type:</strong> {formData.listing_type.replace('_', ' ')}
                  </div>
                  <div>
                    <strong>Location:</strong> {formData.location}
                  </div>
                  <div>
                    <strong>Power Capacity:</strong> {formData.power_capacity_mw}MW
                  </div>
                  {formData.square_footage > 0 && (
                    <div>
                      <strong>Square Footage:</strong> {formData.square_footage.toLocaleString()} sq ft
                    </div>
                  )}
                  {selectedTags.length > 0 && (
                    <div className="md:col-span-2">
                      <strong>Tags:</strong> {selectedTags.join(', ')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/voltmarket/dashboard')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep > 1 ? 'Previous' : 'Cancel'}
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNextStep()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Listing'}
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};