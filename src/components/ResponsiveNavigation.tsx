import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { NavigationItem, useResponsiveNavigation } from '@/hooks/useResponsiveNavigation';

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  activeItem?: string;
  className?: string;
}

export function ResponsiveNavigation({ 
  items, 
  onItemClick, 
  activeItem, 
  className = "" 
}: ResponsiveNavigationProps) {
  const { visibleItems, hiddenItems, hasHiddenItems, isMobile } = useResponsiveNavigation(items);

  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item);
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      {/* Visible navigation items */}
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            size={isMobile ? "sm" : "default"}
            onClick={() => handleItemClick(item)}
            className={`
              flex items-center gap-1 sm:gap-2 min-w-0 touch-target
              ${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}
              ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
            `}
          >
            <Icon className={`flex-shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className="truncate hidden sm:inline-block">{item.label}</span>
            {isMobile && (
              <span className="truncate text-xs">{item.label.split(' ')[0]}</span>
            )}
          </Button>
        );
      })}

      {/* Overflow menu for hidden items */}
      {hasHiddenItems && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              className={`
                flex items-center gap-1 touch-target
                ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2'}
              `}
            >
              <MoreHorizontal className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 max-h-80 overflow-y-auto bg-background border border-border shadow-lg z-50"
          >
            {hiddenItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    flex items-center gap-2 p-2 cursor-pointer min-h-[44px] touch-target
                    ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}