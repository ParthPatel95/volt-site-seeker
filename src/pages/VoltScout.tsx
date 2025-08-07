
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AESOMarketComprehensive } from '@/components/AESOMarketComprehensive';
import { EnergyRateIntelligence } from '@/components/energy/EnergyRateIntelligence';
import { IndustryIntelligence } from '@/components/industry_intel/IndustryIntelligence';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
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
import { BottomNavigationWrapper } from '@/components/BottomNavigationWrapper';

const VoltScout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64 xl:ml-72'
        } min-w-0 overflow-hidden`}>
          {/* Mobile menu button with better touch target */}
          {isMobile && (
            <div className="lg:hidden bg-background border-b border-border px-2 sm:px-3 py-2 safe-area-pt">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 sm:p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex-1 min-w-0 overflow-auto p-2 sm:p-4 lg:p-6 custom-scrollbar">
            <div className="container-responsive">
              <Routes>
              <Route index element={<Dashboard />} />
              <Route path="aeso-market-hub" element={<AESOMarketComprehensive />} />
              <Route path="energy-rates" element={<EnergyRateIntelligence />} />
              <Route path="industry-intelligence" element={<IndustryIntelligence />} />
              <Route path="corporate-intelligence" element={<CorporateIntelligence />} />
              <Route path="idle-industry-scanner" element={<IdleIndustryScanner />} />
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
              <Route path="realtime" element={<RealTimeMarketData />} />
              <Route path="integrations" element={<ExternalAPIIntegrations />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Redirect any unknown paths to dashboard */}
              <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </div>
          </div>
          
          {/* Bottom navigation for mobile */}
          {isMobile && <BottomNavigationWrapper />}
        </div>
      </div>
    </AuthWrapper>
  );
};

export default VoltScout;
