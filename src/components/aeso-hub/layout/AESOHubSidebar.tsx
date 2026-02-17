import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Calculator, Brain, Server, Calendar, FileSpreadsheet,
  Activity, Wind, AlertTriangle, Target, MessageSquare,
  ChevronLeft, ChevronRight, ArrowLeft, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildNavItem } from '@/components/voltbuild/layout/VoltBuildNavItem';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export type AESOHubView =
  | 'market'
  | 'power-model'
  | 'generation'
  | 'forecast'
  | 'predictions'
  | 'datacenter'
  | 'outages-alerts'
  | 'historical'
  | 'analytics-export'
  | 'custom-dashboards'
  | 'telegram-alerts';

interface NavGroup {
  label: string;
  items: {
    id: AESOHubView;
    label: string;
    icon: typeof Zap;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Market',
    items: [
      { id: 'market', label: 'Market Data', icon: Zap },
      { id: 'power-model', label: 'Power Model', icon: Calculator },
      { id: 'generation', label: 'Generation', icon: Activity },
      { id: 'forecast', label: 'Forecasts', icon: Wind },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'predictions', label: 'AI Predictions', icon: Brain },
      { id: 'datacenter', label: 'Datacenter Control', icon: Server },
      { id: 'outages-alerts', label: 'Outages & Alerts', icon: AlertTriangle },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'historical', label: 'Historical', icon: Calendar },
      { id: 'analytics-export', label: 'Analytics Export', icon: FileSpreadsheet },
      { id: 'custom-dashboards', label: 'Dashboards', icon: Target },
      { id: 'telegram-alerts', label: 'Telegram Alerts', icon: MessageSquare },
    ],
  },
];

interface AESOHubSidebarProps {
  currentView: AESOHubView;
  onViewChange: (view: AESOHubView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AESOHubSidebar({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  isMobileOpen = false,
  onMobileClose,
}: AESOHubSidebarProps) {
  const SidebarInner = ({ showCollapsed = false }: { showCollapsed?: boolean }) => (
    <>
      {/* Back to VoltScout */}
      <Link
        to="/app"
        className={cn(
          'flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 border-b border-border transition-colors',
          showCollapsed && 'justify-center px-2'
        )}
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        {!showCollapsed && <span>Back to VoltScout</span>}
      </Link>

      {/* Branding */}
      <div className={cn('flex items-center gap-2 p-4 border-b border-border', showCollapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary-foreground" />
        </div>
        {!showCollapsed && <span className="font-bold text-lg text-foreground">AESO Hub</span>}
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
              {showCollapsed && idx > 0 && <Separator className="my-2 mx-auto w-8" />}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <VoltBuildNavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.id}
                    isCollapsed={showCollapsed}
                    onClick={() => onViewChange(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="p-2 border-t border-border">
          <motion.button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'transition-colors duration-200'
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

  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border flex flex-col">
          <SidebarInner showCollapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn('hidden lg:flex flex-col h-full bg-card border-r border-border relative flex-shrink-0')}
    >
      <SidebarInner showCollapsed={isCollapsed} />
    </motion.aside>
  );
}
