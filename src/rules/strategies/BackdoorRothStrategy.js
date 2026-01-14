/**
 * Backdoor Roth IRA Strategy
 * Allows high-income earners to contribute to Roth IRA by first contributing to Traditional IRA,
 * then converting to Roth IRA, avoiding income limits on direct Roth contributions.
 */

import { RuleInterface, RuleResult, ParameterDefinition } from '../RuleInterface.js';

export class BackdoorRothStrategy extends RuleInterface {
  constructor(parameters = {}) {
    super();
    this.parameters = { ...this.getDefaultParameters(), ...parameters };
  }

  getId() {
    return 'backdoor_roth';
  }

  getName() {
    return 'Backdoor Roth IRA';
  }

  getDescription() {
    return 'Convert Traditional IRA contributions to Roth IRA to avoid income limits on direct Roth contributions. ' +
           'This strategy allows high-income earners to benefit from tax-free Roth growth and withdrawals.';
  }

  getParameters() {
    return [
      new ParameterDefinition(
        'maxAnnualContribution',
        'number',
        false,
        7000,
        { min: 0, max: 23000 },
        'Maximum annual contribution to Traditional IRA before conversion'
      ),
      new ParameterDefinition(
        'incomeThreshold',
        'number',
        false,
        150000,
        { min: 0 },
        'Income threshold above which direct Roth IRA contributions are not allowed'
      ),
      new ParameterDefinition(
        'filingStatus',
        'select',
        false,
        'single',
        null,
        'Tax filing status for determining eligibility'
      )
    ];
  }

  getDefaultParameters() {
    return {
      maxAnnualContribution: 7000, // 2024 limit, can be increased for catch-up
      incomeThreshold: 150000, // Approximate MAGI limit for Roth eligibility
      filingStatus: 'single'
    };
  }

  validateParameters(parameters) {
    const errors = [];
    const params = { ...this.getDefaultParameters(), ...parameters };

    if (params.maxAnnualContribution < 0) {
      errors.push('Maximum annual contribution must be non-negative');
    }

    if (params.incomeThreshold < 0) {
      errors.push('Income threshold must be non-negative');
    }

    if (!['single', 'married_joint', 'married_separate', 'head'].includes(params.filingStatus)) {
      errors.push('Filing status must be one of: single, married_joint, married_separate, head');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isApplicable(plan, yearOffset, projectionState) {
    const currentYear = new Date().getFullYear() + yearOffset;
    const age = plan.taxProfile.currentAge + yearOffset;
    const isRetired = age >= plan.taxProfile.retirementAge;

    // Only applicable during working years (not retired)
    if (isRetired) {
      return false;
    }

    // Check if person has income above Roth IRA limits
    // This is a simplified check - in practice would need more sophisticated MAGI calculation
    const hasHighIncome = this._estimateHighIncome(plan, yearOffset);

    // Check if person has Traditional IRA available for conversion
    const hasTradIRA = plan.accounts.some(acc => acc.type === 'IRA');

    // Only apply if income is too high for direct Roth contribution
    // and there's a Traditional IRA to convert from
    return hasHighIncome && hasTradIRA;
  }

  apply(plan, yearOffset, projectionState, parameters) {
    const params = { ...this.getDefaultParameters(), ...parameters };
    const result = new RuleResult(false, {}, {});

    try {
      // Find Traditional IRA account
      const tradIRAAccount = plan.accounts.find(acc => acc.type === 'IRA');
      if (!tradIRAAccount) {
        result.metadata.reason = 'No Traditional IRA account found';
        return result;
      }

      // Find or create Roth IRA account
      let rothIRAAccount = plan.accounts.find(acc => acc.type === 'Roth');
      if (!rothIRAAccount) {
        // Create Roth IRA account if it doesn't exist
        rothIRAAccount = {
          id: `roth_ira_${Date.now()}`,
          name: 'Roth IRA (Backdoor)',
          type: 'Roth',
          balance: 0,
          annualContribution: 0,
          withdrawalRate: 0
        };
        projectionState.accounts.push({
          ...rothIRAAccount,
          contributions: 0,
          withdrawals: 0,
          taxesPaid: 0
        });
        result.changes.createdAccounts = [rothIRAAccount.id];
      }

      // Calculate conversion amount (up to annual limit)
      const conversionAmount = Math.min(
        params.maxAnnualContribution,
        tradIRAAccount.balance / 100 // Convert cents to dollars
      );

      if (conversionAmount <= 0) {
        result.metadata.reason = 'No funds available for conversion';
        return result;
      }

      // Convert from Traditional IRA to Roth IRA
      // In a real implementation, this would calculate taxes on the conversion
      // For now, we'll simulate the conversion

      // Find accounts in projection state
      const tradIRAProjection = projectionState.accounts.find(acc => acc.id === tradIRAAccount.id);
      const rothIRAProjection = projectionState.accounts.find(acc => acc.id === rothIRAAccount.id);

      if (tradIRAProjection && rothIRAProjection) {
        // Move funds from Traditional to Roth IRA
        const conversionAmountCents = Math.round(conversionAmount * 100);

        tradIRAProjection.balance -= conversionAmountCents;
        tradIRAProjection.withdrawals += conversionAmountCents;

        rothIRAProjection.balance += conversionAmountCents;
        rothIRAProjection.contributions += conversionAmountCents;

        // Calculate and apply conversion taxes
        // This is simplified - real conversion would be taxed as ordinary income
        const taxRate = this._estimateConversionTaxRate(plan, yearOffset);
        const taxesDue = Math.round(conversionAmount * taxRate * 100); // Convert to cents

        projectionState.taxes.federal += taxesDue;
        projectionState.taxes.total += taxesDue;

        // Update result
        result.applied = true;
        result.changes.conversionAmount = conversionAmount;
        result.changes.taxesPaid = taxesDue / 100; // Convert back to dollars
        result.changes.fromAccount = tradIRAAccount.id;
        result.changes.toAccount = rothIRAAccount.id;
        result.metadata = {
          strategy: 'backdoor_roth',
          conversionAmount,
          taxRate,
          taxesPaid: taxesDue / 100,
          effectiveRate: conversionAmount > 0 ? (taxesDue / 100) / conversionAmount : 0
        };
      }

    } catch (error) {
      result.metadata.error = error.message;
      console.error('Error applying Backdoor Roth strategy:', error);
    }

    return result;
  }

  getDependencies() {
    return []; // No dependencies - this is a standalone strategy
  }

  getVersion() {
    return '1.0.0';
  }

  getCategory() {
    return 'tax_optimization';
  }

  /**
   * Estimate if the individual has income too high for direct Roth IRA contributions
   * @private
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year
   * @returns {boolean} True if income is above Roth IRA limits
   */
  _estimateHighIncome(plan, yearOffset) {
    // Simplified estimation - in practice this would use detailed income calculations
    // MAGI limits for Roth IRA contributions (2024):
    // Single: $146,000 - $161,000 phase-out range
    // Married Joint: $230,000 - $240,000 phase-out range

    const filingStatus = plan.taxProfile.filingStatus;
    let limit;

    switch (filingStatus) {
      case 'married_joint':
        limit = 230000; // Bottom of phase-out range
        break;
      case 'single':
      case 'head':
      default:
        limit = 146000; // Bottom of phase-out range
        break;
    }

    // Estimate current income - this is very simplified
    // In practice, would need detailed earned income calculation
    const estimatedIncome = plan.accounts.reduce((sum, acc) => {
      return sum + (acc.annualContribution || 0);
    }, 0);

    return estimatedIncome > limit;
  }

  /**
   * Estimate the tax rate that would apply to a Roth conversion
   * @private
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year
   * @returns {number} Estimated tax rate as decimal
   */
  _estimateConversionTaxRate(plan, yearOffset) {
    // Simplified tax rate estimation
    // In practice, this would use the detailed tax calculation functions
    const taxProfile = plan.taxProfile;

    // Use estimated tax rate if provided, otherwise assume marginal rate
    if (taxProfile.estimatedTaxRate) {
      return taxProfile.estimatedTaxRate;
    }

    // Rough estimate based on filing status
    switch (taxProfile.filingStatus) {
      case 'single':
        return 0.25; // Assume 25% marginal rate
      case 'married_joint':
        return 0.20; // Assume 20% marginal rate
      default:
        return 0.25;
    }
  }
}
