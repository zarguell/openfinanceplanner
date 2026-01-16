import { describe, it, expect } from 'vitest';
import {
  calculateFederalTax,
  calculateLongTermCapitalGainsTax,
  calculateShortTermCapitalGainsTax,
  calculateCapitalGainsTax,
  calculateNetInvestmentIncomeTax,
  calculateSocialSecurityTax,
  calculateMedicareTax,
  calculateFicaTax,
  getStandardDeduction,
} from '../../../src/calculations/tax.js';

describe('Federal Tax Calculations', () => {
  describe('calculateFederalTax', () => {
    it('should calculate federal tax for single filer at $50,000 income', () => {
      const tax = calculateFederalTax(5000000, 'single', 2025);

      expect(tax).toBe(387150);
      expect(tax / 5000000).toBeCloseTo(0.07743, 4);
    });

    it('should calculate federal tax for single filer at $100,000 income', () => {
      const tax = calculateFederalTax(10000000, 'single', 2024);

      expect(tax).toBe(1384100);
      expect(tax / 10000000).toBeCloseTo(0.13841, 4);
    });

    it('should calculate federal tax for married joint at $50,000 income', () => {
      const tax = calculateFederalTax(5000000, 'married_joint', 2025);

      expect(tax).toBe(185000);
      expect(tax / 5000000).toBe(0.037);
    });

    it('should return 0 tax for $0 income', () => {
      const tax = calculateFederalTax(0, 'single', 2025);

      expect(tax).toBe(0);
    });
  });
});

describe('Net Investment Income Tax', () => {
  describe('calculateNetInvestmentIncomeTax', () => {
    it('should return 0 for MAGI below threshold', () => {
      const niit = calculateNetInvestmentIncomeTax(5000000, 15000000, 'single', 2025);

      expect(niit).toBe(0);
    });

    it('should calculate NIIT when MAGI exceeds threshold', () => {
      const niit = calculateNetInvestmentIncomeTax(10000000, 25000000, 'single', 2025);

      expect(niit).toBe(190000);
    });

    it('should limit NIIT by investment income', () => {
      const niit = calculateNetInvestmentIncomeTax(10000000, 30000000, 'single', 2025);

      expect(niit).toBe(380000);
      expect(niit / 10000000).toBe(0.038);
    });

    it('should use married joint threshold', () => {
      const niit = calculateNetInvestmentIncomeTax(5000000, 26000000, 'married_joint', 2025);

      expect(niit).toBe(38000);
      expect(niit / 5000000).toBeCloseTo(0.0076, 3);
    });
  });
});

describe('Capital Gains Tax', () => {
  describe('calculateLongTermCapitalGainsTax', () => {
    it('should return 0 for gains in 0% bracket', () => {
      const tax = calculateLongTermCapitalGainsTax(3000000, 'single', 2025);

      expect(tax).toBe(0);
      expect(tax / 3000000).toBe(0);
    });

    it('should calculate LTCG tax for married joint', () => {
      const tax = calculateLongTermCapitalGainsTax(10000000, 'married_joint', 2025);

      expect(tax).toBe(23850);
      expect(tax / 10000000).toBeCloseTo(0.002385, 4);
    });
  });

  describe('calculateShortTermCapitalGainsTax', () => {
    it('should tax short-term gains as ordinary income', () => {
      const tax = calculateShortTermCapitalGainsTax(5000000, 'single', 2025);

      expect(tax).toBe(387150);
      expect(tax / 5000000).toBeCloseTo(0.07743, 4);
    });
  });

  describe('calculateCapitalGainsTax', () => {
    it('should calculate total tax with NIIT below threshold', () => {
      const cgTax = calculateCapitalGainsTax(4905000, 0, 15000000, 'single', 2025);

      expect(cgTax.totalTax).toBe(0);
      expect(cgTax.ordinaryTax).toBe(0);
      expect(cgTax.niit).toBe(0);
    });

    it('should calculate total tax with NIIT above threshold', () => {
      const cgTax = calculateCapitalGainsTax(4905000, 0, 25000000, 'single', 2025);

      expect(cgTax.totalTax).toBe(186390);
      expect(cgTax.ordinaryTax).toBe(0);
      expect(cgTax.niit).toBe(186390);
    });
  });
});

describe('Social Security and Medicare Tax', () => {
  describe('calculateSocialSecurityTax', () => {
    it('should calculate SS tax at 6.2% rate', () => {
      const wages = 17610000;
      const ssTax = calculateSocialSecurityTax(wages, 2025);

      expect(ssTax).toBe(1091820);
      expect(ssTax / wages).toBe(0.062);
    });
  });

  describe('calculateMedicareTax', () => {
    it('should calculate Medicare tax at 1.45% rate', () => {
      const medicareTax = calculateMedicareTax(10000000, 'single', 2025);

      expect(medicareTax).toBe(145000);
      expect(medicareTax / 10000000).toBe(0.0145);
    });

    it('should include additional Medicare tax for high income', () => {
      const medicareTax = calculateMedicareTax(25000000, 'single', 2025);

      expect(medicareTax).toBe(407500);
      expect(medicareTax / 25000000).toBeCloseTo(0.0163, 3);
    });
  });

  describe('calculateFicaTax', () => {
    it('should calculate combined FICA tax', () => {
      const fica = calculateFicaTax(10000000, 'single', 2025);

      expect(fica.totalFicaTax).toBe(765000);
      expect(fica.ssTax / 10000000).toBe(0.062);
      expect(fica.medicareTax / 10000000).toBe(0.0145);
    });
  });
});

describe('Standard Deduction', () => {
  describe('getStandardDeduction', () => {
    it('should return 2025 single deduction', () => {
      const deduction = getStandardDeduction(2025, 'single');

      expect(deduction).toBe(1575000);
    });

    it('should return 2025 married joint deduction', () => {
      const deduction = getStandardDeduction(2025, 'married_joint');

      expect(deduction).toBe(3150000);
    });

    it('should return 2025 head of household deduction', () => {
      const deduction = getStandardDeduction(2025, 'head_of_household');

      expect(deduction).toBe(2362500);
    });
  });
});
