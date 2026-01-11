import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildSidebar, VoltBuildView } from './VoltBuildSidebar';

interface Project {
  id: string;
  name: string;
}

interface VoltBuildLayoutProps {
  children: ReactNode;
  currentView: VoltBuildView;
  onViewChange: (view: VoltBuildView) => void;
  riskCount?: number;
  taskCount?: number;
  projects?: Project[];
  selectedProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
  onNewProject?: () => void;
}

export function VoltBuildLayout({
  children,
  currentView,
  onViewChange,
  riskCount = 0,
  taskCount = 0,
  projects = [],
  selectedProjectId,
  onProjectSelect,
  onNewProject
}: VoltBuildLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: VoltBuildView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - handles both desktop (fixed) and mobile (sheet) */}
      <VoltBuildSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        riskCount={riskCount}
        taskCount={taskCount}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={onProjectSelect}
        onNewProject={onNewProject}
        isMobile={isMobile}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-card">
            <div className="flex items-center gap-3 p-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <span className="font-semibold">VoltBuild</span>
                <p className="text-xs text-muted-foreground capitalize">{currentView.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}

export { type VoltBuildView };
