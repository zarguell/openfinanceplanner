import { BaseRule } from './BaseRule.js';
import {
  calculateFixedConversion,
  calculateBracketFillConversion,
  calculatePercentageConversion,
  calculateConversionTax,
} from '../../calculations/roth-conversions.js';

export class RothConversionRule extends BaseRule {
  constructor(config) {
    super(config);
    this.strategy = config.strategy || 'fixed';
    this.annualAmount = (config.annualAmount || 0) * 100;
    this.bracketTop = (config.bracketTop || 89450) * 100;
    this.percentage = config.percentage || 0.1;
  }

  apply(context) {
    const { plan, yearOffset, projectionState, accountSnapshots } = context;

    if (!plan.rothConversions || !plan.rothConversions.enabled) {
      return { conversionAmount: 0 };
    }

    if (yearOffset === 0) {
      return { conversionAmount: 0 };
    }

    const totalTaxableIncome = projectionState.totalTaxableIncome || 0;
    const currentAge = plan.taxProfile.currentAge + yearOffset;
    const mustTakeRMD = projectionState.mustTakeRMD || false;

    // Find Traditional and Roth account indices
    const traditionalAccounts = accountSnapshots
      .map((acc, idx) => ({ acc, original: plan.accounts[idx], idx }))
      .filter(({ acc }) => acc.type === '401k' || acc.type === 'IRA');

    const rothAccountIndex = accountSnapshots.findIndex((acc) => acc.type === 'Roth');

    if (traditionalAccounts.length === 0 || rothAccountIndex < 0) {
      return { conversionAmount: 0 };
    }

    const totalTraditionalBalance = traditionalAccounts.reduce(
      (sum, { acc }) => sum + acc.balance,
      0
    );
    const traditionalAccountIndex = traditionalAccounts[0].idx;

    let conversionAmount = 0;

    switch (this.strategy) {
    case 'fixed':
      conversionAmount = calculateFixedConversion(
        this.annualAmount,
        totalTraditionalBalance,
        currentAge,
        mustTakeRMD
      );
      break;

    case 'bracket-fill':
      conversionAmount = calculateBracketFillConversion(
        totalTaxableIncome,
        this.bracketTop,
        totalTraditionalBalance
      );
      break;

    case 'percentage':
      conversionAmount = calculatePercentageConversion(this.percentage, totalTraditionalBalance);
      break;

    default:
      conversionAmount = 0;
    }

    if (conversionAmount <= 0) {
      return { conversionAmount: 0 };
    }

    const totalTaxRate = plan.taxProfile.estimatedTaxRate || 0.25;
    const taxImpact = calculateConversionTax(
      conversionAmount,
      totalTaxableIncome,
      totalTaxRate,
      totalTaxRate
    );

    const balanceModifications = [];

    return {
      name: 'roth-conversions',
      conversionAmount,
      taxOnConversion: taxImpact.taxOnConversion,
      balanceModifications,
    };
  }

  canApply(context) {
    const { plan } = context;
    return plan.rothConversions && plan.rothConversions.enabled;
  }
}
