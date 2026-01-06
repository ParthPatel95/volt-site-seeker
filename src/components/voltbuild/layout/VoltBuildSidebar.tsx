import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ListTodo, 
  GanttChart, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Brain,
  Users,
  Package,
  FileEdit,
  ClipboardCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildNavItem } from './VoltBuildNavItem';
import { Separator } from '@/components/ui/separator';

export type VoltBuildView = 
  | 'overview' 
  | 'tasks' 
  | 'timeline' 
  | 'risks' 
  | 'capex' 
  | 'leadtime' 
  | 'advisor'
  | 'bids'
  | 'procurement'
  | 'changeorders'
  | 'quality'
  | 'reporting';

interface NavGroup {
  label: string;
  items: {
    id: VoltBuildView;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'tasks', label: 'Tasks', icon: ListTodo },
      { id: 'timeline', label: 'Timeline', icon: GanttChart },
      { id: 'risks', label: 'Risks', icon: AlertTriangle },
    ]
  },
  {
    label: 'Financial',
    items: [
      { id: 'capex', label: 'CAPEX', icon: DollarSign },
      { id: 'procurement', label: 'Procurement', icon: Package },
      { id: 'bids', label: 'Bids & Vendors', icon: Users },
    ]
  },
  {
    label: 'Execution',
    items: [
      { id: 'leadtime', label: 'Lead Times', icon: Clock },
      { id: 'changeorders', label: 'Change Orders', icon: FileEdit },
      { id: 'quality', label: 'Quality', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'advisor', label: 'AI Advisor', icon: Brain },
      { id: 'reporting', label: 'Reporting', icon: FileText },
    ]
  }
];

interface VoltBuildSidebarProps {
  currentView: VoltBuildView;
  onViewChange: (view: VoltBuildView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  riskCount?: number;
  taskCount?: number;
}

export function VoltBuildSidebar({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  riskCount = 0,
  taskCount = 0
}: VoltBuildSidebarProps) {
  const getBadge = (id: VoltBuildView) => {
    if (id === 'risks') return riskCount;
    if (id === 'tasks') return taskCount;
    return undefined;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        "hidden lg:flex flex-col h-full bg-card border-r border-border",
        "relative flex-shrink-0"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center gap-2 p-4 border-b border-border",
        isCollapsed && "justify-center"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-lg text-foreground overflow-hidden whitespace-nowrap"
            >
              VoltBuild
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={group.label}>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2"
              >
                {group.label}
              </motion.p>
            )}
            {isCollapsed && idx > 0 && (
              <Separator className="my-2 mx-auto w-8" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <VoltBuildNavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentView === item.id}
                  isCollapsed={isCollapsed}
                  onClick={() => onViewChange(item.id)}
                  badge={getBadge(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border">
        <motion.button
          onClick={onToggleCollapse}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            "transition-colors duration-200"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
