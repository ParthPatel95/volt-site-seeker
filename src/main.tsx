import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Declare global function types
declare global {
  interface Window {
    __hideAppLoader?: () => void;
    __showAppError?: () => void;
    __appMounted?: boolean;
  }
}

// Wrapper component that hides loader AFTER React has actually mounted
function AppWithLoader() {
  useEffect(() => {
    // Mark app as mounted
    window.__appMounted = true;
    // Hide loader - this runs after React has rendered to DOM
    window.__hideAppLoader?.();
  }, []);

  return <App />;
}

const rootElement = document.getElementById("root");

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
