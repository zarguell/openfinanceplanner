# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
openfinanceplanner/
├── config/               # Configuration data and tax information
│   ├── defaults.json     # Default application settings
│   ├── limits.json       # Account contribution limits
│   ├── ages.json        # Age threshold configurations
│   └── loader.js       # Configuration loader for ES6 compatibility
├── src/                 # Application source code
│   ├── calculations/     # Financial calculation engines
│   │   ├── tax/        # Tax calculation subsystem
│   │   │   └── config/ # Tax year-specific data files
│   │   ├── projection.js # Main projection engine
│   │   └── [other calculations]
│   ├── core/            # Domain models and business rules
│   │   ├── models/      # Core domain entities
│   │   └── rules/       # Financial strategy rules
│   ├── rules/           # Legacy rules system (being migrated)
│   │   └── strategies/  # Strategy implementations
│   ├── storage/         # Data persistence abstraction
│   ├── styles/          # CSS styling (component-based)
│   └── ui/             # User interface controllers
├── tests/              # Test suite
│   ├── integration/     # Cross-component workflow tests
│   ├── unit/          # Isolated module tests
│   └── test-helper.js  # Test utilities
├── index.html         # Main application entry point
├── package.json       # Project manifest and dependencies
├── package-lock.json  # Dependency lockfile
├── .gitignore        # Git ignore rules
└── README.md         # User documentation
```

## Directory Purposes

**config/**

- Purpose: Centralized configuration and reference data
- Contains: JSON configuration files, JavaScript loader
- Key files: `loader.js` - centralized configuration management
- Subdirectories: None (flat structure)

**src/calculations/**

- Purpose: Pure financial calculation functions
- Contains: Projection engine, tax calculations, financial strategies
- Key files: `projection.js` (434 lines, core calculation engine)
- Subdirectories: `tax/` for tax-specific calculations

**src/core/**

- Purpose: Domain models and business logic
- Contains: Entity classes, strategy rules, validation logic
- Key files: `models/Plan.js` (238 lines, core business entity)
- Subdirectories: `models/` for entities, `rules/` for strategies

**src/rules/**

- Purpose: Legacy financial rules system (being migrated to core/)
- Contains: Rule engine, strategy implementations, interfaces
- Key files: `RuleEngine.js` (383 lines, complex rule processing)
- Subdirectories: `strategies/` for specific strategy implementations

**src/storage/**

- Purpose: Data persistence abstraction layer
- Contains: localStorage wrapper, schema validation, data migration
- Key files: `StorageManager.js` (177 lines, localStorage abstraction)
- Subdirectories: None

**src/styles/**

- Purpose: CSS styling organized by component
- Contains: Base styles, layout, components, CSS variables
- Key files: `variables.css` (CSS custom properties)
- Subdirectories: None (component-based organization)

**src/ui/**

- Purpose: User interface controllers and coordination
- Contains: App controllers, specialized domain controllers, chart rendering
- Key files: `AppController.js` (315 lines, main application coordinator)
- Subdirectories: None

**tests/**

- Purpose: Test suite with unit and integration tests
- Contains: Unit tests for individual modules, integration tests for workflows
- Key files: `test-helper.js` (shared test utilities)
- Subdirectories: `unit/`, `integration/`

## Key File Locations

**Entry Points:**

- `index.html` - Main application entry point, loads ES6 modules
- `package.json` - Scripts for development and testing

**Configuration:**

- `config/loader.js` - Centralized configuration management
- `config/defaults.json` - Application default settings
- `config/limits.json` - Account contribution limits
- `config/ages.json` - Age threshold configurations

**Core Logic:**

- `src/core/models/Plan.js` - Core business entity (238 lines)
- `src/calculations/projection.js` - Main projection engine (434 lines)
- `src/ui/AppController.js` - Main application coordinator (315 lines)

**Testing:**

- `tests/unit/` - Unit tests for individual modules
- `tests/integration/` - Cross-component workflow tests
- `tests/test-helper.js` - Shared test utilities

**Documentation:**

- `README.md` - User-facing documentation
- `config/README.md` - Configuration documentation

## Naming Conventions

**Files:**

- PascalCase.js for classes: `AppController.js`, `Plan.js`, `StorageManager.js`
- camelCase.js for modules: `projection.js`, `loader.js`
- kebab-case.json for configuration: `defaults.json`, `limits.json`
- kebab-case.css for styles: `base.css`, `components.css`

**Directories:**

- kebab-case for all directories: `calculations/`, `storage/`, `styles/`
- Plural for collections: `models/`, `rules/`, `strategies/`
- Singular for concepts: `core/`, `storage/`, `ui/`

**Special Patterns:**

- `[Year]-[file].js` for year-specific data: `federal-2024.js`, `states-2025.js`
- `[Name]Controller.js` for UI controllers: `PlanController.js`, `AccountController.js`
- `[Name]Rule.js` for strategy rules: `RothConversionRule.js`, `TLHRule.js`

## Where to Add New Code

**New Feature:**

- Primary code: `src/ui/[Feature]Controller.js`
- Business logic: `src/calculations/[feature].js`
- Tests: `tests/unit/calculations/[feature].test.js`

**New Component/Module:**

- Implementation: `src/ui/[Component].js`
- Types: `src/core/models/[Model].js`
- Tests: `tests/unit/ui/[Component].test.js`

**New Strategy Rule:**

- Implementation: `src/core/rules/[Strategy]Rule.js`
- Register: Update `src/core/rules/RuleRegistry.js`
- Tests: `tests/unit/rules/[Strategy]Rule.test.js`

**New Configuration:**

- Data file: `config/[name].json`
- Loader update: Add to `config/loader.js`
- Validation: Update relevant model schemas

**Utilities:**

- Shared helpers: `src/core/[utility].js`
- Storage helpers: Extend `src/storage/StorageManager.js`
- UI helpers: `src/ui/[utility].js`

## Special Directories

**src/calculations/tax/config/**

- Purpose: Tax year-specific data files
- Source: Embedded tax bracket data for federal and state taxes
- Committed: Yes (source of truth for tax calculations)

**tests/coverage/**

- Purpose: Generated test coverage reports
- Source: Auto-generated by Vitest
- Committed: No (in .gitignore)

---

_Structure analysis: 2026-01-16_
_Update when directory structure changes_
