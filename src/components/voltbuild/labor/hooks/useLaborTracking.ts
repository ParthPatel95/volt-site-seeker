import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

export type TradeType = 'electrician' | 'ironworker' | 'operator' | 'pipe_fitter' | 'general_labor' | 'superintendent' | 'engineer' | 'other';
export type ShiftType = 'day' | 'night' | 'swing';

export interface LaborEntry {
  id: string;
  project_id: string;
  phase_id: string | null;
  date: string;
  trade_type: TradeType;
  headcount: number;
  hours_worked: number | null;
  contractor: string | null;
  shift: ShiftType;
  notes: string | null;
  created_at: string;
}

export const TRADE_TYPES: { value: TradeType; label: string; color: string }[] = [
  { value: 'electrician', label: 'Electrician', color: '#f59e0b' },
  { value: 'ironworker', label: 'Ironworker', color: '#ef4444' },
  { value: 'operator', label: 'Equipment Operator', color: '#8b5cf6' },
  { value: 'pipe_fitter', label: 'Pipe Fitter', color: '#3b82f6' },
  { value: 'general_labor', label: 'General Labor', color: '#6b7280' },
  { value: 'superintendent', label: 'Superintendent', color: '#10b981' },
  { value: 'engineer', label: 'Engineer', color: '#06b6d4' },
  { value: 'other', label: 'Other', color: '#94a3b8' },
];

export function useLaborTracking(projectId: string | null) {
  const queryClient = useQueryClient();

  const { data: laborEntries = [], isLoading } = useQuery({
    queryKey: ['voltbuild-labor-entries', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('voltbuild_labor_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as LaborEntry[];
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (entry: Omit<LaborEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('voltbuild_labor_entries')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-labor-entries', projectId] });
      toast.success('Labor entry added');
    },
    onError: () => toast.error('Failed to add labor entry'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_labor_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-labor-entries', projectId] });
      toast.success('Labor entry deleted');
    },
    onError: () => toast.error('Failed to delete labor entry'),
  });

  const getStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = laborEntries.filter(e => e.date === today);
    const todayHeadcount = todayEntries.reduce((sum, e) => sum + e.headcount, 0);
    const todayHours = todayEntries.reduce((sum, e) => sum + (e.hours_worked || 0), 0);

    // Weekly stats
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEntries = laborEntries.filter(e => {
      const date = parseISO(e.date);
      return date >= weekStart && date <= weekEnd;
    });
    const weekHours = weekEntries.reduce((sum, e) => sum + (e.hours_worked || 0), 0);

    // Total manhours
    const totalManhours = laborEntries.reduce((sum, e) => sum + (e.hours_worked || 0), 0);

    return { todayHeadcount, todayHours, weekHours, totalManhours };
  };

  const getWeeklyData = (weekOffset: number = 0) => {
    const today = new Date();
    const weekStart = startOfWeek(new Date(today.setDate(today.getDate() - weekOffset * 7)), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEntries = laborEntries.filter(e => e.date === dateStr);
      
      const byTrade: Record<TradeType, number> = {} as Record<TradeType, number>;
      TRADE_TYPES.forEach(t => byTrade[t.value] = 0);
      
      dayEntries.forEach(e => {
        byTrade[e.trade_type] = (byTrade[e.trade_type] || 0) + e.headcount;
      });
      
      return {
        date: dateStr,
        dayName: format(day, 'EEE'),
        total: dayEntries.reduce((sum, e) => sum + e.headcount, 0),
        hours: dayEntries.reduce((sum, e) => sum + (e.hours_worked || 0), 0),
        byTrade,
      };
    });
  };

  const getEntriesForDate = (date: string) => {
    return laborEntries.filter(e => e.date === date);
  };

  return {
    laborEntries,
    isLoading,
    createLaborEntry: createMutation.mutate,
    deleteLaborEntry: deleteMutation.mutate,
    getStats,
    getWeeklyData,
    getEntriesForDate,
    isCreating: createMutation.isPending,
  };
}
