/**
 * Zustand store type definitions
 *
 * Slice pattern separates state management into logical domains.
 * Each slice contains state properties and actions for that domain.
 */

import type { UserProfile, SimulationResult } from "@/core/types";

/**
 * User profile slice - manages user financial profile data
 */
export interface ProfileSlice {
  /** Current user profile (null if not set) */
  profile: UserProfile | null;
  /** Set the user profile */
  setProfile: (profile: UserProfile) => void;
  /** Clear the user profile */
  clearProfile: () => void;
}

/**
 * Projection slice - manages financial projection results
 */
export interface ProjectionSlice {
  /** Current projection results (null if not calculated) */
  projection: SimulationResult[] | null;
  /** Set the projection results */
  setProjection: (projection: SimulationResult[]) => void;
  /** Clear the projection results */
  clearProjection: () => void;
}

/**
 * Hydration slice - tracks persistence middleware hydration state
 *
 * Used by zustand persist middleware to indicate when storage
 * has been hydrated into state (prevents flash of empty state).
 */
export interface HydrationSlice {
  /** Whether persistence hydration has completed */
  _hasHydrated: boolean;
  /** Set the hydration state */
  setHasHydrated: (state: boolean) => void;
}

/**
 * Complete store state - union of all slices
 *
 * Combines all slice interfaces into a single store state type.
 */
export interface StoreState extends ProfileSlice, ProjectionSlice, HydrationSlice {}
