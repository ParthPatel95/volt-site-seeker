import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VoltBuildSidebar, VoltBuildView } from './VoltBuildSidebar';
import { VoltBuildMobileNav } from './VoltBuildMobileNav';

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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <VoltBuildSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        riskCount={riskCount}
        taskCount={taskCount}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={onProjectSelect}
        onNewProject={onNewProject}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto pb-20 lg:pb-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <VoltBuildMobileNav
        currentView={currentView}
        onViewChange={onViewChange}
      />
    </div>
  );
}

export { type VoltBuildView };
