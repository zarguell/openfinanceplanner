# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Runner:**

- Vitest - Modern JavaScript test framework
- Config: `vitest.config.js` in project root

**Assertion Library:**

- Vitest built-in expect
- Matchers: toBe, toEqual, toThrow, toHaveLength, toMatchObject

**Run Commands:**

```bash
npm test                              # Run all tests
npm test -- --watch                   # Watch mode
npm test -- path/to/file.test.js     # Single file
npm run test:coverage                 # Coverage report
npm run test:ui                      # Test UI interface
npm run lint                         # Run linting
npm run format                       # Format code
```

## Test File Organization

**Location:**

- Separate tests/ directory tree mirroring src/
- `tests/unit/` for isolated module tests
- `tests/integration/` for cross-component tests

**Naming:**

- Same name as source file with `.test.js` suffix
- No distinction between unit/integration in filename
- Integration tests in dedicated directory

**Structure:**

```
tests/
├── integration/         # Cross-component workflow tests
│   ├── full-flow.test.js
│   └── withdrawal-strategies-integration.test.js
├── unit/              # Isolated module tests
│   ├── core/
│   │   └── models/
│   ├── calculations/
│   ├── storage/
│   └── ui/
└── test-helper.js      # Shared test utilities
```

## Test Structure

**Suite Organization:**

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // reset state
    });

    it('should handle valid input', () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input');
    });
  });
});
```

**Patterns:**

- Use beforeEach for per-test setup, avoid beforeAll
- Use afterEach to restore mocks: vi.restoreAllMocks()
- Explicit arrange/act/assert comments in complex tests
- One assertion focus per test (multiple expects acceptable)

## Mocking

**Framework:**

- Vitest built-in mocking (vi)
- Module mocking via vi.mock() at top of test file

**Patterns:**

```javascript
import { vi } from 'vitest';
import { externalFunction } from './external';

// Mock module
vi.mock('./external', () => ({
  externalFunction: vi.fn(),
}));

describe('test suite', () => {
  it('mocks function', () => {
    const mockFn = vi.mocked(externalFunction);
    mockFn.mockReturnValue('mocked result');

    // test code using mocked function

    expect(mockFn).toHaveBeenCalledWith('expected arg');
  });
});
```

**What to Mock:**

- File system operations (localStorage in tests)
- External APIs (none currently)
- Environment variables (process.env)
- Browser APIs (DOM, console)

**What NOT to Mock:**

- Internal pure functions
- Simple utilities (string manipulation, array helpers)
- Business logic calculations

## Fixtures and Factories

**Test Data:**

```javascript
// Factory functions in test file
function createTestPlan(overrides = {}) {
  return {
    name: 'Test Plan',
    accounts: [],
    expenses: [],
    ...overrides,
  };
}

// Shared fixtures in test-helper.js
export const mockTaxData = {
  federal: {
    /* tax brackets */
  },
  state: {
    /* state tax */
  },
};
```

**Location:**

- Factory functions: define in test file near usage
- Shared fixtures: `tests/test-helper.js` for common utilities
- Mock data: inline in test when simple, factory when complex

## Coverage

**Requirements:**

- 50% minimum for lines, functions, branches, statements
- Coverage tracked for awareness, not enforcement
- Focus on critical paths (parsers, service logic)

**Configuration:**

- Vitest coverage via v8 (built-in)
- Report formats: text, json, html, lcov
- Coverage directory: `./coverage/`

**Exclusions:**

- Test files themselves (`**/*.test.js`)
- Test helpers (`**/test-helper.js`)
- Config files (`**/vitest.config.js`)
- Build directories (`node_modules/`, `dist/`, `.planning/`, `docs/`)

**View Coverage:**

```bash
npm run test:coverage
open coverage/index.html
```

## Test Types

**Unit Tests:**

- Test single function/class in isolation
- Mock all external dependencies (localStorage, DOM)
- Fast: each test <100ms
- Examples: Plan.test.js, StorageManager.test.js

**Integration Tests:**

- Test multiple modules together
- Mock only external boundaries (browser APIs)
- Examples: full-flow.test.js, withdrawal-strategies-integration.test.js

**E2E Tests:**

- Not currently implemented
- Manual testing for full application workflows

## Common Patterns

**Async Testing:**

```javascript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
```

**Error Testing:**

```javascript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null');
});

// Async error
it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('error message');
});
```

**DOM Mocking:**

```javascript
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;
```

**Snapshot Testing:**

- Not used in this codebase
- Prefer explicit assertions for clarity

---

_Testing analysis: 2026-01-16_
_Update when test patterns change_
