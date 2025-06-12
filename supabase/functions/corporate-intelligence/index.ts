
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

interface LinkedInPost {
  company: string
  content: string
  date: string
  keywords: string[]
  signals: string[]
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

    switch (action) {
      case 'analyze_company':
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
  
  // Simulate financial data analysis (in production, this would call real APIs)
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

  // Store in database
  const { data, error } = await supabase
    .from('companies')
    .upsert(companyAnalysis, { onConflict: 'name' })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, data: companyAnalysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function monitorLinkedIn(supabase: any) {
  console.log('Monitoring LinkedIn for corporate intelligence...')
  
  // Keywords that indicate potential opportunities
  const keywordCategories = {
    facility_changes: ['closing facility', 'shutting down', 'consolidating operations', 'relocating'],
    financial_distress: ['restructuring', 'cost reduction', 'layoffs', 'bankruptcy', 'refinancing'],
    expansion: ['new facility', 'expanding operations', 'data center', 'manufacturing plant'],
    power_intensive: ['data center', 'crypto mining', 'bitcoin', 'AI training', 'server farm', 'smelting', 'steel production']
  }

  // Simulate LinkedIn monitoring (in production, use LinkedIn API)
  const posts = await simulateLinkedInScraping(keywordCategories)
  
  for (const post of posts) {
    const { data, error } = await supabase
      .from('linkedin_intelligence')
      .insert({
        company: post.company,
        content: post.content,
        post_date: post.date,
        keywords: post.keywords,
        signals: post.signals,
        discovered_at: new Date().toISOString()
      })
    
    if (error) console.error('Error storing LinkedIn data:', error)
  }

  return new Response(
    JSON.stringify({ success: true, posts_analyzed: posts.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function scanIndustries(supabase: any) {
  console.log('Scanning power-intensive industries...')
  
  const powerIntensiveIndustries = [
    'Data Centers & Cloud Computing',
    'Cryptocurrency Mining',
    'Steel Production',
    'Aluminum Smelting', 
    'Chemical Manufacturing',
    'Paper & Pulp',
    'Cement Production',
    'Glass Manufacturing',
    'Semiconductor Fabrication',
    'AI/ML Training Facilities'
  ]

  const industryData = []
  
  for (const industry of powerIntensiveIndustries) {
    const companies = await getIndustryCompanies(industry)
    
    for (const company of companies) {
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

  const { data, error } = await supabase
    .from('industry_intelligence')
    .upsert(industryData, { onConflict: 'company_name' })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, companies_analyzed: industryData.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function detectDistressSignals(supabase: any) {
  console.log('Detecting corporate distress signals...')
  
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .lt('financial_health_score', 60)

  if (error) throw error

  const alerts = []
  
  for (const company of companies) {
    const distressLevel = assessDistressLevel(company)
    
    if (distressLevel >= 70) {
      alerts.push({
        company_name: company.name,
        alert_type: 'high_distress',
        distress_level: distressLevel,
        signals: company.distress_signals,
        power_capacity: company.power_usage_estimate,
        potential_value: estimateAssetValue(company),
        created_at: new Date().toISOString()
      })
    }
  }

  if (alerts.length > 0) {
    const { error: alertError } = await supabase
      .from('distress_alerts')
      .insert(alerts)
    
    if (alertError) throw alertError
  }

  return new Response(
    JSON.stringify({ success: true, alerts_generated: alerts.length, alerts }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
async function getFinancialData(identifier: string) {
  // Simulate API call to financial data provider
  return {
    industry: 'Technology',
    sector: 'Data Centers',
    market_cap: 5000000000,
    debt_to_equity: 0.45,
    current_ratio: 1.2,
    revenue_growth: -0.15,
    profit_margin: -0.05,
    cash_flow: -50000000
  }
}

async function getCompanyLocations(companyName: string) {
  // Simulate location data gathering
  return [
    { address: '123 Industrial Blvd', city: 'Austin', state: 'TX', facility_type: 'Manufacturing' },
    { address: '456 Data Center Dr', city: 'Dallas', state: 'TX', facility_type: 'Data Center' }
  ]
}

function estimatePowerUsage(industry: string, sector: string): number {
  const powerMap: { [key: string]: number } = {
    'Data Centers': 25,
    'Cryptocurrency': 50,
    'Steel Production': 75,
    'Aluminum Smelting': 100,
    'Manufacturing': 15
  }
  
  return powerMap[sector] || powerMap[industry] || 10
}

function calculateFinancialHealth(data: any): number {
  let score = 50 // Base score
  
  // Debt management
  if (data.debt_to_equity < 0.3) score += 20
  else if (data.debt_to_equity > 0.8) score -= 20
  
  // Liquidity
  if (data.current_ratio > 1.5) score += 15
  else if (data.current_ratio < 1.0) score -= 15
  
  // Growth
  if (data.revenue_growth > 0.1) score += 15
  else if (data.revenue_growth < -0.1) score -= 20
  
  // Profitability
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

async function simulateLinkedInScraping(keywords: any) {
  // Simulate LinkedIn posts that might indicate opportunities
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
  // Simulate industry company lookup
  return [
    { name: 'Example Steel Co', ticker: 'ESTL', market_cap: 2000000000, power_intensity: 'high' }
  ]
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
  return company.power_usage_estimate * 1000000 // $1M per MW estimate
}
