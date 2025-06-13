
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, RefreshCw } from 'lucide-react';
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

      setScrapedProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Properties",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No Scraped Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by running the AI Property Scraper to discover properties'
              }
            </p>
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
