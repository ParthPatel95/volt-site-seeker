// Force rebuild: 2025-12-07T12:30:00
console.log('🔥 MAIN.TSX LOADED - JavaScript is running');

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🔥 IMPORTS COMPLETE - About to render');

const rootElement = document.getElementById("root");
console.log('🔥 ROOT ELEMENT:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('🔥 RENDER CALLED');
}
