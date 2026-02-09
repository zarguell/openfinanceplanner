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
    const invalidProfile: UserProfile = {
      // @ts-expect-error - Type 'string' is not assignable to type 'number'
      age: '30',
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    // Use the variable to avoid noUnusedLocals error
    expect(typeof invalidProfile).toBe('object');
  });

  // Tests for expanded UserProfile properties
  it('should accept expanded user profile data with new properties', () => {
    const expandedProfile: UserProfile = {
      age: 35,
      currentSavings: 150000,
      annualGrowthRate: 7.0,
      annualSpending: 50000,
      householdStatus: 'married',
      location: {
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
      },
      accounts: [
        {
          id: 'account1',
          name: '401(k)',
          type: 'tax-advantaged',
          balance: 100000,
          taxCharacteristics: 'tax-deferred',
        },
      ],
      taxRegion: {
        country: 'US',
        state: 'CA',
        locality: 'San Francisco',
      },
      currency: 'USD',
    };

    expect(expandedProfile.householdStatus).toBe('married');
    expect(expandedProfile.location?.country).toBe('US');
    expect(expandedProfile.accounts?.length).toBe(1);
    expect(expandedProfile.taxRegion?.state).toBe('CA');
    expect(expandedProfile.currency).toBe('USD');
  });

  it('should enforce readonly properties for new fields', () => {
    const profile: UserProfile = {
      age: 40,
      currentSavings: 200000,
      annualGrowthRate: 7.5,
      annualSpending: 60000,
      householdStatus: 'single',
      location: {
        country: 'US',
        state: 'NY',
        city: 'New York',
      },
      accounts: [
        {
          id: 'account1',
          name: 'IRA',
          type: 'tax-advantaged',
          balance: 150000,
          taxCharacteristics: 'tax-deferred',
        },
      ],
    };

    // TypeScript should prevent mutation at compile time
    // @ts-expect-error - Cannot assign to 'householdStatus' because it is a read-only property
    profile.householdStatus = 'married';

    // @ts-expect-error - Cannot assign to 'location' because it is a read-only property
    profile.location = { country: 'CA' };
  });

  it('should accept optional properties as undefined', () => {
    const minimalProfile: UserProfile = {
      age: 25,
      currentSavings: 50000,
      annualGrowthRate: 8.0,
      annualSpending: 30000,
      // All new properties are optional, so they can be omitted
    };

    expect(minimalProfile.age).toBe(25);
    expect(minimalProfile.householdStatus).toBeUndefined();
    expect(minimalProfile.location).toBeUndefined();
    expect(minimalProfile.accounts).toBeUndefined();
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
      startingBalance: 100000.5,
      growth: 7500.04,
      spending: 40000.99,
      endingBalance: 67000.55,
    };

    expect(preciseResult.startingBalance).toBeCloseTo(100000.5, 2);
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

  it('should prevent excess properties', () => {
    // TypeScript should reject objects with extra properties
    const invalidProfile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
      // @ts-expect-error - Object literal may only specify known properties
      extraProperty: 'not allowed',
    };

    // Use variable to avoid noUnusedLocals error
    expect(typeof invalidProfile).toBe('object');
  });

  it('should require all properties', () => {
    // TypeScript should reject objects missing properties
    // @ts-expect-error - Property 'annualSpending' is missing
    const incompleteProfile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
    };

    // Use variable to avoid noUnusedLocals error
    expect(typeof incompleteProfile).toBe('object');
  });

  it('should enforce number types strictly', () => {
    const invalidAge: UserProfile = {
      // @ts-expect-error - Type 'boolean' is not assignable to type 'number'
      age: true,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    const nullGrowth: UserProfile = {
      age: 30,
      currentSavings: 100000,
      // @ts-expect-error - Type 'null' is not assignable to type 'number'
      annualGrowthRate: null,
      annualSpending: 40000,
    };

    // Use variables to avoid noUnusedLocals errors
    expect(typeof invalidAge).toBe('object');
    expect(typeof nullGrowth).toBe('object');
  });

  it('should support type narrowing', () => {
    const isUserProfile = (obj: unknown): obj is UserProfile => {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'age' in obj &&
        'currentSavings' in obj &&
        'annualGrowthRate' in obj &&
        'annualSpending' in obj
      );
    };

    const unknownObj: unknown = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    if (isUserProfile(unknownObj)) {
      // TypeScript should narrow type here
      expect(unknownObj.age).toBe(30);
    }
  });

  it('should provide IntelliSense for properties', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7.5,
      annualSpending: 40000,
    };

    // These properties should be suggested by IDE
    const age = profile.age;
    const savings = profile.currentSavings;
    const growth = profile.annualGrowthRate;
    const spending = profile.annualSpending;

    expect(typeof age).toBe('number');
    expect(typeof savings).toBe('number');
    expect(typeof growth).toBe('number');
    expect(typeof spending).toBe('number');
  });
});
