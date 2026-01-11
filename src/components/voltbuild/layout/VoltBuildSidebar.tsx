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
  ShieldCheck,
  MessageSquare,
  ListChecks,
  HardHat,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildNavItem } from './VoltBuildNavItem';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  | 'safety'
  | 'rfis'
  | 'punchlist'
  | 'subcontractors'
  | 'labor';

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
      { id: 'rfis', label: 'RFIs', icon: MessageSquare },
      { id: 'quality', label: 'Quality', icon: ClipboardCheck },
      { id: 'punchlist', label: 'Punch List', icon: ListChecks },
    ]
  },
  {
    label: 'Field Ops',
    items: [
      { id: 'dailylogs', label: 'Daily Logs', icon: CalendarDays },
      { id: 'fieldcheckins', label: 'Check-Ins', icon: UserCheck },
      { id: 'verification', label: 'Verification', icon: CheckSquare },
      { id: 'labor', label: 'Labor Tracking', icon: HardHat },
      { id: 'subcontractors', label: 'Subcontractors', icon: Building2 },
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
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
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
  onNewProject,
  isMobile = false,
  isMobileOpen = false,
  onMobileClose
}: VoltBuildSidebarProps) {
  const getBadge = (id: VoltBuildView) => {
    if (id === 'risks') return riskCount;
    if (id === 'tasks') return taskCount;
    return undefined;
  };

  const SidebarContent = ({ showCollapsed = false }: { showCollapsed?: boolean }) => (
    <>
      {/* Back to VoltScout Link */}
      <Link
        to="/app"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 border-b border-border transition-colors",
          showCollapsed && "justify-center px-2"
        )}
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        {!showCollapsed && <span>Back to VoltScout</span>}
      </Link>

      {/* Logo Section */}
      <div className={cn(
        "flex items-center gap-2 p-4 border-b border-border",
        showCollapsed && "justify-center"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!showCollapsed && (
          <span className="font-bold text-lg text-foreground">VoltBuild</span>
        )}
      </div>

      {/* Project Selector */}
      <div className={cn(
        "p-3 border-b border-border",
        showCollapsed && "px-2"
      )}>
        {!showCollapsed ? (
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
      <ScrollArea className="flex-1">
        <nav className="py-4 px-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={group.label}>
              {!showCollapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </p>
              )}
              {showCollapsed && idx > 0 && (
                <Separator className="my-2 mx-auto w-8" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <VoltBuildNavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.id}
                    isCollapsed={showCollapsed}
                    onClick={() => onViewChange(item.id)}
                    badge={getBadge(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle - only on desktop */}
      {!isMobile && (
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

  // Mobile: Render as Sheet
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border flex flex-col">
          <SidebarContent showCollapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
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
      <SidebarContent showCollapsed={isCollapsed} />
    </motion.aside>
  );
}