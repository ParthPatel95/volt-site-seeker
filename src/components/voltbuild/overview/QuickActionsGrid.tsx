import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  AlertTriangle, 
  FileText, 
  Download,
  Brain,
  Calendar
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Plus;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface QuickActionsGridProps {
  onAddTask: () => void;
  onAddRisk: () => void;
  onExportReport: () => void;
  onOpenAdvisor: () => void;
  onViewTimeline: () => void;
}

export function QuickActionsGrid({
  onAddTask,
  onAddRisk,
  onExportReport,
  onOpenAdvisor,
  onViewTimeline
}: QuickActionsGridProps) {
  const actions: QuickAction[] = [
    {
      id: 'add-task',
      label: 'Add Task',
      icon: Plus,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      onClick: onAddTask
    },
    {
      id: 'add-risk',
      label: 'Add Risk',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
      onClick: onAddRisk
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      onClick: onExportReport
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      onClick: onOpenAdvisor
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      onClick: onViewTimeline
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 sm:grid-cols-5 gap-2"
      >
        {actions.map((action) => (
          <motion.button
            key={action.id}
            variants={itemVariants}
            onClick={action.onClick}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-3 rounded-xl",
              "transition-all duration-200",
              action.bgColor
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <action.icon className={cn("w-5 h-5", action.color)} />
            <span className="text-xs font-medium text-foreground text-center">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </Card>
  );
}
