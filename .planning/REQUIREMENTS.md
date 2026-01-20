# Requirements: v1.1 — Fix It, Trust It, Visualize It

**Defined:** 2026-01-20
**Core Value:** Make the codebase trustworthy with comprehensive testing, fix broken UI, add visualizations to help users see their financial future

## v1 Requirements

### Bug Fixes (BLOCKING - Priority: CRITICAL)

- [ ] **BUGFIX-01**: Fix broken imports in ProjectionController (getSuccessProbabilityWithConfidence doesn't exist)
- [ ] **BUGFIX-02**: Fix global `app` object initialization (HTML onclick handlers fail)
- [ ] **BUGFIX-03**: Fix all console errors visible in Chrome DevTools
- [ ] **BUGFIX-04**: Verify all user workflows work end-to-end (create plan, add account, run projection)

### E2E Testing Infrastructure (Priority: CRITICAL - Trust)

- [ ] **E2E-01**: Install Vitest Browser Mode with Playwright provider
- [ ] **E2E-02**: Configure E2E test environment (vitest.config.js, playwright config)
- [ ] **E2E-03**: Create Page Object Model classes (AppPage, PlanPage, AccountPage, ProjectionPage)
- [ ] **E2E-04**: Create test fixtures and data builders (PlanBuilder, AccountBuilder)
- [ ] **E2E-05**: Write E2E tests for critical user workflows (plan creation, account management, projection)
- [ ] **E2E-06**: Add test scripts (test:e2e, test:e2e:ui, test:e2e:debug)

### Balance Projection Visualization (Priority: HIGH - User Value)

- [ ] **VIZ-01**: Create balance projection line chart (total wealth over time)
- [ ] **VIZ-02**: Add account-level lines to projection chart (optional breakdown by account)
- [ ] **VIZ-03**: Add retirement milestone marker (vertical line at retirement age)
- [ ] **VIZ-04**: Implement Y-axis currency formatting ($1M, $500k readable formats)
- [ ] **VIZ-05**: Add interactive tooltips (hover for detailed year-by-year values)
- [ ] **VIZ-06**: Integrate chart into results section (replace/add to existing table view)

### Retirement Readiness Report (Priority: HIGH - User Value)

- [ ] **REPORT-01**: Calculate retirement readiness metric (savings rate / withdrawal rate assessment)
- [ ] **REPORT-02**: Display "You're on track" / "You need $X more" / "You can retire at age Y"
- [ ] **REPORT-03**: Add visual gauge/meter for retirement readiness score
- [ ] **REPORT-04**: Show key metrics (current savings rate, projected withdrawal rate, gap amount)
- [ ] **REPORT-05**: Integrate report into dashboard/results section

### Coverage & Quality (Priority: MEDIUM - Trust Gaps)

- [ ] **COV-01**: Add tests for monte-carlo.js (currently 0% coverage)
- [ ] **COV-02**: Increase storage coverage from 45% to 70%+
- [ ] **COV-03**: Increase UI coverage from 6.98% to 40%+ (E2E tests will help)
- [ ] **COV-04**: Verify all critical calculation paths have tests (tax, RMD, projections)

## v2 Requirements (Deferred to v1.2)

### Advanced Visualizations

- **VIZ-ADV-01**: What-if scenario comparison overlay (compare different strategies side-by-side)
- **VIZ-ADV-02**: Monte Carlo fan chart with confidence interval bands
- **VIZ-ADV-03**: Tax drag visualization (show tax impact on portfolio growth)
- **VIZ-ADV-04**: RMD countdown timer visualization
- **VIZ-ADV-05**: Savings rate tracker line chart

### Additional Reports

- **REPORT-ADV-01**: Tax projection report (lifetime taxes, breakdown by year/type)
- **REPORT-ADV-02**: Income stream summary (Social Security, pensions, rental income timeline)
- **REPORT-ADV-03**: Account allocation report (how assets distributed across accounts)

### E2E Enhancements

- **E2E-ADV-01**: Visual regression testing (catch unintended UI changes)
- **E2E-ADV-02**: Cross-browser testing (Firefox, Safari validation)
- **E2E-ADV-03**: CI/CD integration (GitHub Actions workflow for E2E tests)

## Out of Scope

| Feature                       | Reason                                         |
| ----------------------------- | ---------------------------------------------- |
| Full 100% test coverage       | Focus on critical paths, not metrics           |
| Mobile app deployment         | Web-first, mobile responsive is sufficient     |
| Server-side functionality     | Maintain client-side only architecture         |
| External service integrations | Keep zero-dependency approach                  |
| TypeScript migration          | Maintain vanilla JS, defer to future milestone |

## Traceability

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| BUGFIX-01   | Phase 1 | Pending |
| BUGFIX-02   | Phase 1 | Pending |
| BUGFIX-03   | Phase 1 | Pending |
| BUGFIX-04   | Phase 1 | Pending |
| E2E-01      | Phase 2 | Pending |
| E2E-02      | Phase 2 | Pending |
| E2E-03      | Phase 3 | Pending |
| E2E-04      | Phase 3 | Pending |
| E2E-05      | Phase 4 | Pending |
| E2E-06      | Phase 4 | Pending |
| VIZ-01      | Phase 5 | Pending |
| VIZ-02      | Phase 5 | Pending |
| VIZ-03      | Phase 5 | Pending |
| VIZ-04      | Phase 5 | Pending |
| VIZ-05      | Phase 5 | Pending |
| VIZ-06      | Phase 5 | Pending |
| REPORT-01   | Phase 6 | Pending |
| REPORT-02   | Phase 6 | Pending |
| REPORT-03   | Phase 6 | Pending |
| REPORT-04   | Phase 6 | Pending |
| REPORT-05   | Phase 6 | Pending |
| COV-01      | Phase 4 | Pending |
| COV-02      | Phase 4 | Pending |
| COV-03      | Phase 4 | Pending |
| COV-04      | Phase 4 | Pending |

**Coverage:**

- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---

_Requirements defined: 2026-01-20_
_Last updated: 2026-01-20 after initial definition_
