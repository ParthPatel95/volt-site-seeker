
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { IdleIndustrySite, IdleIndustryScanFilters, IdleIndustryScanStats } from './types';

export function useIdleIndustryScanner() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [results, setResults] = useState<IdleIndustrySite[]>([]);
  const [scanStats, setScanStats] = useState<IdleIndustryScanStats>({
    industrialSitesScanned: 0,
    satelliteImagesAnalyzed: 0,
    mlAnalysisSuccessRate: 0,
    processingTimeMinutes: 0,
    dataSourcesUsed: [],
    jurisdiction: '',
    scanCompletedAt: ''
  });
  
  const [filters, setFilters] = useState<IdleIndustryScanFilters>({
    minIdleScore: 40,
    minFreeMW: 10,
    maxSubstationDistance: 25,
    industryTypes: [],
    retrofitCostClasses: []
  });

  const { toast } = useToast();

  const executeScan = async () => {
    if (!selectedJurisdiction) {
      toast({
        title: "Jurisdiction Required",
        description: "Please select a state or province to scan",
        variant: "destructive"
      });
      return;
    }

    setScanning(true);
    setProgress(0);
    setResults([]);

    try {
      console.log('Starting idle industry scan for:', selectedJurisdiction);
      
      // Phase 1: Industrial Site Discovery
      setCurrentPhase('Discovering industrial sites...');
      setProgress(10);
      
      const { data: siteData, error: siteError } = await supabase.functions.invoke('idle-industry-scanner', {
        body: { 
          action: 'discover_sites',
          jurisdiction: selectedJurisdiction 
        }
      });

      if (siteError) throw siteError;
      setProgress(25);

      // Phase 2: Satellite Analysis
      setCurrentPhase('Analyzing satellite imagery...');
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('idle-industry-scanner', {
        body: { 
          action: 'analyze_sites',
          sites: siteData.sites,
          jurisdiction: selectedJurisdiction 
        }
      });

      if (analysisError) throw analysisError;
      setProgress(60);

      // Phase 3: Opportunity Assessment
      setCurrentPhase('Calculating opportunity scores...');
      
      const { data: opportunityData, error: opportunityError } = await supabase.functions.invoke('idle-industry-scanner', {
        body: { 
          action: 'assess_opportunities',
          analyzedSites: analysisData.analyzedSites,
          jurisdiction: selectedJurisdiction 
        }
      });

      if (opportunityError) throw opportunityError;
      setProgress(85);

      // Phase 4: Finalize Results
      setCurrentPhase('Finalizing results...');
      setProgress(95);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResults(opportunityData.sites || []);
      setScanStats(opportunityData.stats || {});
      setProgress(100);
      
      setCurrentPhase('Scan completed');

      toast({
        title: "Scan Completed",
        description: `Found ${opportunityData.sites?.length || 0} industrial sites in ${selectedJurisdiction}`,
      });

    } catch (error: any) {
      console.error('Idle industry scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to complete idle industry scan",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
      setProgress(0);
      setCurrentPhase('');
    }
  };

  const exportToCsv = () => {
    const filteredResults = results.filter(site => 
      site.idleScore >= filters.minIdleScore &&
      site.estimatedFreeMW >= filters.minFreeMW &&
      site.substationDistanceKm <= filters.maxSubstationDistance
    );

    const csvContent = [
      // CSV Header
      ['Site Name', 'Industry', 'City', 'State', 'Idle Score', 'Est Free MW', 'Substation Distance (km)', 'Strategy', 'Retrofit Cost'].join(','),
      // CSV Data
      ...filteredResults.map(site => [
        site.name,
        site.industryType,
        site.city,
        site.state,
        site.idleScore,
        site.estimatedFreeMW,
        site.substationDistanceKm.toFixed(1),
        site.recommendedStrategy,
        site.retrofitCostClass
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idle-industry-scan-${selectedJurisdiction.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Exported ${filteredResults.length} sites to CSV`,
    });
  };

  const exportToPdf = async () => {
    const topSites = results
      .filter(site => site.idleScore >= 60)
      .sort((a, b) => b.idleScore - a.idleScore)
      .slice(0, 10);

    try {
      const { data, error } = await supabase.functions.invoke('idle-industry-scanner', {
        body: { 
          action: 'generate_pdf_report',
          sites: topSites,
          jurisdiction: selectedJurisdiction,
          stats: scanStats
        }
      });

      if (error) throw error;

      // Handle PDF download
      const blob = new Blob([data.pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `idle-industry-opportunity-brief-${selectedJurisdiction.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated",
        description: `Generated opportunity brief for top ${topSites.length} sites`,
      });

    } catch (error: any) {
      toast({
        title: "PDF Export Failed",
        description: error.message || "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  return {
    selectedJurisdiction,
    setSelectedJurisdiction,
    scanning,
    progress,
    currentPhase,
    results,
    scanStats,
    filters,
    setFilters,
    executeScan,
    exportToCsv,
    exportToPdf
  };
}
