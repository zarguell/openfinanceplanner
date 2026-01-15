# Coding Conventions

**Analysis Date:** 2026-01-15

## Naming Patterns

**Files:**

- PascalCase.js for domain models (Plan.js, Account.js, Expense.js)
- PascalCase.js for rules (RothConversionRule.js, QCDRule.js)
- kebab-case.js for calculations (projection.js, tax.js, monte-carlo.js)
- PascalCase.js for UI (AppController.js, ChartRenderer.js)
- \*.test.js for test files alongside source
- kebab-case.css for styles (variables.css, base.css)

**Functions:**

- camelCase for all functions (addAccount, calculateExpenseForYear)
- No special prefix for async functions (all functions sync)
- onEventName pattern for event handlers (if needed)

**Variables:**

- camelCase for variables (totalBalance, annualContribution)
- UPPER_SNAKE_CASE for constants (CURRENT_SCHEMA_VERSION, STORAGE_KEYS)

**Types:**

- PascalCase for classes (Plan, Account, BaseRule)
- No interfaces (plain JavaScript, no TypeScript)

## Code Style

**Formatting:**

- No Prettier config (manual consistency)
- 100 character line length (generally)
- Single quotes for strings
- Semicolons required after statements
- 2-space indentation (not tabs)

**Linting:**

- No ESLint config (manual code consistency)
- No automated linting tools
- Manual code review for style adherence

## Import Organization

**Order:**

1. External packages (rare - only Chart.js via CDN)
2. Internal modules (relative imports with ./)
3. Type imports (not applicable - no TypeScript)

**Grouping:**

- No blank lines between imports typically
- Alphabetical within groups (not strictly enforced)

**Path Aliases:**

- No path aliases (direct relative imports only)

## Error Handling

**Patterns:**

- Throw errors for invalid inputs
- console.error for logging without user feedback
- Inconsistent error handling across files
- No centralized error boundary

**Error Types:**

- Throw on invalid input, schema validation failures
- Console.error for storage errors
- No custom error classes
- No user-facing error messages

## Logging

**Framework:**

- Browser console only (console.log, console.error, console.warn)
- No structured logging
- No log levels (debug, info, etc.)

**Patterns:**

- Console.log for debugging
- Console.error for errors
- No logging service integration

## Comments

**When to Comment:**

- Explain why, not what (business logic, complex calculations)
- Document non-obvious financial rules
- JSDoc for public methods

**JSDoc/TSDoc:**

- Required for public API methods (StorageManager, domain models)
- Use @param, @returns tags
- Clear descriptions of business logic

**TODO Comments:**

- Format: // TODO: description
- No issue tracking links (manual TODOs)

## Function Design

**Size:**

- Keep under 50 lines when possible
- Extract helpers for complex logic
- Large files exist (tax.js: 2,296 lines, AppController.js: 1,347 lines)

**Parameters:**

- Max 3-4 parameters (more if object parameter)
- No destructuring in parameter list typically

**Return Values:**

- Explicit returns preferred
- Early returns for guard clauses (some inconsistency)

## Module Design

**Exports:**

- Named exports preferred (export class, export function)
- Default exports not used (ES6 module pattern)
- No barrel files (direct imports)

**Barrel Files:**

- No index.js/index.ts barrel files
- Direct imports from specific files
- No circular dependency issues

---

_Convention analysis: 2026-01-15_
_Update when patterns change_
