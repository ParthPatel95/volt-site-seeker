import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnergyRateInput } from '@/components/energy/EnergyRateInputTypes';
import { EnergyRateResults } from '@/components/energy/EnergyRateResults';

export interface SavedEnergyCalculation {
  id: string;
  calculation_name: string;
  input_data: EnergyRateInput;
  results_data: EnergyRateResults;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useSavedEnergyCalculations() {
  const [savedCalculations, setSavedCalculations] = useState<SavedEnergyCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCalculations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_energy_calculations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedCalculations((data || []).map(item => ({
        ...item,
        input_data: item.input_data as unknown as EnergyRateInput,
        results_data: item.results_data as unknown as EnergyRateResults
      })) as SavedEnergyCalculation[]);
    } catch (error: any) {
      console.error('Error fetching calculations:', error);
      toast({
        title: "Error",
        description: "Failed to load saved calculations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = async (name: string, input: EnergyRateInput, results: EnergyRateResults) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_energy_calculations')
        .insert({
          user_id: user.id,
          calculation_name: name,
          input_data: input as any,
          results_data: results as any
        })
        .select()
        .single();

      if (error) throw error;

      setSavedCalculations(prev => [{
        ...data,
        input_data: data.input_data as unknown as EnergyRateInput,
        results_data: data.results_data as unknown as EnergyRateResults
      } as SavedEnergyCalculation, ...prev]);
      toast({
        title: "Calculation Saved",
        description: `Saved "${name}" successfully`
      });

      return data;
    } catch (error: any) {
      console.error('Error saving calculation:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save calculation",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCalculation = async (id: string, input: EnergyRateInput, results: EnergyRateResults) => {
    try {
      const { data, error } = await supabase
        .from('saved_energy_calculations')
        .update({
          input_data: input as any,
          results_data: results as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSavedCalculations(prev => 
        prev.map(calc => calc.id === id ? {
          ...data,
          input_data: data.input_data as unknown as EnergyRateInput,
          results_data: data.results_data as unknown as EnergyRateResults
        } as SavedEnergyCalculation : calc)
      );

      toast({
        title: "Calculation Updated",
        description: "Live data refreshed successfully"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating calculation:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update calculation",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_energy_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedCalculations(prev => prev.filter(calc => calc.id !== id));
      toast({
        title: "Calculation Deleted",
        description: "Calculation removed successfully"
      });
    } catch (error: any) {
      console.error('Error deleting calculation:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete calculation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, []);

  return {
    savedCalculations,
    loading,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    refreshCalculations: fetchCalculations
  };
}