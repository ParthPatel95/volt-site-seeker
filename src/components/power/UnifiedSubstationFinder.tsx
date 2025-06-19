
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SearchMethodSelector } from './unifiedFinder/SearchMethodSelector';
import { SubstationResults } from './unifiedFinder/SubstationResults';
import { ProgressIndicator } from './unifiedFinder/ProgressIndicator';
import { useSubstationAnalyzer } from './unifiedFinder/SubstationAnalyzer';
import { Search } from 'lucide-react';

interface DiscoveredSubstation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_id: string;
  address: string;
  capacity_estimate?: {
    min: number;
    max: number;
    confidence: number;
  };
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  stored_at?: string;
  details?: {
    utility_owner?: string;
    voltage_level?: string;
    interconnection_type?: string;
    commissioning_date?: string;
    load_factor?: number;
    status?: string;
    ownership_confidence?: number;
    ownership_source?: string;
  };
}

interface PredefinedSection {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

export function UnifiedSubstationFinder() {
  const [activeMethod, setActiveMethod] = useState<'google' | 'map'>('google');
  const [location, setLocation] = useState('');
  const [selectedSection, setSelectedSection] = useState<PredefinedSection | null>(null);
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [discoveredSubstations, setDiscoveredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [storedSubstations, setStoredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();

  const { analyzeAllSubstations } = useSubstationAnalyzer({
    substations: discoveredSubstations,
    setSubstations: setDiscoveredSubstations,
    activeMethod,
    onProgress: setProgress,
    onComplete: () => {
      setAnalyzing(false);
      loadStoredSubstations();
      toast({
        title: "Analysis Complete",
        description: `Completed capacity and ownership analysis for ${discoveredSubstations.length} substations`,
      });
    }
  });

  useEffect(() => {
    loadStoredSubstations();
  }, []);

  const loadStoredSubstations = async () => {
    try {
      const { data, error } = await supabase
        .from('substations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSubstations: DiscoveredSubstation[] = data.map(sub => ({
        id: sub.id,
        name: sub.name,
        latitude: sub.latitude || 0,
        longitude: sub.longitude || 0,
        place_id: `stored_${sub.id}`,
        address: `${sub.city}, ${sub.state}`,
        capacity_estimate: {
          min: Math.round(sub.capacity_mva * 0.8),
          max: Math.round(sub.capacity_mva),
          confidence: 0.8
        },
        analysis_status: 'completed' as const,
        stored_at: sub.created_at,
        details: {
          utility_owner: sub.utility_owner,
          voltage_level: sub.voltage_level,
          interconnection_type: sub.interconnection_type,
          commissioning_date: sub.commissioning_date,
          load_factor: sub.load_factor,
          status: sub.status
        }
      }));

      setStoredSubstations(formattedSubstations);
    } catch (error) {
      console.error('Error loading stored substations:', error);
    }
  };

  const findSubstationsGoogle = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a state or province to search for substations",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setProgress(0);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: location.trim(),
          searchRadius: 100000,
          maxResults: 100
        }
      });

      if (error) throw error;

      const substations: DiscoveredSubstation[] = data.substations.map((sub: any) => ({
        ...sub,
        analysis_status: 'pending'
      }));

      setDiscoveredSubstations(substations);
      setProgress(25);

      toast({
        title: "Substations Found",
        description: `Found ${substations.length} substations in ${location}`,
      });

      setSearching(false);
      setAnalyzing(true);
      await analyzeAllSubstations(substations);

    } catch (error: any) {
      console.error('Substation search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for substations",
        variant: "destructive"
      });
      setSearching(false);
    }
  };

  const findSubstationsMap = async () => {
    if (!selectedSection) {
      toast({
        title: "Section Required",
        description: "Please select a section below to search for substations",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setProgress(0);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: `${selectedSection.center.lat},${selectedSection.center.lng}`,
          searchRadius: 70000,
          maxResults: 200
        }
      });

      if (error) throw error;

      const substations: DiscoveredSubstation[] = data.substations
        .filter((sub: any) => {
          return sub.latitude >= selectedSection.bounds.south &&
                 sub.latitude <= selectedSection.bounds.north &&
                 sub.longitude >= selectedSection.bounds.west &&
                 sub.longitude <= selectedSection.bounds.east;
        })
        .map((sub: any) => ({
          ...sub,
          analysis_status: 'pending'
        }));

      setDiscoveredSubstations(substations);
      setProgress(25);

      toast({
        title: "Substations Found",
        description: `Found ${substations.length} substations in ${selectedSection.name}`,
      });

      setSearching(false);
      setAnalyzing(true);
      await analyzeAllSubstations(substations);

    } catch (error: any) {
      console.error('Map search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search selected area",
        variant: "destructive"
      });
      setSearching(false);
    }
  };

  const handleViewOnMap = (substation: DiscoveredSubstation) => {
    window.open(`https://maps.google.com/?q=${substation.latitude},${substation.longitude}`, '_blank');
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Search className="w-5 h-5 flex-shrink-0" />
            <span className="text-base sm:text-lg">Unified Substation Finder</span>
            <Badge variant="outline" className="self-start sm:self-auto">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchMethodSelector
            activeMethod={activeMethod}
            setActiveMethod={setActiveMethod}
            location={location}
            setLocation={setLocation}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            searching={searching}
            analyzing={analyzing}
            onGoogleSearch={findSubstationsGoogle}
            onMapSearch={findSubstationsMap}
            progress={progress}
          />

          <ProgressIndicator
            searching={searching}
            analyzing={analyzing}
            progress={progress}
          />
        </CardContent>
      </Card>

      <SubstationResults
        discoveredSubstations={discoveredSubstations}
        storedSubstations={storedSubstations}
        onViewOnMap={handleViewOnMap}
      />
    </div>
  );
}
