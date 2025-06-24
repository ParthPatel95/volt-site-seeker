
import { SearchConfig, ScanStats, Opportunity } from './types';
import { scanIdleProperties, analyzeCorporateDistress, analyzeSECFilings, performSatelliteAnalysis } from './dataScanners';
import { saveIntelResults } from './industryIntelService';
import { supabase } from '@/integrations/supabase/client';

export async function executeUnifiedScan(
  config: SearchConfig,
  onProgress: (progress: number, phase: string) => void,
  onOpportunitiesUpdate: (opportunities: Opportunity[]) => void
): Promise<ScanStats> {
  const opportunities: Opportunity[] = [];
  let scanSessionId: string | undefined;

  // Phase 1: Initialize scan and create session
  onProgress(10, 'Initializing intelligence scan...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: session, error } = await supabase
        .from('site_scan_sessions')
        .insert({
          jurisdiction: config.jurisdiction,
          scan_type: 'industry_intelligence',
          status: 'processing',
          created_by: user.id,
          config: {
            enableIdleProperties: config.enableIdleProperties,
            enableCorporateDistress: config.enableCorporateDistress,
            enableSatelliteAnalysis: config.enableSatelliteAnalysis,
            enableSECFilings: config.enableSECFilings,
            enableBankruptcyData: config.enableBankruptcyData,
            enableNewsIntelligence: config.enableNewsIntelligence,
            maxResults: config.maxResults
          }
        })
        .select('id')
        .single();

      if (!error && session) {
        scanSessionId = session.id;
      }
    }
  } catch (error) {
    console.error('Error creating scan session:', error);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Phase 2: Scan idle properties
  if (config.enableIdleProperties) {
    onProgress(25, 'Scanning idle industrial properties...');
    const idleOpportunities = await scanIdleProperties(config.jurisdiction);
    opportunities.push(...idleOpportunities);
    onOpportunitiesUpdate([...opportunities]);
  }

  // Phase 3: Analyze corporate distress
  if (config.enableCorporateDistress) {
    onProgress(45, 'Analyzing corporate distress signals...');
    const distressedOpportunities = await analyzeCorporateDistress(config.jurisdiction);
    opportunities.push(...distressedOpportunities);
    onOpportunitiesUpdate([...opportunities]);
  }

  // Phase 4: SEC/SEDAR filing analysis
  if (config.enableSECFilings) {
    onProgress(65, 'Processing regulatory filings...');
    await analyzeSECFilings(config.jurisdiction);
  }

  // Phase 5: Satellite analysis
  if (config.enableSatelliteAnalysis) {
    onProgress(80, 'Performing satellite imagery analysis...');
    await performSatelliteAnalysis(config.jurisdiction);
  }

  // Phase 6: Save results and complete
  onProgress(90, 'Saving scan results...');
  
  if (opportunities.length > 0) {
    const saved = await saveIntelResults(opportunities, scanSessionId);
    if (saved) {
      console.log(`Successfully saved ${opportunities.length} opportunities`);
    }
  }

  // Update scan session status
  if (scanSessionId) {
    try {
      await supabase
        .from('site_scan_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          sites_discovered: opportunities.length
        })
        .eq('id', scanSessionId);
    } catch (error) {
      console.error('Error updating scan session:', error);
    }
  }

  onProgress(100, 'Scan complete');

  // Calculate final stats
  const stats: ScanStats = {
    distressedSites: opportunities.filter(o => o.type === 'distressed').length,
    idleProperties: opportunities.filter(o => o.type === 'idle').length,
    totalMW: opportunities.reduce((sum, o) => sum + o.estimatedPowerMW, 0),
    sourcesUsed: 6
  };

  return stats;
}
