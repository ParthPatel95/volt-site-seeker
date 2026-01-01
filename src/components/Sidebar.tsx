import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
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
  LayoutDashboard,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  permission: string;
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { path: '/app', icon: Home, label: 'Dashboard', permission: 'feature.dashboard' },
      { path: '/app/aeso-dashboards', icon: LayoutDashboard, label: 'Energy Dashboards', permission: 'feature.energy-dashboards' },
    ]
  },
  {
    title: 'Markets',
    items: [
      { path: '/app/aeso-market-hub', icon: MapPin, label: 'AESO (Alberta)', permission: 'feature.aeso-market-hub' },
      { path: '/app/ercot-market-hub', icon: Zap, label: 'ERCOT (Texas)', permission: 'feature.ercot-market-hub' },
    ]
  },
  {
    title: 'Analysis',
    items: [
      { path: '/app/intelligence-hub', icon: Brain, label: 'Intelligence Hub', permission: 'feature.intelligence-hub' },
      { path: '/app/power-infrastructure', icon: Factory, label: 'Power Infrastructure', permission: 'feature.power-infrastructure' },
      { path: '/app/btc-roi-lab', icon: Bitcoin, label: 'Profitability Lab', permission: 'feature.btc-roi-lab' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { path: '/app/secure-share', icon: Lock, label: 'Secure Share', permission: 'feature.secure-share' },
      { path: '/app/users', icon: Users, label: 'User Management', permission: 'feature.user-management' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isOpen,
  setIsOpen
}) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { hasPermission } = usePermissions();

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
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
    <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground">
      {/* Header */}
      <div className={cn(
        'flex items-center border-b border-sidebar-border',
        isCollapsed && !isMobile ? 'h-14 px-2 justify-center' : 'h-14 px-4'
      )}>
        {isMobile && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold tracking-tight">VoltScout</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {!isMobile && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-semibold tracking-tight">VoltScout</span>
            )}
          </div>
        )}
      </div>

      {/* Collapse Toggle - Desktop Only */}
      {!isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-background border border-border shadow-sm z-50 hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {/* Section Title */}
              {(!isCollapsed || isMobile) && (
                <div className="px-4 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                    {section.title}
                  </span>
                </div>
              )}
              
              {isCollapsed && !isMobile && sectionIndex > 0 && (
                <div className="px-3 mb-2">
                  <Separator className="bg-sidebar-border" />
                </div>
              )}

              {/* Section Items */}
              <div className={cn('space-y-0.5', isCollapsed && !isMobile ? 'px-2' : 'px-2')}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const hasAccess = hasPermission(item.permission);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item)}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                        isCollapsed && !isMobile ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm' 
                          : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                        !hasAccess && 'opacity-50 cursor-not-allowed'
                      )}
                      title={isCollapsed && !isMobile ? item.label : undefined}
                    >
                      <Icon className={cn(
                        'w-[18px] h-[18px] flex-shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-sidebar-muted group-hover:text-sidebar-foreground'
                      )} />
                      {(!isCollapsed || isMobile) && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {!hasAccess && <Lock className="w-3.5 h-3.5 flex-shrink-0" />}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-sidebar-border',
        isCollapsed && !isMobile ? 'p-2' : 'p-3'
      )}>
        {/* User Info */}
        {(!isCollapsed || isMobile) && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
            isCollapsed && !isMobile ? 'justify-center px-2 h-10' : 'justify-start px-3 h-10'
          )}
          title={isCollapsed && !isMobile ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="ml-3 text-sm font-medium">Sign Out</span>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-72 max-w-[85vw] z-50 border-r border-sidebar-border bg-sidebar-background"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div 
      className={cn(
        'fixed left-0 top-0 h-full z-40 transition-all duration-200 border-r border-sidebar-border bg-sidebar-background',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <SidebarContent />
    </div>
  );
};
