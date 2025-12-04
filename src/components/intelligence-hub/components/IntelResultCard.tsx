
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Factory, 
  Zap, 
  MapPin, 
  TrendingDown, 
  Bookmark, 
  BookmarkCheck,
  Eye,
  Bell,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IntelOpportunity } from '../types/intelligence-hub.types';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';

interface IntelResultCardProps {
  opportunity: IntelOpportunity;
  onViewDetails?: (opportunity: IntelOpportunity) => void;
}

export function IntelResultCard({ opportunity, onViewDetails }: IntelResultCardProps) {
  const { state, saveOpportunity, removeFromSaved, addToWatchlist } = useIntelligenceHub();
  const isSaved = state.savedOpportunities.some(o => o.id === opportunity.id);
  const isWatched = state.watchlist.includes(opportunity.id);

  const typeConfig = {
    idle_facility: { 
      icon: Factory, 
      label: 'Idle Facility', 
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' 
    },
    distressed_company: { 
      icon: TrendingDown, 
      label: 'Distressed', 
      color: 'bg-red-500/10 text-red-600 border-red-500/30' 
    },
    power_asset: { 
      icon: Zap, 
      label: 'Power Asset', 
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' 
    },
    real_estate: { 
      icon: Building2, 
      label: 'Real Estate', 
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' 
    }
  };

  const config = typeConfig[opportunity.type];
  const Icon = config.icon;

  const confidencePercent = Math.round((opportunity.metrics.confidenceLevel || 0) * 100);
  const location = [opportunity.location.city, opportunity.location.state].filter(Boolean).join(', ');

  return (
    <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                {opportunity.name}
              </h3>
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`text-xs flex-shrink-0 ${config.color}`}>
            {config.label}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {opportunity.metrics.powerCapacityMW && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Power</p>
              <p className="text-sm font-semibold text-foreground">{opportunity.metrics.powerCapacityMW.toFixed(0)} MW</p>
            </div>
          )}
          {(opportunity.metrics.distressScore || opportunity.metrics.idleScore) && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">
                {opportunity.type === 'distressed_company' ? 'Distress' : 'Idle'} Score
              </p>
              <p className="text-sm font-semibold text-foreground">
                {(opportunity.metrics.distressScore || opportunity.metrics.idleScore || 0).toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {/* Confidence Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium text-foreground">{confidencePercent}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                confidencePercent >= 80 ? 'bg-green-500' : 
                confidencePercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        {/* AI Insights Preview */}
        {opportunity.aiInsights && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {opportunity.aiInsights}
          </p>
        )}

        {/* Sources */}
        <div className="flex flex-wrap gap-1 mb-3">
          {opportunity.sources.slice(0, 3).map((source, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
              {source}
            </Badge>
          ))}
          {opportunity.sources.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{opportunity.sources.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => onViewDetails?.(opportunity)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => isSaved ? removeFromSaved(opportunity.id) : saveOpportunity(opportunity.id)}
          >
            {isSaved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => addToWatchlist(opportunity.id)}>
                <Bell className="w-4 h-4 mr-2" />
                {isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
