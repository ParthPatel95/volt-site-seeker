import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { useIsMobile } from '@/hooks/use-mobile';

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const isMobile = useIsMobile();
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    promptInstall, 
    dismissPrompt, 
    wasPromptDismissed,
    hasDeferredPrompt 
  } = usePwaInstall();

  // Show prompt after a delay, only on mobile when not installed
  useEffect(() => {
    if (!isMobile || isInstalled || wasPromptDismissed) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [isMobile, isInstalled, wasPromptDismissed]);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS users need manual instructions
      setShowIOSInstructions(true);
    } else if (hasDeferredPrompt) {
      // Android/Chrome with native prompt available
      setIsInstalling(true);
      const installed = await promptInstall();
      setIsInstalling(false);
      if (installed) {
        setIsVisible(false);
      }
    } else {
      // Android without prompt (Firefox, Edge, etc.) - show manual instructions
      setShowIOSInstructions(true);
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
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-background border border-border">
                    <img 
                      src="/lovable-uploads/bf2b6676-a2b8-43f6-9ed1-f768a22b71c0.png" 
                      alt="WattByte" 
                      className="w-full h-full object-contain p-1"
                    />
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
                    disabled={isInstalling}
                  >
                    {isInstalling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      'Install'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // iOS/Manual Instructions
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border">
                      <img 
                        src="/lovable-uploads/bf2b6676-a2b8-43f6-9ed1-f768a22b71c0.png" 
                        alt="WattByte" 
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground">Add to Home Screen</h3>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                
                {isIOS && (
                  <p className="text-xs text-muted-foreground mb-3">
                    iOS requires manual installation. Follow these steps:
                  </p>
                )}
                
                <div className="space-y-3">
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">1</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <span>Tap the</span>
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary/10 border border-primary/20">
                        <Share className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">Share</span>
                      <span>button</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ArrowDown className="w-4 h-4 text-muted-foreground animate-bounce" />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">2</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <span>Tap</span>
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary/10 border border-primary/20">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">"Add to Home Screen"</span>
                    </div>
                  </motion.div>
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
