
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { CapacityAccuracyTips } from './CapacityAccuracyTips';
import { 
  Database, 
  Upload, 
  Search,
  Zap,
  AlertCircle
} from 'lucide-react';

export function EnhancedCapacityEstimator() {
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [advancedInputs, setAdvancedInputs] = useState({
    utilityCompany: '',
    knownVoltage: '',
    substationName: '',
    additionalNotes: '',
    referenceImages: [] as string[]
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { loading, result, estimateCapacity } = useCapacityEstimator();

  const handleAdvancedEstimate = async () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    const enhancedRequest = {
      latitude: lat,
      longitude: lng,
      manualOverride: {
        // Enhanced context for better estimation
        utilityContext: {
          company: advancedInputs.utilityCompany,
          voltage: advancedInputs.knownVoltage,
          name: advancedInputs.substationName,
          notes: advancedInputs.additionalNotes
        }
      }
    };

    await estimateCapacity(enhancedRequest);
  };

  const accuracyScore = result ? result.detectionResults.confidence : 0;
  const hasManualData = !!(advancedInputs.utilityCompany || advancedInputs.knownVoltage);
  const hasPublicData = !!(result?.publicData?.name && !result.publicData.name.includes('Unknown'));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span>Enhanced Capacity Estimator</span>
            <Badge variant="outline">Advanced Analysis</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                placeholder="e.g., 32.7767"
                value={coordinates.lat}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.000001"
                placeholder="e.g., -96.7970"
                value={coordinates.lng}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
              />
            </div>
          </div>

          {/* Advanced Inputs Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Data Sources
            </Button>
          </div>

          {/* Advanced Inputs */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Additional Context (Improves Accuracy)</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="utility">Utility Company</Label>
                  <Input
                    id="utility"
                    placeholder="e.g., Oncor Electric, CenterPoint Energy"
                    value={advancedInputs.utilityCompany}
                    onChange={(e) => setAdvancedInputs(prev => ({ 
                      ...prev, 
                      utilityCompany: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="voltage">Known Voltage Level</Label>
                  <Input
                    id="voltage"
                    placeholder="e.g., 138kV, 345kV"
                    value={advancedInputs.knownVoltage}
                    onChange={(e) => setAdvancedInputs(prev => ({ 
                      ...prev, 
                      knownVoltage: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Substation Name (if known)</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dallas North Substation"
                  value={advancedInputs.substationName}
                  onChange={(e) => setAdvancedInputs(prev => ({ 
                    ...prev, 
                    substationName: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional context about the substation location, recent upgrades, etc."
                  value={advancedInputs.additionalNotes}
                  onChange={(e) => setAdvancedInputs(prev => ({ 
                    ...prev, 
                    additionalNotes: e.target.value 
                  }))}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleAdvancedEstimate}
            disabled={loading || !coordinates.lat || !coordinates.lng}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Analyzing with Enhanced Data...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Enhanced Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Accuracy Tips */}
      {result && (
        <CapacityAccuracyTips
          currentConfidence={accuracyScore}
          hasManualData={hasManualData}
          hasPublicData={hasPublicData}
        />
      )}
    </div>
  );
}
