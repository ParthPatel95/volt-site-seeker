import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ScanBarcode, 
  Bell, 
  MoreHorizontal,
  Folder,
  History,
  Tags,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type InventoryTab = 'dashboard' | 'items' | 'scan' | 'alerts' | 'groups' | 'transactions' | 'categories';

interface InventoryBottomNavProps {
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  alertsCount: number;
  itemsCount: number;
  onScan: () => void;
}

interface NavItem {
  id: InventoryTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  action?: () => void;
}

export function InventoryBottomNav({
  activeTab,
  onTabChange,
  alertsCount,
  itemsCount,
  onScan,
}: InventoryBottomNavProps) {
  const [showMore, setShowMore] = React.useState(false);

  const mainItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'items', label: 'Items', icon: Package, badge: itemsCount },
    { id: 'scan', label: 'Scan', icon: ScanBarcode, action: onScan },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertsCount > 0 ? alertsCount : undefined },
  ];

  const moreItems: NavItem[] = [
    { id: 'groups', label: 'Groups', icon: Folder },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'categories', label: 'Categories', icon: Tags },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else {
      onTabChange(item.id);
    }
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-xl border-t border-border",
        "pb-safe lg:hidden"
      )}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {mainItems.map((item) => {
          const isActive = activeTab === item.id;
          const isScan = item.id === 'scan';
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[60px]",
                "rounded-xl transition-all duration-200",
                "active:scale-95 touch-manipulation",
                isScan && "mx-1"
              )}
            >
              {/* Active indicator */}
              {isActive && !isScan && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              
              {/* Icon container */}
              <div className={cn(
                "relative flex items-center justify-center",
                isScan ? "w-12 h-12 -mt-4 rounded-full bg-primary shadow-lg" : "w-6 h-6"
              )}>
                <item.icon 
                  className={cn(
                    "transition-colors duration-200",
                    isScan 
                      ? "w-5 h-5 text-primary-foreground" 
                      : cn(
                          "w-5 h-5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )
                  )} 
                />
                
                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && !isScan && (
                  <Badge 
                    variant={item.id === 'alerts' ? 'destructive' : 'secondary'}
                    className={cn(
                      "absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 text-[10px] font-medium",
                      "flex items-center justify-center"
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                isScan 
                  ? "text-primary mt-1" 
                  : isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More menu */}
        <Popover open={showMore} onOpenChange={setShowMore}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[60px]",
                "rounded-xl transition-all duration-200",
                "active:scale-95 touch-manipulation"
              )}
            >
              {['groups', 'transactions', 'categories'].includes(activeTab) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative w-6 h-6 flex items-center justify-center">
                <MoreHorizontal 
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    ['groups', 'transactions', 'categories'].includes(activeTab) 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                ['groups', 'transactions', 'categories'].includes(activeTab) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}>
                More
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="end" 
            className="w-48 p-2"
            sideOffset={8}
          >
            <div className="space-y-1">
              {moreItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setShowMore(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                      "text-sm font-medium transition-colors",
                      "active:scale-[0.98] touch-manipulation",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-accent text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.nav>
  );
}
