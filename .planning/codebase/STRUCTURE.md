# Codebase Structure

**Analysis Date:** 2026-01-15

## Directory Layout

```
openfinanceplanner/
├── index.html                    # Main HTML entry point
├── package.json                   # Project manifest (minimal)
├── src/
│   ├── core/                     # Domain models and business logic
│   │   ├── models/              # Domain entities
│   │   │   ├── Plan.js         # Plan aggregate root
│   │   │   ├── Account.js      # Financial account entity
│   │   │   ├── Expense.js      # Expense value object
│   │   │   └── Income.js      # Income entity with smart rules
│   │   └── rules/               # Strategy pattern implementation
│   │       ├── BaseRule.js       # Abstract base class
│   │       ├── RuleRegistry.js   # Central rule management
│   │       ├── StrategyFactory.js # Rule factory
│   │       ├── RothConversionRule.js
│   │       ├── QCDRule.js
│   │       ├── TLHRule.js
│   │       ├── BackdoorRothRule.js
│   │       └── MegaBackdoorRothRule.js
│   ├── calculations/             # Pure calculation functions
│   │   ├── projection.js        # Main projection engine
│   │   ├── tax.js             # Tax calculations (2,296 lines)
│   │   ├── monte-carlo.js      # Monte Carlo simulation
│   │   ├── social-security.js   # SSA benefit calculations
│   │   ├── rmd.js             # Required minimum distributions
│   │   ├── roth-conversions.js # Roth conversion strategies
│   │   ├── withdrawal-strategies.js # Account withdrawal ordering
│   │   ├── tax-loss-harvesting.js # Tax optimization
│   │   ├── qcd.js             # Qualified charitable distributions
│   │   └── income.js          # Income modeling
│   ├── storage/                 # Data persistence layer
│   │   ├── StorageManager.js   # localStorage operations
│   │   └── schema.js          # Schema validation & migrations
│   ├── ui/                      # UI controllers and visualization
│   │   ├── AppController.js    # Main UI controller (1,347 lines)
│   │   └── ChartRenderer.js   # Chart.js wrapper
│   └── styles/                  # CSS styling
│       ├── variables.css       # CSS custom properties (theming)
│       ├── base.css            # Reset & typography
│       ├── layout.css          # Layout styles
│       └── components.css      # Component styles
├── tests/
│   ├── unit/                   # Unit tests
│   │   ├── models/            # Domain model tests
│   │   ├── calculations/       # Calculation function tests
│   │   └── rules/             # Rule engine tests
│   └── integration/            # Integration tests
│       ├── full-flow.test.js   # Complete workflow test
│       ├── roth-conversions-integration.test.js
│       └── ...
├── docs/                      # Architecture documentation
│   ├── architecture.md
│   ├── tasks.md
│   └── research/
├── CLAUDE.md                 # Instructions for Claude Code
└── README.md                  # User-facing documentation
```

## Directory Purposes

**src/core/models/**

- Purpose: Domain entities with business logic
- Contains: Plan (aggregate root), Account, Expense, Income
- Key files: Plan.js (aggregate root with accounts/expenses/incomes)
- Subdirectories: None

**src/core/rules/**

- Purpose: Strategy pattern for financial strategies
- Contains: BaseRule, RuleRegistry, concrete rule implementations
- Key files: RuleRegistry.js (central rule management), BaseRule.js (abstract base)
- Subdirectories: None

**src/calculations/**

- Purpose: Pure calculation functions (side-effect-free)
- Contains: Projection engine, tax calculations, specialized calculators
- Key files: projection.js (main year-by-year loop), tax.js (comprehensive tax engine)
- Subdirectories: None

**src/storage/**

- Purpose: Data persistence with schema management
- Contains: StorageManager, schema validation
- Key files: StorageManager.js (localStorage wrapper), schema.js (validation/migration)
- Subdirectories: None

**src/ui/**

- Purpose: Presentation layer and user interaction
- Contains: Controllers, chart rendering
- Key files: AppController.js (main UI logic), ChartRenderer.js (visualization)
- Subdirectories: None

**src/styles/**

- Purpose: Styling with modular organization
- Contains: CSS variables, base styles, layout, components
- Key files: variables.css (theming with custom properties)
- Subdirectories: None

**tests/unit/**

- Purpose: Unit tests for individual components
- Contains: Model tests, calculation tests, rule tests
- Key files: Plan.test.js, projection.test.js
- Subdirectories: models/, calculations/, rules/

**tests/integration/**

- Purpose: End-to-end workflow tests
- Contains: Full application flow tests
- Key files: full-flow.test.js (complete workflow)
- Subdirectories: None

## Key File Locations

**Entry Points:**

- `index.html` - Main HTML entry point with ES6 module imports
- `package.json` - Project manifest with serve and test scripts

**Configuration:**

- Not applicable - No config files (configuration embedded in code)

**Core Logic:**

- `src/core/models/Plan.js` - Plan aggregate root
- `src/calculations/projection.js` - Projection engine
- `src/storage/StorageManager.js` - localStorage persistence
- `src/core/rules/RuleRegistry.js` - Strategy rule management

**Testing:**

- `tests/unit/` - Unit tests (models, calculations, rules)
- `tests/integration/` - Integration tests (full workflows)

**Documentation:**

- `CLAUDE.md` - Instructions for Claude Code
- `README.md` - User-facing documentation
- `docs/architecture.md` - Architecture documentation

## Naming Conventions

**Files:**

- PascalCase.js for domain models (Plan.js, Account.js)
- PascalCase.js for rules (RothConversionRule.js, QCDRule.js)
- kebab-case.js for calculations (projection.js, tax.js, monte-carlo.js)
- PascalCase.js for UI (AppController.js, ChartRenderer.js)
- \*.test.js for test files alongside source
- \*.css for styles (lowercase, kebab-case)

**Directories:**

- lowercase with hyphens (kebab-case) for all directories
- Plural names for collections: models/, calculations/, rules/, tests/
- Singular names for utilities: storage/, ui/, styles/

**Special Patterns:**

- index.html - Main HTML entry point
- No index.ts/index.js barrel files (direct imports)

## Where to Add New Code

**New Domain Model:**

- Primary code: `src/core/models/YourModel.js`
- Tests: `tests/unit/models/YourModel.test.js`
- Config if needed: `src/core/rules/YourRule.js` (if strategy pattern)

**New Calculation:**

- Primary code: `src/calculations/your-calculation.js`
- Tests: `tests/unit/calculations/your-calculation.test.js`

**New Financial Rule (Strategy):**

- Primary code: `src/core/rules/YourRule.js` (extends BaseRule)
- Tests: `tests/unit/rules/YourRule.test.js`
- Register in: `src/core/rules/RuleRegistry.js`

**New UI Component:**

- Primary code: `src/ui/YourComponent.js`
- Styles: `src/styles/components.css` (if needed)
- Tests: Not typically tested (UI layer thin)

**New Storage Operation:**

- Primary code: `src/storage/StorageManager.js` (add static method)
- Tests: `tests/unit/storage/StorageManager.test.js`
- Schema update: `src/storage/schema.js` (if data structure changes)

## Special Directories

**tests/**

- Purpose: All test files (unit and integration)
- Source: Hand-written tests with custom runner
- Committed: Yes

**docs/**

- Purpose: Architecture documentation and research
- Source: Manual documentation
- Committed: Yes

---

_Structure analysis: 2026-01-15_
_Update when directory structure changes_
