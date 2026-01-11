import React, { useEffect, useRef } from 'react';
import { 
  Edit, 
  Trash2, 
  Link2, 
  Link2Off, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  PlayCircle,
  Zap,
  Copy,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { GanttTask } from '../types/gantt.types';

interface GanttContextMenuProps {
  onEditTask?: (task: GanttTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: GanttTask['status']) => void;
  onToggleCritical?: (taskId: string) => void;
  onDuplicateTask?: (task: GanttTask) => void;
  onRemoveDependencies?: (taskId: string) => void;
}

interface ActionMenuItem {
  kind: 'action';
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

interface SeparatorMenuItem {
  kind: 'separator';
}

type MenuItem = ActionMenuItem | SeparatorMenuItem;

export function GanttContextMenu({
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleCritical,
  onDuplicateTask,
  onRemoveDependencies,
}: GanttContextMenuProps) {
  const { state, closeContextMenu, startLinking, criticalPathTasks } = useGantt();
  const { contextMenuPosition, tasks, dependencies } = state;
  const menuRef = useRef<HTMLDivElement>(null);

  const task = contextMenuPosition 
    ? tasks.find(t => t.id === contextMenuPosition.taskId) 
    : null;

  const taskDependencies = task 
    ? dependencies.filter(d => 
        d.predecessor_task_id === task.id || d.successor_task_id === task.id
      )
    : [];

  const isCritical = task ? criticalPathTasks.has(task.id) : false;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeContextMenu]);

  if (!contextMenuPosition || !task) return null;

  // Build menu items dynamically
  const menuItems: MenuItem[] = [];

  // Edit task
  menuItems.push({
    kind: 'action',
    label: 'Edit Task',
    icon: Edit,
    onClick: () => {
      onEditTask?.(task);
      closeContextMenu();
    },
  });

  menuItems.push({ kind: 'separator' });

  // Status changes
  if (task.status !== 'not_started') {
    menuItems.push({
      kind: 'action',
      label: 'Mark as Not Started',
      icon: Circle,
      onClick: () => {
        onStatusChange?.(task.id, 'not_started');
        closeContextMenu();
      },
    });
  }

  if (task.status !== 'in_progress') {
    menuItems.push({
      kind: 'action',
      label: 'Mark as In Progress',
      icon: PlayCircle,
      onClick: () => {
        onStatusChange?.(task.id, 'in_progress');
        closeContextMenu();
      },
    });
  }

  if (task.status !== 'complete') {
    menuItems.push({
      kind: 'action',
      label: 'Mark as Complete',
      icon: CheckCircle,
      onClick: () => {
        onStatusChange?.(task.id, 'complete');
        closeContextMenu();
      },
      className: 'text-green-600',
    });
  }

  if (task.status !== 'blocked') {
    menuItems.push({
      kind: 'action',
      label: 'Mark as Blocked',
      icon: AlertCircle,
      onClick: () => {
        onStatusChange?.(task.id, 'blocked');
        closeContextMenu();
      },
      className: 'text-destructive',
    });
  }

  menuItems.push({ kind: 'separator' });

  // Dependencies
  menuItems.push({
    kind: 'action',
    label: 'Add Dependency',
    icon: Link2,
    onClick: () => {
      startLinking(task.id);
      closeContextMenu();
    },
  });

  if (taskDependencies.length > 0) {
    menuItems.push({
      kind: 'action',
      label: 'Remove Dependencies',
      icon: Link2Off,
      onClick: () => {
        onRemoveDependencies?.(task.id);
        closeContextMenu();
      },
      className: 'text-destructive',
    });
  }

  menuItems.push({ kind: 'separator' });

  // Critical path toggle
  menuItems.push({
    kind: 'action',
    label: isCritical ? 'Remove from Critical Path' : 'Mark as Critical',
    icon: Zap,
    onClick: () => {
      onToggleCritical?.(task.id);
      closeContextMenu();
    },
    className: isCritical ? '' : 'text-orange-600',
  });

  // Duplicate
  menuItems.push({
    kind: 'action',
    label: 'Duplicate Task',
    icon: Copy,
    onClick: () => {
      onDuplicateTask?.(task);
      closeContextMenu();
    },
  });

  menuItems.push({ kind: 'separator' });

  // Delete
  menuItems.push({
    kind: 'action',
    label: 'Delete Task',
    icon: Trash2,
    onClick: () => {
      onDeleteTask?.(task.id);
      closeContextMenu();
    },
    className: 'text-destructive',
  });

  // Adjust position to keep menu in viewport
  const adjustPosition = () => {
    const { x, y } = contextMenuPosition;
    const menuWidth = 200;
    const menuHeight = 320;
    
    return {
      left: Math.min(x, window.innerWidth - menuWidth - 16),
      top: Math.min(y, window.innerHeight - menuHeight - 16),
    };
  };

  const position = adjustPosition();

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
      style={position}
    >
      {menuItems.map((item, index) => {
        if (item.kind === 'separator') {
          return <div key={`sep-${index}`} className="my-1 h-px bg-border" />;
        }

        const Icon = item.icon;

        return (
          <button
            key={item.label}
            className={cn(
              "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground",
              item.className
            )}
            onClick={item.onClick}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
