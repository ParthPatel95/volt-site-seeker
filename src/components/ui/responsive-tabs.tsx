
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { useResponsiveNavigation, NavigationItem } from '@/hooks/useResponsiveNavigation';
import { cn } from '@/lib/utils';

interface ResponsiveTabsProps {
  items: NavigationItem[];
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTabs({ 
  items, 
  defaultValue, 
  onValueChange, 
  children, 
  className 
}: ResponsiveTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const { visibleItems, hiddenItems, isMobile, hasHiddenItems } = useResponsiveNavigation(items);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <TabsList className={cn(
          "flex-1 mr-2",
          isMobile ? "grid-cols-3" : `grid-cols-${Math.min(visibleItems.length, 6)}`,
          "grid w-full max-w-full overflow-hidden"
        )}>
          {visibleItems.map((item) => (
            <TabsTrigger 
              key={item.id} 
              value={item.id} 
              className={cn(
                "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2",
                "min-w-0 flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "transition-all duration-200 hover:bg-muted"
              )}
            >
              <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{item.label}</span>
              <span className="sm:hidden text-xs truncate max-w-[60px]">
                {item.label.split(' ')[0]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {hasHiddenItems && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0 px-2 sm:px-3">
                <MoreHorizontal className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg">
              {hiddenItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {children}
    </Tabs>
  );
}
