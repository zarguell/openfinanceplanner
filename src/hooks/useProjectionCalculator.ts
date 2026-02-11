import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { calculateProjection } from '@/core/projection';

/**
 * Custom hook that automatically calculates financial projections when
 * user profile data changes and stores the results in the global store.
 *
 * This hook should be used in the main App component to ensure projections
 * are calculated whenever profile data is updated.
 *
 * Features:
 * - 300ms debounce to prevent excessive calculations during rapid input
 * - Cleanup on unmount to prevent memory leaks
 * - Error handling with automatic projection clearing
 */
export function useProjectionCalculator() {
  const profile = useStore((state) => state.profile);

  // Store timeout reference for debounce cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    // Clear any pending calculation timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce calculation by 300ms
    timeoutRef.current = setTimeout(() => {
      // Only calculate projections if we have a valid profile
      if (profile) {
        try {
          const projection = calculateProjection(profile);
          // Use store directly to avoid extracting functions
          useStore.getState().setProjection(projection);
        } catch (error) {
          console.error('Error calculating projection:', error);
          // Clear projection on error
          useStore.getState().clearProjection();
        }
      } else {
        // Clear projection if no profile
        useStore.getState().clearProjection();
      }
    }, 300);

    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [profile]); // Only depend on profile, not on store functions
}
