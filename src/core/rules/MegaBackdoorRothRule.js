import { BaseRule } from './BaseRule.js';
import { getContributionLimit, getTotalContributionLimit } from '../../../config/loader.js';

export class MegaBackdoorRothRule extends BaseRule {
  constructor(config) {
    super({
      name: 'mega-backdoor-roth',
      description:
        'Mega Backdoor Roth: After-tax 401(k) contributions with in-service conversion to Roth',
    });

    this.annualContribution = (config.annualContribution || 15000) * 100;
    this.planSupportsAfterTax = config.planSupportsAfterTax !== false;
    this.planSupportsInServiceWithdrawal = config.planSupportsInServiceWithdrawal !== false;
    this.employerMatchRate = config.employerMatchRate || 0.04;

    // Handle both dollar inputs (from tests/old code) and cent inputs (from config)
    if (config.employeeDeferralLimit) {
      this.employeeDeferralLimit = config.employeeDeferralLimit < 100000
        ? config.employeeDeferralLimit * 100  // Convert dollars to cents
        : config.employeeDeferralLimit;        // Already in cents
    } else {
      this.employeeDeferralLimit = getContributionLimit('401k');
    }

    if (config.total401kLimit) {
      this.total401kLimit = config.total401kLimit < 1000000
        ? config.total401kLimit * 100  // Convert dollars to cents
        : config.total401kLimit;        // Already in cents
    } else {
      this.total401kLimit = getTotalContributionLimit('401k');
    }
  }

  apply(context) {
    const { plan, yearOffset, accountSnapshots, projectionState } = context;

    if (!plan.megaBackdoorRoth || !plan.megaBackdoorRoth.enabled) {
      return { contributionAmount: 0, conversionAmount: 0, balanceModifications: [] };
    }

    const currentAge = plan.taxProfile.currentAge + yearOffset;

    if (!this.canApply(context)) {
      return { contributionAmount: 0, conversionAmount: 0, balanceModifications: [] };
    }

    const eligibility = this.checkEligibility(currentAge);
    if (!eligibility.eligible) {
      return {
        contributionAmount: 0,
        conversionAmount: 0,
        reason: eligibility.reason,
        balanceModifications: [],
      };
    }

    const annualContribution = this.getAnnualContribution(yearOffset);

    const forty1kAccounts = accountSnapshots
      .map((acc, idx) => ({ acc, original: plan.accounts[idx], idx }))
      .filter(({ acc }) => acc.type === '401k');

    if (forty1kAccounts.length === 0) {
      return {
        contributionAmount: 0,
        conversionAmount: 0,
        reason: 'No 401(k) account found',
        balanceModifications: [],
      };
    }

    const forty1kAccountIndex = forty1kAccounts[0].idx;
    const forty1kAccount = forty1kAccounts[0].acc;
    const forty1kOriginal = forty1kAccounts[0].original;

    const totalIncome = projectionState.totalTaxableIncome || 0;
    const employerMatch = Math.min(
      totalIncome * this.employerMatchRate,
      this.employeeDeferralLimit
    );

    const annualEmployeeContribution = forty1kOriginal.annualContribution || 0;
    const annualDeferral = Math.min(annualEmployeeContribution, this.employeeDeferralLimit);
    const availableRoom = this.total401kLimit - (annualDeferral + employerMatch);

    const maxAfterTaxContribution = Math.max(0, Math.min(annualContribution, availableRoom));

    if (maxAfterTaxContribution <= 0) {
      return {
        contributionAmount: 0,
        conversionAmount: 0,
        reason: 'No room for after-tax contributions',
        balanceModifications: [],
      };
    }

    const afterTaxContribution = maxAfterTaxContribution;

    const rothAccounts = accountSnapshots
      .map((acc, idx) => ({ acc, idx }))
      .filter(({ acc }) => acc.type === 'Roth');

    if (rothAccounts.length === 0) {
      return {
        contributionAmount: afterTaxContribution,
        conversionAmount: 0,
        reason: 'No Roth account found',
        balanceModifications: [],
      };
    }

    const rothAccountIndex = rothAccounts[0].idx;

    const conversionAmount = afterTaxContribution;
    const taxableAmount = 0;
    const taxOnConversion = 0;

    const balanceModifications = [
      {
        accountIndex: forty1kAccountIndex,
        change: afterTaxContribution,
        reason: 'Mega Backdoor Roth - after-tax 401(k) contribution',
      },
      {
        accountIndex: forty1kAccountIndex,
        change: -conversionAmount,
        reason: 'Mega Backdoor Roth - in-service withdrawal',
      },
      {
        accountIndex: rothAccountIndex,
        change: conversionAmount,
        reason: 'Mega Backdoor Roth - converted to Roth',
      },
    ];

    return {
      name: 'mega-backdoor-roth',
      contributionAmount: afterTaxContribution,
      conversionAmount,
      employerMatch,
      taxableAmount,
      nonTaxableAmount: conversionAmount,
      taxOnConversion,
      availableRoom,
      balanceModifications,
    };
  }

  getAnnualContribution(yearOffset) {
    const currentYear = new Date().getFullYear() + yearOffset;
    const totalLimit = getTotalContributionLimit('401k', currentYear);
    const assumedAverageAllocation = 3;

    return Math.min(this.annualContribution, totalLimit / assumedAverageAllocation);
  }

  checkEligibility(currentAge) {
    if (currentAge < 18) {
      return { eligible: false, reason: 'Must be 18 or older' };
    }

    if (!this.planSupportsAfterTax) {
      return { eligible: false, reason: 'Plan does not support after-tax contributions' };
    }

    if (!this.planSupportsInServiceWithdrawal) {
      return { eligible: false, reason: 'Plan does not support in-service withdrawals' };
    }

    return { eligible: true };
  }

  canApply(context) {
    const { plan } = context;
    return plan.megaBackdoorRoth && plan.megaBackdoorRoth.enabled;
  }
}
