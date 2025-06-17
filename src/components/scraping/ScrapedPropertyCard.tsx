
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapPropertyType } from '@/utils/scrapedPropertyUtils';
import { PropertyCardHeader } from './PropertyCardHeader';
import { PropertyStatsGrid } from './PropertyStatsGrid';
import { PropertyDetailsSection } from './PropertyDetailsSection';
import { PropertyCardActions } from './PropertyCardActions';
import { Trash2 } from 'lucide-react';
import type { ScrapedProperty } from '@/types/scrapedProperty';

interface ScrapedPropertyCardProps {
  property: ScrapedProperty;
  onMoveToProperties: () => void;
  onDelete: () => void;
}

export function ScrapedPropertyCard({ property, onMoveToProperties, onDelete }: ScrapedPropertyCardProps) {
  const [moving, setMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const moveToProperties = async () => {
    setMoving(true);
    try {
      // Insert into main properties table with proper type mapping
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          address: property.address,
          city: property.city,
          state: property.state,
          zip_code: property.zip_code || '',
          property_type: mapPropertyType(property.property_type),
          square_footage: property.square_footage,
          lot_size_acres: property.lot_size_acres,
          asking_price: property.asking_price,
          price_per_sqft: property.price_per_sqft,
          year_built: property.year_built,
          power_capacity_mw: property.power_capacity_mw,
          substation_distance_miles: property.substation_distance_miles,
          transmission_access: property.transmission_access,
          zoning: property.zoning,
          description: property.description,
          listing_url: property.listing_url,
          source: 'ai_scraper',
          status: 'available'
        });

      if (insertError) throw insertError;

      // Mark as moved in scraped_properties table
      const { error: updateError } = await supabase
        .from('scraped_properties')
        .update({ moved_to_properties: true })
        .eq('id', property.id);

      if (updateError) throw updateError;

      toast({
        title: "Property Added!",
        description: "Property has been moved to your main property list.",
      });

      onMoveToProperties();
    } catch (error: any) {
      console.error('Error moving property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to move property",
        variant: "destructive"
      });
    } finally {
      setMoving(false);
    }
  };

  const deleteProperty = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('scraped_properties')
        .delete()
        .eq('id', property.id);

      if (error) throw error;

      toast({
        title: "Property Deleted",
        description: "Property has been permanently deleted.",
      });

      onDelete();
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <PropertyCardHeader 
            property={property} 
            moving={moving} 
            onMoveToProperties={moveToProperties}
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this property? This action cannot be undone.
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong>{property.address}</strong><br />
                    {property.city}, {property.state}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={deleteProperty}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <PropertyStatsGrid property={property} />
        <PropertyDetailsSection property={property} />

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
          </div>
        )}

        <PropertyCardActions property={property} />
      </CardContent>
    </Card>
  );
}
