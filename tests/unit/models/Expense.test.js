import { describe, it, expect } from 'vitest';
import { Expense } from '../../../src/core/models/Expense.js';

describe('Expense', () => {
  describe('creation', () => {
    it('should create expense with correct name', () => {
      const expense = new Expense('Living Expenses', 60000, 0, true);
      expect(expense.name).toBe('Living Expenses');
    });

    it('should store baseAmount in cents', () => {
      const expense = new Expense('Living Expenses', 60000, 0, true);
      expect(expense.baseAmount).toBe(6000000);
    });

    it('should set inflationAdjusted correctly', () => {
      const expense = new Expense('Healthcare', 12000, 5, false);
      expect(expense.inflationAdjusted).toBe(false);
    });
  });

  describe('JSON round trip', () => {
    it('should correctly serialize and deserialize expense', () => {
      const expense = new Expense('Healthcare', 12000, 5, false);
      expense.endYear = 20;

      const json = expense.toJSON();
      const restored = Expense.fromJSON(json);

      expect(restored.name).toBe(expense.name);
      expect(restored.inflationAdjusted).toBe(false);
    });
  });
});
