
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Eye, 
  MapPin, 
  Building, 
  Zap, 
  Calendar, 
  DollarSign,
  TrendingDown,
  Factory,
  AlertTriangle
} from 'lucide-react';
import { EnhancedMapboxMap } from '../EnhancedMapboxMap';
import { getStoredIntelResults, updateIntelResultStatus } from './hooks/industryIntelService';
import { StoredIntelResult } from './hooks/types';

export function IndustryIntelResultsViewer() {
  const [results, setResults] = useState<StoredIntelResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<StoredIntelResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    const data = await getStoredIntelResults();
    setResults(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: 'active' | 'closed' | 'monitoring') => {
    const success = await updateIntelResultStatus(id, status);
    if (success) {
      setResults(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distressed': return <TrendingDown className="w-4 h-4" />;
      case 'idle': return <Factory className="w-4 h-4" />;
      case 'corporate': return <Building className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'distressed': return 'destructive';
      case 'idle': return 'secondary';
      case 'corporate': return 'default';
      default: return 'outline';
    }
  };

  const parseCoordinates = (coordinates: any): [number, number] | undefined => {
    if (!coordinates) return undefined;
    
    const coordStr = String(coordinates);
    const match = coordStr.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]
    }
    
    return undefined;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading stored results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Stored Intelligence Results
            <Badge variant="outline" className="ml-auto">
              {results.length} Total Results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">Run an intelligence scan to see results here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Power (MW)</TableHead>
                  <TableHead>Distress Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(result.opportunity_type) as any} className="flex items-center gap-1 w-fit">
                        {getTypeIcon(result.opportunity_type)}
                        {result.opportunity_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.city && result.state ? `${result.city}, ${result.state}` : result.address || 'Location not specified'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Zap className="w-3 h-3" />
                        {result.estimated_power_mw}MW
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-red-500" 
                            style={{ width: `${result.distress_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{result.distress_score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={result.status}
                        onChange={(e) => handleStatusUpdate(result.id, e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="closed">Closed</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getTypeIcon(result.opportunity_type)}
                              {result.name}
                              <Badge variant={getTypeColor(result.opportunity_type) as any}>
                                {result.opportunity_type}
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>
                          {selectedResult && <DetailedResultView result={selectedResult} />}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailedResultView({ result }: { result: StoredIntelResult }) {
  const coordinates = parseCoordinates(result.coordinates);
  const details = result.opportunity_details || {};

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-lg font-semibold">{result.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Type</label>
            <p className="capitalize">{result.opportunity_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Address</label>
            <p>{result.address || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">City, State</label>
            <p>{result.city && result.state ? `${result.city}, ${result.state}` : 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">ZIP Code</label>
            <p>{result.zip_code || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Coordinates</label>
            <p>{coordinates ? `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}` : 'Not available'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Power & Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Power & Financial Data
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Estimated Power (MW)</label>
            <p className="text-lg font-semibold">{result.estimated_power_mw} MW</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Distress Score</label>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-red-500" 
                  style={{ width: `${result.distress_score}%` }}
                ></div>
              </div>
              <span className="font-semibold">{result.distress_score}/100</span>
            </div>
          </div>
          {details.listingPrice && (
            <div>
              <label className="text-sm font-medium text-gray-600">Listing Price</label>
              <p className="text-lg font-semibold flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {details.listingPrice.toLocaleString()}
              </p>
            </div>
          )}
          {details.pricePerSqft && (
            <div>
              <label className="text-sm font-medium text-gray-600">Price per Sq Ft</label>
              <p className="font-semibold">${details.pricePerSqft}/sq ft</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {result.ai_insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{result.ai_insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.data_sources.map((source, index) => (
              <Badge key={index} variant="outline">{source}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      {coordinates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              <EnhancedMapboxMap
                height="h-96"
                initialCenter={[coordinates[1], coordinates[0]]}
                initialZoom={15}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Details */}
      {Object.keys(details).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(details).map(([key, value]) => (
                value !== null && value !== undefined && (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const parseCoordinates = (coordinates: any): [number, number] | undefined => {
  if (!coordinates) return undefined;
  
  const coordStr = String(coordinates);
  const match = coordStr.match(/\(([^,]+),([^)]+)\)/);
  if (match) {
    return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]
  }
  
  return undefined;
};
