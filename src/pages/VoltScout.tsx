
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AESOMarket } from '@/components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';
import { EnergyRateIntelligence } from '@/components/energy/EnergyRateIntelligence';
import { IndustryIntelligence } from '@/components/industry_intel/IndustryIntelligence';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { BTCROIMainPage } from '@/components/btc_roi/BTCROIMainPage';
import { DataManagement } from '@/components/DataManagement';

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
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64 sm:ml-72'
        } overflow-hidden`}>
          {/* Mobile menu button */}
          {isMobile && (
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/aeso-market" element={<AESOMarket />} />
              <Route path="/market-intelligence" element={<AESOMarketIntelligence />} />
              <Route path="/energy-rates" element={<EnergyRateIntelligence />} />
              <Route path="/industry-intelligence" element={<IndustryIntelligence />} />
              <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
              <Route path="/idle-industry-scanner" element={<IdleIndustryScanner />} />
              <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
              <Route path="/btc-roi-lab" element={<BTCROIMainPage />} />
              <Route path="/data-management" element={<DataManagement />} />
              <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings page coming soon...</p></div>} />
              {/* Redirect any unknown paths to dashboard */}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default VoltScout;
