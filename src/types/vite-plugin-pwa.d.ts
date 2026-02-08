declare module 'virtual:pwa-register/react' {
  export interface RegisterSWOptions {
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export interface RegisterSWReturn {
    offlineReady: boolean;
    needRefresh: boolean;
    updateServiceWorker: (() => void) | undefined;
  }

  export function useRegisterSW(options?: RegisterSWOptions): RegisterSWReturn;
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function registerSW(options?: RegisterSWOptions): void;
}
