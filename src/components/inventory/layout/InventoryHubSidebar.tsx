import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, LayoutDashboard, Bell, Folder, Tags, History,
  ScanBarcode, Download, ChevronLeft, ChevronRight, ArrowLeft, Plus, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildNavItem } from '@/components/voltbuild/layout/VoltBuildNavItem';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export type InventoryHubView =
  | 'dashboard'
  | 'alerts'
  | 'metal-prices'
  | 'items'
  | 'groups'
  | 'categories'
  | 'transactions'
  | 'scanner-settings'
  | 'export';

interface NavGroup {
  label: string;
  items: {
    id: InventoryHubView;
    label: string;
    icon: typeof Package;
    badge?: number;
    badgeVariant?: 'default' | 'destructive';
  }[];
}

interface Workspace {
  id: string;
  name: string;
}

interface InventoryHubSidebarProps {
  currentView: InventoryHubView;
  onViewChange: (view: InventoryHubView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  itemsCount?: number;
  alertsCount?: number;
  workspaces?: Workspace[];
  selectedWorkspaceId?: string | null;
  onWorkspaceChange?: (id: string) => void;
  onCreateWorkspace?: () => void;
}

export function InventoryHubSidebar({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  isMobileOpen = false,
  onMobileClose,
  itemsCount = 0,
  alertsCount = 0,
  workspaces = [],
  selectedWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
}: InventoryHubSidebarProps) {
  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'metal-prices', label: 'Live Metal Prices', icon: TrendingUp },
        { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertsCount, badgeVariant: 'destructive' },
      ],
    },
    {
      label: 'Management',
      items: [
        { id: 'items', label: 'Items', icon: Package, badge: itemsCount },
        { id: 'groups', label: 'Groups', icon: Folder },
        { id: 'categories', label: 'Categories', icon: Tags },
      ],
    },
    {
      label: 'Tools',
      items: [
        { id: 'transactions', label: 'Transactions', icon: History },
        { id: 'scanner-settings', label: 'Scanner Settings', icon: ScanBarcode },
        { id: 'export', label: 'Export', icon: Download },
      ],
    },
  ];

  const SidebarInner = ({ showCollapsed = false }: { showCollapsed?: boolean }) => (
    <>
      {/* Back to VoltScout */}
      <Link
        to="/app"
        className={cn(
          'flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 border-b border-border transition-colors',
          showCollapsed && 'justify-center px-2'
        )}
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        {!showCollapsed && <span>Back to VoltScout</span>}
      </Link>

      {/* Branding */}
      <div className={cn('flex items-center gap-2 p-4 border-b border-border', showCollapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary-foreground" />
        </div>
        {!showCollapsed && <span className="font-bold text-lg text-foreground">Inventory Hub</span>}
      </div>

      {/* Workspace Selector */}
      {!showCollapsed && workspaces.length > 0 && (
        <div className="px-3 py-3 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Select value={selectedWorkspaceId || ''} onValueChange={(v) => onWorkspaceChange?.(v)}>
              <SelectTrigger className="h-8 text-xs bg-background border-border flex-1">
                <SelectValue placeholder="Workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map(ws => (
                  <SelectItem key={ws.id} value={ws.id} className="text-xs">
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onCreateWorkspace}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-4 px-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={group.label}>
              {!showCollapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </p>
              )}
              {showCollapsed && idx > 0 && <Separator className="my-2 mx-auto w-8" />}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <VoltBuildNavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.id}
                    isCollapsed={showCollapsed}
                    onClick={() => onViewChange(item.id)}
                    badge={item.badge}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="p-2 border-t border-border">
          <motion.button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'transition-colors duration-200'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border flex flex-col">
          <SidebarInner showCollapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn('hidden lg:flex flex-col h-full bg-card border-r border-border relative flex-shrink-0')}
    >
      <SidebarInner showCollapsed={isCollapsed} />
    </motion.aside>
  );
}
