
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Menu, Home, Zap, Building2, Factory, Database, Brain, Bitcoin, Target, BarChart3, TrendingUp } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
import { DataManagement } from '@/components/DataManagement';
import { AESOMarket } from '@/components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';
import { BTCROIMainPage } from '@/components/btc_roi/BTCROIMainPage';
import EnergyRates from './EnergyRates';

export default function Index() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const bottomNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      onClick: () => navigate('/app'),
      active: location.pathname === '/app'
    },
    {
      id: 'aeso-market',
      label: 'AESO',
      icon: Zap,
      onClick: () => navigate('/app/aeso-market'),
      active: location.pathname === '/app/aeso-market'
    },
    {
      id: 'market-intelligence',
      label: 'Market Intel',
      icon: Brain,
      onClick: () => navigate('/app/market-intelligence'),
      active: location.pathname === '/app/market-intelligence'
    },
    {
      id: 'energy-rates',
      label: 'Energy Rates',
      icon: BarChart3,
      onClick: () => navigate('/app/energy-rates'),
      active: location.pathname === '/app/energy-rates'
    },
    {
      id: 'industry-intelligence',
      label: 'Industry Intel',
      icon: TrendingUp,
      onClick: () => navigate('/app/industry-intelligence'),
      active: location.pathname === '/app/industry-intelligence'
    },
    {
      id: 'corporate',
      label: 'Corporate',
      icon: Building2,
      onClick: () => navigate('/app/corporate-intelligence'),
      active: location.pathname === '/app/corporate-intelligence'
    },
    {
      id: 'idle-scanner',
      label: 'Scanner',
      icon: Target,
      onClick: () => navigate('/app/idle-industry-scanner'),
      active: location.pathname === '/app/idle-industry-scanner'
    },
    {
      id: 'power',
      label: 'Power',
      icon: Factory,
      onClick: () => navigate('/app/power-infrastructure'),
      active: location.pathname === '/app/power-infrastructure'
    },
    {
      id: 'btc-roi',
      label: 'BTC ROI',
      icon: Bitcoin,
      onClick: () => navigate('/app/btc-roi-lab'),
      active: location.pathname === '/app/btc-roi-lab'
    },
    {
      id: 'data',
      label: 'Data',
      icon: Database,
      onClick: () => navigate('/app/data-management'),
      active: location.pathname === '/app/data-management'
    }
  ];

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
            <div className="w-9" />
          </header>
        )}
        
        <main className={`flex-1 overflow-auto ${isMobile ? 'pb-16' : ''}`}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="aeso-market" element={<AESOMarket />} />
            <Route path="market-intelligence" element={<AESOMarketIntelligence />} />
            <Route path="energy-rates" element={<EnergyRates />} />
            <Route path="industry-intelligence" element={<AESOMarketIntelligence />} />
            <Route path="corporate-intelligence" element={<CorporateIntelligence />} />
            <Route path="idle-industry-scanner" element={<IdleIndustryScanner />} />
            <Route path="power-infrastructure" element={<PowerInfrastructure />} />
            <Route path="btc-roi-lab" element={<BTCROIMainPage />} />
            <Route path="data-management" element={<DataManagement />} />
          </Routes>
        </main>

        {/* Bottom Navigation for Mobile */}
        {isMobile && (
          <BottomNavigation items={bottomNavItems} />
        )}
      </div>
    </div>
  );
}
