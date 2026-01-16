# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Client-Side Monolith with Layered Architecture

**Key Characteristics:**

- Pure client-side application running entirely in browser
- ES6 modules for clean dependency management
- No backend services or external API dependencies
- Local storage for data persistence
- Clear separation of concerns across layers

## Layers

**Presentation Layer:**

- Purpose: UI coordination and user interaction handling
- Contains: AppController, specialized domain controllers, ChartRenderer
- Location: `src/ui/`
- Depends on: Business logic layer, storage layer
- Used by: Browser DOM events, user interactions

**Business Logic Layer:**

- Purpose: Financial calculations and domain models
- Contains: Pure calculation functions, domain entities, strategy rules
- Location: `src/calculations/`, `src/core/`
- Depends on: Configuration layer only
- Used by: Presentation layer

**Data Persistence Layer:**

- Purpose: Abstract localStorage operations with validation
- Contains: StorageManager, schema validation
- Location: `src/storage/`
- Depends on: Browser localStorage API
- Used by: Business logic layer

**Configuration Layer:**

- Purpose: Centralized configuration and external data
- Contains: Tax brackets, contribution limits, age thresholds
- Location: `config/`
- Depends on: None (static embedded data)
- Used by: Business logic layer

## Data Flow

**Plan Operations Flow:**

1. User interaction triggers DOM event in browser
2. Controller method invoked (e.g., `PlanController.addAccount()`)
3. Controller validates input and calls domain model
4. Domain model processes business logic
5. StorageManager saves to localStorage
6. UI updates to reflect changes

**Projection Calculation Flow:**

1. User requests projection via UI controller
2. ProjectionController gathers current plan data
3. Calculation engine (`src/calculations/projection.js`) processes projections
4. Rule registry applies financial strategies
5. Tax calculations applied using embedded configuration
6. ChartRenderer visualizes results using Chart.js

**State Management:**

- Client-side localStorage for persistent data
- In-memory objects during execution
- No server-side state or databases

## Key Abstractions

**Controller Pattern:**

- Purpose: Thin coordinators between UI and business logic
- Examples: `AppController.js`, `PlanController.js`, `AccountController.js`
- Pattern: ES6 classes with dependency injection

**Strategy Pattern:**

- Purpose: Extensible financial strategy system
- Examples: `RothConversionRule`, `QCDRule`, `TLHRule`
- Pattern: BaseRule abstract class with specific implementations

**Repository Pattern:**

- Purpose: Data access abstraction
- Examples: `StorageManager.js`
- Pattern: Encapsulates localStorage with validation

**Pure Function Architecture:**

- Purpose: Side-effect-free business logic
- Examples: Functions in `src/calculations/`
- Pattern: Input → calculation → output, no side effects

## Entry Points

**Main Application Entry:**

- Location: `index.html` (lines 160-165)
- Triggers: Browser loads page
- Responsibilities: Import AppController, initialize application

**Development Server:**

- Location: `package.json` script
- Triggers: `npm run serve`
- Responsibilities: Start Python HTTP server for development

## Error Handling

**Strategy:** Inconsistent - some areas handle errors, others don't

**Patterns:**

- Calculation functions: Often lack error handling, could fail silently
- Controllers: Mix of try/catch and direct parsing without validation
- Storage layer: Basic validation in schema
- UI: Limited error display to users

## Cross-Cutting Concerns

**Logging:**

- Browser console only (console.log, console.error)
- No structured logging or external services

**Validation:**

- Schema validation in storage layer (`src/storage/schema.js`)
- Limited input validation in UI controllers
- Missing validation in some calculation functions

**Configuration Management:**

- Embedded JavaScript configuration files
- Centralized loader (`config/loader.js`)
- Tax year management scattered across multiple files

---

_Architecture analysis: 2026-01-16_
_Update when major patterns change_
