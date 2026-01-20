# Domain Pitfalls: E2E Testing for Vanilla JS Applications

**Domain:** End-to-end testing for vanilla JavaScript applications
**Researched:** 2026-01-20
**Confidence:** HIGH (Cypress official docs, Testing Library docs, Kent C. Dodds articles)

## Executive Summary

E2E testing for vanilla JS applications suffers from three major pitfalls: **test fragility** (tests break with implementation changes), **slow tests** (poor retry/wait strategies), and **missed edge cases** (testing implementation details rather than user behavior). The research shows these issues are well-documented with clear prevention strategies.

## Critical Pitfalls

Mistakes that cause test suite rewrites or major issues.

### Pitfall 1: Testing Implementation Details

**What goes wrong:**
Tests couple to internal structure (CSS classes, DOM hierarchy) rather than user-perceivable behavior. A single CSS class change breaks dozens of tests.

**Why it happens:**

- Using brittle selectors (`.btn-primary`, `#submit-button`)
- Querying by container elements: `container.querySelector('.btn')`
- Testing component internals instead of user interactions
- Following "unit test patterns" in E2E tests (one assertion per test)

**Consequences:**

- Refactoring HTML/CSS breaks tests despite unchanged functionality
- Tests become maintenance burden
- Team loses confidence in test suite
- High false-negative rate

**Prevention:**

```javascript
// ❌ BAD - Brittle selector
cy.get('.btn.btn-large').click();

// ✅ GOOD - Data attribute
cy.get('[data-cy="submit"]').click();

// ✅ GOOD - User-centric query
cy.contains('Submit').click();
```

Use Testing Library queries prioritized by user interaction:

1. `getByRole()` - ARIA roles (screen reader friendly)
2. `getByLabelText()` - Form inputs
3. `getByText()` - Buttons, links
4. `getByTestId()` - Escape hatch only

**Detection:**

- Test breaks when CSS changes
- Multiple selectors for same element across tests
- Heavy use of `querySelector` or class-based selectors

**Sources:**

- [Cypress Best Practices: Selecting Elements](https://docs.cypress.io/guides/core-concepts/best-practices) (HIGH confidence - official docs)
- [Testing Library Guiding Principles](https://testing-library.com/docs/dom-testing-library/intro/) (HIGH confidence - official docs)
- [Testing Implementation Details - Kent C. Dodds](https://kentcdodds.com/blog/testing-implementation-details) (HIGH confidence - industry expert)

---

### Pitfall 2: Race Conditions and Flaky Tests

**What goes wrong:**
Tests pass locally but fail in CI due to timing issues. Tests fail intermittently due to async operations not completing before assertions.

**Why it happens:**

- Hard-coded waits: `cy.wait(5000)`
- Not understanding retry-ability of queries
- Mixing action commands without query chains
- Using `.then()` instead of `.should()` for assertions
- Performing side effects in `waitFor()` callbacks

**Consequences:**

- Tests become unreliable
- Team ignores failing tests ("it's just flaky")
- CI/CD pipeline blocked by false failures
- Lost time debugging non-existent bugs

**Prevention:**

```javascript
// ❌ BAD - Arbitrary wait
cy.get('.result').click();
cy.wait(3000); // HOPING it's ready
cy.get('.modal').should('be.visible');

// ✅ GOOD - Built-in retry-ability
cy.get('.result').click();
cy.get('.modal', { timeout: 10000 }).should('be.visible'); // Retries until timeout

// ✅ GOOD - Explicit route wait
cy.intercept('GET', '/api/data').as('getData');
cy.get('.fetch-btn').click();
cy.wait('@getData'); // Waits for network request
cy.get('.result').should('be.visible');
```

**Key insight:** Cypress/WebdriverIO queries automatically retry. Only use `cy.wait()` with route aliases, not arbitrary time.

**Detection:**

- Random test failures (passes then fails with same code)
- Heavy use of `cy.wait(number)` without aliases
- Tests fail in CI but pass locally
- Inconsistent failure patterns

**Sources:**

- [Cypress Retry-ability Guide](https://docs.cypress.io/guides/core-concepts/retry-ability) (HIGH confidence - official docs, detailed mechanism)
- [Cypress Best Practices: Unnecessary Waiting](https://docs.cypress.io/guides/core-concepts/best-practices#Unnecessary-Waiting) (HIGH confidence - official docs)

---

### Pitfall 3: Test Interdependence

**What goes wrong:**
Tests rely on state from previous tests. Running tests individually passes, but full suite fails (or vice versa).

**Why it happens:**

- Not resetting state between tests
- Chaining multiple `it()` blocks that depend on order
- Using `afterEach` for cleanup (doesn't run on test refresh)
- Assuming shared browser state

**Consequences:**

- Can't run single test during development
- Reordering tests breaks suite
- Debugging becomes nightmare
- False confidence (tests pass in wrong order)

**Prevention:**

```javascript
// ❌ BAD - Tests depend on order
describe('Form', () => {
  it('navigates to form', () => {
    cy.visit('/form');
  });

  it('fills first name', () => {
    // Assumes previous test ran!
    cy.get('[data-testid="firstName"]').type('John');
  });

  it('fills last name', () => {
    // Assumes previous tests ran!
    cy.get('[data-testid="lastName"]').type('Doe');
  });
});

// ✅ GOOD - Each test is independent
describe('Form', () => {
  beforeEach(() => {
    cy.visit('/form');
  });

  it('fills entire form and submits', () => {
    cy.get('[data-testid="firstName"]').type('John');
    cy.get('[data-testid="lastName"]').type('Doe');
    cy.get('form').submit();
  });
});
```

**Reset state BEFORE tests, not after:**

```javascript
// ✅ GOOD - Reset in beforeEach (runs even on refresh)
beforeEach(() => {
  cy.task('db:seed'); // Reset database
  cy.visit('/dashboard');
});

// ❌ BAD - Cleanup in afterEach (won't run if browser refreshed)
afterEach(() => {
  cy.logout();
});
```

**Detection:**

- Running `it.only` on a test fails
- Reordering tests causes failures
- Tests pass in suite but fail individually

**Sources:**

- [Cypress Best Practices: State of Previous Tests](https://docs.cypress.io/guides/core-concepts/best-practices) (HIGH confidence - official docs with detailed examples)

---

### Pitfall 4: Over-Mocking and Testing in Isolation

**What goes wrong:**
So much is stubbed/mocked that tests pass despite application being broken. "Tests give false confidence."

**Why it happens:**

- Overusing `cy.stub()` for every function
- Intercepting all network requests
- Testing fake data instead of real scenarios
- Fear of "slow" integration tests

**Consequences:**

- Tests pass but app doesn't work
- Integration bugs slip through
- Mocks drift from actual API contracts
- Testing implementation, not behavior

**Prevention:**

```javascript
// ❌ BAD - Everything mocked
cy.stub(api, 'fetchUser').returns({ name: 'John' });
cy.stub(api, 'fetchAccounts').returns([]);
cy.stub(api, 'calculateTax').returns(5000);
// App could be completely broken but tests pass!

// ✅ GOOD - Test real integration
cy.visit('/dashboard');
cy.get('[data-testid="user-name"]').should('contain', 'John');
cy.get('[data-testid="account-list"]').should('have.length', 2);
// If API changes, test fails (GOOD - catch bugs early)
```

**Guideline:** Only mock external dependencies you don't control (3rd party APIs, payment gateways). Mock internal APIs sparingly.

**Detection:**

- All network requests intercepted
- Test passes when server is down
- Changing backend doesn't break tests

**Sources:**

- [Write Tests. Not Too Many. Mostly Integration. - Kent C. Dodds](https://kentcdodds.com/blog/write-tests) (HIGH confidence - industry expert, widely cited)
- [The Merits of Mocking - Kent C. Dodds](https://kentcdodds.com/blog/the-merits-of-mocking) (HIGH confidence - nuanced discussion)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 5: Poor Selector Strategies

**What goes wrong:**
Tests break when DOM structure changes slightly. Elements can't be found reliably.

**Why it happens:**

- Using generic selectors: `cy.get('button')` (too many matches)
- Using CSS classes: `cy.get('.btn-primary')` (styling changes)
- Using chained queries: `cy.get('div').find('button').first()` (brittle)

**Consequences:**

- Tests break on minor refactors
- Selector maintenance burden
- False negatives from wrong element

**Prevention:**

```javascript
// ❌ BAD - Generic selector
cy.get('button').click(); // Which button?

// ❌ BAD - CSS class (styling changes)
cy.get('.btn-large.btn-primary').click();

// ✅ GOOD - Data attribute (stable)
cy.get('[data-testid="submit-form"]').click();

// ✅ GOOD - Text content (if meaningful)
cy.contains('Submit').click();

// ✅ GOOD - ARIA role (accessible)
cy.getByRole('button', { name: /submit/i }).click();
```

**Hierarchy of selectors (best to worst):**

1. `data-testid` attributes (most stable)
2. ARIA roles and labels (accessible)
3. Text content (meaningful to users)
4. CSS classes (brittle - avoid)
5. Element tags (too generic - avoid)

**Detection:**

- Selectors contain CSS classes
- Chained `find()` or `children()` calls
- Multiple elements found for selector

**Sources:**

- [Cypress Best Practices: Selecting Elements](https://docs.cypress.io/guides/core-concepts/best-practices) (HIGH confidence - official docs with detailed comparison table)
- [WebdriverIO Best Practices](https://webdriver.io/docs/bestpractices) (MEDIUM confidence - framework-specific but widely applicable)

---

### Pitfall 6: Testing Third-Party Integrations

**What goes wrong:**
Tests try to log in via Google OAuth, verify emails in Gmail, or check Stripe dashboard.

**Why it happens:**

- Want to verify full integration
- Don't know how to stub external services
- Fear of missing edge cases

**Consequences:**

- Tests are extremely slow (OAuth takes time)
- Tests fail due to captchas, rate limits, A/B testing
- Third-party can block your tests
- Tests unreliable in CI

**Prevention:**

```javascript
// ❌ BAD - Test real OAuth flow
cy.visit('/login');
cy.get('.google-login').click();
// Goes to Google...
cy.get('#Email').type('test@example.com');
// Fails with captcha or rate limit

// ✅ GOOD - Stub OAuth
cy.intercept('POST', '/auth/google/callback', {
  fixture: 'google-user.json',
}).as('googleLogin');
cy.visit('/login');
cy.get('.google-login').click();
cy.wait('@googleLogin');
cy.get('[data-testid="user-avatar"]').should('be.visible');
```

**Use `cy.request()` for third-party APIs:**

```javascript
// Instead of testing UI integration
cy.request('GET', 'https://api.stripe.com/customer/123').then((response) => {
  expect(response.status).to.eq(200);
});
```

**Detection:**

- Tests visit external domains
- Tests take >30 seconds each
- Random failures due to captchas/rate limits

**Sources:**

- [Cypress Best Practices: Visiting External Sites](https://docs.cypress.io/guides/core-concepts/best-practices) (HIGH confidence - official docs with OAuth examples)

---

### Pitfall 7: Inefficient Test Organization

**What goes wrong:**
Hundreds of tiny "unit test style" E2E tests with one assertion each. Tests are slow and brittle.

**Why it happens:**

- Carrying over unit test mental model
- Fear of "multiple assertions" (myth)
- Wanting descriptive test names

**Consequences:**

- Test suite takes hours to run
- Overhead of browser startup/teardown
- Tests break due to interdependence

**Prevention:**

```javascript
// ❌ BAD - Tiny unit-style E2E tests
describe('Button', () => {
  beforeEach(() => {
    cy.visit('/form');
    cy.get('[data-testid="submit"]').as('button');
  });

  it('has correct type', () => {
    cy.get('@button').should('have.attr', 'type', 'submit');
  });

  it('has correct class', () => {
    cy.get('@button').should('have.class', 'btn-primary');
  });

  it('has correct text', () => {
    cy.get('@button').should('have.text', 'Submit');
  });
});

// ✅ GOOD - Cohesive E2E test
describe('Form Submission', () => {
  it('submits form with valid data', () => {
    cy.visit('/form');
    cy.get('[data-testid="firstName"]').type('John');
    cy.get('[data-testid="lastName"]').type('Doe');
    cy.get('[data-testid="submit"]')
      .should('have.attr', 'type', 'submit')
      .and('have.class', 'btn-primary')
      .and('be.enabled')
      .click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

**Rule of thumb:** E2E tests should be user journey tests, not component unit tests.

**Detection:**

- Tests with single assertion each
- 100+ tests for small application
- Test suite runs >30 minutes

**Sources:**

- [Cypress Best Practices: Tiny Tests](https://docs.cypress.io/guides/core-concepts/best-practices) (HIGH confidence - official docs with performance rationale)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 8: Not Using `data-*` Attributes Consistently

**What goes wrong:**
Some elements have `data-testid`, others don't. Tests use mixed selector strategies.

**Why it happens:**

- Forgot to add during initial development
- Don't want to "pollute" HTML
- Inconsistent team practices

**Consequences:**

- Confusing test code
- Brittle selectors in some places, stable in others
- Onboarding new testers is harder

**Prevention:**
Add `data-testid` to all interactive elements:

```html
<!-- ✅ GOOD - Consistent test attributes -->
<button data-testid="submit-form">Submit</button>
<input data-testid="email-input" />
<div data-testid="error-message">Invalid email</div>
```

Configure ESLint rule (if using React/Vue):

```json
{
  "rules": {
    "testing-library/consistent-data-testid": ["error", { "testIdPattern": "^data-testid-" }]
  }
}
```

**Detection:**

- Mix of selector types in test files
- Some tests use `getByRole`, others use `querySelector`

---

### Pitfall 9: Ignoring Accessibility in Tests

**What goes wrong:**
Tests pass but application is unusable by screen readers.

**Why it happens:**

- Focus on functionality only
- Don't know ARIA roles
- Using `data-testid` everywhere (skips accessibility)

**Consequences:**

- Accessibility bugs slip through
- Non-compliant with WCAG
- Excludes disabled users

**Prevention:**

```javascript
// ✅ GOOD - Accessibility-first queries
cy.getByRole('button', { name: /submit/i }).click();
cy.getByLabelText('Email address').type('test@example.com');
cy.getByRole('alert').should('contain', 'Invalid email');

// Use data-testid only when necessary (icons, decorative elements)
cy.get('[data-testid="close-icon"]').click();
```

Install `eslint-plugin-jsx-a11y` to catch accessibility issues.

**Detection:**

- No `getByRole` usage in tests
- All selectors use `data-testid`
- No accessibility testing in CI

---

## Phase-Specific Warnings

| Phase Topic             | Likely Pitfall                                   | Mitigation                                                         |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| **Test Setup**          | Installing Cypress but not configuring `baseUrl` | Set `baseUrl` in `cypress.config.js` to avoid reload on every test |
| **Writing First Tests** | Using `cy.wait(number)` instead of assertions    | Use `.should()` for automatic retries                              |
| **Test Organization**   | Creating one test per assertion                  | Combine into user journey tests with multiple assertions           |
| **Test Data**           | Hardcoding test data in every test               | Create fixtures or use factories                                   |
| **CI/CD Integration**   | Running tests serially                           | Use Cypress Cloud or parallelization                               |
| **Selector Strategy**   | Using CSS classes or element tags                | Add `data-testid` attributes to interactive elements               |
| **Authentication**      | Testing real OAuth flows                         | Stub authentication or use `cy.session()`                          |

---

## Vanilla JS Specific Considerations

### Challenge 1: No Component Boundaries

**Problem:** Framework apps (React/Vue) have component tests. Vanilla JS doesn't have clear boundaries.

**Solution:**

- Focus E2E tests on user workflows (not components)
- Use integration tests for modules (Vitest handles this)
- Add `data-testid` to DOM elements for stable selectors

### Challenge 2: DOM Manipulation in Tests

**Problem:** Tests might use `document.querySelector` or directly manipulate DOM.

**Solution:**

```javascript
// ❌ BAD - Direct DOM manipulation (bypasses Cypress retry)
const button = document.querySelector('[data-testid="submit"]');
button.click();

// ✅ GOOD - Cypress command (retries, waits for element)
cy.get('[data-testid="submit"]').click();
```

### Challenge 3: Global State Management

**Problem:** Vanilla JS apps often rely on global variables or simple state management.

**Solution:**

- Reset state in `beforeEach` by reloading page or calling reset functions
- Avoid relying on `localStorage` between tests (clear in `beforeEach`)
- Test state management through UI, not internal variables

---

## Testing Anti-Patterns to Avoid

| Anti-Pattern               | Why Bad                             | Alternative                          |
| -------------------------- | ----------------------------------- | ------------------------------------ |
| **Using `pause()`**        | Waits arbitrary time, not resilient | Use assertions with built-in retries |
| **Single-assertion tests** | E2E overhead for each test          | Combine into journey tests           |
| **Testing 3rd party auth** | Slow, unreliable, captchas          | Stub or use `cy.request()`           |
| **CSS selectors**          | Brittle to style changes            | Use `data-testid` or ARIA roles      |
| **`afterEach` cleanup**    | Doesn't run on refresh              | Reset state in `beforeEach`          |
| **Over-mocking**           | False confidence                    | Test real integrations               |
| **Testing implementation** | Breaks on refactor                  | Test user behavior                   |
| **Hard-coded waits**       | Flaky on slow machines              | Use retry-ability                    |

---

## Sources and Verification

| Source                                                                                                       | Confidence | Notes                                                         |
| ------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------- |
| [Cypress Best Practices](https://docs.cypress.io/guides/core-concepts/best-practices)                        | HIGH       | Official documentation, detailed examples                     |
| [Cypress Retry-ability](https://docs.cypress.io/guides/core-concepts/retry-ability)                          | HIGH       | Official docs explaining core mechanism                       |
| [Testing Library Intro](https://testing-library.com/docs/dom-testing-library/intro/)                         | HIGH       | Official docs, philosophy aligns with industry best practices |
| [Write Tests - Kent C. Dodds](https://kentcdodds.com/blog/write-tests)                                       | HIGH       | Industry expert, widely cited, Testing Trophy creator         |
| [Testing Implementation Details - Kent C. Dodds](https://kentcdodds.com/blog/testing-implementation-details) | HIGH       | Expert guidance on avoiding brittle tests                     |
| [Common Mistakes - Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)    | HIGH       | Applicable to vanilla JS DOM Testing Library                  |
| [WebdriverIO Best Practices](https://webdriver.io/docs/bestpractices)                                        | MEDIUM     | Framework-specific but concepts transfer well                 |

**Verification methodology:**

- Cross-referenced multiple official sources (Cypress docs, Testing Library docs)
- Verified expert recommendations (Kent C. Dodds, Testing Library creator)
- Checked for contradictory advice (none found on core principles)
- Publication dates checked (all sources recent: 2018-2025)

---

## Gaps to Address

**Low-confidence areas (need phase-specific research):**

- Specific tools for vanilla JS (no framework-specific patterns)
- E2E testing for ES6 modules without bundlers
- Testing service workers in vanilla JS apps
- Performance testing integration with E2E tests

**Optional future research:**

- Visual regression testing strategies
- Accessibility testing automation (axe-core integration)
- Mobile/responsive testing patterns
- API testing alongside E2E (don't duplicate tests)
