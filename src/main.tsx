import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Declare the global function types
declare global {
  interface Window {
    __hideAppLoader?: () => void;
    __showAppError?: () => void;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // Hide loader after React mounts
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof window.__hideAppLoader === 'function') {
          window.__hideAppLoader();
        }
      });
    });
  } catch (error) {
    console.error('Failed to render application:', error);
    if (typeof window.__showAppError === 'function') {
      window.__showAppError();
    }
  }
} else {
  console.error('Root element not found');
  if (typeof window.__showAppError === 'function') {
    window.__showAppError();
  }
}
