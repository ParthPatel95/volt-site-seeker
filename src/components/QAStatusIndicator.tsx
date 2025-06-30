
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Clock, Wifi, WifiOff, Shield, Zap } from 'lucide-react';

interface QAMetrics {
  endpoint_used: string;
  response_time_ms: number;
  data_quality: 'fresh' | 'moderate' | 'stale' | 'simulated' | 'unknown';
  validation_passed: boolean;
  raw_data_sample?: any;
  network_issue?: string;
}

interface QAStatusIndicatorProps {
  source: 'aeso_api' | 'fallback';
  qaMetrics?: QAMetrics;
  qaStatus?: string;
  timestamp?: string;
  networkInfo?: {
    deno_runtime?: boolean;
    endpoints_tried?: string[];
    fallback_reason?: string;
  };
}

export function QAStatusIndicator({ source, qaMetrics, qaStatus, timestamp, networkInfo }: QAStatusIndicatorProps) {
  const getStatusIcon = () => {
    if (source === 'fallback') {
      if (qaStatus?.includes('network') || qaStatus?.includes('deno')) {
        return <WifiOff className="w-4 h-4 text-orange-500" />;
      }
      return <Shield className="w-4 h-4 text-yellow-500" />;
    }
    
    if (qaMetrics?.validation_passed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (source === 'fallback') {
      if (qaStatus?.includes('deno_network')) {
        return 'Network Connectivity Issue';
      }
      if (qaStatus?.includes('auth')) {
        return 'Authentication Issue';
      }
      return 'Simulated Data Mode';
    }
    
    if (qaMetrics?.validation_passed) {
      return 'Live AESO Data - Verified';
    }
    
    return 'Live Data - Validation Issues';
  };

  const getDataQualityBadge = () => {
    if (!qaMetrics) return null;
    
    const qualityColors = {
      fresh: 'bg-green-100 text-green-800 border-green-300',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      stale: 'bg-red-100 text-red-800 border-red-300',
      simulated: 'bg-orange-100 text-orange-800 border-orange-300',
      unknown: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    return (
      <Badge variant="outline" className={`${qualityColors[qaMetrics.data_quality]} font-medium`}>
        <Clock className="w-3 h-3 mr-1" />
        {qaMetrics.data_quality === 'simulated' ? 'Simulated' : qaMetrics.data_quality}
      </Badge>
    );
  };

  const getConnectionColor = () => {
    if (source === 'aeso_api') return 'border-l-green-500 bg-green-50';
    if (qaStatus?.includes('network') || qaStatus?.includes('deno')) {
      return 'border-l-orange-500 bg-orange-50';
    }
    return 'border-l-yellow-500 bg-yellow-50';
  };

  const getNetworkIssueDescription = () => {
    if (qaStatus?.includes('deno_network')) {
      return 'Deno runtime network connectivity issue - likely IP blocking or TLS handshake failure';
    }
    if (qaStatus?.includes('auth')) {
      return 'AESO API authentication issue - check API key configuration';
    }
    if (networkInfo?.fallback_reason === 'network_connectivity_issue') {
      return 'Network connectivity problem with AESO servers';
    }
    return null;
  };

  return (
    <Card className={`mb-4 border-l-4 ${getConnectionColor()}`}>
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
            {qaStatus && <div>QA Status: {qaStatus}</div>}
          </div>
        )}

        {/* Network issue details */}
        {networkInfo && (
          <div className="mt-2 text-xs text-muted-foreground">
            {networkInfo.deno_runtime && <div>Runtime: Deno Edge Function</div>}
            {networkInfo.endpoints_tried && (
              <div>Endpoints tried: {networkInfo.endpoints_tried.join(', ')}</div>
            )}
          </div>
        )}
        
        {/* Enhanced status messages */}
        {source === 'fallback' && qaStatus?.includes('deno_network') && (
          <div className="mt-2 text-sm text-orange-700 bg-orange-100 p-2 rounded border border-orange-200">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <strong>Network Connectivity Issue</strong>
            </div>
            <div className="text-xs mt-1">
              AESO may be blocking cloud provider IPs or there's a TLS handshake failure. Using high-quality simulated data.
            </div>
          </div>
        )}

        {source === 'fallback' && qaStatus?.includes('auth') && (
          <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded border border-red-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <strong>Authentication Issue</strong>
            </div>
            <div className="text-xs mt-1">
              AESO API key may be invalid or expired. Check API key configuration.
            </div>
          </div>
        )}

        {source === 'fallback' && !qaStatus?.includes('network') && !qaStatus?.includes('auth') && (
          <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 p-2 rounded border border-yellow-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <strong>Simulated Data Mode</strong>
            </div>
            <div className="text-xs mt-1">
              Using realistic simulated data with time-varying patterns. Check AESO API key for live data.
            </div>
          </div>
        )}

        {source === 'aeso_api' && qaMetrics?.validation_passed && (
          <div className="mt-2 text-sm text-green-700 bg-green-100 p-2 rounded border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <strong>Live AESO Connection Active</strong>
            </div>
            <div className="text-xs mt-1">
              Successfully connected to AESO API - Real-time data confirmed!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
