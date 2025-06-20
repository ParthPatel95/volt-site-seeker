
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, MapPin, Zap, Factory, Eye } from 'lucide-react';
import { IdleIndustrySite, IdleIndustryScanFilters } from './types';

interface IdleIndustryScanResultsProps {
  results: IdleIndustrySite[];
  filters: IdleIndustryScanFilters;
  setFilters: (filters: IdleIndustryScanFilters) => void;
}

export function IdleIndustryScanResults({ 
  results, 
  filters, 
  setFilters 
}: IdleIndustryScanResultsProps) {
  const filteredResults = results.filter(site => {
    return (
      site.idleScore >= filters.minIdleScore &&
      site.estimatedFreeMW >= filters.minFreeMW &&
      site.substationDistanceKm <= filters.maxSubstationDistance
    );
  });

  const getIdleScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-800">Critical ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-orange-100 text-orange-800">High ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium ({score})</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low ({score})</Badge>;
  };

  const getRetrofitCostBadge = (cost: string) => {
    const colors = {
      'L': 'bg-green-100 text-green-800',
      'M': 'bg-yellow-100 text-yellow-800', 
      'H': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[cost as keyof typeof colors]}>{cost}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle className="text-lg">Filter Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Idle Score: {filters.minIdleScore}</label>
            <Slider
              value={[filters.minIdleScore]}
              onValueChange={(value) => setFilters({ ...filters, minIdleScore: value[0] })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Free MW: {filters.minFreeMW}</label>
            <Slider
              value={[filters.minFreeMW]}
              onValueChange={(value) => setFilters({ ...filters, minFreeMW: value[0] })}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Distance to Substation: {filters.maxSubstationDistance}km</label>
            <Slider
              value={[filters.maxSubstationDistance]}
              onValueChange={(value) => setFilters({ ...filters, maxSubstationDistance: value[0] })}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Idle Industrial Sites ({filteredResults.length} of {results.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Idle Score</TableHead>
                  <TableHead>Est. Free MW</TableHead>
                  <TableHead>Substation Dist.</TableHead>
                  <TableHead>Retrofit Cost</TableHead>
                  <TableHead>Strategy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{site.industryCode}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.city}, {site.state}
                    </TableCell>
                    <TableCell>{getIdleScoreBadge(site.idleScore)}</TableCell>
                    <TableCell className="font-mono">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {site.estimatedFreeMW} MW
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.substationDistanceKm.toFixed(1)} km
                      </span>
                    </TableCell>
                    <TableCell>{getRetrofitCostBadge(site.retrofitCostClass)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {site.recommendedStrategy}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
