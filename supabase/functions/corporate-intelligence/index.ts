
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
        if (!company_name?.trim()) {
          throw new Error('Company name is required and cannot be empty')
        }
        return await analyzeCompany(supabase, company_name.trim(), ticker?.trim())
      case 'monitor_linkedin':
        return await monitorLinkedIn(supabase)
      case 'scan_industries':
        return await scanIndustries(supabase)
      case 'detect_distress':
        return await detectDistressSignals(supabase)
      default:
        throw new Error(`Invalid action: ${action}`)
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
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
    const financialData = await getFinancialData(ticker || companyName)
    const locationData = await getCompanyLocations(companyName)
    const powerUsage = estimatePowerUsage(financialData.industry, financialData.sector)
    
    const healthScore = calculateFinancialHealth(financialData)
    const distressSignals = detectCompanyDistress(financialData)
    
    const companyAnalysis = {
      name: companyName,
      ticker: ticker || null,
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
