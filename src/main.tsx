import React, { useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { APP_VERSION, isVersionOutdated } from './constants/app-version';

if (typeof document !== 'undefined') {
  document.documentElement.dataset.appVersion = APP_VERSION;
}

// Automatic cache-busting on version change and preview/dev safety cleanup.
// If the previously-loaded APP_VERSION is older than this bundle's, or if a
// stale service worker/cache is still present in Lovable preview/dev, clear it
// and hard-reload once so the user never sees an older UI shell.
const VERSION_STORAGE_KEY = 'wattbyte:app-version';
const RELOAD_GUARD_KEY = 'wattbyte:app-version-reloaded';
const SW_CLEANUP_KEY = 'wattbyte:sw-cleanup-done';

if (typeof window !== 'undefined') {
  try {
    const isLovableHost =
      window.location.hostname === 'lovableproject.com' ||
      window.location.hostname.endsWith('.lovableproject.com') ||
      window.location.hostname === 'lovableproject-dev.com' ||
      window.location.hostname.endsWith('.lovableproject-dev.com') ||
      window.location.hostname === 'lovable.app' ||
      window.location.hostname.endsWith('.lovable.app') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const shouldForceSwOff = isLovableHost || window.location.search.includes('sw=off');
    const stored = localStorage.getItem(VERSION_STORAGE_KEY);
    const alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === APP_VERSION;
    const swCleanupDone = localStorage.getItem(SW_CLEANUP_KEY) === APP_VERSION;
    const versionChanged = stored !== null && isVersionOutdated(stored);
    // Trigger a one-time hard refresh if (a) the stored version is outdated,
    // or (b) we have never run the service-worker cleanup for this bundle —
    // covers users who loaded the app before the cache-bust mechanism shipped
    // and may still have a stale SW from an earlier deploy.
    const shouldHardRefresh = (versionChanged || !swCleanupDone || shouldForceSwOff) && !alreadyReloaded;

    if (shouldHardRefresh) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, APP_VERSION);
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
      localStorage.setItem(SW_CLEANUP_KEY, APP_VERSION);

      void (async () => {
        let removedStaleAssets = false;
        try {
          if ('caches' in window) {
            const names = await caches.keys();
            removedStaleAssets = removedStaleAssets || names.length > 0;
            await Promise.allSettled(names.map((n) => caches.delete(n)));
          }
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            removedStaleAssets = removedStaleAssets || regs.length > 0 || Boolean(navigator.serviceWorker.controller);
            await Promise.allSettled(regs.map((r) => r.unregister()));
          }
        } finally {
          if (versionChanged || removedStaleAssets) {
            const url = new URL(window.location.href);
            url.searchParams.set('v', APP_VERSION);
            if (shouldForceSwOff) url.searchParams.set('sw', 'off');
            window.location.replace(url.toString());
          } else {
            sessionStorage.removeItem(RELOAD_GUARD_KEY);
          }
        }
      })();
    } else {
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
      localStorage.setItem(SW_CLEANUP_KEY, APP_VERSION);
      if (alreadyReloaded) sessionStorage.removeItem(RELOAD_GUARD_KEY);
    }
  } catch {
    // localStorage / caches unavailable — fall through silently
  }
}

// Declare global function types
declare global {
  interface Window {
    __hideAppLoader?: () => void;
    __showAppError?: () => void;
    __appMounted?: boolean;
    __wattbyteRoot?: Root;
  }
}

// Wrapper component that hides loader AFTER React has actually rendered
function AppWithLoader() {
  useEffect(() => {
    // Mark app as mounted
    window.__appMounted = true;
    
    // Use requestAnimationFrame to ensure DOM has painted before hiding loader
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__hideAppLoader?.();
        document.getElementById('app-error')?.remove();
      });
    });
  }, []);

  return <App />;
}

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = window.__wattbyteRoot ?? createRoot(rootElement);
  window.__wattbyteRoot = root;
  root.render(
    <React.StrictMode>
      <AppWithLoader />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
  window.__showAppError?.();
}
