import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateNumber,
  validatePositive,
  validateEmail,
  validateDate,
  validateMin,
  validateMax,
  validateLength,
  validatePattern,
  validateFutureDate,
  validatePastDate,
} from './validation';

describe('validation', () => {
  describe('validateRequired', () => {
    it('returns error for undefined', () => {
      expect(validateRequired(undefined)).toBe('This field is required');
    });

    it('returns error for null', () => {
      expect(validateRequired(null)).toBe('This field is required');
    });

    it('returns error for empty string', () => {
      expect(validateRequired('')).toBe('This field is required');
    });

    it('returns null for non-empty string', () => {
      expect(validateRequired('test')).toBeNull();
    });

    it('returns null for non-zero number', () => {
      expect(validateRequired(1)).toBeNull();
    });

    it('returns null for array with items', () => {
      expect(validateRequired([1, 2, 3])).toBeNull();
    });
  });

  describe('validateNumber', () => {
    it('returns error for non-number string', () => {
      expect(validateNumber('abc')).toBe('Must be a valid number');
    });

    it('returns error for non-string non-number', () => {
      expect(validateNumber({} as any)).toBe('Must be a valid number');
    });

    it('returns null for valid number string', () => {
      expect(validateNumber('123')).toBeNull();
    });

    it('returns null for number', () => {
      expect(validateNumber(123)).toBeNull();
    });

    it('returns null for decimal number string', () => {
      expect(validateNumber('123.45')).toBeNull();
    });

    it('returns null for negative number', () => {
      expect(validateNumber(-10)).toBeNull();
    });
  });

  describe('validatePositive', () => {
    it('returns error for zero', () => {
      expect(validatePositive(0)).toBe('Must be greater than 0');
    });

    it('returns error for negative number', () => {
      expect(validatePositive(-1)).toBe('Must be greater than 0');
    });

    it('returns null for positive number', () => {
      expect(validatePositive(1)).toBeNull();
    });

    it('returns null for decimal positive number', () => {
      expect(validatePositive(0.5)).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('returns error for invalid email', () => {
      expect(validateEmail('invalid')).toBe('Must be a valid email address');
    });

    it('returns error for email without domain', () => {
      expect(validateEmail('test@')).toBe('Must be a valid email address');
    });

    it('returns error for email without @', () => {
      expect(validateEmail('testexample.com')).toBe(
        'Must be a valid email address'
      );
    });

    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('returns null for valid email with subdomain', () => {
      expect(validateEmail('test@mail.example.com')).toBeNull();
    });
  });

  describe('validateDate', () => {
    it('returns error for invalid date', () => {
      expect(validateDate('invalid')).toBe('Must be a valid date');
    });

    it('returns null for valid ISO date string', () => {
      expect(validateDate('2024-01-01')).toBeNull();
    });

    it('returns null for valid date object', () => {
      expect(validateDate(new Date())).toBeNull();
    });
  });

  describe('validateMin', () => {
    it('returns error for number below min', () => {
      expect(validateMin(5, 10)).toBe('Must be at least 10');
    });

    it('returns null for number equal to min', () => {
      expect(validateMin(10, 10)).toBeNull();
    });

    it('returns null for number above min', () => {
      expect(validateMin(15, 10)).toBeNull();
    });

    it('supports custom error message', () => {
      expect(validateMin(5, 10, 'Custom error')).toBe('Custom error');
    });
  });

  describe('validateMax', () => {
    it('returns error for number above max', () => {
      expect(validateMax(15, 10)).toBe('Must be at most 10');
    });

    it('returns null for number equal to max', () => {
      expect(validateMax(10, 10)).toBeNull();
    });

    it('returns null for number below max', () => {
      expect(validateMax(5, 10)).toBeNull();
    });

    it('supports custom error message', () => {
      expect(validateMax(15, 10, 'Custom error')).toBe('Custom error');
    });
  });

  describe('validateLength', () => {
    it('returns error for string shorter than min', () => {
      expect(validateLength('ab', 3)).toBe('Must be at least 3 characters');
    });

    it('returns error for string longer than max', () => {
      expect(validateLength('abcdef', null, 5)).toBe(
        'Must be at most 5 characters'
      );
    });

    it('returns null for string within range', () => {
      expect(validateLength('abc', 3, 10)).toBeNull();
    });

    it('supports only min constraint', () => {
      expect(validateLength('abc', 3)).toBeNull();
    });

    it('supports only max constraint', () => {
      expect(validateLength('abc', null, 10)).toBeNull();
    });

    it('supports custom error messages', () => {
      expect(validateLength('a', 5, null, 'Too short', 'Too long')).toBe(
        'Too short'
      );
      expect(validateLength('abcdef', null, 3, 'Too short', 'Too long')).toBe(
        'Too long'
      );
    });
  });

  describe('validatePattern', () => {
    it('returns error when pattern does not match', () => {
      expect(validatePattern('abc', /^\d+$/)).toBe('Invalid format');
    });

    it('returns null when pattern matches', () => {
      expect(validatePattern('123', /^\d+$/)).toBeNull();
    });

    it('supports custom error message', () => {
      expect(validatePattern('abc', /^\d+$/, 'Must be numeric')).toBe(
        'Must be numeric'
      );
    });
  });

  describe('validateFutureDate', () => {
    it('returns error for past date', () => {
      const pastDate = new Date('2020-01-01');
      expect(validateFutureDate(pastDate)).toBe('Date must be in the future');
    });

    it('returns null for future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validateFutureDate(futureDate)).toBeNull();
    });

    it('returns null for today when inclusive is true', () => {
      expect(validateFutureDate(new Date(), true)).toBeNull();
    });

    it('supports custom error message', () => {
      const pastDate = new Date('2020-01-01');
      expect(validateFutureDate(pastDate, false, 'Must be later')).toBe(
        'Must be later'
      );
    });
  });

  describe('validatePastDate', () => {
    it('returns error for future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validatePastDate(futureDate)).toBe('Date must be in the past');
    });

    it('returns null for past date', () => {
      const pastDate = new Date('2020-01-01');
      expect(validatePastDate(pastDate)).toBeNull();
    });

    it('returns null for today when inclusive is true', () => {
      expect(validatePastDate(new Date(), true)).toBeNull();
    });

    it('supports custom error message', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validatePastDate(futureDate, false, 'Must be earlier')).toBe(
        'Must be earlier'
      );
    });
  });
});
