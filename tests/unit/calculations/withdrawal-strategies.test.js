import { describe, it, expect } from 'vitest';
import {
  proportionalWithdrawalStrategy,
  taxEfficientWithdrawalStrategy,
  taxAwareWithdrawalStrategy,
  calculateWithdrawals,
} from '../../../src/calculations/withdrawal-strategies.js';

describe('Withdrawal Strategies', () => {
  describe('proportionalWithdrawalStrategy', () => {
    it('should withdraw proportionally from multiple accounts', () => {
      const accounts = [
        { type: '401k', balance: 1000000 },
        { type: 'Roth', balance: 500000 },
      ];
      const withdrawals = proportionalWithdrawalStrategy(accounts, 800000);

      expect(withdrawals[0]).toBe(533333);
      expect(withdrawals[1]).toBe(266667);
    });

    it('should handle three accounts with different balances', () => {
      const accounts = [
        { type: 'IRA', balance: 2000000 },
        { type: '401k', balance: 1500000 },
        { type: 'Taxable', balance: 500000 },
      ];
      const withdrawals = proportionalWithdrawalStrategy(accounts, 2000000);

      expect(withdrawals[0]).toBe(1000000);
      expect(withdrawals[1]).toBe(750000);
      expect(withdrawals[2]).toBe(250000);
    });

    it('should withdraw all when withdrawal exceeds total balance', () => {
      const accounts = [
        { type: '401k', balance: 1000000 },
        { type: 'Roth', balance: 500000 },
      ];
      const withdrawals = proportionalWithdrawalStrategy(accounts, 20000000);

      expect(withdrawals[0]).toBe(1000000);
      expect(withdrawals[1]).toBe(500000);
    });
  });

  describe('taxEfficientWithdrawalStrategy', () => {
    it('should withdraw from Taxable first', () => {
      const accounts = [
        { type: 'Roth', balance: 1000000 },
        { type: 'Taxable', balance: 500000 },
        { type: 'IRA', balance: 2000000 },
      ];
      const withdrawals = taxEfficientWithdrawalStrategy(accounts, 500000);

      expect(withdrawals[0]).toBe(0);
      expect(withdrawals[1]).toBe(500000);
      expect(withdrawals[2]).toBe(0);
    });

    it('should withdraw from multiple accounts when needed', () => {
      const accounts = [
        { type: 'Taxable', balance: 300000 },
        { type: 'IRA', balance: 2000000 },
        { type: 'Roth', balance: 1000000 },
      ];
      const withdrawals = taxEfficientWithdrawalStrategy(accounts, 1500000);

      expect(withdrawals[0]).toBe(300000);
      expect(withdrawals[1]).toBe(1200000);
      expect(withdrawals[2]).toBe(0);
    });

    it('should satisfy RMD requirements first', () => {
      const accounts = [
        { type: 'Taxable', balance: 1000000 },
        { type: 'IRA', balance: 500000 },
      ];
      const rmdRequirements = [0, 100000];
      const withdrawals = taxEfficientWithdrawalStrategy(accounts, 300000, rmdRequirements);

      expect(withdrawals[0]).toBe(200000);
      expect(withdrawals[1]).toBe(100000);
    });
  });

  describe('taxAwareWithdrawalStrategy', () => {
    it('should withdraw from Taxable first', () => {
      const accounts = [
        { type: 'Taxable', balance: 1000000 },
        { type: 'IRA', balance: 2000000 },
      ];
      const withdrawals = taxAwareWithdrawalStrategy(accounts, 500000);

      expect(withdrawals.length).toBe(2);
      expect(withdrawals[0]).toBe(500000);
      expect(withdrawals[1]).toBe(0);
    });
  });

  describe('calculateWithdrawals', () => {
    it('should use proportional strategy by default', () => {
      const accounts = [
        { type: 'Taxable', balance: 1000000 },
        { type: 'IRA', balance: 2000000 },
      ];

      const withdrawals = calculateWithdrawals('proportional', accounts, 500000);

      expect(withdrawals[0]).toBe(166667);
      expect(withdrawals[1]).toBe(333333);
    });

    it('should use tax-efficient strategy', () => {
      const accounts = [
        { type: 'Taxable', balance: 1000000 },
        { type: 'IRA', balance: 2000000 },
      ];

      const withdrawals = calculateWithdrawals('tax-efficient', accounts, 500000);

      expect(withdrawals[0]).toBe(500000);
      expect(withdrawals[1]).toBe(0);
    });

    it('should use tax-aware strategy', () => {
      const accounts = [
        { type: 'Taxable', balance: 1000000 },
        { type: 'IRA', balance: 2000000 },
      ];

      const withdrawals = calculateWithdrawals('tax-aware', accounts, 500000, []);

      expect(withdrawals[0]).toBe(500000);
      expect(withdrawals[1]).toBe(0);
    });
  });
});
