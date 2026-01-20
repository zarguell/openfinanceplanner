# E2E Test Architecture for Vanilla JS Applications

**Domain:** End-to-end testing architecture
**Researched:** 2025-01-20
**Overall confidence:** HIGH

## Executive Summary

Research into E2E test architecture for vanilla JavaScript applications reveals three mature approaches: **Vitest Browser Mode** (recommended for this project), **Playwright**, and **WebdriverIO**. Vitest Browser Mode provides the strongest integration with existing infrastructure while offering modern browser-based testing capabilities. The architecture should leverage **Page Object Models** for maintainability, **fixtures** for test setup, and **test data builders** for data management.

## Key Findings

**Stack:** Vitest Browser Mode + Playwright provider (already has Vitest)
**Architecture:** Page Object Model pattern with fixture-based setup
**Critical pitfall:** Using implementation details instead of user-visible behavior leads to brittle tests

## Recommended Technology Stack

| Technology           | Version | Purpose                         | Why                                                     |
| -------------------- | ------- | ------------------------------- | ------------------------------------------------------- |
| **@vitest/browser**  | Latest  | E2E test runner                 | Native Vitest integration, shared config, same test API |
| **playwright**       | Latest  | Browser automation provider     | Parallel execution, auto-waiting, modern tooling        |
| **@playwright/test** | Latest  | Test utilities (optional)       | Rich assertions, fixtures, trace viewer                 |
| **jsdom**            | Latest  | DOM simulation (for unit tests) | Already used via Vitest node environment                |

## Why Not Alternatives

| Alternative               | Why Not                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| **Standalone Playwright** | Duplicates test infrastructure, separate config, different test API |
| **WebdriverIO**           | More complex setup, less native Vitest integration                  |
| **Cypress**               | Heavy, proprietary test runner, doesn't integrate with Vitest       |
| **Puppeteer**             | Limited to Chrome, no built-in test framework                       |

## Architecture Patterns

### Recommended: Page Object Model (POM)

**What:** Encapsulate page logic in reusable classes that represent pages or components.

**Why:** Separates test logic from page implementation, making tests resilient to UI changes.

**Example structure:**

```
tests/
├── e2e/
│   ├── fixtures/           # Test fixtures and setup
│   │   ├── browser.js      # Browser fixtures
│   │   └── data.js         # Test data builders
│   ├── pages/              # Page object models
│   │   ├── AppPage.js      # Main application page
│   │   ├── PlanPage.js     # Plan management page
│   │   └── AccountPage.js  # Account management page
│   └── *.spec.js          # E2E test files
```

### Page Object Implementation

```javascript
// tests/e2e/pages/AppPage.js
import { page, expect } from 'vitest/browser';

export class AppPage {
  constructor() {
    // Define locators for elements
    this.createPlanButton = page.getByRole('button', { name: /create plan/i });
    this.planNameInput = page.getByLabel('Plan Name');
    this.currentAgeInput = page.getByLabel('Current Age');
    this.retirementAgeInput = page.getByLabel('Retirement Age');
    this.submitButton = page.getByRole('button', { name: /create/i });
  }

  async goto() {
    await page.goto('http://localhost:3030');
  }

  async createPlan(name, currentAge, retirementAge) {
    await this.createPlanButton.click();
    await this.planNameInput.fill(name);
    await this.currentAgeInput.fill(currentAge.toString());
    await this.retirementAgeInput.fill(retirementAge.toString());
    await this.submitButton.click();
  }

  async expectPlanCreated(planName) {
    await expect(page.getByText(planName)).toBeVisible();
  }
}
```

### Using Page Objects in Tests

```javascript
// tests/e2e/plan-creation.spec.js
import { test } from 'vitest/browser';
import { AppPage } from './pages/AppPage.js';

test('should create a new plan', async ({ page }) => {
  const appPage = new AppPage(page);

  await appPage.goto();
  await appPage.createPlan('My Retirement Plan', 35, 65);
  await appPage.expectPlanCreated('My Retirement Plan');
});
```

## Fixture-Based Test Setup

### Custom Fixtures with Vitest

```javascript
// tests/e2e/fixtures/browser.js
import { test as base } from 'vitest/browser';

export const test = base.extend({
  // Fixture for authenticated state
  authenticatedPage: async ({ page }, use) => {
    // Setup: Navigate to app and create initial plan
    await page.goto('http://localhost:3030');
    await page.getByRole('button', { name: /create plan/i }).click();
    await page.getByLabel('Plan Name').fill('Test Plan');
    await page.getByLabel('Current Age').fill('35');
    await page.getByLabel('Retirement Age').fill('65');
    await page.getByRole('button', { name: /create/i }).click();

    // Use the authenticated page in tests
    await use(page);

    // Cleanup: Clear localStorage
    await page.evaluate(() => localStorage.clear());
  },

  // Fixture for test data
  testPlan: async ({}, use) => {
    const planData = {
      name: 'Test Plan',
      currentAge: 35,
      retirementAge: 65,
      accounts: [
        { name: '401k', type: '401k', balance: 100000 },
        { name: 'Roth IRA', type: 'Roth', balance: 50000 },
      ],
    };

    await use(planData);
  },
});
```

### Using Fixtures in Tests

```javascript
import { test } from './fixtures/browser.js';

test('authenticated user can add accounts', async ({ authenticatedPage }) => {
  await authenticatedPage.getByRole('button', { name: /add account/i }).click();
  await authenticatedPage.getByLabel('Account Name').fill('New 401k');
  await authenticatedPage.getByLabel('Account Type').selectOption('401k');
  await authenticatedPage.getByLabel('Balance').fill('75000');
  await authenticatedPage.getByRole('button', { name: /save/i }).click();

  await expect(authenticatedPage.getByText('New 401k')).toBeVisible();
});
```

## Test Data Management

### Test Data Builders Pattern

```javascript
// tests/e2e/fixtures/data.js
export class PlanBuilder {
  constructor() {
    this.name = 'Test Plan';
    this.currentAge = 35;
    this.retirementAge = 65;
    this.accounts = [];
    this.expenses = [];
    this.income = [];
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

  withAccount(account) {
    this.accounts.push(account);
    return this;
  }

  build() {
    return {
      name: this.name,
      currentAge: this.currentAge,
      retirementAge: this.retirementAge,
      accounts: [...this.accounts],
      expenses: [...this.expenses],
      income: [...this.income],
    };
  }
}

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
    return {
      name: this.name,
      type: this.type,
      balance: this.balance,
      annualContribution: this.annualContribution,
    };
  }
}
```

### Using Test Data Builders

```javascript
import { PlanBuilder, AccountBuilder } from './fixtures/data.js';
import { test } from './fixtures/browser.js';

test('calculates projections correctly', async ({ authenticatedPage }) => {
  const account1 = new AccountBuilder()
    .withName('401k')
    .withType('401k')
    .withBalance(100000)
    .withContribution(20000)
    .build();

  const account2 = new AccountBuilder()
    .withName('Roth IRA')
    .withType('Roth')
    .withBalance(50000)
    .withContribution(6000)
    .build();

  const planData = new PlanBuilder()
    .withName('Retirement Plan')
    .withAges(35, 65)
    .withAccount(account1)
    .withAccount(account2)
    .build();

  // Use planData to populate form or seed localStorage
  await authenticatedPage.goto();
  await seedPlanData(authenticatedPage, planData);

  // Verify projections
  await expect(authenticatedPage.getByText('$2,500,000')).toBeVisible();
});
```

## Configuration Integration

### Update vitest.config.js

```javascript
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    // Existing unit test configuration
    environment: 'node',
    include: ['tests/**/*.test.js'],

    // E2E test projects
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.js'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.js'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.spec.js'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
      },
    ],
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:integration": "vitest run --project integration",
    "test:e2e": "vitest run --project e2e",
    "test:e2e:ui": "vitest --project e2e --ui",
    "test:e2e:debug": "vitest --project e2e --debug"
  }
}
```

## Best Practices

### 1. Test User-Visible Behavior (HIGH confidence)

**✅ DO:** Test what users see and interact with

```javascript
await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
```

**❌ DON'T:** Test implementation details

```javascript
expect(button.classList.contains('btn-primary')).toBe(true);
```

### 2. Use Resilient Selectors (HIGH confidence)

**Priority order for selectors:**

1. **Accessibility roles** (`getByRole`) - Most resilient
2. **Labels** (`getByLabelText`) - User-facing
3. **Text content** (`getByText`) - Visible to users
4. **Test IDs** (`getByTestId`) - Only as escape hatch

```javascript
// ✅ Good: User-facing
await page.getByRole('button', { name: /create plan/i }).click();

// ❌ Bad: Brittle CSS selector
await page.locator('.btn.btn-primary.create-plan').click();
```

### 3. Avoid Testing Third-Party Dependencies (HIGH confidence)

```javascript
// ✅ Mock external APIs
await page.route('**/api/external', (route) =>
  route.fulfill({
    status: 200,
    body: JSON.stringify(mockData),
  })
);

// ❌ Don't test external sites directly
await page.goto('https://external-site.com');
```

### 4. Make Tests Isolated (MEDIUM confidence)

Each test should be independent:

- Use `beforeEach` for setup, not `beforeAll`
- Clean up state in `afterEach`
- Don't rely on test execution order

```javascript
test('creates plan', async ({ page }) => {
  // Each test gets fresh state
  await page.goto('http://localhost:3030');
  // ... test logic
});
```

### 5. Use Web-First Assertions (HIGH confidence)

```javascript
// ✅ Good: Auto-waiting
await expect(page.getByText('Success')).toBeVisible();

// ❌ Bad: Manual waiting
expect(await page.getByText('Success').isVisible()).toBe(true);
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using `container` for Queries

**What:** Querying the DOM container directly instead of using user-facing selectors.

**Why bad:** Tests implementation details, breaks on refactors.

**Instead:** Use `screen` or `page` queries with role/text.

```javascript
// ❌ Bad
const { container } = render(<App />);
const button = container.querySelector('.btn-primary');

// ✅ Good
const button = screen.getByRole('button', { name: /submit/i });
```

### Anti-Pattern 2: Manual Waits

**What:** Using `setTimeout`, `waitFor`, or pause to wait for elements.

**Why bad:** Brittle, slow, fails unpredictably.

**Instead:** Use auto-waiting assertions.

```javascript
// ❌ Bad
await page.waitForTimeout(1000);
expect(await button.isVisible()).toBe(true);

// ✅ Good
await expect(button).toBeVisible();
```

### Anti-Pattern 3: Over-Engineering Page Objects

**What:** Creating deep inheritance hierarchies or complex abstractions.

**Why bad:** Hard to maintain, indirection makes debugging difficult.

**Instead:** Keep page objects simple and flat.

```javascript
// ❌ Bad: Complex inheritance
class BasePage { ... }
class AuthPage extends BasePage { ... }
class PlanPage extends AuthPage { ... }

// ✅ Good: Simple classes
class PlanPage {
  constructor(page) {
    this.page = page;
    // Direct locator definitions
  }
}
```

### Anti-Pattern 4: Testing Multiple Things in One Test

**What:** Asserting many unrelated behaviors in one test.

**Why bad:** Hard to debug, unclear what failed.

**Instead:** One assertion per test (or related assertions).

```javascript
// ❌ Bad
test('plan functionality', async () => {
  await createPlan();
  await addAccount();
  await updateExpenses();
  await verifyProjections();
  // Too many things!
});

// ✅ Good
test('creates plan successfully', async () => {
  await createPlan();
  await expect(plan).toBeVisible();
});

test('adds account to plan', async () => {
  await createPlan();
  await addAccount();
  await expect(account).toBeVisible();
});
```

## Test File Structure

### Recommended Organization

```
tests/
├── e2e/
│   ├── fixtures/
│   │   ├── browser.js       # Custom fixtures
│   │   └── data.js          # Test data builders
│   ├── pages/
│   │   ├── AppPage.js       # Main app page
│   │   ├── PlanPage.js      # Plan management
│   │   ├── AccountPage.js   # Account CRUD
│   │   └── ProjectionPage.js # Projections
│   ├── scenarios/
│   │   ├── plan-creation.spec.js
│   │   ├── account-management.spec.js
│   │   └── projection-calculation.spec.js
│   └── setup.js             # Global E2E setup
```

### Test Naming Conventions

- **Files:** `*.spec.js` for E2E tests
- **Descriptions:** User-focused language
  - ✅ "user can create a retirement plan"
  - ❌ "Plan.create() works correctly"
- **Test structure:** Given-When-Then pattern

```javascript
test('given a logged in user, when creating a plan, then plan appears in list', async ({
  authenticatedPage,
}) => {
  // Given: authenticatedPage fixture provides logged-in state
  // When: create plan
  await authenticatedPage.getByRole('button', { name: /create plan/i }).click();
  // Then: verify
  await expect(authenticatedPage.getByText('Test Plan')).toBeVisible();
});
```

## Integration with Vitest

### Advantages of Vitest Browser Mode

1. **Unified test runner** - No separate tooling for E2E
2. **Shared configuration** - Same vitest.config.js
3. **Familiar API** - `test`, `describe`, `expect` work the same
4. **Watch mode** - Iterative development
5. **UI mode** - Visual debugging
6. **TypeScript support** - Better DX (if needed later)

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npx vitest run tests/e2e/scenarios/plan-creation.spec.js

# Run with debug mode
npx vitest --project e2e --debug
```

## Confidence Assessment

| Area           | Confidence | Notes                                                                 |
| -------------- | ---------- | --------------------------------------------------------------------- |
| Stack          | HIGH       | Vitest Browser Mode official docs, Playwright mature                  |
| Architecture   | HIGH       | Page Object Pattern well-documented, industry standard                |
| Fixtures       | HIGH       | Vitest fixtures API documented with examples                          |
| Test Data      | MEDIUM     | Builder pattern well-established, but custom to this project          |
| Best Practices | HIGH       | Based on official Playwright/Vitest docs + Testing Library principles |

## Gaps to Address

1. **Test server startup** - Need to ensure dev server runs before E2E tests
2. **CI/CD integration** - Configure headless browser execution in GitHub Actions
3. **Test data seeding** - May need helper functions for complex data setup
4. **Visual regression** - Not covered, consider if needed

## Implementation Roadmap

### Phase 1: Infrastructure Setup

- Install `@vitest/browser` and `playwright`
- Update vitest.config.js with E2E project
- Create basic page object for AppPage
- Verify browser mode works with one test

### Phase 2: Core Page Objects

- Create page objects for main flows:
  - Plan creation/management
  - Account CRUD
  - Expense/income management
- Set up fixtures for authenticated state
- Create test data builders

### Phase 3: Critical User Flows

- Write E2E tests for:
  - Plan creation workflow
  - Account management workflow
  - Projection calculation workflow
  - Data persistence (localStorage)

### Phase 4: CI/CD Integration

- Configure GitHub Actions workflow
- Set up headless execution
- Add trace viewer for failed tests
- Configure test reports

## Sources

- [Vitest Browser Mode Documentation](https://vitest.dev/guide/browser/) - HIGH confidence (official docs)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices) - HIGH confidence (official docs)
- [WebdriverIO Page Objects](https://webdriver.io/docs/pageobjects) - MEDIUM confidence (framework-specific)
- [Testing Library Principles](https://testing-library.com/docs/dom-testing-library/intro/) - HIGH confidence (industry standard)
- [Vitest Test Context/Fixtures](https://vitest.dev/guide/test-context.html) - HIGH confidence (official docs)
