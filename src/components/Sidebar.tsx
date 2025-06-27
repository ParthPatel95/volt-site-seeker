
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Zap, 
  MapPin, 
  Building2, 
  Database,
  Settings,
  TrendingUp,
  Search,
  Grid3X3,
  Factory,
  Bitcoin,
  Activity,
  Menu,
  X
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'AESO Market',
    href: '/app/aeso-market',
    icon: Zap,
  },
  {
    title: 'ERCOT Market',
    href: '/app/ercot-market',
    icon: Activity,
  },
  {
    title: 'Power Infrastructure',
    href: '/app/power-infrastructure',
    icon: MapPin,
  },
  {
    title: 'Enhanced Grid Tracer',
    href: '/app/enhanced-grid-tracer',
    icon: Grid3X3,
  },
  {
    title: 'Corporate Intelligence',
    href: '/app/corporate-intelligence',
    icon: Building2,
  },
  {
    title: 'Multi-Source Scraper',
    href: '/app/multi-source-scraper',
    icon: Database,
  },
  {
    title: 'Industry Intelligence',
    href: '/app/industry-intelligence',
    icon: Factory,
  },
  {
    title: 'BTC ROI Calculator',
    href: '/app/btc-roi',
    icon: Bitcoin,
  },
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold tracking-tight">VoltScout</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="space-y-1 p-3">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-muted font-medium"
                  )}
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-30",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-6 w-6 mr-2" />
            {!isCollapsed && (
              <h2 className="text-lg font-semibold tracking-tight">VoltScout</h2>
            )}
          </div>
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground">
              Power Infrastructure Intelligence
            </p>
          )}
        </div>
        
        <div className="px-3">
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 h-8 w-8"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-muted font-medium",
                    isCollapsed && "px-2"
                  )}
                  asChild
                  title={isCollapsed ? item.title : undefined}
                >
                  <Link to={item.href}>
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
