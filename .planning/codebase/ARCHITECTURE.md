# Architecture

**Analysis Date:** 2026-01-15

## Pattern Overview

**Overall:** Layered Monolith with Domain-Driven Design and Strategy Pattern

**Key Characteristics:**

- Single-page application (SPA) with clear layer separation
- Strategy pattern for extensible financial rules
- Pure functions for all calculations (side-effect-free)
- Client-side only (privacy-first design)

## Layers

**Presentation Layer (UI):**

- Purpose: Handle user interactions and display data
- Contains: UI controllers, Chart.js integration, event handlers
- Depends on: Domain layer, calculation layer, storage layer
- Used by: Browser via `index.html`

**Application Layer:**

- Purpose: Orchestrate business logic and coordinate rules
- Contains: Rule engine, strategy factory, projection orchestration
- Depends on: Domain models, calculation functions
- Used by: Presentation layer

**Domain Layer:**

- Purpose: Core business logic and entity modeling
- Contains: Plan (aggregate root), Account, Expense, Income entities, financial rules
- Depends on: Nothing (domain-independent)
- Used by: Application layer, calculation layer

**Calculation Layer:**

- Purpose: Pure computation functions for financial projections
- Contains: Tax calculations, projection engine, Monte Carlo simulation, social security, RMDs
- Depends on: Domain models (as input only)
- Used by: Application layer, presentation layer

**Infrastructure Layer:**

- Purpose: Data persistence and schema management
- Contains: StorageManager (localStorage), schema validation, migrations
- Depends on: Browser localStorage API
- Used by: All layers for persistence

## Data Flow

**User Action Flow:**

1. User interacts with UI (click, input) → DOM event in `index.html`
2. AppController event handler invoked → UI layer (`src/ui/AppController.js`)
3. Controller validates input → Domain model update (`src/core/models/`)
4. Projection execution requested → `project()` function (`src/calculations/projection.js`)
5. Rule engine applies strategies → RuleRegistry (`src/core/rules/RuleRegistry.js`)
6. Tax calculations performed → Pure functions (`src/calculations/tax.js`)
7. Results generated → Year-by-year projection data
8. Visualization updated → ChartRenderer (`src/ui/ChartRenderer.js`)
9. Persistence → StorageManager saves to localStorage (`src/storage/StorageManager.js`)

**State Management:**

- Client-side only - No server communication
- localStorage for persistence (versioned with migration support)
- In-memory state during runtime (no Redux/store pattern)

## Key Abstractions

**Strategy Pattern (Financial Rules):**

- Purpose: Extensible framework for financial strategies
- Examples: RothConversionRule, QCDRule, TLHRule, MegaBackdoorRothRule, BackdoorRothRule
- Pattern: BaseRule abstract class → Concrete implementations → RuleRegistry

**Domain Models:**

- Purpose: Rich entities with business behavior
- Examples: Plan (aggregate root), Account, Expense, Income (`src/core/models/`)
- Pattern: ES6 classes with toJSON/fromJSON methods

**Pure Functions:**

- Purpose: Side-effect-free calculations
- Examples: calculateTax, projectPlan, calculateSocialSecurity (`src/calculations/`)
- Pattern: Stateless functions → input → output (no mutations)

**Repository Pattern:**

- Purpose: Encapsulate persistence concerns
- Examples: StorageManager (`src/storage/StorageManager.js`)
- Pattern: Static methods for all CRUD operations

## Entry Points

**Primary Entry:**

- Location: `index.html` - HTML entry point with ES6 module imports
- Triggers: Browser loads page
- Responsibilities: Import ES6 modules, load Chart.js CDN, initialize AppController

**Development Entry:**

- Location: `npm run serve` script in `package.json`
- Triggers: Developer runs `npm run serve`
- Responsibilities: Start Python HTTP server on port 3030

**Test Entry:**

- Location: Individual test files in `tests/`
- Triggers: `node tests/unit/models/Plan.test.js` (for example)
- Responsibilities: Execute tests and report results

## Error Handling

**Strategy:** Validation + console.error, throw errors for invalid state

**Patterns:**

- Schema validation in StorageManager (`src/storage/schema.js`)
- Console.error for logging without user feedback
- Throw statements for invalid inputs
- No centralized error boundary (gaps in error handling)

## Cross-Cutting Concerns

**Logging:**

- Browser console only - console.log, console.error, console.warn
- No structured logging framework
- Console used for debugging in development

**Validation:**

- Schema validation in storage layer (`src/storage/schema.js`)
- Input validation in UI controllers (inconsistent)
- No centralized validation framework

**Theming:**

- CSS custom properties for dark mode support (`src/styles/variables.css`)
- `@media (prefers-color-scheme: dark)` for automatic theme switching

---

_Architecture analysis: 2026-01-15_
_Update when major patterns change_
