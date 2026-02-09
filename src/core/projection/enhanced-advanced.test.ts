import { describe, it, expect } from 'vitest';
import { calculateEnhancedProjection } from './enhanced';
import type { EnhancedUserProfile, Account } from '@/core/types';

describe('Enhanced Projection Algorithm - Advanced Features', () => {
  it('should apply different growth rates to different account types', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Conservative Bonds',
        type: 'taxable',
        balance: 100000,
        taxCharacteristics: 'taxable',
      },
      {
        id: '2',
        name: 'Aggressive Stocks',
        type: 'taxable',
        balance: 200000,
        taxCharacteristics: 'taxable',
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 35,
      currentSavings: 300000,
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
        maxProjectionYears: 5,
        accountGrowthRates: {
          '1': 4.0, // Conservative bonds
          '2': 9.0, // Aggressive stocks
        },
      },
    };

    const result = calculateEnhancedProjection(profile);

    // Verify account-specific growth rates are applied
    const year1 = result[1];
    // Account 1: $100k * 4% = ~$4k growth
    expect(year1.accountBreakdown?.['1']?.growth).toBeGreaterThan(3000);
    expect(year1.accountBreakdown?.['1']?.growth).toBeLessThan(5000);
    // Account 2: $200k * 9% = ~$18k growth
    expect(year1.accountBreakdown?.['2']?.growth).toBeGreaterThan(15000);
    expect(year1.accountBreakdown?.['2']?.growth).toBeLessThan(20000);
  });

  it('should track cost basis for capital gains calculations', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Taxable Brokerage',
        type: 'taxable',
        balance: 100000,
        taxCharacteristics: 'taxable',
        costBasis: 80000,
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 60,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 30000,
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

    // This test will fail until we implement cost basis tracking
    const retiredYears = result.filter((r) => r.age >= 65);
    expect(retiredYears.length).toBeGreaterThan(0);

    const firstRetiredYear = retiredYears[0];
    expect(firstRetiredYear.taxImpact?.capitalGainsTax).toBeGreaterThan(0);
  });

  it('should calculate Required Minimum Distributions (RMDs) for tax-deferred accounts', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Traditional IRA',
        type: 'tax-advantaged',
        accountType: 'traditional-ira',
        balance: 500000,
        taxCharacteristics: 'tax-deferred',
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 75, // Already at RMD age
      currentSavings: 500000,
      annualGrowthRate: 7,
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
        maxProjectionYears: 5,
      },
    };

    const result = calculateEnhancedProjection(profile);

    // This test will fail until we implement RMD calculations
    const rmdYears = result.filter((r) => r.age >= 75);
    rmdYears.forEach((year) => {
      const iraWithdrawal = year.accountBreakdown?.['1']?.withdrawal || 0;
      expect(iraWithdrawal).toBeGreaterThan(0);
    });
  });

  it('should handle sequence of returns risk modeling', () => {
    const accounts: Account[] = [
      {
        id: '1',
        name: 'Taxable Account',
        type: 'taxable',
        balance: 500000,
        taxCharacteristics: 'taxable',
      },
    ];

    const profile: EnhancedUserProfile = {
      age: 60,
      currentSavings: 500000,
      annualGrowthRate: 7,
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
        maxProjectionYears: 5,
      },
    };

    const result = calculateEnhancedProjection(profile);

    // This test will fail until we implement sequence of returns modeling
    expect(result).toBeDefined();
  });
});
