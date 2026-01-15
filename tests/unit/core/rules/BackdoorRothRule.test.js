/**
 * Unit tests for BackdoorRothRule and MegaBackdoorRothRule
 */

import { BackdoorRothRule } from '../../../../src/core/rules/BackdoorRothRule.js';
import { MegaBackdoorRothRule } from '../../../../src/core/rules/MegaBackdoorRothRule.js';

export function testBackdoorRothRuleConstruction() {
  const rule = new BackdoorRothRule({
    name: 'backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 6000,
    incomeThreshold: 129000,
    phaseOutEnd: 144000,
  });

  if (rule.name !== 'backdoor-roth') {
    throw new Error('Rule name not set correctly');
  }

  if (rule.annualContribution !== 6000 * 100) {
    throw new Error('Annual contribution not set correctly');
  }

  if (rule.incomeThreshold !== 129000 * 100) {
    throw new Error('Income threshold not set correctly');
  }

  if (rule.phaseOutEnd !== 144000 * 100) {
    throw new Error('Phase-out end not set correctly');
  }

  console.log('✓ testBackdoorRothRuleConstruction passed');
}

export function testBackdoorRothRuleApply() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    backdoorRoth: {
      enabled: true,
      annualContribution: 6000,
      incomeThreshold: 129000,
      phaseOutEnd: 144000,
    },
    accounts: [
      {
        id: 'ira_1',
        name: 'IRA',
        type: 'IRA',
        balance: 100000 * 100,
      },
      {
        id: 'roth_1',
        name: 'Roth IRA',
        type: 'Roth',
        balance: 50000 * 100,
      },
    ],
  };

  const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 120000 * 100,
    },
  };

  const rule = new BackdoorRothRule({
    name: 'backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 6000,
    incomeThreshold: 129000,
    phaseOutEnd: 144000,
  });

  const result = rule.apply(context);

  if (result.contributionAmount === 0) {
    throw new Error('Contribution should not be 0 for eligible income');
  }

  if (result.contributionAmount !== 7000 * 100) {
    throw new Error(
      `Contribution amount incorrect: expected ${7000 * 100}, got ${result.contributionAmount}`
    );
  }

  if (!result.name || result.name !== 'backdoor-roth') {
    throw new Error('Rule name not included in result');
  }

  if (!result.balanceModifications || result.balanceModifications.length !== 3) {
    throw new Error('Balance modifications incorrect');
  }

  console.log('✓ testBackdoorRothRuleApply passed');
}

export function testBackdoorRothRuleProRata() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    backdoorRoth: {
      enabled: true,
      annualContribution: 6000,
      incomeThreshold: 129000,
      phaseOutEnd: 144000,
    },
    accounts: [
      {
        id: 'ira_1',
        name: 'IRA',
        type: 'IRA',
        balance: 50000 * 100,
      },
      {
        id: 'roth_1',
        name: 'Roth IRA',
        type: 'Roth',
        balance: 0,
      },
    ],
  };

  const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 120000 * 100,
    },
  };

  const rule = new BackdoorRothRule({
    name: 'backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 6000,
    incomeThreshold: 129000,
    phaseOutEnd: 144000,
  });

  const result = rule.apply(context);

  const expectedContribution = 7000 * 100;
  const expectedProRataRatio = (50000 * 100) / (50000 * 100 + expectedContribution);
  if (Math.abs(result.proRataRatio - expectedProRataRatio) > 0.0001) {
    throw new Error('Pro-rata calculation incorrect');
  }

  const expectedTaxableAmount = expectedContribution * expectedProRataRatio;
  if (result.taxableAmount !== expectedTaxableAmount) {
    throw new Error('Taxable amount incorrect');
  }

  const expectedNonTaxableAmount = expectedContribution * (1 - expectedProRataRatio);
  if (result.nonTaxableAmount !== expectedNonTaxableAmount) {
    throw new Error('Non-taxable amount incorrect');
  }

  console.log('✓ testBackdoorRothRuleProRata passed');
}

export function testBackdoorRothRuleIncomeEligibility() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    backdoorRoth: {
      enabled: true,
      annualContribution: 6000,
      incomeThreshold: 129000,
      phaseOutEnd: 144000,
    },
    accounts: [
      {
        id: 'ira_1',
        name: 'IRA',
        type: 'IRA',
        balance: 100000 * 100,
      },
      {
        id: 'roth_1',
        name: 'Roth IRA',
        type: 'Roth',
        balance: 50000 * 100,
      },
    ],
  };

  const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

  const rule = new BackdoorRothRule({
    name: 'backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 6000,
    incomeThreshold: 129000,
    phaseOutEnd: 144000,
  });

  const highIncomeContext = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 150000 * 100,
    },
  };

  const highIncomeResult = rule.apply(highIncomeContext);

  if (highIncomeResult.contributionAmount !== 0) {
    throw new Error('High income should not allow contribution');
  }

  const phaseOutStartContext = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 135000 * 100,
    },
  };

  const phaseOutResult = rule.apply(phaseOutStartContext);

  if (phaseOutResult.contributionAmount === 0) {
    throw new Error('Income at phase-out start should still allow partial contribution');
  }

  console.log('✓ testBackdoorRothRuleIncomeEligibility passed');
}

export function testBackdoorRothRuleNoAccounts() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    backdoorRoth: {
      enabled: true,
      annualContribution: 6000,
      incomeThreshold: 129000,
      phaseOutEnd: 144000,
    },
    accounts: [],
  };

  const accountSnapshots = [];

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 120000 * 100,
    },
  };

  const rule = new BackdoorRothRule({
    name: 'backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 6000,
    incomeThreshold: 129000,
    phaseOutEnd: 144000,
  });

  const result = rule.apply(context);

  if (result.contributionAmount !== 0) {
    throw new Error('No IRA account should result in 0 contribution');
  }

  if (result.reason !== 'No IRA account found') {
    throw new Error(`Reason should indicate no IRA account. Got: ${result.reason}`);
  }

  console.log('✓ testBackdoorRothRuleNoAccounts passed');
}

export function testMegaBackdoorRothRuleConstruction() {
  const rule = new MegaBackdoorRothRule({
    name: 'mega-backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 15000,
    planSupportsAfterTax: true,
    planSupportsInServiceWithdrawal: true,
    employerMatchRate: 0.04,
    employeeDeferralLimit: 23500,
    total401kLimit: 69000,
  });

  if (rule.name !== 'mega-backdoor-roth') {
    throw new Error('Rule name not set correctly');
  }

  if (rule.annualContribution !== 15000 * 100) {
    throw new Error('Annual contribution not set correctly');
  }

  if (rule.planSupportsAfterTax !== true) {
    throw new Error('Plan support flag not set correctly');
  }

  if (rule.employerMatchRate !== 0.04) {
    throw new Error('Employer match rate not set correctly');
  }

  if (rule.total401kLimit !== 69000 * 100) {
    throw new Error('Total 401k limit not set correctly');
  }

  console.log('✓ testMegaBackdoorRothRuleConstruction passed');
}

export function testMegaBackdoorRothRuleApply() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    megaBackdoorRoth: {
      enabled: true,
      annualContribution: 15000,
      planSupportsAfterTax: true,
      planSupportsInServiceWithdrawal: true,
      employerMatchRate: 0.04,
      employeeDeferralLimit: 23500,
      total401kLimit: 69000,
    },
    accounts: [
      {
        id: '401k_1',
        name: '401k',
        type: '401k',
        balance: 200000 * 100,
        annualContribution: 20000 * 100,
      },
      {
        id: 'roth_1',
        name: 'Roth IRA',
        type: 'Roth',
        balance: 50000 * 100,
      },
    ],
  };

  const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 200000 * 100,
    },
  };

  const rule = new MegaBackdoorRothRule({
    name: 'mega-backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 15000,
    planSupportsAfterTax: true,
    planSupportsInServiceWithdrawal: true,
    employerMatchRate: 0.04,
    employeeDeferralLimit: 23500,
    total401kLimit: 69000,
  });

  const result = rule.apply(context);

  if (!result.name || result.name !== 'mega-backdoor-roth') {
    throw new Error('Rule name not included in result');
  }

  if (!result.balanceModifications || result.balanceModifications.length !== 3) {
    throw new Error('Balance modifications incorrect');
  }

  console.log('✓ testMegaBackdoorRothRuleApply passed');
}

export function testMegaBackdoorRothRuleEligibility() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    megaBackdoorRoth: {
      enabled: true,
      annualContribution: 15000,
      planSupportsAfterTax: true,
      planSupportsInServiceWithdrawal: true,
      employerMatchRate: 0.04,
      employeeDeferralLimit: 23500,
      total401kLimit: 69000,
    },
    accounts: [
      {
        id: '401k_1',
        name: '401k',
        type: '401k',
        balance: 200000 * 100,
        annualContribution: 20000 * 100,
      },
      {
        id: 'roth_1',
        name: 'Roth IRA',
        type: 'Roth',
        balance: 50000 * 100,
      },
    ],
  };

  const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

  const ruleNoAfterTax = new MegaBackdoorRothRule({
    name: 'mega-backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 15000,
    planSupportsAfterTax: false,
    planSupportsInServiceWithdrawal: true,
    employerMatchRate: 0.04,
    employeeDeferralLimit: 23500,
    total401kLimit: 69000,
  });

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 200000 * 100,
    },
  };

  const result = ruleNoAfterTax.apply(context);

  if (result.contributionAmount !== 0) {
    throw new Error('No after-tax support should result in 0 contribution');
  }

  if (result.reason !== 'Plan does not support after-tax contributions') {
    throw new Error('Reason should indicate no after-tax support');
  }

  console.log('✓ testMegaBackdoorRothRuleEligibility passed');
}

export function testMegaBackdoorRothRuleNo401k() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    megaBackdoorRoth: {
      enabled: true,
      annualContribution: 15000,
      planSupportsAfterTax: true,
      planSupportsInServiceWithdrawal: true,
      employerMatchRate: 0.04,
      employeeDeferralLimit: 23500,
      total401kLimit: 69000,
    },
    accounts: [],
  };

  const accountSnapshots = [];

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 200000 * 100,
    },
  };

  const rule = new MegaBackdoorRothRule({
    name: 'mega-backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 15000,
    planSupportsAfterTax: true,
    planSupportsInServiceWithdrawal: true,
    employerMatchRate: 0.04,
    employeeDeferralLimit: 23500,
    total401kLimit: 69000,
  });

  const result = rule.apply(context);

  if (result.contributionAmount !== 0) {
    throw new Error('No 401k account should result in 0 contribution');
  }

  if (result.reason !== 'No 401(k) account found') {
    throw new Error('Reason should indicate no 401k account');
  }

  console.log('✓ testMegaBackdoorRothRuleNo401k passed');
}

export function testMegaBackdoorRothRuleNoRoom() {
  const plan = {
    taxProfile: {
      currentAge: 40,
      estimatedTaxRate: 0.25,
    },
    megaBackdoorRoth: {
      enabled: true,
      annualContribution: 15000,
      planSupportsAfterTax: true,
      planSupportsInServiceWithdrawal: true,
      employerMatchRate: 0.04,
      employeeDeferralLimit: 23500,
      total401kLimit: 69000,
    },
    accounts: [
      {
        id: '401k_1',
        name: '401k',
        type: '401k',
        balance: 200000 * 100,
        annualContribution: 69000 * 100,
      },
      {
        id: 'roth_1',
        name: 'Roth IRA',
        type: 'Roth',
        balance: 50000 * 100,
      },
    ],
  };

  const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

  const context = {
    plan,
    yearOffset: 0,
    accountSnapshots,
    projectionState: {
      totalTaxableIncome: 200000 * 100,
    },
  };

  const rule = new MegaBackdoorRothRule({
    name: 'mega-backdoor-roth',
    description: 'Test rule',
    dependencies: [],
    annualContribution: 15000,
    planSupportsAfterTax: true,
    planSupportsInServiceWithdrawal: true,
    employerMatchRate: 0.04,
    employeeDeferralLimit: 23500,
    total401kLimit: 69000,
  });

  const result = rule.apply(context);

  if (result.contributionAmount !== 15000 * 100) {
    throw new Error('Full 401k should allow $15,000 after-tax contribution');
  }

  if (result.reason) {
    throw new Error(`Should not have a reason when room is available. Got: ${result.reason}`);
  }

  console.log('✓ testMegaBackdoorRothRuleNoRoom passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testBackdoorRothRuleConstruction();
    testBackdoorRothRuleApply();
    testBackdoorRothRuleProRata();
    testBackdoorRothRuleIncomeEligibility();
    testBackdoorRothRuleNoAccounts();
    testMegaBackdoorRothRuleConstruction();
    testMegaBackdoorRothRuleApply();
    testMegaBackdoorRothRuleEligibility();
    testMegaBackdoorRothRuleNo401k();
    testMegaBackdoorRothRuleNoRoom();
    console.log('\nAll Backdoor Roth tests passed! ✓');
  } catch (error) {
    console.error('Backdoor Roth test failed:', error.message);
    process.exit(1);
  }
}
