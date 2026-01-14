/**
 * Tax Loss Harvesting Strategy
 * Sell losing investments to offset capital gains and reduce taxable income.
 * Reinvest proceeds in similar but not substantially identical securities.
 */

import { RuleInterface, RuleResult, ParameterDefinition } from '../RuleInterface.js';

export class TaxLossHarvestingStrategy extends RuleInterface {
  constructor(parameters = {}) {
    super();
    this.parameters = { ...this.getDefaultParameters(), ...parameters };
  }

  getId() {
    return 'tax_loss_harvesting';
  }

  getName() {
    return 'Tax Loss Harvesting';
  }

  getDescription() {
    return 'Automatically harvest tax losses by selling depreciated assets in taxable accounts. ' +
           'Use losses to offset capital gains taxes and up to $3,000 of ordinary income annually. ' +
           'Reinvest in similar assets to maintain market exposure while resetting cost basis.';
  }

  getParameters() {
    return [
      new ParameterDefinition(
        'minLossThreshold',
        'number',
        false,
        1000,
        { min: 0, max: 50000 },
        'Minimum unrealized loss required to trigger harvesting (dollars)'
      ),
      new ParameterDefinition(
        'maxAnnualLoss',
        'number',
        false,
        50000,
        { min: 0, max: 100000 },
        'Maximum annual tax loss to harvest (to manage wash sale rules)'
      ),
      new ParameterDefinition(
        'washSaleWindow',
        'number',
        false,
        30,
        { min: 0, max: 60 },
        'Days to wait before repurchasing substantially identical securities'
      ),
      new ParameterDefinition(
        'capitalGainsOffset',
        'boolean',
        false,
        true,
        null,
        'Use harvested losses to offset capital gains taxes'
      ),
      new ParameterDefinition(
        'ordinaryIncomeOffset',
        'boolean',
        false,
        true,
        null,
        'Use up to $3,000 of losses to offset ordinary income'
      )
    ];
  }

  getDefaultParameters() {
    return {
      minLossThreshold: 1000,
      maxAnnualLoss: 50000,
      washSaleWindow: 30,
      capitalGainsOffset: true,
      ordinaryIncomeOffset: true
    };
  }

  validateParameters(parameters) {
    const errors = [];
    const params = { ...this.getDefaultParameters(), ...parameters };

    if (params.minLossThreshold < 0) {
      errors.push('Minimum loss threshold must be non-negative');
    }

    if (params.maxAnnualLoss < 0) {
      errors.push('Maximum annual loss must be non-negative');
    }

    if (params.washSaleWindow < 0 || params.washSaleWindow > 60) {
      errors.push('Wash sale window must be between 0 and 60 days');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isApplicable(plan, yearOffset, projectionState) {
    // Tax loss harvesting is typically only relevant during accumulation phase
    const age = plan.taxProfile.currentAge + yearOffset;
    const isRetired = age >= plan.taxProfile.retirementAge;

    if (isRetired) {
      return false; // Usually not applicable in retirement when withdrawals are needed
    }

    // Check if person has taxable accounts with potential losses
    const hasTaxableAccounts = plan.accounts.some(acc => acc.type === 'Taxable' && acc.balance > 0);

    return hasTaxableAccounts;
  }

  apply(plan, yearOffset, projectionState, parameters) {
    const params = { ...this.getDefaultParameters(), ...parameters };
    const result = new RuleResult(false, {}, {});

    try {
      // Find taxable accounts
      const taxableAccounts = plan.accounts.filter(acc => acc.type === 'Taxable' && acc.balance > 0);

      if (taxableAccounts.length === 0) {
        result.metadata.reason = 'No taxable accounts available for tax loss harvesting';
        return result;
      }

      let totalLossHarvested = 0;
      let capitalGainsOffset = 0;
      let ordinaryIncomeOffset = 0;
      const harvestedPositions = [];

      // Simulate tax loss harvesting for each taxable account
      for (const account of taxableAccounts) {
        const accountProjection = projectionState.accounts.find(acc => acc.id === account.id);
        if (!accountProjection) continue;

        // Estimate unrealized losses (simplified - in practice would track actual positions)
        const estimatedLoss = this._estimateUnrealizedLosses(account, yearOffset);

        if (estimatedLoss >= params.minLossThreshold) {
          // Calculate how much loss to harvest (limited by annual maximum)
          const harvestAmount = Math.min(
            estimatedLoss,
            params.maxAnnualLoss - totalLossHarvested
          );

          if (harvestAmount > 0) {
            // Apply wash sale rules (reduce harvestable amount)
            const washSaleAdjustedAmount = this._applyWashSaleRules(harvestAmount, account, yearOffset);

            if (washSaleAdjustedAmount > 0) {
              // Record the harvest
              harvestedPositions.push({
                accountId: account.id,
                lossHarvested: washSaleAdjustedAmount,
                originalLoss: estimatedLoss
              });

              totalLossHarvested += washSaleAdjustedAmount;

              // Reduce account balance (simplified - actual harvesting involves selling)
              // In practice, this would be more complex with position tracking
              const harvestCents = Math.round(washSaleAdjustedAmount * 100);
              accountProjection.balance -= harvestCents;
              accountProjection.withdrawals += harvestCents;

              // Track for reinvestment (wash sale compliant)
              result.changes.reinvestmentRequired = (result.changes.reinvestmentRequired || 0) + washSaleAdjustedAmount;
            }
          }
        }
      }

      if (totalLossHarvested > 0) {
        // Apply tax benefits
        if (params.capitalGainsOffset) {
          capitalGainsOffset = this._calculateCapitalGainsOffset(totalLossHarvested, projectionState);
          projectionState.taxes.federal -= Math.round(capitalGainsOffset * 100);
          projectionState.taxes.total -= Math.round(capitalGainsOffset * 100);
        }

        if (params.ordinaryIncomeOffset) {
          ordinaryIncomeOffset = Math.min(totalLossHarvested - capitalGainsOffset, 3000); // $3,000 limit
          // Ordinary income offset would reduce taxable income - simplified here
          result.changes.ordinaryIncomeOffset = ordinaryIncomeOffset;
        }

        // Carry forward losses if they exceed current year benefits
        const carryForwardLoss = totalLossHarvested - capitalGainsOffset - ordinaryIncomeOffset;
        if (carryForwardLoss > 0) {
          result.changes.carryForwardLoss = carryForwardLoss;
        }

        result.applied = true;
        result.changes.totalLossHarvested = totalLossHarvested;
        result.changes.capitalGainsOffset = capitalGainsOffset;
        result.changes.ordinaryIncomeOffset = ordinaryIncomeOffset;
        result.changes.harvestedPositions = harvestedPositions;
        result.metadata = {
          strategy: 'tax_loss_harvesting',
          totalLossHarvested,
          capitalGainsOffset,
          ordinaryIncomeOffset,
          carryForwardLoss: Math.max(0, carryForwardLoss),
          washSaleWindow: params.washSaleWindow,
          taxSavings: capitalGainsOffset + ordinaryIncomeOffset
        };
      } else {
        result.metadata.reason = 'No qualifying losses found for harvesting';
      }

    } catch (error) {
      result.metadata.error = error.message;
      console.error('Error applying Tax Loss Harvesting strategy:', error);
    }

    return result;
  }

  getDependencies() {
    return []; // Standalone strategy
  }

  getVersion() {
    return '1.0.0';
  }

  getCategory() {
    return 'tax_optimization';
  }

  /**
   * Estimate unrealized losses in a taxable account
   * @private
   * @param {object} account - The taxable account
   * @param {number} yearOffset - Years from current year
   * @returns {number} Estimated unrealized losses in dollars
   */
  _estimateUnrealizedLosses(account, yearOffset) {
    // This is highly simplified - in practice would require detailed position tracking
    // For demonstration, we'll estimate some percentage of the account balance as losses

    const accountBalance = account.balance / 100; // Convert cents to dollars

    // Simulate market volatility creating losses
    // In practice, this would be based on actual cost basis vs current value
    const volatilityFactor = 0.15; // Assume 15% of portfolio might be at a loss
    const estimatedLossPercentage = Math.sin(yearOffset * 0.5) * volatilityFactor; // Cyclical losses

    const estimatedLoss = Math.max(0, accountBalance * Math.abs(estimatedLossPercentage));

    return estimatedLoss;
  }

  /**
   * Apply wash sale rules to reduce harvestable losses
   * @private
   * @param {number} harvestAmount - Proposed harvest amount
   * @param {object} account - The account being harvested
   * @param {number} yearOffset - Years from current year
   * @returns {number} Wash sale adjusted harvest amount
   */
  _applyWashSaleRules(harvestAmount, account, yearOffset) {
    // Simplified wash sale rule implementation
    // In practice, would track actual purchase/sale dates and substantially identical securities

    // Assume some portion of losses may be disqualified due to wash sales
    const washSaleDisqualificationRate = 0.2; // 20% of potential losses disqualified
    const disqualifiedAmount = harvestAmount * washSaleDisqualificationRate;

    return Math.max(0, harvestAmount - disqualifiedAmount);
  }

  /**
   * Calculate capital gains tax offset from harvested losses
   * @private
   * @param {number} lossAmount - Total harvested losses
   * @param {object} projectionState - Current projection state
   * @returns {number} Capital gains tax savings in dollars
   */
  _calculateCapitalGainsOffset(lossAmount, projectionState) {
    // Simplified - assume some capital gains exist to offset
    // In practice, would calculate based on actual realized gains in the year

    const estimatedCapitalGains = Math.max(0, projectionState.taxes.federal / 100 * 0.3); // Estimate 30% of taxes are from gains
    const offsettableGains = Math.min(lossAmount, estimatedCapitalGains);

    // Apply long-term capital gains rate (simplified)
    const ltcgRate = 0.15; // 15% federal LTCG rate

    return offsettableGains * ltcgRate;
  }
}
