import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Declare global function types
declare global {
  interface Window {
    __hideAppLoader?: () => void;
    __showAppError?: () => void;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // Hide loader after React mounts
  window.__hideAppLoader?.();
} else {
  console.error('Root element not found');
  window.__showAppError?.();
}
