import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SecureShareNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  badge?: number;
}

export function SecureShareNavItem({
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
  badge
}: SecureShareNavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
        "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isActive 
          ? "bg-primary/10 text-primary border-l-2 border-primary" 
          : "text-muted-foreground hover:text-foreground",
        isCollapsed && "justify-center px-2"
      )}
      whileHover={{ x: isCollapsed ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0",
        isActive && "text-primary"
      )} />
      
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm font-medium truncate"
        >
          {label}
        </motion.span>
      )}
      
      {!isCollapsed && badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}
      
      {isCollapsed && badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"
        />
      )}
    </motion.button>
  );
}
