
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StoredCalculation, BTCROIFormData, BTCNetworkData, HostingROIResults, BTCROIResults } from '../types/btc_roi_types';
import { useToast } from '@/hooks/use-toast';

export interface UseStoredCalculationsDBReturn {
  storedCalculations: StoredCalculation[];
  saveCalculation: (
    calculationType: 'hosting' | 'self',
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    results: HostingROIResults | BTCROIResults,
    siteName?: string
  ) => Promise<void>;
  deleteCalculation: (id: string) => Promise<void>;
  clearAllCalculations: () => Promise<void>;
  generateSiteName: () => string;
  loading: boolean;
}

export const useStoredCalculationsDB = (): UseStoredCalculationsDBReturn => {
  const [storedCalculations, setStoredCalculations] = useState<StoredCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load calculations from database on mount
  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('btc_roi_calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading calculations:', error);
        toast({
          title: "Error Loading Calculations",
          description: "Failed to load saved calculations from database",
          variant: "destructive"
        });
        return;
      }

      const calculations: StoredCalculation[] = data.map(calc => ({
        id: calc.id,
        siteName: calc.site_name,
        calculationType: calc.calculation_type as 'hosting' | 'self',
        formData: calc.form_data as unknown as BTCROIFormData,
        networkData: {
          ...(calc.network_data as unknown as BTCNetworkData),
          lastUpdate: new Date((calc.network_data as any).lastUpdate)
        },
        results: calc.results as unknown as HostingROIResults | BTCROIResults,
        timestamp: new Date(calc.created_at)
      }));

      setStoredCalculations(calculations);
    } catch (error) {
      console.error('Error loading calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSiteName = (): string => {
    const existingNames = storedCalculations
      .map(calc => calc.siteName)
      .filter(name => name.startsWith('Wattbyte Campus '));
    
    let counter = 1;
    let newName = `Wattbyte Campus ${counter}`;
    
    while (existingNames.includes(newName)) {
      counter++;
      newName = `Wattbyte Campus ${counter}`;
    }
    
    return newName;
  };

  const saveCalculation = async (
    calculationType: 'hosting' | 'self',
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    results: HostingROIResults | BTCROIResults,
    siteName?: string
  ) => {
    try {
      const finalSiteName = siteName?.trim() || generateSiteName();
      
      const { data, error } = await supabase
        .from('btc_roi_calculations')
        .insert({
          site_name: finalSiteName,
          calculation_type: calculationType,
          form_data: formData as any,
          network_data: networkData as any,
          results: results as any,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving calculation:', error);
        toast({
          title: "Error Saving Calculation",
          description: "Failed to save calculation to database",
          variant: "destructive"
        });
        return;
      }

      const newCalculation: StoredCalculation = {
        id: data.id,
        siteName: data.site_name,
        calculationType: data.calculation_type as 'hosting' | 'self',
        formData: data.form_data as unknown as BTCROIFormData,
        networkData: {
          ...(data.network_data as unknown as BTCNetworkData),
          lastUpdate: new Date((data.network_data as any).lastUpdate)
        },
        results: data.results as unknown as HostingROIResults | BTCROIResults,
        timestamp: new Date(data.created_at)
      };

      setStoredCalculations(prev => [newCalculation, ...prev]);
      
      toast({
        title: "Calculation Saved",
        description: `Successfully saved "${finalSiteName}" to database`,
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast({
        title: "Error Saving Calculation",
        description: "An unexpected error occurred while saving",
        variant: "destructive"
      });
    }
  };

  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('btc_roi_calculations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calculation:', error);
        toast({
          title: "Error Deleting Calculation",
          description: "Failed to delete calculation from database",
          variant: "destructive"
        });
        return;
      }

      setStoredCalculations(prev => prev.filter(calc => calc.id !== id));
      
      toast({
        title: "Calculation Deleted",
        description: "Successfully deleted calculation from database",
      });
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  const clearAllCalculations = async () => {
    try {
      const { error } = await supabase
        .from('btc_roi_calculations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all user's calculations

      if (error) {
        console.error('Error clearing calculations:', error);
        toast({
          title: "Error Clearing Calculations",
          description: "Failed to clear all calculations from database",
          variant: "destructive"
        });
        return;
      }

      setStoredCalculations([]);
      
      toast({
        title: "All Calculations Cleared",
        description: "Successfully cleared all calculations from database",
      });
    } catch (error) {
      console.error('Error clearing calculations:', error);
    }
  };

  return {
    storedCalculations,
    saveCalculation,
    deleteCalculation,
    clearAllCalculations,
    generateSiteName,
    loading
  };
};
