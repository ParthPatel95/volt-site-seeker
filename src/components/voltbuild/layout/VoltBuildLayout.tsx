import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronRight } from 'lucide-react';
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

// View labels for display
const VIEW_LABELS: Record<VoltBuildView, string> = {
  overview: 'Overview',
  tasks: 'Tasks',
  gantt: 'Gantt Chart',
  timeline: 'Timeline',
  risks: 'Risks',
  capex: 'CAPEX',
  leadtime: 'Lead Times',
  advisor: 'AI Advisor',
  bids: 'Bids & Vendors',
  procurement: 'Procurement',
  changeorders: 'Change Orders',
  quality: 'Quality',
  reporting: 'Reports',
  dailylogs: 'Daily Logs',
  fieldcheckins: 'Check-Ins',
  verification: 'Verification',
  forecasting: 'Forecasting',
  utilitymonitor: 'Utility Monitor',
  safety: 'Safety',
  rfis: 'RFIs',
  punchlist: 'Punch List',
  subcontractors: 'Subcontractors',
  labor: 'Labor',
  inventory: 'Inventory',
};

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

  // Find selected project name
  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Enhanced Mobile Header */}
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
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground truncate">
                    {VIEW_LABELS[currentView]}
                  </span>
                </div>
                {selectedProject && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="truncate max-w-[200px]">{selectedProject.name}</span>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
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

export { type VoltBuildView };
