import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SecureShareSidebar, SecureShareView } from './SecureShareSidebar';
import { SecureShareMobileNav } from './SecureShareMobileNav';
import { Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SecureShareLayoutProps {
  children: ReactNode;
  currentView: SecureShareView;
  onViewChange: (view: SecureShareView) => void;
  documentCount?: number;
  linkCount?: number;
  bundleCount?: number;
  activeViewers?: number;
  onUploadDocument?: () => void;
  onCreateLink?: () => void;
}

export function SecureShareLayout({
  children,
  currentView,
  onViewChange,
  documentCount = 0,
  linkCount = 0,
  bundleCount = 0,
  activeViewers = 0,
  onUploadDocument,
  onCreateLink
}: SecureShareLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <SecureShareSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        documentCount={documentCount}
        linkCount={linkCount}
        bundleCount={bundleCount}
        activeViewers={activeViewers}
        onUploadDocument={onUploadDocument}
        onCreateLink={onCreateLink}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-semibold">Secure Share</span>
                <p className="text-xs text-muted-foreground capitalize">{currentView}</p>
              </div>
            </div>
            {activeViewers > 0 && (
              <Badge className="gap-1 bg-green-500/20 text-green-600 animate-pulse border-0">
                <Activity className="w-3 h-3" />
                {activeViewers} live
              </Badge>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <SecureShareMobileNav
        currentView={currentView}
        onViewChange={onViewChange}
      />
    </div>
  );
}

export { type SecureShareView };
