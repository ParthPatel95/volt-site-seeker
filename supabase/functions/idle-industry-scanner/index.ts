import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, config, sites } = await req.json()

    switch (action) {
      case 'discover_sites':
        return await discoverSites(config)
      case 'analyze_satellite':
        return await analyzeSatellite(sites, config)
      case 'assess_opportunity':
        return await assessOpportunity(sites, config)
      case 'finalize_results':
        return await finalizeResults(sites, config)
      default:
        throw new Error(`Unknown action: ${action}`)
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

async function discoverSites(config: any) {
  console.log('Discovering idle industrial sites in:', config.jurisdiction)
  
  const mockSites = Array.from({ length: 10 }, () => ({
    id: crypto.randomUUID(),
    name: `Idle Industrial Site ${Math.floor(Math.random() * 1000)}`,
    address: `${Math.floor(Math.random() * 9999)} Industrial Way`,
    city: config.city || config.jurisdiction,
    state: config.jurisdiction.includes('Alberta') ? 'AB' : 'TX',
    latitude: 51.0447 + (Math.random() - 0.5) * 2,
    longitude: -114.0719 + (Math.random() - 0.5) * 2,
    status: 'idle',
    lastActivity: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }))

  return new Response(
    JSON.stringify({ sites: mockSites }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function analyzeSatellite(sites: any[], config: any) {
  console.log('Analyzing satellite data for', sites.length, 'sites')
  
  const analyzedSites = sites.map(site => ({
    ...site,
    satelliteAnalysis: {
      idlenessConfidence: Math.random() * 0.4 + 0.6,
      infrastructureCondition: Math.random() > 0.5 ? 'Good' : 'Fair',
      powerInfrastructure: Math.random() > 0.3 ? 'Present' : 'Limited',
      accessRoads: Math.random() > 0.2 ? 'Good' : 'Poor'
    }
  }))

  return new Response(
    JSON.stringify({ sites: analyzedSites }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function assessOpportunity(sites: any[], config: any) {
  console.log('Assessing opportunity potential for', sites.length, 'sites')
  
  const assessedSites = sites.map(site => ({
    ...site,
    opportunityAssessment: {
      powerPotentialMW: Math.floor(Math.random() * 50) + 10,
      estimatedValue: Math.floor(Math.random() * 5000000) + 1000000,
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      timeToActivation: Math.floor(Math.random() * 24) + 6 + ' months'
    }
  }))

  return new Response(
    JSON.stringify({ sites: assessedSites }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function finalizeResults(sites: any[], config: any) {
  console.log('Finalizing results for', sites.length, 'sites')
  
  const finalizedSites = sites.map(site => ({
    ...site,
    finalScore: Math.random() * 0.3 + 0.7,
    recommendation: Math.random() > 0.3 ? 'Recommended' : 'Under Review'
  }))

  const stats = {
    totalSitesFound: sites.length,
    recommendedSites: finalizedSites.filter(s => s.recommendation === 'Recommended').length,
    averageScore: finalizedSites.reduce((sum, site) => sum + site.finalScore, 0) / finalizedSites.length,
    totalPowerPotential: finalizedSites.reduce((sum, site) => sum + (site.opportunityAssessment?.powerPotentialMW || 0), 0),
    estimatedTotalValue: finalizedSites.reduce((sum, site) => sum + (site.opportunityAssessment?.estimatedValue || 0), 0)
  }

  return new Response(
    JSON.stringify({ sites: finalizedSites, stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}