# Codebase Concerns

**Analysis Date:** 2026-01-15

## Tech Debt

**XSS Vulnerabilities via innerHTML:**

- Issue: Extensive use of `innerHTML` with user-provided data without proper sanitization (18+ instances)
- Files: `src/ui/AppController.js` (lines 32, 35, 43, 77, 230, 233, 240, 269, 272, 307, 310, 317, 349, 438, 489, 661, 679, 748, 794, 856, 1075)
- Why: Direct DOM manipulation for convenience
- Impact: Cross-site scripting attacks possible if malicious data enters system
- Fix approach: Replace innerHTML with safe alternatives (textContent, createElement, DOMPurify)

**Monolithic Files:**

- Issue: Large files violate single responsibility principle
- Files: `src/calculations/tax.js` (2,296 lines), `src/ui/AppController.js` (1,347 lines)
- Why: Feature growth without refactoring
- Impact: Harder to maintain, test, and understand
- Fix approach: Split into smaller, focused modules

**Hardcoded Magic Numbers:**

- Issue: 1,018+ instances of hardcoded values scattered throughout codebase
- Files: `src/calculations/tax.js` (100+ tax bracket constants), `src/core/rules/MegaBackdoorRothRule.js` (30+ 401k limits)
- Why: Centralized configuration not established
- Impact: Difficult to update, maintain consistency, or adapt to changing rules
- Fix approach: Create config files for all constants (tax-brackets.json, limits.js)

**Outdated Package.json:**

- Issue: Test script is placeholder, no development dependencies
- File: `package.json`
- Why: Project evolved without updating package management
- Impact: No automated tooling (linting, building, testing)
- Fix approach: Add proper dev scripts, install linting/formatting tools

## Known Bugs

**None Currently Documented**

- No known bugs tracked in codebase
- Issues likely exist but not formally tracked

## Security Considerations

**XSS via innerHTML:**

- Risk: Cross-site scripting attacks through unsanitized user input
- Files: `src/ui/AppController.js` (18+ innerHTML usages)
- Current mitigation: escapeHtml() function present but inconsistently applied
- Recommendations: Use safe DOM methods (textContent, createElement) or DOMPurify library

**Missing Input Validation:**

- Risk: Invalid data corrupts application state
- Files: `src/ui/AppController.js` modal functions
- Current mitigation: Basic type checking (inconsistent)
- Recommendations: Add comprehensive input validation with user feedback

**Client-Side Only Validation:**

- Risk: No server-side validation (expected for client-only app, but still a concern)
- Files: Throughout application
- Current mitigation: Relies entirely on client-side validation
- Recommendations: Document assumption clearly, consider adding offline validation

**Unencrypted Sensitive Data:**

- Risk: Financial data accessible if browser compromised
- Files: Financial data stored in `localStorage`
- Current mitigation: Browser-scoped localStorage
- Recommendations: Consider encryption for sensitive financial data

## Performance Bottlenecks

**Large File Load Times:**

- Problem: Monolithic files require full parse before execution
- Files: `src/calculations/tax.js` (2,296 lines), `src/ui/AppController.js` (1,347 lines)
- Measurement: Not quantified (no performance tests)
- Cause: Feature accumulation without modularization
- Improvement path: Split into smaller, focused modules with lazy loading

**Extensive DOM Manipulation:**

- Problem: Direct DOM operations instead of declarative approach
- File: `src/ui/AppController.js`
- Measurement: Not quantified (no performance tests)
- Cause: Manual DOM updates on state changes
- Improvement path: Consider virtual DOM or reactive framework for complex UI

**Memory Usage in Monte Carlo:**

- Problem: 1,000 scenarios loaded in memory simultaneously
- File: `src/calculations/monte-carlo.js`
- Measurement: Not quantified (no memory profiling)
- Cause: All scenarios pre-loaded for calculation
- Improvement path: Stream scenarios or reduce count for memory-constrained devices

## Fragile Areas

**Tax Calculation File:**

- Why fragile: 2,296 lines of hardcoded tax bracket data (all 50 states + DC)
- File: `src/calculations/tax.js`
- Common failures: Tax bracket updates require editing file manually, prone to copy-paste errors
- Safe modification: Extract tax brackets to external JSON files, create validation script
- Test coverage: Good (unit tests for tax calculations), but gap in bracket validation

**UI Controller:**

- Why fragile: 1,347 lines of DOM manipulation and event handling
- File: `src/ui/AppController.js`
- Common failures: UI state inconsistencies, hard to trace event flows
- Safe modification: Split into focused components (PlanEditor, ChartView, AccountManager)
- Test coverage: Limited (no UI tests, only integration tests)

**Schema Validation:**

- Why fragile: Schema hardcoded in `src/storage/schema.js`, manual migration path
- File: `src/storage/schema.js`
- Common failures: Schema changes require manual migration code, risk of data loss
- Safe modification: Add migration testing, version compatibility checks
- Test coverage: Good (schema validation tested), but migration path not fully tested

## Scaling Limits

**localStorage Quota:**

- Current capacity: 5-10MB limit per domain
- Limit: localStorage quota exceeded throws error
- Symptoms at limit: Data save failures, application crashes
- Scaling path: Implement IndexedDB migration for larger datasets, graceful degradation

**Browser Memory:**

- Current capacity: Varies by device (typically 2-4GB for modern browsers)
- Limit: Complex projections (Monte Carlo with many scenarios) may cause slowdown
- Symptoms at limit: Browser tab becomes unresponsive, crashes on low-memory devices
- Scaling path: Progressive enhancement (fewer scenarios by default, opt-in for full analysis)

**Dataset Size:**

- Current capacity: Limited by localStorage (5-10MB)
- Limit: ~100-500 financial plans depending on complexity
- Symptoms at limit: Slow load times, save failures
- Scaling path: Implement pagination/caching for plan lists

## Dependencies at Risk

**Chart.js CDN Dependency:**

- Risk: External dependency loaded from cdn.jsdelivr.net
- Impact: Application breaks if CDN unavailable, potential privacy concern (external request)
- Migration plan: Download Chart.js bundle locally, version pinning

**No Framework:**

- Risk: UI complexity will outgrow vanilla JavaScript
- Impact: Difficult to maintain large codebase (AppController.js already 1,347 lines)
- Migration plan: Consider React/Vue for complex UI (future, not urgent)

## Missing Critical Features

**Formal Testing Framework:**

- Problem: No Jest, Vitest, or similar testing framework
- Current workaround: Custom test runner with manual assertions
- Blocks: Automated test discovery, coverage reporting, CI integration
- Implementation complexity: Medium (add Vitest, migrate existing tests)

**Linting and Code Quality:**

- Problem: No ESLint, Prettier, or similar tools
- Current workaround: Manual code review
- Blocks: Automated style enforcement, catch common errors, consistent formatting
- Implementation complexity: Low (add ESLint + Prettier config)

**Error Boundaries:**

- Problem: No try-catch blocks around complex calculations
- Current workaround: Application crashes on calculation errors
- Blocks: Graceful error handling, user feedback on failures
- Implementation complexity: Medium (add error wrapper functions, error modal)

**Type Safety:**

- Problem: No TypeScript or JSDoc type annotations
- Current workaround: Manual type checking through testing
- Blocks: Catch type errors at compile time, better IDE support
- Implementation complexity: High (full TypeScript migration)

## Test Coverage Gaps

**UI Testing:**

- What's not tested: UI controllers, DOM manipulation, user interactions
- Risk: UI regressions go unnoticed
- Priority: Medium
- Difficulty to test: Requires browser environment (could use Playwright/Puppeteer)

**Error Path Testing:**

- What's not tested: Error conditions, invalid inputs, edge cases
- Risk: Application crashes on unexpected errors
- Priority: High
- Difficulty to test: Requires intentional error triggering

**Performance Testing:**

- What's not tested: Large dataset performance, Monte Carlo simulation speed
- Risk: Slow performance on complex plans, poor UX
- Priority: Medium
- Difficulty to test: Requires performance profiling tools

**Migration Path Testing:**

- What's not tested: Schema migrations from old to new versions
- Risk: Data loss when schema changes deployed
- Priority: High
- Difficulty to test: Requires test data from old schema version

---

_Concerns audit: 2026-01-15_
_Update as issues are fixed or new ones discovered_
