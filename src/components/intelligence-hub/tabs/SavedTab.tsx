
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  Search, 
  Download, 
  Trash2, 
  Filter,
  SortAsc,
  Grid3X3,
  List,
  FileText
} from 'lucide-react';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';
import { IntelResultCard } from '../components/IntelResultCard';
import { IntelOpportunity, OpportunityType } from '../types/intelligence-hub.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SavedTab() {
  const { state, removeFromSaved } = useIntelligenceHub();
  const { savedOpportunities } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<OpportunityType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'power'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort
  const filteredOpportunities = savedOpportunities
    .filter(opp => {
      const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.location.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || opp.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'power':
          return (b.metrics.powerCapacityMW || 0) - (a.metrics.powerCapacityMW || 0);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalMW = savedOpportunities.reduce((sum, o) => sum + (o.metrics.powerCapacityMW || 0), 0);

  const handleExport = () => {
    const csv = [
      ['Name', 'Type', 'City', 'State', 'Power (MW)', 'Confidence', 'Sources'].join(','),
      ...filteredOpportunities.map(o => [
        `"${o.name}"`,
        o.type,
        o.location.city || '',
        o.location.state || '',
        o.metrics.powerCapacityMW || '',
        Math.round((o.metrics.confidenceLevel || 0) * 100) + '%',
        `"${o.sources.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligence-hub-saved-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total Saved</p>
          <p className="text-2xl font-bold text-foreground">{savedOpportunities.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total Capacity</p>
          <p className="text-2xl font-bold text-foreground">{totalMW.toFixed(0)} MW</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Idle Facilities</p>
          <p className="text-2xl font-bold text-foreground">
            {savedOpportunities.filter(o => o.type === 'idle_facility').length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Distressed</p>
          <p className="text-2xl font-bold text-foreground">
            {savedOpportunities.filter(o => o.type === 'distressed_company').length}
          </p>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search saved opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as OpportunityType | 'all')}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="idle_facility">Idle Facility</SelectItem>
                <SelectItem value="distressed_company">Distressed</SelectItem>
                <SelectItem value="power_asset">Power Asset</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'name' | 'power')}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="power">Power (MW)</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Export */}
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={filteredOpportunities.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredOpportunities.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
        }>
          {filteredOpportunities.map((opportunity) => (
            viewMode === 'grid' ? (
              <IntelResultCard key={opportunity.id} opportunity={opportunity} />
            ) : (
              <ListItem key={opportunity.id} opportunity={opportunity} onRemove={removeFromSaved} />
            )
          ))}
        </div>
      ) : savedOpportunities.length > 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Matches Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bookmark className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Saved Opportunities</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Save opportunities from the Discover tab to build your pipeline here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ListItemProps {
  opportunity: IntelOpportunity;
  onRemove: (id: string) => void;
}

function ListItem({ opportunity, onRemove }: ListItemProps) {
  const location = [opportunity.location.city, opportunity.location.state].filter(Boolean).join(', ');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{opportunity.name}</h3>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {opportunity.type.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {location && <span>{location}</span>}
              {opportunity.metrics.powerCapacityMW && (
                <span>{opportunity.metrics.powerCapacityMW} MW</span>
              )}
              <span>
                {Math.round((opportunity.metrics.confidenceLevel || 0) * 100)}% confidence
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => onRemove(opportunity.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
