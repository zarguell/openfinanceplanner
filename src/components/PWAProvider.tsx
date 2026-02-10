import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * TypeScript extension for the beforeinstallprompt event
 * This is not part of the standard DOM API but is used by PWA-capable browsers
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA context interface
 * Provides PWA state and actions to child components
 */
interface PWAContextValue {
  // Service worker state
  offlineReady: boolean;
  needRefresh: boolean;
  updateServiceWorker: (() => void) | undefined;

  // Install prompt state
  canInstall: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextValue | undefined>(undefined);

/**
 * Props for PWAProvider component
 */
interface PWAProviderProps {
  children: ReactNode;
}

/**
 * PWAProvider Component
 *
 * Manages global PWA state including:
 * - Service worker registration and updates
 * - Install prompt handling
 * - Offline readiness
 *
 * This provider wraps the useRegisterSW hook and beforeinstallprompt event
 * to provide a unified PWA context to child components.
 *
 * @example
 * ```tsx
 * <PWAProvider>
 *   <App />
 * </PWAProvider>
 * ```
 */
export function PWAProvider({ children }: PWAProviderProps) {
  // Service worker state
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('[PWA] Service Worker registered', swUrl, registration);

      // Check for updates every hour
      if (registration) {
        setInterval(
          () => {
            registration.update();
            console.log('[PWA] Checking for updates');
          },
          60 * 60 * 1000
        );
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration error', error);
    },
  });

  // Install prompt state
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInstalled(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanInstall(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show that installation is available
      setCanInstall(true);
      console.log('[PWA] beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setCanInstall(false);

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  const contextValue: PWAContextValue = {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    canInstall,
    isInstalled,
    promptInstall,
  };

  return (
    <PWAContext.Provider value={contextValue}>{children}</PWAContext.Provider>
  );
}

/**
 * Hook to access PWA context
 * Throws an error if used outside of PWAProvider
 *
 * @example
 * ```tsx
 * const { offlineReady, needRefresh, canInstall, promptInstall } = usePWAContext();
 * ```
 */
export function usePWAContext(): PWAContextValue {
  const context = useContext(PWAContext);

  if (context === undefined) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }

  return context;
}
