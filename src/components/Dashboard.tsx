
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
import { DataManagement } from '@/components/DataManagement';
import { AESOMarket } from '@/components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';
import EnergyRates from '@/pages/EnergyRates';
import EnergyRatesTest from '@/pages/EnergyRatesTest';

export function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if we're at the root dashboard path
  const isDashboardHome = location.pathname === '/app' || location.pathname === '/app/';

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : isCollapsed 
            ? 'ml-16' 
            : 'ml-72'
      }`}>
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">VoltScout</h1>
            <div className="w-9" /> {/* Spacer for alignment */}
          </header>
        )}
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="aeso-market" element={<AESOMarket />} />
            <Route path="aeso-intelligence" element={<AESOMarketIntelligence />} />
            <Route path="energy-rates" element={<EnergyRates />} />
            <Route path="energy-rates-test" element={<EnergyRatesTest />} />
            <Route path="corporate-intelligence" element={<CorporateIntelligence />} />
            <Route path="idle-industry-scanner" element={<IdleIndustryScanner />} />
            <Route path="power-infrastructure" element={<PowerInfrastructure />} />
            <Route path="data-management" element={<DataManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VoltScout Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to your energy market intelligence platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">AESO Market Data</h3>
            <p className="text-gray-600">Real-time Alberta electricity market information</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Energy Rate Calculator</h3>
            <p className="text-gray-600">Calculate comprehensive energy costs</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Market Intelligence</h3>
            <p className="text-gray-600">Advanced analytics and forecasting</p>
          </div>
        </div>
      </div>
    </div>
  );
}
