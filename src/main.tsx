import '@mantine/core/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import the service worker registration
import { registerSW } from 'virtual:pwa-register';

// Register the service worker immediately
registerSW({
  onNeedRefresh() {
    console.log('[PWA] New content available, please refresh');
  },
  onOfflineReady() {
    console.log('[PWA] Application ready to work offline');
  },
  onRegistered(registration) {
    console.log('[PWA] Service worker registered', registration);
  },
  onRegisterError(error) {
    console.error('[PWA] Service worker registration error', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
