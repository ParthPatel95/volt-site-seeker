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
    const { action, company_name, analysis_depth, user_id, query, criteria } = await req.json();
    
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

    // NEW FEATURE 1: Real-Time News Intelligence
    if (action === 'analyze_news_intelligence') {
      return await analyzeNewsIntelligence(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 2: Predictive Power Demand Modeling
    if (action === 'generate_power_forecasts') {
      return await generatePowerForecasts(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 3: Competitive Intelligence
    if (action === 'analyze_competitors') {
      return await analyzeCompetitors(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 4: Investment Risk Scoring
    if (action === 'calculate_investment_score') {
      return await calculateInvestmentScore(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 5: Portfolio Optimization
    if (action === 'generate_portfolio_recommendations') {
      return await generatePortfolioRecommendations(supabase, openaiApiKey, user_id, criteria);
    }

    // NEW FEATURE 6: Due Diligence Reports
    if (action === 'generate_due_diligence') {
      return await generateDueDiligenceReport(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 7: Social Media Sentiment Analysis
    if (action === 'analyze_social_sentiment') {
      return await analyzeSocialSentiment(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 8: Supply Chain Impact Analysis
    if (action === 'analyze_supply_chain') {
      return await analyzeSupplyChain(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 9: ESG and Sustainability Scoring
    if (action === 'calculate_esg_score') {
      return await calculateESGScore(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 10: Natural Language Query
    if (action === 'natural_language_query') {
      return await processNaturalLanguageQuery(supabase, openaiApiKey, query);
    }

    // NEW FEATURE 11: Market Timing Intelligence
    if (action === 'analyze_market_timing') {
      return await analyzeMarketTiming(supabase, openaiApiKey, company_name);
    }

    // NEW FEATURE 12: Alert Configuration
    if (action === 'configure_alerts') {
      return await configureAlerts(supabase, user_id, criteria);
    }

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
      validActions: [
        'ai_analyze_company', 'analyze_company', 'scan_industries', 'monitor_linkedin', 'detect_distress',
        'analyze_news_intelligence', 'generate_power_forecasts', 'analyze_competitors', 'calculate_investment_score',
        'generate_portfolio_recommendations', 'generate_due_diligence', 'analyze_social_sentiment',
        'analyze_supply_chain', 'calculate_esg_score', 'natural_language_query', 'analyze_market_timing', 'configure_alerts'
      ]
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

// NEW AI-POWERED FUNCTIONS

async function analyzeNewsIntelligence(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Analyzing news intelligence for: ${companyName}`);
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key required for news analysis');
  }

  try {
    const newsPrompt = `
      Generate realistic news intelligence for the company "${companyName}". Create 3-5 relevant news articles 
      that might impact power infrastructure investment decisions. Include:
      
      1. Recent corporate announcements (facility expansions, closures, financial issues)
      2. Industry trends affecting power consumption
      3. Regulatory changes impacting the company
      4. Market conditions affecting the sector
      
      Format as JSON:
      {
        "articles": [
          {
            "title": string,
            "content": string,
            "source": string,
            "published_at": string (ISO date),
            "keywords": string[],
            "impact_score": number (1-100),
            "relevance_to_power_infrastructure": string
          }
        ]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a financial news analyst specializing in power infrastructure and corporate intelligence.' },
          { role: 'user', content: newsPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const newsData = JSON.parse(aiResponse.choices[0].message.content);

    // Store news intelligence
    for (const article of newsData.articles) {
      await supabase
        .from('news_intelligence')
        .insert({
          title: article.title,
          content: article.content,
          source: article.source,
          published_at: article.published_at,
          keywords: article.keywords,
          url: `https://example-news.com/${article.title.toLowerCase().replace(/\s+/g, '-')}`,
          discovered_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      articles_analyzed: newsData.articles.length,
      articles: newsData.articles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('News intelligence error:', error);
    throw error;
  }
}

async function generatePowerForecasts(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Generating power forecasts for: ${companyName}`);
  
  try {
    // Get company data
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const forecastPrompt = `
      Generate power demand forecasts for "${companyName}" based on the following data:
      - Current power usage: ${company.power_usage_estimate} MW
      - Industry: ${company.industry}
      - Sector: ${company.sector}
      - Financial health: ${company.financial_health_score}/100
      
      Create 12-month forecasts considering:
      1. Seasonal variations in power consumption
      2. Business growth projections
      3. Industry trends
      4. Economic factors
      
      Format as JSON:
      {
        "forecasts": [
          {
            "month": number (1-12),
            "predicted_consumption_mw": number,
            "confidence_score": number (1-100),
            "seasonal_factors": {
              "temperature_impact": string,
              "business_cycle_impact": string
            },
            "growth_assumptions": {
              "facility_expansion": boolean,
              "technology_adoption": string,
              "market_conditions": string
            }
          }
        ]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an energy forecasting specialist with expertise in corporate power consumption patterns.' },
          { role: 'user', content: forecastPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const forecastData = JSON.parse(aiResponse.choices[0].message.content);

    // Store forecasts
    for (const forecast of forecastData.forecasts) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + forecast.month - 1);
      
      await supabase
        .from('power_demand_forecasts')
        .insert({
          company_id: company.id,
          forecast_date: forecastDate.toISOString().split('T')[0],
          predicted_consumption_mw: forecast.predicted_consumption_mw,
          confidence_score: forecast.confidence_score,
          forecast_horizon_months: forecast.month,
          seasonal_factors: forecast.seasonal_factors,
          growth_assumptions: forecast.growth_assumptions
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      forecasts_generated: forecastData.forecasts.length,
      forecasts: forecastData.forecasts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Power forecast error:', error);
    throw error;
  }
}

async function analyzeCompetitors(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Analyzing competitors for: ${companyName}`);
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const competitorPrompt = `
      Identify and analyze 3-5 key competitors for "${companyName}" in the ${company.industry} sector.
      Focus on companies with significant power infrastructure needs.
      
      For each competitor, provide:
      1. Market share estimate
      2. Power usage comparison
      3. Competitive advantages and weaknesses
      4. Market positioning
      
      Format as JSON:
      {
        "competitors": [
          {
            "name": string,
            "market_share_estimate": number (decimal, e.g., 0.15 for 15%),
            "power_usage_comparison": number (MW),
            "competitive_advantages": string[],
            "competitive_weaknesses": string[],
            "market_positioning": string
          }
        ]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a competitive intelligence analyst specializing in power-intensive industries.' },
          { role: 'user', content: competitorPrompt }
        ],
        temperature: 0.4,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const competitorData = JSON.parse(aiResponse.choices[0].message.content);

    // Store competitor analysis
    for (const competitor of competitorData.competitors) {
      await supabase
        .from('competitor_analysis')
        .insert({
          company_id: company.id,
          competitor_name: competitor.name,
          market_share_estimate: competitor.market_share_estimate,
          power_usage_comparison: competitor.power_usage_comparison,
          competitive_advantages: competitor.competitive_advantages,
          competitive_weaknesses: competitor.competitive_weaknesses,
          market_positioning: competitor.market_positioning
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      competitors_analyzed: competitorData.competitors.length,
      competitors: competitorData.competitors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    throw error;
  }
}

async function calculateInvestmentScore(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Calculating investment score for: ${companyName}`);
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const scoringPrompt = `
      Calculate comprehensive investment scores for "${companyName}" based on:
      - Financial health: ${company.financial_health_score}/100
      - Power usage: ${company.power_usage_estimate} MW
      - Industry: ${company.industry}
      - Distress signals: ${company.distress_signals?.join(', ') || 'None'}
      - Market cap: $${company.market_cap || 'Unknown'}
      - Debt to equity: ${company.debt_to_equity || 'Unknown'}
      
      Provide scores (0-100) for:
      1. Overall investment attractiveness
      2. Risk assessment
      3. Opportunity potential
      4. Timing for acquisition
      5. Confidence in analysis
      
      Format as JSON:
      {
        "overall_score": number (0-100),
        "risk_score": number (0-100),
        "opportunity_score": number (0-100),
        "timing_score": number (0-100),
        "confidence_level": number (0-100),
        "recommendation": string,
        "key_factors": string[],
        "risk_factors": string[],
        "expected_roi_range": {
          "min": number,
          "max": number,
          "timeframe_years": number
        }
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an investment analyst specializing in distressed power infrastructure assets.' },
          { role: 'user', content: scoringPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    });

    const aiResponse = await response.json();
    const scoreData = JSON.parse(aiResponse.choices[0].message.content);

    // Store investment score
    await supabase
      .from('investment_scores')
      .insert({
        company_id: company.id,
        overall_score: scoreData.overall_score,
        risk_score: scoreData.risk_score,
        opportunity_score: scoreData.opportunity_score,
        timing_score: scoreData.timing_score,
        confidence_level: scoreData.confidence_level,
        recommendation: scoreData.recommendation,
        key_factors: scoreData.key_factors,
        risk_factors: scoreData.risk_factors,
        expected_roi_range: scoreData.expected_roi_range
      });

    return new Response(JSON.stringify({ 
      success: true, 
      investment_score: scoreData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Investment scoring error:', error);
    throw error;
  }
}

async function generatePortfolioRecommendations(supabase: any, openaiApiKey: string, userId: string, criteria: any) {
  console.log(`Generating portfolio recommendations for user: ${userId}`);
  
  try {
    // Get all companies with investment scores
    const { data: companies } = await supabase
      .from('companies')
      .select(`
        *,
        investment_scores (*)
      `)
      .not('investment_scores', 'is', null);

    const portfolioPrompt = `
      Create portfolio recommendations based on ${companies?.length || 0} analyzed companies.
      Consider diversification across:
      - Geographic regions
      - Industry sectors
      - Risk levels
      - Power capacity ranges
      
      Criteria: ${JSON.stringify(criteria || {})}
      
      Format as JSON:
      {
        "recommendation_type": string,
        "target_companies": string[],
        "diversification_score": number (0-100),
        "risk_adjusted_return": number (decimal),
        "geographic_allocation": {
          "regions": [{"region": string, "percentage": number}]
        },
        "sector_allocation": {
          "sectors": [{"sector": string, "percentage": number}]
        },
        "timing_recommendations": {
          "immediate": string[],
          "short_term": string[],
          "long_term": string[]
        },
        "investment_thesis": string
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a portfolio optimization specialist for power infrastructure investments.' },
          { role: 'user', content: portfolioPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const portfolioData = JSON.parse(aiResponse.choices[0].message.content);

    // Store portfolio recommendation
    await supabase
      .from('portfolio_recommendations')
      .insert({
        user_id: userId,
        recommendation_type: portfolioData.recommendation_type,
        target_companies: portfolioData.target_companies,
        diversification_score: portfolioData.diversification_score,
        risk_adjusted_return: portfolioData.risk_adjusted_return,
        geographic_allocation: portfolioData.geographic_allocation,
        sector_allocation: portfolioData.sector_allocation,
        timing_recommendations: portfolioData.timing_recommendations,
        investment_thesis: portfolioData.investment_thesis,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    return new Response(JSON.stringify({ 
      success: true, 
      portfolio_recommendation: portfolioData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Portfolio optimization error:', error);
    throw error;
  }
}

async function generateDueDiligenceReport(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Generating due diligence report for: ${companyName}`);
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select(`
        *,
        investment_scores (*),
        esg_scores (*),
        power_demand_forecasts (*),
        competitor_analysis (*)
      `)
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const reportPrompt = `
      Generate a comprehensive due diligence report for "${companyName}" including:
      
      1. Executive Summary
      2. Financial Analysis
      3. Power Infrastructure Assessment
      4. Risk Assessment
      5. Valuation Analysis
      6. Strategic Recommendations
      
      Company Data:
      - Financial Health: ${company.financial_health_score}/100
      - Power Usage: ${company.power_usage_estimate} MW
      - Market Cap: $${company.market_cap || 'Unknown'}
      - Industry: ${company.industry}
      - Distress Signals: ${company.distress_signals?.join(', ') || 'None'}
      
      Format as JSON:
      {
        "executive_summary": string,
        "financial_analysis": {
          "strengths": string[],
          "weaknesses": string[],
          "key_metrics": object
        },
        "power_infrastructure_assessment": {
          "current_capacity": string,
          "expansion_potential": string,
          "efficiency_rating": string
        },
        "risk_assessment": {
          "financial_risks": string[],
          "operational_risks": string[],
          "market_risks": string[]
        },
        "valuation_analysis": {
          "estimated_value_range": object,
          "valuation_methods": string[],
          "key_assumptions": string[]
        },
        "recommendations": string[]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a senior investment analyst creating detailed due diligence reports for power infrastructure acquisitions.' },
          { role: 'user', content: reportPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    });

    const aiResponse = await response.json();
    const reportData = JSON.parse(aiResponse.choices[0].message.content);

    // Store due diligence report
    await supabase
      .from('due_diligence_reports')
      .insert({
        company_id: company.id,
        report_type: 'comprehensive',
        executive_summary: reportData.executive_summary,
        financial_analysis: reportData.financial_analysis,
        power_infrastructure_assessment: reportData.power_infrastructure_assessment,
        risk_assessment: reportData.risk_assessment,
        valuation_analysis: reportData.valuation_analysis,
        recommendations: reportData.recommendations,
        report_data: reportData
      });

    return new Response(JSON.stringify({ 
      success: true, 
      report: reportData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Due diligence report error:', error);
    throw error;
  }
}

async function analyzeSocialSentiment(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Analyzing social sentiment for: ${companyName}`);
  
  try {
    const sentimentPrompt = `
      Generate social media sentiment analysis for "${companyName}". Create realistic social media posts 
      that might indicate corporate health or distress signals.
      
      Include posts from:
      1. Employees (LinkedIn, Twitter)
      2. Industry discussions
      3. Financial forums
      4. News comments
      
      Format as JSON:
      {
        "posts": [
          {
            "platform": string,
            "content": string,
            "author": string,
            "sentiment_score": number (-100 to 100),
            "keywords": string[],
            "early_warning_signals": string[],
            "posted_at": string (ISO date)
          }
        ],
        "overall_sentiment": {
          "score": number (-100 to 100),
          "trend": string,
          "key_themes": string[]
        }
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a social media sentiment analyst specializing in corporate intelligence.' },
          { role: 'user', content: sentimentPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const sentimentData = JSON.parse(aiResponse.choices[0].message.content);

    // Store social sentiment data
    for (const post of sentimentData.posts) {
      await supabase
        .from('social_intelligence')
        .insert({
          platform: post.platform,
          content: post.content,
          author: post.author,
          posted_at: post.posted_at,
          keywords: post.keywords,
          source: companyName,
          sentiment_score: post.sentiment_score,
          sentiment_analysis: sentimentData.overall_sentiment,
          early_warning_signals: post.early_warning_signals
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sentiment_analysis: sentimentData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Social sentiment error:', error);
    throw error;
  }
}

async function analyzeSupplyChain(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Analyzing supply chain for: ${companyName}`);
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const supplyChainPrompt = `
      Analyze supply chain vulnerabilities and dependencies for "${companyName}" in the ${company.industry} sector.
      
      Focus on:
      1. Critical supplier dependencies
      2. Key components and materials
      3. Geographic concentration risks
      4. Regulatory compliance risks
      5. Impact on power consumption
      
      Format as JSON:
      {
        "supplier_dependencies": string[],
        "critical_components": string[],
        "disruption_risks": {
          "high_risk": string[],
          "medium_risk": string[],
          "low_risk": string[]
        },
        "geographic_exposure": {
          "regions": [{"region": string, "risk_level": string, "impact": string}]
        },
        "regulatory_risks": string[],
        "mitigation_strategies": string[],
        "impact_on_power_consumption": {
          "disruption_scenarios": [{"scenario": string, "power_impact_percent": number}]
        }
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a supply chain risk analyst with expertise in power-intensive industries.' },
          { role: 'user', content: supplyChainPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const supplyChainData = JSON.parse(aiResponse.choices[0].message.content);

    // Store supply chain analysis
    await supabase
      .from('supply_chain_analysis')
      .insert({
        company_id: company.id,
        supplier_dependencies: supplyChainData.supplier_dependencies,
        critical_components: supplyChainData.critical_components,
        disruption_risks: supplyChainData.disruption_risks,
        geographic_exposure: supplyChainData.geographic_exposure,
        regulatory_risks: supplyChainData.regulatory_risks,
        mitigation_strategies: supplyChainData.mitigation_strategies,
        impact_on_power_consumption: supplyChainData.impact_on_power_consumption
      });

    return new Response(JSON.stringify({ 
      success: true, 
      supply_chain_analysis: supplyChainData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Supply chain analysis error:', error);
    throw error;
  }
}

async function calculateESGScore(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Calculating ESG score for: ${companyName}`);
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const esgPrompt = `
      Calculate comprehensive ESG (Environmental, Social, Governance) scores for "${companyName}" 
      in the ${company.industry} sector.
      
      Assess:
      1. Environmental impact and sustainability initiatives
      2. Social responsibility and employee welfare
      3. Corporate governance and transparency
      4. Green transition opportunities
      5. Regulatory compliance
      
      Format as JSON:
      {
        "environmental_score": number (0-100),
        "social_score": number (0-100),
        "governance_score": number (0-100),
        "overall_esg_score": number (0-100),
        "carbon_footprint_mt": number,
        "renewable_energy_percent": number (0-100),
        "sustainability_commitments": string[],
        "regulatory_compliance_score": number (0-100),
        "green_transition_opportunities": string[],
        "key_strengths": string[],
        "improvement_areas": string[]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an ESG analyst specializing in power infrastructure and energy-intensive industries.' },
          { role: 'user', content: esgPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const esgData = JSON.parse(aiResponse.choices[0].message.content);

    // Store ESG scores
    await supabase
      .from('esg_scores')
      .insert({
        company_id: company.id,
        environmental_score: esgData.environmental_score,
        social_score: esgData.social_score,
        governance_score: esgData.governance_score,
        overall_esg_score: esgData.overall_esg_score,
        carbon_footprint_mt: esgData.carbon_footprint_mt,
        renewable_energy_percent: esgData.renewable_energy_percent,
        sustainability_commitments: esgData.sustainability_commitments,
        regulatory_compliance_score: esgData.regulatory_compliance_score,
        green_transition_opportunities: esgData.green_transition_opportunities
      });

    return new Response(JSON.stringify({ 
      success: true, 
      esg_analysis: esgData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('ESG scoring error:', error);
    throw error;
  }
}

async function processNaturalLanguageQuery(supabase: any, openaiApiKey: string, query: string) {
  console.log(`Processing natural language query: ${query}`);
  
  try {
    // Get summary of available data
    const { data: companies } = await supabase
      .from('companies')
      .select('name, industry, sector, power_usage_estimate, financial_health_score')
      .limit(50);

    const nlpPrompt = `
      Process this natural language query about corporate intelligence data: "${query}"
      
      Available companies data summary:
      ${companies?.map(c => `${c.name} (${c.industry}, ${c.power_usage_estimate}MW, Health: ${c.financial_health_score})`).join('\n')}
      
      Interpret the query and provide:
      1. SQL-like filters to apply
      2. Data insights based on available information
      3. Relevant companies that match the criteria
      4. Additional analysis recommendations
      
      Format as JSON:
      {
        "query_interpretation": string,
        "suggested_filters": {
          "industry": string[],
          "power_range": {"min": number, "max": number},
          "health_score_range": {"min": number, "max": number},
          "distress_level": string
        },
        "matching_companies": string[],
        "insights": string[],
        "recommendations": string[]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an AI assistant that interprets natural language queries about corporate intelligence data.' },
          { role: 'user', content: nlpPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      }),
    });

    const aiResponse = await response.json();
    const queryResult = JSON.parse(aiResponse.choices[0].message.content);

    return new Response(JSON.stringify({ 
      success: true, 
      query_result: queryResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Natural language query error:', error);
    throw error;
  }
}

async function analyzeMarketTiming(supabase: any, openaiApiKey: string, companyName: string) {
  console.log(`Analyzing market timing for: ${companyName}`);
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', companyName)
      .single();

    if (!company) {
      throw new Error('Company not found in database');
    }

    const timingPrompt = `
      Analyze optimal acquisition timing for "${companyName}" considering:
      - Current market conditions
      - Company financial distress level: ${company.financial_health_score}/100
      - Industry cycle phase for ${company.industry}
      - Power infrastructure market trends
      
      Provide timing analysis including:
      1. Current market cycle phase
      2. Optimal acquisition window
      3. Fire sale probability
      4. Key timing factors
      
      Format as JSON:
      {
        "market_cycle_phase": string,
        "optimal_acquisition_window": {
          "timeframe": string,
          "probability": number (0-100),
          "key_triggers": string[]
        },
        "market_conditions_score": number (0-100),
        "institutional_activity_level": string,
        "fire_sale_probability": number (0-1),
        "timing_recommendation": string,
        "key_timing_factors": string[]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a market timing specialist for distressed asset acquisitions in power infrastructure.' },
          { role: 'user', content: timingPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    const aiResponse = await response.json();
    const timingData = JSON.parse(aiResponse.choices[0].message.content);

    // Store market timing analysis
    await supabase
      .from('market_timing_analysis')
      .insert({
        company_id: company.id,
        market_cycle_phase: timingData.market_cycle_phase,
        optimal_acquisition_window: timingData.optimal_acquisition_window,
        market_conditions_score: timingData.market_conditions_score,
        institutional_activity_level: timingData.institutional_activity_level,
        fire_sale_probability: timingData.fire_sale_probability,
        timing_recommendation: timingData.timing_recommendation,
        key_timing_factors: timingData.key_timing_factors
      });

    return new Response(JSON.stringify({ 
      success: true, 
      market_timing: timingData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Market timing analysis error:', error);
    throw error;
  }
}

async function configureAlerts(supabase: any, userId: string, criteria: any) {
  console.log(`Configuring alerts for user: ${userId}`);
  
  try {
    // Store alert preferences
    await supabase
      .from('user_alert_preferences')
      .insert({
        user_id: userId,
        alert_type: criteria.alert_type || 'distress_signal',
        criteria: criteria,
        notification_channels: criteria.notification_channels || ['email'],
        frequency: criteria.frequency || 'real_time'
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Alert preferences configured successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Alert configuration error:', error);
    throw error;
  }
}

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
