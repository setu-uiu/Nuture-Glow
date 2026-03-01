import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { reportWebVitals } from './utils/webVitals';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Start collecting Web Vitals (FCP, LCP, CLS, FID, INP, TTFB)
reportWebVitals();
