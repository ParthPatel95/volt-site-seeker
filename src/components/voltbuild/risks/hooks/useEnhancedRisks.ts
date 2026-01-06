import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  EnhancedRisk, 
  RiskHistory, 
  RiskComment, 
  RiskFilters,
  RiskProbability,
  RiskImpact,
  RiskCategory,
  RiskResponseType,
  RiskStatus,
  RiskSeverity
} from '../types/voltbuild-risks.types';

export function useEnhancedRisks(projectId: string | null) {
  const queryClient = useQueryClient();

  // Fetch all risks for a project
  const risksQuery = useQuery({
    queryKey: ['enhanced-risks', projectId],
    queryFn: async (): Promise<EnhancedRisk[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('voltbuild_risks')
        .select('*')
        .eq('project_id', projectId)
        .order('risk_score', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(risk => ({
        ...risk,
        probability: (risk.probability || 'medium') as RiskProbability,
        impact: (risk.impact || 'medium') as RiskImpact,
        risk_score: risk.risk_score || 4,
        response_type: (risk.response_type || 'mitigate') as RiskResponseType,
        status: risk.status as RiskStatus,
        severity: risk.severity as RiskSeverity,
        category: risk.category as RiskCategory | null,
      }));
    },
    enabled: !!projectId,
  });

  // Create a new risk
  const createRiskMutation = useMutation({
    mutationFn: async (risk: {
      project_id: string;
      phase_id?: string;
      title: string;
      description?: string;
      severity?: RiskSeverity;
      probability?: RiskProbability;
      impact?: RiskImpact;
      category?: RiskCategory;
      response_type?: RiskResponseType;
      mitigation_plan?: string;
      owner?: string;
      estimated_cost_impact?: number;
      estimated_days_delay?: number;
      target_resolution_date?: string;
      trigger_indicators?: string;
      linked_task_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('voltbuild_risks')
        .insert({
          project_id: risk.project_id,
          phase_id: risk.phase_id || null,
          title: risk.title,
          description: risk.description || null,
          severity: risk.severity || 'medium',
          probability: risk.probability || 'medium',
          impact: risk.impact || 'medium',
          category: risk.category || null,
          response_type: risk.response_type || 'mitigate',
          mitigation_plan: risk.mitigation_plan || null,
          owner: risk.owner || null,
          status: 'open' as RiskStatus,
          estimated_cost_impact: risk.estimated_cost_impact || null,
          estimated_days_delay: risk.estimated_days_delay || null,
          target_resolution_date: risk.target_resolution_date || null,
          trigger_indicators: risk.trigger_indicators || null,
          linked_task_id: risk.linked_task_id || null,
          identified_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-risks', projectId] });
      toast.success('Risk added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add risk: ${error.message}`);
    },
  });

  // Update a risk
  const updateRiskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnhancedRisk> & { id: string }) => {
      // Only include fields that Supabase accepts
      const updatePayload: Record<string, unknown> = {};
      const allowedFields = [
        'title', 'description', 'severity', 'status', 'mitigation_plan', 'owner',
        'probability', 'impact', 'category', 'response_type', 'estimated_cost_impact',
        'cost_impact_range_min', 'cost_impact_range_max', 'estimated_days_delay',
        'linked_task_id', 'target_resolution_date', 'actual_resolution_date',
        'trigger_indicators', 'last_review_date', 'review_notes', 'phase_id'
      ];
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          updatePayload[key] = value;
        }
      }

      const { data, error } = await supabase
        .from('voltbuild_risks')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-risks', projectId] });
      toast.success('Risk updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update risk: ${error.message}`);
    },
  });

  // Delete a risk
  const deleteRiskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_risks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-risks', projectId] });
      toast.success('Risk removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove risk: ${error.message}`);
    },
  });

  // Mark as reviewed
  const markAsReviewed = async (riskId: string, notes?: string) => {
    updateRiskMutation.mutate({
      id: riskId,
      last_review_date: new Date().toISOString(),
      review_notes: notes,
    });
  };

  // Filter risks
  const filterRisks = (risks: EnhancedRisk[], filters: RiskFilters): EnhancedRisk[] => {
    return risks.filter(risk => {
      if (filters.status?.length && !filters.status.includes(risk.status)) return false;
      if (filters.category?.length && risk.category && !filters.category.includes(risk.category)) return false;
      if (filters.probability?.length && !filters.probability.includes(risk.probability)) return false;
      if (filters.impact?.length && !filters.impact.includes(risk.impact)) return false;
      if (filters.phaseId && risk.phase_id !== filters.phaseId) return false;
      if (filters.owner && risk.owner !== filters.owner) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (!risk.title.toLowerCase().includes(term) && 
            !risk.description?.toLowerCase().includes(term)) return false;
      }
      if (filters.showCriticalOnly && risk.risk_score < 12) return false;
      if (filters.showOverdueOnly) {
        if (!risk.last_review_date) return true;
        const lastReview = new Date(risk.last_review_date);
        const daysSinceReview = (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceReview < 14) return false;
      }
      return true;
    });
  };

  // Get risks by phase
  const getRisksByPhase = (phaseId: string) => {
    return (risksQuery.data || []).filter(risk => risk.phase_id === phaseId);
  };

  // Get critical risks (score >= 12)
  const getCriticalRisks = () => {
    return (risksQuery.data || []).filter(risk => risk.risk_score >= 12);
  };

  return {
    risks: risksQuery.data || [],
    isLoading: risksQuery.isLoading,
    error: risksQuery.error,
    createRisk: createRiskMutation.mutate,
    updateRisk: updateRiskMutation.mutate,
    deleteRisk: deleteRiskMutation.mutate,
    markAsReviewed,
    filterRisks,
    getRisksByPhase,
    getCriticalRisks,
    isCreating: createRiskMutation.isPending,
    isUpdating: updateRiskMutation.isPending,
    isDeleting: deleteRiskMutation.isPending,
  };
}

// Hook for risk comments
export function useRiskComments(riskId: string | null) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['risk-comments', riskId],
    queryFn: async (): Promise<RiskComment[]> => {
      if (!riskId) return [];

      const { data, error } = await supabase
        .from('voltbuild_risk_comments')
        .select('*')
        .eq('risk_id', riskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!riskId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ riskId, content }: { riskId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('voltbuild_risk_comments')
        .insert({
          risk_id: riskId,
          user_id: user?.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-comments', riskId] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
  };
}

// Hook for risk history
export function useRiskHistory(riskId: string | null) {
  const historyQuery = useQuery({
    queryKey: ['risk-history', riskId],
    queryFn: async (): Promise<RiskHistory[]> => {
      if (!riskId) return [];

      const { data, error } = await supabase
        .from('voltbuild_risk_history')
        .select('*')
        .eq('risk_id', riskId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!riskId,
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
  };
}
