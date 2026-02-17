
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AESOMarketComprehensive } from '@/components/AESOMarketComprehensive';
import { ERCOTMarketComprehensive } from '@/components/ERCOTMarketComprehensive';
import EnergyRates from './EnergyRates';
import EnergyTrading from './EnergyTrading';
import RegulatoryIntelligence from './RegulatoryIntelligence';
import VoiceSearch from './VoiceSearch';
import RiskManagement from './RiskManagement';
import AdvancedFeatures from './AdvancedFeatures';

import { IntelligenceHub } from '@/components/intelligence-hub/IntelligenceHub';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { BTCROIMainPage } from '@/components/btc_roi/BTCROIMainPage';
import { DataManagement } from '@/components/DataManagement';
import { VoltMarketAnalyticsDashboard } from '@/components/voltmarket/VoltMarketAnalyticsDashboard';
import { VoltMarketAuthProvider } from '@/contexts/VoltMarketAuthContext';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { GlobalSearchInterface } from '@/components/search/GlobalSearchInterface';
import { DocumentManagementSystem } from '@/components/documents/DocumentManagementSystem';
import { AdvancedReportingEngine } from '@/components/reports/AdvancedReportingEngine';
import { UserManagementSystem } from '@/components/users/UserManagementSystem';
import { RealTimeMarketData } from '@/components/realtime/RealTimeMarketData';
import { ExternalAPIIntegrations } from '@/components/integrations/ExternalAPIIntegrations';
import SecureShare from './SecureShare';
import { useAnalytics } from '@/hooks/useAnalytics';
import AESODashboards from './AESODashboards';
import AESODashboard from './AESODashboard';
import SharedDashboardView from './SharedDashboardView';
import { DashboardBuilder } from '@/components/aeso/DashboardBuilder';
import ShareDashboard from './ShareDashboard';
import VoltBuild from './VoltBuild';
import Inventory from './Inventory';

const VoltScout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're in a full-screen module (VoltBuild, SecureShare)
  const isFullScreenModule = location.pathname.startsWith('/app/build') || 
                             location.pathname.startsWith('/app/secure-share') ||
                             location.pathname.startsWith('/app/aeso-market-hub') ||
                             location.pathname.startsWith('/app/ercot-market-hub');
  
  // Initialize analytics tracking
  useAnalytics();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-close mobile sidebar when switching to desktop
      if (!mobile && isOpen) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen]);

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Only show main sidebar when NOT in full-screen module */}
        {!isFullScreenModule && (
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobile={isMobile}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        )}
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isFullScreenModule 
            ? 'ml-0' 
            : isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64 xl:ml-72'
        } min-w-0 overflow-hidden`}>
          {/* Mobile menu button - only show when NOT in full-screen module */}
          {isMobile && !isFullScreenModule && (
            <div className="lg:hidden bg-background border-b border-border px-2 sm:px-3 py-2 safe-area-pt">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 sm:p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          )}
          
          <div className={`flex-1 min-w-0 overflow-auto ${isFullScreenModule ? '' : 'p-2 sm:p-4 lg:p-6'} custom-scrollbar`}>
            <div className={isFullScreenModule ? 'h-full' : 'container-responsive'}>
              <Routes>
               <Route index element={<Dashboard />} />
               <Route path="aeso-market-hub" element={<AESOMarketComprehensive />} />
               <Route path="ercot-market-hub" element={<ERCOTMarketComprehensive />} />
               <Route path="energy-rates" element={<EnergyRates />} />
               <Route path="intelligence-hub" element={<IntelligenceHub />} />
              <Route path="power-infrastructure" element={<PowerInfrastructure />} />
              <Route path="btc-roi-lab" element={<BTCROIMainPage />} />
              <Route path="data-management" element={<DataManagement />} />
              <Route path="analytics" element={
                <VoltMarketAuthProvider>
                  <VoltMarketAnalyticsDashboard />
                </VoltMarketAuthProvider>
              } />
              <Route path="advanced-analytics" element={<AdvancedAnalyticsDashboard />} />
              <Route path="notifications" element={<NotificationCenter />} />
              <Route path="global-search" element={<GlobalSearchInterface />} />
              <Route path="documents" element={<DocumentManagementSystem />} />
              <Route path="reports" element={<AdvancedReportingEngine />} />
              <Route path="users" element={<UserManagementSystem />} />
              <Route path="secure-share" element={<SecureShare />} />
              <Route path="realtime" element={<RealTimeMarketData />} />
              <Route path="integrations" element={<ExternalAPIIntegrations />} />
               <Route path="settings" element={<AdminSettings />} />
               <Route path="energy-trading" element={<EnergyTrading />} />
               <Route path="regulatory-intelligence" element={<RegulatoryIntelligence />} />
               <Route path="voice-search" element={<VoiceSearch />} />
               <Route path="risk-management" element={<RiskManagement />} />
               <Route path="advanced-features" element={<AdvancedFeatures />} />
               <Route path="build" element={<VoltBuild />} />
               <Route path="inventory" element={<Inventory />} />
               <Route path="aeso-dashboards" element={<AESODashboards />} />
               <Route path="aeso-dashboard/:id" element={<AESODashboard />} />
               <Route path="aeso-dashboard-builder/:id" element={<DashboardBuilder />} />
               <Route path="aeso-dashboard-share/:id" element={<ShareDashboard />} />
               <Route path="/shared/:token" element={<SharedDashboardView />} />
               {/* Redirect any unknown paths to dashboard */}
               <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default VoltScout;
