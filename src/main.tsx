import React, { useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
