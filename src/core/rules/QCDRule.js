import { BaseRule } from './BaseRule.js';
import {
  mustTakeQCD,
  canAccountTakeQCD,
  calculateQCDForAccount,
  calculateTotalQCD,
  calculateQCDTaxBenefit,
  getQCDMinimumAge,
  getQCDLimit
} from '../../calculations/qcd.js';

export class QCDRule extends BaseRule {
  constructor(config) {
    super(config);
    this.strategy = config.strategy || 'fixed';
    this.annualAmount = config.annualAmount || 0;
    this.percentage = config.percentage || 0;
  }

  apply(context) {
    const { plan, yearOffset, projectionState } = context;

    if (!plan.qcdSettings || !plan.qcdSettings.enabled) {
      return { totalQCD: 0, taxBenefit: 0 };
    }

    const currentAge = plan.taxProfile.currentAge + yearOffset;
    const rmdAmount = projectionState.rmdAmount || 0;

    const qcdSettings = {
      ...plan.qcdSettings,
      currentAge
    };

    if (this.strategy === 'fixed') {
      qcdSettings.annualAmount = this.annualAmount;
    } else if (this.strategy === 'percentage') {
      qcdSettings.percentage = this.percentage;
    }

    const accounts = plan.accounts || [];
    const totalQCD = calculateTotalQCD(accounts, qcdSettings, rmdAmount);
    const taxBenefit = calculateQCDTaxBenefit(totalQCD, plan.taxProfile.estimatedTaxRate || 0.25);

    return {
      totalQCD,
      taxBenefit
    };
  }

  canApply(context) {
    const { plan } = context;
    if (!plan.qcdSettings || !plan.qcdSettings.enabled) {
      return false;
    }

    const currentAge = plan.taxProfile.currentAge;
    return mustTakeQCD(currentAge);
  }
}
