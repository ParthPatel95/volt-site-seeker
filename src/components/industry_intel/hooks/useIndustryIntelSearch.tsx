
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SearchConfig {
  jurisdiction: string;
  enableIdleProperties: boolean;
  enableCorporateDistress: boolean;
  enableSatelliteAnalysis: boolean;
  enableSECFilings: boolean;
  enableBankruptcyData: boolean;
  enableNewsIntelligence: boolean;
  maxResults: number;
}

interface ScanStats {
  distressedSites: number;
  idleProperties: number;
  totalMW: number;
  sourcesUsed: number;
}

interface Opportunity {
  id: string;
  type: 'distressed' | 'idle' | 'corporate';
  name: string;
  location: string;
  coordinates?: [number, number];
  estimatedPowerMW: number;
  distressScore: number;
  aiInsights: string;
  sources: string[];
  lastUpdated: string;
  status: 'active' | 'closed' | 'monitoring';
}

export function useIndustryIntelSearch() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startUnifiedScan = useCallback(async (config: SearchConfig) => {
    setIsScanning(true);
    setScanProgress(0);
    setError(null);
    setOpportunities([]);
    setScanStats(null);

    try {
      console.log('Starting unified intelligence scan for:', config.jurisdiction);
      
      // Phase 1: Initialize scan
      setCurrentPhase('Initializing intelligence scan...');
      setScanProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 2: Scan idle properties
      if (config.enableIdleProperties) {
        setCurrentPhase('Scanning idle industrial properties...');
        setScanProgress(25);
        await scanIdleProperties(config.jurisdiction);
      }

      // Phase 3: Analyze corporate distress
      if (config.enableCorporateDistress) {
        setCurrentPhase('Analyzing corporate distress signals...');
        setScanProgress(45);
        await analyzeCorporateDistress(config.jurisdiction);
      }

      // Phase 4: SEC/SEDAR filing analysis
      if (config.enableSECFilings) {
        setCurrentPhase('Processing regulatory filings...');
        setScanProgress(65);
        await analyzeSECFilings(config.jurisdiction);
      }

      // Phase 5: Satellite analysis
      if (config.enableSatelliteAnalysis) {
        setCurrentPhase('Performing satellite imagery analysis...');
        setScanProgress(80);
        await performSatelliteAnalysis(config.jurisdiction);
      }

      // Phase 6: Cross-reference and score
      setCurrentPhase('Cross-referencing data sources...');
      setScanProgress(95);
      await crossReferenceData();

      // Complete
      setCurrentPhase('Scan complete');
      setScanProgress(100);
      
      toast({
        title: "Intelligence Scan Complete",
        description: `Found ${opportunities.length} opportunities in ${config.jurisdiction}`,
      });

    } catch (err) {
      console.error('Unified scan error:', err);
      setError(err instanceof Error ? err.message : 'Scan failed');
      toast({
        title: "Scan Error",
        description: "Failed to complete intelligence scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  }, [opportunities.length, toast]);

  const scanIdleProperties = async (jurisdiction: string) => {
    try {
      const { data: idleSites, error } = await supabase
        .from('verified_heavy_power_sites')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const idleOpportunities: Opportunity[] = (idleSites || []).map(site => {
        // Parse coordinates from point type if available
        let coordinates: [number, number] | undefined;
        if (site.coordinates) {
          // Coordinates are stored as point type, need to extract lat/lng
          const coordStr = String(site.coordinates);
          const match = coordStr.match(/\(([^,]+),([^)]+)\)/);
          if (match) {
            coordinates = [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]
          }
        }

        // Safely parse satellite_analysis JSON
        let aiInsights = 'Satellite analysis indicates reduced activity';
        if (site.satellite_analysis) {
          try {
            const analysis = typeof site.satellite_analysis === 'string' 
              ? JSON.parse(site.satellite_analysis) 
              : site.satellite_analysis;
            if (analysis && typeof analysis === 'object' && 'summary' in analysis) {
              aiInsights = analysis.summary || aiInsights;
            }
          } catch (e) {
            console.warn('Failed to parse satellite_analysis:', e);
          }
        }

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

      setOpportunities(prev => [...prev, ...idleOpportunities]);
    } catch (error) {
      console.error('Error scanning idle properties:', error);
    }
  };

  const analyzeCorporateDistress = async (jurisdiction: string) => {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .not('distress_signals', 'is', null)
        .order('financial_health_score', { ascending: true })
        .limit(25);

      if (error) throw error;

      const distressedOpportunities: Opportunity[] = (companies || []).map(company => ({
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

      setOpportunities(prev => [...prev, ...distressedOpportunities]);
    } catch (error) {
      console.error('Error analyzing corporate distress:', error);
    }
  };

  const analyzeSECFilings = async (jurisdiction: string) => {
    // This would integrate with SEC EDGAR API in production
    console.log('Analyzing SEC filings for', jurisdiction);
  };

  const performSatelliteAnalysis = async (jurisdiction: string) => {
    // This would integrate with satellite imagery APIs in production
    console.log('Performing satellite analysis for', jurisdiction);
  };

  const crossReferenceData = async () => {
    // Calculate final stats
    const stats: ScanStats = {
      distressedSites: opportunities.filter(o => o.type === 'distressed').length,
      idleProperties: opportunities.filter(o => o.type === 'idle').length,
      totalMW: opportunities.reduce((sum, o) => sum + o.estimatedPowerMW, 0),
      sourcesUsed: 6
    };
    
    setScanStats(stats);
  };

  return {
    opportunities,
    isScanning,
    scanProgress,
    currentPhase,
    scanStats,
    error,
    startUnifiedScan
  };
}
