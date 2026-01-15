import { BaseRule } from './BaseRule.js';
import {
  calculateUnrealizedLoss,
  calculateTotalUnrealizedLoss,
  calculateTaxBenefitFromLoss,
  suggestHarvestingAmount,
  applyHarvesting,
} from '../../calculations/tax-loss-harvesting.js';

export class TLHRule extends BaseRule {
  constructor(config) {
    super(config);
    this.strategy = config.strategy || 'all';
    this.threshold = (config.threshold || 1000) * 100;
  }

  apply(context) {
    const { plan, yearOffset, projectionState, accountSnapshots } = context;

    if (!plan.taxLossHarvesting || !plan.taxLossHarvesting.enabled) {
      return {
        harvestedLoss: 0,
        taxBenefitFromHarvesting: 0,
        reason: 'TLH not enabled',
        balanceModifications: [],
      };
    }

    const accounts = plan.accounts || [];
    const unrealizedLoss = calculateTotalUnrealizedLoss(accounts);

    if (unrealizedLoss <= 0) {
      return {
        harvestedLoss: 0,
        taxBenefitFromHarvesting: 0,
        reason: 'No unrealized losses available',
        balanceModifications: [],
      };
    }

    const capitalGains = projectionState.capitalGains || 0;
    const marginalTaxRate = plan.taxProfile.estimatedTaxRate || 0.25;

    const settings = {
      strategy: this.strategy,
      threshold: this.threshold,
    };

    const suggestion = suggestHarvestingAmount(
      unrealizedLoss,
      capitalGains,
      marginalTaxRate,
      settings
    );

    if (suggestion.harvestAmountCents <= 0) {
      return {
        harvestedLoss: 0,
        taxBenefitFromHarvesting: 0,
        reason: suggestion.reason || 'No harvesting suggested',
        balanceModifications: [],
      };
    }

    const balanceModifications = [];
    let appliedHarvest = 0;

    accountSnapshots.forEach((acc, idx) => {
      const account = plan.accounts[idx];
      if (account.type === 'Taxable') {
        const lossInAccount = calculateUnrealizedLoss({ ...account, balance: acc.balance });
        if (lossInAccount > 0 && appliedHarvest < suggestion.harvestAmountCents) {
          const harvestFromAccount = Math.min(
            lossInAccount,
            suggestion.harvestAmountCents - appliedHarvest
          );
          const result = applyHarvesting({ ...account, balance: acc.balance }, harvestFromAccount);
          if (result.success) {
            const newBalance = result.newCostBasis - acc.balance;
            balanceModifications.push({
              accountIndex: idx,
              change: newBalance,
              reason: 'Tax-loss harvesting - reset cost basis',
              costBasisUpdate: result.newCostBasis,
            });
            appliedHarvest += harvestFromAccount;
          }
        }
      }
    });

    return {
      harvestedLoss: appliedHarvest,
      taxBenefitFromHarvesting: suggestion.taxBenefitCents,
      reason: suggestion.reason || 'Harvesting applied',
      balanceModifications,
    };
  }

  canApply(context) {
    const { plan } = context;
    return plan.taxLossHarvesting && plan.taxLossHarvesting.enabled;
  }
}
