import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ERCOTHubSidebar, ERCOTHubView } from './ERCOTHubSidebar';

const VIEW_LABELS: Record<ERCOTHubView, string> = {
  market: 'Market Data',
  generation: 'Generation',
  forecast: 'Forecasts',
  'outages-alerts': 'Outages & Alerts',
  'advanced-analytics': 'Advanced Analytics',
  historical: 'Historical Pricing',
};

interface ERCOTHubLayoutProps {
  children: ReactNode;
  currentView: ERCOTHubView;
  onViewChange: (view: ERCOTHubView) => void;
}

export function ERCOTHubLayout({ children, currentView, onViewChange }: ERCOTHubLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: ERCOTHubView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ERCOTHubSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
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
                <div className="p-1.5 rounded-lg bg-orange-500/10">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">{VIEW_LABELS[currentView]}</span>
                  <p className="text-xs text-muted-foreground">ERCOT Market Hub</p>
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
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export { type ERCOTHubView };
