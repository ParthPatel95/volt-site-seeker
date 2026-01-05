import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContractAward, Vendor, BidRequest } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useContractAwards(projectId: string | null) {
  const queryClient = useQueryClient();

  const contractAwardsQuery = useQuery({
    queryKey: ['contract-awards', projectId],
    queryFn: async (): Promise<ContractAward[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('contract_awards')
        .select(`
          *,
          vendor:vendors(*),
          bid_request:bid_requests(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        vendor: item.vendor as Vendor,
        bid_request: item.bid_request as BidRequest,
      })) as ContractAward[];
    },
    enabled: !!projectId,
  });

  const createContractAwardMutation = useMutation({
    mutationFn: async (award: Omit<ContractAward, 'id' | 'created_at' | 'vendor' | 'bid_request'>) => {
      const { data, error } = await supabase
        .from('contract_awards')
        .insert(award)
        .select()
        .single();

      if (error) throw error;

      // Also update the bid request status to 'awarded'
      await supabase
        .from('bid_requests')
        .update({ status: 'awarded' })
        .eq('id', award.bid_request_id);

      // Update the winning bid status
      const { data: bids } = await supabase
        .from('bids')
        .select('id')
        .eq('bid_request_id', award.bid_request_id)
        .eq('vendor_id', award.vendor_id);

      if (bids && bids.length > 0) {
        await supabase
          .from('bids')
          .update({ status: 'awarded' })
          .eq('id', bids[0].id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-awards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bid-requests', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      toast.success('Contract awarded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to award contract: ${error.message}`);
    },
  });

  const updateContractAwardMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContractAward> & { id: string }) => {
      const { vendor, bid_request, ...rest } = updates;
      const { data, error } = await supabase
        .from('contract_awards')
        .update(rest)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-awards', projectId] });
      toast.success('Contract updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contract: ${error.message}`);
    },
  });

  const deleteContractAwardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contract_awards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-awards', projectId] });
      toast.success('Contract deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contract: ${error.message}`);
    },
  });

  return {
    contractAwards: contractAwardsQuery.data || [],
    isLoading: contractAwardsQuery.isLoading,
    error: contractAwardsQuery.error,
    createContractAward: createContractAwardMutation.mutate,
    updateContractAward: updateContractAwardMutation.mutate,
    deleteContractAward: deleteContractAwardMutation.mutate,
    isCreating: createContractAwardMutation.isPending,
    isUpdating: updateContractAwardMutation.isPending,
    isDeleting: deleteContractAwardMutation.isPending,
  };
}
