import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BidRequest, BidRequestStatus } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useBidRequests(projectId: string | null) {
  const queryClient = useQueryClient();

  const bidRequestsQuery = useQuery({
    queryKey: ['bid-requests', projectId],
    queryFn: async (): Promise<BidRequest[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('bid_requests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        attachments: item.attachments as { name: string; url: string }[] || [],
        invited_vendor_ids: item.invited_vendor_ids || [],
      })) as BidRequest[];
    },
    enabled: !!projectId,
  });

  const createBidRequestMutation = useMutation({
    mutationFn: async (bidRequest: Omit<BidRequest, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('bid_requests')
        .insert(bidRequest)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid-requests', projectId] });
      toast.success('Bid request created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bid request: ${error.message}`);
    },
  });

  const updateBidRequestMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BidRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('bid_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid-requests', projectId] });
      toast.success('Bid request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bid request: ${error.message}`);
    },
  });

  const updateBidRequestStatus = async (id: string, status: BidRequestStatus) => {
    updateBidRequestMutation.mutate({ id, status });
  };

  const deleteBidRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bid_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid-requests', projectId] });
      toast.success('Bid request deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bid request: ${error.message}`);
    },
  });

  return {
    bidRequests: bidRequestsQuery.data || [],
    isLoading: bidRequestsQuery.isLoading,
    error: bidRequestsQuery.error,
    createBidRequest: createBidRequestMutation.mutate,
    updateBidRequest: updateBidRequestMutation.mutate,
    updateBidRequestStatus,
    deleteBidRequest: deleteBidRequestMutation.mutate,
    isCreating: createBidRequestMutation.isPending,
    isUpdating: updateBidRequestMutation.isPending,
    isDeleting: deleteBidRequestMutation.isPending,
  };
}
