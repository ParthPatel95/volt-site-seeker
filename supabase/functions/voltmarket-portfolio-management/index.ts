import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid auth token')
    }

    console.log('Portfolio function called', { method: req.method, url: req.url })

    const requestBody = req.method !== 'GET' ? await req.json().catch(() => ({})) : {}
    console.log('Request body:', requestBody)

    switch (req.method) {
      case 'GET':
        return await handleGetPortfolios(supabase, user.id)

      case 'POST':
        const { action } = requestBody
        
        if (action === 'create') {
          return await handleCreatePortfolio(requestBody, supabase, user.id)
        } else if (action === 'add-item') {
          return await handleAddPortfolioItem(requestBody, supabase, user.id)
        } else if (action === 'analyze') {
          return await handleAnalyzePortfolio(requestBody, supabase, user.id)
        } else if (action === 'items') {
          return await handleGetPortfolioItems(requestBody.portfolioId, supabase, user.id)
        } else if (action === 'delete') {
          return await handleDeletePortfolio(requestBody.portfolioId, supabase, user.id)
        }
        break
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('Portfolio management error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGetPortfolios(supabase: any, userId: string) {
  const { data: portfolios, error } = await supabase
    .from('voltmarket_portfolios')
    .select(`
      *,
      items:voltmarket_portfolio_items(
        id,
        name,
        item_type,
        acquisition_price,
        current_value,
        status,
        added_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch portfolios: ${error.message}`)
  }

  // Calculate portfolio metrics
  const enrichedPortfolios = portfolios.map((portfolio: any) => {
    const items = portfolio.items || []
    const totalAcquisitionValue = items.reduce((sum: number, item: any) => 
      sum + (item.acquisition_price || 0), 0)
    const totalCurrentValue = items.reduce((sum: number, item: any) => 
      sum + (item.current_value || item.acquisition_price || 0), 0)
    const totalReturn = totalCurrentValue - totalAcquisitionValue
    const returnPercentage = totalAcquisitionValue > 0 ? 
      ((totalCurrentValue - totalAcquisitionValue) / totalAcquisitionValue) * 100 : 0

    return {
      ...portfolio,
      metrics: {
        totalItems: items.length,
        totalAcquisitionValue,
        totalCurrentValue,
        totalReturn,
        returnPercentage,
        activeItems: items.filter((item: any) => item.status === 'active').length
      }
    }
  })

  return new Response(
    JSON.stringify({ portfolios: enrichedPortfolios }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreatePortfolio(portfolioData: any, supabase: any, userId: string) {
  const { data: portfolio, error } = await supabase
    .from('voltmarket_portfolios')
    .insert({
      user_id: userId,
      name: portfolioData.name,
      description: portfolioData.description,
      portfolio_type: portfolioData.portfolioType,
      target_allocation: portfolioData.targetAllocation || {},
      risk_tolerance: portfolioData.riskTolerance
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create portfolio: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ portfolio }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAddPortfolioItem(itemData: any, supabase: any, userId: string) {
  // Verify portfolio ownership
  const { data: portfolio, error: portfolioError } = await supabase
    .from('voltmarket_portfolios')
    .select('id')
    .eq('id', itemData.portfolioId)
    .eq('user_id', userId)
    .single()

  if (portfolioError) {
    throw new Error('Portfolio not found or access denied')
  }

  const { data: item, error } = await supabase
    .from('voltmarket_portfolio_items')
    .insert({
      portfolio_id: itemData.portfolioId,
      listing_id: itemData.listingId,
      item_type: itemData.itemType,
      name: itemData.name,
      acquisition_price: itemData.acquisitionPrice,
      current_value: itemData.currentValue,
      acquisition_date: itemData.acquisitionDate,
      notes: itemData.notes,
      metadata: itemData.metadata || {}
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add portfolio item: ${error.message}`)
  }

  // Update portfolio total value
  await updatePortfolioValue(supabase, itemData.portfolioId)

  return new Response(
    JSON.stringify({ item }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetPortfolioItems(portfolioId: string, supabase: any, userId: string) {
  // Verify portfolio ownership
  const { data: portfolio, error: portfolioError } = await supabase
    .from('voltmarket_portfolios')
    .select('id')
    .eq('id', portfolioId)
    .eq('user_id', userId)
    .single()

  if (portfolioError) {
    throw new Error('Portfolio not found or access denied')
  }

  const { data: items, error } = await supabase
    .from('voltmarket_portfolio_items')
    .select(`
      *,
      listing:voltmarket_listings(
        id,
        title,
        asking_price,
        location,
        power_capacity_mw
      )
    `)
    .eq('portfolio_id', portfolioId)
    .order('added_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch portfolio items: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ items }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAnalyzePortfolio(requestData: any, supabase: any, userId: string) {
  const { portfolioId } = requestData

  // Get portfolio with items
  const { data: portfolio, error: portfolioError } = await supabase
    .from('voltmarket_portfolios')
    .select(`
      *,
      items:voltmarket_portfolio_items(*)
    `)
    .eq('id', portfolioId)
    .eq('user_id', userId)
    .single()

  if (portfolioError) {
    throw new Error('Portfolio not found or access denied')
  }

  const items = portfolio.items || []
  
  // Calculate comprehensive analytics
  const analytics = {
    performance: calculatePerformanceMetrics(items),
    allocation: calculateAllocationMetrics(items),
    risk: calculateRiskMetrics(items, portfolio.risk_tolerance),
    recommendations: generateRecommendations(items, portfolio)
  }

  return new Response(
    JSON.stringify({ analytics }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeletePortfolio(portfolioId: string, supabase: any, userId: string) {
  const { error } = await supabase
    .from('voltmarket_portfolios')
    .delete()
    .eq('id', portfolioId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete portfolio: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updatePortfolioValue(supabase: any, portfolioId: string) {
  const { data: items } = await supabase
    .from('voltmarket_portfolio_items')
    .select('current_value, acquisition_price')
    .eq('portfolio_id', portfolioId)

  const totalValue = (items || []).reduce((sum: number, item: any) => 
    sum + (item.current_value || item.acquisition_price || 0), 0)

  await supabase
    .from('voltmarket_portfolios')
    .update({ total_value: totalValue })
    .eq('id', portfolioId)
}

function calculatePerformanceMetrics(items: any[]) {
  const totalAcquisition = items.reduce((sum, item) => sum + (item.acquisition_price || 0), 0)
  const totalCurrent = items.reduce((sum, item) => sum + (item.current_value || item.acquisition_price || 0), 0)
  const totalReturn = totalCurrent - totalAcquisition
  const returnPercentage = totalAcquisition > 0 ? (totalReturn / totalAcquisition) * 100 : 0

  return {
    totalAcquisitionValue: totalAcquisition,
    totalCurrentValue: totalCurrent,
    totalReturn,
    returnPercentage,
    itemCount: items.length,
    avgItemValue: items.length > 0 ? totalCurrent / items.length : 0
  }
}

function calculateAllocationMetrics(items: any[]) {
  const byType = items.reduce((acc, item) => {
    acc[item.item_type] = (acc[item.item_type] || 0) + (item.current_value || item.acquisition_price || 0)
    return acc
  }, {})

  const byStatus = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  return { byType, byStatus }
}

function calculateRiskMetrics(items: any[], riskTolerance: string) {
  // Simple risk scoring based on item types and values
  const riskScores = {
    listing: 3,
    investment: 4,
    opportunity: 5,
    research: 2
  }

  const avgRisk = items.length > 0 ? 
    items.reduce((sum, item) => sum + (riskScores[item.item_type as keyof typeof riskScores] || 3), 0) / items.length : 0

  return {
    averageRiskScore: avgRisk,
    riskTolerance,
    recommendation: avgRisk > 4 ? 'Consider diversification' : 'Well balanced'
  }
}

function generateRecommendations(items: any[], portfolio: any) {
  const recommendations = []

  if (items.length < 5) {
    recommendations.push('Consider adding more diversified assets to your portfolio')
  }

  const typeDistribution = items.reduce((acc, item) => {
    acc[item.item_type] = (acc[item.item_type] || 0) + 1
    return acc
  }, {})

  if (typeDistribution.listing && typeDistribution.listing > items.length * 0.7) {
    recommendations.push('Consider diversifying beyond just listings')
  }

  return recommendations
}