import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { 
  Home, 
  Zap, 
  Factory, 
  Brain,
  Bitcoin,
  ChevronLeft,
  ChevronRight,
  MapPin,
  LogOut,
  X,
  Users,
  Lock,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

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
  const { hasPermission } = usePermissions();

  const navigationItems = [
    { path: '/app', icon: Home, label: 'Home', permission: 'feature.dashboard' },
    { path: '/app/aeso-dashboards', icon: LayoutDashboard, label: 'Energy Dashboards', permission: 'feature.energy-dashboards' },
    { path: '/app/aeso-market-hub', icon: MapPin, label: 'AESO Market Hub', permission: 'feature.aeso-market-hub' },
    { path: '/app/ercot-market-hub', icon: Zap, label: 'ERCOT Market Hub', permission: 'feature.ercot-market-hub' },
    { path: '/app/intelligence-hub', icon: Brain, label: 'Intelligence Hub', permission: 'feature.intelligence-hub' },
    { path: '/app/power-infrastructure', icon: Factory, label: 'Power Infrastructure', permission: 'feature.power-infrastructure' },
    { path: '/app/btc-roi-lab', icon: Bitcoin, label: 'Profitability Calculator', permission: 'feature.btc-roi-lab' },
    { path: '/app/secure-share', icon: Lock, label: 'Secure Share', permission: 'feature.secure-share' },
    { path: '/app/users', icon: Users, label: 'User Management', permission: 'feature.user-management' }
  ];

  const handleNavClick = (e: React.MouseEvent, item: typeof navigationItems[0]) => {
    if (!hasPermission(item.permission)) {
      e.preventDefault();
      toast.error('Access Restricted', {
        description: 'Please contact admin to gain access to this feature.'
      });
    } else if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className={`p-4 border-b border-sidebar-border ${isCollapsed && !isMobile ? 'px-3' : ''}`}>
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">VoltScout</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {!isMobile && (
          <>
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">VoltScout</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-5 bg-background border border-border text-muted-foreground hover:text-foreground p-1 h-6 w-6 z-50 shadow-subtle"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-2 overflow-y-auto scrollbar-hide ${isCollapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        <div className="space-y-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasAccess = hasPermission(item.permission);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-100 ${
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-foreground' 
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                } ${!hasAccess ? 'opacity-50' : ''} ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}`}
                title={isCollapsed && !isMobile ? item.label : ''}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {!hasAccess && <Lock className="w-3 h-3 flex-shrink-0" />}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-sidebar-border ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={`w-full justify-start text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-9 ${
            isCollapsed && !isMobile ? 'px-2 justify-center' : 'px-3'
          }`}
          title={isCollapsed && !isMobile ? 'Sign Out' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span className="ml-3 text-sm font-medium">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-72 max-w-[85vw] z-50 border-r-0"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div 
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <SidebarContent />
    </div>
  );
};
