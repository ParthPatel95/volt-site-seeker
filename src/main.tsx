import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Hide the loading indicator once React mounts
const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 300);
  }
  // Clear the error timeout
  if (typeof window.__clearAppTimeout === 'function') {
    window.__clearAppTimeout();
  }
};

// Show error state on critical failure
const showError = () => {
  const loader = document.getElementById('app-loader');
  const error = document.getElementById('app-error');
  if (loader) loader.classList.add('hidden');
  if (error) error.classList.add('visible');
};

// Declare the global function type
declare global {
  interface Window {
    __clearAppTimeout?: () => void;
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
    // Hide loader after a short delay to ensure content is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(hideLoader);
    });
  } catch (error) {
    console.error('Failed to render application:', error);
    showError();
  }
} else {
  console.error('Root element not found');
  showError();
}
