import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubstationDetailsModal } from './SubstationDetailsModal';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { UltimateFinderHeader } from './ultimateFinder/UltimateFinderHeader';
import { UltimateFinderSearchControls } from './ultimateFinder/UltimateFinderSearchControls';
import { UltimateFinderSearchStats } from './ultimateFinder/UltimateFinderSearchStats';
import { UltimateFinderSubstationsList } from './ultimateFinder/UltimateFinderSubstationsList';
import { 
  FinderResult, 
  SearchStats, 
  StoredSubstation,
  TEXAS_CITIES,
  ALBERTA_CITIES 
} from './ultimateFinder/UltimateFinderTypes';
import { 
  calculateRateEstimation,
  consolidateAllSources,
  storeNewSubstations
} from './ultimateFinder/UltimateFinderUtils';

export function UltimatePowerInfrastructureFinder() {
  const [searchRegion, setSearchRegion] = useState<'alberta' | 'texas'>('texas');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [centerCoordinates, setCenterCoordinates] = useState('');
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [storedSubstations, setStoredSubstations] = useState<StoredSubstation[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [selectedSubstation, setSelectedSubstation] = useState<StoredSubstation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [analyzingSubstation, setAnalyzingSubstation] = useState<string | null>(null);
  const [deletingSubstation, setDeletingSubstation] = useState<string | null>(null);
  const [useMLAnalysis, setUseMLAnalysis] = useState(false);
  const { estimateCapacity, loading: capacityLoading } = useCapacityEstimator();
  const { toast } = useToast();

  useEffect(() => {
    loadStoredSubstations();
  }, []);

  useEffect(() => {
    setSelectedCity('All Cities');
  }, [searchRegion]);

  const loadStoredSubstations = async () => {
    try {
      setLoadingStored(true);
      console.log('Loading stored substations...');
      
      const { data, error } = await supabase
        .from('substations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading stored substations:', error);
        throw error;
      }

      setStoredSubstations(data || []);
      console.log('Loaded stored substations:', data?.length || 0);
    } catch (error: any) {
      console.error('Failed to load stored substations:', error);
      toast({
        title: "Error Loading Stored Data",
        description: error.message || "Failed to load stored substations",
        variant: "destructive"
      });
    } finally {
      setLoadingStored(false);
    }
  };

  const executeUltimateSearch = async () => {
    setSearching(true);
    setProgress(0);
    setSearchStats(null);

    try {
      console.log('Starting ultimate substation search for', searchRegion, selectedCity !== 'All Cities' ? `in ${selectedCity}` : '', useMLAnalysis ? 'with AI analysis' : '');
      
      setCurrentPhase('Phase 1: Regulatory Data Integration');
      setProgress(5);
      
      const functionName = searchRegion === 'alberta' ? 'aeso-data-integration' : 'ercot-data-integration';
      const { data: regulatoryData, error: regError } = await supabase.functions.invoke(functionName);

      if (regError) throw regError;
      setProgress(20);

      setCurrentPhase('Phase 2: Advanced Satellite Analysis');
      
      const { data: satelliteData, error: satError } = await supabase.functions.invoke('satellite-analysis', {
        body: {
          action: 'ml_detection',
          region: searchRegion,
          city: selectedCity !== 'All Cities' ? selectedCity : undefined,
          analysis_type: 'comprehensive',
          ml_models: ['substation_detector', 'transmission_line_detector', 'change_detector']
        }
      });

      if (satError) throw satError;
      setProgress(40);

      setCurrentPhase('Phase 3: Enhanced Google Maps + AI Integration');
      
      const searchLocation = selectedCity !== 'All Cities' 
        ? `${selectedCity}, ${searchRegion === 'texas' ? 'Texas, USA' : 'Alberta, Canada'}`
        : searchRegion === 'texas' ? 'Texas, USA' : 'Alberta, Canada';
      
      const { data: googleData, error: googleError } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: {
          location: searchLocation,
          maxResults: 0,
          useImageAnalysis: useMLAnalysis
        }
      });

      if (googleError) throw googleError;
      setProgress(60);

      setCurrentPhase('Phase 4: Database Cross-Reference');
      
      let dbQuery = supabase
        .from('substations')
        .select('*')
        .eq('state', searchRegion === 'texas' ? 'TX' : 'AB');

      if (selectedCity !== 'All Cities') {
        dbQuery = dbQuery.eq('city', selectedCity);
      }

      const { data: existingSubstations, error: dbError } = await dbQuery;

      if (dbError) throw dbError;
      setProgress(80);

      setCurrentPhase('Phase 5: Data Validation & Storage');
      
      const consolidatedResults = await consolidateAllSources(
        regulatoryData,
        satelliteData,
        googleData,
        existingSubstations
      );

      const resultsWithRates = await Promise.all(
        consolidatedResults.results.map(async (result) => {
          const rateEstimation = await calculateRateEstimation(result, searchRegion);
          return { ...result, rate_estimation: rateEstimation };
        })
      );

      await storeNewSubstations(resultsWithRates, selectedCity, searchRegion);

      setSearchStats(consolidatedResults.stats);
      setProgress(100);

      await loadStoredSubstations();

      const searchArea = selectedCity !== 'All Cities' ? `${selectedCity}, ${searchRegion}` : `entire ${searchRegion} region`;
      const analysisType = useMLAnalysis ? 'with AI satellite analysis' : '';
      toast({
        title: "Ultimate Search Complete!",
        description: `Found and stored ${resultsWithRates.length} substations ${analysisType} in ${searchArea}`,
      });

    } catch (error: any) {
      console.error('Ultimate search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to complete ultimate search",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
      setCurrentPhase('');
    }
  };

  const handleSubstationClick = (substation: StoredSubstation) => {
    setSelectedSubstation(substation);
    setIsDetailsModalOpen(true);
  };

  const handleAnalyzeSubstation = async (substation: StoredSubstation) => {
    if (!substation.latitude || !substation.longitude) {
      toast({
        title: "Analysis Error",
        description: "Cannot analyze substation without coordinates",
        variant: "destructive"
      });
      return;
    }

    setAnalyzingSubstation(substation.id);
    
    try {
      await estimateCapacity({
        latitude: substation.latitude,
        longitude: substation.longitude,
        manualOverride: {
          transformers: 3,
          capacity: substation.capacity_mva,
          substationType: 'transmission',
          utilityContext: {
            company: substation.utility_owner,
            voltage: substation.voltage_level,
            name: substation.name,
            notes: `Load factor: ${substation.load_factor}%, Status: ${substation.status}`
          }
        }
      });

      toast({
        title: "Analysis Complete",
        description: `Capacity estimation completed for ${substation.name}`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze substation",
        variant: "destructive"
      });
    } finally {
      setAnalyzingSubstation(null);
    }
  };

  const handleDeleteSubstation = async (substation: StoredSubstation) => {
    if (!confirm(`Are you sure you want to delete ${substation.name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingSubstation(substation.id);
    
    try {
      const { error } = await supabase
        .from('substations')
        .delete()
        .eq('id', substation.id);

      if (error) throw error;

      toast({
        title: "Substation Deleted",
        description: `${substation.name} has been removed`,
      });

      await loadStoredSubstations();
      
      if (selectedSubstation?.id === substation.id) {
        setIsDetailsModalOpen(false);
        setSelectedSubstation(null);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete substation",
        variant: "destructive"
      });
    } finally {
      setDeletingSubstation(null);
    }
  };

  return (
    <div className="space-y-6">
      <UltimateFinderHeader />

      <UltimateFinderSearchControls
        searchRegion={searchRegion}
        setSearchRegion={setSearchRegion}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        centerCoordinates={centerCoordinates}
        setCenterCoordinates={setCenterCoordinates}
        searching={searching}
        progress={progress}
        currentPhase={currentPhase}
        useMLAnalysis={useMLAnalysis}
        setUseMLAnalysis={setUseMLAnalysis}
        onExecuteSearch={executeUltimateSearch}
      />

      {searchStats && (
        <UltimateFinderSearchStats
          searchStats={searchStats}
          selectedCity={selectedCity}
        />
      )}

      <UltimateFinderSubstationsList
        storedSubstations={storedSubstations}
        loadingStored={loadingStored}
        analyzingSubstation={analyzingSubstation}
        deletingSubstation={deletingSubstation}
        capacityLoading={capacityLoading}
        onLoadStoredSubstations={loadStoredSubstations}
        onSubstationClick={handleSubstationClick}
        onAnalyzeSubstation={handleAnalyzeSubstation}
        onDeleteSubstation={handleDeleteSubstation}
      />

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSubstation(null);
        }}
      />
    </div>
  );
}
