
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Factory,
  Zap,
  TrendingDown,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Bell,
  FileText,
  Brain,
  ExternalLink,
  Calendar,
  Target,
  DollarSign,
  Shield
} from 'lucide-react';
import { IntelOpportunity } from '../types/intelligence-hub.types';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';

interface IntelDetailsModalProps {
  opportunity: IntelOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntelDetailsModal({ opportunity, open, onOpenChange }: IntelDetailsModalProps) {
  const { state, saveOpportunity, removeFromSaved, addToWatchlist } = useIntelligenceHub();
  const [activeTab, setActiveTab] = useState('overview');

  if (!opportunity) return null;

  const isSaved = state.savedOpportunities.some(o => o.id === opportunity.id);
  const isWatched = state.watchlist.includes(opportunity.id);

  const typeConfig = {
    idle_facility: { icon: Factory, label: 'Idle Facility', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
    distressed_company: { icon: TrendingDown, label: 'Distressed Company', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
    power_asset: { icon: Zap, label: 'Power Asset', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    real_estate: { icon: Building2, label: 'Real Estate', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' }
  };

  const config = typeConfig[opportunity.type];
  const Icon = config.icon;
  const confidencePercent = Math.round((opportunity.metrics.confidenceLevel || 0) * 100);
  const location = [opportunity.location.address, opportunity.location.city, opportunity.location.state].filter(Boolean).join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">{opportunity.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={config.color}>{config.label}</Badge>
                  <Badge variant="secondary" className={confidencePercent >= 80 ? 'bg-green-500/10 text-green-600' : ''}>
                    {confidencePercent}% confidence
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={() => isSaved ? removeFromSaved(opportunity.id) : saveOpportunity(opportunity.id)}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant={isWatched ? "default" : "outline"}
                size="sm"
                onClick={() => addToWatchlist(opportunity.id)}
              >
                <Bell className="w-4 h-4 mr-2" />
                {isWatched ? 'Watching' : 'Watch'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Location */}
            {location && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{location}</p>
                      {opportunity.location.coordinates && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {opportunity.location.coordinates.lat.toFixed(4)}, {opportunity.location.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            {opportunity.aiInsights && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">AI Analysis</p>
                      <p className="text-sm text-muted-foreground mt-1">{opportunity.aiInsights}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Industry Info */}
            {(opportunity.industryType || opportunity.naicsCode) && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Industry</p>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.industryType}
                        {opportunity.naicsCode && ` (NAICS: ${opportunity.naicsCode})`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Strategy */}
            {opportunity.recommendedStrategy && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Recommended Strategy</p>
                      <p className="text-sm text-muted-foreground mt-1">{opportunity.recommendedStrategy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {opportunity.metrics.powerCapacityMW && (
                <MetricCard
                  icon={Zap}
                  label="Power Capacity"
                  value={`${opportunity.metrics.powerCapacityMW.toFixed(0)} MW`}
                  color="blue"
                />
              )}
              <MetricCard
                icon={Target}
                label="Confidence Level"
                value={`${confidencePercent}%`}
                color={confidencePercent >= 80 ? 'green' : confidencePercent >= 60 ? 'yellow' : 'red'}
              />
              {opportunity.metrics.distressScore !== undefined && (
                <MetricCard
                  icon={TrendingDown}
                  label="Distress Score"
                  value={`${opportunity.metrics.distressScore.toFixed(0)}%`}
                  color="red"
                />
              )}
              {opportunity.metrics.idleScore !== undefined && (
                <MetricCard
                  icon={Factory}
                  label="Idle Score"
                  value={`${opportunity.metrics.idleScore.toFixed(0)}%`}
                  color="yellow"
                />
              )}
              {opportunity.metrics.substationDistanceKm !== undefined && (
                <MetricCard
                  icon={MapPin}
                  label="Substation Distance"
                  value={`${opportunity.metrics.substationDistanceKm.toFixed(1)} km`}
                  color="purple"
                />
              )}
              {opportunity.metrics.facilitySize !== undefined && (
                <MetricCard
                  icon={Building2}
                  label="Facility Size"
                  value={`${opportunity.metrics.facilitySize.toLocaleString()} sqft`}
                  color="purple"
                />
              )}
              {opportunity.marketCap !== undefined && (
                <MetricCard
                  icon={DollarSign}
                  label="Market Cap"
                  value={`$${(opportunity.marketCap / 1e9).toFixed(2)}B`}
                  color="green"
                />
              )}
              {opportunity.retrofitCostClass && (
                <MetricCard
                  icon={Shield}
                  label="Retrofit Cost"
                  value={opportunity.retrofitCostClass}
                  color="purple"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="sources" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Data aggregated from {opportunity.sources.length} sources:</p>
            {opportunity.sources.map((source, i) => (
              <Card key={i}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{source}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="mt-4 space-y-3">
            <Button className="w-full" variant="default">
              <FileText className="w-4 h-4 mr-2" />
              Generate Due Diligence Report
            </Button>
            <Button className="w-full" variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Google Maps
            </Button>
            <Button className="w-full" variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              Run Deep Analysis
            </Button>
          </TabsContent>
        </Tabs>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created: {new Date(opportunity.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Updated: {new Date(opportunity.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'yellow' | 'red' | 'green' | 'purple';
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    red: 'bg-red-500/10 text-red-600',
    green: 'bg-green-500/10 text-green-600',
    purple: 'bg-purple-500/10 text-purple-600'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
