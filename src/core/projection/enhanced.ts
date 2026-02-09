import type {
  EnhancedUserProfile,
  SimulationResult,
  Account,
  Asset,
  Liability,
  TaxSettings,
} from '@/core/types';

/**
 * Calculate enhanced year-by-year financial projection with account-level detail
 *
 * Pure function that takes an enhanced user profile and returns an array of
 * simulation results, one for each year with detailed account breakdowns.
 *
 * Algorithm:
 * 1. Start with all accounts and their balances
 * 2. For each year:
 *    - Apply appreciation to assets
 *    - Apply interest to liabilities
 *    - Apply growth to investment accounts
 *    - Apply inflation adjustments
 *    - Calculate tax implications
 *    - Process withdrawals based on strategy
 *    - Update all account balances
 * 3. Return array of yearly results with detailed breakdowns
 *
 * @param profile - Enhanced user profile with accounts and projection settings
 * @returns Array of simulation results with account-level detail
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

  // Initialize accounts with their current balances (deep copy to avoid mutation)
  let accounts = (profile.accounts || []).map((account) => ({ ...account }));

  // Project from current age until maximum projection years or age 100
  const yearsToProject = Math.min(
    settings.maxProjectionYears,
    100 - profile.age
  );

  // Track real (inflation-adjusted) values
  let realSpending = profile.annualSpending;
  let cumulativeInflation = 1;

  for (let year = 0; year < yearsToProject; year++) {
    const age = profile.age + year;
    const isRetired = age >= settings.retirementAge;

    // Calculate starting balances by account type
    let totalStartingBalance = 0;
    const accountBalances: Record<string, number> = {};

    accounts.forEach((account) => {
      accountBalances[account.id] = account.balance;
      totalStartingBalance += account.balance;
    });

    // Apply appreciation to assets and interest to liabilities
    accounts = accounts.map((account) => {
      if (account.type === 'real-assets' && 'appreciationRate' in account) {
        const asset = account as Asset;
        if (
          asset.appreciationRate !== undefined &&
          asset.appreciationRate > 0
        ) {
          const appreciation = asset.balance * (asset.appreciationRate / 100);
          return { ...account, balance: account.balance + appreciation };
        }
      } else if (account.type === 'debts' && 'interestRate' in account) {
        const liability = account as Liability;
        if (liability.interestRate !== undefined) {
          const interest = liability.balance * (liability.interestRate / 100);
          return { ...account, balance: account.balance + interest };
        }
      } else if (
        (account.type === 'taxable' || account.type === 'tax-advantaged') &&
        profile.annualGrowthRate
      ) {
        // Apply growth to investment accounts
        const growth = account.balance * (profile.annualGrowthRate / 100);
        return { ...account, balance: account.balance + growth };
      }
      return account;
    });

    // Calculate total growth
    let totalEndingBalance = 0;
    accounts.forEach((account) => {
      totalEndingBalance += account.balance;
    });

    const totalGrowth = totalEndingBalance - totalStartingBalance;

    // Apply inflation adjustments
    if (settings.inflation.rate > 0) {
      const inflationFactor = 1 + settings.inflation.rate / 100;
      cumulativeInflation *= inflationFactor;

      if (settings.inflation.adjustSpending) {
        realSpending = profile.annualSpending * cumulativeInflation;
      }
    }

    // Process withdrawals based on strategy
    let totalWithdrawal = isRetired ? realSpending : 0;
    let ordinaryIncomeTax = 0;
    let capitalGainsTax = 0;

    if (totalWithdrawal > 0) {
      // Apply withdrawal strategy
      const withdrawals = processWithdrawals(
        accounts,
        totalWithdrawal,
        settings.withdrawalStrategy,
        settings.tax
      );

      totalWithdrawal = withdrawals.totalWithdrawn;
      ordinaryIncomeTax = withdrawals.ordinaryIncomeTax;
      capitalGainsTax = withdrawals.capitalGainsTax;

      // Update account balances after withdrawals
      accounts = accounts.map((account) => {
        const change = withdrawals.accountChanges.find(
          (c) => c.accountId === account.id
        );
        if (change) {
          return { ...account, balance: account.balance - change.amount };
        }
        return account;
      });
    }

    // Recalculate ending balances after withdrawals
    let finalEndingBalance = 0;
    accounts.forEach((account) => {
      finalEndingBalance += account.balance;
    });

    // Create account breakdown
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
      const starting = accountBalances[account.id] || 0;
      const ending = account.balance;
      const growth = ending - starting; // Simplified for now
      const withdrawal = 0; // Would need to track per-account withdrawals

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
    // (Don't stop in first year if starting with zero balance)
    if (finalEndingBalance <= 0 && totalWithdrawal > 0) {
      break;
    }
  }

  return results;
}

/**
 * Process withdrawals according to the specified strategy
 */
function processWithdrawals(
  accounts: Account[],
  amountNeeded: number,
  strategy: string,
  taxSettings: TaxSettings
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
  const sortedAccounts = [...accounts];

  if (strategy === 'tax-efficient') {
    // Order: Roth accounts first, then taxable, then tax-deferred, then tax-free
    sortedAccounts.sort((a, b) => {
      // Simplified sorting logic
      if (a.taxCharacteristics === 'tax-free') return -1;
      if (b.taxCharacteristics === 'tax-free') return 1;
      if (a.taxCharacteristics === 'taxable') return -1;
      if (b.taxCharacteristics === 'taxable') return 1;
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
          // Assume 50% of withdrawal is capital gains, 50% is ordinary income
          const capitalGains = withdrawAmount * 0.5;
          const ordinaryIncome = withdrawAmount * 0.5;
          capitalGainsTax +=
            capitalGains * (taxSettings.capitalGainsRate / 100);
          ordinaryIncomeTax +=
            ordinaryIncome * (taxSettings.ordinaryIncomeRate / 100);
        } else if (account.taxCharacteristics === 'tax-deferred') {
          ordinaryIncomeTax +=
            withdrawAmount * (taxSettings.ordinaryIncomeRate / 100);
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
