
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SearchConfig, ScanStats, Opportunity } from './types';
import { executeUnifiedScan } from './scanOrchestrator';

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
      
      const stats = await executeUnifiedScan(
        config,
        (progress, phase) => {
          setScanProgress(progress);
          setCurrentPhase(phase);
        },
        (updatedOpportunities) => {
          setOpportunities(updatedOpportunities);
        }
      );

      setScanStats(stats);
      
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
