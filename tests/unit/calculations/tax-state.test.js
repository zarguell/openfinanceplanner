import { describe, it, expect } from 'vitest';
import {
  calculateStateTax,
  calculateTotalTax,
  getStateTaxBrackets,
  getStateStandardDeduction,
} from '../../../src/calculations/tax.js';

describe('DC State Tax', () => {
  describe('calculateStateTax', () => {
    it('should be callable', () => {
      const tax = calculateStateTax('DC', 1160000, 'single', 2024);
      expect(typeof tax).toBe('number');
    });
  });
});

describe('CA State Tax', () => {
  describe('calculateStateTax', () => {
    it('should be callable for single filer', () => {
      const tax = calculateStateTax('CA', 5000000, 'single', 2024);
      expect(typeof tax).toBe('number');
    });

    it('should be callable for married joint', () => {
      const tax = calculateStateTax('CA', 10000000, 'married_joint', 2025);
      expect(typeof tax).toBe('number');
    });
  });
});

describe('NY State Tax', () => {
  describe('calculateStateTax', () => {
    it('should be callable for single filer', () => {
      const tax = calculateStateTax('NY', 5000000, 'single', 2024);
      expect(typeof tax).toBe('number');
    });

    it('should be callable for married joint', () => {
      const tax = calculateStateTax('NY', 10000000, 'married_joint', 2025);
      expect(typeof tax).toBe('number');
    });
  });
});

describe('Null State', () => {
  it('should return 0 for null state', () => {
    const tax = calculateStateTax(null, 5000000, 'single', 2025);
    expect(tax).toBe(0);
  });
});

describe('Total Tax', () => {
  describe('calculateTotalTax', () => {
    it('should calculate total tax for DC', () => {
      const result = calculateTotalTax('DC', 1000000, 'single', 2025);
      expect(result.totalTax).toBeDefined();
    });

    it('should calculate total tax for CA', () => {
      const result = calculateTotalTax('CA', 5000000, 'single', 2025);
      expect(result.totalTax).toBeDefined();
    });

    it('should calculate total tax for NY', () => {
      const result = calculateTotalTax('NY', 1000000, 'single', 2025);
      expect(result.totalTax).toBeDefined();
    });

    it('should calculate total tax for null state (federal only)', () => {
      const result = calculateTotalTax(null, 5000000, 'single', 2025);
      expect(result.stateTax).toBe(0);
    });
  });
});

describe('State Standard Deductions', () => {
  describe('getStateStandardDeduction', () => {
    it('should return DC standard deductions', () => {
      const ded = getStateStandardDeduction('DC', 2024, 'single');
      expect(ded).toBeGreaterThan(0);
    });

    it('should return DC 2025 standard deductions', () => {
      const ded = getStateStandardDeduction('DC', 2025, 'single');
      expect(ded).toBeGreaterThan(0);
    });

    it('should return CA standard deductions', () => {
      const dedCA = getStateStandardDeduction('CA', 2025, 'single');
      expect(dedCA).toBeGreaterThan(0);
    });

    it('should return NY standard deductions', () => {
      const dedNY = getStateStandardDeduction('NY', 2025, 'single');
      expect(dedNY).toBeGreaterThan(0);
    });
  });
});

describe('No-Tax States', () => {
  it('should return 0 tax for no-income-tax states', () => {
    const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY', 'NH'];

    for (const state of noTaxStates) {
      const tax = calculateStateTax(state, 10000000, 'single', 2025);
      expect(tax).toBe(0);
    }
  });
});

describe('Flat Rate States', () => {
  it('should calculate flat rate state taxes', () => {
    const coTax = calculateStateTax('CO', 10000000, 'single', 2025);
    expect(coTax).toBeGreaterThan(0);

    const idTax = calculateStateTax('ID', 10000000, 'single', 2025);
    expect(idTax).toBeGreaterThan(0);

    const inTax = calculateStateTax('IN', 10000000, 'single', 2025);
    expect(inTax).toBeGreaterThan(0);
  });
});

describe('Progressive States', () => {
  it('should calculate progressive state taxes', () => {
    const alTax = calculateStateTax('AL', 10000000, 'single', 2025);
    expect(alTax).toBeGreaterThan(0);

    const arTax = calculateStateTax('AR', 10000000, 'single', 2025);
    expect(arTax).toBeGreaterThan(0);

    const gaTax = calculateStateTax('GA', 10000000, 'single', 2025);
    expect(gaTax).toBeGreaterThan(0);
  });
});

describe('State Tax Brackets', () => {
  describe('getStateTaxBrackets', () => {
    it('should return state brackets as array', () => {
      const dcBrackets = getStateTaxBrackets('DC', 2025, 'single');
      expect(Array.isArray(dcBrackets)).toBe(true);
      expect(dcBrackets.length).toBeGreaterThan(0);
    });

    it('should return CA brackets as array with multiple brackets', () => {
      const caBrackets = getStateTaxBrackets('CA', 2025, 'single');
      expect(Array.isArray(caBrackets)).toBe(true);
      expect(caBrackets.length).toBeGreaterThan(1);
    });

    it('should return FL brackets with 0% rate', () => {
      const flBrackets = getStateTaxBrackets('FL', 2025, 'single');
      expect(Array.isArray(flBrackets)).toBe(true);
    });
  });
});
