import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryHubSidebar, InventoryHubView } from './InventoryHubSidebar';

const VIEW_LABELS: Record<InventoryHubView, string> = {
  dashboard: 'Dashboard',
  'metal-prices': 'Live Metal Prices',
  alerts: 'Alerts',
  items: 'Items',
  groups: 'Groups',
  categories: 'Categories',
  transactions: 'Transactions',
  'scanner-settings': 'Scanner Settings',
  export: 'Export',
};

interface Workspace {
  id: string;
  name: string;
}

interface InventoryHubLayoutProps {
  children: ReactNode;
  currentView: InventoryHubView;
  onViewChange: (view: InventoryHubView) => void;
  itemsCount?: number;
  alertsCount?: number;
  workspaces?: Workspace[];
  selectedWorkspaceId?: string | null;
  onWorkspaceChange?: (id: string) => void;
  onCreateWorkspace?: () => void;
}

export function InventoryHubLayout({
  children,
  currentView,
  onViewChange,
  itemsCount,
  alertsCount,
  workspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
}: InventoryHubLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: InventoryHubView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <InventoryHubSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        itemsCount={itemsCount}
        alertsCount={alertsCount}
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        onWorkspaceChange={onWorkspaceChange}
        onCreateWorkspace={onCreateWorkspace}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {isMobile && (
          <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">{VIEW_LABELS[currentView]}</span>
                  <p className="text-xs text-muted-foreground">Inventory Hub</p>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="h-full"
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export { type InventoryHubView };
