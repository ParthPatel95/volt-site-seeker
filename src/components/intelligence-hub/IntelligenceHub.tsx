
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      {/* Header with Stats */}
      <IntelHubHeader />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 mb-4 sm:mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-3 text-xs sm:text-sm relative"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[10px]">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 sm:static sm:ml-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="discover" className="mt-0">
          <DiscoverTab />
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <MapTab />
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          <AnalysisTab />
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <AlertsTab />
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
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
