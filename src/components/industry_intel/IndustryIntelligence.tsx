
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              Industry Intelligence
            </h1>
            <p className="text-lg text-gray-600">
              Unified corporate distress & industrial facility intelligence platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {alerts.length} Active Alerts
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Eye className="w-3 h-3 mr-1" />
              {watchlist.length} Watched
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Engine
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Stored Results
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Intelligence Map
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Smart Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analytics
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
