import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommissioningChecklist, CommissioningStatus, ChecklistItem, CHECKLIST_TEMPLATES } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export function useCommissioningChecklists(projectId: string | null) {
  const queryClient = useQueryClient();

  const checklistsQuery = useQuery({
    queryKey: ['commissioning-checklists', projectId],
    queryFn: async (): Promise<CommissioningChecklist[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('commissioning_checklists')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        items: (Array.isArray(item.items) ? item.items : []) as unknown as ChecklistItem[],
      })) as CommissioningChecklist[];
    },
    enabled: !!projectId,
  });

  const createChecklistMutation = useMutation({
    mutationFn: async (checklist: Omit<CommissioningChecklist, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('commissioning_checklists')
        .insert({
          ...checklist,
          items: checklist.items as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissioning-checklists', projectId] });
      toast.success('Checklist created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create checklist: ${error.message}`);
    },
  });

  const createFromTemplate = (templateName: string, phaseId?: string) => {
    const template = CHECKLIST_TEMPLATES.find(t => t.name === templateName);
    if (!template || !projectId) return;

    createChecklistMutation.mutate({
      project_id: projectId,
      phase_id: phaseId || null,
      checklist_name: template.name,
      checklist_type: template.type,
      items: template.items,
      status: 'not_started',
      completed_at: null,
    });
  };

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommissioningChecklist> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.items) {
        updateData.items = updates.items as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('commissioning_checklists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissioning-checklists', projectId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update checklist: ${error.message}`);
    },
  });

  const updateChecklistItem = async (checklistId: string, itemIndex: number, completed: boolean) => {
    const checklist = checklistsQuery.data?.find(c => c.id === checklistId);
    if (!checklist) return;

    const updatedItems = [...checklist.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], completed };

    // Calculate new status
    const totalRequired = updatedItems.filter(i => i.required).length;
    const completedRequired = updatedItems.filter(i => i.required && i.completed).length;
    
    let status: CommissioningStatus = 'not_started';
    let completed_at: string | null = null;

    if (completedRequired === totalRequired && totalRequired > 0) {
      status = 'complete';
      completed_at = new Date().toISOString();
    } else if (completedRequired > 0) {
      status = 'in_progress';
    }

    updateChecklistMutation.mutate({
      id: checklistId,
      items: updatedItems,
      status,
      completed_at,
    });
  };

  const deleteChecklistMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('commissioning_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissioning-checklists', projectId] });
      toast.success('Checklist deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete checklist: ${error.message}`);
    },
  });

  // Get completion stats
  const getStats = () => {
    const checklists = checklistsQuery.data || [];
    return {
      total: checklists.length,
      notStarted: checklists.filter(c => c.status === 'not_started').length,
      inProgress: checklists.filter(c => c.status === 'in_progress').length,
      complete: checklists.filter(c => c.status === 'complete').length,
    };
  };

  return {
    checklists: checklistsQuery.data || [],
    isLoading: checklistsQuery.isLoading,
    error: checklistsQuery.error,
    createChecklist: createChecklistMutation.mutate,
    createFromTemplate,
    updateChecklist: updateChecklistMutation.mutate,
    updateChecklistItem,
    deleteChecklist: deleteChecklistMutation.mutate,
    getStats,
    templates: CHECKLIST_TEMPLATES,
    isCreating: createChecklistMutation.isPending,
    isUpdating: updateChecklistMutation.isPending,
    isDeleting: deleteChecklistMutation.isPending,
  };
}
