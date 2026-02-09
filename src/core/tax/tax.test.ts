import { describe, it, expect } from 'vitest';
import {
  getRMDRate,
  calculateCapitalGainsTax,
  calculateOrdinaryIncomeTax,
} from './tax';
import type { Account } from '@/core/types';

describe('getRMDRate', () => {
  it('should return correct RMD rate for age 73', () => {
    expect(getRMDRate(73, 'uniform')).toBe(3.65);
  });

  it('should return correct RMD rate for age 75', () => {
    expect(getRMDRate(75, 'uniform')).toBe(3.91);
  });

  it('should return correct RMD rate for age 80', () => {
    expect(getRMDRate(80, 'uniform')).toBe(4.73);
  });

  it('should return correct RMD rate for age 90', () => {
    expect(getRMDRate(90, 'uniform')).toBe(7.44);
  });

  it('should return correct RMD rate for age 100', () => {
    expect(getRMDRate(100, 'uniform')).toBe(12.67);
  });

  it('should return 0 for ages below 73', () => {
    expect(getRMDRate(72, 'uniform')).toBe(0);
    expect(getRMDRate(70, 'uniform')).toBe(0);
  });

  it('should return 0 for ages above 100', () => {
    expect(getRMDRate(101, 'uniform')).toBe(0);
    expect(getRMDRate(110, 'uniform')).toBe(0);
  });

  it('should handle joint table type', () => {
    expect(getRMDRate(73, 'joint')).toBe(3.65);
  });

  it('should handle different table types', () => {
    expect(getRMDRate(73, 'uniform')).toBe(3.65);
    expect(getRMDRate(73, 'joint')).toBe(3.65);
  });
});

describe('calculateCapitalGainsTax', () => {
  it('should calculate capital gains tax correctly', () => {
    const account: Account = {
      id: '1',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 100000,
      taxCharacteristics: 'taxable',
    };

    const result = calculateCapitalGainsTax({
      account,
      withdrawalAmount: 10000,
      costBasis: 80000,
      capitalGainsRate: 15,
    });

    const proportion = 10000 / 100000;
    const costBasisWithdrawn = 80000 * proportion;
    const capitalGain = 10000 - costBasisWithdrawn;
    const expectedTax = capitalGain * 0.15;

    expect(result.capitalGainsTax).toBeCloseTo(expectedTax, 2);
    expect(result.costBasisReduction).toBeCloseTo(8000, 2);
  });

  it('should handle zero cost basis', () => {
    const account: Account = {
      id: '1',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 100000,
      taxCharacteristics: 'taxable',
    };

    const result = calculateCapitalGainsTax({
      account,
      withdrawalAmount: 10000,
      costBasis: 0,
      capitalGainsRate: 15,
    });

    expect(result.capitalGainsTax).toBeCloseTo(1500, 2);
    expect(result.costBasisReduction).toBe(0);
  });

  it('should handle full cost basis withdrawal', () => {
    const account: Account = {
      id: '1',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 100000,
      taxCharacteristics: 'taxable',
    };

    const result = calculateCapitalGainsTax({
      account,
      withdrawalAmount: 100000,
      costBasis: 100000,
      capitalGainsRate: 15,
    });

    expect(result.capitalGainsTax).toBe(0);
    expect(result.costBasisReduction).toBe(100000);
  });

  it('should handle zero withdrawal', () => {
    const account: Account = {
      id: '1',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 100000,
      taxCharacteristics: 'taxable',
    };

    const result = calculateCapitalGainsTax({
      account,
      withdrawalAmount: 0,
      costBasis: 80000,
      capitalGainsRate: 15,
    });

    expect(result.capitalGainsTax).toBe(0);
    expect(result.costBasisReduction).toBe(0);
  });

  it('should handle different capital gains rates', () => {
    const account: Account = {
      id: '1',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 100000,
      taxCharacteristics: 'taxable',
    };

    const result20 = calculateCapitalGainsTax({
      account,
      withdrawalAmount: 10000,
      costBasis: 80000,
      capitalGainsRate: 20,
    });

    const proportion = 10000 / 100000;
    const costBasisWithdrawn = 80000 * proportion;
    const capitalGain = 10000 - costBasisWithdrawn;
    const expectedTax = capitalGain * 0.2;

    expect(result20.capitalGainsTax).toBeCloseTo(expectedTax, 2);
  });

  it('should handle cost basis greater than withdrawal proportion', () => {
    const account: Account = {
      id: '1',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 100000,
      taxCharacteristics: 'taxable',
    };

    const result = calculateCapitalGainsTax({
      account,
      withdrawalAmount: 10000,
      costBasis: 120000,
      capitalGainsRate: 15,
    });

    expect(result.capitalGainsTax).toBeCloseTo(0, 2);
    expect(result.costBasisReduction).toBeCloseTo(12000, 2);
  });
});

describe('calculateOrdinaryIncomeTax', () => {
  it('should calculate ordinary income tax correctly', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 10000,
      ordinaryIncomeRate: 22,
    });

    expect(result).toBeCloseTo(2200, 2);
  });

  it('should handle zero amount', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 0,
      ordinaryIncomeRate: 22,
    });

    expect(result).toBe(0);
  });

  it('should handle zero tax rate', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 10000,
      ordinaryIncomeRate: 0,
    });

    expect(result).toBe(0);
  });

  it('should handle high tax rate', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 10000,
      ordinaryIncomeRate: 37,
    });

    expect(result).toBeCloseTo(3700, 2);
  });

  it('should handle very large amounts', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 1000000,
      ordinaryIncomeRate: 24,
    });

    expect(result).toBeCloseTo(240000, 2);
  });

  it('should handle decimal tax rates precisely', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 10000,
      ordinaryIncomeRate: 22.5,
    });

    expect(result).toBeCloseTo(2250, 2);
  });

  it('should handle negative tax rate (no tax)', () => {
    const result = calculateOrdinaryIncomeTax({
      amount: 10000,
      ordinaryIncomeRate: -10,
    });

    expect(result).toBe(0);
  });
});
