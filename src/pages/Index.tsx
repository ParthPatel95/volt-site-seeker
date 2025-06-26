
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Menu, Home, Zap, Building2, Factory, Database, Brain, Bitcoin } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';
import { DataManagement } from '@/components/DataManagement';
import { AESOMarket } from '@/components/AESOMarket';
import { BTCROIMainPage } from '@/components/btc_roi/BTCROIMainPage';

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
      onClick: () => navigate('/'),
      active: location.pathname === '/'
    },
    {
      id: 'aeso-market',
      label: 'AESO',
      icon: Zap,
      onClick: () => navigate('/aeso-market'),
      active: location.pathname === '/aeso-market'
    },
    {
      id: 'corporate',
      label: 'Corporate',
      icon: Building2,
      onClick: () => navigate('/corporate-intelligence'),
      active: location.pathname === '/corporate-intelligence'
    },
    {
      id: 'power',
      label: 'Power',
      icon: Factory,
      onClick: () => navigate('/power-infrastructure'),
      active: location.pathname === '/power-infrastructure'
    },
    {
      id: 'btc-roi',
      label: 'BTC ROI',
      icon: Bitcoin,
      onClick: () => navigate('/btc-roi-lab'),
      active: location.pathname === '/btc-roi-lab'
    },
    {
      id: 'data',
      label: 'Data',
      icon: Database,
      onClick: () => navigate('/data-management'),
      active: location.pathname === '/data-management'
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
