import { describe, it, expect } from 'vitest';
import {
  generateRandomReturns,
  runMonteCarloSimulation,
  calculatePercentiles,
  calculateChanceOfSuccess,
} from './index';

describe('Monte Carlo Engine', () => {
  describe('generateRandomReturns', () => {
    it('should generate the correct number of returns', () => {
      const returns = generateRandomReturns({
        type: 'random',
        meanReturn: 7,
        volatility: 15,
        years: 10,
        seed: 42,
      });
      expect(returns).toHaveLength(10);
    });

    it('should use mean return as the average', () => {
      const returns = generateRandomReturns({
        type: 'random',
        meanReturn: 7,
        volatility: 15,
        years: 1000,
        seed: 42,
      });
      const average =
        returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length;
      expect(average).toBeCloseTo(7, 0);
    });

    it('should respect volatility parameter', () => {
      const lowVolatility = generateRandomReturns({
        type: 'random',
        meanReturn: 7,
        volatility: 5,
        years: 1000,
        seed: 42,
      });
      const highVolatility = generateRandomReturns({
        type: 'random',
        meanReturn: 7,
        volatility: 20,
        years: 1000,
        seed: 43,
      });

      const lowVariance = calculateVariance(lowVolatility);
      const highVariance = calculateVariance(highVolatility);

      expect(highVariance).toBeGreaterThan(lowVariance * 3);
    });

    it('should be deterministic with same seed', () => {
      const returns1 = generateRandomReturns({
        type: 'random',
        meanReturn: 7,
        volatility: 15,
        years: 10,
        seed: 42,
      });
      const returns2 = generateRandomReturns({
        type: 'random',
        meanReturn: 7,
        volatility: 15,
        years: 10,
        seed: 42,
      });
      expect(returns1).toEqual(returns2);
    });
  });

  describe('runMonteCarloSimulation', () => {
    it('should generate the specified number of simulations', () => {
      const profile = createTestProfile();
      const returnSequences = generateReturnSequencesWithConfig(100, 30);
      const simulations = runMonteCarloSimulation({
        profile,
        numSimulations: 100,
        returnSequences,
      });
      expect(simulations).toHaveLength(100);
    });

    it('should calculate yearly balances for each simulation', () => {
      const profile = createTestProfile();
      const returnSequences = generateReturnSequencesWithConfig(10, 30);
      const simulations = runMonteCarloSimulation({
        profile,
        numSimulations: 10,
        returnSequences,
      });

      simulations.forEach((sim) => {
        expect(sim.yearlyBalances).toBeDefined();
        expect(sim.yearlyBalances.length).toBeGreaterThan(0);
      });
    });

    it('should track whether each simulation was successful', () => {
      const profile = createTestProfile();
      const returnSequences = generateReturnSequencesWithConfig(100, 30);
      const simulations = runMonteCarloSimulation({
        profile,
        numSimulations: 100,
        returnSequences,
      });

      simulations.forEach((sim) => {
        expect(typeof sim.successful).toBe('boolean');
      });
    });

    it('should handle profiles with multiple accounts', () => {
      const profile = createTestProfileWithAccounts();
      const returnSequences = generateReturnSequencesWithConfig(10, 30);
      const simulations = runMonteCarloSimulation({
        profile,
        numSimulations: 10,
        returnSequences,
      });

      expect(simulations).toHaveLength(10);
    });
  });

  describe('calculatePercentiles', () => {
    it('should calculate percentiles correctly for valid data', () => {
      const simulations = generateTestSimulations(100, 50);
      const percentiles = calculatePercentiles(
        simulations,
        [10, 25, 50, 75, 90]
      );

      expect(percentiles[10]).toBeDefined();
      expect(percentiles[25]).toBeDefined();
      expect(percentiles[50]).toBeDefined();
      expect(percentiles[75]).toBeDefined();
      expect(percentiles[90]).toBeDefined();
    });

    it('should return empty object for empty simulations', () => {
      const percentiles = calculatePercentiles([], [10, 25, 50]);
      expect(percentiles).toEqual({});
    });

    it('should handle varying number of years across simulations', () => {
      const simulations = generateVaryingLengthSimulations(50);
      const percentiles = calculatePercentiles(simulations, [50]);

      expect(percentiles[50]).toBeDefined();
    });
  });

  describe('calculateChanceOfSuccess', () => {
    it('should calculate success rate as percentage', () => {
      const simulations = generateTestSimulations(100, 70);
      const chance = calculateChanceOfSuccess(simulations);

      expect(chance.successRate).toBeGreaterThanOrEqual(0);
      expect(chance.successRate).toBeLessThanOrEqual(100);
    });

    it('should return 0 for all failed simulations', () => {
      const simulations = generateTestSimulations(100, 0);
      const chance = calculateChanceOfSuccess(simulations);

      expect(chance.successRate).toBe(0);
    });

    it('should return 100 for all successful simulations', () => {
      const simulations = generateTestSimulations(100, 100);
      const chance = calculateChanceOfSuccess(simulations);

      expect(chance.successRate).toBe(100);
    });

    it('should handle mixed success rates correctly', () => {
      const simulations = generateTestSimulations(200, 50);
      const chance = calculateChanceOfSuccess(simulations);

      expect(chance.successRate).toBeGreaterThan(0);
      expect(chance.successRate).toBeLessThan(100);
    });
  });
});

function calculateVariance(returns: readonly number[]): number {
  const mean =
    returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length;
  return (
    returns.reduce((sum: number, r: number) => sum + (r - mean) ** 2, 0) /
    returns.length
  );
}

function createTestProfile() {
  return {
    age: 40,
    currentSavings: 500000,
    annualGrowthRate: 7,
    annualSpending: 50000,
    projectionSettings: {
      inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
      tax: {
        ordinaryIncomeRate: 22,
        capitalGainsRate: 15,
        applyTaxes: false,
      },
      withdrawalStrategy: 'proportional' as const,
      retirementAge: 65,
      maxProjectionYears: 30,
    },
  };
}

function createTestProfileWithAccounts() {
  return {
    age: 40,
    currentSavings: 500000,
    annualGrowthRate: 7,
    annualSpending: 50000,
    accounts: [
      {
        id: 'acct1',
        name: 'Taxable',
        type: 'taxable' as const,
        balance: 300000,
        taxCharacteristics: 'taxable' as const,
      },
      {
        id: 'acct2',
        name: '401k',
        type: 'tax-advantaged' as const,
        balance: 200000,
        taxCharacteristics: 'tax-deferred' as const,
        accountType: '401k' as const,
      },
    ],
    projectionSettings: {
      inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
      tax: {
        ordinaryIncomeRate: 22,
        capitalGainsRate: 15,
        applyTaxes: false,
      },
      withdrawalStrategy: 'proportional' as const,
      retirementAge: 65,
      maxProjectionYears: 30,
    },
  };
}

function generateReturnSequencesWithConfig(
  count: number,
  years: number
): number[][] {
  return Array.from({ length: count }, () =>
    Array.from({ length: years }, () => Math.random() * 20 - 5)
  );
}

function generateTestSimulations(count: number, successRate: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `sim-${i}`,
    yearlyBalances: Array.from({ length: 30 }, () => Math.random() * 1000000),
    successful: Math.random() * 100 < successRate,
  }));
}

function generateVaryingLengthSimulations(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `sim-${i}`,
    yearlyBalances: Array.from(
      { length: 20 + (i % 10) },
      () => Math.random() * 1000000
    ),
    successful: true,
  }));
}
