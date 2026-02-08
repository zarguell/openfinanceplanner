import { useRegisterSW } from 'virtual:pwa-register/react';

interface UsePWAReturn {
  offlineReady: boolean;
  needRefresh: boolean;
  updateServiceWorker: (() => void) | undefined;
}

/**
 * Custom hook for managing PWA service worker registration and updates.
 *
 * This hook wraps the useRegisterSW hook from vite-plugin-pwa to provide:
 * - Service worker registration with logging
 * - Error handling for registration failures
 * - State tracking for offline readiness and available updates
 * - Update service worker function for applying new content
 *
 * @returns Object containing offlineReady, needRefresh states and updateServiceWorker function
 */
export function usePWA(): UsePWAReturn {
  const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('[PWA] Service Worker registered', swUrl, r);
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration error', error);
    },
  });

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  };
}
