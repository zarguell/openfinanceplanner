import { BaseRule } from './BaseRule.js';
import {
  mustTakeQCD,
  canAccountTakeQCD,
  calculateQCDForAccount,
  calculateTotalQCD,
  calculateQCDTaxBenefit,
  getQCDMinimumAge,
  getQCDLimit,
} from '../../calculations/qcd.js';

export class QCDRule extends BaseRule {
  constructor(config) {
    super(config);
    this.strategy = config.strategy || 'fixed';
    this.annualAmount = config.annualAmount || 0;
    this.percentage = config.percentage || 0;
  }

  apply(context) {
    const { plan, yearOffset, projectionState, accountSnapshots, rmdRequirements } = context;

    if (!plan.qcdSettings || !plan.qcdSettings.enabled) {
      return { totalQCD: 0, taxBenefit: 0, balanceModifications: [] };
    }

    const currentAge = plan.taxProfile.currentAge + yearOffset;
    const rmdAmount = projectionState.rmdAmount || 0;

    const qcdSettings = {
      ...plan.qcdSettings,
      currentAge,
    };

    if (this.strategy === 'fixed') {
      qcdSettings.annualAmount = this.annualAmount;
    } else if (this.strategy === 'percentage') {
      qcdSettings.percentage = this.percentage;
    }

    const accounts = plan.accounts || [];
    const totalQCD = calculateTotalQCD(accounts, qcdSettings, rmdAmount);
    const taxBenefit = calculateQCDTaxBenefit(totalQCD, plan.taxProfile.estimatedTaxRate || 0.25);

    const balanceModifications = [];

    accountSnapshots.forEach((acc, idx) => {
      const account = plan.accounts[idx];
      const qcdForAccount = calculateQCDForAccount(
        { ...account, balance: acc.balance },
        qcdSettings,
        rmdRequirements[idx] || 0
      );

      if (qcdForAccount > 0) {
        balanceModifications.push({
          accountIndex: idx,
          change: -qcdForAccount,
          reason: 'QCD distribution',
        });
      }
    });

    return {
      totalQCD,
      taxBenefit,
      balanceModifications,
    };
  }

  canApply(context) {
    const { plan, yearOffset } = context;
    if (!plan.qcdSettings || !plan.qcdSettings.enabled) {
      return false;
    }

    const currentAge = plan.taxProfile.currentAge + yearOffset;
    return mustTakeQCD(currentAge);
  }
}
