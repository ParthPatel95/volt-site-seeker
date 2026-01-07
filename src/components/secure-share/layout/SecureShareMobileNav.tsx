import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Link as LinkIcon, 
  Package, 
  BarChart3, 
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SecureShareView } from './SecureShareSidebar';

const quickNavItems: { id: SecureShareView; label: string; icon: typeof FileText }[] = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'bundles', label: 'Bundles', icon: Package },
];

const allNavItems: { id: SecureShareView; label: string; icon: typeof FileText }[] = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'bundles', label: 'Bundles', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SecureShareMobileNavProps {
  currentView: SecureShareView;
  onViewChange: (view: SecureShareView) => void;
}

export function SecureShareMobileNav({ currentView, onViewChange }: SecureShareMobileNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNavClick = (view: SecureShareView) => {
    onViewChange(view);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
        <nav className="flex items-center justify-around px-2 py-2">
          {quickNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.button>
            );
          })}
          
          {/* More Button */}
          <motion.button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
              (currentView === 'analytics' || currentView === 'settings')
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </motion.button>
        </nav>
      </div>

      {/* More Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>All Views</SheetTitle>
          </SheetHeader>
          <nav className="grid grid-cols-3 gap-3 py-4">
            {allNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
