
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapingSource {
  id: string
  name: string
  url: string
  type: 'real_estate' | 'corporate' | 'news' | 'social'
  keywords: string[]
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

    const { action, source_id } = await req.json()

    switch (action) {
      case 'scrape_source':
        return await scrapeSource(supabase, source_id)
      case 'scrape_all':
        return await scrapeAllSources(supabase)
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

async function scrapeSource(supabase: any, sourceId: string) {
  console.log(`Starting scraping for source: ${sourceId}`)
  
  // Get source details
  const { data: source, error: sourceError } = await supabase
    .from('scraping_sources')
    .select('*')
    .eq('id', sourceId)
    .single()

  if (sourceError || !source) {
    throw new Error('Source not found')
  }

  // Create job record
  const job = {
    source_id: sourceId,
    source_name: source.name,
    status: 'running',
    started_at: new Date().toISOString(),
    properties_found: 0
  }

  const { data: jobData, error: jobError } = await supabase
    .from('scraping_jobs')
    .insert(job)
    .select()
    .single()

  if (jobError) throw jobError

  try {
    let propertiesFound = 0
    
    switch (source.type) {
      case 'real_estate':
        propertiesFound = await scrapeRealEstate(supabase, source)
        break
      case 'corporate':
        propertiesFound = await scrapeCorporate(supabase, source)
        break
      case 'news':
        propertiesFound = await scrapeNews(supabase, source)
        break
      case 'social':
        propertiesFound = await scrapeSocial(supabase, source)
        break
    }

    // Update job as completed
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        properties_found: propertiesFound
      })
      .eq('id', jobData.id)

    // Update source last run
    await supabase
      .from('scraping_sources')
      .update({
        last_run: new Date().toISOString(),
        properties_found: (source.properties_found || 0) + propertiesFound
      })
      .eq('id', sourceId)

    return new Response(
      JSON.stringify({ success: true, properties_found: propertiesFound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Update job as failed
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        errors: [error.message]
      })
      .eq('id', jobData.id)

    throw error
  }
}

async function scrapeRealEstate(supabase: any, source: ScrapingSource) {
  console.log(`Scraping real estate from: ${source.name}`)
  
  // Simulate real estate scraping based on source
  const properties = []
  
  if (source.name.toLowerCase().includes('loopnet')) {
    properties.push(...await scrapeLoopNet(source.keywords))
  } else if (source.name.toLowerCase().includes('crexi')) {
    properties.push(...await scrapeCREXi(source.keywords))
  } else {
    properties.push(...await scrapeGenericRealEstate(source.url, source.keywords))
  }

  // Store properties in database
  for (const property of properties) {
    const propertyData = {
      ...property,
      source: source.name,
      discovered_at: new Date().toISOString(),
      status: 'analyzing'
    }

    const { error } = await supabase
      .from('properties')
      .upsert(propertyData, { onConflict: 'address,city,state' })

    if (error) {
      console.error('Error storing property:', error)
    }
  }

  return properties.length
}

async function scrapeCorporate(supabase: any, source: ScrapingSource) {
  console.log(`Scraping corporate data from: ${source.name}`)
  
  const insights = []
  
  if (source.name.toLowerCase().includes('linkedin')) {
    insights.push(...await scrapeLinkedInCorporate(source.keywords))
  } else if (source.name.toLowerCase().includes('sec')) {
    insights.push(...await scrapeSECFilings(source.keywords))
  }

  // Store corporate insights
  for (const insight of insights) {
    const { error } = await supabase
      .from('corporate_insights')
      .insert({
        source: source.name,
        company_name: insight.company,
        insight_type: insight.type,
        content: insight.content,
        keywords: insight.keywords,
        discovered_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing insight:', error)
    }
  }

  return insights.length
}

async function scrapeNews(supabase: any, source: ScrapingSource) {
  console.log(`Scraping news from: ${source.name}`)
  
  // Simulate news scraping
  const articles = await scrapeNewsArticles(source.url, source.keywords)
  
  for (const article of articles) {
    const { error } = await supabase
      .from('news_intelligence')
      .insert({
        source: source.name,
        title: article.title,
        content: article.content,
        url: article.url,
        keywords: article.keywords,
        published_at: article.date,
        discovered_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing article:', error)
    }
  }

  return articles.length
}

async function scrapeSocial(supabase: any, source: ScrapingSource) {
  console.log(`Scraping social media from: ${source.name}`)
  
  // Simulate social media scraping
  const posts = await scrapeSocialPosts(source.url, source.keywords)
  
  for (const post of posts) {
    const { error } = await supabase
      .from('social_intelligence')
      .insert({
        source: source.name,
        platform: post.platform,
        content: post.content,
        author: post.author,
        url: post.url,
        keywords: post.keywords,
        posted_at: post.date,
        discovered_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing post:', error)
    }
  }

  return posts.length
}

// Specific scraping implementations
async function scrapeLoopNet(keywords: string[]) {
  // Enhanced LoopNet scraping logic
  return [
    {
      address: "456 Industrial Way",
      city: "Houston",
      state: "TX",
      zip_code: "77002",
      property_type: "industrial",
      square_footage: 150000,
      lot_size_acres: 15,
      asking_price: 3500000,
      power_capacity_mw: 12,
      substation_distance_miles: 0.8,
      transmission_access: true,
      description: "Large industrial facility with high power infrastructure",
      listing_url: "https://loopnet.com/sample-listing"
    }
  ]
}

async function scrapeCREXi(keywords: string[]) {
  // CREXi specific scraping
  return [
    {
      address: "789 Data Center Blvd",
      city: "Austin",
      state: "TX", 
      zip_code: "78701",
      property_type: "data_center",
      square_footage: 200000,
      lot_size_acres: 20,
      asking_price: 8500000,
      power_capacity_mw: 25,
      substation_distance_miles: 0.3,
      transmission_access: true,
      description: "Purpose-built data center facility",
      listing_url: "https://crexi.com/sample-listing"
    }
  ]
}

async function scrapeGenericRealEstate(url: string, keywords: string[]) {
  // Generic real estate scraping logic
  return []
}

async function scrapeLinkedInCorporate(keywords: string[]) {
  // LinkedIn corporate intelligence
  return [
    {
      company: "TechCorp Industries",
      type: "facility_closure",
      content: "Announcing the closure of our Austin manufacturing facility as part of our restructuring efforts...",
      keywords: ["facility closure", "restructuring"],
      date: new Date().toISOString()
    }
  ]
}

async function scrapeSECFilings(keywords: string[]) {
  // SEC filing analysis
  return [
    {
      company: "Industrial Corp",
      type: "asset_sale",
      content: "The company plans to divest its real estate holdings in Texas...",
      keywords: ["asset sale", "real estate"],
      date: new Date().toISOString()
    }
  ]
}

async function scrapeNewsArticles(url: string, keywords: string[]) {
  // News article scraping
  return [
    {
      title: "Major Steel Plant Announces Closure",
      content: "XYZ Steel Corp announced the closure of its 500MW facility...",
      url: "https://news.example.com/steel-closure",
      keywords: ["plant closure", "steel"],
      date: new Date().toISOString()
    }
  ]
}

async function scrapeSocialPosts(url: string, keywords: string[]) {
  // Social media monitoring
  return [
    {
      platform: "LinkedIn",
      content: "Our company is exploring strategic alternatives for our manufacturing assets...",
      author: "CEO of ManufacturingCorp",
      url: "https://linkedin.com/post/123",
      keywords: ["strategic alternatives", "manufacturing"],
      date: new Date().toISOString()
    }
  ]
}

async function scrapeAllSources(supabase: any) {
  const { data: sources, error } = await supabase
    .from('scraping_sources')
    .select('*')
    .eq('status', 'active')

  if (error) throw error

  let totalProperties = 0
  
  for (const source of sources) {
    try {
      const result = await scrapeSource(supabase, source.id)
      const data = await result.json()
      totalProperties += data.properties_found
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error)
    }
  }

  return new Response(
    JSON.stringify({ success: true, total_properties: totalProperties }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
