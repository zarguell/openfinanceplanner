import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StoreState } from './types'
import { indexedDBStorage } from './middleware/indexeddb'

/**
 * Global application store with IndexedDB persistence
 *
 * Uses Zustand with persist middleware for automatic state hydration.
 * Storage name 'open-finance-planner' used for IndexedDB key.
 *
 * @see https://zustand.docs.pmnd.rs/integrations/persisting-store-data
 */
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Profile slice
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),

      // Projection slice
      projection: null,
      setProjection: (projection) => set({ projection }),
      clearProjection: () => set({ projection: null }),

      // Hydration slice
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'open-finance-planner',
      storage: createJSONStorage(() => indexedDBStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
