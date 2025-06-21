
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VerifiedHeavyPowerSite, RealDataScanConfig } from './realdata_types';

interface RealDataScanStats {
  totalScanned: number;
  verifiedSites: number;
  averageConfidence: number;
  sourcesUsed: string[];
  scanDuration: number;
}

export function useRealDataVerifiedSites(scanConfig: RealDataScanConfig) {
  const [sites, setSites] = useState<VerifiedHeavyPowerSite[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [scanStats, setScanStats] = useState<RealDataScanStats | null>(null);
  const { toast } = useToast();

  const executeScan = async () => {
    if (!scanConfig.jurisdiction) {
      toast({
        title: "Configuration Required",
        description: "Please select a jurisdiction to scan",
        variant: "destructive"
      });
      return;
    }

    setScanning(true);
    setProgress(0);
    setSites([]);
    
    try {
      console.log('Starting real data verified sites scan for:', scanConfig);
      
      // Phase 1: Multi-source data pulling
      setCurrentPhase('🔍 Pulling data from multiple APIs...');
      setProgress(10);
      
      const { data: pullData, error: pullError } = await supabase.functions.invoke('realdata-verified-sites', {
        body: { 
          action: 'pull_multi_source_data',
          config: scanConfig
        }
      });

      if (pullError) throw pullError;
      setProgress(25);

      // Phase 2: Cross-check location validity
      setCurrentPhase('📍 Cross-checking location validity...');
      
      const { data: validationData, error: validationError } = await supabase.functions.invoke('realdata-verified-sites', {
        body: { 
          action: 'validate_locations',
          sites: pullData.sites,
          config: scanConfig
        }
      });

      if (validationError) throw validationError;
      setProgress(45);

      // Phase 3: GPT-powered validation (if enabled)
      if (scanConfig.enableGPTValidation) {
        setCurrentPhase('🧠 Running GPT-4 validation analysis...');
        
        const { data: gptData, error: gptError } = await supabase.functions.invoke('realdata-verified-sites', {
          body: { 
            action: 'gpt_validation',
            sites: validationData.validatedSites,
            config: scanConfig
          }
        });

        if (gptError) throw gptError;
        setProgress(65);
        validationData.validatedSites = gptData.analyzedSites;
      }

      // Phase 4: Satellite image analysis (if enabled)
      if (scanConfig.enableSatelliteAnalysis) {
        setCurrentPhase('🛰️ Analyzing satellite imagery...');
        
        const { data: satelliteData, error: satelliteError } = await supabase.functions.invoke('realdata-verified-sites', {
          body: { 
            action: 'satellite_analysis',
            sites: validationData.validatedSites,
            config: scanConfig
          }
        });

        if (satelliteError) throw satelliteError;
        setProgress(85);
        validationData.validatedSites = satelliteData.analyzedSites;
      }

      // Phase 5: Calculate confidence scores
      setCurrentPhase('📊 Calculating confidence scores...');
      
      const { data: finalData, error: finalError } = await supabase.functions.invoke('realdata-verified-sites', {
        body: { 
          action: 'calculate_confidence',
          sites: validationData.validatedSites,
          config: scanConfig
        }
      });

      if (finalError) throw finalError;
      setProgress(95);

      // Finalize results
      setCurrentPhase('✅ Finalizing results...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setSites(finalData.sites || []);
      setScanStats(finalData.stats || {});
      setProgress(100);
      
      setCurrentPhase('Scan completed');

      toast({
        title: "Scan Completed",
        description: `Found ${finalData.sites?.length || 0} verified heavy power sites`,
      });

    } catch (error: any) {
      console.error('Real data verified sites scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to complete verified sites scan",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
      setProgress(0);
      setCurrentPhase('');
    }
  };

  const exportToCsv = () => {
    const filteredSites = sites.filter(site => 
      site.confidenceScore.total >= scanConfig.includeConfidenceThreshold
    );

    const csvContent = [
      [
        'Site Name', 'Address', 'City', 'State', 'Confidence Score', 'Confidence Level',
        'Verified', 'Visual Status', 'Power Potential', 'Industrial Status', 
        'Sources Count', 'Listing Price', 'Square Footage', 'Year Built'
      ].join(','),
      ...filteredSites.map(site => [
        site.name,
        site.address,
        site.city,
        site.state,
        site.confidenceScore.total,
        site.confidenceScore.level,
        site.validation.isVerified ? 'Yes' : 'No',
        site.satelliteAnalysis.visualStatus,
        site.gptAnalysis.powerPotential,
        site.gptAnalysis.industrialStatus,
        site.sources.length,
        site.listingPrice || '',
        site.squareFootage || '',
        site.yearBuilt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verified-heavy-power-sites-${scanConfig.jurisdiction.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Exported ${filteredSites.length} verified sites to CSV`,
    });
  };

  return {
    sites,
    scanning,
    progress,
    currentPhase,
    scanStats,
    executeScan,
    exportToCsv
  };
}
