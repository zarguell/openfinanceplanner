# Testing Patterns

**Analysis Date:** 2026-01-15

## Test Framework

**Runner:**

- Custom test runner - Plain JavaScript with assert-style testing
- Direct Node.js execution pattern: `if (import.meta.url === \`file://${process.argv[1]}\`)`
- No formal testing framework (no Jest, Mocha, Vitest)

**Assertion Library:**

- Manual assertions (if statements with throw on failure)
- Example: `if (plan.name !== 'Test Plan') { throw new Error('Expected...'); }`

**Run Commands:**

```bash
node tests/unit/models/Plan.test.js              # Run specific test file
node tests/integration/full-flow.test.js        # Run integration test
npm test                                        # Placeholder (TBD)
```

## Test File Organization

**Location:**

- tests/unit/ - Unit tests alongside source structure
- tests/integration/ - Integration tests for workflows
- Not collocated with source (separate tests/ directory)

**Naming:**

- \*.test.js for all test files
- Descriptive names (full-flow.test.js, roth-conversions-integration.test.js)

**Structure:**

```
tests/
  unit/
    models/              # Domain model tests
      Plan.test.js
      Account.test.js
    calculations/        # Calculation function tests
      projection.test.js
      tax.test.js
    rules/              # Rule engine tests
      BackdoorRothRule.test.js
  integration/
    full-flow.test.js   # Complete application workflow
    roth-conversions-integration.test.js
```

## Test Structure

**Suite Organization:**

```javascript
export function testPlanCreation() {
  // arrange
  const plan = new Plan('Test Plan', 35, 65);

  // act
  plan.addAccount(account401k);

  // assert
  if (plan.accounts.length !== 1) {
    throw new Error('Expected 1 account');
  }

  console.log('✓ testPlanCreation passed');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPlanCreation();
}
```

**Patterns:**

- No setup/teardown (beforeEach, afterEach not used)
- Manual test execution order
- Explicit console.log for test pass confirmation
- throw Error for test failures

## Mocking

**Framework:**

- No mocking framework (manual mocking only)
- Manual stubs for external dependencies (localStorage)

**Patterns:**

```javascript
// Mock localStorage (manual)
global.localStorage = {
  getItem: () => JSON.stringify(mockData),
  setItem: () => {},
  // ...
};

// Mock in test before calling function under test
```

**What to Mock:**

- Browser APIs (localStorage, window, document)
- External dependencies (Chart.js)

**What NOT to Mock:**

- Pure functions (test them directly)
- Domain models (use real instances)

## Fixtures and Factories

**Test Data:**

```javascript
// Inline test data
const plan = new Plan('Test Plan', 35, 65);
const account401k = new Account('My 401k', '401k', 100000);
```

**Location:**

- Inline in test files (no shared fixtures directory)
- No factory functions (manual object creation)

## Coverage

**Requirements:**

- No enforced coverage target
- Coverage tracked for awareness
- High coverage for core domain models and calculations

**Configuration:**

- No coverage tool (manual assessment)
- No coverage reports

**View Coverage:**

```bash
# Not available - no coverage tool
```

## Test Types

**Unit Tests:**

- Test single function or class in isolation
- Mock external dependencies (localStorage)
- Examples: Plan.test.js, projection.test.js

**Integration Tests:**

- Test multiple modules together
- Full workflow tests from UI to storage
- Examples: full-flow.test.js (complete application workflow)

**E2E Tests:**

- Not used (no E2E test framework)
- Manual browser testing required

## Common Patterns

**Async Testing:**

```javascript
// Not applicable - all tests are synchronous
// No async/await in tests
```

**Error Testing:**

```javascript
// Error test pattern
export function testInvalidInput() {
  try {
    const plan = new Plan('', 35, 65); // Invalid name
    throw new Error('Should have thrown error');
  } catch (error) {
    if (error.message !== 'Plan name is required') {
      throw new Error('Wrong error message');
    }
  }

  console.log('✓ testInvalidInput passed');
}
```

**Snapshot Testing:**

- Not used (no snapshot framework)

---

_Testing analysis: 2026-01-15_
_Update when test patterns change_
