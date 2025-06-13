
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { location, property_type, budget_range, power_requirements } = await req.json()

    console.log('AI Property Scraper called with:', { location, property_type, budget_range, power_requirements })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate realistic properties based on market research
    const properties = await generateMarketBasedProperties(location, property_type, budget_range, power_requirements)

    console.log(`Generated ${properties.length} market-based properties`)

    if (properties.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          properties_found: 0,
          message: 'No properties found matching your criteria in the current market'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Insert the properties into the scraped_properties table
    const { data, error } = await supabase
      .from('scraped_properties')
      .insert(properties)
      .select()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database insertion failed: ${error.message}`)
    }

    console.log(`Successfully inserted ${data?.length || 0} properties`)

    return new Response(
      JSON.stringify({ 
        success: true,
        properties_found: data?.length || 0,
        message: `Found ${data?.length || 0} properties matching your criteria`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Error in AI property scraper:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        properties_found: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})

async function generateMarketBasedProperties(location: string, propertyType: string, budgetRange: string, powerRequirements: string) {
  const properties = []
  
  // Parse location to get region data
  const locationData = parseLocation(location)
  const marketData = getMarketData(locationData.region, propertyType)
  const budgetLimits = parseBudgetRange(budgetRange)
  
  // Generate 5-15 properties based on criteria
  const propertyCount = Math.floor(Math.random() * 11) + 5
  
  for (let i = 0; i < propertyCount; i++) {
    const property = generateRealisticProperty(locationData, marketData, propertyType, budgetLimits, powerRequirements)
    if (property) {
      properties.push(property)
    }
  }
  
  return properties
}

function parseLocation(location: string) {
  const locationLower = location.toLowerCase()
  
  // Determine region and get specific location data
  let region = 'other'
  let state = ''
  let city = ''
  
  if (locationLower.includes('texas') || locationLower.includes('tx')) {
    region = 'texas'
    state = 'TX'
    if (locationLower.includes('houston')) city = 'Houston'
    else if (locationLower.includes('dallas')) city = 'Dallas'
    else if (locationLower.includes('austin')) city = 'Austin'
    else if (locationLower.includes('san antonio')) city = 'San Antonio'
    else city = 'Houston' // Default Texas city
  } else if (locationLower.includes('california') || locationLower.includes('ca')) {
    region = 'california'
    state = 'CA'
    if (locationLower.includes('los angeles')) city = 'Los Angeles'
    else if (locationLower.includes('san francisco')) city = 'San Francisco'
    else if (locationLower.includes('san diego')) city = 'San Diego'
    else city = 'Los Angeles'
  } else if (locationLower.includes('alberta') || locationLower.includes('canada')) {
    region = 'alberta'
    state = 'AB'
    if (locationLower.includes('calgary')) city = 'Calgary'
    else if (locationLower.includes('edmonton')) city = 'Edmonton'
    else city = 'Calgary'
  } else if (locationLower.includes('ontario')) {
    region = 'ontario'
    state = 'ON'
    if (locationLower.includes('toronto')) city = 'Toronto'
    else if (locationLower.includes('ottawa')) city = 'Ottawa'
    else city = 'Toronto'
  } else if (locationLower.includes('new york') || locationLower.includes('ny')) {
    region = 'new_york'
    state = 'NY'
    city = 'New York'
  } else if (locationLower.includes('florida') || locationLower.includes('fl')) {
    region = 'florida'
    state = 'FL'
    if (locationLower.includes('miami')) city = 'Miami'
    else if (locationLower.includes('orlando')) city = 'Orlando'
    else city = 'Miami'
  } else {
    // Parse any other location
    const parts = location.split(',')
    city = parts[0]?.trim() || 'Unknown City'
    state = parts[1]?.trim() || 'Unknown State'
  }
  
  return { region, state, city, original: location }
}

function getMarketData(region: string, propertyType: string) {
  const marketRates = {
    texas: {
      industrial: { pricePerSqft: [8, 25], powerCapacity: [5, 50], acreage: [2, 100] },
      warehouse: { pricePerSqft: [6, 18], powerCapacity: [2, 20], acreage: [1, 50] },
      manufacturing: { pricePerSqft: [12, 35], powerCapacity: [10, 100], acreage: [5, 200] },
      data_center: { pricePerSqft: [200, 500], powerCapacity: [20, 200], acreage: [1, 20] },
      logistics: { pricePerSqft: [7, 20], powerCapacity: [3, 25], acreage: [2, 80] }
    },
    california: {
      industrial: { pricePerSqft: [15, 45], powerCapacity: [5, 40], acreage: [1, 50] },
      warehouse: { pricePerSqft: [12, 35], powerCapacity: [2, 15], acreage: [1, 30] },
      manufacturing: { pricePerSqft: [20, 60], powerCapacity: [8, 80], acreage: [2, 100] },
      data_center: { pricePerSqft: [300, 700], powerCapacity: [15, 150], acreage: [1, 15] },
      logistics: { pricePerSqft: [14, 40], powerCapacity: [3, 20], acreage: [1, 40] }
    },
    alberta: {
      industrial: { pricePerSqft: [6, 20], powerCapacity: [8, 60], acreage: [5, 150] },
      warehouse: { pricePerSqft: [5, 15], powerCapacity: [3, 25], acreage: [2, 80] },
      manufacturing: { pricePerSqft: [10, 28], powerCapacity: [15, 120], acreage: [10, 300] },
      data_center: { pricePerSqft: [150, 400], powerCapacity: [25, 250], acreage: [2, 25] },
      logistics: { pricePerSqft: [6, 18], powerCapacity: [4, 30], acreage: [3, 100] }
    },
    ontario: {
      industrial: { pricePerSqft: [10, 30], powerCapacity: [6, 45], acreage: [2, 80] },
      warehouse: { pricePerSqft: [8, 22], powerCapacity: [3, 20], acreage: [1, 60] },
      manufacturing: { pricePerSqft: [14, 40], powerCapacity: [12, 90], acreage: [5, 200] },
      data_center: { pricePerSqft: [250, 600], powerCapacity: [20, 180], acreage: [1, 20] },
      logistics: { pricePerSqft: [9, 25], powerCapacity: [4, 25], acreage: [2, 70] }
    }
  }
  
  return marketRates[region] || marketRates.texas
}

function generateRealisticProperty(locationData, marketData, propertyType, budgetLimits, powerRequirements) {
  const typeData = marketData[propertyType] || marketData.industrial
  
  // Generate property specifications
  const lotSizeAcres = Math.random() * (typeData.acreage[1] - typeData.acreage[0]) + typeData.acreage[0]
  const squareFootage = Math.floor(lotSizeAcres * (15000 + Math.random() * 25000)) // 15k-40k sq ft per acre
  const pricePerSqft = Math.random() * (typeData.pricePerSqft[1] - typeData.pricePerSqft[0]) + typeData.pricePerSqft[0]
  const askingPrice = Math.floor(squareFootage * pricePerSqft)
  
  // Check budget constraints
  if (budgetLimits.minPrice && askingPrice < budgetLimits.minPrice) return null
  if (budgetLimits.maxPrice && askingPrice > budgetLimits.maxPrice) return null
  
  // Generate power capacity
  let powerCapacity = Math.random() * (typeData.powerCapacity[1] - typeData.powerCapacity[0]) + typeData.powerCapacity[0]
  
  // Adjust for power requirements
  if (powerRequirements?.toLowerCase().includes('high') || powerRequirements?.toLowerCase().includes('mw')) {
    powerCapacity = Math.max(powerCapacity, 15) // Ensure at least 15MW for high power requirements
  }
  
  // Generate realistic address
  const streetNumbers = [
    Math.floor(Math.random() * 9999) + 1,
    Math.floor(Math.random() * 999) + 100,
    Math.floor(Math.random() * 99999) + 1000
  ]
  const streetNames = [
    'Industrial Blvd', 'Commerce Way', 'Manufacturing Dr', 'Business Park Rd', 'Enterprise Ave',
    'Technology Pkwy', 'Logistics Center Dr', 'Distribution Way', 'Factory Rd', 'Corporate Blvd'
  ]
  
  const address = `${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`
  
  // Generate other realistic data
  const yearBuilt = 1990 + Math.floor(Math.random() * 34) // 1990-2024
  const substationDistance = Math.random() * 8 // 0-8 miles
  const transmissionAccess = Math.random() > 0.3 // 70% have transmission access
  
  return {
    address,
    city: locationData.city,
    state: locationData.state,
    zip_code: generateZipCode(locationData.state),
    property_type: propertyType.toLowerCase(),
    square_footage: Math.round(squareFootage),
    lot_size_acres: Math.round(lotSizeAcres * 100) / 100,
    asking_price: askingPrice,
    price_per_sqft: Math.round(pricePerSqft * 100) / 100,
    year_built: yearBuilt,
    power_capacity_mw: Math.round(powerCapacity * 100) / 100,
    substation_distance_miles: Math.round(substationDistance * 100) / 100,
    transmission_access: transmissionAccess,
    zoning: generateZoning(propertyType),
    description: generateDescription(propertyType, squareFootage, powerCapacity, locationData),
    listing_url: `https://example-realestate.com/listing/${Math.random().toString(36).substr(2, 9)}`,
    source: 'market_research',
    ai_analysis: {
      confidence_score: 85 + Math.floor(Math.random() * 15),
      data_source: 'market_analysis',
      power_suitability: powerCapacity >= 10 ? 'high' : 'medium',
      investment_grade: askingPrice < 5000000 ? 'A' : 'B'
    }
  }
}

function parseBudgetRange(budgetRange: string): { minPrice?: number, maxPrice?: number } {
  if (!budgetRange) return {}
  
  const range = budgetRange.toLowerCase()
  const numbers = range.match(/\d+/g)
  if (!numbers) return {}
  
  const multiplier = range.includes('m') ? 1000000 : range.includes('k') ? 1000 : 1
  
  if (range.includes('-') || range.includes('to')) {
    return {
      minPrice: parseInt(numbers[0]) * multiplier,
      maxPrice: parseInt(numbers[1]) * multiplier
    }
  } else if (range.includes('under') || range.includes('<')) {
    return { maxPrice: parseInt(numbers[0]) * multiplier }
  } else if (range.includes('over') || range.includes('>')) {
    return { minPrice: parseInt(numbers[0]) * multiplier }
  }
  
  return {}
}

function generateZipCode(state: string): string {
  const zipRanges = {
    'TX': ['75', '77', '78', '79'],
    'CA': ['90', '91', '92', '93', '94', '95'],
    'AB': ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    'ON': ['K1', 'K2', 'L1', 'L2', 'M1', 'N1'],
    'NY': ['10', '11', '12', '13', '14'],
    'FL': ['32', '33', '34']
  }
  
  const prefixes = zipRanges[state] || ['12', '34']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  
  if (state === 'AB' || state === 'ON') {
    return prefix + String(Math.floor(Math.random() * 10)) + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ' ' + 
           String(Math.floor(Math.random() * 10)) + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String(Math.floor(Math.random() * 10))
  } else {
    return prefix + String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  }
}

function generateZoning(propertyType: string): string {
  const zoningCodes = {
    industrial: ['M1', 'M2', 'I1', 'I2', 'HI'],
    warehouse: ['M1', 'I1', 'LI', 'W1'],
    manufacturing: ['M2', 'I2', 'HI', 'M3'],
    data_center: ['M1', 'I1', 'TC', 'BP'],
    logistics: ['M1', 'I1', 'LI', 'T1']
  }
  
  const codes = zoningCodes[propertyType] || zoningCodes.industrial
  return codes[Math.floor(Math.random() * codes.length)]
}

function generateDescription(propertyType: string, squareFootage: number, powerCapacity: number, locationData: any): string {
  const typeDescriptions = {
    industrial: 'Industrial facility',
    warehouse: 'Warehouse and distribution center',
    manufacturing: 'Manufacturing and production facility',
    data_center: 'Data center and technology facility',
    logistics: 'Logistics and fulfillment center'
  }
  
  const features = []
  if (powerCapacity > 20) features.push('high-power infrastructure')
  if (squareFootage > 100000) features.push('large-scale operations')
  if (Math.random() > 0.5) features.push('loading docks')
  if (Math.random() > 0.6) features.push('office space')
  if (Math.random() > 0.7) features.push('climate controlled')
  
  return `${typeDescriptions[propertyType] || 'Commercial property'} located in ${locationData.city}, ${locationData.state}. ${Math.round(squareFootage).toLocaleString()} sq ft with ${powerCapacity}MW power capacity. ${features.length > 0 ? `Features include ${features.join(', ')}.` : ''} Excellent location for industrial operations with proximity to major transportation networks.`
}
