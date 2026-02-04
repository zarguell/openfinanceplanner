import { Account } from '../../../src/core/models/Account.js';

/**
 * AccountBuilder - Fluent builder for creating Account test data
 * Provides sensible defaults and a readable API for test data creation
 */
export class AccountBuilder {
  constructor() {
    this.name = 'Test Account';
    this.type = '401k';
    this.balance = 100000;  // In cents (1000.00)
    this.annualContribution = 0;
  }

  /**
   * Set the account name
   * @param {string} name - Account name
   * @returns {AccountBuilder} Returns this for chaining
   */
  withName(name) {
    this.name = name;
    return this;
  }

  /**
   * Set the account type
   * @param {string} type - Account type (valid: '401k', 'IRA', 'Roth', 'HSA', 'Taxable')
   * @returns {AccountBuilder} Returns this for chaining
   */
  withType(type) {
    this.type = type;
    return this;
  }

  /**
   * Set the account balance in cents
   * @param {number} balance - Balance in cents (e.g., 100000 = $1000.00)
   * @returns {AccountBuilder} Returns this for chaining
   */
  withBalance(balance) {
    this.balance = balance;
    return this;
  }

  /**
   * Set the account balance in dollars (convenience method)
   * @param {number} dollars - Balance in dollars (e.g., 1000 = $1000.00)
   * @returns {AccountBuilder} Returns this for chaining
   */
  withDollarBalance(dollars) {
    this.balance = dollars * 100;
    return this;
  }

  /**
   * Set the annual contribution
   * @param {number} amount - Annual contribution amount in dollars
   * @returns {AccountBuilder} Returns this for chaining
   */
  withContribution(amount) {
    this.annualContribution = amount;
    return this;
  }

  /**
   * Build the Account object from the builder configuration
   * @returns {Account} An Account domain model instance
   */
  build() {
    // Account constructor expects balance in dollars, but stores in cents
    // So we need to convert from cents to dollars for the constructor
    const account = new Account(this.name, this.type, this.balance / 100);
    account.annualContribution = this.annualContribution;
    return account;
  }
}

/**
 * Convenience factory function for creating an AccountBuilder
 * @returns {AccountBuilder} A new AccountBuilder instance
 *
 * @example
 * const account = anAccount()
 *   .withName('My 401k')
 *   .withType('401k')
 *   .withDollarBalance(100000)
 *   .withContribution(23500)
 *   .build();
 */
export const anAccount = () => new AccountBuilder();
