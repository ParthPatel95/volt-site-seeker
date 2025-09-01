
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnergyRateInput } from '@/components/energy/EnergyRateInputTypes';
import { EnergyRateResults } from '@/components/energy/EnergyRateResults';

export function useEnergyRateEstimator() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateRates = async (input: EnergyRateInput): Promise<EnergyRateResults> => {
    setLoading(true);
    try {
      console.log('Calculating energy rates for input:', input);
      
      const { data, error } = await supabase.functions.invoke('energy-rate-estimator', {
        body: {
          action: 'calculate_rates',
          ...input
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Rate calculation failed');
      }

      console.log('Rate calculation completed:', data);
      return data.results;

    } catch (error: any) {
      console.error('Error calculating rates:', error);
      
      let errorMessage = "Failed to calculate energy rates";
      if (error.message?.includes('non-2xx')) {
        errorMessage = "Energy rate service temporarily unavailable";
      }
      
      toast({
        title: "Calculation Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (results: EnergyRateResults, input: EnergyRateInput) => {
    try {
      console.log('Generating CSV download...');
      
      const { data, error } = await supabase.functions.invoke('energy-rate-estimator', {
        body: {
          action: 'export_csv',
          results,
          input
        }
      });

      if (error) throw error;

      if (data?.csvData) {
        const blob = new Blob([data.csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `energy-rate-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "CSV Downloaded",
          description: "Energy rate data exported successfully"
        });
      }

    } catch (error: any) {
      console.error('Error downloading CSV:', error);
      toast({
        title: "Download Failed",
        description: "Failed to export CSV data",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = async (results: EnergyRateResults, input: EnergyRateInput) => {
    try {
      console.log('PDF download clicked - starting PDF generation...');
      console.log('Results data:', results);
      console.log('Input data:', input);
      
      const { data, error } = await supabase.functions.invoke('energy-rate-estimator', {
        body: {
          action: 'export_pdf',
          results,
          input
        }
      });
      
      console.log('Edge function response - data:', data);
      console.log('Edge function response - error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('PDF response data:', data);

      if (data?.success && data?.pdfData) {
        try {
          // Decode base64 to get HTML content
          const htmlContent = atob(data.pdfData);
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = data.filename || `energy-rate-analysis-${new Date().toISOString().slice(0, 10)}.html`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);

          toast({
            title: "Report Downloaded",
            description: "Energy rate report saved as HTML file (can be printed to PDF)"
          });
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          throw new Error('Failed to process download');
        }
      } else {
        throw new Error('No PDF data received from server');
      }

    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  return {
    calculateRates,
    downloadCSV,
    downloadPDF,
    loading
  };
}
