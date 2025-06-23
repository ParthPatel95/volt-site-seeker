
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { EnergyRateInput } from './types.ts';
import { calculateEnergyRates } from './rate-calculator.ts';
import { exportCSV, exportPDF } from './export-handlers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Energy Rate Estimator action: ${action}`);

    switch (action) {
      case 'calculate_rates':
        const response = await calculateEnergyRates(params as EnergyRateInput);
        return new Response(response.body, {
          status: response.status,
          headers: { ...Object.fromEntries(response.headers), ...corsHeaders },
        });
      
      case 'export_csv':
        const csvResponse = await exportCSV(params.results, params.input);
        return new Response(csvResponse.body, {
          status: csvResponse.status,
          headers: { ...Object.fromEntries(csvResponse.headers), ...corsHeaders },
        });
      
      case 'export_pdf':
        const pdfResponse = await exportPDF(params.results, params.input);
        return new Response(pdfResponse.body, {
          status: pdfResponse.status,
          headers: { ...Object.fromEntries(pdfResponse.headers), ...corsHeaders },
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

  } catch (error: any) {
    console.error('Error in energy rate estimator:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
