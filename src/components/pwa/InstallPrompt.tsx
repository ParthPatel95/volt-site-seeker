import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { useIsMobile } from '@/hooks/use-mobile';

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const isMobile = useIsMobile();
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    promptInstall, 
    dismissPrompt, 
    wasPromptDismissed 
  } = usePwaInstall();

  // Show prompt after a delay, only on mobile
  useEffect(() => {
    if (!isMobile || isInstalled || wasPromptDismissed || !isInstallable) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [isMobile, isInstalled, wasPromptDismissed, isInstallable]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const installed = await promptInstall();
      if (installed) {
        setIsVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
    setShowIOSInstructions(false);
  };

  if (!isMobile || isInstalled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {!showIOSInstructions ? (
              // Main prompt
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Install WattByte</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Add to your home screen for quick access
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleDismiss}
                  >
                    Maybe Later
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleInstall}
                  >
                    Install
                  </Button>
                </div>
              </div>
            ) : (
              // iOS Instructions
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Add to Home Screen</h3>
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Tap the</span>
                      <Share className="w-4 h-4 text-primary" />
                      <span>Share button</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Scroll and tap</span>
                      <Plus className="w-4 h-4 text-primary" />
                      <span>"Add to Home Screen"</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={handleDismiss}
                >
                  Got it!
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
