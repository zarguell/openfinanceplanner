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
