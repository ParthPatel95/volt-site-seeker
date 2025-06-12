
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Building, Save } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PropertyType = Database['public']['Enums']['property_type'];

interface PropertyFormProps {
  onPropertyAdded?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({ onPropertyAdded, onCancel }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: '' as PropertyType,
    square_footage: '',
    lot_size_acres: '',
    asking_price: '',
    year_built: '',
    power_capacity_mw: '',
    substation_distance_miles: '',
    transmission_access: false,
    zoning: '',
    description: '',
    listing_url: '',
    source: 'manual'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const propertyData = {
        ...formData,
        square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
        lot_size_acres: formData.lot_size_acres ? parseFloat(formData.lot_size_acres) : null,
        asking_price: formData.asking_price ? parseFloat(formData.asking_price) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        power_capacity_mw: formData.power_capacity_mw ? parseFloat(formData.power_capacity_mw) : null,
        substation_distance_miles: formData.substation_distance_miles ? parseFloat(formData.substation_distance_miles) : null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('properties')
        .insert(propertyData);

      if (error) throw error;

      toast({
        title: "Property added!",
        description: "The property has been successfully added to the database.",
      });

      if (onPropertyAdded) onPropertyAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Add New Property
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">Zip Code *</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type *</Label>
              <Select value={formData.property_type} onValueChange={(value: PropertyType) => handleInputChange('property_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="data_center">Data Center</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="flex_space">Flex Space</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="square_footage">Square Footage</Label>
              <Input
                id="square_footage"
                type="number"
                value={formData.square_footage}
                onChange={(e) => handleInputChange('square_footage', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot_size_acres">Lot Size (Acres)</Label>
              <Input
                id="lot_size_acres"
                type="number"
                step="0.01"
                value={formData.lot_size_acres}
                onChange={(e) => handleInputChange('lot_size_acres', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asking_price">Asking Price ($)</Label>
              <Input
                id="asking_price"
                type="number"
                step="0.01"
                value={formData.asking_price}
                onChange={(e) => handleInputChange('asking_price', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_built">Year Built</Label>
              <Input
                id="year_built"
                type="number"
                value={formData.year_built}
                onChange={(e) => handleInputChange('year_built', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="power_capacity_mw">Power Capacity (MW)</Label>
              <Input
                id="power_capacity_mw"
                type="number"
                step="0.1"
                value={formData.power_capacity_mw}
                onChange={(e) => handleInputChange('power_capacity_mw', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="substation_distance_miles">Distance to Substation (Miles)</Label>
              <Input
                id="substation_distance_miles"
                type="number"
                step="0.1"
                value={formData.substation_distance_miles}
                onChange={(e) => handleInputChange('substation_distance_miles', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoning">Zoning</Label>
              <Input
                id="zoning"
                value={formData.zoning}
                onChange={(e) => handleInputChange('zoning', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="transmission_access"
              checked={formData.transmission_access}
              onCheckedChange={(checked) => handleInputChange('transmission_access', checked)}
            />
            <Label htmlFor="transmission_access">Transmission Access Available</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listing_url">Listing URL</Label>
            <Input
              id="listing_url"
              type="url"
              value={formData.listing_url}
              onChange={(e) => handleInputChange('listing_url', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Adding Property...' : 'Add Property'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
