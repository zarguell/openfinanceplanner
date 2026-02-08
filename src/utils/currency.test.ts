import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
} from './currency';

describe('currency utilities', () => {
  describe('formatCurrency', () => {
    it('formats 150000 as "$150,000"', () => {
      expect(formatCurrency(150000)).toBe('$150,000');
    });

    it('formats 0 as "$0"', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('formats negative values', () => {
      expect(formatCurrency(-50000)).toBe('-$50,000');
    });

    it('accepts custom options', () => {
      expect(formatCurrency(150000.55, { maximumFractionDigits: 2 })).toBe(
        '$150,000.55'
      );
    });
  });

  describe('formatCurrencyCompact', () => {
    it('formats 150000 as "$150K"', () => {
      expect(formatCurrencyCompact(150000)).toBe('$150K');
    });

    it('formats 1500000 as "$1.5M"', () => {
      expect(formatCurrencyCompact(1500000)).toBe('$1.5M');
    });

    it('formats 1000 as "$1K"', () => {
      expect(formatCurrencyCompact(1000)).toBe('$1K');
    });
  });

  describe('formatNumber', () => {
    it('formats 150000 as "150,000"', () => {
      expect(formatNumber(150000)).toBe('150,000');
    });

    it('formats decimals', () => {
      expect(formatNumber(150000.5)).toBe('150,000.5');
    });
  });
});
