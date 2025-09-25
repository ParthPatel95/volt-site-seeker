import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { documentUrl, documentType, listingId, reportId } = await req.json();

    console.log('Starting AI analysis for document:', { documentUrl, documentType, listingId });

    // Download document content (simplified for text documents)
    const documentResponse = await fetch(documentUrl);
    const documentText = await documentResponse.text();

    // Prepare AI prompt based on document type
    const getAnalysisPrompt = (type: string, content: string) => {
      const basePrompt = `Analyze this ${type} document and provide insights for due diligence purposes. Focus on key metrics, risks, and opportunities.`;
      
      switch (type) {
        case 'financial':
          return `${basePrompt} For financial documents, extract revenue, EBITDA, debt levels, cash flow, and financial ratios. Identify any red flags or positive indicators.`;
        case 'legal':
          return `${basePrompt} For legal documents, identify compliance issues, regulatory risks, pending litigation, permits, and legal obligations.`;
        case 'technical':
          return `${basePrompt} For technical documents, assess infrastructure condition, power capacity, efficiency metrics, and maintenance requirements.`;
        case 'environmental':
          return `${basePrompt} For environmental documents, identify environmental compliance, sustainability metrics, and potential environmental liabilities.`;
        default:
          return `${basePrompt} Provide a comprehensive analysis covering all relevant aspects for investment decision-making.`;
      }
    };

    // Analyze document with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a due diligence expert analyzing documents for investment purposes. Provide structured, actionable insights in JSON format.'
          },
          {
            role: 'user',
            content: `${getAnalysisPrompt(documentType, documentText)}\n\nDocument content:\n${documentText.substring(0, 8000)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const aiResult = await response.json();
    const analysis = aiResult.choices[0].message.content;

    // Parse AI analysis and extract structured data
    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(analysis);
    } catch {
      // Fallback if AI doesn't return valid JSON
      structuredAnalysis = {
        summary: analysis,
        keyFindings: [],
        risks: [],
        opportunities: [],
        score: 75,
        confidence: 'medium'
      };
    }

    // Update the due diligence report with AI insights
    const { data: report, error: reportError } = await supabase
      .from('due_diligence_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) {
      throw new Error(`Failed to fetch report: ${reportError.message}`);
    }

    // Merge AI analysis into report data
    const updatedReportData = {
      ...report.report_data,
      ai_analysis: {
        ...report.report_data?.ai_analysis || {},
        [documentType]: {
          analysis: structuredAnalysis,
          processed_at: new Date().toISOString(),
          document_url: documentUrl,
          confidence_score: structuredAnalysis.confidence || 'medium'
        }
      },
      sections: {
        ...report.report_data?.sections || {},
        [documentType]: {
          status: 'ai_completed',
          score: structuredAnalysis.score || 75,
          ai_analysis: structuredAnalysis
        }
      }
    };

    // Update financial analysis if it's a financial document
    let updatedFinancialAnalysis = report.financial_analysis;
    if (documentType === 'financial' && structuredAnalysis.metrics) {
      updatedFinancialAnalysis = {
        ...report.financial_analysis || {},
        ai_extracted_metrics: structuredAnalysis.metrics,
        key_ratios: structuredAnalysis.ratios || {},
        financial_health_score: structuredAnalysis.score || 75
      };
    }

    // Update risk assessment if risks are identified
    let updatedRiskAssessment = report.risk_assessment;
    if (structuredAnalysis.risks && structuredAnalysis.risks.length > 0) {
      updatedRiskAssessment = {
        ...report.risk_assessment || {},
        ai_identified_risks: structuredAnalysis.risks,
        risk_score: Math.max(report.risk_assessment?.risk_score || 0, 100 - (structuredAnalysis.score || 75))
      };
    }

    // Save updated analysis
    const { error: updateError } = await supabase
      .from('due_diligence_reports')
      .update({
        report_data: updatedReportData,
        financial_analysis: updatedFinancialAnalysis,
        risk_assessment: updatedRiskAssessment,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      throw new Error(`Failed to update report: ${updateError.message}`);
    }

    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: structuredAnalysis,
        message: 'Document analyzed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in AI document analysis:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});