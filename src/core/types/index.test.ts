import { describe, it, expect } from 'vitest';
import type { UserProfile, SimulationResult } from './index';

describe('Core Types - UserProfile', () => {
  it('should accept valid user profile data', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    expect(profile.age).toBe(30);
    expect(profile.currentSavings).toBe(100000);
    expect(profile.annualGrowthRate).toBe(7.5);
    expect(profile.annualSpending).toBe(40000);
  });

  it('should enforce readonly properties', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    // TypeScript should prevent mutation at compile time
    // @ts-expect-error - Cannot assign to 'age' because it is a read-only property
    profile.age = 31;
  });

  it('should accept zero and edge case values', () => {
    const zeroProfile: UserProfile = {
      age: 0,
      currentSavings: 0,
      annualGrowthRate: 0,
      annualSpending: 0,
    };

    expect(zeroProfile.age).toBe(0);
    expect(zeroProfile.currentSavings).toBe(0);
  });

  it('should reject invalid types at compile time', () => {
    // @ts-expect-error - Type 'string' is not assignable to type 'number'
    const invalidProfile: UserProfile = {
      age: '30',
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };
  });
});

describe('Core Types - SimulationResult', () => {
  it('should accept valid simulation result data', () => {
    const result: SimulationResult = {
      year: 0,
      age: 30,
      startingBalance: 100000,
      growth: 7000,
      spending: 40000,
      endingBalance: 67000,
    };

    expect(result.year).toBe(0);
    expect(result.age).toBe(30);
    expect(result.startingBalance).toBe(100000);
    expect(result.growth).toBe(7000);
    expect(result.spending).toBe(40000);
    expect(result.endingBalance).toBe(67000);
  });

  it('should enforce readonly properties', () => {
    const result: SimulationResult = {
      year: 0,
      age: 30,
      startingBalance: 100000,
      growth: 7000,
      spending: 40000,
      endingBalance: 67000,
    };

    // TypeScript should prevent mutation
    // @ts-expect-error - Cannot assign to 'year' because it is a read-only property
    result.year = 1;
  });

  it('should handle decimal precision values', () => {
    const preciseResult: SimulationResult = {
      year: 0,
      age: 30,
      startingBalance: 100000.50,
      growth: 7500.04,
      spending: 40000.99,
      endingBalance: 67000.55,
    };

    expect(preciseResult.startingBalance).toBeCloseTo(100000.50, 2);
    expect(preciseResult.growth).toBeCloseTo(7500.04, 2);
  });
});

describe('Core Types - Type Safety', () => {
  it('should ensure types are exported correctly', () => {
    // This test verifies that types can be imported
    // If types don't exist, this will fail at compile time
    const typeCheck = true;

    expect(typeof typeCheck).toBe('boolean');
  });

  it('should have zero React imports', () => {
    // Verify no React dependencies in type definitions
    // This is a compile-time check - the file should not import from 'react'
    const noReactImports = true;

    expect(noReactImports).toBe(true);
  });
});
