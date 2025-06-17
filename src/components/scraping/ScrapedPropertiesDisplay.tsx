
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { ScrapedPropertyCard } from './ScrapedPropertyCard';
import { PropertyStats } from './PropertyStats';
import { PropertyFilters } from './PropertyFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ScrapedProperty } from '@/types/scrapedProperty';

export function ScrapedPropertiesDisplay() {
  const [scrapedProperties, setScrapedProperties] = useState<ScrapedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingAll, setDeletingAll] = useState(false);
  const { toast } = useToast();

  const loadScrapedProperties = async () => {
    setLoading(true);
    try {
      console.log('Loading scraped properties...');
      
      let query = supabase
        .from('scraped_properties')
        .select('*')
        .order('scraped_at', { ascending: false });

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('property_type', typeFilter);
      }

      if (statusFilter === 'available') {
        query = query.eq('moved_to_properties', false);
      } else if (statusFilter === 'moved') {
        query = query.eq('moved_to_properties', true);
      }

      if (searchTerm) {
        query = query.or(`address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading scraped properties:', error);
        throw error;
      }

      console.log('Loaded scraped properties:', data?.length || 0);
      setScrapedProperties(data || []);
    } catch (error: any) {
      console.error('Failed to load scraped properties:', error);
      toast({
        title: "Error Loading Properties",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllProperties = async () => {
    setDeletingAll(true);
    try {
      const { error } = await supabase
        .from('scraped_properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;

      toast({
        title: "All Properties Deleted",
        description: "All scraped properties have been permanently deleted.",
      });

      loadScrapedProperties();
    } catch (error: any) {
      console.error('Error deleting all properties:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete properties",
        variant: "destructive"
      });
    } finally {
      setDeletingAll(false);
    }
  };

  // Set up real-time subscription to scraped_properties table
  useEffect(() => {
    loadScrapedProperties();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('scraped_properties_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scraped_properties' },
        (payload) => {
          console.log('Real-time update received:', payload);
          loadScrapedProperties(); // Reload data when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadScrapedProperties();
  }, [searchTerm, typeFilter, statusFilter]);

  const handlePropertyMoved = () => {
    loadScrapedProperties();
  };

  const handlePropertyDeleted = () => {
    loadScrapedProperties();
  };

  const availableCount = scrapedProperties.filter(p => !p.moved_to_properties).length;
  const movedCount = scrapedProperties.filter(p => p.moved_to_properties).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-muted-foreground">Loading scraped properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PropertyStats 
          totalCount={scrapedProperties.length}
          availableCount={availableCount}
          movedCount={movedCount}
        />
        
        {scrapedProperties.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={deletingAll}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Properties</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete all {scrapedProperties.length} scraped properties? 
                  This action cannot be undone and will permanently remove all properties from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={deleteAllProperties}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deletingAll}
                >
                  {deletingAll ? 'Deleting...' : 'Delete All Properties'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <PropertyFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={loadScrapedProperties}
      />

      {scrapedProperties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No Real Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Real estate data scraping requires API integration. No synthetic data will be generated.'
              }
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                <span className="font-medium text-amber-800">Real Data Only</span>
              </div>
              <p className="text-sm text-amber-700">
                We've removed all synthetic/dummy data. Properties will only appear when real estate APIs return actual listings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scrapedProperties.map((property) => (
            <ScrapedPropertyCard
              key={property.id}
              property={property}
              onMoveToProperties={handlePropertyMoved}
              onDelete={handlePropertyDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
