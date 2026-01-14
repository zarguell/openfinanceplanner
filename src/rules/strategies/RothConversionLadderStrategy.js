/**
 * Roth Conversion Ladder Strategy
 * Systematically convert Traditional IRA/401k funds to Roth IRA over time to manage tax brackets
 * and create a source of tax-free withdrawals in retirement.
 */

import { RuleInterface, RuleResult, ParameterDefinition } from '../RuleInterface.js';

export class RothConversionLadderStrategy extends RuleInterface {
  constructor(parameters = {}) {
    super();
    this.parameters = { ...this.getDefaultParameters(), ...parameters };
  }

  getId() {
    return 'roth_conversion_ladder';
  }

  getName() {
    return 'Roth Conversion Ladder';
  }

  getDescription() {
    return 'Systematically convert Traditional retirement account funds to Roth IRA over time. ' +
           'This creates a "ladder" of Roth accounts that become available for penalty-free withdrawals ' +
           'at different ages, providing tax-free income while managing current-year tax brackets.';
  }

  getParameters() {
    return [
      new ParameterDefinition(
        'annualConversionAmount',
        'number',
        false,
        50000,
        { min: 0, max: 1000000 },
        'Maximum amount to convert from Traditional to Roth IRA each year'
      ),
      new ParameterDefinition(
        'conversionStartAge',
        'number',
        false,
        45,
        { min: 18, max: 80 },
        'Age to begin Roth conversions'
      ),
      new ParameterDefinition(
        'conversionEndAge',
        'number',
        false,
        65,
        { min: 20, max: 85 },
        'Age to stop Roth conversions'
      ),
      new ParameterDefinition(
        'targetTaxBracket',
        'select',
        false,
        '22%',
        null,
        'Target marginal tax bracket for conversions (to avoid higher brackets)'
      ),
      new ParameterDefinition(
        'filingStatus',
        'select',
        false,
        'single',
        null,
        'Tax filing status for bracket calculations'
      )
    ];
  }

  getDefaultParameters() {
    return {
      annualConversionAmount: 50000,
      conversionStartAge: 45,
      conversionEndAge: 65,
      targetTaxBracket: '22%',
      filingStatus: 'single'
    };
  }

  validateParameters(parameters) {
    const errors = [];
    const params = { ...this.getDefaultParameters(), ...parameters };

    if (params.annualConversionAmount < 0) {
      errors.push('Annual conversion amount must be non-negative');
    }

    if (params.conversionStartAge >= params.conversionEndAge) {
      errors.push('Conversion start age must be less than end age');
    }

    if (params.conversionStartAge < 18 || params.conversionStartAge > 80) {
      errors.push('Conversion start age must be between 18 and 80');
    }

    if (params.conversionEndAge < 20 || params.conversionEndAge > 85) {
      errors.push('Conversion end age must be between 20 and 85');
    }

    const validBrackets = ['12%', '22%', '24%', '32%', '35%', '37%'];
    if (!validBrackets.includes(params.targetTaxBracket)) {
      errors.push('Target tax bracket must be one of: ' + validBrackets.join(', '));
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
    const params = this.parameters;

    // Check if within conversion age range
    if (age < params.conversionStartAge || age > params.conversionEndAge) {
      return false;
    }

    // Check if person has Traditional IRA/401k funds available
    const hasTraditionalFunds = plan.accounts.some(acc =>
      (acc.type === 'IRA' || acc.type === '401k') && acc.balance > 0
    );

    // Check if person has Roth IRA (or will create one)
    const hasRothIRA = plan.accounts.some(acc => acc.type === 'Roth') ||
                      projectionState.accounts.some(acc => acc.type === 'Roth');

    return hasTraditionalFunds && (hasRothIRA || true); // Can create Roth if needed
  }

  apply(plan, yearOffset, projectionState, parameters) {
    const params = { ...this.getDefaultParameters(), ...parameters };
    const result = new RuleResult(false, {}, {});

    try {
      // Find Traditional retirement accounts
      const traditionalAccounts = plan.accounts.filter(acc =>
        (acc.type === 'IRA' || acc.type === '401k') && acc.balance > 0
      );

      if (traditionalAccounts.length === 0) {
        result.metadata.reason = 'No Traditional retirement accounts with funds available';
        return result;
      }

      // Find or create Roth IRA account
      let rothAccount = plan.accounts.find(acc => acc.type === 'Roth');
      if (!rothAccount) {
        rothAccount = {
          id: `roth_ira_ladder_${Date.now()}`,
          name: 'Roth IRA (Conversion Ladder)',
          type: 'Roth',
          balance: 0,
          annualContribution: 0,
          withdrawalRate: 0
        };
        projectionState.accounts.push({
          ...rothAccount,
          contributions: 0,
          withdrawals: 0,
          taxesPaid: 0
        });
        result.changes.createdAccounts = [rothAccount.id];
      }

      // Calculate conversion amount based on target tax bracket
      const availableAmount = traditionalAccounts.reduce((sum, acc) => sum + acc.balance, 0) / 100; // Convert cents to dollars
      const targetAmount = Math.min(params.annualConversionAmount, availableAmount);

      if (targetAmount <= 0) {
        result.metadata.reason = 'No funds available for conversion';
        return result;
      }

      // Adjust conversion amount to stay within target tax bracket
      const adjustedAmount = this._calculateTaxBracketAdjustedAmount(plan, yearOffset, targetAmount, params);

      if (adjustedAmount <= 0) {
        result.metadata.reason = 'Conversion would exceed target tax bracket';
        return result;
      }

      // Perform the conversion
      const conversionAmountCents = Math.round(adjustedAmount * 100);

      // Convert from Traditional accounts (prioritize IRA over 401k for simplicity)
      let remainingToConvert = conversionAmountCents;
      const convertedFrom = [];

      for (const tradAccount of traditionalAccounts) {
        if (remainingToConvert <= 0) break;

        const tradProjection = projectionState.accounts.find(acc => acc.id === tradAccount.id);
        if (!tradProjection) continue;

        const convertFromThis = Math.min(remainingToConvert, tradProjection.balance);
        if (convertFromThis > 0) {
          tradProjection.balance -= convertFromThis;
          tradProjection.withdrawals += convertFromThis;
          remainingToConvert -= convertFromThis;
          convertedFrom.push({
            accountId: tradAccount.id,
            amount: convertFromThis
          });
        }
      }

      // Add to Roth IRA
      const rothProjection = projectionState.accounts.find(acc => acc.id === rothAccount.id);
      if (rothProjection) {
        const actualConverted = conversionAmountCents - remainingToConvert;
        rothProjection.balance += actualConverted;
        rothProjection.contributions += actualConverted;

        // Calculate and apply conversion taxes
        const taxRate = this._estimateConversionTaxRate(plan, yearOffset, adjustedAmount, params);
        const taxesDue = Math.round(adjustedAmount * taxRate * 100); // Convert to cents

        projectionState.taxes.federal += taxesDue;
        projectionState.taxes.total += taxesDue;

        // Update result
        result.applied = true;
        result.changes.conversionAmount = adjustedAmount;
        result.changes.taxesPaid = taxesDue / 100; // Convert back to dollars
        result.changes.fromAccounts = convertedFrom;
        result.changes.toAccount = rothAccount.id;
        result.metadata = {
          strategy: 'roth_conversion_ladder',
          conversionAmount: adjustedAmount,
          taxRate,
          taxesPaid: taxesDue / 100,
          effectiveRate: adjustedAmount > 0 ? (taxesDue / 100) / adjustedAmount : 0,
          targetTaxBracket: params.targetTaxBracket,
          age: plan.taxProfile.currentAge + yearOffset
        };
      }

    } catch (error) {
      result.metadata.error = error.message;
      console.error('Error applying Roth Conversion Ladder strategy:', error);
    }

    return result;
  }

  getDependencies() {
    return []; // Standalone strategy, but could depend on tax calculation rules
  }

  getVersion() {
    return '1.0.0';
  }

  getCategory() {
    return 'tax_optimization';
  }

  /**
   * Calculate conversion amount adjusted to stay within target tax bracket
   * @private
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year
   * @param {number} desiredAmount - Desired conversion amount in dollars
   * @param {object} params - Strategy parameters
   * @returns {number} Adjusted conversion amount in dollars
   */
  _calculateTaxBracketAdjustedAmount(plan, yearOffset, desiredAmount, params) {
    // This is a simplified implementation
    // In practice, would use detailed tax calculations to determine exact bracket limits

    const targetBracketPercent = parseInt(params.targetTaxBracket) / 100;

    // Rough estimate of current taxable income (simplified)
    const estimatedIncome = plan.accounts.reduce((sum, acc) => {
      return sum + (acc.annualContribution || 0);
    }, 0);

    // Estimate bracket thresholds (simplified 2024 single filer brackets)
    const bracketLimits = {
      '12%': 11000,
      '22%': 44725,
      '24%': 95375,
      '32%': 182100,
      '35%': 231250,
      '37%': 578125
    };

    const targetLimit = bracketLimits[params.targetTaxBracket] || bracketLimits['22%'];

    // Calculate how much additional income we can take before exceeding target bracket
    const availableInBracket = Math.max(0, targetLimit - estimatedIncome);

    // Limit conversion to stay within bracket
    return Math.min(desiredAmount, availableInBracket);
  }

  /**
   * Estimate the tax rate for Roth conversion
   * @private
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year
   * @param {number} conversionAmount - Conversion amount in dollars
   * @param {object} params - Strategy parameters
   * @returns {number} Estimated tax rate as decimal
   */
  _estimateConversionTaxRate(plan, yearOffset, conversionAmount, params) {
    // Use estimated tax rate if provided, otherwise estimate based on target bracket
    if (plan.taxProfile.estimatedTaxRate) {
      return plan.taxProfile.estimatedTaxRate;
    }

    // Estimate based on target bracket (assume we're trying to stay in this bracket)
    const bracketRates = {
      '12%': 0.12,
      '22%': 0.22,
      '24%': 0.24,
      '32%': 0.32,
      '35%': 0.35,
      '37%': 0.37
    };

    return bracketRates[params.targetTaxBracket] || 0.22;
  }
}
