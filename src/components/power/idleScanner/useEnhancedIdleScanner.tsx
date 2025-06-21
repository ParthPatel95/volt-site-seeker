
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedVerifiedSite, ScanSession, EnhancedScanConfig, AdvancedFilters, ScanStats } from './enhanced_types';

export function useEnhancedIdleScanner() {
  const [sites, setSites] = useState<EnhancedVerifiedSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanSession | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [filters, setFilters] = useState<AdvancedFilters>({
    minConfidenceScore: 0,
    maxConfidenceScore: 100,
    minIdleScore: 0,
    maxIdleScore: 100,
    minFreeMW: 0,
    maxFreeMW: 1000,
    maxSubstationDistance: 50,
    powerPotential: [],
    visualStatus: [],
    industryTypes: [],
    businessStatus: [],
    dataSourcesRequired: [],
    hasEnvironmentalPermits: null,
    minSquareFootage: null,
    maxListingPrice: null,
    yearBuiltRange: null
  });

  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadSites();
    loadScanHistory();
  }, []);

  // Real-time scan progress monitoring
  useEffect(() => {
    if (currentScan?.id) {
      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
            body: { action: 'get_scan_progress', scanId: currentScan.id }
          });

          if (error) throw error;

          setCurrentScan(data.scan);

          if (data.scan.status === 'completed') {
            clearInterval(interval);
            loadSites();
            calculateStats();
            toast({
              title: "Scan Completed",
              description: `Found ${data.scan.sites_discovered} sites with ${data.scan.sites_verified} verified`,
            });
          }
        } catch (error) {
          console.error('Error checking scan progress:', error);
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentScan?.id]);

  const startEnhancedScan = async (config: EnhancedScanConfig) => {
    if (!config.jurisdiction) {
      toast({
        title: "Configuration Required",
        description: "Please select a jurisdiction to scan",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const scanConfig = {
        ...config,
        userId: user.id
      };

      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: { 
          action: 'start_comprehensive_scan',
          config: scanConfig
        }
      });

      if (error) throw error;

      setCurrentScan({
        id: data.scanId,
        jurisdiction: config.jurisdiction,
        city: config.city,
        scan_type: 'comprehensive_enhanced',
        status: 'processing',
        progress: 0,
        current_phase: 'Starting scan...',
        config: scanConfig,
        filters: {},
        sites_discovered: 0,
        sites_verified: 0,
        data_sources_used: [],
        created_at: new Date().toISOString()
      });

      toast({
        title: "Enhanced Scan Started",
        description: "Comprehensive multi-source scan initiated",
      });

    } catch (error: any) {
      console.error('Enhanced scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to start enhanced scan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async (customFilters?: Partial<AdvancedFilters>) => {
    setLoading(true);
    
    try {
      const activeFilters = { ...filters, ...customFilters };
      
      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: { 
          action: 'get_verified_sites',
          config: {
            minConfidence: activeFilters.minConfidenceScore,
            jurisdiction: null // Load all jurisdictions by default
          }
        }
      });

      if (error) throw error;

      // Apply client-side filtering for complex filters
      let filteredSites = data.sites || [];
      
      if (activeFilters.powerPotential.length > 0) {
        filteredSites = filteredSites.filter((site: EnhancedVerifiedSite) => 
          activeFilters.powerPotential.includes(site.power_potential)
        );
      }
      
      if (activeFilters.visualStatus.length > 0) {
        filteredSites = filteredSites.filter((site: EnhancedVerifiedSite) => 
          activeFilters.visualStatus.includes(site.visual_status)
        );
      }
      
      if (activeFilters.industryTypes.length > 0) {
        filteredSites = filteredSites.filter((site: EnhancedVerifiedSite) => 
          activeFilters.industryTypes.includes(site.industry_type)
        );
      }

      setSites(filteredSites);
      calculateStats(filteredSites);

    } catch (error: any) {
      console.error('Error loading sites:', error);
      toast({
        title: "Loading Failed", 
        description: error.message || "Failed to load sites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScanHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('site_scan_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Convert the data to match our ScanSession interface
      const formattedHistory = (data || []).map(session => ({
        ...session,
        data_sources_used: Array.isArray(session.data_sources_used) ? session.data_sources_used : []
      }));
      
      setScanHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const calculateStats = (sitesData?: EnhancedVerifiedSite[]) => {
    const currentSites = sitesData || sites;
    
    if (currentSites.length === 0) {
      setScanStats(null);
      return;
    }

    const stats: ScanStats = {
      totalSitesFound: currentSites.length,
      verifiedSites: currentSites.filter(s => s.validation_status === 'verified').length,
      pendingVerification: currentSites.filter(s => s.validation_status === 'pending').length,
      highConfidenceSites: currentSites.filter(s => s.confidence_level === 'High').length,
      mediumConfidenceSites: currentSites.filter(s => s.confidence_level === 'Medium').length,
      lowConfidenceSites: currentSites.filter(s => s.confidence_level === 'Low').length,
      dataSourcesUsed: Array.from(new Set(currentSites.flatMap(s => s.data_sources))),
      averageConfidenceScore: Math.round(
        currentSites.reduce((sum, s) => sum + s.confidence_score, 0) / currentSites.length
      ),
      totalEstimatedFreeMW: currentSites.reduce((sum, s) => sum + (s.estimated_free_mw || 0), 0),
      processingTimeMinutes: 0, // Will be set from scan session
      lastScanDate: currentSites[0]?.last_scan_at || new Date().toISOString()
    };

    setScanStats(stats);
  };

  const deleteSite = async (siteId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: { 
          action: 'delete_sites',
          config: { siteIds: [siteId] }
        }
      });

      if (error) throw error;

      setSites(prev => prev.filter(s => s.id !== siteId));
      setSelectedSites(prev => prev.filter(id => id !== siteId));
      
      toast({
        title: "Site Deleted",
        description: "Site has been successfully deleted",
      });
      
    } catch (error: any) {
      console.error('Error deleting site:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete site",
        variant: "destructive"
      });
    }
  };

  const bulkDeleteSites = async (siteIds?: string[]) => {
    const idsToDelete = siteIds || selectedSites;
    
    if (idsToDelete.length === 0) {
      toast({
        title: "No Sites Selected",
        description: "Please select sites to delete",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: { 
          action: 'delete_sites',
          config: { siteIds: idsToDelete }
        }
      });

      if (error) throw error;

      setSites(prev => prev.filter(s => !idsToDelete.includes(s.id)));
      setSelectedSites([]);
      
      toast({
        title: "Sites Deleted",
        description: `${data.deletedCount} sites have been successfully deleted`,
      });
      
    } catch (error: any) {
      console.error('Error bulk deleting sites:', error);
      toast({
        title: "Bulk Delete Failed",
        description: error.message || "Failed to delete selected sites",
        variant: "destructive"
      });
    }
  };

  const deleteAllSites = async (jurisdiction?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: { 
          action: 'bulk_delete_sites',
          config: { jurisdiction }
        }
      });

      if (error) throw error;

      setSites([]);
      setSelectedSites([]);
      
      toast({
        title: "All Sites Deleted",
        description: `${data.deletedCount} sites have been successfully deleted`,
      });
      
    } catch (error: any) {
      console.error('Error deleting all sites:', error);
      toast({
        title: "Delete All Failed",
        description: error.message || "Failed to delete all sites",
        variant: "destructive"
      });
    }
  };

  const exportSites = async (format: 'csv' | 'json' | 'pdf' = 'csv') => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-idle-industry-scanner', {
        body: { 
          action: 'export_sites',
          config: { jurisdiction: null }
        }
      });

      if (error) throw error;

      if (format === 'csv') {
        const csvContent = [
          [
            'Name', 'Address', 'City', 'State', 'Industry Type', 'Confidence Score', 
            'Confidence Level', 'Idle Score', 'Power Potential', 'Estimated Free MW',
            'Visual Status', 'Business Status', 'Data Sources', 'Discovery Method'
          ].join(','),
          ...data.sites.map((site: EnhancedVerifiedSite) => [
            site.name,
            site.address,
            site.city,
            site.state,
            site.industry_type,
            site.confidence_score,
            site.confidence_level,
            site.idle_score,
            site.power_potential,
            site.estimated_free_mw || 0,
            site.visual_status,
            site.business_status,
            site.data_sources.join(';'),
            site.discovery_method || ''
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced-industrial-sites-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Completed",
        description: `Exported ${data.totalCount} sites to ${format.toUpperCase()}`,
      });

    } catch (error: any) {
      console.error('Error exporting sites:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export sites",
        variant: "destructive"
      });
    }
  };

  return {
    // Data
    sites,
    selectedSites,
    currentScan,
    scanHistory,
    scanStats,
    filters,
    loading,
    
    // Actions
    setSelectedSites,
    setFilters,
    startEnhancedScan,
    loadSites,
    deleteSite,
    bulkDeleteSites,
    deleteAllSites,
    exportSites,
    calculateStats
  };
}
