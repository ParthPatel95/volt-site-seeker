import React, { useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { APP_VERSION, isCurrentBundleStale, isVersionOutdated } from './constants/app-version';

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
      });
    });
  }, []);

  return <App />;
}

const rootElement = document.getElementById("root");

const cachedVersion = window.localStorage.getItem('wattbyte_app_version');
const host = window.location.hostname;
const isLovablePreview = host.includes('lovableproject.com') || host.includes('lovable.app') || host.includes('preview');

if (isLovablePreview && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .catch((error) => console.warn('[PWA] Preview service worker cleanup failed:', error));
}

if (isCurrentBundleStale(cachedVersion)) {
  if (!window.location.search.includes('__fresh=')) {
    const url = new URL(window.location.href);
    url.searchParams.set('__fresh', cachedVersion ?? APP_VERSION);
    window.location.replace(url.toString());
  }
} else if (isVersionOutdated(cachedVersion)) {
  window.localStorage.setItem('wattbyte_app_version', APP_VERSION);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(async (registrations) => {
        if (isLovablePreview) {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          return;
        }
        await Promise.all(registrations.map((registration) => registration.update()));
      })
      .then(() => {
        if (cachedVersion && !window.location.search.includes('__fresh=')) {
          const url = new URL(window.location.href);
          url.searchParams.set('__fresh', APP_VERSION);
          window.location.replace(url.toString());
        }
      })
      .catch((error) => console.warn('[PWA] Cache update check failed:', error));
  }
}

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
