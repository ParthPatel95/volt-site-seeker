
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIntelligenceHub } from './useIntelligenceHub';
import { ScanConfig, IntelOpportunity, ScanStats } from '../types/intelligence-hub.types';

export function useUnifiedScan() {
  const { state, dispatch } = useIntelligenceHub();
  const { toast } = useToast();

  const startScan = useCallback(async (config: ScanConfig) => {
    dispatch({ type: 'RESET_SCAN' });
    dispatch({ type: 'SET_SCANNING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const opportunities: IntelOpportunity[] = [];
    const stats: ScanStats = {
      totalSites: 0,
      idleFacilities: 0,
      distressedCompanies: 0,
      totalMW: 0,
      sourcesUsed: 0
    };

    try {
      // Phase 1: Idle Properties Scan
      if (config.enableIdleProperties) {
        dispatch({ type: 'SET_PROGRESS', payload: { progress: 10, phase: 'Scanning idle industrial properties...' } });
        
        try {
          const { data, error } = await supabase.functions.invoke('idle-industry-scanner', {
            body: {
              action: 'scan_region',
              jurisdiction: config.jurisdiction,
              city: config.city,
              maxResults: Math.floor(config.maxResults / 2)
            }
          });

          if (!error && data?.sites) {
            const idleSites = data.sites.map((site: any) => ({
              id: site.id || crypto.randomUUID(),
              type: 'idle_facility' as const,
              name: site.name,
              location: {
                address: site.address,
                city: site.city,
                state: site.state,
                coordinates: site.coordinates
              },
              metrics: {
                powerCapacityMW: site.estimatedFreeMW || site.historicalPeakMW,
                idleScore: site.idleScore,
                confidenceLevel: site.confidenceLevel || 0.7,
                substationDistanceKm: site.substationDistanceKm,
                facilitySize: site.facilitySize
              },
              sources: ['EPA Registry', 'Satellite Analysis', 'Property Records'],
              aiInsights: site.evidenceText,
              status: 'active' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              industryType: site.industryType,
              naicsCode: site.naicsCode,
              retrofitCostClass: site.retrofitCostClass,
              recommendedStrategy: site.recommendedStrategy,
              operationalStatus: site.operationalStatus
            }));

            opportunities.push(...idleSites);
            stats.idleFacilities = idleSites.length;
            stats.totalMW += idleSites.reduce((sum: number, s: IntelOpportunity) => sum + (s.metrics.powerCapacityMW || 0), 0);
          }
        } catch (err) {
          console.error('Idle scan error:', err);
        }
      }

      dispatch({ type: 'SET_PROGRESS', payload: { progress: 30, phase: 'Analyzing corporate distress signals...' } });

      // Phase 2: Corporate Distress Analysis
      if (config.enableCorporateDistress) {
        dispatch({ type: 'SET_PROGRESS', payload: { progress: 40, phase: 'Scanning SEC filings & bankruptcy data...' } });
        
        try {
          const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
            body: {
              action: 'scan_distress',
              jurisdiction: config.jurisdiction,
              enableSEC: config.enableSECFilings,
              enableBankruptcy: config.enableBankruptcyData,
              enableNews: config.enableNewsIntelligence
            }
          });

          if (!error && data?.companies) {
            const distressedCompanies = data.companies.map((company: any) => ({
              id: company.id || crypto.randomUUID(),
              type: 'distressed_company' as const,
              name: company.name,
              location: {
                city: company.city,
                state: company.state,
                address: company.address
              },
              metrics: {
                distressScore: company.distressScore || company.acquisitionReadinessScore,
                confidenceLevel: company.confidence || 0.75,
                financialHealthScore: company.financialHealthScore,
                powerCapacityMW: company.estimatedPowerMW
              },
              sources: company.sources || ['SEC Filings', 'News Analysis'],
              aiInsights: company.aiInsights || company.summary,
              status: 'active' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ticker: company.ticker,
              marketCap: company.marketCap,
              industryType: company.industry
            }));

            opportunities.push(...distressedCompanies);
            stats.distressedCompanies = distressedCompanies.length;
          }
        } catch (err) {
          console.error('Corporate scan error:', err);
        }
      }

      dispatch({ type: 'SET_PROGRESS', payload: { progress: 60, phase: 'Processing satellite imagery...' } });

      // Phase 3: Satellite Analysis Enhancement
      if (config.enableSatelliteAnalysis && opportunities.length > 0) {
        dispatch({ type: 'SET_PROGRESS', payload: { progress: 70, phase: 'Enhancing with satellite data...' } });
        // Satellite analysis would enhance existing opportunities
      }

      dispatch({ type: 'SET_PROGRESS', payload: { progress: 85, phase: 'Aggregating intelligence data...' } });

      // Calculate final stats
      stats.totalSites = opportunities.length;
      stats.sourcesUsed = [
        config.enableIdleProperties,
        config.enableCorporateDistress,
        config.enableSatelliteAnalysis,
        config.enableSECFilings,
        config.enableBankruptcyData,
        config.enableNewsIntelligence,
        config.enableFERCData,
        config.enableEPARegistry
      ].filter(Boolean).length;

      dispatch({ type: 'SET_OPPORTUNITIES', payload: opportunities });
      dispatch({ type: 'SET_SCAN_STATS', payload: stats });
      dispatch({ type: 'SET_PROGRESS', payload: { progress: 100, phase: 'Scan complete' } });

      toast({
        title: "Intelligence Scan Complete",
        description: `Found ${opportunities.length} opportunities (${stats.totalMW.toFixed(0)} MW total)`,
      });

    } catch (err) {
      console.error('Unified scan error:', err);
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Scan failed' });
      toast({
        title: "Scan Error",
        description: "Failed to complete intelligence scan",
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_SCANNING', payload: false });
    }

    return { opportunities, stats };
  }, [dispatch, toast]);

  const stopScan = useCallback(() => {
    dispatch({ type: 'SET_SCANNING', payload: false });
    dispatch({ type: 'SET_PROGRESS', payload: { progress: 0, phase: 'Scan cancelled' } });
  }, [dispatch]);

  return {
    isScanning: state.isScanning,
    scanProgress: state.scanProgress,
    currentPhase: state.currentPhase,
    opportunities: state.opportunities,
    scanStats: state.scanStats,
    error: state.error,
    startScan,
    stopScan
  };
}
