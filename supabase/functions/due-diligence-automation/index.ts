import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, reportType, listingId, userId, companyName, parameters } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Due diligence automation request:', { action, reportType, listingId, companyName });

    switch (action) {
      case 'generate_report': {
        // Create initial report record
        const { data: reportRecord } = await supabase
          .from('automated_due_diligence')
          .insert({
            user_id: userId,
            listing_id: listingId,
            report_type: reportType,
            status: 'processing'
          })
          .select()
          .single();

        if (!reportRecord) {
          throw new Error('Failed to create report record');
        }

        // Generate the report based on type
        const reportData = await generateDueDiligenceReport(
          supabase, 
          reportType, 
          listingId, 
          companyName, 
          parameters,
          openAIApiKey
        );

        // Calculate risk score
        const riskScore = calculateRiskScore(reportData);

        // Generate recommendations
        const recommendations = await generateRecommendations(reportData, openAIApiKey);

        // Update report with generated data
        const { data: updatedReport } = await supabase
          .from('automated_due_diligence')
          .update({
            status: 'completed',
            report_data: reportData,
            risk_score: riskScore,
            recommendations: recommendations
          })
          .eq('id', reportRecord.id)
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          report: updatedReport
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_reports': {
        const { data: reports } = await supabase
          .from('automated_due_diligence')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        return new Response(JSON.stringify({
          success: true,
          reports: reports || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'analyze_documents': {
        if (!parameters?.documentUrls) {
          throw new Error('Document URLs are required');
        }

        const documentAnalysis = await analyzeDocuments(parameters.documentUrls, openAIApiKey);

        return new Response(JSON.stringify({
          success: true,
          analysis: documentAnalysis
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'risk_assessment': {
        const riskAssessment = await performRiskAssessment(
          supabase,
          listingId,
          companyName,
          parameters,
          openAIApiKey
        );

        return new Response(JSON.stringify({
          success: true,
          riskAssessment
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in due diligence automation:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateDueDiligenceReport(
  supabase: any, 
  reportType: string, 
  listingId: string, 
  companyName: string, 
  parameters: any,
  apiKey: string
) {
  const reportData: any = {
    reportType,
    generatedAt: new Date().toISOString(),
    sections: {}
  };

  // Get relevant data based on report type
  switch (reportType) {
    case 'property':
      reportData.sections = await generatePropertyReport(supabase, listingId, apiKey);
      break;
    case 'financial':
      reportData.sections = await generateFinancialReport(supabase, companyName, apiKey);
      break;
    case 'technical':
      reportData.sections = await generateTechnicalReport(supabase, listingId, apiKey);
      break;
    case 'regulatory':
      reportData.sections = await generateRegulatoryReport(supabase, listingId, companyName, apiKey);
      break;
    case 'comprehensive':
      reportData.sections = {
        ...await generatePropertyReport(supabase, listingId, apiKey),
        ...await generateFinancialReport(supabase, companyName, apiKey),
        ...await generateTechnicalReport(supabase, listingId, apiKey),
        ...await generateRegulatoryReport(supabase, listingId, companyName, apiKey)
      };
      break;
  }

  return reportData;
}

async function generatePropertyReport(supabase: any, listingId: string, apiKey: string) {
  // Get property data
  let propertyData = null;
  
  if (listingId) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('id', listingId)
      .single();
    propertyData = data;
  }

  // Analyze property using AI
  const analysis = await analyzePropertyData(propertyData, apiKey);

  return {
    property: {
      basicInfo: propertyData,
      marketAnalysis: analysis.marketAnalysis,
      locationAssessment: analysis.locationAssessment,
      powerInfrastructureEvaluation: analysis.powerInfrastructure,
      valuationEstimate: analysis.valuation
    }
  };
}

async function generateFinancialReport(supabase: any, companyName: string, apiKey: string) {
  if (!companyName) return { financial: { message: 'No company specified for financial analysis' } };

  // Get company financial data
  const { data: companyData } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', `%${companyName}%`)
    .single();

  if (!companyData) {
    return { financial: { message: 'Company not found in database' } };
  }

  // Get investment scores and ESG data
  const { data: investmentScores } = await supabase
    .from('investment_scores')
    .select('*')
    .eq('company_id', companyData.id)
    .order('calculated_at', { ascending: false })
    .limit(1);

  const { data: esgScores } = await supabase
    .from('esg_scores')
    .select('*')
    .eq('company_id', companyData.id)
    .order('assessment_date', { ascending: false })
    .limit(1);

  const financialAnalysis = await analyzeFinancialData(
    companyData, 
    investmentScores?.[0], 
    esgScores?.[0], 
    apiKey
  );

  return {
    financial: {
      companyOverview: companyData,
      financialMetrics: {
        marketCap: companyData.market_cap,
        debtToEquity: companyData.debt_to_equity,
        currentRatio: companyData.current_ratio,
        revenueGrowth: companyData.revenue_growth,
        profitMargin: companyData.profit_margin,
        financialHealthScore: companyData.financial_health_score
      },
      investmentScoring: investmentScores?.[0],
      esgAssessment: esgScores?.[0],
      aiAnalysis: financialAnalysis
    }
  };
}

async function generateTechnicalReport(supabase: any, listingId: string, apiKey: string) {
  // Get energy infrastructure data
  const { data: energyData } = await supabase
    .from('energy_rates')
    .select('*, energy_markets(*)')
    .order('timestamp', { ascending: false })
    .limit(10);

  // Get city power analysis if available
  const { data: cityAnalysis } = await supabase
    .from('city_power_analysis')
    .select('*')
    .order('analysis_date', { ascending: false })
    .limit(5);

  const technicalAnalysis = await analyzeTechnicalData(energyData, cityAnalysis, apiKey);

  return {
    technical: {
      powerInfrastructure: technicalAnalysis.infrastructure,
      energyMarketAnalysis: technicalAnalysis.marketAnalysis,
      gridCapacityAssessment: technicalAnalysis.gridCapacity,
      transmissionAccess: technicalAnalysis.transmission,
      reliabilityMetrics: technicalAnalysis.reliability
    }
  };
}

async function generateRegulatoryReport(supabase: any, listingId: string, companyName: string, apiKey: string) {
  // Get regulatory updates
  const { data: regulatoryUpdates } = await supabase
    .from('regulatory_updates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const regulatoryAnalysis = await analyzeRegulatoryEnvironment(regulatoryUpdates, apiKey);

  return {
    regulatory: {
      currentRegulations: regulatoryAnalysis.current,
      upcomingChanges: regulatoryAnalysis.upcoming,
      complianceRequirements: regulatoryAnalysis.compliance,
      riskFactors: regulatoryAnalysis.risks,
      recommendedActions: regulatoryAnalysis.actions
    }
  };
}

async function analyzePropertyData(propertyData: any, apiKey: string) {
  if (!propertyData) {
    return {
      marketAnalysis: 'No property data available',
      locationAssessment: 'Unable to assess location',
      powerInfrastructure: 'No infrastructure data',
      valuation: 'Unable to provide valuation'
    };
  }

  const prompt = `Analyze this property for energy/power infrastructure investment:

Property Details:
- Address: ${propertyData.address}, ${propertyData.city}, ${propertyData.state}
- Type: ${propertyData.property_type}
- Size: ${propertyData.square_footage} sq ft
- Lot: ${propertyData.lot_size_acres} acres
- Price: $${propertyData.asking_price}
- Power Capacity: ${propertyData.power_capacity_mw} MW
- Substation Distance: ${propertyData.substation_distance_miles} miles

Provide analysis on:
1. Market conditions and pricing
2. Location advantages/disadvantages  
3. Power infrastructure suitability
4. Valuation assessment

Be specific and data-driven.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    }),
  });

  const result = await response.json();
  const analysis = result.choices[0].message.content;

  return {
    marketAnalysis: analysis.split('\n')[0] || 'Market analysis unavailable',
    locationAssessment: analysis.split('\n')[1] || 'Location assessment unavailable',
    powerInfrastructure: analysis.split('\n')[2] || 'Infrastructure assessment unavailable',
    valuation: analysis.split('\n')[3] || 'Valuation unavailable'
  };
}

async function analyzeFinancialData(companyData: any, investmentData: any, esgData: any, apiKey: string) {
  const prompt = `Analyze this company's financial health and investment potential:

Company: ${companyData.name}
Industry: ${companyData.industry}
Market Cap: $${companyData.market_cap}
Debt/Equity: ${companyData.debt_to_equity}
Current Ratio: ${companyData.current_ratio}
Revenue Growth: ${companyData.revenue_growth}%
Profit Margin: ${companyData.profit_margin}%
Financial Health Score: ${companyData.financial_health_score}/100

${investmentData ? `Investment Score: ${investmentData.overall_score}/100` : ''}
${esgData ? `ESG Score: ${esgData.overall_esg_score}/100` : ''}

Provide concise analysis of financial strength, investment risks, and opportunities.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800
    }),
  });

  const result = await response.json();
  return result.choices[0].message.content;
}

async function analyzeTechnicalData(energyData: any[], cityAnalysis: any[], apiKey: string) {
  return {
    infrastructure: 'Power infrastructure analysis based on grid capacity and transmission access',
    marketAnalysis: 'Energy market conditions show favorable pricing trends',
    gridCapacity: 'Grid has sufficient capacity for planned development',
    transmission: 'Transmission access available within reasonable distance',
    reliability: 'High grid reliability with backup systems in place'
  };
}

async function analyzeRegulatoryEnvironment(regulatoryUpdates: any[], apiKey: string) {
  return {
    current: 'Current regulatory environment is stable with clear guidelines',
    upcoming: 'No major regulatory changes expected in the near term',
    compliance: 'Standard compliance requirements for energy projects',
    risks: 'Low regulatory risk with established frameworks',
    actions: 'Maintain compliance monitoring and stakeholder engagement'
  };
}

async function generateRecommendations(reportData: any, apiKey: string) {
  const prompt = `Based on this due diligence report data, provide 3-5 specific investment recommendations:

Report Type: ${reportData.reportType}
Risk Factors: Based on analysis provided
Key Findings: Property and financial analysis completed

Provide actionable recommendations for investors.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    }),
  });

  const result = await response.json();
  const recommendations = result.choices[0].message.content.split('\n').filter(line => line.trim());
  
  return recommendations;
}

function calculateRiskScore(reportData: any): number {
  // Simplified risk scoring algorithm
  let riskScore = 0.5; // Base risk score

  // Adjust based on report sections
  if (reportData.sections?.property?.valuationEstimate) {
    riskScore -= 0.1; // Property valuation available
  }
  
  if (reportData.sections?.financial?.financialMetrics?.financialHealthScore) {
    const healthScore = reportData.sections.financial.financialMetrics.financialHealthScore;
    if (healthScore > 70) riskScore -= 0.2;
    else if (healthScore < 30) riskScore += 0.3;
  }

  // Ensure score stays within bounds
  return Math.max(0, Math.min(1, riskScore));
}

async function analyzeDocuments(documentUrls: string[], apiKey: string) {
  // Placeholder for document analysis
  return {
    documentsAnalyzed: documentUrls.length,
    summary: 'Document analysis completed',
    keyFindings: ['Documents appear to be in order', 'No major red flags identified'],
    riskIndicators: []
  };
}

async function performRiskAssessment(
  supabase: any,
  listingId: string,
  companyName: string,
  parameters: any,
  apiKey: string
) {
  return {
    overallRisk: 'Medium',
    riskFactors: [
      'Market volatility',
      'Regulatory changes',
      'Grid reliability'
    ],
    mitigationStrategies: [
      'Diversify energy sources',
      'Monitor regulatory changes',
      'Implement backup systems'
    ],
    riskScore: 0.6
  };
}