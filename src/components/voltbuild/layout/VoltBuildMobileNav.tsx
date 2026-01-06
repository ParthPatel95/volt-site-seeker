import React, { useState } from 'react';
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
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildView } from './VoltBuildLayout';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const quickNavItems = [
  { id: 'overview' as VoltBuildView, label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks' as VoltBuildView, label: 'Tasks', icon: ListTodo },
  { id: 'timeline' as VoltBuildView, label: 'Timeline', icon: GanttChart },
  { id: 'risks' as VoltBuildView, label: 'Risks', icon: AlertTriangle },
];

const allNavItems = [
  { id: 'overview' as VoltBuildView, label: 'Overview', icon: LayoutDashboard, group: 'Core' },
  { id: 'tasks' as VoltBuildView, label: 'Tasks', icon: ListTodo, group: 'Core' },
  { id: 'timeline' as VoltBuildView, label: 'Timeline', icon: GanttChart, group: 'Core' },
  { id: 'risks' as VoltBuildView, label: 'Risks', icon: AlertTriangle, group: 'Core' },
  { id: 'capex' as VoltBuildView, label: 'CAPEX', icon: DollarSign, group: 'Financial' },
  { id: 'procurement' as VoltBuildView, label: 'Procurement', icon: Package, group: 'Financial' },
  { id: 'bids' as VoltBuildView, label: 'Bids & Vendors', icon: Users, group: 'Financial' },
  { id: 'leadtime' as VoltBuildView, label: 'Lead Times', icon: Clock, group: 'Execution' },
  { id: 'changeorders' as VoltBuildView, label: 'Change Orders', icon: FileEdit, group: 'Execution' },
  { id: 'quality' as VoltBuildView, label: 'Quality', icon: ClipboardCheck, group: 'Execution' },
  { id: 'advisor' as VoltBuildView, label: 'AI Advisor', icon: Brain, group: 'Intelligence' },
  { id: 'reporting' as VoltBuildView, label: 'Reporting', icon: FileText, group: 'Intelligence' },
];

interface VoltBuildMobileNavProps {
  currentView: VoltBuildView;
  onViewChange: (view: VoltBuildView) => void;
}

export function VoltBuildMobileNav({ currentView, onViewChange }: VoltBuildMobileNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNavClick = (view: VoltBuildView) => {
    onViewChange(view);
    setIsMoreOpen(false);
  };

  const isQuickNavActive = quickNavItems.some(item => item.id === currentView);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50",
          "bg-card/95 backdrop-blur-lg border-t border-border",
          "safe-area-inset-bottom"
        )}
      >
        <div className="flex items-center justify-around py-2 px-4">
          {quickNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]",
                  "transition-colors duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
          
          {/* More Button */}
          <motion.button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]",
              "transition-colors duration-200",
              !isQuickNavActive ? "text-primary" : "text-muted-foreground"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* More Menu Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
          <SheetHeader className="pb-4">
            <SheetTitle>All Modules</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 overflow-y-auto pb-8">
            {['Core', 'Financial', 'Execution', 'Intelligence'].map((group) => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {group}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {allNavItems
                    .filter(item => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl",
                            "border transition-all duration-200",
                            isActive 
                              ? "bg-primary/10 border-primary/30 text-primary" 
                              : "bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground"
                          )}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-medium text-center">{item.label}</span>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
