
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
  TrendingUp,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  const { signOut } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Header */}
      <div className={`p-3 sm:p-4 border-b border-slate-700 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold truncate">VoltScout</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-slate-800 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <>
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">VoltScout</h1>
              </div>
            )}
            
            {isCollapsed && !isMobile && (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            
            {/* Collapse button for desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-1 h-6 w-6 z-50"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-1 sm:p-2 space-y-0.5 sm:space-y-1 overflow-y-auto ${isCollapsed && !isMobile ? 'px-1' : 'px-2 sm:px-4'}`}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-orange-600 text-white' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              } ${isCollapsed && !isMobile ? 'justify-center px-2' : ''} ${isMobile ? 'min-h-[44px]' : ''} touch-target`}
              title={isCollapsed && !isMobile ? item.label : ''}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span className="font-medium text-xs sm:text-sm truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-1 sm:p-2 border-t border-slate-700 space-y-0.5 sm:space-y-1 ${isCollapsed && !isMobile ? 'px-1' : 'px-2 sm:px-4'}`}>
        <Link
          to="/app/settings"
          onClick={() => isMobile && setIsOpen(false)}
          className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-colors ${
            location.pathname === '/app/settings'
              ? 'bg-orange-600 text-white' 
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          } ${isCollapsed && !isMobile ? 'justify-center px-2' : ''} ${isMobile ? 'min-h-[44px]' : ''} touch-target`}
          title={isCollapsed && !isMobile ? 'Settings' : ''}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span className="font-medium text-xs sm:text-sm">Settings</span>}
        </Link>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={`w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 sm:p-3 h-auto ${
            isCollapsed && !isMobile ? 'px-2' : ''
          } ${isMobile ? 'min-h-[44px]' : ''} touch-target`}
          title={isCollapsed && !isMobile ? 'Sign Out' : ''}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span className="ml-2 sm:ml-3 text-xs sm:text-sm">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-72 sm:w-80 max-w-[85vw]"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div 
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      <SidebarContent />
    </div>
  );
};
