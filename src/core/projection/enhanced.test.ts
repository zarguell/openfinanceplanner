import { describe, it, expect } from 'vitest';
import { calculateEnhancedProjection } from './enhanced';
import type { EnhancedUserProfile, Account } from '@/core/types';

describe('calculateEnhancedProjection', () => {
  it('should calculate enhanced projection with accounts', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Taxable Brokerage',
        type: 'taxable',
        balance: 100000,
        taxCharacteristics: 'taxable',
      },
      {
        id: '2',
        name: '401k',
        type: 'tax-advantaged',
        accountType: '401k',
        balance: 150000,
        taxCharacteristics: 'tax-deferred',
      },
      {
        id: '3',
        name: 'Primary Home',
        type: 'real-assets',
        assetType: 'primary-home',
        balance: 500000,
        appreciationRate: 3.5,
        taxCharacteristics: 'taxable',
      },
      {
        id: '4',
        name: 'Mortgage',
        type: 'debts',
        liabilityType: 'mortgage',
        balance: 300000,
        interestRate: 4.5,
        taxCharacteristics: 'tax-deductible',
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 35,
      currentSavings: 1050000, // Total of all accounts (100k + 150k + 500k + 300k)
      annualGrowthRate: 7,
      annualSpending: 50000,
      accounts,
      projectionSettings: {
        inflation: {
          rate: 2.5,
          adjustSpending: true,
          adjustGrowth: false,
        },
        tax: {
          ordinaryIncomeRate: 22,
          capitalGainsRate: 15,
          applyTaxes: true,
        },
        withdrawalStrategy: 'tax-efficient',
        retirementAge: 65,
        maxProjectionYears: 30,
      },
    };

    const result = calculateEnhancedProjection(profile);

    // Should have results for 30 years
    expect(result).toHaveLength(30);

    // First year should have proper values
    expect(result[0].year).toBe(0);
    expect(result[0].age).toBe(35);
    expect(result[0].startingBalance).toBe(1050000);

    // Should have account breakdown
    expect(result[0].accountBreakdown).toBeDefined();
    expect(Object.keys(result[0].accountBreakdown || {})).toHaveLength(4);

    // Should have tax impact calculations
    expect(result[0].taxImpact).toBeDefined();
    expect(result[0].taxImpact?.totalTax).toBeGreaterThanOrEqual(0);

    // Should have inflation adjusted values
    expect(result[0].inflationAdjusted).toBeDefined();
  });

  it('should handle accounts with different growth rates', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Appreciating Asset',
        type: 'real-assets',
        assetType: 'rental-property',
        balance: 200000,
        appreciationRate: 4.0,
        taxCharacteristics: 'taxable',
      },
      {
        id: '2',
        name: 'Growing Debt',
        type: 'debts',
        liabilityType: 'mortgage',
        balance: 100000,
        interestRate: 5.0,
        taxCharacteristics: 'tax-deductible',
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 40,
      currentSavings: 300000,
      annualGrowthRate: 0, // No general growth, relying on account-specific rates
      annualSpending: 0,
      accounts,
      projectionSettings: {
        inflation: {
          rate: 0,
          adjustSpending: false,
          adjustGrowth: false,
        },
        tax: {
          ordinaryIncomeRate: 0,
          capitalGainsRate: 0,
          applyTaxes: false,
        },
        withdrawalStrategy: 'sequential',
        retirementAge: 65,
        maxProjectionYears: 5,
      },
    };

    const result = calculateEnhancedProjection(profile);

    // Asset should appreciate
    const assetAccountId = accounts[0].id;
    const initialAssetValue = accounts[0].balance;
    const finalAssetValue =
      result[result.length - 1].accountBreakdown?.[assetAccountId]
        ?.endingBalance || 0;
    expect(finalAssetValue).toBeGreaterThan(initialAssetValue);

    // Debt should grow
    const debtAccountId = accounts[1].id;
    const initialDebtValue = accounts[1].balance;
    const finalDebtValue =
      result[result.length - 1].accountBreakdown?.[debtAccountId]
        ?.endingBalance || 0;
    expect(finalDebtValue).toBeGreaterThan(initialDebtValue);
  });

  it('should handle retirement withdrawals with tax implications', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Taxable Account',
        type: 'taxable',
        balance: 100000,
        taxCharacteristics: 'taxable',
      },
      {
        id: '2',
        name: 'Traditional IRA',
        type: 'tax-advantaged',
        accountType: 'traditional-ira',
        balance: 150000,
        taxCharacteristics: 'tax-deferred',
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 60,
      currentSavings: 250000,
      annualGrowthRate: 6,
      annualSpending: 40000,
      accounts,
      projectionSettings: {
        inflation: {
          rate: 2.5,
          adjustSpending: true,
          adjustGrowth: false,
        },
        tax: {
          ordinaryIncomeRate: 22,
          capitalGainsRate: 15,
          applyTaxes: true,
        },
        withdrawalStrategy: 'tax-efficient',
        retirementAge: 65,
        maxProjectionYears: 10,
      },
    };

    const result = calculateEnhancedProjection(profile);

    // Should have tax implications in retirement years
    const retiredYears = result.filter((r) => r.age >= 65);
    expect(retiredYears.length).toBeGreaterThan(0);

    // Tax impact should be calculated
    retiredYears.forEach((year) => {
      expect(year.taxImpact?.totalTax).toBeGreaterThanOrEqual(0);
    });
  });
});

it('should stop projection when accounts are depleted', () => {
  const accounts: Account[] = [
    {
      id: '1',
      name: 'Small Account',
      type: 'taxable',
      balance: 50000,
      taxCharacteristics: 'taxable',
    },
  ];

  const profile: EnhancedUserProfile = {
    age: 60,
    currentSavings: 50000,
    annualGrowthRate: 0,
    annualSpending: 60000, // Higher than account balance
    accounts,
    projectionSettings: {
      inflation: {
        rate: 0,
        adjustSpending: false,
        adjustGrowth: false,
      },
      tax: {
        ordinaryIncomeRate: 0,
        capitalGainsRate: 0,
        applyTaxes: false,
      },
      withdrawalStrategy: 'sequential',
      retirementAge: 65,
      maxProjectionYears: 10,
    },
  };

  const result = calculateEnhancedProjection(profile);

  // Should stop before 10 years when funds are depleted
  expect(result.length).toBeLessThan(10);

  // Last year should have near-zero ending balance
  const lastYear = result[result.length - 1];
  expect(lastYear.endingBalance).toBeCloseTo(0, -3); // Within $1000 of zero
});

it('should handle empty accounts gracefully', () => {
  const profile: EnhancedUserProfile = {
    age: 30,
    currentSavings: 0,
    annualGrowthRate: 7,
    annualSpending: 0, // Changed to 0 to prevent depletion
    accounts: [],
    projectionSettings: {
      inflation: {
        rate: 0,
        adjustSpending: false,
        adjustGrowth: false,
      },
      tax: {
        ordinaryIncomeRate: 0,
        capitalGainsRate: 0,
        applyTaxes: false,
      },
      withdrawalStrategy: 'sequential',
      retirementAge: 65,
      maxProjectionYears: 5,
    },
  };

  const result = calculateEnhancedProjection(profile);

  // Should still produce results
  expect(result).toHaveLength(5);

  // All balances should be zero
  result.forEach((year) => {
    expect(year.startingBalance).toBe(0);
    expect(year.endingBalance).toBe(0);
  });
});
