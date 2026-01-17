# Open Finance Planner - AI Assistant Guide

This document provides context for AI assistants (Claude, Copilot, etc.) working on the Open Finance Planner codebase.

## Project Overview

Open Finance Planner is a client-side financial planning application that runs entirely in the browser with zero external dependencies. The codebase uses vanilla JavaScript ES6 modules with a layered architecture.

**Core value:** Make the codebase maintainable for long-term evolution - split monolithic files, centralize configuration, and add quality tooling without breaking existing functionality.

## Development History

### Phase 1: Tooling Setup (2025-01-15)
- Added ESLint 9.x with flat config (not legacy .eslintrc.js)
- Added Prettier for code formatting
- Defer fixing ESLint issues to later phases (fix during refactoring)
- Decision: Keep existing custom test runner until Phase 5

### Phase 2: Configuration Centralization (2025-01-15)
- Created centralized configuration system in `config/` directory
- Extracted hardcoded values to JSON files (limits.json, ages.json, defaults.json)
- Created accessor functions for clean API (getContributionLimit, getRMDStartAge, etc.)
- Decision: Use embedded data objects in loader.js for ES6 compatibility

### Phase 3: UI Controller Extraction (2025-01-15)
- Split monolithic AppController (1,444 lines → 314 lines, 78% reduction)
- Extracted PlanController for plan management (delegation pattern)
- Extracted AccountController for account CRUD operations
- Extracted ExpenseIncomeController for expenses and income
- Extracted ProjectionController for projection and Monte Carlo rendering
- Decision: Keep AppController delegator methods for backward compatibility
- Fixed duplicate method definitions bug during extraction

### Phase 4: Tax Module Refactoring (2025-01-15)
- Split tax.js (2,296 lines) into focused modules
- Created federal.js for federal tax calculations
- Created states.js for state tax calculations (all 50 states)
- Created tax/config/ directory with centralized tax configuration
- Extracted state tax data to states-2024.js and states-2025.js
- Decision: Statutory rates kept in calculation files, user defaults in Plan model

### Phase 5: Test Migration (2026-01-17)
- Migrated from custom test runner to Vitest framework
- Migrated 27 test files, 308 tests successfully
- Added coverage reporting with @vitest/coverage-v8
- Configured 4 reporters: text, json, html, lcov
- Set coverage thresholds at 50% (below current 57%)
- Created GitHub Actions CI workflow for automated testing
- Decision: Use Vitest (not Jest) for ES6 module compatibility

### Phase 6: Validation & Polish (2026-01-17)
- Fixed ESLint configuration for browser environment
- Added browser globals for UI files (document, window, alert, etc.)
- Resolved 193 ESLint errors related to missing browser globals
- Updated project documentation (README.md, CLAUDE.md)
- All functionality verified working

## Architecture

### Modular Structure

The codebase has been refactored from monolithic files into focused modules:

**Tax Calculations** (split from 2,296-line tax.js):
- `src/calculations/tax/federal.js` - Federal tax calculations
- `src/calculations/tax/states.js` - State tax calculations (all 50 states)
- `src/calculations/tax/config/` - Centralized tax configuration
  - `states-2024.js` - 2024 tax year data
  - `states-2025.js` - 2025 tax year data
  - `loader.js` - Config loader and accessor functions

**UI Controllers** (split from 1,444-line AppController):
- `src/ui/AppController.js` (314 lines) - Main coordinator
- `src/ui/PlanController.js` - Plan management
- `src/ui/AccountController.js` - Account CRUD operations
- `src/ui/ExpenseIncomeController.js` - Expenses and income management
- `src/ui/ProjectionController.js` - Projection rendering

**Centralized Configuration**:
- `config/limits.json` - Contribution limits, catch-up limits, QCD limits
- `config/ages.json` - RMD start ages, Social Security ages
- `config/defaults.json` - Default tax rates, growth rates
- `config/loader.js` - Config accessor functions

### Layered Design

```
src/
├── core/
│   ├── models/        # Domain models (Plan, Account, Expense, Income)
│   └── rules/         # Strategy pattern for financial rules
├── calculations/      # Pure calculation functions
│   ├── tax/          # Modular tax calculations
│   │   ├── federal.js
│   │   ├── states.js
│   │   └── config/   # Centralized config
│   ├── projection.js
│   ├── monte-carlo.js
│   └── ...
├── config/            # Centralized configuration
├── storage/           # localStorage with versioning
├── ui/                # Modular UI controllers
└── styles/            # Modular CSS
```

## Testing

### Framework: Vitest (v4.0.17)
- 27 test files, 308 tests passing
- Coverage: ~57% statements (above 50% threshold)
- Coverage providers: @vitest/coverage-v8 (built-in V8)

### Coverage by Area:
- `src/calculations`: 89% statements (excellent)
- `src/core/models`: 91% statements (excellent)
- `src/core/rules`: 82% statements (good)
- `src/storage`: 45% statements (needs improvement)
- `src/ui`: 6.98% statements (expected - browser-based, hard to test)

### Running Tests:
```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
npm run test:ui       # Interactive test debugging
```

### ESLint Configuration:
- ESLint 9.x with flat config
- Browser globals configured for `src/ui/**/*.js`
- Node.js globals for test files
- Chart.js global for CDN-loaded dependency

## Configuration System

### Accessor Functions
All configuration values accessed through accessor functions:

```javascript
import { getContributionLimit, getRMDStartAge } from './config/loader.js';

// Contribution limits
getContributionLimit('401k', year)
getContributionLimit('ira', year)
getContributionLimit('catchUp401k', year)
getContributionLimit('catchUpIRA', year)

// Age thresholds
getRMDStartAge(year)
getSocialSecurityFullRetirementAge(birthYear)

// Defaults
getDefaultTaxRate(type)
getDefaultGrowthRate(type)
```

### Configuration Files:
- `config/limits.json` - Statutory and custom limits
- `config/ages.json` - Age-based thresholds
- `config/defaults.json` - Default rates and percentages

### Tax Configuration:
- `src/calculations/tax/config/states-2024.js` - 2024 state tax data
- `src/calculations/tax/config/states-2025.js` - 2025 state tax data
- `src/calculations/tax/config/loader.js` - Tax config accessors

## Key Principles

1. **Preserve Architectural Strengths** - Maintain layered design and domain-driven patterns
2. **No Breaking Changes** - Maintain backward compatibility with localStorage schema
3. **Configuration Over Code** - Centralize values, avoid hardcoding
4. **Test-First When Possible** - Write tests before refactoring critical paths
5. **Incremental Refactoring** - Split files, then extract config, then add tools
6. **Centralize Configuration** - Use config system for all user-customizable values
7. **Test First, Refactor Second** - Write tests before refactoring to prevent regressions

## Current Challenges

### Resolved:
- ✅ Monolithic files (tax.js, AppController) split into focused modules
- ✅ Hardcoded values centralized in configuration system
- ✅ No linting/formatted tooling (ESLint 9, Prettier added)
- ✅ No testing framework (Vitest migrated, 308 tests passing)
- ✅ ESLint browser globals (fixed in Phase 6)

### Optional Future Work:
- Increase test coverage in storage and UI modules
- Add tests for monte-carlo.js (currently 0% coverage)
- Raise coverage thresholds as baseline improves
- Configure Codecov integration for coverage tracking

## localStorage Schema

The application uses localStorage with schema versioning:
- Schema version tracked in `src/storage/schema.js`
- Migration path for breaking changes
- All data stays client-side (privacy-first)

## Development Workflow

### Before Making Changes:
1. Read relevant tests to understand expected behavior
2. Check if accessor functions exist for values you need
3. Review related modules to understand dependencies

### When Adding Features:
1. Write tests first (TDD approach)
2. Use config accessor functions, not hardcoded values
3. Follow modular structure (split large files)
4. Run `npm run lint` and `npm test` before committing

### When Refactoring:
1. Ensure tests pass before refactoring
2. Make small, incremental changes
3. Commit frequently (one logical change per commit)
4. Run tests after each commit

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
- Triggers: Push to main, all PRs
- Steps: Lint → Test with coverage → Upload coverage
- Fails if: Tests fail, linter errors, coverage < 50%

## External Dependencies

**Chart.js** (via CDN only):
- Loaded in `index.html`
- No npm packages (zero-dependency approach)
- ESLint configured with `Chart: 'readonly'` global

## Browser Support

- Chrome 90+, Firefox 88+, Safari 14+
- ES2020+ with ES6 modules
- No TypeScript migration yet

## Code Style

- ESLint enforces: single quotes, semicolons, 2-space indent
- Prettier for consistent formatting
- Use `const` over `let` (enforced by ESLint)
- Avoid unused variables (warned by ESLint)

## Common Patterns

### Config Access:
```javascript
// GOOD
import { getContributionLimit } from './config/loader.js';
const limit = getContributionLimit('401k', year);

// BAD
const limit = 23000; // Hardcoded
```

### Controller Delegation:
```javascript
// AppController delegates to specialized controllers
this.planController.updatePlanName(name);
this.accountController.addAccount(account);
```

### Test Structure:
```javascript
import { describe, it, expect } from 'vitest';
import { calculateTax } from './tax.js';

describe('Tax calculations', () => {
  it('should calculate federal tax correctly', () => {
    const result = calculateTax(50000, 2024);
    expect(result.federal).toBeGreaterThan(0);
  });
});
```

## Getting Started

1. **Run tests**: `npm test`
2. **Check coverage**: `npm run test:coverage`
3. **Lint code**: `npm run lint`
4. **Format code**: `npm run format`
5. **Start dev server**: `npm run serve`

## Questions?

See project documentation:
- `.planning/PROJECT.md` - Project requirements and decisions
- `.planning/ROADMAP.md` - Development phases
- `.planning/STATE.md` - Current position and progress

---

_Last updated: 2026-01-17 (Phase 6 complete)_
