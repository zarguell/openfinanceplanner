import { describe, it, expect, test } from 'vitest';
import { calculateProjection } from './index';
import type { UserProfile } from '@/core/types';

describe('calculateProjection', () => {
  it('should calculate year-by-year projection for typical profile', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    // Should project until age 100 (70 years)
    expect(result).toHaveLength(70);

    // First year calculation
    expect(result[0].year).toBe(0);
    expect(result[0].age).toBe(30);
    expect(result[0].startingBalance).toBe(100000);
    expect(result[0].growth).toBeCloseTo(7000, 0); // 100000 * 0.07
    expect(result[0].spending).toBe(40000);
    expect(result[0].endingBalance).toBeCloseTo(67000, 0); // 100000 + 7000 - 40000
  });

  it('should project until age 100', () => {
    const profile: UserProfile = {
      age: 50,
      currentSavings: 500000,
      annualGrowthRate: 5,
      annualSpending: 60000,
    };

    const result = calculateProjection(profile);

    expect(result).toHaveLength(50); // Until age 100
    expect(result[0].age).toBe(50);
    expect(result[result.length - 1].age).toBe(99); // Last year ends at age 99 (projection for age 100)
  });

  it('should handle zero growth rate', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 0,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBe(0);
    expect(result[0].endingBalance).toBe(60000); // 100000 - 40000
  });

  it('should handle zero spending', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 0,
    };

    const result = calculateProjection(profile);

    expect(result[0].spending).toBe(0);
    expect(result[0].endingBalance).toBeCloseTo(107000, 0); // 100000 + 7000
  });

  it('should prevent negative balances (floor at zero)', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 10000,
      annualGrowthRate: 5,
      annualSpending: 50000, // High spending depletes savings quickly
    };

    const result = calculateProjection(profile);

    // Balance should never go negative
    result.forEach((year) => {
      expect(year.endingBalance).toBeGreaterThanOrEqual(0);
    });

    // Once balance hits zero, it stays zero
    const zeroYear = result.findIndex((y) => y.endingBalance === 0);
    if (zeroYear !== -1) {
      for (let i = zeroYear; i < result.length; i++) {
        expect(result[i].endingBalance).toBe(0);
      }
    }
  });

  it('should handle age 100 (no projection needed)', () => {
    const profile: UserProfile = {
      age: 100,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result).toHaveLength(0); // No years to project
  });

  it('should handle age 0 (100-year projection)', () => {
    const profile: UserProfile = {
      age: 0,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result).toHaveLength(100); // Project until age 100
    expect(result[0].age).toBe(0);
    expect(result[result.length - 1].age).toBe(99);
  });

  it('should handle zero savings', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 0,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].startingBalance).toBe(0);
    expect(result[0].growth).toBe(0);
    expect(result[0].endingBalance).toBe(0); // Floor at zero
  });

  it('should be deterministic (same input produces same output)', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result1 = calculateProjection(profile);
    const result2 = calculateProjection(profile);

    expect(result1).toEqual(result2);
  });

  it('should handle decimal growth rates precisely', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBeCloseTo(7500, 0); // 100000 * 0.075
    expect(result[0].endingBalance).toBeCloseTo(67500, 0); // 100000 + 7500 - 40000
  });

  test.each([
    [30, 100000, 7, 40000, 70, 'typical retirement'],
    [50, 500000, 5, 60000, 50, 'late starter'],
    [25, 50000, 8, 30000, 75, 'early starter'],
    [40, 250000, 6, 50000, 60, 'mid-career'],
  ])(
    'calculates projection for %s',
    (age, savings, rate, spending, expectedYears, _scenario) => {
      const profile: UserProfile = {
        age,
        currentSavings: savings,
        annualGrowthRate: rate,
        annualSpending: spending,
      };

      const result = calculateProjection(profile);

      expect(result).toHaveLength(expectedYears);
      expect(result[0].age).toBe(age);
    }
  );

  it('should ensure year progression is sequential', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    for (let i = 0; i < result.length; i++) {
      expect(result[i].year).toBe(i);
    }
  });

  it('should ensure age progression is sequential', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    for (let i = 0; i < result.length; i++) {
      expect(result[i].age).toBe(30 + i);
    }
  });
});

describe('calculateProjection - Edge Cases', () => {
  it('should handle very large savings amounts', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 10000000, // 10 million
      annualGrowthRate: 7.0,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].startingBalance).toBe(10000000);
    expect(result[0].growth).toBeCloseTo(700000, 4);
    expect(result[0].endingBalance).toBeCloseTo(10660000, 2);
  });

  it('should handle very small savings amounts', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 0.01, // 1 cent
      annualGrowthRate: 7.0,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].startingBalance).toBe(0.01);
    expect(result[0].endingBalance).toBe(0); // Floor at 0
  });

  it('should handle floating-point precision correctly', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100.1,
      annualGrowthRate: 7.7,
      annualSpending: 50.5,
    };

    const result = calculateProjection(profile);

    // Floating-point math: 100.1 * 0.077 = 7.7077
    expect(result[0].growth).toBeCloseTo(7.7077, 4);
    // 100.1 + 7.7077 - 50.5 = 57.3077
    expect(result[0].endingBalance).toBeCloseTo(57.3077, 4);
  });

  it('should handle growth rate with many decimal places', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.123456789,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBeGreaterThan(0);
    expect(result[0].endingBalance).toBeGreaterThan(0);
  });

  it('should handle extremely high growth rate', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 100, // 100% growth
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBe(100000); // 100k * 1.0
    expect(result[0].endingBalance).toBe(160000); // 100k + 100k - 40k
  });

  it('should handle zero growth with high spending', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 50000,
      annualGrowthRate: 0,
      annualSpending: 60000,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBe(0);
    expect(result[0].endingBalance).toBe(0); // Floor at 0
  });

  it('should handle spending exactly equal to balance', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 0,
      annualSpending: 100000,
    };

    const result = calculateProjection(profile);

    expect(result[0].endingBalance).toBe(0);
  });

  it('should handle negative growth rate (market loss)', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: -10, // 10% loss
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBe(-10000); // 100k * -0.10
    expect(result[0].endingBalance).toBe(50000); // 100k - 10k - 40k
  });

  it('should handle negative growth with zero spending', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: -5,
      annualSpending: 0,
    };

    const result = calculateProjection(profile);

    expect(result[0].growth).toBe(-5000);
    expect(result[0].endingBalance).toBe(95000);
  });
});

describe('calculateProjection - Future Extensibility', () => {
  it('should support multi-year projection structure', () => {
    // This test documents the intention to support multi-year projections
    // Current implementation projects until age 100
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.0,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    // Current implementation: projects until age 100 (70 years)
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].year).toBe(0);

    // Structure supports custom projection horizons
    // Future: add projectionYears parameter to UserProfile
  });
});
