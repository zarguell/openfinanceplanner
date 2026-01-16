import { describe, it, expect } from 'vitest';
import { BackdoorRothRule } from '../../../../src/core/rules/BackdoorRothRule.js';
import { MegaBackdoorRothRule } from '../../../../src/core/rules/MegaBackdoorRothRule.js';

describe('BackdoorRothRule', () => {
  describe('construction', () => {
    it('should set rule name correctly', () => {
      const rule = new BackdoorRothRule({
        name: 'backdoor-roth',
        description: 'Test rule',
        dependencies: [],
        annualContribution: 6000,
        incomeThreshold: 129000,
        phaseOutEnd: 144000,
      });

      expect(rule.name).toBe('backdoor-roth');
    });

    it('should convert annual contribution to cents', () => {
      const rule = new BackdoorRothRule({
        name: 'backdoor-roth',
        description: 'Test rule',
        dependencies: [],
        annualContribution: 6000,
        incomeThreshold: 129000,
        phaseOutEnd: 144000,
      });

      expect(rule.annualContribution).toBe(6000 * 100);
    });

    it('should convert income threshold to cents', () => {
      const rule = new BackdoorRothRule({
        name: 'backdoor-roth',
        description: 'Test rule',
        dependencies: [],
        annualContribution: 6000,
        incomeThreshold: 129000,
        phaseOutEnd: 144000,
      });

      expect(rule.incomeThreshold).toBe(129000 * 100);
    });

    it('should convert phase-out end to cents', () => {
      const rule = new BackdoorRothRule({
        name: 'backdoor-roth',
        description: 'Test rule',
        dependencies: [],
        annualContribution: 6000,
        incomeThreshold: 129000,
        phaseOutEnd: 144000,
      });

      expect(rule.phaseOutEnd).toBe(144000 * 100);
    });
  });

  describe('apply', () => {
    it('should return non-zero contribution for eligible income', () => {
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

      expect(result.contributionAmount).not.toBe(0);
      expect(result.contributionAmount).toBe(7000 * 100);
    });

    it('should include rule name in result', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 100000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 120000 * 100 },
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

      expect(result.name).toBe('backdoor-roth');
    });

    it('should return balance modifications', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 100000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 120000 * 100 },
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

      expect(result.balanceModifications).toBeDefined();
      expect(result.balanceModifications.length).toBe(3);
    });
  });

  describe('pro-rata calculation', () => {
    it('should calculate pro-rata ratio correctly', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 50000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 0 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 120000 * 100 },
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
      expect(Math.abs(result.proRataRatio - expectedProRataRatio)).toBeLessThan(0.0001);
    });

    it('should calculate taxable amount correctly', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 50000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 0 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 120000 * 100 },
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
      const expectedTaxableAmount = expectedContribution * expectedProRataRatio;

      expect(result.taxableAmount).toBe(expectedTaxableAmount);
    });

    it('should calculate non-taxable amount correctly', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 50000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 0 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 120000 * 100 },
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
      const expectedNonTaxableAmount = expectedContribution * (1 - expectedProRataRatio);

      expect(result.nonTaxableAmount).toBe(expectedNonTaxableAmount);
    });
  });

  describe('income eligibility', () => {
    it('should return 0 contribution for high income', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 100000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
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
        projectionState: { totalTaxableIncome: 150000 * 100 },
      };

      const highIncomeResult = rule.apply(highIncomeContext);

      expect(highIncomeResult.contributionAmount).toBe(0);
    });

    it('should allow partial contribution at phase-out start', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        backdoorRoth: {
          enabled: true,
          annualContribution: 6000,
          incomeThreshold: 129000,
          phaseOutEnd: 144000,
        },
        accounts: [
          { id: 'ira_1', name: 'IRA', type: 'IRA', balance: 100000 * 100 },
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
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

      const phaseOutStartContext = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 135000 * 100 },
      };

      const phaseOutResult = rule.apply(phaseOutStartContext);

      expect(phaseOutResult.contributionAmount).not.toBe(0);
    });
  });

  describe('no accounts', () => {
    it('should return 0 contribution when no IRA account found', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
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
        projectionState: { totalTaxableIncome: 120000 * 100 },
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

      expect(result.contributionAmount).toBe(0);
      expect(result.reason).toBe('No IRA account found');
    });
  });
});

describe('MegaBackdoorRothRule', () => {
  describe('construction', () => {
    it('should set rule name correctly', () => {
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

      expect(rule.name).toBe('mega-backdoor-roth');
    });

    it('should convert annual contribution to cents', () => {
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

      expect(rule.annualContribution).toBe(15000 * 100);
    });

    it('should set plan support flags correctly', () => {
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

      expect(rule.planSupportsAfterTax).toBe(true);
    });

    it('should set employer match rate correctly', () => {
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

      expect(rule.employerMatchRate).toBe(0.04);
    });

    it('should convert total 401k limit to cents', () => {
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

      expect(rule.total401kLimit).toBe(69000 * 100);
    });
  });

  describe('apply', () => {
    it('should return result with rule name', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
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
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 200000 * 100 },
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

      expect(result.name).toBe('mega-backdoor-roth');
    });

    it('should return balance modifications', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
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
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 200000 * 100 },
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

      expect(result.balanceModifications).toBeDefined();
      expect(result.balanceModifications.length).toBe(3);
    });
  });

  describe('eligibility', () => {
    it('should return 0 when plan does not support after-tax', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
        megaBackdoorRoth: {
          enabled: true,
          annualContribution: 15000,
          planSupportsAfterTax: false,
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
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
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
        projectionState: { totalTaxableIncome: 200000 * 100 },
      };

      const result = ruleNoAfterTax.apply(context);

      expect(result.contributionAmount).toBe(0);
      expect(result.reason).toBe('Plan does not support after-tax contributions');
    });
  });

  describe('no 401k', () => {
    it('should return 0 when no 401k account found', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
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
        projectionState: { totalTaxableIncome: 200000 * 100 },
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

      expect(result.contributionAmount).toBe(0);
      expect(result.reason).toBe('No 401(k) account found');
    });
  });

  describe('no room', () => {
    it('should allow contribution when 401k has room', () => {
      const plan = {
        taxProfile: { currentAge: 40, estimatedTaxRate: 0.25 },
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
          { id: 'roth_1', name: 'Roth IRA', type: 'Roth', balance: 50000 * 100 },
        ],
      };

      const accountSnapshots = plan.accounts.map((acc) => ({ ...acc }));

      const context = {
        plan,
        yearOffset: 0,
        accountSnapshots,
        projectionState: { totalTaxableIncome: 200000 * 100 },
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

      expect(result.contributionAmount).toBe(15000 * 100);
      expect(result.reason).toBeUndefined();
    });
  });
});
