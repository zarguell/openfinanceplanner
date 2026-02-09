import type { EnhancedUserProfile } from '@/core/types';
import type {
  ReturnSequence,
  ReturnSequenceConfig,
  MonteCarloSimulationResult,
  PercentileBandData,
  ChanceOfSuccess,
  MonteCarloConfig,
  HistoricalBacktestResult,
} from '@/core/types';

/**
 * Seeded random number generator for deterministic results
 *
 * Uses a simple LCG (Linear Congruential Generator) algorithm
 * to generate pseudo-random numbers that are reproducible with the same seed.
 */
function createSeededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
}

/**
 * Generate random returns based on mean and volatility using Box-Muller transform
 *
 * Uses Box-Muller transform to generate normally distributed random numbers
 * from uniform random numbers.
 *
 * @param config - Configuration for generating random returns
 * @returns Array of yearly returns
 */
export function generateRandomReturns(
  config: ReturnSequenceConfig
): ReturnSequence {
  const { meanReturn = 7, volatility = 15, years, seed } = config;

  const random = seed ? createSeededRandom(seed) : Math.random;
  const returns: number[] = [];

  for (let i = 0; i < years; i++) {
    const u1 = random();
    const u2 = random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    const return0 = meanReturn + volatility * z0;
    const return1 = meanReturn + volatility * z1;

    returns.push(return0);
    if (returns.length < years) {
      returns.push(return1);
    }
  }

  return returns.slice(0, years);
}

/**
 * Run Monte Carlo simulation with multiple return sequences
 *
 * @param config - Configuration for simulation
 * @returns Array of simulation results
 */
export function runMonteCarloSimulation(config: {
  profile: EnhancedUserProfile;
  numSimulations: number;
  returnSequences: readonly ReturnSequence[];
}): readonly MonteCarloSimulationResult[] {
  const { profile, numSimulations, returnSequences } = config;

  const simulations: MonteCarloSimulationResult[] = [];

  for (let i = 0; i < numSimulations; i++) {
    const yearlyBalances = simulateSingleRun(profile, returnSequences[i] || []);
    const successful = yearlyBalances.every((balance) => balance > 0);
    const depletionYearIndex = successful
      ? undefined
      : yearlyBalances.findIndex((balance) => balance <= 0);

    simulations.push({
      id: `sim-${i}-${Date.now()}`,
      yearlyBalances,
      successful,
      depletionYear:
        depletionYearIndex !== undefined && depletionYearIndex >= 0
          ? depletionYearIndex
          : undefined,
    });
  }

  return simulations;
}

/**
 * Simulate a single projection run with a specific return sequence
 *
 * Uses enhanced projection logic but applies custom yearly returns
 * instead of a fixed growth rate.
 */
function simulateSingleRun(
  profile: EnhancedUserProfile,
  returnSequence: ReturnSequence
): readonly number[] {
  const results: number[] = [];
  const settings = profile.projectionSettings || {
    inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
    tax: {
      ordinaryIncomeRate: 22,
      capitalGainsRate: 15,
      applyTaxes: false,
    },
    withdrawalStrategy: 'proportional',
    retirementAge: 65,
    maxProjectionYears: 100 - profile.age,
  };

  const yearsToProject = Math.min(
    settings.maxProjectionYears,
    100 - profile.age
  );

  let balance = profile.currentSavings;
  let spending = profile.annualSpending;
  let cumulativeInflation = 1;

  for (let year = 0; year < yearsToProject; year++) {
    const returnRate = returnSequence[year] || profile.annualGrowthRate;
    const growth = balance * (returnRate / 100);

    if (settings.inflation.rate > 0 && settings.inflation.adjustSpending) {
      cumulativeInflation *= 1 + settings.inflation.rate / 100;
      spending = profile.annualSpending * cumulativeInflation;
    }

    balance = balance + growth - spending;
    balance = Math.max(0, balance);

    results.push(balance);

    if (balance <= 0) break;
  }

  return results;
}

/**
 * Calculate percentile bands from simulation results
 *
 * @param simulations - Array of simulation results
 * @param percentiles - Array of percentiles to calculate (e.g., [10, 25, 50, 75, 90])
 * @returns Object mapping percentiles to arrays of yearly values
 */
export function calculatePercentiles(
  simulations: readonly MonteCarloSimulationResult[],
  percentiles: readonly number[]
): Record<number, readonly number[]> {
  if (simulations.length === 0) return {};

  const maxYears = Math.max(...simulations.map((s) => s.yearlyBalances.length));
  const percentileResults: Record<number, number[]> = {};

  for (const p of percentiles) {
    percentileResults[p] = [];
  }

  for (let year = 0; year < maxYears; year++) {
    const balancesForYear = simulations
      .map((sim) => sim.yearlyBalances[year])
      .filter((balance): balance is number => balance !== undefined);

    for (const p of percentiles) {
      const sortedBalances = [...balancesForYear].sort((a, b) => a - b);
      const percentileIndex = Math.floor((p / 100) * sortedBalances.length);
      const clampedIndex = Math.max(
        0,
        Math.min(percentileIndex, sortedBalances.length - 1)
      );
      percentileResults[p].push(sortedBalances[clampedIndex]);
    }
  }

  return percentileResults;
}

/**
 * Calculate chance of success from simulation results
 *
 * @param simulations - Array of simulation results
 * @returns Chance of success metrics
 */
export function calculateChanceOfSuccess(
  simulations: readonly MonteCarloSimulationResult[]
): ChanceOfSuccess {
  if (simulations.length === 0) {
    return {
      successRate: 0,
      successfulSimulations: 0,
      totalSimulations: 0,
      yearlySuccessRates: [],
    };
  }

  const successfulSimulations = simulations.filter((s) => s.successful).length;
  const successRate = (successfulSimulations / simulations.length) * 100;

  const maxYears = Math.max(...simulations.map((s) => s.yearlyBalances.length));
  const yearlySuccessRates: number[] = [];

  for (let year = 0; year < maxYears; year++) {
    const simulationsForYear = simulations.filter(
      (sim) => year < sim.yearlyBalances.length
    );
    const successfulForYear = simulationsForYear.filter(
      (sim) => sim.yearlyBalances[year] > 0
    ).length;
    yearlySuccessRates.push(
      simulationsForYear.length > 0
        ? (successfulForYear / simulationsForYear.length) * 100
        : 0
    );
  }

  return {
    successRate,
    successfulSimulations,
    totalSimulations: simulations.length,
    yearlySuccessRates,
  };
}

/**
 * Generate percentile band data for visualization
 *
 * @param simulations - Array of simulation results
 * @param percentiles - Array of percentiles to calculate
 * @param startAge - Starting age for projection
 * @returns Array of percentile band data points
 */
export function generatePercentileBandData(
  simulations: readonly MonteCarloSimulationResult[],
  percentiles: readonly number[],
  startAge: number
): PercentileBandData[] {
  const percentileValues = calculatePercentiles(simulations, percentiles);
  const maxYears = Object.values(percentileValues)[0]?.length || 0;

  const data: PercentileBandData[] = [];

  for (let year = 0; year < maxYears; year++) {
    const point: Record<string, number> = {
      year,
      age: startAge + year,
    };

    for (const p of percentiles) {
      point[p.toString()] = percentileValues[p]?.[year] || 0;
    }

    data.push(point as PercentileBandData);
  }

  return data;
}

/**
 * Generate return sequences for Monte Carlo simulation
 *
 * @param config - Monte Carlo configuration
 * @returns Array of return sequences
 */
export function generateReturnSequences(
  config: MonteCarloConfig
): readonly ReturnSequence[] {
  const { numSimulations, returnSequenceConfig, deterministic } = config;

  const sequences: ReturnSequence[] = [];

  for (let i = 0; i < numSimulations; i++) {
    const seed = deterministic
      ? returnSequenceConfig.seed || 42
      : (returnSequenceConfig.seed || 42) + i;

    const sequence = generateRandomReturns({
      ...returnSequenceConfig,
      seed,
    });

    sequences.push(sequence);
  }

  return sequences;
}

/**
 * Run complete Monte Carlo analysis
 *
 * @param profile - Enhanced user profile
 * @param config - Monte Carlo configuration
 * @returns Complete Monte Carlo analysis results
 */
export function runMonteCarloAnalysis(
  profile: EnhancedUserProfile,
  config: MonteCarloConfig
): {
  simulations: readonly MonteCarloSimulationResult[];
  chanceOfSuccess: ChanceOfSuccess;
  percentileBands: PercentileBandData[];
} {
  const returnSequences = generateReturnSequences(config);
  const simulations = runMonteCarloSimulation({
    profile,
    numSimulations: config.numSimulations,
    returnSequences,
  });

  const chanceOfSuccess = calculateChanceOfSuccess(simulations);
  const percentileBands = generatePercentileBandData(
    simulations,
    config.percentiles,
    profile.age
  );

  return {
    simulations,
    chanceOfSuccess,
    percentileBands,
  };
}

/**
 * Perform historical backtesting
 *
 * @param profile - Enhanced user profile
 * @param historicalReturns - Map of period names to return sequences
 * @returns Array of historical backtest results
 */
export function performHistoricalBacktest(
  profile: EnhancedUserProfile,
  historicalReturns: ReadonlyMap<string, ReturnSequence>
): readonly HistoricalBacktestResult[] {
  const results: HistoricalBacktestResult[] = [];

  for (const [period, returns] of historicalReturns) {
    const yearlyBalances = simulateSingleRun(profile, returns);
    const successful = yearlyBalances.every((balance) => balance > 0);
    const depletionYearIndex = successful
      ? undefined
      : yearlyBalances.findIndex((balance) => balance <= 0);

    const averageAnnualReturn =
      returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + (r - averageAnnualReturn) ** 2, 0) /
      returns.length;
    const volatility = Math.sqrt(variance);

    results.push({
      period,
      startYear: 0,
      endYear: returns.length - 1,
      result: {
        id: `backtest-${period}`,
        yearlyBalances,
        successful,
        depletionYear:
          depletionYearIndex !== undefined && depletionYearIndex >= 0
            ? depletionYearIndex
            : undefined,
      },
      averageAnnualReturn,
      volatility,
    });
  }

  return results;
}
