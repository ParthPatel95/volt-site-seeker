import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Brain, Bell, Bookmark } from 'lucide-react';
import { IntelHubProvider, useIntelligenceHub } from './hooks/useIntelligenceHub';
import { IntelHubHeader } from './components/IntelHubHeader';
import { DiscoverTab } from './tabs/DiscoverTab';
import { MapTab } from './tabs/MapTab';
import { AnalysisTab } from './tabs/AnalysisTab';
import { AlertsTab } from './tabs/AlertsTab';
import { SavedTab } from './tabs/SavedTab';
import { cn } from '@/lib/utils';

function IntelligenceHubContent() {
  const { state, setActiveTab } = useIntelligenceHub();
  const { activeTab, alerts, savedOpportunities } = state;

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const tabs = [
    { id: 'discover', label: 'Discover', icon: Search, badge: null },
    { id: 'map', label: 'Map', icon: MapPin, badge: null },
    { id: 'analysis', label: 'Analysis', icon: Brain, badge: null },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : null },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedOpportunities.length > 0 ? savedOpportunities.length : null },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl animate-fade-in">
      {/* Header with Stats */}
      <IntelHubHeader />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 mb-4 sm:mb-6">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-5 h-auto p-1 bg-muted/50 border border-border rounded-xl">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground',
                    'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="discover" className="mt-0 focus-visible:outline-none">
          <DiscoverTab />
        </TabsContent>

        <TabsContent value="map" className="mt-0 focus-visible:outline-none">
          <MapTab />
        </TabsContent>

        <TabsContent value="analysis" className="mt-0 focus-visible:outline-none">
          <AnalysisTab />
        </TabsContent>

        <TabsContent value="alerts" className="mt-0 focus-visible:outline-none">
          <AlertsTab />
        </TabsContent>

        <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
          <SavedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function IntelligenceHub() {
  return (
    <IntelHubProvider>
      <IntelligenceHubContent />
    </IntelHubProvider>
  );
}
