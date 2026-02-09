import { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

/**
 * Custom IndexedDB storage adapter for Zustand persist middleware.
 *
 * Uses idb-keyval for async IndexedDB operations following the official
 * Zustand documentation pattern for custom storage engines.
 *
 * @see https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-use-a-custom-storage-engine
 */
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};
