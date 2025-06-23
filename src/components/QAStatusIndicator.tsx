
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface QAMetrics {
  endpoint_used: string;
  response_time_ms: number;
  data_quality: 'fresh' | 'moderate' | 'stale' | 'unknown';
  validation_passed: boolean;
}

interface QAStatusIndicatorProps {
  source: 'aeso_api' | 'fallback';
  qaMetrics?: QAMetrics;
  qaStatus?: string;
  timestamp?: string;
}

export function QAStatusIndicator({ source, qaMetrics, qaStatus, timestamp }: QAStatusIndicatorProps) {
  const getStatusIcon = () => {
    if (source === 'fallback') {
      return <WifiOff className="w-4 h-4 text-yellow-500" />;
    }
    
    if (qaMetrics?.validation_passed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (source === 'fallback') {
      return 'Simulated Data';
    }
    
    if (qaMetrics?.validation_passed) {
      return 'Live AESO Data - Verified';
    }
    
    return 'Live Data - Validation Issues';
  };

  const getDataQualityBadge = () => {
    if (!qaMetrics) return null;
    
    const qualityColors = {
      fresh: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      stale: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="outline" className={qualityColors[qaMetrics.data_quality]}>
        <Clock className="w-3 h-3 mr-1" />
        {qaMetrics.data_quality}
      </Badge>
    );
  };

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
            {getDataQualityBadge()}
          </div>
          
          {qaMetrics && (
            <div className="text-sm text-muted-foreground">
              Response: {qaMetrics.response_time_ms}ms
            </div>
          )}
        </div>
        
        {qaMetrics && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div>Endpoint: {qaMetrics.endpoint_used}</div>
            <div>Last updated: {timestamp ? new Date(timestamp).toLocaleTimeString() : 'Unknown'}</div>
          </div>
        )}
        
        {source === 'fallback' && (
          <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
            Using simulated data. Check AESO API key configuration for live data.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
