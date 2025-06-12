
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompanyData {
  name: string
  ticker?: string
  industry: string
  sector: string
  market_cap?: number
  debt_to_equity?: number
  current_ratio?: number
  revenue_growth?: number
  profit_margin?: number
  financial_health_score?: number
  distress_signals?: string[]
  power_usage_estimate?: number
  locations?: any[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, company_name, ticker } = await req.json()

    console.log(`Processing action: ${action}`)

    switch (action) {
      case 'analyze_company':
        if (!company_name) {
          throw new Error('Company name is required')
        }
        return await analyzeCompany(supabase, company_name, ticker)
      case 'monitor_linkedin':
        return await monitorLinkedIn(supabase)
      case 'scan_industries':
        return await scanIndustries(supabase)
      case 'detect_distress':
        return await detectDistressSignals(supabase)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function analyzeCompany(supabase: any, companyName: string, ticker?: string) {
  console.log(`Analyzing company: ${companyName}`)
  
  try {
    // Simulate financial data analysis (reduced complexity)
    const financialData = await getFinancialData(ticker || companyName)
    const locationData = await getCompanyLocations(companyName)
    const powerUsage = estimatePowerUsage(financialData.industry, financialData.sector)
    
    const healthScore = calculateFinancialHealth(financialData)
    const distressSignals = detectCompanyDistress(financialData)
    
    const companyAnalysis = {
      name: companyName,
      ticker,
      ...financialData,
      power_usage_estimate: powerUsage,
      locations: locationData,
      financial_health_score: healthScore,
      distress_signals: distressSignals,
      analyzed_at: new Date().toISOString()
    }

    // Store in database with conflict resolution
    const { data, error } = await supabase
      .from('companies')
      .upsert(companyAnalysis, { onConflict: 'name' })
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
    // Reduced list to prevent database overload
    const powerIntensiveIndustries = [
      'Data Centers & Cloud Computing',
      'Cryptocurrency Mining', 
      'Steel Production'
    ]

    const industryData = []
    
    // Limit to 5 companies per industry to prevent overload
    for (const industry of powerIntensiveIndustries) {
      console.log(`Scanning industry: ${industry}`)
      const companies = await getIndustryCompanies(industry)
      
      // Limit to first 5 companies to prevent database overload
      const limitedCompanies = companies.slice(0, 5)
      
      for (const company of limitedCompanies) {
        const analysis = await analyzeCompanyBriefly(company)
        industryData.push({
          industry,
          company_name: company.name,
          ticker: company.ticker,
          market_cap: company.market_cap,
          power_intensity: company.power_intensity,
          financial_health: analysis.health_score,
          risk_level: analysis.risk_level,
          scanned_at: new Date().toISOString()
        })
      }
    }

    console.log(`Inserting ${industryData.length} industry records`)

    // Insert in smaller batches to prevent database overload
    const batchSize = 10
    for (let i = 0; i < industryData.length; i += batchSize) {
      const batch = industryData.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('industry_intelligence')
        .upsert(batch, { onConflict: 'company_name' })

      if (error) {
        console.error('Database batch error:', error)
        // Continue with other batches even if one fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, companies_analyzed: industryData.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error scanning industries:', error)
    throw error
  }
}

async function monitorLinkedIn(supabase: any) {
  console.log('Monitoring LinkedIn for corporate intelligence...')
  
  try {
    // Simplified monitoring to reduce load
    const posts = await simulateLinkedInScraping()
    
    // Limit posts to prevent database overload
    const limitedPosts = posts.slice(0, 10)
    
    for (const post of limitedPosts) {
      const { error } = await supabase
        .from('linkedin_intelligence')
        .insert({
          company: post.company,
          content: post.content,
          post_date: post.date,
          keywords: post.keywords,
          signals: post.signals,
          discovered_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error storing LinkedIn data:', error)
        // Continue with other posts
      }
    }

    return new Response(
      JSON.stringify({ success: true, posts_analyzed: limitedPosts.length }),
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
    // Limit query to prevent database overload
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .lt('financial_health_score', 60)
      .limit(50) // Limit to 50 companies

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    const alerts = []
    
    for (const company of companies || []) {
      const distressLevel = assessDistressLevel(company)
      
      if (distressLevel >= 70) {
        alerts.push({
          company_name: company.name,
          alert_type: 'high_distress',
          distress_level: distressLevel,
          signals: company.distress_signals || [],
          power_capacity: Number(company.power_usage_estimate) || 0,
          potential_value: estimateAssetValue(company),
          created_at: new Date().toISOString()
        })
      }
    }

    if (alerts.length > 0) {
      const { error: alertError } = await supabase
        .from('distress_alerts')
        .insert(alerts)
      
      if (alertError) {
        console.error('Error storing alerts:', alertError)
        throw alertError
      }
    }

    return new Response(
      JSON.stringify({ success: true, alerts_generated: alerts.length, alerts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error detecting distress signals:', error)
    throw error
  }
}

// Helper functions (simplified to reduce complexity)
async function getFinancialData(identifier: string) {
  // Simulate API call with reduced complexity
  return {
    industry: 'Technology',
    sector: 'Data Centers',
    market_cap: Math.floor(Math.random() * 10000000000),
    debt_to_equity: Math.random() * 2,
    current_ratio: Math.random() * 3,
    revenue_growth: (Math.random() - 0.5) * 0.4,
    profit_margin: (Math.random() - 0.3) * 0.3,
    cash_flow: (Math.random() - 0.5) * 100000000
  }
}

async function getCompanyLocations(companyName: string) {
  // Simplified location data
  return [
    { address: '123 Industrial Blvd', city: 'Austin', state: 'TX', facility_type: 'Manufacturing' }
  ]
}

function estimatePowerUsage(industry: string, sector: string): number {
  const powerMap: { [key: string]: number } = {
    'Data Centers': 25,
    'Cryptocurrency': 50,
    'Steel Production': 75,
    'Manufacturing': 15
  }
  
  return powerMap[sector] || powerMap[industry] || 10
}

function calculateFinancialHealth(data: any): number {
  let score = 50
  
  if (data.debt_to_equity < 0.3) score += 20
  else if (data.debt_to_equity > 0.8) score -= 20
  
  if (data.current_ratio > 1.5) score += 15
  else if (data.current_ratio < 1.0) score -= 15
  
  if (data.revenue_growth > 0.1) score += 15
  else if (data.revenue_growth < -0.1) score -= 20
  
  if (data.profit_margin > 0.1) score += 15
  else if (data.profit_margin < 0) score -= 15
  
  return Math.max(0, Math.min(100, score))
}

function detectCompanyDistress(data: any): string[] {
  const signals = []
  
  if (data.debt_to_equity > 0.8) signals.push('High debt burden')
  if (data.current_ratio < 1.0) signals.push('Liquidity issues')
  if (data.revenue_growth < -0.2) signals.push('Declining revenue')
  if (data.profit_margin < -0.1) signals.push('Significant losses')
  if (data.cash_flow < 0) signals.push('Negative cash flow')
  
  return signals
}

async function simulateLinkedInScraping() {
  // Simplified simulation
  return [
    {
      company: 'TechCorp Industries',
      content: 'We are consolidating operations and closing our Austin data center facility...',
      date: new Date().toISOString(),
      keywords: ['closing facility', 'data center'],
      signals: ['facility_closure', 'potential_asset_sale']
    }
  ]
}

async function getIndustryCompanies(industry: string) {
  // Simplified company lookup with reduced data
  const companies = [
    { name: 'Example Steel Co', ticker: 'ESTL', market_cap: 2000000000, power_intensity: 'high' },
    { name: 'Data Center Corp', ticker: 'DCCO', market_cap: 5000000000, power_intensity: 'very_high' },
    { name: 'Mining Solutions Inc', ticker: 'MSI', market_cap: 1000000000, power_intensity: 'extreme' }
  ]
  
  return companies
}

async function analyzeCompanyBriefly(company: any) {
  return {
    health_score: Math.floor(Math.random() * 100),
    risk_level: Math.random() > 0.7 ? 'high' : 'medium'
  }
}

function assessDistressLevel(company: any): number {
  let distress = 0
  
  if (company.financial_health_score < 40) distress += 30
  if (company.distress_signals?.length > 2) distress += 25
  if (company.debt_to_equity > 1.0) distress += 20
  if (company.current_ratio < 0.8) distress += 15
  if (company.revenue_growth < -0.3) distress += 10
  
  return Math.min(100, distress)
}

function estimateAssetValue(company: any): number {
  const powerUsage = Number(company.power_usage_estimate) || 0
  return powerUsage * 1000000 // $1M per MW estimate
}
