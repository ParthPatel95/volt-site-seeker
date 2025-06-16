
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, RefreshCw, AlertCircle } from 'lucide-react';
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
      <PropertyStats 
        totalCount={scrapedProperties.length}
        availableCount={availableCount}
        movedCount={movedCount}
      />

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
