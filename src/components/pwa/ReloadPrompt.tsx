import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

/**
 * PWA Reload Prompt Component
 * 
 * Automatically detects when new content is available and reloads the page.
 * This ensures users always see the latest version without manual cache clearing.
 * 
 * Features:
 * - Checks for updates every 15 minutes
 * - Shows a brief toast notification before auto-reloading
 * - Automatically reloads after 2 seconds (no user action needed)
 * - Falls back to manual reload button if auto-reload fails
 */
export function ReloadPrompt() {
  const reloadAttempted = useRef(false);
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) return;
      
      console.log('[PWA] Service worker registered, setting up update checks');
      
      // Check for updates every 15 minutes
      const intervalId = setInterval(() => {
        console.log('[PWA] Checking for updates...');
        registration.update().catch((err) => {
          console.warn('[PWA] Update check failed:', err);
        });
      }, 15 * 60 * 1000); // 15 minutes
      
      // Also check immediately on registration
      registration.update().catch(() => {});
      
      // Cleanup on unmount
      return () => clearInterval(intervalId);
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error);
    },
  });

  useEffect(() => {
    if (needRefresh && !reloadAttempted.current) {
      reloadAttempted.current = true;
      
      console.log('[PWA] New content available, preparing to reload...');
      
      // Show toast notification
      const { dismiss } = toast({
        title: "Updating to latest version...",
        description: "The app will refresh automatically in a moment.",
        duration: 5000,
      });
      
      // Auto-reload after 2 seconds
      const reloadTimeout = setTimeout(() => {
        console.log('[PWA] Triggering service worker update and reload');
        updateServiceWorker(true).catch((err) => {
          console.error('[PWA] Auto-reload failed:', err);
          dismiss();
          
          // Show manual reload option if auto-reload fails
          toast({
            title: "Update available",
            description: "Please refresh the page to see the latest changes.",
            duration: 10000,
            action: (
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            ),
          });
        });
      }, 2000);
      
      return () => {
        clearTimeout(reloadTimeout);
      };
    }
  }, [needRefresh, updateServiceWorker]);

  // This component doesn't render anything visible
  // The toast notifications handle the UI
  return null;
}
