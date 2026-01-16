# Phase 5: Test Migration - Research

**Researched:** 2026-01-15
**Domain:** Vitest testing framework for ES6 modules without bundler
**Confidence:** HIGH

<research_summary>
## Summary

Researched migration from custom test runner to Vitest framework for vanilla JavaScript ES6 modules. Vitest 4.0 (October 2025) is the current version with native ES6 module support, Jest-compatible API, and can run standalone without Vite bundler.

Key finding: Migration is straightforward because Vitest was designed for this use case. The existing test structure (export functions, run directly with Node) maps cleanly to Vitest's describe/test pattern. Main work is rewriting assertions from custom `throw Error` to Vitest's `expect()` API.

**Primary recommendation:** Use Vitest 4.0 with Node environment, upgrade to jsdom environment for localStorage tests, migrate in three incremental plans (unit tests → integration tests → coverage).
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | 4.0+ | Test framework | Native ESM support, Jest-compatible, no bundler required |
| @vitest/coverage-v8 | 4.0+ | Code coverage | V8-based coverage, faster than Istanbul, built-in to Vitest |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| happy-dom | Latest | Browser environment simulation | For localStorage/DOM tests (lighter than jsdom) |
| jsdom | Latest | Browser environment simulation | Alternative to happy-dom (more mature) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest requires babel/regenerator for ESM, slower startup |
| V8 coverage | Istanbul coverage | V8 is faster and built-in, Istanbul has more features |
| Node environment | jsdom environment | Node is faster, use jsdom only when needed for browser APIs |

**Installation:**
```bash
# Already installed in Phase 1
npm install --save-dev vitest @vitest/coverage-v8

# For localStorage/browser API tests
npm install --save-dev happy-dom
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
tests/
├── unit/
│   ├── models/
│   │   ├── Plan.test.js       # Vitest format
│   │   ├── Account.test.js
│   │   └── Expense.test.js
│   ├── calculations/
│   │   ├── projection.test.js
│   │   └── tax.test.js
│   └── storage/
│       └── StorageManager.test.js
├── integration/
│   └── full-flow.test.js
├── setup.js                    # Test setup file (optional)
└── utils/
    └── test-helpers.js         # Shared test utilities
```

### Pattern 1: Basic Test Migration
**What:** Convert custom test functions to Vitest describe/test blocks
**When to use:** All test migrations
**Example:**
```javascript
// Source: Vitest official documentation
// Before (custom runner)
import { Plan } from '../../../src/core/models/Plan.js';

export function testPlanCreation() {
  const plan = new Plan('Test Plan', 35, 65);

  if (plan.name !== 'Test Plan') {
    throw new Error('Expected plan name to be "Test Plan"');
  }

  console.log('✓ testPlanCreation passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testPlanCreation();
}

// After (Vitest)
import { describe, it, expect } from 'vitest';
import { Plan } from '../../../src/core/models/Plan.js';

describe('Plan', () => {
  it('should create plan with correct name', () => {
    const plan = new Plan('Test Plan', 35, 65);
    expect(plan.name).toBe('Test Plan');
  });

  it('should generate ID on creation', () => {
    const plan = new Plan('Test Plan', 35, 65);
    expect(plan.id).toBeDefined();
  });

  it('should have no accounts initially', () => {
    const plan = new Plan('Test Plan', 35, 65);
    expect(plan.accounts).toHaveLength(0);
  });
});
```

### Pattern 2: Mocking Browser APIs (localStorage)
**What:** Use happy-dom environment or vi.stubGlobal for browser globals
**When to use:** Testing localStorage, DOM operations in Node environment
**Example:**
```javascript
// Source: Vitest mocking guide + community patterns
// Option 1: Use happy-dom environment (recommended)
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom', // or 'jsdom'
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.planning', 'docs'],
  },
});

// Tests work with real localStorage API
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageManager } from '../../../src/storage/StorageManager.js';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear(); // Works in happy-dom
  });

  it('should save plan to localStorage', () => {
    const plan = new Plan('Test', 35, 65);
    StorageManager.savePlan(plan);
    expect(localStorage.getItem('ofp_plan_' + plan.id)).toBeDefined();
  });
});

// Option 2: Use vi.stubGlobal for specific globals
import { vi, describe, it, expect } from 'vitest';

describe('StorageManager (manual mock)', () => {
  const mockStorage = new Map();

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => mockStorage.get(key) || null),
      setItem: vi.fn((key, value) => mockStorage.set(key, value)),
      removeItem: vi.fn((key) => mockStorage.delete(key)),
      clear: vi.fn(() => mockStorage.clear()),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should save plan to localStorage', () => {
    // Test with mocked localStorage
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
```

### Pattern 3: Mocking ES6 Modules
**What:** Use vi.mock() to replace module imports with mocks
**When to use:** Isolating dependencies, testing error cases
**Example:**
```javascript
// Source: Vitest official docs
import { describe, it, expect, vi } from 'vitest';
import { calculateProjection } from '../src/calculations/projection.js';

// Mock entire module
vi.mock('../src/calculations/tax.js', () => ({
  calculateFederalTax: vi.fn(() => 5000),
  calculateStateTax: vi.fn(() => 1000),
}));

describe('Projection', () => {
  it('should use mocked tax calculations', () => {
    const result = calculateProjection(plan, 10);
    // Test logic with mocked tax
  });
});

// Partial mock (preserve some exports)
vi.mock('../src/calculations/tax.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    calculateFederalTax: vi.fn(() => 5000), // override only this
  };
});
```

### Anti-Patterns to Avoid
- **Mixing test runners:** Don't keep custom test runner alongside Vitest - choose one
- **Import.meta.url checks:** Don't keep `if (import.meta.url === ...)` guards - Vitest handles test execution
- **Manual console.log assertions:** Use `expect()` instead of console.log checks
- **Not clearing mocks:** Always use vi.clearAllMocks() or restoreMocks config
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test runner | Custom Node.js script with import.meta.url checks | Vitest | Test execution, parallelization, watch mode built-in |
| Assertion library | Custom throw Error checks | Vitest's expect() API | Better error messages, matchers, negation |
| Mock functions | Custom stub implementations | vi.fn(), vi.mock() | Spies, call tracking, return value manipulation |
| localStorage mock | Manual Map-based stub | happy-dom environment | Real localStorage API, all methods supported |
| Coverage tool | Custom script with istanbul | @vitest/coverage-v8 | Built-in, faster V8 engine, multiple reporters |
| Test globals | Manual global setup | globals: true in config | Auto-import describe/it/expect everywhere |

**Key insight:** Testing infrastructure has 20+ years of tooling evolution. Vitest implements modern best practices (ESM support, parallel execution, smart module caching). Custom test runners always lack features you'll need later (snapshots, async testing, coverage integration).
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Import Meta URL Direct Execution Guards
**What goes wrong:** Tests have `if (import.meta.url === file://${process.argv[1]})` guards that never execute in Vitest
**Why it happens:** Custom runner used this pattern to allow direct execution with Node.js
**How to avoid:** Remove all execution guards - Vitest discovers and runs tests automatically
**Warning signs:** Tests appear to pass but nothing actually runs, 0 tests executed

### Pitfall 2: Module Resolution Errors
**What goes wrong:** Cannot find module './src/models/Plan.js'
**Why it happens:** Vitest resolves imports relative to test file location
**How to avoid:** Use correct relative paths: `import { Plan } from '../../../src/core/models/Plan.js'`
**Warning signs:** Error: "Cannot find module" or "Unknown file extension"

### Pitfall 3: Mocking ES Modules Before Import
**What goes wrong:** Trying to mock module that was already imported at top of file
**Why it happens:** vi.mock() is hoisted, but must be called before imports
**How to avoid:** Place vi.mock() calls at top of file, before any imports
**Warning signs:** Mock not applied, original module code executes

### Pitfall 4: Missing Browser Globals in Node Environment
**What goes wrong:** ReferenceError: localStorage is not defined
**Why it happens:** Vitest defaults to Node environment, doesn't have browser globals
**How to avoid:** Set `environment: 'happy-dom'` in vitest.config.js for browser API tests
**Warning signs:** Tests fail with "X is not defined" for window, localStorage, etc.

### Pitfall 5: Expect vs Custom Assertion Confusion
**What goes wrong:** Mixing old throw Error patterns with expect()
**Why it happens:** Incomplete migration, some tests still use custom assertions
**How to avoid:** Migrate all assertions to expect() - remove throw Error completely
**Warning signs:** Inconsistent test styles, some tests console.log instead of assert
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Basic Vitest Configuration (Standalone)
```javascript
// Source: Vitest official docs
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // or 'happy-dom' for browser APIs
    globals: true,       // auto-import describe/it/expect
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.planning', 'docs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '.planning', 'docs'],
    },
  },
});
```

### Test Migration Example
```javascript
// Source: Vitest migration guide + project context
// Before: tests/unit/models/Plan.test.js (custom runner)
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

if (import.meta.url === `file://${process.argv[1]}`) {
  testPlanCreation();
}

// After: tests/unit/models/Plan.test.js (Vitest)
import { describe, it, expect } from 'vitest';
import { Plan } from '../../../src/core/models/Plan.js';

describe('Plan', () => {
  describe('Creation', () => {
    it('should create plan with correct name', () => {
      const plan = new Plan('Test Plan', 35, 65);
      expect(plan.name).toBe('Test Plan');
    });

    it('should generate unique ID on creation', () => {
      const plan = new Plan('Test Plan', 35, 65);
      expect(plan.id).toBeDefined();
      expect(typeof plan.id).toBe('string');
    });

    it('should initialize with empty accounts array', () => {
      const plan = new Plan('Test Plan', 35, 65);
      expect(plan.accounts).toEqual([]);
      expect(plan.accounts.length).toBe(0);
    });
  });
});
```

### Async Test Pattern
```javascript
// Source: Vitest official docs
import { describe, it, expect } from 'vitest';
import { StorageManager } from '../../../src/storage/StorageManager.js';

describe('StorageManager', () => {
  it('should save and load plan asynchronously', async () => {
    const plan = new Plan('Test', 35, 65);

    await StorageManager.savePlan(plan);
    const loaded = await StorageManager.loadPlan(plan.id);

    expect(loaded).toEqual(plan);
    expect(loaded.name).toBe('Test');
  });
});
```

### Coverage Configuration
```javascript
// Source: Vitest coverage guide
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}

// vitest.config.js (coverage settings)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '.planning/',
        'docs/',
        '**/*.test.js',
        '**/test-helper.js',
      ],
      // Optional: Set coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest with babel for ESM | Vitest native ESM | 2022+ | No babel needed, faster startup, native module support |
| Custom test runners | Vitest standalone mode | 2023+ | No Vite required, dedicated vitest.config.js |
| Manual module mocking | vi.mock() with hoisting | Vitest 1.0+ | Cleaner mock API, works with ES6 imports |
| jsdom for browser env | happy-dom alternative | 2024+ | Lighter weight, faster, more modern DOM impl |
| Vitest 3.x | Vitest 4.0 | October 2025 | Easier migrations, better ESM handling, tinypool worker management |

**New tools/patterns to consider:**
- **Vitest Browser Mode (2025):** Run tests in real browser for true localStorage/DOM - no mocking needed
- **@vitest/ui:** Interactive test UI for debugging failed tests
- **tinypool:** Worker pool management in Vitest 4.0 for better parallelization

**Deprecated/outdated:**
- **Jest for ESM projects:** Requires babel/regenerator, slower startup - use Vitest instead
- **Custom import.meta.url guards:** Vitest handles test execution, remove these patterns
- **Istanbul coverage:** V8 coverage is faster and built-in - use v8 provider
</sota_updates>

<open_questions>
## Open Questions

None - all research questions resolved with high confidence from Context7 and official documentation.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- /vitest-dev/vitest - Configuration, ES6 modules, mocking, coverage, migration guide
- Vitest official documentation (vitest.dev) - Getting started, mocking, browser mode

### Secondary (MEDIUM confidence)
- Vitest 4.0 release blog (October 2025) - Migration improvements, tinypool worker management
- Vitest coverage guide - V8 vs Istanbul, reporter configuration
- Community migration guides (Angular, React, Svelte) - Verified patterns against official docs

### Tertiary (LOW confidence - needs validation)
- None - all findings verified with Context7 or official documentation
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Vitest 4.0 for ES6 module testing
- Ecosystem: @vitest/coverage-v8, happy-dom, jsdom
- Patterns: Test migration, module mocking, browser environment setup
- Pitfalls: Import resolution, browser globals, mock hoisting

**Confidence breakdown:**
- Standard stack: HIGH - verified with Context7 and official docs
- Architecture: HIGH - from official Vitest examples and migration guides
- Pitfalls: HIGH - documented in official docs and community discussions
- Code examples: HIGH - from official Context7 sources

**Research date:** 2026-01-15
**Valid until:** 2026-02-15 (30 days - Vitest ecosystem stable with 4.0 release)
</metadata>

---

*Phase: 05-test-migration*
*Research completed: 2026-01-15*
*Ready for planning: yes*
