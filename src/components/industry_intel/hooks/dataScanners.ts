
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from './types';
import { parseSatelliteAnalysis, parseCoordinates } from './satelliteAnalysisUtils';

export async function scanIdleProperties(jurisdiction: string): Promise<Opportunity[]> {
  try {
    const { data: idleSites, error } = await supabase
      .from('verified_heavy_power_sites')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (idleSites || []).map(site => {
      const coordinates = parseCoordinates(site.coordinates);
      const aiInsights = parseSatelliteAnalysis(site.satellite_analysis);

      return {
        id: site.id,
        type: 'idle' as const,
        name: site.name || 'Unknown Facility',
        location: `${site.city || ''}, ${jurisdiction}`,
        coordinates,
        estimatedPowerMW: site.estimated_free_mw || 0,
        distressScore: site.idle_score || 0,
        aiInsights,
        sources: ['Satellite Imagery', 'Industrial Database'],
        lastUpdated: site.updated_at || site.created_at,
        status: 'monitoring' as const
      };
    });
  } catch (error) {
    console.error('Error scanning idle properties:', error);
    return [];
  }
}

export async function analyzeCorporateDistress(jurisdiction: string): Promise<Opportunity[]> {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .not('distress_signals', 'is', null)
      .order('financial_health_score', { ascending: true })
      .limit(25);

    if (error) throw error;

    return (companies || []).map(company => ({
      id: company.id,
      type: 'distressed' as const,
      name: company.name,
      location: jurisdiction,
      estimatedPowerMW: company.power_usage_estimate || 0,
      distressScore: 100 - (company.financial_health_score || 0),
      aiInsights: `Financial distress signals detected: ${(company.distress_signals || []).join(', ')}`,
      sources: ['SEC Filings', 'Financial Data', 'News Intelligence'],
      lastUpdated: company.updated_at,
      status: 'active' as const
    }));
  } catch (error) {
    console.error('Error analyzing corporate distress:', error);
    return [];
  }
}

export async function analyzeSECFilings(jurisdiction: string): Promise<void> {
  // This would integrate with SEC EDGAR API in production
  console.log('Analyzing SEC filings for', jurisdiction);
}

export async function performSatelliteAnalysis(jurisdiction: string): Promise<void> {
  // This would integrate with satellite imagery APIs in production
  console.log('Performing satellite analysis for', jurisdiction);
}
