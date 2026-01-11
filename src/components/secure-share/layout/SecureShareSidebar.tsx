import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Link as LinkIcon, 
  Package, 
  BarChart3, 
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecureShareNavItem } from './SecureShareNavItem';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export type SecureShareView = 'documents' | 'links' | 'bundles' | 'analytics' | 'settings';

const navItems: { id: SecureShareView; label: string; icon: typeof FileText }[] = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'bundles', label: 'Bundles', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SecureShareSidebarProps {
  currentView: SecureShareView;
  onViewChange: (view: SecureShareView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  documentCount?: number;
  linkCount?: number;
  bundleCount?: number;
  activeViewers?: number;
  onUploadDocument?: () => void;
  onCreateLink?: () => void;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SecureShareSidebar({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  documentCount = 0,
  linkCount = 0,
  bundleCount = 0,
  activeViewers = 0,
  onUploadDocument,
  onCreateLink,
  isMobile = false,
  isMobileOpen = false,
  onMobileClose
}: SecureShareSidebarProps) {
  const getBadge = (id: SecureShareView) => {
    if (id === 'documents') return documentCount;
    if (id === 'links') return linkCount;
    if (id === 'bundles') return bundleCount;
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
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        {!showCollapsed && (
          <div>
            <span className="font-bold text-lg text-foreground whitespace-nowrap">
              Secure Share
            </span>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Document sharing</p>
          </div>
        )}
      </div>

      {/* Live Viewers Indicator */}
      {activeViewers > 0 && (
        <div className={cn(
          "mx-3 mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20",
          showCollapsed && "mx-2 p-2"
        )}>
          <div className={cn(
            "flex items-center gap-2",
            showCollapsed && "justify-center"
          )}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            {!showCollapsed && (
              <span className="text-sm font-medium text-green-600">
                {activeViewers} viewer{activeViewers !== 1 ? 's' : ''} online
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <SecureShareNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.id}
              isCollapsed={showCollapsed}
              onClick={() => onViewChange(item.id)}
              badge={getBadge(item.id)}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Quick Actions */}
      {!showCollapsed ? (
        <div className="p-3 border-t border-border space-y-2">
          <Button 
            className="w-full gap-2" 
            size="sm"
            onClick={onUploadDocument}
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            size="sm"
            onClick={onCreateLink}
          >
            <Plus className="w-4 h-4" />
            Create Link
          </Button>
        </div>
      ) : (
        <div className="p-2 border-t border-border space-y-1">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onUploadDocument} 
            title="Upload Document"
            className="w-full"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onCreateLink} 
            title="Create Link"
            className="w-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

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