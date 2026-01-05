import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vendor, VendorTrade } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useVendors() {
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      return (data || []) as Vendor[];
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (vendor: Omit<Vendor, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('vendors')
        .insert({ ...vendor, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vendor> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
    },
  });

  const filterVendors = (vendors: Vendor[], trade?: VendorTrade, region?: string, search?: string) => {
    return vendors.filter(v => {
      if (trade && v.trade !== trade) return false;
      if (region && !v.regions.includes(region)) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          v.company_name.toLowerCase().includes(searchLower) ||
          v.contact_name?.toLowerCase().includes(searchLower) ||
          v.email?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  return {
    vendors: vendorsQuery.data || [],
    isLoading: vendorsQuery.isLoading,
    error: vendorsQuery.error,
    createVendor: createVendorMutation.mutate,
    updateVendor: updateVendorMutation.mutate,
    deleteVendor: deleteVendorMutation.mutate,
    filterVendors,
    isCreating: createVendorMutation.isPending,
    isUpdating: updateVendorMutation.isPending,
    isDeleting: deleteVendorMutation.isPending,
  };
}
