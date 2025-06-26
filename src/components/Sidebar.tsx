
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Building, 
  Zap, 
  Database, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Calculator,
  BarChart3,
  Scan
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Activity, label: 'AESO Market', path: '/app/aeso-market' },
  { icon: TrendingUp, label: 'Market Intelligence', path: '/app/market-intelligence' },
  { icon: DollarSign, label: 'Energy Rates', path: '/app/energy-rates' },
  { icon: Search, label: 'Industry Intelligence', path: '/app/industry-intelligence' },
  { icon: Building, label: 'Corporate Intelligence', path: '/app/corporate-intelligence' },
  { icon: Scan, label: 'Idle Industry Scanner', path: '/app/idle-industry-scanner' },
  { icon: Zap, label: 'Power Infrastructure', path: '/app/power-infrastructure' },
  { icon: Calculator, label: 'Volt Analytics', path: '/app/btc-roi-lab' },
  { icon: Database, label: 'Data Management', path: '/app/data-management' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen }: SidebarProps) {
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col
        ${isMobile 
          ? `w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : isCollapsed 
            ? 'w-16' 
            : 'w-72'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 min-h-[73px]">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-lg">VoltScout</span>
            </div>
          )}
          
          {isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
                }
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed && !isMobile ? 'w-6 h-6' : ''}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
