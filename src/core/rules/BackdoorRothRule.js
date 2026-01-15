import { BaseRule } from './BaseRule.js';

export class BackdoorRothRule extends BaseRule {
  constructor(config) {
    super(config);
    this.annualContribution = (config.annualContribution || 6000) * 100;
    this.incomeThreshold = (config.incomeThreshold || 129000) * 100;
    this.phaseOutEnd = (config.phaseOutEnd || 144000) * 100;
  }

  apply(context) {
    const { plan, yearOffset, accountSnapshots } = context;

    if (!plan.backdoorRoth || !plan.backdoorRoth.enabled) {
      return { contributionAmount: 0, conversionAmount: 0, balanceModifications: [] };
    }

    const currentAge = plan.taxProfile.currentAge + yearOffset;

    if (!this.canApply(context)) {
      return { contributionAmount: 0, conversionAmount: 0, balanceModifications: [] };
    }

    const annualContribution = this.getAnnualContribution(yearOffset);
    const totalIncome = context.projectionState.totalTaxableIncome || 0;

    const eligibility = this.checkEligibility(totalIncome, currentAge);
    if (!eligibility.eligible) {
      return { contributionAmount: 0, conversionAmount: 0, reason: eligibility.reason, balanceModifications: [] };
    }

    const traditionalAccounts = accountSnapshots
      .map((acc, idx) => ({ acc, original: plan.accounts[idx], idx }))
      .filter(({ acc }) => acc.type === 'IRA');

    if (traditionalAccounts.length === 0) {
      return { contributionAmount: 0, conversionAmount: 0, reason: 'No IRA account found', balanceModifications: [] };
    }

    const traditionalAccountIndex = traditionalAccounts[0].idx;
    const traditionalBalance = traditionalAccounts[0].acc.balance;

    const proRataCalculation = this.calculateProRata(annualContribution, traditionalBalance);
    const conversionAmount = proRataCalculation.convertibleAmount;

    if (conversionAmount <= 0) {
      return { contributionAmount: annualContribution, conversionAmount: 0, reason: 'No conversion possible', balanceModifications: [] };
    }

    const rothAccounts = accountSnapshots
      .map((acc, idx) => ({ acc, idx }))
      .filter(({ acc }) => acc.type === 'Roth');

    if (rothAccounts.length === 0) {
      return { contributionAmount: annualContribution, conversionAmount: 0, reason: 'No Roth account found', balanceModifications: [] };
    }

    const rothAccountIndex = rothAccounts[0].idx;

    const taxOnConversion = proRataCalculation.taxableAmount * (plan.taxProfile.estimatedTaxRate || 0.25);

    const balanceModifications = [
      {
        accountIndex: traditionalAccountIndex,
        change: annualContribution,
        reason: 'Backdoor Roth - non-deductible contribution'
      },
      {
        accountIndex: traditionalAccountIndex,
        change: -conversionAmount,
        reason: 'Backdoor Roth - conversion to Roth'
      },
      {
        accountIndex: rothAccountIndex,
        change: conversionAmount,
        reason: 'Backdoor Roth - converted amount'
      }
    ];

    return {
      name: 'backdoor-roth',
      contributionAmount: annualContribution,
      conversionAmount,
      taxableAmount: proRataCalculation.taxableAmount,
      nonTaxableAmount: proRataCalculation.nonTaxableAmount,
      taxOnConversion,
      proRataRatio: proRataCalculation.preTaxRatio,
      balanceModifications
    };
  }

  getAnnualContribution(yearOffset) {
    const currentYear = new Date().getFullYear() + yearOffset;
    const yearToIndex = currentYear - new Date().getFullYear();

    const contributionLimits = {
      0: 7000,
      1: 7000,
      2: 7000,
      3: 7000,
      4: 7000,
      5: 7000,
      6: 7000,
      7: 7000,
      8: 8000,
      9: 8000,
      10: 8000,
      11: 8000,
      12: 8000,
      13: 8000,
      14: 8000,
      15: 8000,
      16: 8000,
      17: 8000,
      18: 8000,
      19: 8000,
      20: 8000,
      21: 8000,
      22: 8000,
      23: 8000,
      24: 8000,
      25: 8000,
      26: 8000,
      27: 8000,
      28: 8000,
      29: 8000,
      30: 8000
    };

    return (contributionLimits[yearToIndex] || 7000) * 100;
  }

  checkEligibility(income, currentAge) {
    if (currentAge < 18) {
      return { eligible: false, reason: 'Must be 18 or older' };
    }

    if (income > this.phaseOutEnd) {
      return { eligible: false, reason: 'Income above phase-out limit' };
    }

    return { eligible: true };
  }

  calculateProRata(contributionAmount, traditionalBalance) {
    const totalBalance = traditionalBalance + contributionAmount;

    if (totalBalance <= 0) {
      return {
        preTaxRatio: 0,
        taxableAmount: 0,
        nonTaxableAmount: contributionAmount,
        convertibleAmount: 0
      };
    }

    const preTaxRatio = traditionalBalance / totalBalance;
    const taxableAmount = contributionAmount * preTaxRatio;
    const nonTaxableAmount = contributionAmount * (1 - preTaxRatio);

    return {
      preTaxRatio,
      taxableAmount,
      nonTaxableAmount,
      convertibleAmount: contributionAmount
    };
  }

  canApply(context) {
    const { plan } = context;
    return plan.backdoorRoth && plan.backdoorRoth.enabled;
  }
}
