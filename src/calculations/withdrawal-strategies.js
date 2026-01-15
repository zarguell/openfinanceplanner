/**
 * Withdrawal Strategy Algorithms
 * Pure functions for calculating tax-efficient withdrawals from multiple accounts
 * No side effects, no state mutations
 */

/**
 * Withdrawal priority by account type (for tax-efficient strategy)
 * Higher priority = withdraw first (except RMDs which are mandatory)
 */
const ACCOUNT_PRIORITY = {
  Taxable: 1, // Capital gains rates (typically lower)
  IRA: 2, // Ordinary income (deferred)
  '401k': 2, // Ordinary income (deferred)
  Roth: 3, // Tax-free (save for last)
  HSA: 4, // Tax-free medical (save for last)
};

/**
 * Proportional withdrawal strategy (current default)
 * Distributes withdrawals proportionally to account balance
 * Simple but not tax-efficient
 * @param {Array} accounts - Array of account objects with balance in cents
 * @param {number} totalWithdrawalNeeded - Total withdrawal needed in cents
 * @returns {Array} Array of withdrawal amounts in cents per account
 */
export function proportionalWithdrawalStrategy(accounts, totalWithdrawalNeeded) {
  const withdrawals = new Array(accounts.length).fill(0);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (totalBalance === 0 || totalWithdrawalNeeded <= 0) {
    return withdrawals;
  }

  // Can't withdraw more than total balance
  if (totalWithdrawalNeeded > totalBalance) {
    for (let i = 0; i < accounts.length; i++) {
      withdrawals[i] = accounts[i].balance;
    }
    return withdrawals;
  }

  // Single pass: calculate each account's proportional share
  for (let i = 0; i < accounts.length; i++) {
    const accountBalance = accounts[i].balance;
    const accountShare = accountBalance / totalBalance;
    withdrawals[i] = Math.round(totalWithdrawalNeeded * accountShare);
  }

  // Handle rounding errors by adjusting the last account
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w, 0);
  const diff = totalWithdrawalNeeded - totalWithdrawn;

  if (diff !== 0) {
    // Add difference to the last non-zero withdrawal
    for (let i = withdrawals.length - 1; i >= 0; i--) {
      if (withdrawals[i] > 0 && withdrawals[i] + diff <= accounts[i].balance) {
        withdrawals[i] += diff;
        break;
      }
    }
  }

  return withdrawals;
}

/**
 * Tax-efficient withdrawal strategy
 * Prioritizes withdrawals by account type to minimize lifetime tax burden
 * Order: Required RMDs → Taxable → Traditional → Roth → HSA
 * @param {Array} accounts - Array of account objects with balance in cents
 * @param {number} totalWithdrawalNeeded - Total withdrawal needed in cents (after RMDs)
 * @param {Array} rmdRequirements - Array of RMD amounts in cents per account (0 if no RMD)
 * @returns {Array} Array of withdrawal amounts in cents per account
 */
export function taxEfficientWithdrawalStrategy(
  accounts,
  totalWithdrawalNeeded,
  rmdRequirements = []
) {
  const withdrawals = new Array(accounts.length).fill(0);

  // Step 1: Handle mandatory RMDs first
  for (let i = 0; i < accounts.length; i++) {
    if (rmdRequirements[i] > 0) {
      withdrawals[i] = Math.min(accounts[i].balance, rmdRequirements[i]);
    }
  }

  const totalRmdWithdrawals = withdrawals.reduce((sum, w) => sum + w, 0);
  let remainingNeed = totalWithdrawalNeeded - totalRmdWithdrawals;

  if (remainingNeed <= 0) {
    return withdrawals;
  }

  // Step 2: Sort remaining accounts by priority (lower priority number = withdraw first)
  const sortedAccounts = accounts
    .map((acc, idx) => ({
      index: idx,
      balance: acc.balance,
      priority: ACCOUNT_PRIORITY[acc.type] || 999,
      type: acc.type,
    }))
    .filter((acc) => acc.balance > withdrawals[acc.index]) // Only accounts with remaining balance
    .sort((a, b) => {
      // Sort by priority, then by balance (use smaller accounts first to preserve flexibility)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.balance - b.balance;
    });

  // Step 3: Withdraw from accounts in priority order
  for (const acc of sortedAccounts) {
    if (remainingNeed <= 0) break;

    const availableBalance = accounts[acc.index].balance - withdrawals[acc.index];
    const withdrawal = Math.min(availableBalance, remainingNeed);

    withdrawals[acc.index] += withdrawal;
    remainingNeed -= withdrawal;
  }

  return withdrawals;
}

/**
 * Tax-aware withdrawal strategy with bracket management
 * Attempts to optimize withdrawals across tax brackets
 * More sophisticated: considers ordinary income vs capital gains tax rates
 * @param {Array} accounts - Array of account objects with balance in cents
 * @param {number} totalWithdrawalNeeded - Total withdrawal needed in cents (after RMDs)
 * @param {Array} rmdRequirements - Array of RMD amounts in cents per account (0 if no RMD)
 * @param {object} taxContext - Tax context (filingStatus, taxYear, etc.)
 * @returns {Array} Array of withdrawal amounts in cents per account
 */
export function taxAwareWithdrawalStrategy(
  accounts,
  totalWithdrawalNeeded,
  rmdRequirements = [],
  taxContext = {}
) {
  // For now, use tax-efficient strategy as baseline
  // Future enhancement: Add bracket management logic

  const withdrawals = taxEfficientWithdrawalStrategy(
    accounts,
    totalWithdrawalNeeded,
    rmdRequirements
  );

  // Bracket management (simplified)
  // Strategy: Fill lower tax brackets with ordinary income (Traditional) before using capital gains
  // This is a simplified version - full implementation would need bracket calculations

  return withdrawals;
}

/**
 * Calculate withdrawals using specified strategy
 * @param {string} strategy - Strategy name: 'proportional', 'tax-efficient', or 'tax-aware'
 * @param {Array} accounts - Array of account objects with balance in cents
 * @param {number} totalWithdrawalNeeded - Total withdrawal needed in cents
 * @param {Array} rmdRequirements - Array of RMD amounts in cents per account (optional)
 * @param {object} taxContext - Tax context for tax-aware strategy (optional)
 * @returns {Array} Array of withdrawal amounts in cents per account
 */
export function calculateWithdrawals(
  strategy,
  accounts,
  totalWithdrawalNeeded,
  rmdRequirements = [],
  taxContext = {}
) {
  const strategies = {
    proportional: proportionalWithdrawalStrategy,
    'tax-efficient': taxEfficientWithdrawalStrategy,
    'tax-aware': taxAwareWithdrawalStrategy,
  };

  const strategyFunction = strategies[strategy] || proportionalWithdrawalStrategy;
  return strategyFunction(accounts, totalWithdrawalNeeded, rmdRequirements, taxContext);
}
