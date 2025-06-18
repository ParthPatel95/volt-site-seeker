
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Database, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';

interface CapacityAccuracyTipsProps {
  currentConfidence: number;
  hasManualData: boolean;
  hasPublicData: boolean;
}

export function CapacityAccuracyTips({ 
  currentConfidence, 
  hasManualData, 
  hasPublicData 
}: CapacityAccuracyTipsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const improvements = [
    {
      title: "Manual Input Override",
      description: "Provide known transformer count, capacity, or substation type",
      impact: "High",
      implemented: hasManualData,
      icon: Target
    },
    {
      title: "Cross-Reference Public Data",
      description: "Validate against utility databases and FERC records",
      impact: "High", 
      implemented: hasPublicData,
      icon: Database
    },
    {
      title: "Multiple Coordinate Sources",
      description: "Use precise GPS coordinates from utility records",
      impact: "Medium",
      implemented: false,
      icon: MapPin
    },
    {
      title: "Historical Load Analysis",
      description: "Analyze power consumption patterns in the area",
      impact: "Medium",
      implemented: false,
      icon: TrendingUp
    },
    {
      title: "Multi-angle Satellite Views",
      description: "Analyze multiple satellite images and seasons",
      impact: "Medium",
      implemented: false,
      icon: Eye
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Accuracy Improvements</span>
          <Badge className={getConfidenceColor(currentConfidence)}>
            {currentConfidence}% Confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Current estimation based on satellite imagery analysis. 
            Accuracy can be significantly improved with additional data sources.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recommended Improvements:</h4>
          {improvements.map((improvement, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <improvement.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{improvement.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {improvement.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={improvement.impact === 'High' ? 'destructive' : 'secondary'}>
                  {improvement.impact}
                </Badge>
                {improvement.implemented ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Pro Tip: Combine Multiple Sources
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            The most accurate estimates combine satellite analysis, public utility data, 
            manual verification, and local utility records. Consider reaching out to 
            utility companies for verified capacity information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
