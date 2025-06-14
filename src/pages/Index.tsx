
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import Sidebar from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { PropertyMap } from '@/components/PropertyMap';
import { PropertyList } from '@/components/PropertyList';
import { AlertsPanel } from '@/components/AlertsPanel';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { DataManagement } from '@/components/DataManagement';
import { Auth } from '@/components/Auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedPropertyMap } from '@/components/EnhancedPropertyMap';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { MultiSourceScraper } from '@/components/MultiSourceScraper';
import { EnergyRateIntelligence } from '@/components/energy/EnergyRateIntelligence';
import { Routes, Route } from 'react-router-dom';

const Index = () => {
  const { user, session, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-5 h-5 bg-white rounded"></div>
          </div>
          <p className="text-muted-foreground">Loading VoltScout...</p>
        </div>
      </div>
    );
  }

  // Show auth if not authenticated - this is the critical protection
  if (!user || !session) {
    return <Auth onAuthStateChange={() => {}} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<EnhancedPropertyMap />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/scraper" element={<MultiSourceScraper />} />
            <Route path="/energy-rates" element={<EnergyRateIntelligence />} />
            <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
            <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
            <Route path="/alerts" element={<AlertsPanel />} />
            <Route path="/data-management" element={<DataManagement />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
