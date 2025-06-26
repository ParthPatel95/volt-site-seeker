
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { 
  Home, 
  Zap, 
  Building2, 
  Factory, 
  Database, 
  Brain,
  Bitcoin,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  Search,
  BarChart3,
  MapPin,
  Cpu,
  Target,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isOpen,
  setIsOpen
}) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/app', icon: Home, label: 'Dashboard' },
    { path: '/app/aeso-market', icon: Zap, label: 'AESO Market' },
    { path: '/app/market-intelligence', icon: Brain, label: 'Market Intelligence' },
    { path: '/app/energy-rates', icon: BarChart3, label: 'Energy Rates' },
    { path: '/app/industry-intelligence', icon: TrendingUp, label: 'Industry Intelligence' },
    { path: '/app/corporate-intelligence', icon: Building2, label: 'Corporate Intelligence' },
    { path: '/app/idle-industry-scanner', icon: Target, label: 'Idle Industry Scanner' },
    { path: '/app/power-infrastructure', icon: Factory, label: 'Power Infrastructure' },
    { path: '/app/btc-roi-lab', icon: Bitcoin, label: 'BTC Mining ROI Lab' },
    { path: '/app/data-management', icon: Database, label: 'Data Management' }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">VoltScout</h1>
          </div>
        )}
        
        {/* Collapse button for desktop */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-1 h-6 w-6"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-orange-600 text-white' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Settings className="w-5 h-5 mr-3" />
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </div>
    </div>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div 
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <SidebarContent />
    </div>
  );
};
