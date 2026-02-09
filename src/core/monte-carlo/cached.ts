import { createMemoizedFunction } from '@/core/cache';
import { runMonteCarloAnalysis } from './index';
import type {
  EnhancedUserProfile,
  MonteCarloConfig,
  MonteCarloSimulationResult,
  ChanceOfSuccess,
  PercentileBandData,
} from '@/core/types';

type MonteCarloAnalysisResult = {
  simulations: readonly MonteCarloSimulationResult[];
  chanceOfSuccess: ChanceOfSuccess;
  percentileBands: PercentileBandData[];
};

function runMonteCarloAnalysisWrapper(
  profile: EnhancedUserProfile,
  config: MonteCarloConfig
): MonteCarloAnalysisResult {
  return runMonteCarloAnalysis(profile, config);
}

const monteCarloCache = createMemoizedFunction(
  runMonteCarloAnalysisWrapper as (
    ...args: unknown[]
  ) => MonteCarloAnalysisResult,
  {
    maxSize: 5,
    ttl: 120000,
    keyGenerator: (profile, config) => JSON.stringify({ profile, config }),
  }
);

export function getCachedMonteCarloAnalysis(
  profile: EnhancedUserProfile,
  config: MonteCarloConfig
): MonteCarloAnalysisResult {
  return monteCarloCache(profile, config);
}

export function clearMonteCarloCache(): void {
  monteCarloCache.clear();
}

export function getMonteCarloCacheSize(): number {
  return monteCarloCache.size;
}
