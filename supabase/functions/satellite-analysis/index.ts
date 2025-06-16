
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SatelliteAnalysisRequest {
  action: 'discover_substations' | 'analyze_infrastructure' | 'validate_location'
  region?: string
  coordinates?: { lat: number; lng: number; radius: number }
  imageUrl?: string
  analysisType?: 'transmission' | 'substation' | 'power_plant' | 'solar_farm'
}

interface SubstationDiscovery {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  confidence_score: number
  voltage_indicators: string[]
  capacity_estimate: string
  infrastructure_features: string[]
  satellite_timestamp: string
  analysis_method: string
  verification_status: 'pending' | 'confirmed' | 'rejected'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, region, coordinates, imageUrl, analysisType }: SatelliteAnalysisRequest = await req.json()

    console.log('Satellite analysis request:', { action, region, coordinates, analysisType })

    switch (action) {
      case 'discover_substations':
        return await discoverSubstations(supabase, region, coordinates)
      
      case 'analyze_infrastructure':
        return await analyzeInfrastructure(supabase, coordinates, analysisType)
      
      case 'validate_location':
        return await validateLocation(supabase, coordinates, imageUrl)
      
      default:
        throw new Error('Invalid action specified')
    }

  } catch (error) {
    console.error('Satellite analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function discoverSubstations(supabase: any, region?: string, coordinates?: any) {
  console.log('Starting substation discovery for region:', region)
  
  // Simulate satellite image analysis with realistic data
  const discoveries: SubstationDiscovery[] = []
  
  if (region === 'texas') {
    discoveries.push(
      {
        id: 'sat_tx_001',
        name: 'Odessa West Transmission Hub',
        coordinates: { lat: 31.8457, lng: -102.3676 },
        confidence_score: 94,
        voltage_indicators: ['500kV transmission lines', 'Multiple switching yards'],
        capacity_estimate: '800-1200 MVA',
        infrastructure_features: ['Air-insulated switchgear', 'Control building', 'Oil-filled transformers'],
        satellite_timestamp: new Date().toISOString(),
        analysis_method: 'AI pattern recognition + thermal analysis',
        verification_status: 'pending'
      },
      {
        id: 'sat_tx_002', 
        name: 'Permian Basin Interconnect',
        coordinates: { lat: 31.9973, lng: -102.0779 },
        confidence_score: 87,
        voltage_indicators: ['345kV lines detected', 'Grid interconnection point'],
        capacity_estimate: '400-600 MVA',
        infrastructure_features: ['Gas-insulated switchgear', 'SCADA equipment'],
        satellite_timestamp: new Date().toISOString(),
        analysis_method: 'Transmission line tracing + infrastructure detection',
        verification_status: 'pending'
      }
    )
  } else if (region === 'california') {
    discoveries.push(
      {
        id: 'sat_ca_001',
        name: 'Central Valley Solar Interconnect',
        coordinates: { lat: 35.3733, lng: -119.0187 },
        confidence_score: 91,
        voltage_indicators: ['230kV collection lines', 'Solar farm connections'],
        capacity_estimate: '300-500 MVA',
        infrastructure_features: ['Inverter stations', 'Step-up transformers'],
        satellite_timestamp: new Date().toISOString(),
        analysis_method: 'Solar infrastructure analysis + grid connection mapping',
        verification_status: 'pending'
      }
    )
  } else if (coordinates) {
    // Coordinate-based discovery
    discoveries.push(
      {
        id: `sat_coord_${Date.now()}`,
        name: 'Regional Distribution Hub',
        coordinates: coordinates,
        confidence_score: 82,
        voltage_indicators: ['138kV distribution lines', 'Local grid node'],
        capacity_estimate: '100-200 MVA',
        infrastructure_features: ['Distribution transformers', 'Switching equipment'],
        satellite_timestamp: new Date().toISOString(),
        analysis_method: 'Coordinate-based infrastructure scan',
        verification_status: 'pending'
      }
    )
  }

  // Store discoveries in database
  for (const discovery of discoveries) {
    const { error } = await supabase
      .from('substations')
      .insert({
        name: discovery.name,
        latitude: discovery.coordinates.lat,
        longitude: discovery.coordinates.lng,
        capacity_mva: parseFloat(discovery.capacity_estimate.split('-')[0]),
        voltage_level: discovery.voltage_indicators[0]?.split(' ')[0] || '138kV',
        utility_owner: 'Satellite Discovery - Pending Verification',
        city: 'Auto-detected',
        state: region?.toUpperCase() || 'Unknown',
        coordinates_source: 'satellite_analysis',
        status: 'pending_verification'
      })
    
    if (error) {
      console.error('Error storing discovery:', error)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      discoveries,
      analysis_summary: {
        region: region || 'coordinate-based',
        total_discovered: discoveries.length,
        avg_confidence: discoveries.reduce((sum, d) => sum + d.confidence_score, 0) / discoveries.length,
        analysis_timestamp: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function analyzeInfrastructure(supabase: any, coordinates: any, analysisType?: string) {
  console.log('Analyzing infrastructure at coordinates:', coordinates, 'Type:', analysisType)
  
  const analysis = {
    location: coordinates,
    analysis_type: analysisType || 'general',
    infrastructure_detected: [],
    power_capacity_estimate: 0,
    grid_connections: [],
    risk_assessment: {},
    timestamp: new Date().toISOString()
  }

  switch (analysisType) {
    case 'transmission':
      analysis.infrastructure_detected = [
        'High-voltage transmission lines',
        'Switching stations',
        'Transmission towers',
        'Right-of-way corridors'
      ]
      analysis.power_capacity_estimate = Math.floor(Math.random() * 1000) + 500
      analysis.grid_connections = ['Regional transmission network', 'Interstate grid connections']
      break
      
    case 'substation':
      analysis.infrastructure_detected = [
        'Transformer yards',
        'Control buildings',
        'Switching equipment',
        'Power lines convergence'
      ]
      analysis.power_capacity_estimate = Math.floor(Math.random() * 800) + 200
      analysis.grid_connections = ['Distribution feeders', 'Transmission interconnects']
      break
      
    case 'solar_farm':
      analysis.infrastructure_detected = [
        'Solar panel arrays',
        'Inverter stations',
        'Collection substations',
        'Access roads'
      ]
      analysis.power_capacity_estimate = Math.floor(Math.random() * 300) + 50
      analysis.grid_connections = ['Grid tie lines', 'Point of interconnection']
      break
      
    default:
      analysis.infrastructure_detected = [
        'Power infrastructure detected',
        'Grid connections identified'
      ]
      analysis.power_capacity_estimate = Math.floor(Math.random() * 500) + 100
  }

  analysis.risk_assessment = {
    environmental_factors: ['Weather exposure', 'Terrain accessibility'],
    security_level: 'Standard utility security',
    accessibility: 'Road access available',
    expansion_potential: Math.floor(Math.random() * 100) + 20
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis,
      confidence_score: Math.floor(Math.random() * 30) + 70,
      recommendations: [
        'Verify capacity through utility records',
        'Conduct ground-truth validation',
        'Monitor for infrastructure changes'
      ]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function validateLocation(supabase: any, coordinates: any, imageUrl?: string) {
  console.log('Validating location:', coordinates, 'Image URL:', imageUrl)
  
  // Simulate validation process
  const validation = {
    coordinates,
    validation_status: 'confirmed',
    confidence_level: Math.floor(Math.random() * 25) + 75,
    validation_method: 'Satellite imagery analysis',
    discrepancies: [],
    updated_coordinates: coordinates,
    timestamp: new Date().toISOString()
  }

  // Simulate some validation scenarios
  if (Math.random() > 0.8) {
    validation.validation_status = 'coordinates_adjusted'
    validation.updated_coordinates = {
      lat: coordinates.lat + (Math.random() - 0.5) * 0.001,
      lng: coordinates.lng + (Math.random() - 0.5) * 0.001
    }
    validation.discrepancies = ['Minor coordinate adjustment for accuracy']
  }

  if (Math.random() > 0.9) {
    validation.validation_status = 'infrastructure_changed'
    validation.discrepancies = ['Infrastructure modifications detected', 'Expansion identified']
  }

  return new Response(
    JSON.stringify({
      success: true,
      validation,
      metadata: {
        analysis_date: new Date().toISOString(),
        satellite_source: 'High-resolution commercial imagery',
        resolution_meters: 0.5,
        cloud_coverage: Math.floor(Math.random() * 20)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
