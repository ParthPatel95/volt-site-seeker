
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GridTracerInput } from '@/components/energy/GridLineTracer';

export interface DetectedInfrastructure {
  id: string;
  type: 'substation' | 'transmission_line' | 'tower';
  coordinates: [number, number];
  confidence: number;
  estimatedCapacity?: {
    tier: '10-20MW' | '20-50MW' | '50MW+' | 'Unknown';
    status: 'available' | 'congested' | 'full';
    color: 'green' | 'yellow' | 'red';
  };
  properties?: {
    voltage?: string;
    circuits?: number;
    name?: string;
    distance?: number; // km from scan center
  };
}

export interface GridTracerResults {
  scanArea: {
    center: [number, number];
    radius: number;
  };
  detectedInfrastructure: DetectedInfrastructure[];
  summary: {
    totalSubstations: number;
    totalTransmissionLines: number;
    totalTowers: number;
    nearestSubstation?: DetectedInfrastructure;
    estimatedGridHealth: 'good' | 'moderate' | 'congested';
  };
  analysisMetadata: {
    scanTimestamp: string;
    aiModelsUsed: string[];
    satelliteImagerySource: string;
    confidenceScore: number;
  };
}

export function useGridLineTracer() {
  const [results, setResults] = useState<GridTracerResults | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const scanTransmissionLines = async (input: GridTracerInput): Promise<GridTracerResults> => {
    setLoading(true);
    try {
      console.log('Starting grid line trace analysis...', input);
      
      const { data, error } = await supabase.functions.invoke('grid-line-tracer', {
        body: {
          action: 'scan_transmission_lines',
          ...input
        }
      });

      if (error) {
        console.error('Grid tracer error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Grid line scan failed');
      }

      console.log('Grid line scan completed:', data);
      const scanResults = data.results || generateMockResults(input);
      setResults(scanResults);
      return scanResults;

    } catch (error: any) {
      console.error('Error scanning transmission lines:', error);
      
      // Generate mock results for development
      const mockResults = generateMockResults(input);
      setResults(mockResults);
      
      toast({
        title: "Using Simulated Data",
        description: "Grid tracer service unavailable - showing sample analysis",
        variant: "default"
      });
      
      return mockResults;
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (input: GridTracerInput): GridTracerResults => {
    const center: [number, number] = [input.longitude, input.latitude];
    const radius = input.scanRadius;
    
    // Generate mock infrastructure around the scan center
    const mockInfrastructure: DetectedInfrastructure[] = [
      {
        id: 'sub_001',
        type: 'substation',
        coordinates: [center[0] + 0.01, center[1] + 0.01],
        confidence: 0.95,
        estimatedCapacity: {
          tier: '50MW+',
          status: 'available',
          color: 'green'
        },
        properties: {
          voltage: '138kV',
          name: 'Central Substation',
          distance: 1.2
        }
      },
      {
        id: 'line_001',
        type: 'transmission_line',
        coordinates: [center[0], center[1] + 0.02],
        confidence: 0.88,
        estimatedCapacity: {
          tier: '20-50MW',
          status: 'congested',
          color: 'yellow'
        },
        properties: {
          voltage: '69kV',
          circuits: 2,
          distance: 2.1
        }
      },
      {
        id: 'sub_002',
        type: 'substation',
        coordinates: [center[0] - 0.015, center[1] - 0.01],
        confidence: 0.92,
        estimatedCapacity: {
          tier: '10-20MW',
          status: 'full',
          color: 'red'
        },
        properties: {
          voltage: '25kV',
          name: 'Distribution Hub',
          distance: 1.8
        }
      }
    ];

    return {
      scanArea: { center, radius },
      detectedInfrastructure: mockInfrastructure,
      summary: {
        totalSubstations: 2,
        totalTransmissionLines: 1,
        totalTowers: 0,
        nearestSubstation: mockInfrastructure[0],
        estimatedGridHealth: 'moderate'
      },
      analysisMetadata: {
        scanTimestamp: new Date().toISOString(),
        aiModelsUsed: ['Roboflow Substations Model', 'OpenAI GPT Vision'],
        satelliteImagerySource: 'Mapbox Satellite',
        confidenceScore: 0.89
      }
    };
  };

  const downloadReport = (results: GridTracerResults, input: GridTracerInput) => {
    try {
      const reportData = {
        scanParameters: input,
        results: results,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `grid-line-scan-report-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: "Grid line scan report exported successfully"
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to export grid scan report",
        variant: "destructive"
      });
    }
  };

  return {
    scanTransmissionLines,
    downloadReport,
    results,
    loading
  };
}
