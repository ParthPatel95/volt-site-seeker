import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CapexCatalogItem, CapexCategory } from '../../types/voltbuild-advanced.types';

export function useCapexCatalog(category?: CapexCategory) {
  return useQuery({
    queryKey: ['capex-catalog', category],
    queryFn: async (): Promise<CapexCatalogItem[]> => {
      let query = supabase
        .from('capex_catalog_items')
        .select('*')
        .order('category', { ascending: true })
        .order('item_name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CapexCatalogItem[];
    },
  });
}

export function useCapexCatalogCategories() {
  const { data: items } = useCapexCatalog();
  
  const categories: CapexCategory[] = ['Civil', 'Electrical', 'Mechanical', 'IT', 'Other'];
  
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = items?.filter(item => item.category === cat) || [];
    return acc;
  }, {} as Record<CapexCategory, CapexCatalogItem[]>);

  return { categories, itemsByCategory };
}
