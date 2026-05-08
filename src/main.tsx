import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { APP_VERSION, isVersionOutdated } from './constants/app-version';

// Declare global function types
declare global {
  interface Window {
    __hideAppLoader?: () => void;
    __showAppError?: () => void;
    __appMounted?: boolean;
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
if (isVersionOutdated(cachedVersion)) {
  window.localStorage.setItem('wattbyte_app_version', APP_VERSION);
  const host = window.location.hostname;
  const canRefreshServiceWorker = cachedVersion && 'serviceWorker' in navigator && !host.includes('lovableproject.com');
  if (canRefreshServiceWorker) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.update()))
      .catch((error) => console.warn('[PWA] Cache update check failed:', error));
  }
}

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AppWithLoader />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
  window.__showAppError?.();
}
