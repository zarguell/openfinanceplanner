import { BaseRule } from './BaseRule.js';
import {
  calculateUnrealizedLoss,
  calculateTotalUnrealizedLoss,
  calculateTaxBenefitFromLoss,
  suggestHarvestingAmount
} from '../../calculations/tax-loss-harvesting.js';

export class TLHRule extends BaseRule {
  constructor(config) {
    super(config);
    this.strategy = config.strategy || 'all';
    this.threshold = (config.threshold || 1000) * 100;
  }

  apply(context) {
    const { plan, yearOffset, projectionState } = context;

    if (!plan.taxLossHarvesting || !plan.taxLossHarvesting.enabled) {
      return {
        harvestedLoss: 0,
        taxBenefitFromHarvesting: 0,
        reason: 'TLH not enabled'
      };
    }

    const accounts = plan.accounts || [];
    const unrealizedLoss = calculateTotalUnrealizedLoss(accounts);

    if (unrealizedLoss <= 0) {
      return {
        harvestedLoss: 0,
        taxBenefitFromHarvesting: 0,
        reason: 'No unrealized losses available'
      };
    }

    const capitalGains = projectionState.capitalGains || 0;
    const marginalTaxRate = plan.taxProfile.estimatedTaxRate || 0.25;

    const settings = {
      strategy: this.strategy,
      threshold: this.threshold
    };

    const result = suggestHarvestingAmount(unrealizedLoss, capitalGains, marginalTaxRate, settings);

    return {
      harvestedLoss: result.harvestAmountCents,
      taxBenefitFromHarvesting: result.taxBenefitCents,
      reason: result.reason
    };
  }

  canApply(context) {
    const { plan } = context;
    return plan.taxLossHarvesting && plan.taxLossHarvesting.enabled;
  }
}
