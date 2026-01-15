import { BaseRule } from './BaseRule.js';
import {
  calculateFixedConversion,
  calculateBracketFillConversion,
  calculatePercentageConversion,
  calculateConversionTax
} from '../../calculations/roth-conversions.js';

export class RothConversionRule extends BaseRule {
  constructor(config) {
    super(config);
    this.strategy = config.strategy || 'fixed';
    this.annualAmount = (config.annualAmount || 0) * 100;
    this.bracketTop = (config.bracketTop || 89450) * 100;
    this.percentage = config.percentage || 0.10;
  }

  apply(context) {
    const { plan, yearOffset, projectionState } = context;

    if (!plan.rothConversions || !plan.rothConversions.enabled) {
      return { conversionAmount: 0 };
    }

    if (yearOffset === 0) {
      return { conversionAmount: 0 };
    }

    const totalTaxableIncome = projectionState.totalTaxableIncome || 0;
    const traditionalBalance = projectionState.traditionalBalance || 0;
    const currentAge = plan.taxProfile.currentAge + yearOffset;
    const mustTakeRMD = projectionState.mustTakeRMD || false;

    let conversionAmount = 0;

    switch (this.strategy) {
      case 'fixed':
        conversionAmount = calculateFixedConversion(
          this.annualAmount,
          traditionalBalance,
          currentAge,
          mustTakeRMD
        );
        break;

      case 'bracket-fill':
        conversionAmount = calculateBracketFillConversion(
          totalTaxableIncome,
          this.bracketTop,
          traditionalBalance
        );
        break;

      case 'percentage':
        conversionAmount = calculatePercentageConversion(
          this.percentage,
          traditionalBalance
        );
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

    return {
      conversionAmount,
      taxOnConversion: taxImpact.taxOnConversion
    };
  }

  canApply(context) {
    const { plan } = context;
    return plan.rothConversions && plan.rothConversions.enabled;
  }
}
