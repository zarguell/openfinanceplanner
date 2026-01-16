# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**Duplicate Registry/Engine Files:**

- Issue: `src/rules/RuleRegistry.js` and `src/core/rules/RuleRegistry.js` implement similar functionality with different interfaces
- Why: Migration in progress from legacy system to new core system
- Impact: Confusion about which registry to use, potential for inconsistent behavior
- Fix approach: Complete migration to core system, deprecate legacy files

**Duplicate Strategy Factory Files:**

- Issue: `src/rules/StrategyFactory.js` and `src/core/rules/StrategyFactory.js` provide overlapping functionality
- Why: Parallel evolution of strategy creation systems
- Impact: Code duplication, maintenance overhead
- Fix approach: Consolidate to single factory implementation in core/

**Large Data Files:**

- Issue: `src/calculations/tax/config/states-2025.js` (4,860 lines) contains hardcoded tax data
- Why: Embedded for ES6 module compatibility, no external data loading
- Impact: Large bundle size, maintenance overhead for tax updates
- Fix approach: Externalize to JSON files, implement dynamic loading

**Large Functions/Files:**

- Issue: `src/ui/PlanController.js` (664 lines) handles too many responsibilities
- Why: Controller grew organically without refactoring
- Impact: Hard to maintain, test coverage low (5.67%)
- Fix approach: Extract specialized handlers (CRUD, settings, import/export, Social Security)

- Issue: `src/ui/ChartRenderer.js` (440 lines) complex chart rendering logic
- Why: All visualization logic in single file
- Impact: Difficult to modify specific chart types
- Fix approach: Modularize into separate chart type handlers

## Issues

**Missing Error Handling:**

- Issue: `src/ui/AccountController.js:163-164` - Direct parseFloat without validation
- Symptoms: Could throw on invalid input, no user feedback
- Fix approach: Add isNaN checks and meaningful error messages

- Issue: `src/calculations/projection.js` - No error handling in main projection function
- Symptoms: Could fail silently on invalid inputs, incorrect projections
- Fix approach: Add input validation and error propagation

- Issue: `src/rules/strategies/BackdoorRothStrategy.js:115-199` - Try-catch only logs errors
- Symptoms: Errors logged but not propagated to caller, strategy may appear to succeed
- Fix approach: Re-throw errors after logging or return error status

**Input Validation Gaps:**

- Issue: `src/ui/PlanController.js:264-272` - Multiple parseFloat operations without validation
- Impact: Invalid financial data could corrupt calculations
- Fix approach: Add bounds checking and validation before parsing

- Issue: `src/ui/ExpenseIncomeController.js:93,261` - User input parsed without proper validation
- Impact: Invalid expense/income data could break projections
- Fix approach: Implement consistent input validation across all controllers

## Security

**No Critical Issues Found**

- Risk assessment: Client-side application with no external API calls
- Current mitigation: Browser security sandbox, no server-side vulnerabilities
- Recommendations: Continue input validation, consider CSP headers for production

## Performance

**Inefficient Rule Application:**

- Issue: `src/calculations/projection.js:258` - Rule registry applied every projection iteration
- Impact: O(n\*m) complexity where n = iterations, m = rules
- Fix approach: Cache rule application results, optimize registry lookup

**DOM Manipulation Patterns:**

- Issue: `src/ui/PlanController.js:39,241-242` - Multiple forEach loops over DOM elements
- Impact: Potential layout thrashing on large datasets
- Fix approach: Batch DOM updates, use document fragments

**Large Data Loading:**

- Issue: All state tax data loaded regardless of usage
- Impact: Increased initial load time, memory usage
- Fix approach: Implement lazy loading for state-specific tax data

## Missing

**Test Coverage Gaps:**

- Issue: UI controllers have extremely low coverage
  - PlanController: 5.67%
  - ChartRenderer: 0.98%
  - StorageManager: 31.03%
  - TLHRule: 46.87%
- Impact: Bugs could go undetected in critical UI code
- Priority: High
- Difficulty to test: Complex DOM interactions, localStorage dependencies

**Configuration Management:**

- Issue: Missing `.env.example` file for configuration templates
- Impact: No clear template for required configuration
- Fix approach: Create example configuration file

- Issue: Hardcoded tax years scattered throughout codebase
- Impact: Difficult to update tax years, maintain multiple year files
- Fix approach: Centralize tax year configuration, use single source of truth

**Documentation Gaps:**

- Issue: Complex calculation functions lack inline comments
- Files: `src/calculations/projection.js`, `src/calculations/tax.js`
- Impact: Hard to understand financial logic and business rules
- Fix approach: Add comprehensive inline documentation for complex calculations

## Fragile Areas

**Strategy Pattern Implementation:**

- Component: Strategy rule system with dual implementations
- Why fragile: Migration between legacy and core systems creates inconsistency
- Common failures: Strategy registration fails silently, rule conflicts
- Safe modification: Complete migration before adding new strategies
- Test coverage: Moderate coverage but some edge cases missing

**Input Parsing:**

- Component: User input handling across UI controllers
- Why fragile: Inconsistent validation patterns across controllers
- Common failures: Invalid numbers breaking calculations, no user feedback
- Safe modification: Implement centralized input validation utility
- Test coverage: Poor coverage of edge cases in current tests

---

_Concerns audit: 2026-01-16_
_Update as issues are fixed or new ones discovered_
