
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Search, MapPin, AlertTriangle, Eye, Brain, Target, Zap, Database } from 'lucide-react';
import { IndustryIntelSearchEngine } from './IndustryIntelSearchEngine';
import { IndustryIntelMap } from './IndustryIntelMap';
import { IndustryIntelDashboard } from './IndustryIntelDashboard';
import { IndustryIntelAlerts } from './IndustryIntelAlerts';
import { IndustryIntelAnalytics } from './IndustryIntelAnalytics';
import { IndustryIntelResultsViewer } from './IndustryIntelResultsViewer';

export function IndustryIntelligence() {
  const [activeOpportunities, setActiveOpportunities] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              <span className="leading-tight">Industry Intelligence</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              Unified corporate distress & industrial facility intelligence platform
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{alerts.length} Active Alerts</span>
              <span className="sm:hidden">{alerts.length} Alerts</span>
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
              <Eye className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{watchlist.length} Watched</span>
              <span className="sm:hidden">{watchlist.length} Watch</span>
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1">
            <TabsTrigger value="search" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Search Engine</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Stored Results</span>
              <span className="sm:hidden">Results</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Intelligence Map</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Opportunities</span>
              <span className="sm:hidden">Opps</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Smart Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">AI Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <IndustryIntelSearchEngine 
              onOpportunitiesFound={setActiveOpportunities}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <IndustryIntelResultsViewer />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <IndustryIntelMap 
              opportunities={activeOpportunities}
              watchlist={watchlist}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <IndustryIntelDashboard 
              opportunities={activeOpportunities}
              watchlist={watchlist}
              onWatchlistUpdate={setWatchlist}
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <IndustryIntelAlerts 
              alerts={alerts}
              onAlertsUpdate={setAlerts}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <IndustryIntelAnalytics 
              opportunities={activeOpportunities}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
