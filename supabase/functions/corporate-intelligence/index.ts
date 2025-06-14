
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, company_name, analysis_depth } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Corporate Intelligence function called with action:', action);

    if (action === 'ai_analyze_company') {
      console.log('Starting AI analysis for company:', company_name);
      
      if (!openaiApiKey) {
        console.error('OpenAI API key not configured');
        return new Response(JSON.stringify({ 
          error: 'OpenAI API key not configured. Please add your OpenAI API key in the project settings.',
          needsApiKey: true 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!company_name?.trim()) {
        return new Response(JSON.stringify({ 
          error: 'Company name is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate comprehensive company analysis using AI
      const analysisPrompt = `
        Analyze the company "${company_name}" and provide a comprehensive assessment with the following details:
        
        1. Estimate the company's power consumption in megawatts (MW) based on:
           - Industry type and operations
           - Number of facilities and employees
           - Data center usage, manufacturing processes
           - Mining operations (if applicable)
           - Server farms, cloud infrastructure
        
        2. Provide detailed reasoning for the power consumption estimate
        
        3. Assess financial health on a scale of 1-100 based on publicly available information
        
        4. Identify potential distress signals or risk factors
        
        5. Evaluate investment opportunity potential
        
        6. Provide key insights about the company's energy profile
        
        7. Estimate market cap, debt-to-equity ratio, current ratio, revenue growth, and profit margin
        
        8. List major facility locations if known
        
        Format your response as a JSON object with this structure:
        {
          "company_name": string,
          "industry": string,
          "sector": string,
          "market_cap": number (in dollars),
          "power_usage_estimate": number (in MW),
          "financial_health_score": number (1-100),
          "distress_signals": string[],
          "locations": [{"city": string, "state": string, "facility_type": string}],
          "debt_to_equity": number,
          "current_ratio": number,
          "revenue_growth": number (as decimal, e.g., 0.15 for 15%),
          "profit_margin": number (as decimal),
          "ai_analysis": {
            "power_consumption_reasoning": string,
            "risk_assessment": string,
            "investment_opportunity": string,
            "key_insights": string[]
          }
        }
        
        Be specific and detailed in your analysis. For power consumption, consider:
        - Data centers typically use 1-100MW per facility
        - Manufacturing facilities vary widely (1-50MW)
        - Bitcoin mining operations use 10-100MW per facility
        - Office buildings typically use 1-5MW
        - Cryptocurrency exchanges often have significant server infrastructure
      `;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a financial and energy infrastructure analyst with expertise in corporate power consumption patterns, financial analysis, and investment assessment. Provide detailed, accurate analysis based on publicly available information.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error:', response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const aiResponse = await response.json();
        const analysisContent = aiResponse.choices[0].message.content;
        
        // Parse the JSON response from AI
        let analysis;
        try {
          // Extract JSON from the response (in case there's extra text)
          const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in AI response');
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.error('AI Response content:', analysisContent);
          throw new Error('Failed to parse AI analysis response');
        }

        // Validate required fields
        if (!analysis.company_name || !analysis.industry || !analysis.sector) {
          throw new Error('AI analysis missing required fields');
        }

        // Store the analysis in the companies table
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', analysis.company_name)
          .single();

        if (existingCompany) {
          // Update existing company
          const { error: updateError } = await supabase
            .from('companies')
            .update({
              industry: analysis.industry,
              sector: analysis.sector,
              market_cap: analysis.market_cap,
              power_usage_estimate: analysis.power_usage_estimate,
              financial_health_score: analysis.financial_health_score,
              distress_signals: analysis.distress_signals || [],
              locations: analysis.locations || [],
              debt_to_equity: analysis.debt_to_equity,
              current_ratio: analysis.current_ratio,
              revenue_growth: analysis.revenue_growth,
              profit_margin: analysis.profit_margin,
              analyzed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCompany.id);

          if (updateError) {
            console.error('Database update error:', updateError);
            throw new Error(`Database update failed: ${updateError.message}`);
          }
        } else {
          // Insert new company
          const { error: insertError } = await supabase
            .from('companies')
            .insert({
              name: analysis.company_name,
              industry: analysis.industry,
              sector: analysis.sector,
              market_cap: analysis.market_cap,
              power_usage_estimate: analysis.power_usage_estimate,
              financial_health_score: analysis.financial_health_score,
              distress_signals: analysis.distress_signals || [],
              locations: analysis.locations || [],
              debt_to_equity: analysis.debt_to_equity,
              current_ratio: analysis.current_ratio,
              revenue_growth: analysis.revenue_growth,
              profit_margin: analysis.profit_margin,
              analyzed_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Database insert error:', insertError);
            throw new Error(`Database insert failed: ${insertError.message}`);
          }
        }

        console.log('AI analysis completed and stored for:', company_name);

        return new Response(JSON.stringify({ 
          success: true,
          analysis 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        return new Response(JSON.stringify({ 
          error: `AI analysis failed: ${aiError.message}`,
          details: aiError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle other actions with better error handling
    if (action === 'analyze_company') {
      if (!company_name?.trim()) {
        return new Response(JSON.stringify({ 
          error: 'Company name is required and cannot be empty' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return await analyzeCompany(supabase, company_name.trim(), analysis_depth);
    }

    if (action === 'scan_industries') {
      return await scanIndustries(supabase);
    }

    if (action === 'monitor_linkedin') {
      return await monitorLinkedIn(supabase);
    }

    if (action === 'detect_distress') {
      return await detectDistressSignals(supabase);
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action specified',
      validActions: ['ai_analyze_company', 'analyze_company', 'scan_industries', 'monitor_linkedin', 'detect_distress']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in corporate-intelligence function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeCompany(supabase: any, companyName: string, analysis_depth?: string) {
  console.log(`Analyzing company: ${companyName}`)
  
  try {
    const financialData = await getFinancialData(analysis_depth || companyName)
    const locationData = await getCompanyLocations(companyName)
    const powerUsage = estimatePowerUsage(financialData.industry, financialData.sector)
    
    const healthScore = calculateFinancialHealth(financialData)
    const distressSignals = detectCompanyDistress(financialData)
    
    const companyAnalysis = {
      name: companyName,
      ticker: null,
      industry: financialData.industry,
      sector: financialData.sector,
      market_cap: financialData.market_cap || null,
      debt_to_equity: financialData.debt_to_equity || null,
      current_ratio: financialData.current_ratio || null,
      revenue_growth: financialData.revenue_growth || null,
      profit_margin: financialData.profit_margin || null,
      power_usage_estimate: powerUsage,
      locations: locationData,
      financial_health_score: healthScore,
      distress_signals: distressSignals,
      analyzed_at: new Date().toISOString()
    }

    // Use upsert with proper conflict handling
    const { data, error } = await supabase
      .from('companies')
      .upsert(companyAnalysis, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: companyAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error analyzing company:', error)
    throw error
  }
}

async function scanIndustries(supabase: any) {
  console.log('Scanning power-intensive industries...')
  
  try {
    const powerIntensiveIndustries = [
      'Data Centers & Cloud Computing',
      'Cryptocurrency Mining', 
      'Steel Production'
    ]

    const industryData = []
    
    for (const industry of powerIntensiveIndustries) {
      console.log(`Scanning industry: ${industry}`)
      const companies = await getIndustryCompanies(industry)
      
      const limitedCompanies = companies.slice(0, 3) // Further reduced to prevent overload
      
      for (const company of limitedCompanies) {
        try {
          const analysis = await analyzeCompanyBriefly(company)
          industryData.push({
            industry,
            company_name: company.name,
            ticker: company.ticker || null,
            market_cap: company.market_cap || null,
            power_intensity: company.power_intensity || null,
            financial_health: analysis.health_score,
            risk_level: analysis.risk_level,
            scanned_at: new Date().toISOString()
          })
        } catch (companyError) {
          console.error(`Error analyzing company ${company.name}:`, companyError)
          // Continue with other companies instead of failing entirely
        }
      }
    }

    console.log(`Inserting ${industryData.length} industry records`)

    if (industryData.length > 0) {
      // Insert in smaller batches with better error handling
      const batchSize = 5
      let successCount = 0
      
      for (let i = 0; i < industryData.length; i += batchSize) {
        const batch = industryData.slice(i, i + batchSize)
        
        try {
          const { error } = await supabase
            .from('industry_intelligence')
            .upsert(batch, { onConflict: 'company_name,industry' })

          if (error) {
            console.error('Database batch error:', error)
          } else {
            successCount += batch.length
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          companies_analyzed: successCount,
          total_attempted: industryData.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ success: true, companies_analyzed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error scanning industries:', error)
    throw error
  }
}

async function monitorLinkedIn(supabase: any) {
  console.log('Monitoring LinkedIn for corporate intelligence...')
  
  try {
    const posts = await simulateLinkedInScraping()
    const limitedPosts = posts.slice(0, 5) // Reduced from 10 to 5
    
    let successCount = 0
    
    for (const post of limitedPosts) {
      try {
        const { error } = await supabase
          .from('linkedin_intelligence')
          .insert({
            company: post.company,
            content: post.content,
            post_date: post.date,
            keywords: post.keywords || [],
            signals: post.signals || [],
            discovered_at: new Date().toISOString()
          })
        
        if (error) {
          console.error('Error storing LinkedIn data:', error)
        } else {
          successCount++
        }
      } catch (postError) {
        console.error('Error processing LinkedIn post:', postError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        posts_analyzed: successCount,
        total_attempted: limitedPosts.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error monitoring LinkedIn:', error)
    throw error
  }
}

async function detectDistressSignals(supabase: any) {
  console.log('Detecting corporate distress signals...')
  
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .lt('financial_health_score', 60)
      .limit(25) // Reduced from 50 to 25

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    const alerts = []
    
    for (const company of companies || []) {
      try {
        const distressLevel = assessDistressLevel(company)
        
        if (distressLevel >= 70) {
          alerts.push({
            company_name: company.name,
            alert_type: 'high_distress',
            distress_level: Math.min(100, Math.max(0, distressLevel)), // Ensure within valid range
            signals: Array.isArray(company.distress_signals) ? company.distress_signals : [],
            power_capacity: Number(company.power_usage_estimate) || 0,
            potential_value: estimateAssetValue(company),
            created_at: new Date().toISOString()
          })
        }
      } catch (companyError) {
        console.error(`Error assessing distress for ${company.name}:`, companyError)
      }
    }

    let successCount = 0
    
    if (alerts.length > 0) {
      try {
        const { error: alertError } = await supabase
          .from('distress_alerts')
          .insert(alerts)
        
        if (alertError) {
          console.error('Error storing alerts:', alertError)
        } else {
          successCount = alerts.length
        }
      } catch (alertsError) {
        console.error('Error processing alerts:', alertsError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_generated: successCount,
        total_companies_analyzed: companies?.length || 0,
        alerts: alerts.slice(0, 5) // Return only first 5 for response size management
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error detecting distress signals:', error)
    throw error
  }
}

// Helper functions with improved error handling
async function getFinancialData(identifier: string) {
  // Validate input
  if (!identifier?.trim()) {
    throw new Error('Company identifier is required')
  }
  
  // Simulate API call with more realistic data ranges
  return {
    industry: 'Technology',
    sector: 'Data Centers',
    market_cap: Math.floor(Math.random() * 10000000000) + 1000000000, // 1B-10B range
    debt_to_equity: Math.random() * 2,
    current_ratio: Math.random() * 3 + 0.5, // 0.5-3.5 range
    revenue_growth: (Math.random() - 0.5) * 0.4, // -20% to +20%
    profit_margin: (Math.random() - 0.3) * 0.3, // More realistic range
    cash_flow: (Math.random() - 0.5) * 100000000
  }
}

async function getCompanyLocations(companyName: string) {
  if (!companyName?.trim()) {
    return []
  }
  
  return [
    { 
      address: '123 Industrial Blvd', 
      city: 'Austin', 
      state: 'TX', 
      facility_type: 'Manufacturing' 
    }
  ]
}

function estimatePowerUsage(industry: string, sector: string): number {
  const powerMap: { [key: string]: number } = {
    'Data Centers': 25,
    'Cryptocurrency': 50,
    'Steel Production': 75,
    'Manufacturing': 15,
    'Technology': 20
  }
  
  return powerMap[sector] || powerMap[industry] || 10
}

function calculateFinancialHealth(data: any): number {
  let score = 50
  
  // Validate input data
  if (!data || typeof data !== 'object') {
    return 50 // Default score for invalid data
  }
  
  if (typeof data.debt_to_equity === 'number') {
    if (data.debt_to_equity < 0.3) score += 20
    else if (data.debt_to_equity > 0.8) score -= 20
  }
  
  if (typeof data.current_ratio === 'number') {
    if (data.current_ratio > 1.5) score += 15
    else if (data.current_ratio < 1.0) score -= 15
  }
  
  if (typeof data.revenue_growth === 'number') {
    if (data.revenue_growth > 0.1) score += 15
    else if (data.revenue_growth < -0.1) score -= 20
  }
  
  if (typeof data.profit_margin === 'number') {
    if (data.profit_margin > 0.1) score += 15
    else if (data.profit_margin < 0) score -= 15
  }
  
  return Math.max(0, Math.min(100, score))
}

function detectCompanyDistress(data: any): string[] {
  const signals = []
  
  if (!data || typeof data !== 'object') {
    return signals
  }
  
  if (typeof data.debt_to_equity === 'number' && data.debt_to_equity > 0.8) {
    signals.push('High debt burden')
  }
  if (typeof data.current_ratio === 'number' && data.current_ratio < 1.0) {
    signals.push('Liquidity issues')
  }
  if (typeof data.revenue_growth === 'number' && data.revenue_growth < -0.2) {
    signals.push('Declining revenue')
  }
  if (typeof data.profit_margin === 'number' && data.profit_margin < -0.1) {
    signals.push('Significant losses')
  }
  if (typeof data.cash_flow === 'number' && data.cash_flow < 0) {
    signals.push('Negative cash flow')
  }
  
  return signals
}

async function simulateLinkedInScraping() {
  return [
    {
      company: 'TechCorp Industries',
      content: 'We are consolidating operations and closing our Austin data center facility...',
      date: new Date().toISOString(),
      keywords: ['closing facility', 'data center'],
      signals: ['facility_closure', 'potential_asset_sale']
    },
    {
      company: 'DataFlow Systems',
      content: 'Announcing strategic restructuring of our power infrastructure division...',
      date: new Date().toISOString(),
      keywords: ['restructuring', 'power infrastructure'],
      signals: ['organizational_change', 'asset_evaluation']
    }
  ]
}

async function getIndustryCompanies(industry: string) {
  const companiesMap: { [key: string]: any[] } = {
    'Data Centers & Cloud Computing': [
      { name: 'CloudTech Corp', ticker: 'CTC', market_cap: 5000000000, power_intensity: 'very_high' },
      { name: 'DataFlow Systems', ticker: 'DFS', market_cap: 3000000000, power_intensity: 'high' }
    ],
    'Cryptocurrency Mining': [
      { name: 'CryptoMine Inc', ticker: 'CMI', market_cap: 1000000000, power_intensity: 'extreme' },
      { name: 'HashPower Corp', ticker: 'HPC', market_cap: 800000000, power_intensity: 'extreme' }
    ],
    'Steel Production': [
      { name: 'SteelWorks Industries', ticker: 'SWI', market_cap: 2000000000, power_intensity: 'high' },
      { name: 'MetalForge Corp', ticker: 'MFC', market_cap: 1500000000, power_intensity: 'high' }
    ]
  }
  
  return companiesMap[industry] || []
}

async function analyzeCompanyBriefly(company: any) {
  if (!company || !company.name) {
    return { health_score: 50, risk_level: 'medium' }
  }
  
  return {
    health_score: Math.floor(Math.random() * 100),
    risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
  }
}

function assessDistressLevel(company: any): number {
  let distress = 0
  
  if (!company || typeof company !== 'object') {
    return 0
  }
  
  if (typeof company.financial_health_score === 'number' && company.financial_health_score < 40) {
    distress += 30
  }
  if (Array.isArray(company.distress_signals) && company.distress_signals.length > 2) {
    distress += 25
  }
  if (typeof company.debt_to_equity === 'number' && company.debt_to_equity > 1.0) {
    distress += 20
  }
  if (typeof company.current_ratio === 'number' && company.current_ratio < 0.8) {
    distress += 15
  }
  if (typeof company.revenue_growth === 'number' && company.revenue_growth < -0.3) {
    distress += 10
  }
  
  return Math.min(100, Math.max(0, distress))
}

function estimateAssetValue(company: any): number {
  if (!company || typeof company !== 'object') {
    return 0
  }
  
  const powerUsage = Number(company.power_usage_estimate) || 0
  return powerUsage * 1000000 // $1M per MW estimate
}
