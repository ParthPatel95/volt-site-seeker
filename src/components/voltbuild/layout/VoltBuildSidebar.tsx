import React from 'react';
import { Link } from 'react-router-dom';
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
  Zap,
  ArrowLeft,
  Plus,
  ChevronDown,
  CalendarDays,
  UserCheck,
  CheckSquare,
  TrendingUp,
  Plug,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildNavItem } from './VoltBuildNavItem';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  | 'reporting'
  | 'dailylogs'
  | 'fieldcheckins'
  | 'verification'
  | 'forecasting'
  | 'utilitymonitor'
  | 'safety';

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
    label: 'Field Ops',
    items: [
      { id: 'dailylogs', label: 'Daily Logs', icon: CalendarDays },
      { id: 'fieldcheckins', label: 'Check-Ins', icon: UserCheck },
      { id: 'verification', label: 'Verification', icon: CheckSquare },
    ]
  },
  {
    label: 'Strategic',
    items: [
      { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
      { id: 'utilitymonitor', label: 'Utility Monitor', icon: Plug },
      { id: 'safety', label: 'Safety', icon: ShieldCheck },
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

interface Project {
  id: string;
  name: string;
}

interface VoltBuildSidebarProps {
  currentView: VoltBuildView;
  onViewChange: (view: VoltBuildView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  riskCount?: number;
  taskCount?: number;
  projects?: Project[];
  selectedProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
  onNewProject?: () => void;
}

export function VoltBuildSidebar({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  riskCount = 0,
  taskCount = 0,
  projects = [],
  selectedProjectId,
  onProjectSelect,
  onNewProject
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
      {/* Back to VoltScout Link */}
      <Link
        to="/app"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 border-b border-border transition-colors",
          isCollapsed && "justify-center px-2"
        )}
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Back to VoltScout
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

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

      {/* Project Selector */}
      <div className={cn(
        "p-3 border-b border-border",
        isCollapsed && "px-2"
      )}>
        {!isCollapsed ? (
          <div className="space-y-2">
            <Select value={selectedProjectId} onValueChange={onProjectSelect}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={onNewProject}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        ) : (
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onNewProject} 
            title="New Project"
            className="w-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
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
