import { describe, it, expect } from 'vitest';
import { Plan } from '../../../src/core/models/Plan.js';

describe('Plan', () => {
  describe('creation', () => {
    it('should create plan with correct name', () => {
      const plan = new Plan('Test Plan', 35, 65);
      expect(plan.name).toBe('Test Plan');
    });

    it('should generate unique ID on creation', () => {
      const plan = new Plan('Test Plan', 35, 65);
      expect(plan.id).toBeDefined();
      expect(typeof plan.id).toBe('string');
    });

    it('should initialize with empty accounts array', () => {
      const plan = new Plan('Test Plan', 35, 65);
      expect(plan.accounts).toEqual([]);
      expect(plan.accounts.length).toBe(0);
    });
  });

  describe('addAccount', () => {
    it('should add account to plan', () => {
      const plan = new Plan('Test Plan', 35, 65);
      const account = {
        id: 'acc_test',
        name: 'Test Account',
        type: '401k',
        balance: 100000,
        annualContribution: 10000,
      };
      plan.addAccount(account);
      expect(plan.accounts).toHaveLength(1);
    });
  });
});
