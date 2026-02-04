import { Plan } from '../../../src/core/models/Plan.js';
import { Account } from '../../../src/core/models/Account.js';

/**
 * PlanBuilder - Fluent builder for creating Plan test data
 * Provides sensible defaults and a readable API for test data creation
 */
export class PlanBuilder {
  constructor() {
    this.name = 'Test Plan';
    this.currentAge = 40;
    this.retirementAge = 67;
    this.accounts = [];
    this.expenses = [];
    this.incomes = [];
  }

  /**
   * Set the plan name
   * @param {string} name - Plan name
   * @returns {PlanBuilder} Returns this for chaining
   */
  withName(name) {
    this.name = name;
    return this;
  }

  /**
   * Set the current and retirement ages
   * @param {number} current - Current age
   * @param {number} retirement - Retirement age
   * @returns {PlanBuilder} Returns this for chaining
   */
  withAges(current, retirement) {
    this.currentAge = current;
    this.retirementAge = retirement;
    return this;
  }

  /**
   * Add an account to the plan
   * @param {string} name - Account name
   * @param {string} type - Account type (401k, IRA, Roth, HSA, Taxable)
   * @param {number} balance - Account balance in dollars
   * @param {number} contribution - Annual contribution in dollars (default: 0)
   * @returns {PlanBuilder} Returns this for chaining
   */
  withAccount(name, type, balance, contribution = 0) {
    this.accounts.push({ name, type, balance, contribution });
    return this;
  }

  /**
   * Add an expense to the plan
   * @param {string} name - Expense name
   * @param {number} amount - Annual expense amount in dollars
   * @param {boolean} inflationLinked - Whether expense is inflation-linked (default: false)
   * @returns {PlanBuilder} Returns this for chaining
   */
  withExpense(name, amount, inflationLinked = false) {
    this.expenses.push({ name, amount, inflationLinked });
    return this;
  }

  /**
   * Add income (Social Security) to the plan
   * @param {string} name - Income source name
   * @param {number} amount - Monthly benefit amount in dollars
   * @param {number} startAge - Age when benefits start (default: 67)
   * @returns {PlanBuilder} Returns this for chaining
   */
  withIncome(name, amount, startAge = 67) {
    this.incomes.push({ name, amount, startAge });
    return this;
  }

  /**
   * Build the Plan object from the builder configuration
   * @returns {Plan} A Plan domain model instance
   */
  build() {
    const plan = new Plan(this.name, this.currentAge, this.retirementAge);

    // Add accounts
    this.accounts.forEach(acc => {
      const account = new Account(acc.name, acc.type, acc.balance);
      account.annualContribution = acc.contribution;
      plan.addAccount(account);
    });

    // Add expenses if any
    this.expenses.forEach(exp => {
      plan.addExpense(exp.name, exp.amount, exp.inflationLinked);
    });

    // Add income if any
    this.incomes.forEach(inc => {
      plan.addSocialSecurity(inc.amount, inc.startAge);
    });

    return plan;
  }
}

/**
 * Convenience factory function for creating a PlanBuilder
 * @returns {PlanBuilder} A new PlanBuilder instance
 *
 * @example
 * const plan = aPlan()
 *   .withName('Retirement 2050')
 *   .withAges(35, 65)
 *   .withAccount('401k', '401k', 100000, 10000)
 *   .build();
 */
export const aPlan = () => new PlanBuilder();
