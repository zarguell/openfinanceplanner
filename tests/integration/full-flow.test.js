import { describe, it, expect, beforeEach } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { Income } from '../../src/core/models/Income.js';
import { project } from '../../src/calculations/projection.js';
import { StorageManager } from '../../src/storage/StorageManager.js';

global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

describe('Full Application Flow', () => {
  let testPlan;

  beforeEach(() => {
    testPlan = new Plan('Integration Test Plan', 35, 65);
  });

  describe('Plan Creation Workflow', () => {
    it('should create plan and initialize state', () => {
      expect(testPlan.name).toBe('Integration Test Plan');
      expect(testPlan.taxProfile.currentAge).toBe(35);
      expect(testPlan.taxProfile.retirementAge).toBe(65);
    });

    it('should add accounts and reflect in projections', () => {
      const account401k = new Account('My 401k', '401k', 100000);
      account401k.annualContribution = 20000;
      testPlan.addAccount(account401k);

      const rothIRA = new Account('Roth IRA', 'Roth', 50000);
      rothIRA.annualContribution = 6000;
      testPlan.addAccount(rothIRA);

      expect(testPlan.accounts).toHaveLength(2);
    });
  });

  describe('Income and Expenses', () => {
    it('should add income to plan', () => {
      const salary = new Income('Software Engineer Salary', 120000, 0, 'salary');
      testPlan.addIncome(salary);

      expect(testPlan.incomes).toHaveLength(1);
      expect(testPlan.incomes[0].name).toBe('Software Engineer Salary');
    });

    it('should add expenses to plan', () => {
      const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
      testPlan.addExpense(livingExpenses);

      expect(testPlan.expenses).toHaveLength(1);
      expect(testPlan.expenses[0].name).toBe('Living Expenses');
    });
  });

  describe('Storage Operations', () => {
    it('should save and load plan from storage', () => {
      const account = new Account('My 401k', '401k', 100000);
      testPlan.addAccount(account);

      StorageManager.savePlan(testPlan.toJSON());
      const loadedPlanData = StorageManager.loadPlan(testPlan.id);

      expect(loadedPlanData).toBeDefined();
      expect(loadedPlanData.name).toBe('Integration Test Plan');
    });
  });

  describe('Projection Calculations', () => {
    it('should run full projection workflow', () => {
      const account401k = new Account('My 401k', '401k', 100000);
      account401k.annualContribution = 20000;
      testPlan.addAccount(account401k);

      const salary = new Income('Software Engineer Salary', 120000, 0, 'salary');
      testPlan.addIncome(salary);

      const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
      testPlan.addExpense(livingExpenses);

      const projections = project(testPlan, 40);

      expect(projections).toBeDefined();
      expect(projections.length).toBe(41);
    });

    it('should show balance growth with contributions', () => {
      const account = new Account('My 401k', '401k', 100000);
      account.annualContribution = 20000;
      testPlan.addAccount(account);

      const salary = new Income('Software Engineer Salary', 80000, 0, 'salary');
      testPlan.addIncome(salary);

      const expenses = new Expense('Living Expenses', 50000, 0, true);
      testPlan.addExpense(expenses);

      const projections = project(testPlan, 5);
      const year0 = projections[0];
      const year1 = projections[1];

      expect(year0.totalIncome).toBeGreaterThan(year0.totalExpense);
      expect(year1.totalIncome).toBeGreaterThan(year0.totalIncome);
    });

    it('should handle retirement transition correctly', () => {
      const account = new Account('My 401k', '401k', 100000);
      testPlan.addAccount(account);

      const salary = new Income('Software Engineer Salary', 80000, 0, 'salary');
      testPlan.addIncome(salary);

      const expenses = new Expense('Living Expenses', 50000, 0, true);
      testPlan.addExpense(expenses);

      const projections = project(testPlan, 35);
      const retirementYear = projections.find((p) => p.age === 65);
      const workingYear = projections.find((p) => p.age === 50);

      expect(retirementYear).toBeDefined();
      expect(retirementYear.totalIncome).toBeDefined();
      expect(retirementYear.totalIncome).not.toBeNaN();
    });
  });

  describe('Complete End-to-End Flow', () => {
    it('should execute complete plan workflow successfully', () => {
      const account401k = new Account('My 401k', '401k', 100000);
      account401k.annualContribution = 20000;
      testPlan.addAccount(account401k);

      const rothIRA = new Account('Roth IRA', 'Roth', 50000);
      rothIRA.annualContribution = 6000;
      testPlan.addAccount(rothIRA);

      const salary = new Income('Software Engineer Salary', 120000, 0, 'salary');
      testPlan.addIncome(salary);

      const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
      testPlan.addExpense(livingExpenses);

      StorageManager.savePlan(testPlan.toJSON());
      const loadedPlanData = StorageManager.loadPlan(testPlan.id);

      const loadedPlan = Plan.fromJSON(loadedPlanData);
      loadedPlan.accounts = loadedPlanData.accounts.map((acc) => Account.fromJSON(acc));
      loadedPlan.expenses = loadedPlanData.expenses.map((exp) => Expense.fromJSON(exp));
      loadedPlan.incomes = loadedPlanData.incomes
        ? loadedPlanData.incomes.map((inc) => Income.fromJSON(inc))
        : [];

      const projections = project(loadedPlan, 40);

      expect(projections).toHaveLength(41);

      const startBalance = projections[0].totalBalance;
      const endBalance = projections[40].totalBalance;

      expect(endBalance).toBeGreaterThan(startBalance);
    });
  });
});
