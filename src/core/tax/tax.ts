import type { Account } from '@/core/types';

export type RMDTable = 'uniform' | 'joint';

export interface CapitalGainsTaxCalculation {
  withdrawalAmount: number;
  costBasis: number;
  capitalGainsRate: number;
}

export interface CapitalGainsTaxResult {
  capitalGainsTax: number;
  costBasisReduction: number;
}

export interface OrdinaryIncomeTaxCalculation {
  amount: number;
  ordinaryIncomeRate: number;
}

export function getRMDRate(age: number, tableType: RMDTable): number {
  if (age < 73 || age > 100) {
    return 0;
  }

  // tableType parameter is reserved for future implementations
  // that will use different tables (uniform vs joint)
  void tableType;

  const rmdRates: Record<number, number> = {
    73: 3.65,
    74: 3.77,
    75: 3.91,
    76: 4.05,
    77: 4.2,
    78: 4.37,
    79: 4.55,
    80: 4.73,
    81: 4.93,
    82: 5.14,
    83: 5.37,
    84: 5.61,
    85: 5.87,
    86: 6.15,
    87: 6.45,
    88: 6.76,
    89: 7.09,
    90: 7.44,
    91: 7.82,
    92: 8.22,
    93: 8.66,
    94: 9.12,
    95: 9.62,
    96: 10.15,
    97: 10.71,
    98: 11.31,
    99: 11.96,
    100: 12.67,
  };

  return rmdRates[age] || 0;
}

export function calculateCapitalGainsTax(
  params: CapitalGainsTaxCalculation & { account: Account }
): CapitalGainsTaxResult {
  const { account, withdrawalAmount, costBasis, capitalGainsRate } = params;

  if (withdrawalAmount <= 0 || capitalGainsRate <= 0) {
    return {
      capitalGainsTax: 0,
      costBasisReduction: 0,
    };
  }

  const proportion = withdrawalAmount / account.balance;
  const costBasisWithdrawn = Math.min(costBasis * proportion, costBasis);
  const capitalGain = Math.max(0, withdrawalAmount - costBasisWithdrawn);

  return {
    capitalGainsTax: capitalGain * (capitalGainsRate / 100),
    costBasisReduction: costBasisWithdrawn,
  };
}

export function calculateOrdinaryIncomeTax(
  params: OrdinaryIncomeTaxCalculation
): number {
  const { amount, ordinaryIncomeRate } = params;

  if (amount <= 0 || ordinaryIncomeRate <= 0) {
    return 0;
  }

  return amount * (ordinaryIncomeRate / 100);
}
