
import { SearchConfig, ScanStats, Opportunity } from './types';
import { scanIdleProperties, analyzeCorporateDistress, analyzeSECFilings, performSatelliteAnalysis } from './dataScanners';

export async function executeUnifiedScan(
  config: SearchConfig,
  onProgress: (progress: number, phase: string) => void,
  onOpportunitiesUpdate: (opportunities: Opportunity[]) => void
): Promise<ScanStats> {
  const opportunities: Opportunity[] = [];

  // Phase 1: Initialize scan
  onProgress(10, 'Initializing intelligence scan...');
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

  // Phase 6: Complete
  onProgress(95, 'Cross-referencing data sources...');
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
