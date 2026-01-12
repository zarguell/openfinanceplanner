# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open Finance Planner is a client-side financial planning web application that runs entirely in the browser with zero dependencies. The entire application is contained in a single HTML file (`Open Finance Planner.html`, ~1750 lines) containing all CSS, JavaScript, and HTML.

## Tech Stack

- **Pure Vanilla JavaScript (ES2020+)** - No build process, no framework dependencies
- **localStorage** - All data persistence (5-10MB limit per domain)
- **Web Storage API** - Synchronous state management for single-user scenarios
- **CSS Custom Properties** - Theming with dark mode support via `@media (prefers-color-scheme: dark)`

## Running the Application

Simply open `Open Finance Planner.html` in a modern browser (Chrome 90+, Firefox 88+, Safari 14+). No build, test, or lint commands required.

## Architecture

### Single-File Structure

The entire application is in `Open Finance Planner.html` with this structure:

1. **CSS** (lines 8-899): All styles including CSS custom properties, dark mode, responsive design
2. **HTML Body** (lines 900-1400): Modal templates, sidebar, content areas
3. **JavaScript Classes** (lines 1400-1750): All application logic

### Core Classes

#### `Plan` (lines 780-902)
- Central data model for retirement plans
- Contains: accounts, expenses, assumptions, tax profile
- Methods: `addAccount()`, `removeAccount()`, `addExpense()`, `removeExpense()`, `toJSON()`, `fromJSON()`
- Uses UUID-based IDs for all child objects

#### `Account` (lines 850-900)
- Represents individual retirement accounts (401k, IRA, Roth, HSA, Taxable)
- Stores balance in cents (integer) to avoid floating-point issues
- Has `annualContribution` and `withdrawalRate` properties

#### `Expense` (lines 904-931)
- Models expense streams with inflation adjustment
- `inflationAdjusted` flag controls whether expense grows with inflation
- `startYear` is relative offset from now (0 = current year)

#### `ProjectionEngine` (lines 936-1012)
- Static class that calculates year-by-year projections
- `project(plan, yearsToProject)` - Main calculation loop
- Handles accumulation vs distribution phases based on retirement age
- Applies different growth rates by account type
- Current implementation: simple growth model (not Monte Carlo yet)

#### `StorageManager` (lines 1017-1083)
- All localStorage operations encapsulated here
- Storage key pattern: `plan_{planId}` for individual plans, `plans_list` for metadata
- `exportPlan()` / `importPlan()` for JSON portability
- **No versioning or migration logic yet** (documented in architecture.md as future enhancement)

#### `AppController` (lines 1088-1744)
- Main UI controller managing all interactions
- Global `app` instance instantiated at line 1747
- Methods follow pattern: `showXModal()`, `addX()`, `editX()`, `saveX()`, `deleteX()`, `renderXList()`
- Uses inline modal creation via `document.createElement('div')`
- Tab-based navigation: Overview, Assumptions, Accounts, Expenses, Projection

### Data Storage Schema

Plans stored in localStorage as `plan_{uuid}`:

```javascript
{
  id: "uuid",
  name: "string",
  created: "ISO timestamp",
  lastModified: "ISO timestamp",
  taxProfile: {
    currentAge: number,
    retirementAge: number,
    filingStatus: "single|married_joint|married_separate|head",
    federalTaxRate: number (decimal)
  },
  assumptions: {
    inflationRate: number (decimal),
    equityGrowthRate: number (decimal),
    bondGrowthRate: number (decimal)
  },
  accounts: Account[],
  expenses: Expense[]
}
```

**Important**: All monetary values stored in cents (integers) to avoid floating-point precision issues.

### UI Patterns

- **Modal-based editing**: All create/edit operations use dynamically created modals
- **Tab navigation**: `switchTab()` method toggles `.active` class on tabs and content
- **Card layouts**: Accounts and expenses displayed as `.card` elements with `.card-header`
- **Result cards**: Summary statistics in `.result-card` elements
- **Form validation**: Simple `alert()` dialogs for validation errors

## Important Design Decisions

### Zero Dependencies
Deliberately chosen for maximum accessibility and longevity. No framework means no framework churn. When adding features, prefer native browser APIs over external libraries.

### localStorage for Persistence
- Pros: No server needed, zero hosting costs, privacy (data never leaves browser)
- Cons: 5-10MB limit, data loss if browser cache cleared, no sync across devices
- Mitigation: Export/import functionality allows users to backup plans as JSON files

### Integer Arithmetic for Money
All monetary values stored as cents (integers). When displaying, divide by 100. This avoids floating-point precision issues like `0.1 + 0.2 !== 0.3`.

### Current Limitations (from docs/architecture.md)

The application is in **prototype phase**. Major features not yet implemented:

1. **Advanced tax calculations** - Currently uses flat federal tax rate; needs progressive tax brackets, state taxes, capital gains treatment
2. **Monte Carlo simulations** - Currently simple growth model; needs statistical variance for realistic projections
3. **Roth conversion strategies** - Backdoor Roth, conversion ladders documented in architecture.md but not implemented
4. **RMD calculations** - Required Minimum Distributions not yet enforced
5. **Visualization** - No charts yet (Chart.js via CDN planned)
6. **Testing** - No unit tests, integration tests, or E2E tests

## Common Tasks

### Adding a New Account Type

1. Add option to `<select>` in `showAddAccountModal()` (line 1466-1472)
2. Update `getAccountGrowthRate()` in `ProjectionEngine` (line 997-1006) if different growth behavior needed
3. Consider tax implications in projection logic

### Modifying Projection Logic

The main calculation loop is in `ProjectionEngine.project()` (lines 937-995):
- Iterates year-by-year from current year to `yearsToProject`
- Switches behavior at `age >= retirementAge` (accumulation vs distribution)
- Applies growth rates per account type
- Calculates inflation-adjusted expenses

### Adding UI Fields

1. Add field to modal HTML in `showXModal()` method
2. Add value extraction in corresponding `addX()` or `saveX()` method
3. Update `toJSON()` / `fromJSON()` if persisting the new field
4. Update display in `renderXList()` method

### Understanding Data Flow

```
User Action → AppController Method → Update currentPlan object → StorageManager.savePlan() → localStorage
```

Example flow for adding an account:
1. User clicks "+ Add Account" button
2. `app.showAddAccountModal()` creates and appends modal to DOM
3. User fills fields and clicks "Add"
4. `app.addAccount()` extracts values, creates `new Account()`, calls `plan.addAccount()`
5. `StorageManager.savePlan(plan)` serializes to JSON and writes to localStorage
6. `app.renderAccountsList()` updates UI

## Future Enhancements (from docs/architecture.md and docs/tasks.md)

See `/docs/architecture.md` for comprehensive architectural documentation including:
- Component APIs and interfaces
- Planned RuleRegistry system for tax strategies
- IndexedDB migration path
- Testing strategy
- Risk analysis and mitigation strategies

See `/docs/tasks.md` for prioritized roadmap across 10 phases of development.

## Key Files

- `Open Finance Planner.html` - Entire application (this is the only code file)
- `docs/architecture.md` - Comprehensive technical architecture documentation
- `docs/tasks.md` - Detailed task list and implementation roadmap
