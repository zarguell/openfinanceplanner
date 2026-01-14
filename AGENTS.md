# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open Finance Planner is a client-side financial planning application that runs entirely in the browser with zero dependencies. The application uses a modular ES6 module architecture with clear separation between domain logic, calculations, storage, and UI.

## Tech Stack

- **Pure Vanilla JavaScript (ES2020+) ES6 Modules** - No build process, no framework dependencies
- **localStorage with versioning** - All data persistence (5-10MB limit per domain)
- **CSS Custom Properties** - Theming with dark mode support via `@media (prefers-color-scheme: dark)`
- **Pure functions for calculations** - Testable, side-effect-free projection logic

## Running the Application

Open `index.html` in a modern browser (Chrome 90+, Firefox 88+, Safari 14+).

For development with auto-reload:
```bash
npm run serve  # Runs python3 HTTP server on port 3030
```

Running tests:
```bash
# Run specific test file
node tests/unit/models/Plan.test.js

# Run all tests (placeholder - test framework TBD)
npm test
```

## Architecture

### Directory Structure

```
openfinanceplanner/
├── index.html                    # Main HTML entry point
├── src/
│   ├── core/                     # Domain models (pure business logic)
│   │   └── models/
│   │       ├── Plan.js          # Plan aggregate root
│   │       ├── Account.js       # Account entity
│   │       └── Expense.js       # Expense entity
│   ├── calculations/             # Pure calculation functions
│   │   └── projection.js        # Projection calculations
│   ├── storage/                  # Data persistence layer
│   │   ├── StorageManager.js    # localStorage operations
│   │   └── schema.js            # Schema validation & migrations
│   ├── ui/                       # UI controllers
│   │   └── AppController.js     # Main UI controller
│   └── styles/                   # CSS (imported in HTML)
│       ├── variables.css        # CSS custom properties
│       ├── base.css             # Reset & typography
│       ├── layout.css           # Layout styles
│       └── components.css       # Component styles
├── tests/
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
└── docs/                        # Documentation
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│         UI Controllers              │  ← Thin, delegates to domain
│    (src/ui/AppController.js)        │
├─────────────────────────────────────┤
│          Domain Layer               │  ← Core business logic
│   (src/core/models/Plan.js, etc.)   │
├─────────────────────────────────────┤
│      Calculation Layer              │  ← Pure functions
│  (src/calculations/projection.js)   │
├─────────────────────────────────────┤
│         Storage Layer               │  ← Persistence
│  (src/storage/StorageManager.js)    │
└─────────────────────────────────────┘
```

### Core Domain Models

All domain models are in `src/core/models/`:

#### `Plan` (src/core/models/Plan.js)
- Aggregate root for financial plans
- Contains: accounts, expenses, assumptions, tax profile
- Methods: `addAccount()`, `removeAccount()`, `addExpense()`, `removeExpense()`, `toJSON()`, `fromJSON()`
- Stores monetary values in cents (integers)

#### `Account` (src/core/models/Account.js)
- Represents individual accounts (401k, IRA, Roth, HSA, Taxable)
- Properties: `id`, `name`, `type`, `balance` (cents), `annualContribution`, `withdrawalRate`
- Immutable ID generation

#### `Expense` (src/core/models/Expense.js)
- Models expense streams with inflation adjustment
- Properties: `id`, `name`, `baseAmount` (cents), `startYear`, `endYear`, `inflationAdjusted`
- Supports inflation-adjusted growth

### Calculation Layer

`src/calculations/projection.js` contains pure functions:

- `getAccountGrowthRate(accountType, assumptions)` - Returns growth rate for account type
- `calculateExpenseForYear(expense, yearOffset, inflationRate)` - Calculates inflation-adjusted expense
- `calculateTotalExpenses(expenses, yearOffset, inflationRate)` - Sums all expenses for year
- `project(plan, yearsToProject)` - Main year-by-year projection loop

`src/calculations/tax.js` contains tax calculation functions:

- `calculateFederalTax(income, filingStatus, year)` - Calculates federal income tax
- `calculateStateTax(state, income, filingStatus, year)` - Calculates state income tax
- `calculateTotalTax(state, income, filingStatus, year)` - Calculates combined federal + state tax
- `getStateTaxBrackets(state, year, filingStatus)` - Gets state-specific tax brackets
- `getStateStandardDeduction(state, year, filingStatus)` - Gets state standard deduction

**Tax Calculation Features:**
- Federal tax brackets for 2024/2025 (7 progressive brackets, 4 filing statuses)
- State tax systems for all 50 states + DC (progressive, flat-rate, and no-tax states)
- Combined federal + state tax calculations integrated into retirement projections
- Comprehensive test coverage for all US states and territories

**Important**: All calculation functions are pure (no side effects, no state mutations). This makes them easy to test and reason about.

### Storage Layer

`src/storage/StorageManager.js` encapsulates all localStorage operations:

- Static methods: `savePlan()`, `loadPlan()`, `listPlans()`, `deletePlan()`, `exportPlan()`, `importPlan()`
- Schema validation via `src/storage/schema.js`
- Versioning support with migration path
- Storage key prefix: `ofp_` (Open Finance Planner)

### UI Controllers

`src/ui/AppController.js` is a thin controller layer:

- Delegates business logic to domain models
- Manages DOM manipulation and event handlers
- Exposes `window.app` global for HTML onclick handlers
- Methods follow pattern: `loadPlansList()`, `loadPlan()`, `runProjection()`, `addAccount()`, etc.

## Data Storage Schema

Plans stored in localStorage as `ofp_plan_{uuid}`:

```javascript
{
  id: "uuid",
  name: "string",
  created: "ISO timestamp",
  lastModified: "ISO timestamp",
  taxProfile: {
    currentAge: number,
    retirementAge: number,
    estimatedTaxRate: number (decimal), // MVP: User-estimated combined federal + state tax rate
    // Legacy fields preserved for future advanced features:
    filingStatus: "single|married_joint|married_separate|head",
    federalTaxRate: number (decimal),
    state: string | null, // 2-letter state code (e.g., "DC", "CA", "NY") or null
    taxYear: number
  },
  assumptions: {
    inflationRate: number (decimal),
    equityGrowthRate: number (decimal),
    bondGrowthRate: number (decimal),
    equityVolatility: number (decimal), // Annual volatility for Monte Carlo simulations (default: 0.12)
    bondVolatility: number (decimal)    // Annual volatility for bonds (default: 0.04)
  },
  accounts: [
    {
      id: "uuid",
      name: "string",
      type: "401k|IRA|Roth|HSA|Taxable",
      balance: number (cents),
      annualContribution: number,
      withdrawalRate: number
    }
  ],
  expenses: [
    {
      id: "uuid",
      name: "string",
      baseAmount: number (cents),
      startYear: number,
      endYear: number | null,
      inflationAdjusted: boolean
    }
  ]
}
```

## Design Principles

### 1. Domain Independence
Core domain models (`src/core/models/`) have zero dependencies on UI or storage. They can be tested in isolation.

### 2. Pure Calculations
All calculation logic in `src/calculations/` are pure functions. No side effects, easy to test, predictable.

### 3. Storage Encapsulation
All storage operations go through `StorageManager`. Never access localStorage directly from UI or domain layer.

### 4. Thin UI Layer
UI controllers are thin. Business logic belongs in domain models or calculation functions.

### 5. Integer Arithmetic
Monetary values stored as cents (integers). Display by dividing by 100. Avoids floating-point precision issues.

## Common Tasks

### Adding a New Domain Model

1. Create model class in `src/core/models/YourModel.js`
2. Implement `toJSON()` and static `fromJSON()` methods
3. Write unit tests in `tests/unit/models/YourModel.test.js`
4. Update schema validation in `src/storage/schema.js` if needed

Example:
```javascript
// src/core/models/YourModel.js
export class YourModel {
  constructor(name, value) {
    this.id = this.generateId();
    this.name = name;
    this.value = value;
  }

  generateId() {
    return 'prefix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return { id: this.id, name: this.name, value: this.value };
  }

  static fromJSON(data) {
    const model = new YourModel(data.name, data.value);
    model.id = data.id;
    return model;
  }
}
```

### Adding a New Calculation

1. Add pure function to `src/calculations/yourFile.js`
2. Write unit tests in `tests/unit/calculations/yourFile.test.js`
3. Import and use from UI controller or other calculation functions

Example:
```javascript
// src/calculations/tax.js
export function calculateFederalTax(income, filingStatus) {
  // Pure calculation logic
  return taxAmount;
}
```

### Modifying the UI

1. UI logic goes in `src/ui/AppController.js` or create new controller in `src/ui/`
2. Styles go in `src/styles/components.css` (or layout.css for layout)
3. HTML templates remain in `index.html` or are generated via JavaScript
4. Keep UI controllers thin - delegate to domain layer

### Schema Migrations

When changing the plan structure:

1. Increment `CURRENT_SCHEMA_VERSION` in `src/storage/schema.js`
2. Add migration logic to `migratePlan()` function
3. Update `validatePlanSchema()` if adding new required fields
4. Test migration in `tests/unit/storage/schema.test.js`

## Testing

### Unit Tests

Unit tests are in `tests/unit/`. Each test file can be run directly:

```bash
node tests/unit/models/Plan.test.js
node tests/unit/calculations/projection.test.js
```

Test pattern:
```javascript
export function testSpecificBehavior() {
  // Arrange
  const input = /* test data */;

  // Act
  const result = functionUnderTest(input);

  // Assert
  if (result !== expected) {
    throw new Error('Expected X but got Y');
  }

  console.log('✓ testSpecificBehavior passed');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSpecificBehavior();
}
```

### Integration Tests

Integration tests go in `tests/integration/`. These test the full flow from UI to storage.

## Future Enhancements

See `/docs/architecture.md` for comprehensive architecture documentation including:
- Planned RuleRegistry system for tax strategies
- IndexedDB migration path for larger datasets
- Monte Carlo simulation architecture
- Tax calculation engine design

See `/docs/tasks.md` for prioritized roadmap. When you complete a task, be sure to check off the task box to mark our progress.

## Important Constraints

1. **Zero runtime dependencies** - Avoid adding external libraries unless absolutely necessary
2. **Client-side only** - No backend, all data in browser storage
3. **ES6 modules** - Use native ES6 import/export (no bundler required)
4. **Modern browsers only** - Target Chrome 90+, Firefox 88+, Safari 14+
5. **localStorage limits** - Design for 5-10MB storage limit per domain
