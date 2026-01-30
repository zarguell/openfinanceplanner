# Open Finance Planner - Agent Guidelines

## Commands

```bash
# Development
npm run serve          # Start dev server on port 3030

# Testing (Vitest)
npm test               # Run all tests
npm run test:coverage  # Run with coverage (threshold: 50%)
npm run test:ui        # Interactive test debugging
npx vitest run tests/unit/models/Plan.test.js     # Run single test file
npx vitest run -t "should create plan"            # Run single test by name

# Linting & Formatting
npm run lint           # Run ESLint (zero errors allowed)
npm run format         # Format with Prettier
```

## Code Style

### Formatting (Prettier)

- Single quotes, semicolons required
- 2-space indentation, no tabs
- Trailing commas (ES5 style)
- 100 character print width
- Arrow functions always use parentheses
- LF line endings

### ESLint Rules

- `const` over `let` (enforced)
- No `var` (enforced)
- No unused variables (warn, except `_` prefixed args)
- Console allowed (no-trace: off)
- Strict `no-undef` checking
- ES2020+ modules

### Naming Conventions

- **Files**: camelCase.js (e.g., `PlanController.js`, `tax-loss-harvesting.test.js`)
- **Classes**: PascalCase (e.g., `Plan`, `Account`, `Income`)
- **Functions/Variables**: camelCase (e.g., `calculateTax`, `getContributionLimit`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants
- **Private methods**: Prefix with `_` or use closure pattern

### Imports

- Always use `.js` extensions for ES6 modules
- Prefer named exports over default exports
- Group imports: external → internal → relative
- Example: `import { Plan } from '../../../src/core/models/Plan.js'`

### Architecture Patterns

- **Layered design**: models → calculations → ui
- **Configuration over code**: Use `config/loader.js` accessors, never hardcode values
- **Delegation pattern**: AppController delegates to specialized controllers
- **Pure functions**: Calculation modules have no side effects
- **Domain models**: Plan, Account, Expense, Income with `toJSON()`/`fromJSON()` methods

### Error Handling

- Use JSDoc types for function parameters
- Validate inputs at function boundaries
- Return sensible defaults rather than throwing when possible
- Log errors to console for debugging (console is allowed)

### Browser Globals

Available in UI/storage/rules/calculations files:

- `document`, `window`, `alert`, `confirm`, `localStorage`
- `Chart` (Chart.js from CDN)

### Testing Guidelines

- Use Vitest (`describe`, `it`, `expect`)
- Import from `vitest` explicitly in test files
- Tests located in `tests/unit/` (mirrors src structure) and `tests/integration/`
- Follow naming: `*.test.js`
- Mock external dependencies, test pure functions thoroughly

## Key Principles

1. **No breaking changes** - Maintain localStorage schema compatibility
2. **Test first** - Write tests before refactoring critical paths
3. **Centralize config** - Use accessor functions from `config/loader.js`
4. **Split large files** - Keep files under 400 lines, extract focused modules
5. **Run lint and test before committing** - Zero ESLint errors, all tests passing

## Project Structure

```
src/
├── core/models/         # Domain models (Plan, Account, Expense, Income)
├── core/rules/          # Financial strategy rules
├── calculations/        # Pure calculation functions
│   ├── tax/            # Federal and state tax modules
│   ├── projection.js
│   └── monte-carlo.js
├── config/             # Centralized configuration (JSON + loader.js)
├── storage/            # localStorage with versioning
└── ui/                 # Modular UI controllers
```

## CI/CD

GitHub Actions runs on push/PR:

1. ESLint check (must pass)
2. Vitest with coverage (must pass, >50% threshold)
3. Coverage report upload
