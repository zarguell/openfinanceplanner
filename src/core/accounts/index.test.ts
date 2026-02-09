import { describe, it, expect } from 'vitest';
import {
  calculateTotalAccountsValue,
  filterAccountsByType,
  addContributionToTaxableAccount,
  calculateTaxDeduction,
  appreciateAsset,
  amortizeLiability,
} from './index';
import type { TaxableAccount, Asset, Liability } from '@/core/types';

describe('Account Management Logic', () => {
  it('should calculate total accounts value correctly', () => {
    const accounts: (TaxableAccount | Asset | Liability)[] = [
      {
        id: 'acc-1',
        name: 'Taxable Account',
        type: 'taxable',
        balance: 50000,
        taxCharacteristics: 'taxable',
      },
      {
        id: 'asset-1',
        name: 'Real Estate',
        type: 'real-assets',
        balance: 300000,
        taxCharacteristics: 'taxable',
        assetType: 'primary-home',
      },
      {
        id: 'liab-1',
        name: 'Mortgage',
        type: 'debts',
        balance: -200000,
        taxCharacteristics: 'tax-deductible',
        liabilityType: 'mortgage',
        interestRate: 3.5,
      },
    ];

    const total = calculateTotalAccountsValue(accounts);
    expect(total).toBe(150000); // 50000 + 300000 - 200000
  });

  it('should filter accounts by type', () => {
    const accounts: (TaxableAccount | Asset | Liability)[] = [
      {
        id: 'acc-1',
        name: 'Taxable Account',
        type: 'taxable',
        balance: 50000,
        taxCharacteristics: 'taxable',
      },
      {
        id: 'asset-1',
        name: 'Real Estate',
        type: 'real-assets',
        balance: 300000,
        taxCharacteristics: 'taxable',
        assetType: 'primary-home',
      },
      {
        id: 'acc-2',
        name: 'Another Taxable Account',
        type: 'taxable',
        balance: 25000,
        taxCharacteristics: 'taxable',
      },
    ];

    const taxableAccounts = filterAccountsByType(accounts, 'taxable');
    expect(taxableAccounts.length).toBe(2);
    expect(taxableAccounts.every((acc) => acc.type === 'taxable')).toBe(true);
  });

  it('should add contribution to taxable account', () => {
    const account: TaxableAccount = {
      id: 'acc-1',
      name: 'Taxable Account',
      type: 'taxable',
      balance: 50000,
      taxCharacteristics: 'taxable',
    };

    const updatedAccount = addContributionToTaxableAccount(
      account,
      5000,
      2023,
      'Bonus contribution'
    );

    expect(updatedAccount.balance).toBe(55000);
    expect(updatedAccount.contributions?.length).toBe(1);
    expect(updatedAccount.contributions?.[0].amount).toBe(5000);
    expect(updatedAccount.contributions?.[0].year).toBe(2023);
  });

  it('should calculate tax deduction for deductible liability', () => {
    const liability: Liability = {
      id: 'liab-1',
      name: 'Mortgage',
      type: 'debts',
      balance: -200000,
      taxCharacteristics: 'tax-deductible',
      liabilityType: 'mortgage',
      interestRate: 3.5,
    };

    const deduction = calculateTaxDeduction(liability);
    const expectedDeduction = 200000 * (3.5 / 100); // 7000
    expect(deduction).toBe(expectedDeduction);
  });

  it('should return zero deduction for non-deductible liability', () => {
    const liability: Liability = {
      id: 'liab-1',
      name: 'Credit Card',
      type: 'debts',
      balance: -5000,
      taxCharacteristics: 'non-deductible',
      liabilityType: 'credit-card',
      interestRate: 18.5,
    };

    const deduction = calculateTaxDeduction(liability);
    expect(deduction).toBe(0);
  });

  it('should appreciate asset value', () => {
    const asset: Asset = {
      id: 'asset-1',
      name: 'Investment Property',
      type: 'real-assets',
      balance: 200000,
      taxCharacteristics: 'taxable',
      assetType: 'rental-property',
      purchasePrice: 150000,
      purchaseDate: '2020-01-01',
      appreciationRate: 4.0,
    };

    const appreciatedAsset = appreciateAsset(asset, 5);
    const expectedValue = 200000 * Math.pow(1 + 0.04, 5); // ~243330.58

    expect(appreciatedAsset.balance).toBeCloseTo(expectedValue, 2);
  });

  it('should amortize liability', () => {
    const liability: Liability = {
      id: 'liab-1',
      name: 'Auto Loan',
      type: 'debts',
      balance: -25000,
      taxCharacteristics: 'non-deductible',
      liabilityType: 'auto-loan',
      interestRate: 5.0,
      minimumPayment: 500,
    };

    const amortizedLiability = amortizeLiability(liability, 1); // 1 year

    // After 12 months of payments, balance should be reduced
    expect(amortizedLiability.balance).toBeGreaterThan(-25000);
    expect(amortizedLiability.balance).toBeLessThan(0);
  });
});
