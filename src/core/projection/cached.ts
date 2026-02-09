import { createMemoizedFunction } from '@/core/cache';
import { calculateProjection } from './index';
import type { UserProfile, SimulationResult } from '@/core/types';

const projectionCache = createMemoizedFunction(
  calculateProjection as (...args: unknown[]) => SimulationResult[],
  {
    maxSize: 10,
    ttl: 60000,
  }
);

export function getCachedProjection(profile: UserProfile): SimulationResult[] {
  return projectionCache(profile) as SimulationResult[];
}

export function clearProjectionCache(): void {
  projectionCache.clear();
}

export function getProjectionCacheSize(): number {
  return projectionCache.size;
}
