
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomNavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  active?: boolean;
  badge?: number;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  className?: string;
}

export function BottomNavigation({ items, className }: BottomNavigationProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border",
      "flex items-center justify-around px-2 py-2 safe-area-pb",
      "md:hidden", // Only show on mobile
      className
    )}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.active ? "default" : "ghost"}
          size="sm"
          onClick={item.onClick}
          className={cn(
            "flex flex-col items-center justify-center p-2 min-w-0 flex-1 max-w-[80px]",
            "h-12 relative transition-all duration-200",
            item.active && "bg-primary/10 text-primary"
          )}
        >
          <div className="relative">
            <item.icon className="w-5 h-5 mb-1" />
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </div>
          <span className="text-xs truncate max-w-full leading-none">
            {item.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
