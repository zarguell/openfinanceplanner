import { describe, it, expect } from 'vitest';
import { Account } from '../../../src/core/models/Account.js';

describe('Account', () => {
  describe('creation', () => {
    it('should create account with correct name', () => {
      const account = new Account('Test 401k', '401k', 100000);
      expect(account.name).toBe('Test 401k');
    });

    it('should create account with correct type', () => {
      const account = new Account('Test IRA', 'IRA', 50000);
      expect(account.type).toBe('IRA');
    });

    it('should store balance in cents', () => {
      const account = new Account('Test 401k', '401k', 100000);
      expect(account.balance).toBe(10000000);
    });
  });

  describe('JSON serialization', () => {
    it('should correctly serialize and deserialize account', () => {
      const account = new Account('Test IRA', 'IRA', 50000);
      account.annualContribution = 6000;

      const json = account.toJSON();
      const restored = Account.fromJSON(json);

      expect(restored.name).toBe(account.name);
      expect(restored.balance).toBe(account.balance);
    });
  });
});
