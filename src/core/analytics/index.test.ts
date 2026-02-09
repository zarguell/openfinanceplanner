import { describe, it, expect } from 'vitest';
import {
  calculateCashFlow,
  calculateNetWorthComposition,
  calculateProgressMetrics,
  generateCashFlowNodes,
  generateSankeyData,
} from './index';
import type { Account, Income, Expense, Goal } from '../types';

describe('Analytics Module', () => {
  describe('calculateCashFlow', () => {
    it('should calculate total cash flow from incomes and expenses', () => {
      const incomes: Income[] = [
        {
          id: '1',
          type: 'work',
          name: 'Salary',
          amount: 120000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'salary',
          taxable: true,
        },
      ];
      const expenses: Expense[] = [
        {
          id: '1',
          type: 'recurring',
          name: 'Rent',
          amount: 24000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'housing',
          mandatory: true,
          variable: false,
        },
      ];
      const result = calculateCashFlow(incomes, expenses, 2024);
      expect(result.netCashFlow).toBe(96000);
      expect(result.totalIncome).toBe(120000);
      expect(result.totalExpenses).toBe(24000);
    });

    it('should handle empty incomes and expenses', () => {
      const result = calculateCashFlow([], [], 2024);
      expect(result.netCashFlow).toBe(0);
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
    });

    it('should apply frequency multipliers correctly', () => {
      const incomes: Income[] = [
        {
          id: '1',
          type: 'work',
          name: 'Salary',
          amount: 10000,
          frequency: 'monthly',
          startDate: '2024-01-01',
          category: 'salary',
          taxable: true,
        },
      ];
      const result = calculateCashFlow(incomes, [], 2024);
      expect(result.totalIncome).toBe(120000);
    });

    it('should handle changes over time', () => {
      const incomes: Income[] = [
        {
          id: '1',
          type: 'work',
          name: 'Salary',
          amount: 100000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'salary',
          taxable: true,
          changes: [
            { year: 2025, newAmount: 110000, description: 'Promotion' },
          ],
        },
      ];
      const result2024 = calculateCashFlow(incomes, [], 2024);
      const result2025 = calculateCashFlow(incomes, [], 2025);
      expect(result2024.totalIncome).toBe(100000);
      expect(result2025.totalIncome).toBe(110000);
    });
  });

  describe('calculateNetWorthComposition', () => {
    it('should calculate net worth from assets and liabilities', () => {
      const accounts: Account[] = [
        {
          id: '1',
          name: 'Investments',
          type: 'taxable',
          balance: 500000,
          taxCharacteristics: 'taxable',
        },
        {
          id: '2',
          name: 'Home',
          type: 'real-assets',
          balance: 400000,
          taxCharacteristics: 'taxable',
          assetType: 'primary-home',
        },
        {
          id: '3',
          name: 'Mortgage',
          type: 'debts',
          balance: -300000,
          taxCharacteristics: 'tax-deductible',
          liabilityType: 'mortgage',
          interestRate: 5,
        },
      ];
      const result = calculateNetWorthComposition(accounts);
      expect(result.totalNetWorth).toBe(600000);
      expect(result.totalAssets).toBe(900000);
      expect(result.totalLiabilities).toBe(300000);
    });

    it('should break down net worth by account type', () => {
      const accounts: Account[] = [
        {
          id: '1',
          name: '401k',
          type: 'tax-advantaged',
          balance: 200000,
          taxCharacteristics: 'tax-deferred',
          accountType: '401k',
        },
        {
          id: '2',
          name: 'Roth IRA',
          type: 'tax-advantaged',
          balance: 100000,
          taxCharacteristics: 'tax-free',
          accountType: 'roth-ira',
        },
        {
          id: '3',
          name: 'Taxable',
          type: 'taxable',
          balance: 150000,
          taxCharacteristics: 'taxable',
        },
      ];
      const result = calculateNetWorthComposition(accounts);
      expect(result.byType['tax-advantaged']).toBe(300000);
      expect(result.byType['taxable']).toBe(150000);
    });

    it('should handle empty accounts', () => {
      const result = calculateNetWorthComposition([]);
      expect(result.totalNetWorth).toBe(0);
      expect(result.totalAssets).toBe(0);
      expect(result.totalLiabilities).toBe(0);
    });
  });

  describe('calculateProgressMetrics', () => {
    it('should calculate progress for goals', () => {
      const goals: Goal[] = [
        {
          id: '1',
          name: 'Emergency Fund',
          type: 'emergency-fund',
          targetAmount: 50000,
          currentAmount: 25000,
          targetDate: '2026-01-01',
          startDate: '2024-01-01',
          priority: 'high',
          mandatory: true,
          status: 'in-progress',
        },
        {
          id: '2',
          name: 'Vacation',
          type: 'vacation',
          targetAmount: 10000,
          currentAmount: 10000,
          targetDate: '2025-06-01',
          startDate: '2024-01-01',
          priority: 'medium',
          mandatory: false,
          status: 'completed',
        },
      ];
      const result = calculateProgressMetrics(goals);
      expect(result.totalProgress).toBe(0.75);
      expect(result.completedGoals).toBe(1);
      expect(result.inProgressGoals).toBe(1);
    });

    it('should determine if goals are on track', () => {
      const goals: Goal[] = [
        {
          id: '1',
          name: 'Retirement',
          type: 'retirement-savings',
          targetAmount: 1000000,
          currentAmount: 500000,
          targetDate: '2050-01-01',
          startDate: '2020-01-01',
          priority: 'high',
          mandatory: true,
          status: 'on-track',
          monthlyContribution: 1000,
        },
      ];
      const result = calculateProgressMetrics(goals);
      expect(result.onTrackGoals).toBe(1);
    });

    it('should calculate progress points for timeline visualization', () => {
      const goals: Goal[] = [
        {
          id: '1',
          name: 'Down Payment',
          type: 'home-purchase',
          targetAmount: 100000,
          currentAmount: 30000,
          targetDate: '2027-01-01',
          startDate: '2024-01-01',
          priority: 'high',
          mandatory: true,
          status: 'in-progress',
          monthlyContribution: 2000,
        },
      ];
      const result = calculateProgressMetrics(goals);
      expect(result.progressPoints.length).toBeGreaterThan(0);
      expect(result.progressPoints[0].goalId).toBe('1');
      expect(result.progressPoints[0].progress).toBe(0.3);
    });
  });

  describe('generateCashFlowNodes', () => {
    it('should generate nodes for Sankey diagram', () => {
      const incomes: Income[] = [
        {
          id: '1',
          type: 'work',
          name: 'Salary',
          amount: 120000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'salary',
          taxable: true,
        },
      ];
      const expenses: Expense[] = [
        {
          id: '1',
          type: 'recurring',
          name: 'Housing',
          amount: 36000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'housing',
          mandatory: true,
          variable: false,
        },
        {
          id: '2',
          type: 'recurring',
          name: 'Food',
          amount: 12000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'food',
          mandatory: true,
          variable: false,
        },
      ];
      const goals: Goal[] = [
        {
          id: '1',
          name: 'Savings',
          type: 'investment-growth',
          targetAmount: 50000,
          currentAmount: 10000,
          targetDate: '2026-01-01',
          startDate: '2024-01-01',
          priority: 'high',
          mandatory: false,
          status: 'in-progress',
          monthlyContribution: 1000,
        },
      ];
      const nodes = generateCashFlowNodes(incomes, expenses, goals, 2024);
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.some((n) => n.category === 'income')).toBe(true);
      expect(nodes.some((n) => n.category === 'expense')).toBe(true);
      expect(nodes.some((n) => n.category === 'savings')).toBe(true);
    });
  });

  describe('generateSankeyData', () => {
    it('should generate complete Sankey diagram data structure', () => {
      const incomes: Income[] = [
        {
          id: '1',
          type: 'work',
          name: 'Salary',
          amount: 120000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'salary',
          taxable: true,
        },
      ];
      const expenses: Expense[] = [
        {
          id: '1',
          type: 'recurring',
          name: 'Rent',
          amount: 24000,
          frequency: 'yearly',
          startDate: '2024-01-01',
          category: 'housing',
          mandatory: true,
          variable: false,
        },
      ];
      const goals: Goal[] = [
        {
          id: '1',
          name: 'Emergency Fund',
          type: 'emergency-fund',
          targetAmount: 50000,
          currentAmount: 10000,
          targetDate: '2025-01-01',
          startDate: '2024-01-01',
          priority: 'high',
          mandatory: true,
          status: 'in-progress',
        },
      ];
      const data = generateSankeyData(incomes, expenses, goals, 2024);
      expect(data.nodes).toBeDefined();
      expect(data.links).toBeDefined();
      expect(data.nodes.length).toBeGreaterThan(0);
      expect(data.links.length).toBeGreaterThan(0);
    });
  });
});
