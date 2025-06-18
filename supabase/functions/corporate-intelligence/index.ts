import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// SEC EDGAR API for public company data
async function fetchSECData(ticker: string, companyName: string) {
  try {
    // SEC EDGAR Company Facts API
    const secUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${ticker?.padStart(10, '0')}.json`;
    
    const response = await fetch(secUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence (contact@voltscout.com)',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // Extract key financial metrics
      const facts = data.facts?.['us-gaap'] || {};
      const revenues = facts.Revenues?.units?.USD || [];
      const assets = facts.Assets?.units?.USD || [];
      const liabilities = facts.Liabilities?.units?.USD || [];
      
      const latestRevenue = revenues[revenues.length - 1]?.val || null;
      const latestAssets = assets[assets.length - 1]?.val || null;
      const latestLiabilities = liabilities[liabilities.length - 1]?.val || null;
      
      return {
        ticker: data.cik,
        industry: data.sic_description || 'Unknown',
        sector: data.category || 'Unknown',
        latest_revenue: latestRevenue,
        latest_assets: latestAssets,
        latest_liabilities: latestLiabilities,
        debt_to_equity: latestLiabilities && latestAssets ? (latestLiabilities / (latestAssets - latestLiabilities)) : null,
        source: 'SEC EDGAR'
      };
    }
  } catch (error) {
    console.error('SEC data fetch error:', error);
  }
  return null;
}

// Alpha Vantage API for real-time financial data
async function fetchAlphaVantageData(ticker: string) {
  const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  if (!apiKey) return null;

  try {
    // Company Overview
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
    const response = await fetch(overviewUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.Symbol) {
        return {
          market_cap: parseInt(data.MarketCapitalization) || null,
          pe_ratio: parseFloat(data.PERatio) || null,
          profit_margin: parseFloat(data.ProfitMargin) * 100 || null,
          revenue_growth: parseFloat(data.QuarterlyRevenueGrowthYOY) * 100 || null,
          debt_to_equity: parseFloat(data.DebtToEquityRatio) || null,
          current_ratio: parseFloat(data.CurrentRatio) || null,
          beta: parseFloat(data.Beta) || null,
          dividend_yield: parseFloat(data.DividendYield) * 100 || null,
          source: 'Alpha Vantage'
        };
      }
    }
  } catch (error) {
    console.error('Alpha Vantage data fetch error:', error);
  }
  return null;
}

// Yahoo Finance scraping for additional data
async function scrapeYahooFinance(ticker: string) {
  try {
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.ok) {
      const html = await response.text();
      
      // Extract market cap using regex patterns
      const marketCapMatch = html.match(/Market Cap[^>]*>([^<]+)</i);
      const peRatioMatch = html.match(/PE Ratio[^>]*>([^<]+)</i);
      const volumeMatch = html.match(/Volume[^>]*>([^<]+)</i);
      
      return {
        market_cap_text: marketCapMatch?.[1]?.trim() || null,
        pe_ratio_text: peRatioMatch?.[1]?.trim() || null,
        volume_text: volumeMatch?.[1]?.trim() || null,
        source: 'Yahoo Finance'
      };
    }
  } catch (error) {
    console.error('Yahoo Finance scraping error:', error);
  }
  return null;
}

// OpenCorporates API for company registration data
async function fetchOpenCorporatesData(companyName: string) {
  try {
    const searchUrl = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&format=json`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const companies = data.results?.companies || [];
      
      if (companies.length > 0) {
        const company = companies[0].company;
        return {
          incorporation_date: company.incorporation_date,
          company_type: company.company_type,
          jurisdiction: company.jurisdiction_code,
          status: company.company_status,
          registered_address: company.registered_address_in_full,
          source: 'OpenCorporates'
        };
      }
    }
  } catch (error) {
    console.error('OpenCorporates data fetch error:', error);
  }
  return null;
}

// News API for recent company mentions
async function fetchCompanyNews(companyName: string) {
  const apiKey = Deno.env.get('NEWS_API_KEY');
  if (!apiKey) return [];

  try {
    const url = `https://newsapi.org/v2/everything?q="${companyName}"&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.articles?.slice(0, 5).map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        published_at: article.publishedAt,
        source: article.source.name
      })) || [];
    }
  } catch (error) {
    console.error('News API error:', error);
  }
  return [];
}

// Calculate financial health score based on real metrics
function calculateFinancialHealthScore(metrics: any) {
  let score = 50; // Base score
  
  // Debt to equity ratio (lower is better)
  if (metrics.debt_to_equity !== null) {
    if (metrics.debt_to_equity < 0.3) score += 20;
    else if (metrics.debt_to_equity < 0.6) score += 10;
    else if (metrics.debt_to_equity > 1.5) score -= 20;
  }
  
  // Current ratio (higher is better)
  if (metrics.current_ratio !== null) {
    if (metrics.current_ratio > 2) score += 15;
    else if (metrics.current_ratio > 1.5) score += 10;
    else if (metrics.current_ratio < 1) score -= 15;
  }
  
  // Profit margin (higher is better)
  if (metrics.profit_margin !== null) {
    if (metrics.profit_margin > 20) score += 15;
    else if (metrics.profit_margin > 10) score += 10;
    else if (metrics.profit_margin < 0) score -= 20;
  }
  
  // Revenue growth (positive is better)
  if (metrics.revenue_growth !== null) {
    if (metrics.revenue_growth > 15) score += 10;
    else if (metrics.revenue_growth > 5) score += 5;
    else if (metrics.revenue_growth < -10) score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Estimate power usage based on industry and company size
function estimatePowerUsage(industry: string, marketCap: number | null, sector: string) {
  const industryMultipliers: Record<string, number> = {
    'Technology': 2.5,
    'Manufacturing': 4.0,
    'Mining': 8.0,
    'Steel': 6.0,
    'Aluminum': 7.5,
    'Data Centers': 10.0,
    'Automotive': 3.5,
    'Chemical': 5.0,
    'Cement': 6.5,
    'Paper': 4.5,
    'Glass': 5.5,
    'default': 2.0
  };
  
  const multiplier = industryMultipliers[industry] || industryMultipliers[sector] || industryMultipliers.default;
  
  if (marketCap) {
    // Base estimation: power usage correlates with company size
    const baseUsage = Math.log10(marketCap / 1000000) * 10; // MW
    return Math.round(baseUsage * multiplier);
  }
  
  return Math.round(multiplier * 25); // Default estimate
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Corporate Intelligence action: ${action}`);

    switch (action) {
      case 'analyze_company': {
        const { company_name, ticker } = params;
        
        console.log(`Analyzing company: ${company_name} (ticker: ${ticker})`);
        
        // Fetch data from multiple sources
        const [secData, alphaVantageData, yahooData, corporatesData, newsData] = await Promise.all([
          ticker ? fetchSECData(ticker, company_name) : null,
          ticker ? fetchAlphaVantageData(ticker) : null,
          ticker ? scrapeYahooFinance(ticker) : null,
          fetchOpenCorporatesData(company_name),
          fetchCompanyNews(company_name)
        ]);

        console.log('Data sources:', { 
          sec: !!secData, 
          alphaVantage: !!alphaVantageData, 
          yahoo: !!yahooData, 
          corporates: !!corporatesData,
          news: newsData.length 
        });

        // Combine data from all sources
        const combinedData = {
          name: company_name,
          ticker: ticker || secData?.ticker || null,
          industry: secData?.industry || alphaVantageData?.Industry || 'Unknown',
          sector: secData?.sector || alphaVantageData?.Sector || 'Unknown',
          market_cap: alphaVantageData?.market_cap || null,
          revenue_growth: alphaVantageData?.revenue_growth || null,
          profit_margin: alphaVantageData?.profit_margin || null,
          debt_to_equity: alphaVantageData?.debt_to_equity || secData?.debt_to_equity || null,
          current_ratio: alphaVantageData?.current_ratio || null,
          pe_ratio: alphaVantageData?.pe_ratio || null,
          beta: alphaVantageData?.beta || null,
          incorporation_date: corporatesData?.incorporation_date || null,
          company_status: corporatesData?.status || null,
          jurisdiction: corporatesData?.jurisdiction || null,
          registered_address: corporatesData?.registered_address || null,
          recent_news: newsData,
          data_sources: {
            sec: !!secData,
            alpha_vantage: !!alphaVantageData,
            yahoo_finance: !!yahooData,
            open_corporates: !!corporatesData,
            news_api: newsData.length > 0
          },
          analyzed_at: new Date().toISOString()
        };

        // Calculate financial health score
        const financialHealthScore = calculateFinancialHealthScore(combinedData);
        
        // Estimate power usage
        const powerUsageEstimate = estimatePowerUsage(
          combinedData.industry, 
          combinedData.market_cap, 
          combinedData.sector
        );

        // Detect distress signals
        const distressSignals = [];
        if (combinedData.debt_to_equity && combinedData.debt_to_equity > 2) {
          distressSignals.push('High debt-to-equity ratio');
        }
        if (combinedData.current_ratio && combinedData.current_ratio < 1) {
          distressSignals.push('Low current ratio - liquidity concerns');
        }
        if (combinedData.revenue_growth && combinedData.revenue_growth < -15) {
          distressSignals.push('Significant revenue decline');
        }
        if (combinedData.profit_margin && combinedData.profit_margin < 0) {
          distressSignals.push('Negative profit margins');
        }

        const analysisResult = {
          ...combinedData,
          financial_health_score: financialHealthScore,
          power_usage_estimate: powerUsageEstimate,
          distress_signals: distressSignals,
          locations: [], // This could be enhanced with additional APIs
        };

        // Check if company already exists
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', company_name)
          .maybeSingle();

        let data;
        if (existingCompany) {
          const { data: updateData, error } = await supabase
            .from('companies')
            .update(analysisResult)
            .eq('id', existingCompany.id)
            .select()
            .single();

          if (error) {
            console.error('Error updating company:', error);
            return new Response(JSON.stringify({
              success: false,
              error: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          data = updateData;
        } else {
          const { data: insertData, error } = await supabase
            .from('companies')
            .insert(analysisResult)
            .select()
            .single();

          if (error) {
            console.error('Error saving company:', error);
            return new Response(JSON.stringify({
              success: false,
              error: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          data = insertData;
        }

        return new Response(JSON.stringify({
          success: true,
          company: data,
          data_quality: {
            sources_used: Object.values(combinedData.data_sources).filter(Boolean).length,
            has_financial_data: !!(alphaVantageData || secData),
            has_corporate_data: !!corporatesData,
            has_recent_news: newsData.length > 0
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'ai_analyze_company': {
        const { company_name } = params;
        
        const mockAnalysis = {
          company_name,
          financial_outlook: 'Positive growth trajectory with strong fundamentals',
          risk_assessment: 'Low to moderate risk profile',
          investment_recommendation: 'BUY',
          power_consumption_analysis: 'High energy intensity operations suitable for data center conversion',
          key_insights: [
            'Strong cash flow generation',
            'Expanding market presence',
            'Energy-intensive operations'
          ],
          distress_probability: Math.random() * 0.3,
          acquisition_readiness: Math.random() * 0.8 + 0.2,
          analyzed_at: new Date().toISOString()
        };

        const { data: aiData, error: aiError } = await supabase
          .from('ai_company_analysis')
          .insert(mockAnalysis)
          .select()
          .single();

        if (aiError) {
          console.error('Error saving AI analysis:', aiError);
        }

        return new Response(JSON.stringify({
          success: true,
          analysis: mockAnalysis
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'generate_due_diligence': {
        const { company_id } = params;
        
        const mockReport = {
          company_id,
          report_type: 'comprehensive',
          executive_summary: 'Strong acquisition candidate with excellent power infrastructure potential',
          financial_analysis: {
            revenue_trend: 'Growing',
            profitability: 'High',
            debt_levels: 'Manageable'
          },
          risk_assessment: {
            market_risk: 'Low',
            operational_risk: 'Medium',
            financial_risk: 'Low'
          },
          power_infrastructure_assessment: {
            current_consumption: '45 MW',
            expansion_potential: '200 MW',
            grid_connectivity: 'Excellent'
          },
          recommendations: [
            'Proceed with acquisition',
            'Negotiate power infrastructure rights',
            'Plan for data center conversion'
          ]
        };

        const { data, error } = await supabase
          .from('due_diligence_reports')
          .insert(mockReport)
          .select()
          .single();

        if (error) {
          console.error('Error saving due diligence report:', error);
        }

        return new Response(JSON.stringify({
          success: true,
          report: mockReport
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_market_timing': {
        const { company_id } = params;
        
        const mockTiming = {
          company_id,
          market_cycle_phase: 'Mid-Cycle',
          fire_sale_probability: Math.random() * 0.4,
          market_conditions_score: Math.floor(Math.random() * 30) + 70,
          timing_recommendation: 'Optimal acquisition window',
          institutional_activity_level: 'Normal',
          optimal_acquisition_window: {
            start: '2024-Q1',
            end: '2024-Q3'
          }
        };

        return new Response(JSON.stringify({
          success: true,
          timing: mockTiming
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_supply_chain': {
        const { company_id } = params;
        
        const mockSupplyChain = {
          company_id,
          critical_components: ['Semiconductors', 'Raw materials'],
          supplier_dependencies: ['Asia-Pacific suppliers', 'Single-source suppliers'],
          disruption_risks: {
            geographic_concentration: 'High',
            single_points_of_failure: 'Medium'
          },
          geographic_exposure: {
            'Asia-Pacific': 0.78,
            'Europe': 0.15,
            'North America': 0.07
          }
        };

        return new Response(JSON.stringify({
          success: true,
          analysis: mockSupplyChain
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_news_intelligence': {
        const mockNews = [
          {
            title: 'Company Expands Data Center Operations',
            content: 'Major expansion announced for Q4 operations',
            source: 'TechNews',
            published_at: new Date().toISOString(),
            keywords: ['expansion', 'data center', 'growth']
          },
          {
            title: 'Energy Efficiency Initiative Launched',
            content: 'New sustainability program focuses on power optimization',
            source: 'EnergyReport',
            published_at: new Date().toISOString(),
            keywords: ['energy', 'efficiency', 'sustainability']
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          news: mockNews
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_competitor_analysis': {
        const mockCompetitors = [
          {
            name: 'TechCorp Inc',
            market_share: 0.15,
            power_usage: 85,
            competitive_position: 'Strong'
          },
          {
            name: 'DataSystems LLC',
            market_share: 0.12,
            power_usage: 65,
            competitive_position: 'Moderate'
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          competitors: mockCompetitors
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_social_sentiment': {
        const mockSentiment = {
          overall_score: Math.floor(Math.random() * 40) + 60,
          sentiment_trend: 'Positive',
          key_topics: ['innovation', 'growth', 'sustainability'],
          platform_breakdown: {
            twitter: 0.72,
            linkedin: 0.85,
            reddit: 0.58
          }
        };

        return new Response(JSON.stringify({
          success: true,
          sentiment: mockSentiment
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'calculate_investment_score': {
        const mockScore = {
          overall_score: Math.floor(Math.random() * 30) + 70,
          risk_score: Math.floor(Math.random() * 20) + 60,
          opportunity_score: Math.floor(Math.random() * 25) + 75,
          timing_score: Math.floor(Math.random() * 20) + 70,
          confidence_level: Math.floor(Math.random() * 20) + 80,
          recommendation: 'BUY',
          key_factors: ['Strong financials', 'Power infrastructure potential', 'Market position'],
          risk_factors: ['Market volatility', 'Regulatory changes']
        };

        return new Response(JSON.stringify({
          success: true,
          score: mockScore
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'forecast_power_demand': {
        const mockForecast = {
          current_consumption: Math.floor(Math.random() * 100) + 50,
          projected_6_months: Math.floor(Math.random() * 120) + 60,
          projected_12_months: Math.floor(Math.random() * 150) + 80,
          growth_drivers: ['Expansion plans', 'New facilities', 'Technology upgrades'],
          confidence_score: Math.floor(Math.random() * 20) + 80
        };

        return new Response(JSON.stringify({
          success: true,
          forecast: mockForecast
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_esg': {
        const mockESG = {
          environmental_score: Math.floor(Math.random() * 30) + 70,
          social_score: Math.floor(Math.random() * 25) + 65,
          governance_score: Math.floor(Math.random() * 20) + 75,
          overall_esg_score: Math.floor(Math.random() * 25) + 70,
          carbon_footprint_mt: Math.floor(Math.random() * 10000) + 5000,
          renewable_energy_percent: Math.random() * 60 + 20
        };

        return new Response(JSON.stringify({
          success: true,
          esg: mockESG
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'optimize_portfolio': {
        const mockOptimization = {
          recommended_allocation: {
            'Technology': 0.4,
            'Manufacturing': 0.3,
            'Energy': 0.2,
            'Other': 0.1
          },
          diversification_score: Math.floor(Math.random() * 20) + 80,
          risk_adjusted_return: Math.random() * 0.15 + 0.08,
          recommendations: [
            'Increase technology sector allocation',
            'Diversify geographic exposure',
            'Focus on power-intensive industries'
          ]
        };

        return new Response(JSON.stringify({
          success: true,
          optimization: mockOptimization
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'natural_language_query': {
        const { query } = params;
        
        const mockResponse = {
          query,
          answer: `Based on our analysis, here are the key insights: The market shows strong potential for power-intensive acquisitions with favorable timing conditions. Current energy rates support profitable operations.`,
          confidence: Math.random() * 0.3 + 0.7,
          sources: ['Market analysis', 'Energy rate data', 'Company financials']
        };

        return new Response(JSON.stringify({
          success: true,
          response: mockResponse
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

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
    console.error('Error in corporate intelligence:', error);
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
