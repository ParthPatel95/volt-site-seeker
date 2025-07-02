
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MapPin, DollarSign, Zap } from 'lucide-react';

export const VoltMarketCreateListing: React.FC = () => {
  const [listingType, setListingType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    asking_price: '',
    power_capacity_mw: '',
    square_footage: '',
    is_location_confidential: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating listing:', { listingType, ...formData });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">List your site, hosting service, or equipment on VoltMarket</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Listing Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="listing-type">Listing Type</Label>
                <Select value={listingType} onValueChange={setListingType}>
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title for your listing"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about your listing..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State, Country"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="price"
                      value={formData.asking_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, asking_price: e.target.value }))}
                      placeholder="Enter price"
                      className="pl-10"
                      type="number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="power">Power Capacity (MW)</Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="power"
                      value={formData.power_capacity_mw}
                      onChange={(e) => setFormData(prev => ({ ...prev, power_capacity_mw: e.target.value }))}
                      placeholder="Enter power capacity"
                      className="pl-10"
                      type="number"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input
                    id="sqft"
                    value={formData.square_footage}
                    onChange={(e) => setFormData(prev => ({ ...prev, square_footage: e.target.value }))}
                    placeholder="Enter square footage"
                    type="number"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidential"
                  checked={formData.is_location_confidential}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_location_confidential: checked === true }))}
                />
                <Label htmlFor="confidential" className="text-sm">
                  Keep exact location confidential (only show general area)
                </Label>
              </div>

              <div className="pt-6 border-t">
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Create Listing
                  </Button>
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
