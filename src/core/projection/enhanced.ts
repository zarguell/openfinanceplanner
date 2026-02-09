import type {
  EnhancedUserProfile,
  SimulationResult,
  Account,
  Asset,
  Liability,
  TaxSettings,
} from '@/core/types';
import {
  getRMDRate,
  calculateCapitalGainsTax,
  calculateOrdinaryIncomeTax,
} from '@/core/tax';

/**
 * Calculate enhanced year-by-year financial projection with sophisticated features
 *
 * Pure function that takes an enhanced user profile and returns an array of
 * simulation results with support for:
 * - Account-specific growth rates
 * - Cost basis tracking for capital gains
 * - Required Minimum Distributions (RMDs)
 * - Social Security income
 * - Inflation adjustments
 * - Tax-aware withdrawals
 *
 * @param profile - Enhanced user profile with accounts and projection settings
 * @returns Array of simulation results with detailed breakdowns
 */
export function calculateEnhancedProjection(
  profile: EnhancedUserProfile
): SimulationResult[] {
  const results: SimulationResult[] = [];

  // Default settings if none provided
  const settings = profile.projectionSettings || {
    inflation: {
      rate: 2.5,
      adjustSpending: true,
      adjustGrowth: true,
    },
    tax: {
      ordinaryIncomeRate: 22,
      capitalGainsRate: 15,
      applyTaxes: true,
    },
    withdrawalStrategy: 'tax-efficient',
    retirementAge: 65,
    maxProjectionYears: 100 - profile.age,
  };

  // Initialize account tracking
  const accounts = (profile.accounts || []).map((account) => ({ ...account }));
  const accountCostBasis = new Map<string, number>();

  accounts.forEach((account) => {
    if (account.type === 'taxable') {
      const taxableAccount = account as {
        costBasis?: number;
        balance: number;
      };
      accountCostBasis.set(
        account.id,
        taxableAccount.costBasis || account.balance
      );
    } else {
      accountCostBasis.set(account.id, account.balance);
    }
  });

  // Project from current age until maximum projection years or age 100
  const yearsToProject = Math.min(
    settings.maxProjectionYears,
    100 - profile.age
  );

  // Track real (inflation-adjusted) values
  let realSpending = profile.annualSpending;
  let cumulativeInflation = 1;
  let socialSecurityBenefit = 0;

  for (let year = 0; year < yearsToProject; year++) {
    const age = profile.age + year;
    const isRetired = age >= settings.retirementAge;

    // Calculate Social Security income
    if (settings.socialSecurity && age >= settings.socialSecurity.startAge) {
      socialSecurityBenefit = settings.socialSecurity.inflationAdjusted
        ? settings.socialSecurity.monthlyBenefit * 12 * cumulativeInflation
        : settings.socialSecurity.monthlyBenefit * 12;
    }

    // Calculate starting balances by account type
    let totalStartingBalance = 0;
    const accountBalances: Record<string, number> = {};
    const startingBalances: Record<string, number> = {};

    accounts.forEach((account) => {
      accountBalances[account.id] = account.balance;
      startingBalances[account.id] = account.balance;
      totalStartingBalance += account.balance;
    });

    // Apply growth/appreciation to each account
    let totalGrowth = 0;
    accounts.forEach((account) => {
      let growth = 0;

      // Use account-specific growth rate if provided
      const accountGrowthRate =
        settings.accountGrowthRates?.[account.id] || profile.annualGrowthRate;

      if (account.type === 'real-assets' && 'appreciationRate' in account) {
        const asset = account as Asset;
        if (
          asset.appreciationRate !== undefined &&
          asset.appreciationRate > 0
        ) {
          growth = account.balance * (asset.appreciationRate / 100);
        }
      } else if (account.type === 'debts' && 'interestRate' in account) {
        const liability = account as Liability;
        if (liability.interestRate !== undefined) {
          growth = account.balance * (liability.interestRate / 100);
        }
      } else if (
        (account.type === 'taxable' || account.type === 'tax-advantaged') &&
        accountGrowthRate
      ) {
        growth = account.balance * (accountGrowthRate / 100);
      }

      account.balance += growth;
      totalGrowth += growth;
    });

    // Apply inflation adjustments
    if (settings.inflation.rate > 0) {
      const inflationFactor = 1 + settings.inflation.rate / 100;
      cumulativeInflation *= inflationFactor;

      if (settings.inflation.adjustSpending) {
        realSpending = profile.annualSpending * cumulativeInflation;
      }
    }

    // Calculate RMDs for tax-deferred accounts
    let rmdAmount = 0;
    if (settings.rmdSettings && age >= settings.rmdSettings.rmdStartAge) {
      const taxDeferredAccounts = accounts.filter(
        (account) => account.taxCharacteristics === 'tax-deferred'
      );

      taxDeferredAccounts.forEach((account) => {
        const rmdRate = getRMDRate(age, settings.rmdSettings!.rmdTable);
        const accountRMD = account.balance * (rmdRate / 100);
        rmdAmount += accountRMD;
      });
    }

    // Process withdrawals based on strategy
    let totalWithdrawal = isRetired
      ? Math.max(realSpending - socialSecurityBenefit, 0)
      : 0;
    totalWithdrawal = Math.max(totalWithdrawal, rmdAmount);

    let ordinaryIncomeTax = 0;
    let capitalGainsTax = 0;
    const accountChanges: { accountId: string; amount: number }[] = [];

    if (totalWithdrawal > 0) {
      const withdrawals = processWithdrawals(
        accounts,
        totalWithdrawal,
        settings.withdrawalStrategy,
        settings.tax,
        accountCostBasis
      );

      totalWithdrawal = withdrawals.totalWithdrawn;
      ordinaryIncomeTax = withdrawals.ordinaryIncomeTax;
      capitalGainsTax = withdrawals.capitalGainsTax;

      // Update account balances after withdrawals
      withdrawals.accountChanges.forEach((change) => {
        const accountIndex = accounts.findIndex(
          (a) => a.id === change.accountId
        );
        if (accountIndex >= 0) {
          accounts[accountIndex].balance -= change.amount;
          accountChanges.push(change);

          // Update cost basis for taxable accounts
          if (accounts[accountIndex].type === 'taxable') {
            const currentCostBasis =
              accountCostBasis.get(change.accountId) || 0;
            const costBasisReduction = Math.min(
              change.amount *
                (currentCostBasis / accounts[accountIndex].balance),
              currentCostBasis
            );
            accountCostBasis.set(
              change.accountId,
              Math.max(0, currentCostBasis - costBasisReduction)
            );
          }
        }
      });
    }

    // Recalculate ending balances after all calculations
    let finalEndingBalance = 0;
    accounts.forEach((account) => {
      finalEndingBalance += account.balance;
    });

    // Create detailed account breakdown
    const accountBreakdown: Record<
      string,
      {
        startingBalance: number;
        growth: number;
        withdrawal: number;
        endingBalance: number;
      }
    > = {};

    accounts.forEach((account) => {
      const starting = startingBalances[account.id] || 0;
      const ending = account.balance;
      const growth = ending - starting;

      const withdrawal =
        accountChanges.find(
          (c: { accountId: string; amount: number }) =>
            c.accountId === account.id
        )?.amount || 0;

      accountBreakdown[account.id] = {
        startingBalance: starting,
        growth,
        withdrawal,
        endingBalance: ending,
      };
    });

    // Add result for this year
    results.push({
      year,
      age,
      startingBalance: totalStartingBalance,
      growth: totalGrowth,
      spending: totalWithdrawal,
      endingBalance: finalEndingBalance,
      inflationAdjusted: {
        startingBalance: totalStartingBalance / cumulativeInflation,
        spending: totalWithdrawal / cumulativeInflation,
        endingBalance: finalEndingBalance / cumulativeInflation,
      },
      taxImpact: {
        ordinaryIncomeTax,
        capitalGainsTax,
        totalTax: ordinaryIncomeTax + capitalGainsTax,
      },
      accountBreakdown,
    });

    // Stop if all accounts are depleted during retirement
    if (finalEndingBalance <= 0 && totalWithdrawal > 0) {
      break;
    }
  }

  return results;
}

/**
 * Process withdrawals according to specified strategy with enhanced tax calculations
 */
function processWithdrawals(
  accounts: Account[],
  amountNeeded: number,
  strategy: string,
  taxSettings: TaxSettings,
  accountCostBasis: Map<string, number>
): {
  totalWithdrawn: number;
  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  accountChanges: { accountId: string; amount: number }[];
} {
  let totalWithdrawn = 0;
  let ordinaryIncomeTax = 0;
  let capitalGainsTax = 0;
  const accountChanges: { accountId: string; amount: number }[] = [];
  let remainingAmount = amountNeeded;

  // Sort accounts based on strategy
  const sortedAccounts = [...accounts].filter((account) => account.balance > 0);

  if (strategy === 'tax-efficient') {
    // Order: Roth accounts first, then taxable, then tax-deferred
    sortedAccounts.sort((a, b) => {
      if (a.taxCharacteristics === 'tax-free') return -1;
      if (b.taxCharacteristics === 'tax-free') return 1;
      if (a.taxCharacteristics === 'taxable') return -1;
      if (b.taxCharacteristics === 'taxable') return 1;
      if (a.taxCharacteristics === 'tax-deferred') return 1;
      if (b.taxCharacteristics === 'tax-deferred') return -1;
      return 0;
    });
  }

  // Withdraw from accounts
  for (const account of sortedAccounts) {
    if (remainingAmount <= 0) break;

    const available = account.balance;
    const withdrawAmount = Math.min(available, remainingAmount);

    if (withdrawAmount > 0) {
      totalWithdrawn += withdrawAmount;
      remainingAmount -= withdrawAmount;
      accountChanges.push({
        accountId: account.id,
        amount: withdrawAmount,
      });

      // Calculate tax impact based on account type
      if (taxSettings.applyTaxes) {
        if (account.taxCharacteristics === 'taxable') {
          // Calculate capital gains based on cost basis using tax module
          const costBasis = accountCostBasis.get(account.id) || 0;
          const result = calculateCapitalGainsTax({
            account,
            withdrawalAmount: withdrawAmount,
            costBasis,
            capitalGainsRate: taxSettings.capitalGainsRate,
          });
          capitalGainsTax += result.capitalGainsTax;
        } else if (account.taxCharacteristics === 'tax-deferred') {
          // Calculate ordinary income tax using tax module
          ordinaryIncomeTax += calculateOrdinaryIncomeTax({
            amount: withdrawAmount,
            ordinaryIncomeRate: taxSettings.ordinaryIncomeRate,
          });
        }
        // Tax-free accounts have no tax impact
      }
    }
  }

  return {
    totalWithdrawn,
    ordinaryIncomeTax,
    capitalGainsTax,
    accountChanges,
  };
}
