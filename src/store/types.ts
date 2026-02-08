import type { UserProfile, SimulationResult } from '@/core/types'

/**
 * Profile slice state and actions
 */
export interface ProfileSlice {
  /** User profile data */
  profile: UserProfile | null
  /** Set the user profile */
  setProfile: (profile: UserProfile) => void
  /** Clear the user profile */
  clearProfile: () => void
}

/**
 * Projection slice state and actions
 */
export interface ProjectionSlice {
  /** Projection results array */
  projection: SimulationResult[] | null
  /** Set the projection results */
  setProjection: (projection: SimulationResult[]) => void
  /** Clear the projection results */
  clearProjection: () => void
}

/**
 * Hydration tracking slice
 *
 * Used to prevent UI flash and loading issues during async store hydration.
 * @see https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
 */
export interface HydrationSlice {
  /** Whether the store has finished hydrating from storage */
  _hasHydrated: boolean
  /** Set the hydration state */
  setHasHydrated: (state: boolean) => void
}

/**
 * Combined store state type
 *
 * Includes profile, projection, and hydration slices.
 */
export type StoreState = ProfileSlice & ProjectionSlice & HydrationSlice
