import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent iPad / iOS Safari pinch-zoom and double-tap zoom gestures
if (typeof document !== 'undefined') {
  const preventGesture = (e: Event) => e.preventDefault();
  document.addEventListener('gesturestart', preventGesture, { passive: false });
  document.addEventListener('gesturechange', preventGesture, { passive: false });
  document.addEventListener('gestureend', preventGesture, { passive: false });

  document.addEventListener(
    'dblclick',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      e.preventDefault();
    },
    { passive: false }
  );

  // Guard non-interactive surfaces (e.g. canvas/background) against rapid double-tap zoom
  // Buttons use CSS `touch-action: manipulation` so rapid tapping stays responsive without zooming
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, label')) return;
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
