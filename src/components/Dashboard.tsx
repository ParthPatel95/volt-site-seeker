
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AESOMarket } from './AESOMarket';
import { AESOMarketIntelligence } from './AESOMarketIntelligence';
import { PowerInfrastructure } from './PowerInfrastructure';
import { CorporateIntelligence } from './CorporateIntelligence';
import { DataManagement } from './DataManagement';
import EnergyRates from '@/pages/EnergyRates';
import Settings from '@/pages/Settings';
import { useMobile } from '@/hooks/use-mobile';

interface DashboardOverviewProps {
  children?: React.ReactNode;
}

function DashboardOverview({ children }: DashboardOverviewProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-lg text-gray-600">
          Welcome to VoltScout - Your comprehensive energy intelligence platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Market Analysis</h3>
          <p className="text-gray-600">Real-time AESO market data and intelligence</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Power Infrastructure</h3>
          <p className="text-gray-600">Comprehensive substation and grid analysis</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Corporate Intelligence</h3>
          <p className="text-gray-600">AI-powered company analysis and insights</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Energy Rates</h3>
          <p className="text-gray-600">Advanced rate estimation and forecasting</p>
        </div>
      </div>
      
      {children}
    </div>
  );
}

export function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <main className={`flex-1 overflow-hidden transition-all duration-300 ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-72'
      }`}>
        <div className="h-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/aeso-market" element={<AESOMarket />} />
            <Route path="/aeso-intelligence" element={<AESOMarketIntelligence />} />
            <Route path="/energy-rates" element={<EnergyRates />} />
            <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
            <Route path="/idle-industry-scanner" element={<CorporateIntelligence />} />
            <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
