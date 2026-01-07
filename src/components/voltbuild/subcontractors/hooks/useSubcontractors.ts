import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SubcontractorTrade = 'electrical' | 'civil' | 'mechanical' | 'structural' | 'it_fiber' | 'commissioning' | 'general' | 'other';
export type SubcontractorStatus = 'active' | 'complete' | 'terminated';

export interface Subcontractor {
  id: string;
  project_id: string;
  company_name: string;
  trade: SubcontractorTrade;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_value: number | null;
  contract_date: string | null;
  contract_end_date: string | null;
  insurance_expiry: string | null;
  wcb_expiry: string | null;
  safety_rating: number | null;
  performance_rating: number | null;
  status: SubcontractorStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const TRADE_CONFIG: Record<SubcontractorTrade, { label: string; color: string }> = {
  electrical: { label: 'Electrical', color: 'bg-amber-500' },
  civil: { label: 'Civil', color: 'bg-stone-500' },
  mechanical: { label: 'Mechanical', color: 'bg-blue-500' },
  structural: { label: 'Structural', color: 'bg-red-500' },
  it_fiber: { label: 'IT/Fiber', color: 'bg-purple-500' },
  commissioning: { label: 'Commissioning', color: 'bg-green-500' },
  general: { label: 'General', color: 'bg-gray-500' },
  other: { label: 'Other', color: 'bg-slate-500' },
};

export const SUBCONTRACTOR_TRADES: SubcontractorTrade[] = [
  'electrical', 'civil', 'mechanical', 'structural', 'it_fiber', 'commissioning', 'general', 'other'
];

export function useSubcontractors(projectId: string | null) {
  const queryClient = useQueryClient();

  const { data: subcontractors = [], isLoading } = useQuery({
    queryKey: ['voltbuild-subcontractors', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('voltbuild_subcontractors')
        .select('*')
        .eq('project_id', projectId)
        .order('company_name', { ascending: true });

      if (error) throw error;
      return data as Subcontractor[];
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (sub: Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('voltbuild_subcontractors')
        .insert(sub)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-subcontractors', projectId] });
      toast.success('Subcontractor added');
    },
    onError: () => toast.error('Failed to add subcontractor'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subcontractor> & { id: string }) => {
      const { error } = await supabase
        .from('voltbuild_subcontractors')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-subcontractors', projectId] });
      toast.success('Subcontractor updated');
    },
    onError: () => toast.error('Failed to update subcontractor'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_subcontractors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-subcontractors', projectId] });
      toast.success('Subcontractor removed');
    },
    onError: () => toast.error('Failed to remove subcontractor'),
  });

  const getStats = () => {
    const active = subcontractors.filter(s => s.status === 'active').length;
    const totalValue = subcontractors.reduce((sum, s) => sum + (s.contract_value || 0), 0);
    const expiringInsurance = subcontractors.filter(s => {
      if (!s.insurance_expiry) return false;
      const daysUntil = Math.ceil((new Date(s.insurance_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 30;
    }).length;

    return { total: subcontractors.length, active, totalValue, expiringInsurance };
  };

  const getByTrade = (trade: SubcontractorTrade) => {
    return subcontractors.filter(s => s.trade === trade);
  };

  return {
    subcontractors,
    isLoading,
    createSubcontractor: createMutation.mutate,
    updateSubcontractor: updateMutation.mutate,
    deleteSubcontractor: deleteMutation.mutate,
    getStats,
    getByTrade,
    isCreating: createMutation.isPending,
  };
}
