# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**

- PascalCase.js for classes: `AppController.js`, `Plan.js`, `StorageManager.js`
- camelCase.js for modules: `projection.js`, `loader.js`
- kebab-case.json for configuration: `defaults.json`, `limits.json`
- kebab-case.css for styles: `base.css`, `components.css`
- \*.test.js for test files alongside source

**Functions:**

- camelCase for all functions: `addAccount`, `generateId`, `calculateFederalTax`
- No special prefix for async functions
- handleEventName pattern for event handlers: `handleClick`, `handleSubmit`

**Variables:**

- camelCase for variables: `currentPlan`, `projectionResults`, `annualContribution`
- UPPER_SNAKE_CASE for constants: CSS variables like `--color-primary`
- No underscore prefix for private members

**Types:**

- PascalCase for classes: `Plan`, `Account`, `StorageManager`
- No TypeScript interfaces (pure JavaScript)
- Enums not used (JavaScript objects for constants)

## Code Style

**Formatting:**

- Prettier with `.prettierrc.json`
- 100 character line length
- Single quotes for strings
- Semicolons required
- 2 space indentation
- ES5 trailing commas

**Linting:**

- ESLint with `eslint.config.js`
- Modern flat configuration
- Custom rules for quotes, semicolons, indentation
- Run: `npm run lint`

## Import Organization

**Order:**

1. External packages (none currently)
2. Internal modules (relative imports)
3. No type imports (JavaScript)

**Grouping:**

- Blank line between import groups
- Alphabetical within each group
- No path aliases used

**Path Aliases:**

- No path aliases configured
- Uses relative imports throughout

## Error Handling

**Patterns:**

- Inconsistent - some areas handle errors, others don't
- Mix of try/catch and direct parsing without validation
- Limited error propagation to users

**Error Types:**

- Missing error handling in user input parsing (`src/ui/AccountController.js:163-164`)
- Some strategy files log errors but don't propagate to caller
- No custom error classes defined

**Logging:**

- Console logging in strategy files (`console.error`)
- No structured logging framework
- Errors sometimes logged but not always propagated

## Logging

**Framework:**

- Browser console only (console.log, console.error)
- No external logging services

**Patterns:**

- Informal logging throughout codebase
- Some error logging in strategy files
- No structured logging with context

## Comments

**When to Comment:**

- JSDoc comments for classes and methods (`src/core/models/Plan.js`)
- File headers with brief purpose description (`src/ui/AppController.js`)
- Inline comments used sparingly for complex business logic

**JSDoc/TSDoc:**

- Comprehensive JSDoc for classes and public methods
- Documented parameters and return values
- Examples: `src/core/models/Plan.js`, `src/rules/RuleInterface.js`

**TODO Comments:**

- No TODO comments found in current analysis
- Legacy TODO comments may exist in older code

## Function Design

**Size:**

- Functions vary widely in size
- Some large functions (>200 lines) that could be extracted
- Strategy for extracting helpers not consistently applied

**Parameters:**

- No parameter limit enforced
- Some functions accept many parameters
- Destructuring used inconsistently

**Return Values:**

- Explicit return statements preferred
- Some functions use implicit returns
- Return early patterns used inconsistently

## Module Design

**Exports:**

- Named exports preferred throughout
- ES6 module syntax used consistently
- Default exports rarely used

**Barrel Files:**

- `src/core/models/index.js` for model exports
- `src/core/rules/index.js` for rule exports
- Avoids circular dependencies

---

_Convention analysis: 2026-01-16_
_Update when patterns change_
