
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Database, RefreshCw, Zap } from 'lucide-react';
import { aesoAPI, AESOResponse } from '@/services/aesoAPI';

const AESO_ENDPOINTS = [
  { value: 'pool-price', label: 'Pool Price', description: 'Current electricity pool prices' },
  { value: 'load-forecast', label: 'Load Forecast', description: 'System load forecasts' },
  { value: 'generation', label: 'Generation', description: 'Current generation mix' },
  { value: 'system-margins', label: 'System Margins', description: 'Operating reserves and margins' },
  { value: 'intertie-flows', label: 'Intertie Flows', description: 'Inter-regional power flows' },
  { value: 'outages', label: 'Outages', description: 'Current system outages' },
  { value: 'supply-adequacy', label: 'Supply Adequacy', description: 'Supply adequacy metrics' },
  { value: 'ancillary-services', label: 'Ancillary Services', description: 'Ancillary services data' },
  { value: 'grid-status', label: 'Grid Status', description: 'Overall grid status' }
];

export function AESOExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('pool-price');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customParams, setCustomParams] = useState<string>('{}');
  const [response, setResponse] = useState<AESOResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let params: Record<string, string> = {};
      
      // Add date parameters for endpoints that support them
      if (['pool-price', 'load-forecast', 'generation'].includes(selectedEndpoint)) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      // Parse custom parameters
      try {
        const customParamsObj = JSON.parse(customParams);
        params = { ...params, ...customParamsObj };
      } catch (e) {
        console.warn('Invalid custom parameters JSON, ignoring:', e);
      }
      
      const result = await aesoAPI.callEndpoint(selectedEndpoint, params);
      setResponse(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'aeso_api':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'fallback':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'emergency_fallback':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const clearCache = () => {
    aesoAPI.clearCache();
    setResponse(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span>AESO API Explorer</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test and debug all AESO API endpoints with live data and fallback handling
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {AESO_ENDPOINTS.map((endpoint) => (
                    <SelectItem key={endpoint.value} value={endpoint.value}>
                      <div>
                        <div className="font-medium">{endpoint.label}</div>
                        <div className="text-xs text-gray-500">{endpoint.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {['pool-price', 'load-forecast', 'generation'].includes(selectedEndpoint) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="customParams">Custom Parameters (JSON)</Label>
              <Input
                id="customParams"
                placeholder='{"param": "value"}'
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleFetchData} disabled={loading}>
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              Fetch Data
            </Button>
            <Button variant="outline" onClick={clearCache}>
              <Database className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>API Response</span>
              <div className="flex space-x-2">
                <Badge className={getSourceBadgeColor(response.source)}>
                  {aesoAPI.getDataSourceLabel(response)}
                </Badge>
                <Badge variant="outline">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {response.error && (
              <Alert className="mb-4">
                <AlertDescription>{response.error}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <div>Endpoint: {response.endpoint}</div>
              <div>Source: {response.source}</div>
              <div>Timestamp: {response.timestamp}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
