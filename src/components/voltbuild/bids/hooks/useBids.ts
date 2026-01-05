import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bid, BidStatus, Vendor } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useBids(bidRequestId: string | null) {
  const queryClient = useQueryClient();

  const bidsQuery = useQuery({
    queryKey: ['bids', bidRequestId],
    queryFn: async (): Promise<Bid[]> => {
      if (!bidRequestId) return [];

      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('bid_request_id', bidRequestId)
        .order('amount', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        attachments: item.attachments as { name: string; url: string }[] || [],
        vendor: item.vendor as Vendor,
      })) as Bid[];
    },
    enabled: !!bidRequestId,
  });

  const createBidMutation = useMutation({
    mutationFn: async (bid: Omit<Bid, 'id' | 'created_at' | 'vendor'>) => {
      const { data, error } = await supabase
        .from('bids')
        .insert(bid)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', bidRequestId] });
      toast.success('Bid added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add bid: ${error.message}`);
    },
  });

  const updateBidMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Bid> & { id: string }) => {
      const { vendor, ...rest } = updates;
      const { data, error } = await supabase
        .from('bids')
        .update(rest)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', bidRequestId] });
      toast.success('Bid updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bid: ${error.message}`);
    },
  });

  const updateBidStatus = async (id: string, status: BidStatus) => {
    updateBidMutation.mutate({ id, status });
  };

  const deleteBidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', bidRequestId] });
      toast.success('Bid deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bid: ${error.message}`);
    },
  });

  // Find lowest cost and fastest timeline for highlighting
  const getHighlights = () => {
    const bids = bidsQuery.data || [];
    if (bids.length === 0) return { lowestCostId: null, fastestTimelineId: null };

    const lowestCost = bids.reduce((min, b) => b.amount < min.amount ? b : min, bids[0]);
    const withTimeline = bids.filter(b => b.timeline_days !== null);
    const fastestTimeline = withTimeline.length > 0
      ? withTimeline.reduce((min, b) => (b.timeline_days! < min.timeline_days!) ? b : min, withTimeline[0])
      : null;

    return {
      lowestCostId: lowestCost.id,
      fastestTimelineId: fastestTimeline?.id || null,
    };
  };

  return {
    bids: bidsQuery.data || [],
    isLoading: bidsQuery.isLoading,
    error: bidsQuery.error,
    createBid: createBidMutation.mutate,
    updateBid: updateBidMutation.mutate,
    updateBidStatus,
    deleteBid: deleteBidMutation.mutate,
    getHighlights,
    isCreating: createBidMutation.isPending,
    isUpdating: updateBidMutation.isPending,
    isDeleting: deleteBidMutation.isPending,
  };
}
