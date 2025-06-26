
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
import { DataManagement } from '@/components/DataManagement';
import { AESOMarket } from '@/components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';
import { IndustryIntelligence } from '@/components/industry_intel/IndustryIntelligence';
import { BTCROIMainPage } from '@/components/btc_roi/BTCROIMainPage';
import EnergyRates from './EnergyRates';
import Settings from './Settings';

export default function Index() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm min-h-[60px]">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-10 w-10 flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-center flex-1 px-2 truncate">VoltScout</h1>
            <div className="w-10 flex-shrink-0" />
          </header>
        )}
        
        <main className="flex-1 overflow-auto w-full">
          <div className="w-full h-full">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="aeso-market" element={<AESOMarket />} />
              <Route path="market-intelligence" element={<AESOMarketIntelligence />} />
              <Route path="energy-rates" element={<EnergyRates />} />
              <Route path="industry-intelligence" element={<IndustryIntelligence />} />
              <Route path="corporate-intelligence" element={<CorporateIntelligence />} />
              <Route path="idle-industry-scanner" element={<IdleIndustryScanner />} />
              <Route path="power-infrastructure" element={<PowerInfrastructure />} />
              <Route path="btc-roi-lab" element={<BTCROIMainPage />} />
              <Route path="data-management" element={<DataManagement />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
