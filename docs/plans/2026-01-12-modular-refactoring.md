# Open Finance Planner: Modular Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the single-file "Retirement Planner Pro.html" into a modular, maintainable architecture while establishing the foundation for complex financial planning rules and future scaling.

**Architecture:** Extract monolithic HTML file into layered architecture: (1) Core domain models (Plan, Account, Expense) with no UI dependencies, (2) Calculation engines (Projection, Tax) as pure functions, (3) Storage layer with versioning and migration support, (4) UI components as thin controllers over domain layer. Use ES6 modules for code organization while maintaining zero-dependency, client-side-only constraint.

**Tech Stack:** Vanilla JavaScript (ES2020+), ES6 Modules, CSS Custom Properties, localStorage with IndexedDB migration path

---

## Prerequisites

### Task 0: Rename Project and File

**Files:**
- Rename: `Retirement Planner Pro.html` → `index.html`
- Modify: `docs/architecture.md`
- Modify: `docs/tasks.md`
- Modify: `CLAUDE.md`

**Step 1: Rename the HTML file**

Run:
```bash
mv "Retirement Planner Pro.html" index.html
```

Expected: File renamed successfully

**Step 2: Update title and references in index.html**

Find and replace in `index.html`:
- Replace: `<title>Retirement Planner Pro</title>` → `<title>Open Finance Planner</title>`
- Replace: `.sidebar-header` text from "Retirement Planner Pro" → "Open Finance Planner"

**Step 3: Update architecture.md references**

Run:
```bash
sed -i 's/Retirement Planner Pro/Open Finance Planner/g' docs/architecture.md
sed -i 's/retirement planning web application/financial planning web application/g' docs/architecture.md
```

**Step 4: Update CLAUDE.md references**

Run:
```bash
sed -i 's/Retirement Planner Pro/Open Finance Planner/g' CLAUDE.md
sed -i 's/retirement planning/financial planning/g' CLAUDE.md
```

**Step 5: Commit**

```bash
git add index.html docs/architecture.md CLAUDE.md
git commit -m "refactor: rename project to Open Finance Planner"
```

---

## Phase 1: Directory Structure Setup

### Task 1: Create Modular Directory Structure

**Files:**
- Create: `src/core/`
- Create: `src/calculations/`
- Create: `src/storage/`
- Create: `src/ui/`
- Create: `src/styles/`
- Create: `tests/`
- Create: `tests/unit/`
- Create: `tests/integration/`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p src/core src/calculations src/storage src/ui src/styles tests/unit tests/integration
```

Expected: Directories created successfully

**Step 2: Create package.json for ES6 modules**

Create: `package.json`
```json
{
  "name": "open-finance-planner",
  "version": "0.1.0",
  "description": "Client-side financial planning application",
  "type": "module",
  "scripts": {
    "serve": "python3 -m http.server 3030",
    "test": "echo \"Testing framework TBD\" && exit 0"
  },
  "keywords": ["financial", "planning", "retirement", "calculator"],
  "author": "",
  "license": "MIT"
}
```

**Step 3: Create .gitignore**

Create: `.gitignore`
```
.DS_Store
*.log
node_modules/.cache
.vscode/*
!.vscode/extensions.json
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: establish modular directory structure"
```

---

## Phase 2: Extract Core Domain Models

### Task 2: Extract Plan Model

**Files:**
- Create: `src/core/models/Plan.js`
- Create: `tests/unit/models/Plan.test.js`
- Modify: `index.html` (remove Plan class, add import)

**Step 1: Write the failing test for Plan model**

Create: `tests/unit/models/Plan.test.js`
```javascript
import { Plan } from '../../../src/core/models/Plan.js';

export function testPlanCreation() {
  const plan = new Plan('Test Plan', 35, 65);

  if (plan.name !== 'Test Plan') {
    throw new Error('Expected plan name to be "Test Plan"');
  }

  if (plan.id === undefined || plan.id === null) {
    throw new Error('Expected plan to have an ID');
  }

  if (plan.accounts.length !== 0) {
    throw new Error('Expected new plan to have no accounts');
  }

  console.log('✓ testPlanCreation passed');
}

export function testPlanAddAccount() {
  const plan = new Plan('Test Plan', 35, 65);
  const account = {
    id: 'acc_test',
    name: 'Test Account',
    type: '401k',
    balance: 100000,
    annualContribution: 10000
  };

  plan.addAccount(account);

  if (plan.accounts.length !== 1) {
    throw new Error('Expected plan to have 1 account');
  }

  console.log('✓ testPlanAddAccount passed');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testPlanCreation();
    testPlanAddAccount();
    console.log('All Plan tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
node tests/unit/models/Plan.test.js
```

Expected: ERROR: Cannot find module `'../../../src/core/models/Plan.js'`

**Step 3: Create Plan model module**

Create: `src/core/models/Plan.js`
```javascript
/**
 * Plan - Core domain model for financial plans
 * Pure business logic with no UI dependencies
 */
export class Plan {
  constructor(name, currentAge, retirementAge) {
    this.id = this.generateId();
    this.name = name;
    this.created = new Date().toISOString();
    this.lastModified = this.created;
    this.taxProfile = {
      currentAge,
      retirementAge,
      filingStatus: 'single',
      federalTaxRate: 0.22
    };
    this.assumptions = {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
    };
    this.accounts = [];
    this.expenses = [];
  }

  generateId() {
    return 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addAccount(account) {
    this.accounts.push(account);
    this.touch();
  }

  removeAccount(accountId) {
    this.accounts = this.accounts.filter(acc => acc.id !== accountId);
    this.touch();
  }

  addExpense(expense) {
    this.expenses.push(expense);
    this.touch();
  }

  removeExpense(expenseId) {
    this.expenses = this.expenses.filter(exp => exp.id !== expenseId);
    this.touch();
  }

  touch() {
    this.lastModified = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      created: this.created,
      lastModified: this.lastModified,
      taxProfile: { ...this.taxProfile },
      assumptions: { ...this.assumptions },
      accounts: this.accounts.map(acc => acc.toJSON ? acc.toJSON() : acc),
      expenses: this.expenses.map(exp => exp.toJSON ? exp.toJSON() : exp)
    };
  }

  static fromJSON(data) {
    const plan = new Plan(data.name, data.taxProfile.currentAge, data.taxProfile.retirementAge);
    plan.id = data.id;
    plan.created = data.created;
    plan.lastModified = data.lastModified;
    plan.taxProfile = data.taxProfile;
    plan.assumptions = data.assumptions;
    plan.accounts = data.accounts || [];
    plan.expenses = data.expenses || [];
    return plan;
  }
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
node tests/unit/models/Plan.test.js
```

Expected: "All Plan tests passed!"

**Step 5: Commit**

```bash
git add src/core/models/Plan.js tests/unit/models/Plan.test.js
git commit -m "feat: extract Plan model into module with tests"
```

---

### Task 3: Extract Account Model

**Files:**
- Create: `src/core/models/Account.js`
- Create: `tests/unit/models/Account.test.js`

**Step 1: Write the failing test**

Create: `tests/unit/models/Account.test.js`
```javascript
import { Account } from '../../../src/core/models/Account.js';

export function testAccountCreation() {
  const account = new Account('Test 401k', '401k', 100000);

  if (account.name !== 'Test 401k') {
    throw new Error('Expected account name to be "Test 401k"');
  }

  if (account.type !== '401k') {
    throw new Error('Expected account type to be "401k"');
  }

  if (account.balance !== 100000) {
    throw new Error('Expected balance to be 100000 cents');
  }

  console.log('✓ testAccountCreation passed');
}

export function testAccountJSONSerialization() {
  const account = new Account('Test IRA', 'IRA', 50000);
  account.annualContribution = 6000;

  const json = account.toJSON();
  const restored = Account.fromJSON(json);

  if (restored.name !== account.name) {
    throw new Error('Expected restored name to match original');
  }

  if (restored.balance !== account.balance) {
    throw new Error('Expected restored balance to match original');
  }

  console.log('✓ testAccountJSONSerialization passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testAccountCreation();
    testAccountJSONSerialization();
    console.log('All Account tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
node tests/unit/models/Account.test.js
```

Expected: ERROR: Cannot find module

**Step 3: Create Account model module**

Create: `src/core/models/Account.js`
```javascript
/**
 * Account - Domain model for financial accounts
 * Stores monetary values in cents (integers) to avoid floating-point issues
 */
export class Account {
  constructor(name, type, balanceInDollars) {
    this.id = this.generateId();
    this.name = name;
    this.type = type; // '401k', 'IRA', 'Roth', 'HSA', 'Taxable'
    this.balance = balanceInDollars * 100; // Store in cents
    this.annualContribution = 0;
    this.withdrawalRate = 0.04;
  }

  generateId() {
    return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      balance: this.balance,
      annualContribution: this.annualContribution,
      withdrawalRate: this.withdrawalRate
    };
  }

  static fromJSON(data) {
    const account = new Account(data.name, data.type, data.balance / 100);
    account.id = data.id;
    account.annualContribution = data.annualContribution || 0;
    account.withdrawalRate = data.withdrawalRate || 0.04;
    return account;
  }
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
node tests/unit/models/Account.test.js
```

Expected: "All Account tests passed!"

**Step 5: Commit**

```bash
git add src/core/models/Account.js tests/unit/models/Account.test.js
git commit -m "feat: extract Account model into module with tests"
```

---

### Task 4: Extract Expense Model

**Files:**
- Create: `src/core/models/Expense.js`
- Create: `tests/unit/models/Expense.test.js`

**Step 1: Write the failing test**

Create: `tests/unit/models/Expense.test.js`
```javascript
import { Expense } from '../../../src/core/models/Expense.js';

export function testExpenseCreation() {
  const expense = new Expense('Living Expenses', 60000, 0, true);

  if (expense.name !== 'Living Expenses') {
    throw new Error('Expected expense name to be "Living Expenses"');
  }

  if (expense.baseAmount !== 6000000) { // Stored in cents
    throw new Error('Expected baseAmount to be in cents');
  }

  if (expense.inflationAdjusted !== true) {
    throw new Error('Expected inflationAdjusted to be true');
  }

  console.log('✓ testExpenseCreation passed');
}

export function testExpenseJSONRoundTrip() {
  const expense = new Expense('Healthcare', 12000, 5, false);
  expense.endYear = 20;

  const json = expense.toJSON();
  const restored = Expense.fromJSON(json);

  if (restored.name !== expense.name) {
    throw new Error('Expected restored name to match');
  }

  if (restored.inflationAdjusted !== false) {
    throw new Error('Expected inflationAdjusted to be false');
  }

  console.log('✓ testExpenseJSONRoundTrip passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testExpenseCreation();
    testExpenseJSONRoundTrip();
    console.log('All Expense tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
node tests/unit/models/Expense.test.js
```

Expected: ERROR: Cannot find module

**Step 3: Create Expense model module**

Create: `src/core/models/Expense.js`
```javascript
/**
 * Expense - Domain model for expense projections
 * Handles inflation-adjusted expense streams
 */
export class Expense {
  constructor(name, annualAmountInDollars, startYear, inflationAdjusted = true) {
    this.id = this.generateId();
    this.name = name;
    this.baseAmount = annualAmountInDollars * 100; // Store in cents
    this.startYear = startYear; // Years from now
    this.endYear = null;
    this.inflationAdjusted = inflationAdjusted;
  }

  generateId() {
    return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      baseAmount: this.baseAmount,
      startYear: this.startYear,
      endYear: this.endYear,
      inflationAdjusted: this.inflationAdjusted
    };
  }

  static fromJSON(data) {
    const expense = new Expense(
      data.name,
      data.baseAmount / 100,
      data.startYear,
      data.inflationAdjusted
    );
    expense.id = data.id;
    expense.endYear = data.endYear || null;
    return expense;
  }
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
node tests/unit/models/Expense.test.js
```

Expected: "All Expense tests passed!"

**Step 5: Commit**

```bash
git add src/core/models/Expense.js tests/unit/models/Expense.test.js
git commit -m "feat: extract Expense model into module with tests"
```

---

## Phase 3: Extract Calculation Engine

### Task 5: Extract ProjectionEngine as Pure Functions

**Files:**
- Create: `src/calculations/projection.js`
- Create: `tests/unit/calculations/projection.test.js`

**Step 1: Write the failing test**

Create: `tests/unit/calculations/projection.test.js`
```javascript
import { project } from '../../../src/calculations/projection.js';

export function testSimpleProjection() {
  const plan = {
    accounts: [
      { type: '401k', balance: 100000, annualContribution: 10000 }
    ],
    expenses: [
      { name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: true }
    ],
    taxProfile: {
      currentAge: 35,
      retirementAge: 65
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
    }
  };

  const results = project(plan, 1); // Project 1 year

  if (results.length !== 2) { // Year 0 and Year 1
    throw new Error(`Expected 2 years, got ${results.length}`);
  }

  if (results[1].totalBalance <= results[0].totalBalance) {
    throw new Error('Expected balance to grow with contributions and returns');
  }

  console.log('✓ testSimpleProjection passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testSimpleProjection();
    console.log('All Projection tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
node tests/unit/calculations/projection.test.js
```

Expected: ERROR: Cannot find module

**Step 3: Create projection calculation module**

Create: `src/calculations/projection.js`
```javascript
/**
 * Projection calculations - Pure functions for financial projections
 * No side effects, no state mutations, testable in isolation
 */

/**
 * Get growth rate for account type based on assumptions
 * @param {string} accountType - Account type (401k, IRA, Roth, etc.)
 * @param {object} assumptions - Growth rate assumptions
 * @returns {number} Annual growth rate as decimal
 */
export function getAccountGrowthRate(accountType, assumptions) {
  const rates = {
    '401k': assumptions.equityGrowthRate,
    'IRA': assumptions.equityGrowthRate,
    'Roth': assumptions.equityGrowthRate,
    'Taxable': assumptions.equityGrowthRate * 0.8, // Lower due to annual taxes
    'HSA': assumptions.equityGrowthRate
  };
  return rates[accountType] || assumptions.equityGrowthRate;
}

/**
 * Calculate inflation-adjusted expense for a given year
 * @param {object} expense - Expense object
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Expense amount in dollars for that year
 */
export function calculateExpenseForYear(expense, yearOffset, inflationRate) {
  if (yearOffset < expense.startYear) {
    return 0;
  }

  if (expense.endYear && yearOffset > expense.endYear) {
    return 0;
  }

  const baseAmount = expense.baseAmount / 100; // Convert cents to dollars
  const inflationMultiplier = expense.inflationAdjusted
    ? Math.pow(1 + inflationRate, yearOffset)
    : 1;

  return baseAmount * inflationMultiplier;
}

/**
 * Calculate total expenses for all expense items in a given year
 * @param {Array} expenses - Array of expense objects
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Total expenses in dollars
 */
export function calculateTotalExpenses(expenses, yearOffset, inflationRate) {
  return expenses.reduce((total, expense) => {
    return total + calculateExpenseForYear(expense, yearOffset, inflationRate);
  }, 0);
}

/**
 * Project a financial plan year by year
 * @param {object} plan - Plan object with accounts, expenses, taxProfile, assumptions
 * @param {number} yearsToProject - Number of years to project
 * @returns {Array} Array of yearly projection results
 */
export function project(plan, yearsToProject = 40) {
  const results = [];
  const accountSnapshots = plan.accounts.map(acc => ({
    ...acc,
    balance: acc.balance
  }));

  const startYear = new Date().getFullYear();
  const startAge = plan.taxProfile.currentAge;

  for (let year = 0; year <= yearsToProject; year++) {
    const currentYear = startYear + year;
    const age = startAge + year;
    const isRetired = age >= plan.taxProfile.retirementAge;

    // Calculate total expenses for this year
    const totalExpense = calculateTotalExpenses(
      plan.expenses,
      year,
      plan.assumptions.inflationRate
    );

    // Apply growth and contributions/distributions
    let totalBalance = 0;
    for (let i = 0; i < accountSnapshots.length; i++) {
      let balance = accountSnapshots[i].balance / 100;

      if (!isRetired) {
        // Accumulation phase: add contributions
        balance += plan.accounts[i].annualContribution || 0;
      } else {
        // Distribution phase: withdraw proportionally from accounts
        balance -= totalExpense / plan.accounts.length;
      }

      // Apply investment growth
      const growthRate = getAccountGrowthRate(
        plan.accounts[i].type,
        plan.assumptions
      );
      balance *= (1 + growthRate);

      accountSnapshots[i].balance = balance * 100;
      totalBalance += balance;
    }

    results.push({
      year: currentYear,
      age: age,
      isRetired: isRetired,
      totalBalance: totalBalance,
      totalExpense: totalExpense,
      accountBalances: accountSnapshots.map(acc => acc.balance / 100)
    });
  }

  return results;
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
node tests/unit/calculations/projection.test.js
```

Expected: "All Projection tests passed!"

**Step 5: Commit**

```bash
git add src/calculations/projection.js tests/unit/calculations/projection.test.js
git commit -m "feat: extract projection calculations as pure functions with tests"
```

---

## Phase 4: Extract Storage Layer

### Task 6: Create Versioned Storage Manager

**Files:**
- Create: `src/storage/StorageManager.js`
- Create: `src/storage/schema.js`
- Create: `tests/unit/storage/StorageManager.test.js`

**Step 1: Define schema versioning**

Create: `src/storage/schema.js`
```javascript
/**
 * Storage schema definitions and version management
 * Handles migration between schema versions
 */

export const CURRENT_SCHEMA_VERSION = '1.0';

export const STORAGE_KEYS = {
  PLANS_LIST: 'ofp_plans_list',
  PLAN_PREFIX: 'ofp_plan_',
  APP_CONFIG: 'ofp_app_config',
  SCHEMA_VERSION: 'ofp_schema_version'
};

/**
 * Validate plan structure against schema requirements
 * @param {object} planData - Plan data to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePlanSchema(planData) {
  const errors = [];

  if (!planData.id || typeof planData.id !== 'string') {
    errors.push('Plan must have a valid id');
  }

  if (!planData.name || typeof planData.name !== 'string') {
    errors.push('Plan must have a valid name');
  }

  if (!planData.taxProfile || typeof planData.taxProfile !== 'object') {
    errors.push('Plan must have a taxProfile object');
  }

  if (!planData.assumptions || typeof planData.assumptions !== 'object') {
    errors.push('Plan must have an assumptions object');
  }

  if (!Array.isArray(planData.accounts)) {
    errors.push('Plan must have an accounts array');
  }

  if (!Array.isArray(planData.expenses)) {
    errors.push('Plan must have an expenses array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Migrate plan data to current schema version
 * @param {object} planData - Plan data to migrate
 * @param {string} fromVersion - Source schema version
 * @returns {object} Migrated plan data
 */
export function migratePlan(planData, fromVersion) {
  // For now, no migrations needed (v1.0 is initial version)
  // Future: Add migration logic here when schema evolves

  return planData;
}
```

**Step 2: Write the failing test for StorageManager**

Create: `tests/unit/storage/StorageManager.test.js`
```javascript
import { StorageManager } from '../../../src/storage/StorageManager.js';

// Mock localStorage for Node.js testing
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

export function testSaveAndLoadPlan() {
  const plan = {
    id: 'test_plan_1',
    name: 'Test Plan',
    created: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z',
    taxProfile: {
      currentAge: 35,
      retirementAge: 65,
      filingStatus: 'single',
      federalTaxRate: 0.22
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
    },
    accounts: [],
    expenses: []
  };

  StorageManager.savePlan(plan);

  const loaded = StorageManager.loadPlan('test_plan_1');

  if (!loaded) {
    throw new Error('Expected plan to be loaded');
  }

  if (loaded.name !== 'Test Plan') {
    throw new Error('Expected loaded plan name to match');
  }

  console.log('✓ testSaveAndLoadPlan passed');
}

export function testListPlans() {
  global.localStorage.clear();

  const plan1 = { id: 'plan_1', name: 'Plan 1', created: new Date().toISOString(), lastModified: new Date().toISOString(), taxProfile: {}, assumptions: {}, accounts: [], expenses: [] };
  const plan2 = { id: 'plan_2', name: 'Plan 2', created: new Date().toISOString(), lastModified: new Date().toISOString(), taxProfile: {}, assumptions: {}, accounts: [], expenses: [] };

  StorageManager.savePlan(plan1);
  StorageManager.savePlan(plan2);

  const list = StorageManager.listPlans();

  if (list.length !== 2) {
    throw new Error(`Expected 2 plans, got ${list.length}`);
  }

  console.log('✓ testListPlans passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testSaveAndLoadPlan();
    testListPlans();
    console.log('All StorageManager tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
```

**Step 3: Run test to verify it fails**

Run:
```bash
node tests/unit/storage/StorageManager.test.js
```

Expected: ERROR: Cannot find module

**Step 4: Create StorageManager module**

Create: `src/storage/StorageManager.js`
```javascript
/**
 * StorageManager - Encapsulates all localStorage operations
 * Provides versioning, migration, and validation for stored data
 */
import { STORAGE_KEYS, validatePlanSchema, migratePlan, CURRENT_SCHEMA_VERSION } from './schema.js';

export class StorageManager {
  /**
   * Save a plan to localStorage
   * @param {object} plan - Plan object to save
   * @throws {Error} If validation fails
   */
  static savePlan(plan) {
    const validation = validatePlanSchema(plan);
    if (!validation.valid) {
      throw new Error(`Invalid plan schema: ${validation.errors.join(', ')}`);
    }

    const key = STORAGE_KEYS.PLAN_PREFIX + plan.id;
    localStorage.setItem(key, JSON.stringify(plan));
    this.updatePlansList();
  }

  /**
   * Load a plan from localStorage
   * @param {string} planId - Plan ID to load
   * @returns {object|null} Plan object or null if not found
   */
  static loadPlan(planId) {
    const key = STORAGE_KEYS.PLAN_PREFIX + planId;
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    try {
      const plan = JSON.parse(data);
      return plan;
    } catch (error) {
      console.error('Failed to parse plan data:', error);
      return null;
    }
  }

  /**
   * List all plans in localStorage
   * @returns {Array} Array of plan metadata objects
   */
  static listPlans() {
    const listData = localStorage.getItem(STORAGE_KEYS.PLANS_LIST);
    if (!listData) {
      return [];
    }

    try {
      const list = JSON.parse(listData);
      return list.map(meta => ({
        ...meta,
        lastModified: new Date(meta.lastModified)
      })).sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error('Failed to parse plans list:', error);
      return [];
    }
  }

  /**
   * Update the cached plans list metadata
   * @private
   */
  static updatePlansList() {
    const list = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.PLAN_PREFIX)) {
        try {
          const plan = JSON.parse(localStorage.getItem(key));
          list.push({
            id: plan.id,
            name: plan.name,
            created: plan.created,
            lastModified: plan.lastModified
          });
        } catch (error) {
          console.error(`Failed to parse plan at key ${key}:`, error);
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.PLANS_LIST, JSON.stringify(list));
  }

  /**
   * Delete a plan from localStorage
   * @param {string} planId - Plan ID to delete
   */
  static deletePlan(planId) {
    const key = STORAGE_KEYS.PLAN_PREFIX + planId;
    localStorage.removeItem(key);
    this.updatePlansList();
  }

  /**
   * Export a plan as JSON string
   * @param {object} plan - Plan object to export
   * @returns {string} JSON string representation
   */
  static exportPlan(plan) {
    const exportData = {
      ...plan,
      _exportMeta: {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        application: 'Open Finance Planner'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import a plan from JSON string
   * @param {string} jsonString - JSON string to import
   * @returns {object} Imported plan object
   * @throws {Error} If JSON is invalid or schema validation fails
   */
  static importPlan(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Remove export metadata if present
      if (data._exportMeta) {
        delete data._exportMeta;
      }

      // Validate schema
      const validation = validatePlanSchema(data);
      if (!validation.valid) {
        throw new Error(`Invalid plan schema: ${validation.errors.join(', ')}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to import plan: ${error.message}`);
    }
  }

  /**
   * Get current schema version
   * @returns {string} Schema version
   */
  static getSchemaVersion() {
    return localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || CURRENT_SCHEMA_VERSION;
  }

  /**
   * Clear all application data from localStorage
   * Use with caution - this is destructive
   */
  static clearAll() {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ofp_') || key.startsWith('plan_'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}
```

**Step 5: Run test to verify it passes**

Run:
```bash
node tests/unit/storage/StorageManager.test.js
```

Expected: "All StorageManager tests passed!"

**Step 6: Commit**

```bash
git add src/storage/ tests/unit/storage/
git commit -m "feat: create versioned storage layer with schema validation"
```

---

## Phase 5: Extract UI Components

### Task 7: Create UI Controller Base

**Files:**
- Create: `src/ui/AppController.js`
- Modify: `index.html` (replace inline AppController with import)

**Step 1: Create UI Controller module**

Create: `src/ui/AppController.js`
```javascript
/**
 * AppController - Main UI controller for the application
 * Thin controller layer that delegates to domain layer
 */
import { Plan } from '../core/models/Plan.js';
import { Account } from '../core/models/Account.js';
import { Expense } from '../core/models/Expense.js';
import { project } from '../calculations/projection.js';
import { StorageManager } from '../storage/StorageManager.js';

export class AppController {
  constructor() {
    this.currentPlan = null;
    this.projectionResults = null;
    this.init();
  }

  init() {
    this.loadPlansList();
  }

  // Plan Management

  loadPlansList() {
    const list = StorageManager.listPlans();
    const planListEl = document.getElementById('planList');
    planListEl.innerHTML = '';

    if (list.length === 0) {
      planListEl.innerHTML = '<li style="color: var(--color-text-secondary); font-size: 12px;">No plans yet</li>';
      return;
    }

    list.forEach(meta => {
      const li = document.createElement('li');
      li.className = `plan-item ${this.currentPlan?.id === meta.id ? 'active' : ''}`;
      li.onclick = () => this.loadPlan(meta.id);
      li.innerHTML = `
        <div class="plan-item-name">${this.escapeHtml(meta.name)}</div>
        <div class="plan-item-date">${new Date(meta.lastModified).toLocaleDateString()}</div>
      `;
      planListEl.appendChild(li);
    });
  }

  loadPlan(planId) {
    const planData = StorageManager.loadPlan(planId);
    if (planData) {
      // Reconstruct domain objects from plain JSON
      this.currentPlan = Plan.fromJSON(planData);
      this.currentPlan.accounts = planData.accounts.map(acc =>
        acc instanceof Account ? acc : Account.fromJSON(acc)
      );
      this.currentPlan.expenses = planData.expenses.map(exp =>
        exp instanceof Expense ? exp : Expense.fromJSON(exp)
      );

      this.renderPlanUI();
      this.loadPlansList();
    }
  }

  // Projection

  runProjection() {
    if (!this.currentPlan) {
      alert('Please create or load a plan first');
      return;
    }

    this.projectionResults = project(this.currentPlan, 40);
    this.renderProjectionResults();
    alert('Projection complete!');
  }

  renderProjectionResults() {
    if (!this.projectionResults || this.projectionResults.length === 0) {
      return;
    }

    const container = document.getElementById('projectionResults');
    const finalYear = this.projectionResults[this.projectionResults.length - 1];

    container.innerHTML = `
      <h3>Projection Results</h3>
      <div class="result-card">
        <div class="result-label">Final Balance</div>
        <div class="result-value">$${finalYear.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
      </div>
      <div class="result-card">
        <div class="result-label">Final Age</div>
        <div class="result-value">${finalYear.age}</div>
      </div>
    `;
  }

  // Account Management

  addAccount(name, type, balance, contribution) {
    const account = new Account(name, type, balance);
    account.annualContribution = contribution;
    this.currentPlan.addAccount(account);
    StorageManager.savePlan(this.currentPlan.toJSON());
    this.renderAccountsList();
  }

  deleteAccount(accountId) {
    if (!confirm('Delete this account?')) return;
    this.currentPlan.removeAccount(accountId);
    StorageManager.savePlan(this.currentPlan.toJSON());
    this.renderAccountsList();
  }

  // Expense Management

  addExpense(name, amount, startYear, inflationAdjusted) {
    const expense = new Expense(name, amount, startYear, inflationAdjusted);
    this.currentPlan.addExpense(expense);
    StorageManager.savePlan(this.currentPlan.toJSON());
    this.renderExpensesList();
  }

  deleteExpense(expenseId) {
    if (!confirm('Delete this expense?')) return;
    this.currentPlan.removeExpense(expenseId);
    StorageManager.savePlan(this.currentPlan.toJSON());
    this.renderExpensesList();
  }

  // UI Helpers

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
```

**Step 2: Update index.html to use modules**

Modify: `index.html` (at the end of the file, replace script tag)

Find the `<script>` tag at the end (around line 1746) and replace with:
```html
<script type="module">
  import { AppController } from './src/ui/AppController.js';

  // Initialize app
  const app = new AppController();
  window.app = app; // Expose for onclick handlers

  // Setup modal handlers
  window.app = app;
</script>
```

**Step 3: Commit**

```bash
git add src/ui/AppController.js index.html
git commit -m "feat: extract AppController into module"
```

---

### Task 8: Extract CSS into Separate Files

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/base.css`
- Create: `src/styles/components.css`
- Create: `src/styles/layout.css`
- Modify: `index.html` (remove inline styles, add imports)

**Step 1: Extract CSS variables**

Create: `src/styles/variables.css`
```css
:root {
  /* Colors */
  --color-white: rgba(255, 255, 255, 1);
  --color-black: rgba(0, 0, 0, 1);
  --color-cream-50: rgba(252, 252, 249, 1);
  --color-cream-100: rgba(255, 255, 253, 1);
  --color-gray-200: rgba(245, 245, 245, 1);
  --color-gray-300: rgba(167, 169, 169, 1);
  --color-gray-400: rgba(119, 124, 124, 1);
  --color-slate-500: rgba(98, 108, 113, 1);
  --color-brown-600: rgba(94, 82, 64, 1);
  --color-charcoal-700: rgba(31, 33, 33, 1);
  --color-charcoal-800: rgba(38, 40, 40, 1);
  --color-slate-900: rgba(19, 52, 59, 1);
  --color-teal-300: rgba(50, 184, 198, 1);
  --color-teal-400: rgba(45, 166, 178, 1);
  --color-teal-500: rgba(33, 128, 141, 1);
  --color-teal-600: rgba(29, 116, 128, 1);
  --color-teal-700: rgba(26, 104, 115, 1);
  --color-red-400: rgba(255, 84, 89, 1);
  --color-red-500: rgba(192, 21, 47, 1);
  --color-orange-400: rgba(230, 129, 97, 1);
  --color-orange-500: rgba(168, 75, 47, 1);
  --color-green-500: rgba(34, 197, 94, 1);

  --color-brown-600-rgb: 94, 82, 64;
  --color-teal-500-rgb: 33, 128, 141;
  --color-slate-900-rgb: 19, 52, 59;

  --color-bg-1: rgba(59, 130, 246, 0.08);
  --color-bg-2: rgba(245, 158, 11, 0.08);
  --color-bg-3: rgba(34, 197, 94, 0.08);
  --color-bg-4: rgba(239, 68, 68, 0.08);

  /* Semantic Colors */
  --color-background: var(--color-cream-50);
  --color-surface: var(--color-cream-100);
  --color-text: var(--color-slate-900);
  --color-text-secondary: var(--color-slate-500);
  --color-primary: var(--color-teal-500);
  --color-primary-hover: var(--color-teal-600);
  --color-primary-active: var(--color-teal-700);
  --color-secondary: rgba(var(--color-brown-600-rgb), 0.12);
  --color-secondary-hover: rgba(var(--color-brown-600-rgb), 0.2);
  --color-border: rgba(var(--color-brown-600-rgb), 0.2);
  --color-error: var(--color-red-500);
  --color-success: var(--color-green-500);
  --color-warning: var(--color-orange-500);

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'Monaco', 'Courier New', monospace;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --line-height-normal: 1.5;

  /* Spacing & Layout */
  --radius-base: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02);

  /* Transitions */
  --duration-normal: 250ms;
  --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-charcoal-700);
    --color-surface: var(--color-charcoal-800);
    --color-text: var(--color-gray-200);
    --color-text-secondary: rgba(167, 169, 169, 0.7);
    --color-primary: var(--color-teal-300);
    --color-primary-hover: var(--color-teal-400);
    --color-secondary: rgba(119, 124, 124, 0.15);
    --color-secondary-hover: rgba(119, 124, 124, 0.25);
    --color-border: rgba(119, 124, 124, 0.3);
    --color-error: var(--color-red-400);
  }
}
```

**Step 2: Extract base styles**

Create: `src/styles/base.css`
```css
/* Base reset and typography */
* {
  box-sizing: border-box;
}

html {
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  line-height: var(--line-height-normal);
  color: var(--color-text);
  background-color: var(--color-background);
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  padding: 0;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
  color: var(--color-text);
}

h1 { font-size: var(--font-size-3xl); }
h2 { font-size: var(--font-size-2xl); margin-bottom: 1rem; }
h3 { font-size: var(--font-size-xl); margin-bottom: 0.75rem; }
h4 { font-size: var(--font-size-lg); margin-bottom: 0.5rem; }

p { margin: 0 0 1rem 0; }

/* Links */
a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  color: var(--color-primary-hover);
}

/* Buttons */
button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-standard);
}

/* Form Elements */
input, select, textarea {
  font-family: inherit;
  font-size: inherit;
}
```

**Step 3: Extract component styles**

Create: `src/styles/components.css`
```css
/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-standard);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  background-color: var(--color-secondary-hover);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-white);
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-sm);
}

/* Cards */
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge-success {
  background-color: var(--color-bg-3);
  color: var(--color-success);
}

/* Forms */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.form-label-hint {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  background-color: var(--color-surface);
  color: var(--color-text);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay.active {
  display: flex;
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--duration-normal) var(--ease-standard);
}

.tab:hover {
  color: var(--color-text);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

/* Results */
.result-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
}

.result-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.result-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

/* Plan List */
.plan-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-item {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard);
  margin-bottom: 0.25rem;
}

.plan-item:hover {
  background-color: var(--color-secondary);
}

.plan-item.active {
  background-color: var(--color-bg-1);
  color: var(--color-primary);
}

.plan-item-name {
  font-weight: var(--font-weight-medium);
}

.plan-item-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

/* Utilities */
.text-muted {
  color: var(--color-text-secondary);
}
```

**Step 4: Extract layout styles**

Create: `src/styles/layout.css`
```css
/* Main App Layout */
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.5rem 1rem;
}

.sidebar-header {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: 2rem;
  color: var(--color-primary);
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.header-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}
```

**Step 5: Update index.html to import CSS**

Modify: `index.html` (replace `<style>` block in `<head>`)

Find and replace the entire `<style>` block (lines 8-899) with:
```html
<link rel="stylesheet" href="./src/styles/variables.css">
<link rel="stylesheet" href="./src/styles/base.css">
<link rel="stylesheet" href="./src/styles/layout.css">
<link rel="stylesheet" href="./src/styles/components.css">
```

**Step 6: Commit**

```bash
git add src/styles/ index.html
git commit -m "refactor: extract CSS into modular files"
```

---

## Phase 6: Documentation Updates

### Task 9: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Replace CLAUDE.md with updated version**

Replace entire contents of `CLAUDE.md` with:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open Finance Planner is a client-side financial planning application that runs entirely in the browser with zero dependencies. The application uses a modular ES6 module architecture with clear separation between domain logic, calculations, storage, and UI.

## Tech Stack

- **Pure Vanilla JavaScript (ES2020+) ES6 Modules** - No build process, no framework dependencies
- **localStorage with versioning** - All data persistence (5-10MB limit per domain)
- **CSS Custom Properties** - Theming with dark mode support via `@media (prefers-color-scheme: dark)`
- **Pure functions for calculations** - Testable, side-effect-free projection logic

## Running the Application

Open `index.html` in a modern browser (Chrome 90+, Firefox 88+, Safari 14+).

For development with auto-reload:
```bash
npm run serve  # Runs python3 HTTP server on port 3030
```

Running tests:
```bash
# Run specific test file
node tests/unit/models/Plan.test.js

# Run all tests (placeholder - test framework TBD)
npm test
```

## Architecture

### Directory Structure

```
openfinanceplanner/
├── index.html                    # Main HTML entry point
├── src/
│   ├── core/                     # Domain models (pure business logic)
│   │   └── models/
│   │       ├── Plan.js          # Plan aggregate root
│   │       ├── Account.js       # Account entity
│   │       └── Expense.js       # Expense entity
│   ├── calculations/             # Pure calculation functions
│   │   └── projection.js        # Projection calculations
│   ├── storage/                  # Data persistence layer
│   │   ├── StorageManager.js    # localStorage operations
│   │   └── schema.js            # Schema validation & migrations
│   ├── ui/                       # UI controllers
│   │   └── AppController.js     # Main UI controller
│   └── styles/                   # CSS (imported in HTML)
│       ├── variables.css        # CSS custom properties
│       ├── base.css             # Reset & typography
│       ├── layout.css           # Layout styles
│       └── components.css       # Component styles
├── tests/
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
└── docs/                        # Documentation
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│         UI Controllers              │  ← Thin, delegates to domain
│    (src/ui/AppController.js)        │
├─────────────────────────────────────┤
│          Domain Layer               │  ← Core business logic
│   (src/core/models/Plan.js, etc.)   │
├─────────────────────────────────────┤
│      Calculation Layer              │  ← Pure functions
│  (src/calculations/projection.js)   │
├─────────────────────────────────────┤
│         Storage Layer               │  ← Persistence
│  (src/storage/StorageManager.js)    │
└─────────────────────────────────────┘
```

### Core Domain Models

All domain models are in `src/core/models/`:

#### `Plan` (src/core/models/Plan.js)
- Aggregate root for financial plans
- Contains: accounts, expenses, assumptions, tax profile
- Methods: `addAccount()`, `removeAccount()`, `addExpense()`, `removeExpense()`, `toJSON()`, `fromJSON()`
- Stores monetary values in cents (integers)

#### `Account` (src/core/models/Account.js)
- Represents individual accounts (401k, IRA, Roth, HSA, Taxable)
- Properties: `id`, `name`, `type`, `balance` (cents), `annualContribution`, `withdrawalRate`
- Immutable ID generation

#### `Expense` (src/core/models/Expense.js)
- Models expense streams with inflation adjustment
- Properties: `id`, `name`, `baseAmount` (cents), `startYear`, `endYear`, `inflationAdjusted`
- Supports inflation-adjusted growth

### Calculation Layer

`src/calculations/projection.js` contains pure functions:

- `getAccountGrowthRate(accountType, assumptions)` - Returns growth rate for account type
- `calculateExpenseForYear(expense, yearOffset, inflationRate)` - Calculates inflation-adjusted expense
- `calculateTotalExpenses(expenses, yearOffset, inflationRate)` - Sums all expenses for year
- `project(plan, yearsToProject)` - Main year-by-year projection loop

**Important**: All calculation functions are pure (no side effects, no state mutations). This makes them easy to test and reason about.

### Storage Layer

`src/storage/StorageManager.js` encapsulates all localStorage operations:

- Static methods: `savePlan()`, `loadPlan()`, `listPlans()`, `deletePlan()`, `exportPlan()`, `importPlan()`
- Schema validation via `src/storage/schema.js`
- Versioning support with migration path
- Storage key prefix: `ofp_` (Open Finance Planner)

### UI Controllers

`src/ui/AppController.js` is a thin controller layer:

- Delegates business logic to domain models
- Manages DOM manipulation and event handlers
- Exposes `window.app` global for HTML onclick handlers
- Methods follow pattern: `loadPlansList()`, `loadPlan()`, `runProjection()`, `addAccount()`, etc.

## Data Storage Schema

Plans stored in localStorage as `ofp_plan_{uuid}`:

```javascript
{
  id: "uuid",
  name: "string",
  created: "ISO timestamp",
  lastModified: "ISO timestamp",
  taxProfile: {
    currentAge: number,
    retirementAge: number,
    filingStatus: "single|married_joint|married_separate|head",
    federalTaxRate: number (decimal)
  },
  assumptions: {
    inflationRate: number (decimal),
    equityGrowthRate: number (decimal),
    bondGrowthRate: number (decimal)
  },
  accounts: [
    {
      id: "uuid",
      name: "string",
      type: "401k|IRA|Roth|HSA|Taxable",
      balance: number (cents),
      annualContribution: number,
      withdrawalRate: number
    }
  ],
  expenses: [
    {
      id: "uuid",
      name: "string",
      baseAmount: number (cents),
      startYear: number,
      endYear: number | null,
      inflationAdjusted: boolean
    }
  ]
}
```

## Design Principles

### 1. Domain Independence
Core domain models (`src/core/models/`) have zero dependencies on UI or storage. They can be tested in isolation.

### 2. Pure Calculations
All calculation logic in `src/calculations/` are pure functions. No side effects, easy to test, predictable.

### 3. Storage Encapsulation
All storage operations go through `StorageManager`. Never access localStorage directly from UI or domain layer.

### 4. Thin UI Layer
UI controllers are thin. Business logic belongs in domain models or calculation functions.

### 5. Integer Arithmetic
Monetary values stored as cents (integers). Display by dividing by 100. Avoids floating-point precision issues.

## Common Tasks

### Adding a New Domain Model

1. Create model class in `src/core/models/YourModel.js`
2. Implement `toJSON()` and static `fromJSON()` methods
3. Write unit tests in `tests/unit/models/YourModel.test.js`
4. Update schema validation in `src/storage/schema.js` if needed

Example:
```javascript
// src/core/models/YourModel.js
export class YourModel {
  constructor(name, value) {
    this.id = this.generateId();
    this.name = name;
    this.value = value;
  }

  generateId() {
    return 'prefix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return { id: this.id, name: this.name, value: this.value };
  }

  static fromJSON(data) {
    const model = new YourModel(data.name, data.value);
    model.id = data.id;
    return model;
  }
}
```

### Adding a New Calculation

1. Add pure function to `src/calculations/yourFile.js`
2. Write unit tests in `tests/unit/calculations/yourFile.test.js`
3. Import and use from UI controller or other calculation functions

Example:
```javascript
// src/calculations/tax.js
export function calculateFederalTax(income, filingStatus) {
  // Pure calculation logic
  return taxAmount;
}
```

### Modifying the UI

1. UI logic goes in `src/ui/AppController.js` or create new controller in `src/ui/`
2. Styles go in `src/styles/components.css` (or layout.css for layout)
3. HTML templates remain in `index.html` or are generated via JavaScript
4. Keep UI controllers thin - delegate to domain layer

### Schema Migrations

When changing the plan structure:

1. Increment `CURRENT_SCHEMA_VERSION` in `src/storage/schema.js`
2. Add migration logic to `migratePlan()` function
3. Update `validatePlanSchema()` if adding new required fields
4. Test migration in `tests/unit/storage/schema.test.js`

## Testing

### Unit Tests

Unit tests are in `tests/unit/`. Each test file can be run directly:

```bash
node tests/unit/models/Plan.test.js
node tests/unit/calculations/projection.test.js
```

Test pattern:
```javascript
export function testSpecificBehavior() {
  // Arrange
  const input = /* test data */;

  // Act
  const result = functionUnderTest(input);

  // Assert
  if (result !== expected) {
    throw new Error('Expected X but got Y');
  }

  console.log('✓ testSpecificBehavior passed');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSpecificBehavior();
}
```

### Integration Tests

Integration tests go in `tests/integration/`. These test the full flow from UI to storage.

## Future Enhancements

See `/docs/architecture.md` for comprehensive architecture documentation including:
- Planned RuleRegistry system for tax strategies
- IndexedDB migration path for larger datasets
- Monte Carlo simulation architecture
- Tax calculation engine design

See `/docs/tasks.md` for prioritized roadmap.

## Important Constraints

1. **Zero runtime dependencies** - Avoid adding external libraries unless absolutely necessary
2. **Client-side only** - No backend, all data in browser storage
3. **ES6 modules** - Use native ES6 import/export (no bundler required)
4. **Modern browsers only** - Target Chrome 90+, Firefox 88+, Safari 14+
5. **localStorage limits** - Design for 5-10MB storage limit per domain
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for modular architecture"
```

---

### Task 10: Update architecture.md

**Files:**
- Modify: `docs/architecture.md`

**Step 1: Update architecture.md header and overview**

Modify: `docs/architecture.md` (update first section)

Replace the opening section with:

```markdown
# Open Finance Planner - Architecture Documentation

## Project Overview

Open Finance Planner is a client-side financial planning application that provides comprehensive financial projection capabilities. The application runs entirely in the browser, persists data using localStorage, and supports JSON import/export for data portability.

**Current Status:** Modular Architecture (Post-Refactoring)

The codebase has been refactored from a single-file implementation into a layered, modular architecture with clear separation of concerns. This establishes the foundation for complex financial planning rules and future scaling.
```

**Step 2: Update tech stack section**

Find and update the tech stack section to mention ES6 modules:

```markdown
## Tech Stack Selection

**Vanilla JavaScript (ES2020+) with ES6 Modules**
- Zero build process or framework dependencies
- Native ES6 import/export for code organization
- Modular architecture with clear layer separation
- Eliminates framework churn and reduces maintenance burden
```

**Step 3: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: update architecture.md for modular refactoring"
```

---

### Task 11: Update tasks.md

**Files:**
- Modify: `docs/tasks.md`

**Step 1: Add refactoring completion notice at top**

Add to top of `docs/tasks.md`:

```markdown
# Open Finance Planner - Development Tasks

## ✅ Completed: Modular Refactoring (January 2026)

The single-file implementation has been successfully refactored into a modular architecture:

- ✅ Extracted domain models (Plan, Account, Expense) into `src/core/models/`
- ✅ Separated calculation logic into pure functions in `src/calculations/`
- ✅ Created versioned storage layer with schema validation
- ✅ Extracted UI controller into `src/ui/AppController.js`
- ✅ Separated CSS into modular files (variables, base, layout, components)
- ✅ Established testing infrastructure with unit tests for core models
- ✅ Updated all documentation

**Next Phase:** Focus on enhancing calculation accuracy (tax engine, RMDs, Roth conversions) before adding UI features.

---

## Remaining Tasks

[Rest of existing tasks.md content...]
```

**Step 2: Commit**

```bash
git add docs/tasks.md
git commit -m "docs: record modular refactoring completion in tasks.md"
```

---

## Phase 7: Final Cleanup

### Task 12: Remove All Inline JavaScript from index.html

**Files:**
- Modify: `index.html`

**Step 1: Remove all inline class definitions**

From `index.html`, remove the following class definitions from the `<script>` tag:
- Remove `class Plan` (now imported from `src/core/models/Plan.js`)
- Remove `class Account` (now imported from `src/core/models/Account.js`)
- Remove `class Expense` (now imported from `src/core/models/Expense.js`)
- Remove `class ProjectionEngine` (now imported from `src/calculations/projection.js`)
- Remove `class StorageManager` (now imported from `src/storage/StorageManager.js`)
- Remove `class AppController` (now imported from `src/ui/AppController.js`)

**Step 2: Update script tag at end of body**

Replace the entire `<script>` block at the end with:

```html
<script type="module">
  import { AppController } from './src/ui/AppController.js';

  // Initialize app
  window.app = new AppController();
</script>
```

**Step 3: Verify application still works**

Open `index.html` in browser and verify:
- Plans can be created
- Accounts can be added
- Expenses can be added
- Projections run correctly
- Import/export works

**Step 4: Commit**

```bash
git add index.html
git commit -m "refactor: remove all inline JavaScript from index.html"
```

---

### Task 13: Create Integration Test

**Files:**
- Create: `tests/integration/full-flow.test.js`

**Step 1: Create end-to-end integration test**

Create: `tests/integration/full-flow.test.js`
```javascript
/**
 * Integration test for full application flow
 * Tests the complete workflow from plan creation to projection
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';
import { StorageManager } from '../../src/storage/StorageManager.js';

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

export function testFullPlanWorkflow() {
  console.log('Testing full plan workflow...');

  // Step 1: Create a plan
  const plan = new Plan('Integration Test Plan', 35, 65);
  console.log('✓ Plan created');

  // Step 2: Add accounts
  const account401k = new Account('My 401k', '401k', 100000);
  account401k.annualContribution = 20000;
  plan.addAccount(account401k);

  const rothIRA = new Account('Roth IRA', 'Roth', 50000);
  rothIRA.annualContribution = 6000;
  plan.addAccount(rothIRA);
  console.log('✓ Accounts added');

  // Step 3: Add expenses
  const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(livingExpenses);
  console.log('✓ Expenses added');

  // Step 4: Save plan
  StorageManager.savePlan(plan.toJSON());
  console.log('✓ Plan saved');

  // Step 5: Load plan
  const loadedPlanData = StorageManager.loadPlan(plan.id);
  if (!loadedPlanData) {
    throw new Error('Failed to load plan');
  }

  const loadedPlan = Plan.fromJSON(loadedPlanData);
  loadedPlan.accounts = loadedPlanData.accounts.map(acc => Account.fromJSON(acc));
  loadedPlan.expenses = loadedPlanData.expenses.map(exp => Expense.fromJSON(exp));
  console.log('✓ Plan loaded');

  // Step 6: Run projection
  const projections = project(loadedPlan, 40);
  if (projections.length !== 41) { // 0-40 years
    throw new Error(`Expected 41 projection years, got ${projections.length}`);
  }
  console.log('✓ Projection calculated');

  // Step 7: Verify results
  const startBalance = projections[0].totalBalance;
  const endBalance = projections[40].totalBalance;

  if (endBalance <= startBalance) {
    throw new Error('Expected end balance to exceed start balance with contributions');
  }

  console.log(`✓ Start balance: $${startBalance.toFixed(0)}, End balance: $${endBalance.toFixed(0)}`);
  console.log('✓ Full workflow test passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testFullPlanWorkflow();
  } catch (error) {
    console.error('Integration test failed:', error.message);
    process.exit(1);
  }
}
```

**Step 2: Run integration test**

```bash
node tests/integration/full-flow.test.js
```

Expected: All steps pass with checkmarks

**Step 3: Commit**

```bash
git add tests/integration/full-flow.test.js
git commit -m "test: add integration test for full workflow"
```

---

### Task 14: Create README

**Files:**
- Create: `README.md`

**Step 1: Create project README**

Create: `README.md`
```markdown
# Open Finance Planner

A client-side financial planning application that runs entirely in your browser with zero dependencies. Open source, privacy-focused, and designed for comprehensive retirement and financial projections.

## Features

- 📊 **Multi-Account Projections** - Model 401(k), IRA, Roth IRA, HSA, and taxable brokerage accounts
- 💰 **Expense Modeling** - Project expenses with inflation adjustment
- 📈 **Growth Scenarios** - Customize growth rates for equities and bonds
- 💾 **Local Storage** - All data stays in your browser (privacy-first)
- 📤 **Import/Export** - JSON format for data portability and backup
- 🌙 **Dark Mode** - Automatic dark mode support

## Quick Start

1. **Clone and open:**
   ```bash
   git clone https://github.com/yourusername/openfinanceplanner.git
   cd openfinanceplanner
   # Open index.html in your browser
   ```

2. **Or use the dev server:**
   ```bash
   npm run serve
   # Navigate to http://localhost:3030
   ```

## Project Status

**Current Version:** 0.1.0 (Prototype Phase)

This project has been recently refactored from a single-file implementation into a modular architecture. Core features are functional, but advanced financial modeling (progressive tax brackets, RMDs, Roth conversions, Monte Carlo simulations) is planned for future releases.

## Architecture

The application uses a layered architecture with ES6 modules:

```
src/
├── core/models/      # Domain models (Plan, Account, Expense)
├── calculations/     # Pure calculation functions
├── storage/          # localStorage with versioning
├── ui/               # Thin UI controllers
└── styles/           # Modular CSS
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Development

### Running Tests

```bash
# Run unit tests
node tests/unit/models/Plan.test.js
node tests/unit/calculations/projection.test.js

# Run integration tests
node tests/integration/full-flow.test.js
```

### Project Structure

- `index.html` - Main entry point
- `src/core/models/` - Business logic layer
- `src/calculations/` - Pure calculation functions
- `src/storage/` - Data persistence with schema validation
- `src/ui/` - UI controllers
- `tests/` - Unit and integration tests

## Contributing

Contributions welcome! Please see [docs/tasks.md](docs/tasks.md) for the roadmap and planned enhancements.

## License

MIT License - see LICENSE file for details

## Roadmap

See [docs/tasks.md](docs/tasks.md) for detailed development plans including:
- Advanced tax calculations with progressive brackets
- Required Minimum Distribution (RMD) calculations
- Roth conversion strategies (backdoor Roth, conversion ladders)
- Monte Carlo simulations for variance modeling
- Data visualization with charts

## Privacy & Data

- **Client-side only** - No data ever leaves your browser
- **No tracking** - No analytics or telemetry
- **No accounts** - No registration or login required
- **Export your data** - Full control via JSON export/import

---

**Note:** This tool is for educational and planning purposes. Consult a qualified financial advisor for personalized advice.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Summary

This refactoring plan establishes a **modular, maintainable foundation** for Open Finance Planner:

### What Changed

1. **Single file → Modular architecture** - 1750-line HTML file split into focused modules
2. **Monolithic → Layered architecture** - Clear separation: Domain → Calculations → Storage → UI
3. **Untested → Testable** - Unit tests for all domain models and calculations
4. **Implicit → Explicit contracts** - Schema validation, pure functions, defined interfaces

### What Stayed the Same

1. **Zero dependencies** - Still pure vanilla JavaScript
2. **Client-side only** - No backend, all localStorage
3. **Integer arithmetic** - Money stored in cents
4. **Same functionality** - All existing features work identically

### Foundation for Future

This architecture enables:
- ✅ **Complex tax rules** - Pluggable calculation system
- ✅ **Schema migrations** - Versioned storage with migration path
- ✅ **Testing at scale** - Unit tests for each layer
- ✅ **Team collaboration** - Clear module boundaries
- ✅ **Progressive enhancement** - Add features without refactoring

### Next Steps After Refactoring

1. **Tax Engine** - Implement progressive tax brackets, state taxes, capital gains
2. **RMDs** - Required Minimum Distribution calculations
3. **Roth Strategies** - Backdoor Roth, conversion ladders
4. **Monte Carlo** - Statistical variance in projections
5. **Visualization** - Charts and graphs

See `/docs/tasks.md` for detailed roadmap.
