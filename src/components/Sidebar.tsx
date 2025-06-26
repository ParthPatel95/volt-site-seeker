
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
  Activity
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

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold tracking-tight">VoltScout</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Power Infrastructure Intelligence
          </p>
        </div>
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-muted font-medium"
                  )}
                  asChild
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
      </div>
    </div>
  );
}
