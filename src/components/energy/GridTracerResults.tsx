
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  Clock,
  Cpu
} from 'lucide-react';
import { GridTracerResults as GridResults, DetectedInfrastructure } from '@/hooks/useGridLineTracer';
import { GridTracerInput } from './GridLineTracer';

interface GridTracerResultsProps {
  results: GridResults;
  input: GridTracerInput;
}

export function GridTracerResults({ results, input }: GridTracerResultsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'congested': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'full': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'congested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Substations</p>
                <p className="text-2xl font-bold">{results.summary.totalSubstations}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transmission Lines</p>
                <p className="text-2xl font-bold">{results.summary.totalTransmissionLines}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grid Health</p>
                <Badge 
                  className={`mt-1 ${
                    results.summary.estimatedGridHealth === 'good' 
                      ? 'bg-green-100 text-green-800' 
                      : results.summary.estimatedGridHealth === 'moderate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {results.summary.estimatedGridHealth}
                </Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confidence</p>
                <p className="text-2xl font-bold">
                  {(results.analysisMetadata.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Infrastructure List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Detected Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.detectedInfrastructure.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {item.type.replace('_', ' ')}
                      </Badge>
                      {item.estimatedCapacity && (
                        <Badge className={getStatusColor(item.estimatedCapacity.status)}>
                          {getStatusIcon(item.estimatedCapacity.status)}
                          <span className="ml-1">{item.estimatedCapacity.status}</span>
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {(item.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      {item.properties?.name && (
                        <div>
                          <span className="font-medium">Name:</span> {item.properties.name}
                        </div>
                      )}
                      {item.properties?.voltage && (
                        <div>
                          <span className="font-medium">Voltage:</span> {item.properties.voltage}
                        </div>
                      )}
                      {item.properties?.circuits && (
                        <div>
                          <span className="font-medium">Circuits:</span> {item.properties.circuits}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Distance:</span> {formatDistance(item.properties?.distance)}
                      </div>
                      {item.estimatedCapacity && (
                        <div>
                          <span className="font-medium">Est. Capacity:</span> {item.estimatedCapacity.tier}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Coordinates:</span> 
                        {item.coordinates[1].toFixed(4)}, {item.coordinates[0].toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Analysis Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Scan Parameters:</p>
              <ul className="space-y-1 text-gray-600">
                <li>Center: {results.scanArea.center[1].toFixed(4)}, {results.scanArea.center[0].toFixed(4)}</li>
                <li>Radius: {results.scanArea.radius} km</li>
                <li>Auto Trace: {input.autoTrace ? 'Enabled' : 'Disabled'}</li>
                {input.targetSite && <li>Target Site: {input.targetSite}</li>}
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-1">Analysis Metadata:</p>
              <ul className="space-y-1 text-gray-600">
                <li>Timestamp: {new Date(results.analysisMetadata.scanTimestamp).toLocaleString()}</li>
                <li>Imagery Source: {results.analysisMetadata.satelliteImagerySource}</li>
                <li>AI Models: {results.analysisMetadata.aiModelsUsed.join(', ')}</li>
                <li>Overall Confidence: {(results.analysisMetadata.confidenceScore * 100).toFixed(1)}%</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Analysis Confidence</span>
              <span className="text-sm text-gray-600">
                {(results.analysisMetadata.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={results.analysisMetadata.confidenceScore * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
