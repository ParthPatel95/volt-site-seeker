
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Filter, MapPin, Zap, Factory, Eye } from 'lucide-react';
import { IdleIndustrySite, IdleIndustryScanFilters } from './types';
import { IdleIndustrySiteDetailsModal } from './IdleIndustrySiteDetailsModal';

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
  const [selectedSite, setSelectedSite] = React.useState<IdleIndustrySite | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

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

  const handleViewDetails = (site: IdleIndustrySite) => {
    setSelectedSite(site);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle className="text-lg">Filter Real Industrial Sites</CardTitle>
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
            Real Industrial Sites ({filteredResults.length} of {results.length})
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{site.name}</div>
                        {site.operationalStatus && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {site.operationalStatus}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{site.naicsCode}</Badge>
                        <div className="text-xs text-gray-600 mt-1">{site.industryType}</div>
                      </div>
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
                        {site.recommendedStrategy.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(site)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <IdleIndustrySiteDetailsModal
        site={selectedSite}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  );
}
