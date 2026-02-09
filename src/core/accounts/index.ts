/**
 * Account Management Module
 *
 * This module provides functions for managing different types of accounts
 * including taxable accounts, tax-advantaged accounts, real assets, and liabilities.
 */

import type { Account, TaxableAccount, Asset, Liability } from '@/core/types';

/**
 * Calculate the total value of all accounts
 * @param accounts Array of accounts
 * @returns Total value of all accounts
 */
export function calculateTotalAccountsValue(accounts: Account[]): number {
  return accounts.reduce((total, account) => total + account.balance, 0);
}

/**
 * Filter accounts by type
 * @param accounts Array of accounts
 * @param type Account type to filter by
 * @returns Array of accounts matching the specified type
 */
export function filterAccountsByType<T extends Account>(
  accounts: Account[],
  type: T['type']
): T[] {
  return accounts.filter((account) => account.type === type) as T[];
}

/**
 * Add a contribution to a taxable account
 * @param account Taxable account
 * @param amount Contribution amount
 * @param year Year of contribution
 * @param description Optional description
 * @returns Updated account with contribution added
 */
export function addContributionToTaxableAccount(
  account: TaxableAccount,
  amount: number,
  year: number,
  description?: string
): TaxableAccount {
  const newContributions = [
    ...(account.contributions || []),
    { year, amount, description },
  ];

  return {
    ...account,
    balance: account.balance + amount,
    contributions: newContributions,
  };
}

/**
 * Calculate potential tax deduction for a liability
 * @param liability Liability account
 * @returns Potential tax deduction amount
 */
export function calculateTaxDeduction(liability: Liability): number {
  if (liability.taxCharacteristics !== 'tax-deductible') {
    return 0;
  }

  // For simplicity, we're assuming the full interest is deductible
  // In reality, this would depend on the specific type of liability and tax laws
  const annualInterest = Math.abs(
    liability.balance * (liability.interestRate / 100)
  );

  return annualInterest;
}

/**
 * Appreciate the value of a real asset
 * @param asset Real asset
 * @param years Number of years to appreciate
 * @returns Updated asset with appreciated value
 */
export function appreciateAsset(asset: Asset, years: number): Asset {
  if (!asset.appreciationRate || !asset.purchasePrice) {
    return asset;
  }

  const appreciationFactor = Math.pow(1 + asset.appreciationRate / 100, years);
  const newValue = asset.balance * appreciationFactor;

  return {
    ...asset,
    balance: newValue,
  };
}

/**
 * Amortize a liability
 * @param liability Liability account
 * @param years Number of years to amortize
 * @returns Updated liability with reduced balance
 */
export function amortizeLiability(
  liability: Liability,
  years: number
): Liability {
  if (!liability.interestRate || !liability.minimumPayment) {
    return liability;
  }

  let remainingBalance = Math.abs(liability.balance);
  const monthlyRate = liability.interestRate / 100 / 12;
  const months = years * 12;

  for (let i = 0; i < months; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = liability.minimumPayment - interestPayment;

    if (principalPayment > 0) {
      remainingBalance -= principalPayment;
    }

    // If balance is paid off, break
    if (remainingBalance <= 0) {
      remainingBalance = 0;
      break;
    }
  }

  return {
    ...liability,
    balance: -remainingBalance,
  };
}

export default {
  calculateTotalAccountsValue,
  filterAccountsByType,
  addContributionToTaxableAccount,
  calculateTaxDeduction,
  appreciateAsset,
  amortizeLiability,
};
