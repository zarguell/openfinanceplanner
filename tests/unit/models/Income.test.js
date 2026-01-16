import { describe, it, expect } from 'vitest';
import { Income } from '../../../src/core/models/Income.js';

describe('Income', () => {
  describe('creation', () => {
    it('should create income with correct name', () => {
      const income = new Income('Software Engineer Salary', 120000, 0, 'salary');
      expect(income.name).toBe('Software Engineer Salary');
    });

    it('should store baseAmount in cents', () => {
      const income = new Income('Software Engineer Salary', 120000, 0, 'salary');
      expect(income.baseAmount).toBe(12000000);
    });

    it('should set correct type', () => {
      const income = new Income('Salary', 100000, 0, 'salary');
      expect(income.type).toBe('salary');
    });

    it('should have default growth rate of 0.03', () => {
      const income = new Income('Salary', 100000, 0, 'salary');
      expect(income.growthRate).toBe(0.03);
    });
  });

  describe('tax treatment', () => {
    it('should return earned for salary income', () => {
      const salaryIncome = new Income('Salary', 100000, 0, 'salary');
      expect(salaryIncome.getTaxTreatment()).toBe('earned');
    });

    it('should return qualified for dividends', () => {
      const dividendIncome = new Income('Dividends', 5000, 0, 'dividends');
      expect(dividendIncome.getTaxTreatment()).toBe('qualified');
    });

    it('should return earned for rental income', () => {
      const rentalIncome = new Income('Rental', 20000, 0, 'rental');
      expect(rentalIncome.getTaxTreatment()).toBe('earned');
    });
  });

  describe('JSON round trip', () => {
    it('should correctly serialize and deserialize income', () => {
      const income = new Income('Business Income', 80000, 2, 'business');
      income.endYear = 25;
      income.growthRate = 0.05;

      const json = income.toJSON();
      const restored = Income.fromJSON(json);

      expect(restored.name).toBe(income.name);
      expect(restored.type).toBe('business');
      expect(restored.growthRate).toBe(0.05);
      expect(restored.endYear).toBe(25);
    });
  });
});
