import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AESOHubSidebar, AESOHubView } from './AESOHubSidebar';

const VIEW_LABELS: Record<AESOHubView, string> = {
  market: 'Market Data',
  'power-model': 'Power Model',
  generation: 'Generation',
  forecast: 'Forecasts',
  predictions: 'AI Predictions',
  datacenter: 'Datacenter Control',
  'outages-alerts': 'Outages & Alerts',
  historical: 'Historical',
  'analytics-export': 'Analytics Export',
  'custom-dashboards': 'Dashboards',
  'telegram-alerts': 'Telegram Alerts',
};

interface AESOHubLayoutProps {
  children: ReactNode;
  currentView: AESOHubView;
  onViewChange: (view: AESOHubView) => void;
}

export function AESOHubLayout({ children, currentView, onViewChange }: AESOHubLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: AESOHubView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AESOHubSidebar
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
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">{VIEW_LABELS[currentView]}</span>
                  <p className="text-xs text-muted-foreground">AESO Market Hub</p>
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

export { type AESOHubView };
