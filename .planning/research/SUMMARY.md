# E2E Testing Implementation Research Summary

**Project:** Open Finance Planner
**Domain:** End-to-end testing for vanilla JavaScript applications
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

Open Finance Planner needs comprehensive E2E testing to validate critical user workflows (plan creation, account management, projections) that current unit tests cannot verify due to browser-based UI interactions. Research across testing frameworks, visualization requirements, architecture patterns, and domain pitfalls reveals a clear path forward.

**Recommended approach:** Use **Vitest Browser Mode with Playwright provider** as the primary E2E testing solution. This leverages existing Vitest infrastructure (308 unit tests, familiar test API) while adding browser automation capabilities. Vitest Browser Mode provides unified test runner, shared configuration, and seamless integration with current project setup. Playwright serves as the browser automation provider, offering auto-waiting, parallel execution, and modern tooling. For critical E2E tests requiring advanced features (trace viewer, codegen), supplement with standalone **Playwright (@playwright/test)** for cross-browser testing and time-travel debugging.

**Key risks and mitigation:** The highest-risk pitfall is **testing implementation details instead of user behavior**, which creates brittle tests that break on refactors. Prevent this by using Testing Library principles: prioritize user-facing selectors (`getByRole()`, `getByLabelText()`, `getByText()`) over CSS classes or DOM structure. The second major risk is **race conditions and flaky tests** from manual waits or poor async handling. Mitigate by using auto-waiting assertions built into Playwright/Vitest Browser Mode. The third risk is **test interdependence** where tests rely on previous test state. Prevent by resetting state in `beforeEach` (not `afterEach`) and ensuring each test is independent.

## Key Findings

### Recommended Stack

**Summary from STACK.md:** For E2E testing vanilla JavaScript with ES6 modules and no build process, Playwright is the mature, feature-rich solution. Vitest Browser Mode provides tight integration with existing Vitest setup. Puppeteer is viable but requires manual test runner setup. All three support ES6 modules without build process.

**Core technologies:**

- **Vitest Browser Mode (@vitest/browser-playwright)** — Unified test runner — leverages existing 308 Vitest unit tests, shared config, familiar `test/expect` API
- **Playwright (@playwright/test)** — Browser automation provider — auto-waiting, parallel execution, codegen for test recording, trace viewer for debugging
- **Chart.js** (v4.4.0, already installed) — Visualization testing — verify balance projections, Monte Carlo fan charts, asset allocation pies

### Expected Features

**Summary from FEATURES.md:** Open Finance Planner currently implements 4 core visualizations via ChartRenderer.js. Table stakes features are complete. MVP+ differentiators include retirement readiness gauges, what-if scenario overlays, and savings rate trackers.

**Must have (table stakes):**

- Balance projection line chart — shows growth trajectory, retirement readiness
- Monte Carlo fan chart (confidence interval band) — visualizes uncertainty in projections
- Retirement milestone marker — clear visual indicator for retirement year
- Asset allocation pie/doughnut — portfolio composition at a glance
- Annual cash flow stacked bar — income vs expenses by year
- Interactive tooltips — hover for detailed values
- Y-axis currency formatting — readable dollar amounts ($1M, $500k)

**Should have (competitive):**

- What-if scenarios overlay — compare different strategies side-by-side (differentiator)
- Retirement readiness gauge — single metric with visual "meter" (quick win)
- Savings rate tracker — line chart showing % income saved over time
- Tax drag visualization — show tax impact on portfolio growth
- RMD countdown timer — visual timeline to Required Minimum Distributions

**Defer (v2+):**

- Net worth heatmap — complex, requires year-by-year asset class breakdown
- Interactive scenario slider — high effort, inline sliders for variable changes
- Historical vs projected — requires historical data import (not in current scope)
- Social Security breakeven comparison — medium complexity, lower priority
- Income stream waterfall — medium complexity, post-MVP enhancement

### Architecture Approach

**Summary from ARCHITECTURE.md:** E2E test architecture should use **Page Object Model (POM)** pattern for maintainability, **fixtures** for test setup, and **test data builders** for data management. Vitest Browser Mode integrates seamlessly with existing Vitest infrastructure.

**Major components:**

1. **Page Object Models** — encapsulate page logic in reusable classes (AppPage, PlanPage, AccountPage, ProjectionPage) representing pages or components; separates test logic from page implementation
2. **Fixtures** — custom test setup with `test.extend()` for authenticated state, test data seeding; provides reusable test contexts
3. **Test Data Builders** — builder pattern for plan/account/expense objects; fluent API for test data creation
4. **E2E Test Organization** — `tests/e2e/` directory with subdirectories: fixtures/, pages/, scenarios/; clear separation from unit/integration tests

### Critical Pitfalls

**Top 5 from PITFALLS.md:**

1. **Testing Implementation Details** — Tests couple to internal structure (CSS classes, DOM hierarchy) rather than user-perceivable behavior. Single CSS change breaks dozens of tests. **Prevention:** Use user-facing selectors (`getByRole()`, `getByLabelText()`, `getByText()`) prioritized by Testing Library. Add `data-testid` attributes only as escape hatch.

2. **Race Conditions and Flaky Tests** — Tests pass locally but fail in CI due to timing issues. Hard-coded waits (`cy.wait(5000)`) create brittleness. **Prevention:** Use auto-waiting assertions (`await expect(element).toBeVisible()`). Use `cy.wait()` only with route aliases, not arbitrary time.

3. **Test Interdependence** — Tests rely on state from previous tests. Running individually passes but full suite fails. **Prevention:** Reset state in `beforeEach` (not `afterEach`). Each test should be independent. Don't rely on test execution order.

4. **Over-Mocking** — So much is stubbed that tests pass despite app being broken. "Tests give false confidence." **Prevention:** Only mock external dependencies you don't control (3rd party APIs, payment gateways). Test real integrations, not fake data.

5. **Poor Selector Strategies** — Using CSS classes (`.btn-primary`) or generic selectors (`cy.get('button')`). Tests break when DOM structure changes. **Prevention:** Hierarchy: `data-testid` (most stable) → ARIA roles (accessible) → text content → CSS classes (avoid) → element tags (avoid).

## Implications for Roadmap

Based on research, suggested phase structure for E2E testing implementation:

### Phase 1: E2E Infrastructure Setup

**Rationale:** Must establish foundation before writing tests. Vitest Browser Mode requires configuration to work with existing Vitest setup. Playwright provider needs installation. This phase delivers working E2E test environment with one smoke test.

**Delivers:**

- Installed `@vitest/browser-playwright` and `playwright` packages
- Updated `vitest.config.js` with E2E project configuration
- Basic page object for AppPage (goto, createPlan methods)
- One smoke test verifying browser automation works (create plan, verify in list)
- Package.json scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:debug`

**Addresses:**

- FEATURES.md: E2E validation of all table stakes visualizations
- ARCHITECTURE.md: Page Object Model foundation

**Avoids:**

- PITFALLS.md Pitfall 5 (Poor Selector Strategies) — by using `data-testid` and ARIA roles from day one
- PITFALLS.md Pitfall 3 (Test Interdependence) — by ensuring each test is independent from start

### Phase 2: Core Page Objects & Fixtures

**Rationale:** Page Objects prevent test duplication and improve maintainability. Fixtures provide reusable test setup (authenticated state, test data). This phase builds the reusable testing infrastructure that all E2E tests depend on.

**Delivers:**

- Page objects: PlanPage, AccountPage, ExpenseIncomePage, ProjectionPage
- Custom fixtures: `authenticatedPage` (creates plan before test), `testPlan` (test data builder)
- Test data builders: PlanBuilder, AccountBuilder, ExpenseBuilder
- E2E test directory structure: tests/e2e/{fixtures,pages,scenarios}

**Uses:**

- STACK.md: Vitest Browser Mode fixtures API
- ARCHITECTURE.md: Page Object Model pattern, builder pattern

**Implements:**

- ARCHITECTURE.md: Page Object encapsulation, fixture-based test setup, test data builders

**Avoids:**

- PITFALLS.md Pitfall 1 (Testing Implementation Details) — page objects use resilient selectors
- PITFALLS.md Pitfall 7 (Inefficient Test Organization) — cohesive user journey tests, not unit-style

### Phase 3: Critical User Flows

**Rationale:** Cover core workflows users perform daily. These tests validate the entire application stack from UI to localStorage to calculations. High ROI for test coverage.

**Delivers:**

- E2E tests for plan creation workflow (create, edit, delete, rename plans)
- E2E tests for account management (add, edit, delete accounts; type-specific validation)
- E2E tests for projection calculation (run projection, verify chart rendering, check results)
- E2E tests for data persistence (reload page, verify data in localStorage)

**Addresses:**

- FEATURES.md: All table stakes visualizations validated (balance projection, Monte Carlo, asset allocation, cash flow)
- Current gap: UI coverage only 6.98% (E2E tests directly address this)

**Avoids:**

- PITFALLS.md Pitfall 2 (Race Conditions) — using auto-waiting assertions
- PITFALLS.md Pitfall 3 (Test Interdependence) — each flow test is independent

### Phase 4: Visual Regression & Advanced Scenarios

**Rationale:** Ensure Chart.js visualizations render correctly. Test edge cases in financial calculations. Validate responsive design. This phase catches visual bugs and calculation errors that unit tests miss.

**Delivers:**

- E2E tests for Chart.js visualizations (balance projection line chart, Monte Carlo fan chart, asset allocation pie, cash flow stacked bar)
- Screenshot comparison tests for visual regression
- Responsive design tests (mobile viewport: 375px, desktop: 1920px)
- Edge case tests (zero balances, negative growth, retirement age edge cases)

**Uses:**

- STACK.md: Playwright screenshot capabilities, visual testing
- FEATURES.md: Validate all 4 current visualizations

**Implements:**

- FEATURES.md: Anti-feature avoidance (3D charts, excessive animations)
- PITFALLS.md Pitfall 9 (Ignoring Accessibility) — use `getByRole` for chart containers

### Phase 5: What-If Scenarios & Differentiators

**Rationale:** Competitive features that differentiate the tool. Higher complexity, lower priority but valuable for user adoption. Test overlaying multiple projection scenarios.

**Delivers:**

- E2E tests for what-if scenario comparison (base case vs +5% contributions, retire 2 years early)
- E2E tests for retirement readiness gauge (success probability visualization)
- E2E tests for savings rate tracker (trend line over time)

**Addresses:**

- FEATURES.md: Priority 1 differentiators (what-if scenarios, retirement readiness gauge, savings rate tracker)

**Uses:**

- STACK.md: Playwright's multi-dataset chart testing capabilities
- FEATURES.md: Chart.js mixed chart types for scenario comparison

### Phase 6: CI/CD Integration & Optimization

**Rationale:** Tests must run automatically in CI/CD pipeline. Parallel execution reduces feedback time. Trace viewer debugging aids failed test analysis.

**Delivers:**

- GitHub Actions workflow for E2E tests (runs on pull requests, pushes to main)
- Headless browser execution configuration
- Parallel test execution (reduce runtime)
- Trace viewer integration for failed tests
- Test reports (HTML, JSON)

**Avoids:**

- PITFALLS.md Pitfall 2 (Race Conditions in CI) — configure proper timeouts, retries
- PITFALLS.md Pitfall 6 (Testing Third-Party Integrations) — no external services in E2E tests

### Phase Ordering Rationale

**Why this order:**

- **Phase 1 → Phase 2:** Infrastructure must exist before page objects/fixtures can be built
- **Phase 2 → Phase 3:** Reusable components (page objects, fixtures) accelerate test writing
- **Phase 3 → Phase 4:** Critical user flows validated before edge cases and visual regression
- **Phase 4 → Phase 5:** Core functionality solidified before differentiators (lower priority)
- **Phase 3/4 → Phase 6:** Tests must exist before CI/CD integration makes sense

**Why this grouping:**

- Phases 1-2 group foundational infrastructure (setup, abstractions)
- Phases 3-5 group functional testing (user flows, visualizations, differentiators)
- Phase 6 is operational (CI/CD, optimization)

**How this avoids pitfalls:**

- Phase 1 establishes selector strategy upfront (avoids Pitfall 5: Poor Selector Strategies)
- Phase 3 uses auto-waiting assertions from day one (avoids Pitfall 2: Race Conditions)
- Phase 2 fixtures prevent test interdependence (avoids Pitfall 3: Test Interdependence)
- Phase 4 focuses on user behavior, not implementation (avoids Pitfall 1: Testing Implementation Details)

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 4 (Visual Regression):** Screenshot comparison requires baseline management strategy. Research Percy, Chromatic vs Playwright native screenshots. Decide on tolerance thresholds for Chart.js canvas rendering.
- **Phase 5 (What-If Scenarios):** Chart.js mixed chart types for scenario overlays need exploration. Research best practices for interactive legend toggles, dataset visibility controls.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Infrastructure Setup):** Vitest Browser Mode docs provide clear installation steps. Playwright quick start is well-documented.
- **Phase 2 (Page Objects & Fixtures):** Page Object Model is industry standard. Vitest fixtures API documented with examples.
- **Phase 3 (Critical User Flows):** Standard E2E testing patterns. Playwright best practices docs cover user flow testing comprehensively.
- **Phase 6 (CI/CD Integration):** GitHub Actions for Playwright is well-documented. Official Playwright docs provide CI configuration examples.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                                                |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack        | HIGH       | Verified with official Vitest Browser Mode docs (v4.0.17), Playwright docs (v1.49+). Tested ES6 module compatibility.                                                                |
| Features     | HIGH       | Chart.js capabilities verified in official docs. Current implementation analyzed (ChartRenderer.js). Financial planning visualization best practices inferred from domain knowledge. |
| Architecture | HIGH       | Page Object Model is industry standard (WebdriverIO, Playwright docs). Vitest fixtures API documented with examples. Builder pattern well-established.                               |
| Pitfalls     | HIGH       | All critical pitfalls verified with official Cypress docs, Testing Library docs, Kent C. Dodds articles (industry expert). Cross-referenced multiple sources.                        |

**Overall confidence:** HIGH

### Gaps to Address

**Competitor visualization patterns (LOW confidence):**

- External financial planning sites (Vanguard, Fidelity, Schwab) returned 404 errors during research. Unable to verify what competitors use for retirement planning visualizations.
- **How to handle:** During Phase 4 (Visual Regression), research competitor sites manually via browser screenshots. Infer best practices from observable patterns.

**Mobile-first visualization patterns (MEDIUM confidence):**

- Current implementation is desktop-focused. Mobile patterns for 40-year projections not deeply researched.
- **How to handle:** During Phase 4, test on 375px viewport (iPhone SE). Reduce data points shown on mobile (e.g., 5-year intervals). Stack charts vertically on mobile.

**Accessibility for financial charts (MEDIUM confidence):**

- Canvas-based charts are challenging for screen readers. Limited research on accessible financial chart patterns.
- **How to handle:** Provide data tables below charts (already done for year-by-year). Use aria-labels on canvas elements. Consider `chartjs-plugin-a11y-legend` for keyboard navigation (defer to v2).

## Sources

### Primary (HIGH confidence)

- **Vitest Browser Mode Documentation** (https://vitest.dev/guide/browser/) — browser testing setup, fixtures API, project configuration
- **Playwright Documentation** (https://playwright.dev/docs/intro) — best practices, auto-waiting, codegen, trace viewer
- **Chart.js Documentation** (https://www.chartjs.org/docs/latest/) — line charts, area fill modes, annotations plugin, mixed chart types
- **Cypress Best Practices** (https://docs.cypress.io/guides/core-concepts/best-practices) — selecting elements, retry-ability, state management
- **Testing Library Principles** (https://testing-library.com/docs/dom-testing-library/intro/) — user-centric queries, avoiding implementation details

### Secondary (MEDIUM confidence)

- **Testing Library Principles** (https://testing-library.com/docs/dom-testing-library/intro/) — philosophy aligns with industry best practices
- **WebdriverIO Page Objects** (https://webdriver.io/docs/pageobjects) — POM pattern applicable across frameworks
- **Vitest Test Context/Fixtures** (https://vitest.dev/guide/test-context.html) — custom fixtures API
- **Chart.js Awesome** (https://github.com/chartjs/awesome) — plugin ecosystem, integrations

### Tertiary (LOW confidence)

- **Chart.js Financial Plugin** (https://github.com/chartjs/chartjs-chart-financial) — verified as not suitable for retirement planning (OHLC data required, not yearly balances)
- **Kent C. Dodds articles** — industry expert guidance on testing implementation details, mocking strategies

---

_Research completed: 2026-01-20_
_Ready for roadmap: yes_
