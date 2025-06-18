
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Database, 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Clock
} from 'lucide-react';

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
}

interface SubstationTableProps {
  substations: DiscoveredSubstation[];
  onViewOnMap: (substation: DiscoveredSubstation) => void;
}

export function SubstationTable({ substations, onViewOnMap }: SubstationTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'analyzing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (substations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Discovered Substations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No substations match your current filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Discovered Substations ({substations.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead className="w-[200px]">Location</TableHead>
                <TableHead className="w-[150px]">Coordinates</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">Capacity</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {substations.map((substation) => (
                <TableRow key={substation.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium text-sm">{substation.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {substation.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-mono">
                      {substation.latitude.toFixed(4)}, {substation.longitude.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusColor(substation.analysis_status)} flex items-center space-x-1`}>
                      {getStatusIcon(substation.analysis_status)}
                      <span className="capitalize">{substation.analysis_status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {substation.capacity_estimate ? (
                      <div className="text-sm">
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(substation.capacity_estimate.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOnMap(substation)}
                        className="h-8 w-8 p-0"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://maps.google.com/?q=${substation.latitude},${substation.longitude}`, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
