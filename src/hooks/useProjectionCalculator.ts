import { useEffect } from 'react';
import { useStore } from '@/store';
import { calculateProjection } from '@/core/projection';

/**
 * Custom hook that automatically calculates financial projections when
 * user profile data changes and stores the results in the global store.
 *
 * This hook should be used in the main App component to ensure projections
 * are calculated whenever profile data is updated.
 */
export function useProjectionCalculator() {
  const profile = useStore((state) => state.profile);
  const setProjection = useStore((state) => state.setProjection);
  const clearProjection = useStore((state) => state.clearProjection);

  useEffect(() => {
    // Only calculate projections if we have a valid profile
    if (profile) {
      try {
        const projection = calculateProjection(profile);
        setProjection(projection);
      } catch (error) {
        console.error('Error calculating projection:', error);
        // Clear projection on error
        clearProjection();
      }
    } else {
      // Clear projection if no profile
      clearProjection();
    }
  }, [profile, setProjection, clearProjection]);
}
