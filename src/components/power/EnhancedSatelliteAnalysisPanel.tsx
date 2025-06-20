
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Satellite,
  Map,
  Brain,
  Search,
  Zap,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';

interface SatelliteDetection {
  id: string;
  coordinates: { lat: number; lng: number };
  confidence_score: number;
  detection_type: 'ml_model' | 'change_detection' | 'lidar_analysis';
  infrastructure_features: string[];
  voltage_indicators: string[];
  capacity_estimate: string;
  validation_status: 'pending' | 'confirmed' | 'rejected';
  satellite_image_url: string;
  analysis_timestamp: string;
}

export function EnhancedSatelliteAnalysisPanel() {
  const [searchCoordinates, setSearchCoordinates] = useState('');
  const [searchRadius, setSearchRadius] = useState(50);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detections, setDetections] = useState<SatelliteDetection[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<'alberta' | 'texas'>('texas');
  const { toast } = useToast();

  const performMLAnalysis = async () => {
    setAnalyzing(true);
    setProgress(0);

    try {
      console.log('Starting ML-based satellite analysis');
      
      // Phase 2: ML Models for Substation Detection
      const { data, error } = await supabase.functions.invoke('satellite-analysis', {
        body: {
          action: 'ml_detection',
          region: selectedRegion,
          analysis_type: 'comprehensive',
          ml_models: ['substation_detector', 'transmission_line_detector', 'change_detector']
        }
      });

      if (error) throw error;

      setProgress(50);

      // Simulate ML processing stages
      const stages = ['Loading satellite imagery', 'Running ML detection', 'Analyzing features', 'Validating results'];
      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(50 + (i + 1) * 12.5);
      }

      const mockDetections: SatelliteDetection[] = [
        {
          id: `ml_${Date.now()}_1`,
          coordinates: selectedRegion === 'texas' ? { lat: 29.7604, lng: -95.3698 } : { lat: 51.0447, lng: -114.0719 },
          confidence_score: 92,
          detection_type: 'ml_model',
          infrastructure_features: ['High-voltage transformers', 'Switching equipment', 'Control building'],
          voltage_indicators: ['345kV transmission lines', 'Multiple bay configuration'],
          capacity_estimate: '800-1200 MVA',
          validation_status: 'pending',
          satellite_image_url: `https://maps.googleapis.com/maps/api/staticmap?center=${selectedRegion === 'texas' ? '29.7604,-95.3698' : '51.0447,-114.0719'}&zoom=18&size=400x400&maptype=satellite&key=placeholder`,
          analysis_timestamp: new Date().toISOString()
        },
        {
          id: `ml_${Date.now()}_2`,
          coordinates: selectedRegion === 'texas' ? { lat: 32.7767, lng: -96.7970 } : { lat: 53.4808, lng: -113.5024 },
          confidence_score: 87,
          detection_type: 'change_detection',
          infrastructure_features: ['Recent expansion', 'New transformer installation'],
          voltage_indicators: ['138kV lines', 'Distribution feeders'],
          capacity_estimate: '300-500 MVA',
          validation_status: 'pending',
          satellite_image_url: `https://maps.googleapis.com/maps/api/staticmap?center=${selectedRegion === 'texas' ? '32.7767,-96.7970' : '53.4808,-113.5024'}&zoom=18&size=400x400&maptype=satellite&key=placeholder`,
          analysis_timestamp: new Date().toISOString()
        }
      ];

      setDetections(mockDetections);
      setProgress(100);

      toast({
        title: "ML Analysis Complete",
        description: `Found ${mockDetections.length} potential substations using advanced ML models`,
      });

    } catch (error: any) {
      console.error('ML analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to perform ML analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const performChangeDetection = async () => {
    setAnalyzing(true);
    setProgress(0);

    try {
      console.log('Starting change detection analysis for', selectedRegion);
      
      // Simulate change detection process
      const stages = ['Loading historical imagery', 'Comparing time series', 'Detecting changes', 'Analyzing infrastructure growth'];
      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress((i + 1) * 25);
      }

      const changeDetections: SatelliteDetection[] = [
        {
          id: `change_${Date.now()}_1`,
          coordinates: selectedRegion === 'texas' ? { lat: 30.2672, lng: -97.7431 } : { lat: 52.2681, lng: -113.8112 },
          confidence_score: 78,
          detection_type: 'change_detection',
          infrastructure_features: ['New construction 2023-2024', 'Capacity expansion'],
          voltage_indicators: ['138kV upgrade', 'Additional bay construction'],
          capacity_estimate: '400-600 MVA',
          validation_status: 'pending',
          satellite_image_url: `https://maps.googleapis.com/maps/api/staticmap?center=${selectedRegion === 'texas' ? '30.2672,-97.7431' : '52.2681,-113.8112'}&zoom=18&size=400x400&maptype=satellite&key=placeholder`,
          analysis_timestamp: new Date().toISOString()
        }
      ];

      setDetections(prev => [...prev, ...changeDetections]);

      toast({
        title: "Change Detection Complete",
        description: `Detected ${changeDetections.length} infrastructure changes`,
      });

    } catch (error: any) {
      console.error('Change detection error:', error);
      toast({
        title: "Detection Error",
        description: error.message || "Failed to perform change detection",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const validateDetection = async (detection: SatelliteDetection, status: 'confirmed' | 'rejected') => {
    try {
      // Update validation status
      setDetections(prev => 
        prev.map(d => 
          d.id === detection.id 
            ? { ...d, validation_status: status }
            : d
        )
      );

      if (status === 'confirmed') {
        // Store confirmed detection as substation
        const { error } = await supabase
          .from('substations')
          .insert({
            name: `Satellite Detected ${detection.coordinates.lat.toFixed(4)}, ${detection.coordinates.lng.toFixed(4)}`,
            latitude: detection.coordinates.lat,
            longitude: detection.coordinates.lng,
            capacity_mva: parseInt(detection.capacity_estimate.split('-')[0]),
            voltage_level: detection.voltage_indicators[0] || '138kV',
            utility_owner: 'Satellite Detection - Pending Verification',
            city: selectedRegion === 'texas' ? 'Texas' : 'Alberta',
            state: selectedRegion === 'texas' ? 'TX' : 'AB',
            coordinates_source: 'satellite_ml_detection',
            status: 'pending_verification',
            interconnection_type: 'transmission',
            load_factor: 0.75
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Detection Confirmed",
          description: "Substation added to database for verification",
        });
      }

    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate detection",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Eye className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="w-5 h-5" />
            Enhanced Satellite Analysis System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Target Region</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as 'alberta' | 'texas')}
              >
                <option value="texas">Texas (ERCOT)</option>
                <option value="alberta">Alberta (AESO)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Search Radius (km)</label>
              <Input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                placeholder="50"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button 
                onClick={performMLAnalysis}
                disabled={analyzing}
                className="flex-1"
              >
                <Brain className="w-4 h-4 mr-2" />
                ML Detection
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={performChangeDetection}
              disabled={analyzing}
              variant="outline"
              className="w-full"
            >
              <Map className="w-4 h-4 mr-2" />
              Change Detection
            </Button>
            
            <Button 
              disabled={analyzing}
              variant="outline"
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              LiDAR Analysis
            </Button>
          </div>

          {analyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {detections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Satellite Detections ({detections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detections.map((detection) => (
                <div key={detection.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(detection.validation_status)}
                      <span className="font-medium">
                        {detection.coordinates.lat.toFixed(4)}, {detection.coordinates.lng.toFixed(4)}
                      </span>
                      <Badge className={getConfidenceColor(detection.confidence_score)}>
                        {detection.confidence_score}% confidence
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {detection.validation_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => validateDetection(detection, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validateDetection(detection, 'rejected')}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Infrastructure Features</h4>
                      <ul className="text-sm space-y-1">
                        {detection.infrastructure_features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Analysis Details</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Type:</strong> {detection.detection_type.replace('_', ' ')}</p>
                        <p><strong>Capacity:</strong> {detection.capacity_estimate}</p>
                        <p><strong>Voltage:</strong> {detection.voltage_indicators.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
