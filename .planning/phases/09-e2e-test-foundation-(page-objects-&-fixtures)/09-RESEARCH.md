# Phase 09: E2E Test Foundation (Page Objects & Fixtures) - Research

**Researched:** 2026-02-03
**Domain:** Playwright E2E Testing Architecture
**Confidence:** HIGH

## Summary

Phase 09 focuses on building reusable E2E testing abstractions using Playwright's Page Object Model (POM) pattern and test fixtures. The research confirms that Playwright's official documentation strongly recommends the POM pattern for maintainable test suites, with built-in fixture support for dependency injection and setup/teardown.

**Key findings:**
- Playwright provides official POM examples with clear patterns for encapsulating page interactions
- Custom fixtures extend base test objects to provide reusable page objects with automatic setup/teardown
- Test data builder pattern eliminates repetition in test object creation while providing sensible defaults
- localStorage handling in Playwright is straightforward using context isolation and storageState for persistence
- Monte Carlo calculations don't require mocking in E2E tests (they're deterministic given inputs), but can be controlled via test data

**Primary recommendation:** Implement a focused POM hierarchy (AppPage, PlanPage, AccountPage, ProjectionPage) with Playwright fixtures for automatic page initialization and test data builders for creating Plan/Account objects with sensible defaults.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **@playwright/test** | ^1.58.1 | E2E test runner with fixtures | Official Playwright test framework with built-in fixture support and dependency injection |
| **Playwright Page Object Model** | Native pattern | Test architecture | Officially recommended pattern in Playwright docs for maintainable tests |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Custom fixtures** | Native to Playwright | Page initialization, setup/teardown | Use for automatic page navigation, test data setup, cleanup |
| **data-testid selectors** | HTML attributes | Stable element targeting | Use for all test selectors (already adopted in Phase 8) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Page Object Model | Direct page interaction in tests | POM reduces duplication when UI changes; direct interaction is simpler for one-off tests but harder to maintain |
| Custom fixtures | beforeEach/afterEach hooks | Fixtures provide better composability and type safety; hooks are simpler but less reusable |

**Installation:**
```bash
# No additional packages needed - Playwright v1.58.1 already installed
# All patterns use native Playwright APIs
```

## Architecture Patterns

### Recommended Project Structure

```
tests/e2e/
├── pages/                    # Page Object Model classes
│   ├── AppPage.js           # Root page with navigation
│   ├── PlanPage.js          # Plan CRUD operations
│   ├── AccountPage.js       # Account CRUD operations
│   ├── ProjectionPage.js    # Projection viewing and Monte Carlo
│   └── fixtures.js          # Custom test fixtures
├── builders/                 # Test data builders
│   ├── PlanBuilder.js       # Plan object construction
│   └── AccountBuilder.js    # Account object construction
├── smoke.test.js            # Existing smoke test
├── plan-crud.test.js        # Plan management tests
├── account-crud.test.js     # Account management tests
└── projection.test.js       # Projection and Monte Carlo tests
```

### Pattern 1: Page Object Model Classes

**What:** Encapsulate page locators and actions in reusable classes that abstract UI interactions from test logic.

**When to use:** For all multi-step interactions with pages, forms, or complex UI components.

**Example:**
```javascript
// Source: https://playwright.dev/docs/pom
// tests/e2e/pages/PlanPage.js
export class PlanPage {
  constructor(page) {
    this.page = page;
    this.newPlanButton = page.getByTestId('new-plan-button');
    this.planNameInput = page.locator('#newPlanName');
    this.planAgeInput = page.locator('#newPlanAge');
    this.retirementAgeInput = page.locator('#newPlanRetirementAge');
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.planItems = page.getByTestId('plan-item');
  }

  async goto() {
    await this.page.goto('http://localhost:3030');
  }

  async createPlan(name, currentAge, retirementAge) {
    await this.newPlanButton.click();
    await this.planNameInput.fill(name);
    await this.planAgeInput.fill(currentAge.toString());
    await this.retirementAgeInput.fill(retirementAge.toString());
    await this.createButton.click();
    // Wait for modal to close and list to update
    await this.page.waitForTimeout(500);
  }

  async selectPlan(name) {
    await this.planItems.filter({ hasText: name }).click();
  }

  async isPlanVisible(name) {
    const count = await this.planItems.filter({ hasText: name }).count();
    return count > 0;
  }

  async getPlanCount() {
    return await this.planItems.count();
  }
}
```

**Usage in test:**
```javascript
import { test, expect } from '@playwright/test';
import { PlanPage } from './pages/PlanPage.js';

test('creates a new plan', async ({ page }) => {
  const planPage = new PlanPage(page);
  await planPage.goto();
  await planPage.createPlan('Retirement 2050', 40, 67);

  expect(await planPage.isPlanVisible('Retirement 2050')).toBe(true);
});
```

### Pattern 2: Custom Test Fixtures

**What:** Extend Playwright's base `test` object to provide reusable fixtures that automatically initialize page objects and perform setup/teardown.

**When to use:** For consistent page setup, data initialization, or cleanup across multiple tests.

**Example:**
```javascript
// Source: https://playwright.dev/docs/test-fixtures
// tests/e2e/pages/fixtures.js
import { test as base } from '@playwright/test';
import { PlanPage } from './PlanPage.js';
import { AccountPage } from './AccountPage.js';

// Declare fixture types
export const test = base.extend({
  planPage: async ({ page }, use) => {
    const planPage = new PlanPage(page);
    await planPage.goto();
    await use(planPage);
    // Cleanup: clear localStorage after test
    await page.evaluate(() => localStorage.clear());
  },
  accountPage: async ({ page }, use) => {
    const accountPage = new AccountPage(page);
    await use(accountPage);
    await page.evaluate(() => localStorage.clear());
  },
});

export { expect } from '@playwright/test';
```

**Usage in test:**
```javascript
// Import custom fixtures instead of @playwright/test
import { test, expect } from './pages/fixtures.js';

test('account CRUD operations', async ({ accountPage }) => {
  // accountPage is already initialized, on the correct page
  await accountPage.addAccount('401k', '401k', 100000);
  expect(await accountPage.getAccountCount()).toBe(1);
});
```

### Pattern 3: Test Data Builders

**What:** Fluent builder pattern for creating test data objects with sensible defaults and expressive APIs.

**When to use:** For creating Plan, Account, or other domain objects in tests without repetitive setup.

**Example:**
```javascript
// tests/e2e/builders/PlanBuilder.js
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';

export class PlanBuilder {
  constructor() {
    this.name = 'Test Plan';
    this.currentAge = 40;
    this.retirementAge = 67;
    this.accounts = [];
  }

  withName(name) {
    this.name = name;
    return this;
  }

  withAges(current, retirement) {
    this.currentAge = current;
    this.retirementAge = retirement;
    return this;
  }

  withAccount(name, type, balance) {
    this.accounts.push(new Account(name, type, balance));
    return this;
  }

  build() {
    const plan = new Plan(this.name, this.currentAge, this.retirementAge);
    this.accounts.forEach(account => plan.addAccount(account));
    return plan;
  }
}

// Convenience factory
export const aPlan = () => new PlanBuilder();

// Usage:
// const plan = aPlan()
//   .withName('Retirement 2050')
//   .withAges(35, 65)
//   .withAccount('401k', '401k', 100000)
//   .build();
```

**Account Builder:**
```javascript
// tests/e2e/builders/AccountBuilder.js
import { Account } from '../../src/core/models/Account.js';

export class AccountBuilder {
  constructor() {
    this.name = 'Test Account';
    this.type = '401k';
    this.balance = 100000;
    this.annualContribution = 0;
  }

  withName(name) {
    this.name = name;
    return this;
  }

  withType(type) {
    this.type = type;
    return this;
  }

  withBalance(balance) {
    this.balance = balance;
    return this;
  }

  withContribution(amount) {
    this.annualContribution = amount;
    return this;
  }

  build() {
    const account = new Account(this.name, this.type, this.balance);
    account.annualContribution = this.annualContribution;
    return account;
  }
}

export const anAccount = () => new AccountBuilder();
```

### Pattern 4: Page Object Hierarchy

**What:** Organize page objects by functional area with clear responsibilities and shared navigation in a base AppPage class.

**Structure:**
```
AppPage (base)
├── Navigation methods (goto, switchTab)
├── Shared locators (sidebar, header)
└── Child pages
    ├── PlanPage (plan CRUD, settings)
    ├── AccountPage (account CRUD)
    └── ProjectionPage (run projections, view Monte Carlo results)
```

**AppPage base class:**
```javascript
// tests/e2e/pages/AppPage.js
export class AppPage {
  constructor(page) {
    this.page = page;
    this.planList = page.getByTestId('plan-item');
    this.tabs = page.locator('.tab');
  }

  async goto() {
    await this.page.goto('http://localhost:3030');
  }

  async switchTab(tabName) {
    const tab = this.tabs.filter({ hasText: new RegExp(tabName, 'i') });
    await tab.click();
  }

  async createPlan(name, age, retirementAge) {
    // Delegate to PlanPage or implement here
    const planPage = new PlanPage(this.page);
    await planPage.createPlan(name, age, retirementAge);
  }
}
```

### Anti-Patterns to Avoid

- **Page objects with assertions:** Page objects should encapsulate actions and state retrieval, not assertions. Tests should perform assertions using Playwright's `expect`.
- **Tight coupling to implementation details:** Use `data-testid` attributes (already adopted) instead of CSS selectors or DOM structure that changes frequently.
- **Hard-coded waits:** Use Playwright's auto-waiting and locators instead of `waitForTimeout`. Only use explicit waits when absolutely necessary.
- **God object page classes:** Split large page objects into smaller, focused classes by functional area (PlanPage, AccountPage, etc.).
- **Test logic in page objects:** Keep conditional logic and test-specific behavior in test files, not page objects.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test data construction | Manual object creation in every test | Data builder pattern (PlanBuilder, AccountBuilder) | Eliminates repetition, provides sensible defaults, makes tests more readable |
| Page setup/teardown | beforeEach/afterEach hooks in every file | Playwright fixtures | Fixtures provide composability, type safety, and automatic dependency injection |
| Element waiting strategies | Custom wait logic | Playwright's auto-waiting locators | Playwright automatically waits for elements to be actionable, reducing flakiness |
| Selector strategies | CSS/class selectors | data-testid attributes (already in place) | Stable selectors that don't break with styling changes |

**Key insight:** Playwright's built-in features (fixtures, auto-waiting, locators) handle most common testing needs. Only build custom abstractions when they provide clear value in reducing duplication or improving test readability.

## Common Pitfalls

### Pitfall 1: State Leakage Between Tests

**What goes wrong:** Tests modify localStorage and subsequent tests fail because they inherit dirty state.

**Why it happens:** Playwright reuses browser contexts by default, and localStorage persists across tests in the same context.

**How to avoid:**
- Always clear localStorage in fixture teardown or `afterEach`
- Use `test.describe.configure({ mode: 'parallel' })` for true test isolation
- Consider using `test.use({ storageState: { cookies: [], origins: [] } })` for tests that require clean state

**Example fixture cleanup:**
```javascript
export const test = base.extend({
  planPage: async ({ page }, use) => {
    const planPage = new PlanPage(page);
    await planPage.goto();
    await use(planPage);
    // Clean up localStorage
    await page.evaluate(() => localStorage.clear());
  },
});
```

**Warning signs:** Tests pass individually but fail when run together; intermittent test failures; tests depending on execution order.

### Pitfall 2: Flaky Locators Due to Dynamic Content

**What goes wrong:** Tests fail because elements aren't ready or locators match multiple elements.

**Why it happens:** Not using Playwright's auto-waiting or using generic selectors.

**How to avoid:**
- Always use `data-testid` attributes (already adopted in Phase 8)
- Use `getByRole()`, `getByTestId()`, `getByText()` instead of `locator()` when possible
- Use `filter()` to narrow down locators: `page.getByTestId('plan-item').filter({ hasText: 'Plan Name' })`

**Example:**
```javascript
// Good - stable, auto-waiting
await page.getByTestId('new-plan-button').click();

// Bad - fragile
await page.locator('.btn.btn-primary').click(); // Might match multiple buttons
```

**Warning signs:** Tests fail with "Element not found" or "Timeout exceeded"; adding `waitForTimeout` fixes tests temporarily.

### Pitfall 3: Over-Engineering Page Objects

**What goes wrong:** Page objects become complex, test builders create unnecessary abstraction, and tests become harder to read.

**Why it happens:** Treating POM as a strict pattern rather than a pragmatic tool.

**How to avoid:**
- Start simple: one page object per major feature (Plan, Account, Projection)
- Extract shared behavior to AppPage base class only after duplication appears
- Don't create builder methods for every possible combination
- Prioritize test readability over DRY (Don't Repeat Yourself) in test code

**Guideline:** If the abstraction doesn't clearly improve test readability or reduce duplication across 3+ tests, don't create it.

**Warning signs:** Page objects with more than 15-20 methods; tests that are harder to understand than direct page interaction would be; spending more time maintaining abstractions than writing tests.

### Pitfall 4: Ignoring Monte Carlo Variance

**What goes wrong:** Tests that verify Monte Carlo results fail intermittently because Monte Carlo simulations have variance.

**Why it happens:** Monte Carlo uses random sampling, so results vary slightly between runs (95% confidence intervals account for this, but exact assertions will fail).

**How to avoid:**
- Don't assert exact Monte Carlo values (e.g., "success rate = 82.3%")
- Assert ranges or thresholds (e.g., "success rate > 80%", "within 95% confidence interval")
- Use deterministic test data to minimize variance
- Consider mocking `runMonteCarloSimulation` only if testing UI behavior independent of calculation logic

**Example:**
```javascript
// Good - assert threshold
await expect(page.locator('.success-probability')).toHaveText(/\d{2}\.\d%/);
const successProb = await page.locator('.success-probability').textContent();
expect(parseFloat(successProb)).toBeGreaterThan(80);

// Bad - exact match fails due to variance
await expect(page.locator('.success-probability')).toHaveText('82.3%');
```

**Warning signs:** Monte Carlo tests fail intermittently without code changes; tests pass sometimes and fail other times with same inputs.

### Pitfall 5: Not Testing Real User Workflows

**What goes wrong:** Tests verify individual UI elements but don't test end-to-end user workflows.

**Why it happens:** Focusing on unit testing in E2E suite rather than integration testing.

**How to avoid:**
- Write tests that follow user journeys (create plan → add accounts → run projection)
- Test multi-step workflows, not just individual form submissions
- Verify data persistence across page navigation
- Test error cases and validation messages

**Example workflow test:**
```javascript
test('complete user workflow: create plan, add accounts, run projection', async ({ page }) => {
  const appPage = new AppPage(page);
  await appPage.goto();

  // Create plan
  await appPage.createPlan('Retirement 2050', 40, 67);

  // Add accounts
  const accountPage = new AccountPage(page);
  await accountPage.addAccount('401k', '401k', 100000);
  await accountPage.addAccount('Roth IRA', 'Roth', 50000);

  // Run projection
  const projectionPage = new ProjectionPage(page);
  await projectionPage.runProjection();

  // Verify results
  await expect(projectionPage.finalBalance).toBeVisible();
  await expect(projectionPage.monteCarloResults).toContainText('Success Probability');
});
```

**Warning signs:** Tests pass but application has critical user workflow bugs; low test coverage for actual user scenarios.

## Code Examples

### Page Object for Account Management

```javascript
// tests/e2e/pages/AccountPage.js
export class AccountPage {
  constructor(page) {
    this.page = page;
    this.addAccountButton = page.getByRole('button', { name: '+ Add Account' });
    this.accountNameInput = page.locator('#accountName');
    this.accountTypeSelect = page.locator('#accountType');
    this.accountBalanceInput = page.locator('#accountBalance');
    this.accountContributionInput = page.locator('#accountContribution');
    this.createButton = page.getByRole('button', { name: 'Add' });
    this.accountCards = page.locator('.card');
  }

  async goto() {
    await this.page.goto('http://localhost:3030');
  }

  async addAccount(name, type, balance, contribution = 0) {
    await this.addAccountButton.click();
    await this.accountNameInput.fill(name);
    await this.accountTypeSelect.selectOption(type);
    await this.accountBalanceInput.fill(balance.toString());
    if (contribution > 0) {
      await this.accountContributionInput.fill(contribution.toString());
    }
    await this.createButton.click();
    // Wait for modal to close and list to update
    await this.page.waitForTimeout(500);
  }

  async getAccountCount() {
    return await this.accountCards.count();
  }

  async isAccountVisible(name) {
    const count = await this.accountCards.filter({ hasText: name }).count();
    return count > 0;
  }

  async deleteAccount(name) {
    const card = this.accountCards.filter({ hasText: name });
    await card.getByRole('button', { name: 'Delete' }).click();
    // Handle confirmation dialog
    this.page.on('dialog', dialog => dialog.accept());
  }
}
```

### ProjectionPage with Monte Carlo Verification

```javascript
// tests/e2e/pages/ProjectionPage.js
export class ProjectionPage {
  constructor(page) {
    this.page = page;
    this.runProjectionButton = page.getByRole('button', { name: 'Run Projection' });
    this.finalBalance = page.locator('.result-value').filter({ hasText: /^\$[\d,]+$/ });
    this.monteCarloResults = page.locator('.card').filter({ hasText: 'Monte Carlo Analysis' });
    this.successProbability = page.locator('.badge').filter({ hasText: /%\)$/ });
    this.balanceChart = page.locator('#balanceChart');
  }

  async runProjection() {
    await this.runProjectionButton.click();
    // Wait for results to load
    await this.finalBalance.waitFor();
    await this.monteCarloResults.waitFor();
  }

  async getSuccessProbability() {
    const text = await this.successProbability.textContent();
    return parseFloat(text.replace('%', ''));
  }

  async getFinalBalance() {
    const text = await this.finalBalance.textContent();
    return parseInt(text.replace(/[\$,]/g, ''));
  }
}
```

### localStorage Management in Tests

```javascript
// tests/e2e/helpers/storage.js
export class StorageHelper {
  constructor(page) {
    this.page = page;
  }

  async clear() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async getPlans() {
    return await this.page.evaluate(() => {
      const plansList = localStorage.getItem('ofp_plans_list');
      return plansList ? JSON.parse(plansList) : [];
    });
  }

  async getPlan(planId) {
    return await this.page.evaluate((id) => {
      const planData = localStorage.getItem(`ofp_plan_${id}`);
      return planData ? JSON.parse(planData) : null;
    }, planId);
  }

  async savePlan(planData) {
    await this.page.evaluate((data) => {
      localStorage.setItem(`ofp_plan_${data.id}`, JSON.stringify(data));

      const plansList = JSON.parse(localStorage.getItem('ofp_plans_list') || '[]');
      const existingIndex = plansList.findIndex(p => p.id === data.id);
      if (existingIndex >= 0) {
        plansList[existingIndex] = { id: data.id, name: data.name, lastModified: data.lastModified };
      } else {
        plansList.push({ id: data.id, name: data.name, lastModified: data.lastModified });
      }
      localStorage.setItem('ofp_plans_list', JSON.stringify(plansList));
    }, planData);
  }
}
```

**Usage in fixture:**
```javascript
export const test = base.extend({
  planPage: async ({ page }, use) => {
    const storageHelper = new StorageHelper(page);
    const planPage = new PlanPage(page);

    await planPage.goto();
    await use(planPage);

    // Cleanup
    await storageHelper.clear();
  },
});
```

### Mocking Monte Carlo (If Needed)

**Note:** Generally don't mock Monte Carlo in E2E tests. Use deterministic test data instead. Only mock if testing UI behavior independent of calculations.

```javascript
// tests/e2e/helpers/mocks.js
export async function mockMonteCarloResults(page, mockResults) {
  await page.route('**/monte-carlo', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResults)
    });
  });
}

// Usage (only if absolutely necessary):
test('tests Monte Carlo UI with mock data', async ({ page }) => {
  const mockResults = {
    averageFinalBalance: 1500000,
    percentiles: { p10: 800000, p90: 2500000 },
    successProbability: 0.85
  };

  await mockMonteCarloResults(page, mockResults);

  const projectionPage = new ProjectionPage(page);
  await projectionPage.runProjection();

  // Verify UI displays mocked data correctly
  const prob = await projectionPage.getSuccessProbability();
  expect(prob).toBe(85);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Page object classes with raw selectors | Page objects with data-testid locators | Phase 8 (2026-02-03) | More stable tests that don't break with CSS changes |
| beforeEach/afterEach hooks | Playwright fixtures with dependency injection | Playwright v1.10+ | Fixtures provide better composability and type safety |
| Manual test data setup | Test data builder pattern | Established pattern | Cleaner tests with sensible defaults |
| CSS selectors for tests | data-testid attributes | Phase 8 (2026-02-03) | Already adopted - continue using |

**Deprecated/outdated:**
- **XPath selectors:** Use `data-testid` or role-based locators instead
- **Thread-sleep patterns:** Use Playwright's auto-waiting instead
- **Page factories:** Use fixtures for dependency injection instead

## Open Questions

1. **Monte Carlo variance in E2E tests:**
   - What we know: Monte Carlo results vary between runs due to random sampling
   - What's unclear: Acceptable variance thresholds for test assertions
   - Recommendation: Assert ranges/thresholds (e.g., "success rate > 80%") rather than exact values; use consistent test data to minimize variance

2. **localStorage initialization speed:**
   - What we know: Can pre-populate localStorage using `page.evaluate()` or storageState files
   - What's unclear: Performance impact of large localStorage datasets in tests
   - Recommendation: Start with simple `page.evaluate()` for test setup; optimize to storageState files only if tests become slow (unlikely for financial plan data)

3. **Modal handling strategy:**
   - What we know: Modals are dynamically created in the DOM (not in initial HTML)
   - What's unclear: Best pattern for waiting for modal to appear/close
   - Recommendation: Use `page.waitForSelector()` with specific modal ID, or use Playwright's auto-waiting with `getByText()`/`getByRole()` for modal buttons

## Sources

### Primary (HIGH confidence)

- **[/microsoft/playwright.dev](https://playwright.dev/docs/pom)** - Official Page Object Model documentation and examples
- **[/microsoft/playwright.dev](https://playwright.dev/docs/test-fixtures)** - Official test fixtures documentation with custom fixture patterns
- **[/microsoft/playwright.dev](https://playwright.dev/docs/mock)** - API mocking and route handling documentation
- **[/microsoft/playwright.dev](https://playwright.dev/docs/auth)** - localStorage and storageState handling for authenticated sessions
- **Existing codebase** - Current AppPage implementation, UI controllers (PlanController, AccountController, ProjectionController), and domain models (Plan, Account)

### Secondary (MEDIUM confidence)

- **[Page Object Model Guide: Best Practices October 2025](https://www.skyvern.com/blog/page-object-model-guide/)** - Modern POM organization patterns
- **[Testing With The Builder Pattern](https://dev.to/jonashdown/testing-with-the-builder-pattern-33gn)** - Test data builder pattern in JavaScript (July 2025)
- **[Playwright Fixtures in 2025: The Practical Guide](https://levelup.gitconnected.com/playwright-fixtures-in-2025-the-practical-guide-to-fast-clean-end-to-end-tests-55e9b3f7b5f7)** - Advanced fixture patterns (April 2025)
- **[A test-data builder - Markus Eliasson](https://markuseliasson.se/article/a-test-data-builder/)** - Detailed builder pattern implementation guide
- **[End-to-End Testing with Playwright — Quick Setup & Best Practices](https://medium.com/@mohammed.ahmadi1990/end-to-end-testing-with-playwright-quick-setup-best-practices-b89fa0408c88)** - Test isolation and best practices

### Tertiary (LOW confidence)

- **[jsBuilder GitHub Repository](https://github.com/mike-hanson/jsBuilder)** - Utility for test data builders (unverified if needed)
- **[Playwright API Mocking for Realistic UI Testing](https://medium.com/@gunashekarr11/playwright-api-mocking-for-realistic-ui-testing-beyond-simple-route-fulfill-f2c61737f0c8)** - Advanced mocking techniques (may not be needed for this phase)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Playwright documentation and existing Phase 8 implementation
- Architecture: HIGH - Context7 documentation, official Playwright examples, and established POM patterns from multiple 2025 sources
- Pitfalls: MEDIUM - Based on official best practices and common testing anti-patterns, but some application-specific (Monte Carlo variance) is LOW confidence due to lack of specific domain examples

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - Playwright ecosystem is stable, but verify fixture patterns before implementation)
