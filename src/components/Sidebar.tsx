
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Building, 
  Search, 
  Zap, 
  TrendingUp,
  Factory,
  Database,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { EnhancedLogo } from './EnhancedLogo';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navigationItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { path: '/app/properties', icon: Building, label: 'Properties', badge: null },
  { path: '/app/scraper', icon: Search, label: 'Property Scraper', badge: 'Beta' },
  { path: '/app/energy-rates', icon: Zap, label: 'Energy Rates', badge: 'AI' },
  { path: '/app/corporate-intelligence', icon: TrendingUp, label: 'Corporate Intelligence', badge: 'AI' },
  { path: '/app/idle-industry-scanner', icon: Factory, label: 'Idle Industry Scanner', badge: 'New' },
  { path: '/app/power-infrastructure', icon: Zap, label: 'Power Infrastructure', badge: null },
  { path: '/app/data-management', icon: Database, label: 'Data Management', badge: null },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
        <EnhancedLogo className={isCollapsed && !isMobile ? 'w-8 h-8' : 'w-10 h-10'} />
        {(!isCollapsed || isMobile) && (
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              VoltScout
            </h1>
            <p className="text-xs text-muted-foreground truncate">Power Intelligence Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isCollapsed && !isMobile ? 'px-2' : 'px-3'
                } ${isActive ? 'bg-secondary/80' : 'hover:bg-secondary/50'} min-h-[44px]`}
                onClick={() => handleNavigation(item.path)}
                title={isCollapsed && !isMobile ? item.label : undefined}
              >
                <item.icon className={`${isCollapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
          <ModeToggle />
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 flex-shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen bg-background border-r transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <SidebarContent />
    </aside>
  );
}
