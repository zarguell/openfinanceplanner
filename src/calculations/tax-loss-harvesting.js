/**
 * Tax-Loss Harvesting calculations
 * Simplified account-level harvesting for long-term holdings
 */

/**
 * Calculate unrealized loss for a taxable account
 * @param {Object} account - Account with balance and costBasis
 * @returns {number} Unrealized loss in cents (0 if no loss)
 */
export function calculateUnrealizedLoss(account) {
  // Only applies to taxable brokerage accounts
  if (account.type !== 'Taxable') {
    return 0;
  }

  // If no costBasis tracked, assume no loss (conservative)
  if (!account.costBasis || account.costBasis <= 0) {
    return 0;
  }

  const currentValue = account.balance;
  const costBasis = account.costBasis;

  // Loss exists when current value < cost basis
  if (currentValue < costBasis) {
    return costBasis - currentValue;
  }

  return 0;
}

/**
 * Calculate total unrealized loss across all taxable accounts
 * @param {Array} accounts - Array of account objects
 * @returns {number} Total unrealized loss in cents
 */
export function calculateTotalUnrealizedLoss(accounts) {
  return accounts.reduce((total, account) => {
    return total + calculateUnrealizedLoss(account);
  }, 0);
}

/**
 * Calculate tax benefit from harvested losses
 * @param {number} harvestedLossCents - Amount of loss harvested (in cents)
 * @param {number} capitalGainsCents - Capital gains for the year (in cents)
 * @param {number} marginalTaxRate - Marginal tax rate (0-1)
 * @returns {number} Tax benefit in cents
 */
export function calculateTaxBenefitFromLoss(
  harvestedLossCents,
  capitalGainsCents,
  marginalTaxRate
) {
  if (harvestedLossCents <= 0) {
    return 0;
  }

  // Long-term capital gains tax rates (simplified)
  // Most taxpayers: 15% (high income: 20%, low income: 0%)
  // We'll use 15% as default for long-term gains
  const longTermGainsRate = 0.15;

  // Losses first offset capital gains (dollar-for-dollar)
  const lossOffsettingGains = Math.min(harvestedLossCents, Math.max(0, capitalGainsCents));
  const taxBenefitFromGains = lossOffsettingGains * longTermGainsRate;

  // Remaining losses can offset up to $3,000 of ordinary income
  const remainingLoss = Math.max(0, harvestedLossCents - lossOffsettingGains);
  const ordinaryIncomeOffset = Math.min(remainingLoss, 300000); // $3,000 in cents
  const taxBenefitFromOrdinary = ordinaryIncomeOffset * marginalTaxRate;

  return taxBenefitFromGains + taxBenefitFromOrdinary;
}

/**
 * Suggest optimal harvesting amount
 * @param {number} unrealizedLossCents - Available unrealized loss (in cents)
 * @param {number} capitalGainsCents - Capital gains for the year (in cents)
 * @param {number} marginalTaxRate - Marginal tax rate (0-1)
 * @param {Object} settings - TLH settings
 * @returns {Object} { harvestAmountCents, taxBenefitCents, reason }
 */
export function suggestHarvestingAmount(
  unrealizedLossCents,
  capitalGainsCents,
  marginalTaxRate,
  settings
) {
  if (unrealizedLossCents <= 0) {
    return {
      harvestAmountCents: 0,
      taxBenefitCents: 0,
      reason: 'No unrealized losses available',
    };
  }

  const threshold = settings.threshold || 100000; // Default $1,000 threshold

  // If loss is below threshold, don't harvest (not worth transaction costs)
  if (unrealizedLossCents < threshold) {
    return {
      harvestAmountCents: 0,
      taxBenefitCents: 0,
      reason: `Loss ($${(unrealizedLossCents / 100).toFixed(0)}) below threshold ($${(threshold / 100).toFixed(0)})`,
    };
  }

  let harvestAmount;
  let reason;

  // Strategy: 'all' or 'offset-gains'
  if (settings.strategy === 'offset-gains') {
    // Harvest enough to offset capital gains + $3,000 ordinary income
    const targetHarvest = Math.max(0, capitalGainsCents) + 300000; // gains + $3,000
    harvestAmount = Math.min(unrealizedLossCents, targetHarvest);
    reason = `Harvesting to offset gains + $3,000 ordinary income`;
  } else {
    // Default: harvest all available losses
    harvestAmount = unrealizedLossCents;
    reason = `Harvesting all available losses`;
  }

  const taxBenefit = calculateTaxBenefitFromLoss(harvestAmount, capitalGainsCents, marginalTaxRate);

  return {
    harvestAmountCents: harvestAmount,
    taxBenefitCents: taxBenefit,
    reason: reason,
  };
}

/**
 * Validate harvesting amount doesn't exceed account value
 * @param {number} harvestAmountCents - Amount to harvest (in cents)
 * @param {Object} account - Account to validate against
 * @returns {boolean} True if valid, false otherwise
 */
export function validateHarvestingAmount(harvestAmountCents, account) {
  if (account.type !== 'Taxable') {
    return false;
  }

  // Can't harvest more than the unrealized loss
  const unrealizedLoss = calculateUnrealizedLoss(account);
  if (harvestAmountCents > unrealizedLoss) {
    return false;
  }

  // Can't harvest negative amount
  if (harvestAmountCents < 0) {
    return false;
  }

  return true;
}

/**
 * Apply tax-loss harvesting to an account
 * Updates account balance and resets costBasis
 * @param {Object} account - Account to harvest from (modified in place)
 * @param {number} harvestAmountCents - Amount to harvest (in cents)
 * @returns {Object} { success, newCostBasis, harvestedLoss }
 */
export function applyHarvesting(account, harvestAmountCents) {
  if (!validateHarvestingAmount(harvestAmountCents, account)) {
    return {
      success: false,
      newCostBasis: account.costBasis,
      harvestedLoss: 0,
    };
  }

  // Harvesting: Sell position at loss, immediately rebuy
  // Result: costBasis resets to currentValue (harvestAmount is realized loss)
  const newCostBasis = account.balance - harvestAmountCents;

  return {
    success: true,
    newCostBasis: newCostBasis,
    harvestedLoss: harvestAmountCents,
  };
}

/**
 * Check if tax-loss harvesting should be considered
 * @param {Object} settings - TLH settings
 * @returns {boolean} True if enabled
 */
export function isHarvestingEnabled(settings) {
  return settings && settings.enabled === true;
}

/**
 * Get harvesting strategy description
 * @param {string} strategy - Strategy identifier
 * @returns {string} Human-readable description
 */
export function getStrategyDescription(strategy) {
  const descriptions = {
    all: 'Harvest all available losses',
    'offset-gains': 'Harvest enough to offset capital gains + $3,000 ordinary income',
    conservative: 'Only harvest losses exceeding $10,000',
  };

  return descriptions[strategy] || strategy;
}
