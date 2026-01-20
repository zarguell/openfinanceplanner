# Phase 7: Critical Bug Fixes - Research

**Researched:** 2026-01-20
**Domain:** JavaScript ES6 modules, Monte Carlo simulations, Browser application debugging
**Confidence:** HIGH

## Summary

Phase 7 is blocked by two critical bugs that prevent the application from loading. The root cause is an accidental deletion of the Monte Carlo implementation during Phase 1 (ESLint setup). The Monte Carlo module was left empty, causing the ProjectionController import to fail. When the module fails to load, `window.app` is never initialized, breaking all HTML onclick handlers.

**Primary recommendation:** Restore the Monte Carlo implementation from git history (commit 9d7b704) and verify no other files were accidentally deleted during Phase 1.

## Bug Analysis

### BUGFIX-01: Broken imports in ProjectionController

**Root Cause:** Monte Carlo implementation was accidentally deleted in commit `d72c351` (Phase 1 - ESLint/Prettier setup). The file `src/calculations/monte-carlo.js` was replaced with an empty file (1 line, only newline).

**Impact:**

- ProjectionController fails to import `runMonteCarloSimulation` and `getSuccessProbabilityWithConfidence`
- Module loading cascade failure stops `window.app` initialization
- Application is completely non-functional

**Evidence:**

```bash
# Git history shows implementation existed
git log --all --oneline -- "src/calculations/monte-carlo.js"
# d72c351 feat: add quality tooling (ESLint, Prettier, Vitest)
# 9d7b704 feat(monte-carlo): implement Monte Carlo simulation...

# Current file is empty (1 line)
wc -l src/calculations/monte-carlo.js
# 1

# Console error confirms missing export
# Error: The requested module '../calculations/monte-carlo.js'
#        does not provide an export named 'getSuccessProbabilityWithConfidence'
```

**Original Implementation (from git 9d7b704):**
The Monte Carlo module had 171 lines with:

- `generateRandomReturn(expectedReturn, volatility)` - Box-Muller transform for normal distribution
- `runMonteCarloScenario(plan, yearsToProject, taxYear)` - Single scenario with random returns
- `runMonteCarloSimulation(plan, numScenarios, yearsToProject, taxYear)` - 1000 scenarios, statistics
- `getSuccessProbabilityWithConfidence(monteCarloResults)` - 95% confidence interval
- `analyzeSequenceOfReturnsRisk(scenarios)` - Early vs late failure analysis

**Return Structure (used by ProjectionController):**

```javascript
{
  numScenarios: 1000,
  successProbability: 0.85,  // ratio of successful scenarios
  successCount: 850,
  averageFinalBalance: 1250000,
  percentiles: {
    p10: 450000,
    p25: 780000,
    p50: 1100000,
    p75: 1500000,
    p90: 2100000
  },
  scenarios: [
    {
      projection: [...], // year-by-year results
      success: true,
      finalBalance: 1250000,
      finalAge: 97
    },
    // ... more scenarios
  ]
}
```

**getSuccessProbabilityWithConfidence Return:**

```javascript
{
  probability: 0.85,       // successProbability
  lowerBound: 0.826,      // probability - marginOfError (95% CI)
  upperBound: 0.874,      // probability + marginOfError (95% CI)
  confidenceLevel: 0.95,
  marginOfError: 0.024
}
```

### BUGFIX-02: Global `app` object initialization

**Root Cause:** Dependent on BUGFIX-01. When ProjectionController fails to load due to broken imports, the module initialization in `index.html` (line 164) never completes, so `window.app` is never set.

**HTML Initialization (index.html lines 160-165):**

```html
<script type="module">
  import { AppController } from './src/ui/AppController.js';

  // Initialize app
  window.app = new AppController();
</script>
```

**Impact:**

- All 9 HTML onclick handlers fail with "app is not defined"
- Users cannot click any buttons (New Plan, Import, Export, Settings, Cancel, Create, Save)
- Application loads but is completely non-interactive

**Affected onclick handlers (9 total):**

```html
<!-- Sidebar -->
onclick="app.showNewPlanModal()" onclick="app.showImportModal()" onclick="app.exportCurrentPlan()"

<!-- Header -->
onclick="app.showPlanSettingsModal()" onclick="app.deletePlan()"

<!-- Modals -->
onclick="app.closeModal('newPlanModal')" onclick="app.createNewPlan()"
onclick="app.closeModal('importModal')" onclick="app.importPlan()"
onclick="app.closeModal('planSettingsModal')" onclick="app.savePlanSettings()"
```

### BUGFIX-03: Fix all console errors visible in Chrome DevTools

**Current Console Errors (3 total):**

1. **Module import error:** `The requested module '../calculations/monte-carlo.js' does not provide an export named 'getSuccessProbabilityWithConfidence'`
2. **404 error:** `Failed to load resource: the server responded with a status of 404 (File not found)` - favicon.ico (harmless)
3. **Runtime error:** `app is not defined` - triggered by any onclick handler click

**Resolution:** All three errors are side effects of BUGFIX-01. Restoring the Monte Carlo implementation will resolve errors 1 and 3. The favicon.ico 404 can be ignored or fixed by adding a placeholder favicon.

### BUGFIX-04: Verify all user workflows work end-to-end

**Workflows to verify (after BUGFIX-01/02/03 fixed):**

1. **Plan Management Workflow:**
   - Create new plan via "+ New Plan" button
   - Enter plan name, current age, retirement age
   - Click "Create" button
   - Verify plan appears in plan list
   - Verify no console errors

2. **Account Management Workflow:**
   - Select a plan from list
   - Add account via account management UI
   - Enter account details (type, balance, contribution)
   - Verify account appears in accounts list
   - Verify no console errors

3. **Projection Workflow:**
   - Run projection (deterministic + Monte Carlo)
   - Verify results table renders
   - Verify Monte Carlo analysis section displays (success probability, percentiles)
   - Verify charts render (balance, Monte Carlo fan, allocation, cash flow)
   - Verify year-by-year table displays correctly
   - Verify no console errors

4. **Settings/Import/Export Workflow:**
   - Open plan settings modal
   - Modify assumptions
   - Save settings
   - Export plan to JSON
   - Import plan from JSON
   - Verify no console errors

## Architecture Patterns

### Module Loading Failure Cascade

```
index.html (script type="module")
  ↓
import { AppController } from './src/ui/AppController.js'
  ↓
import { ProjectionController } from './ProjectionController.js'
  ↓
import { runMonteCarloSimulation, getSuccessProbabilityWithConfidence }
        from '../calculations/monte-carlo.js'
  ↓
ERROR: monte-carlo.js exports are empty
  ↓
window.app = new AppController() ← NEVER EXECUTED
  ↓
onclick="app.showNewPlanModal()" ← "app is not defined"
```

### Monte Carlo Integration Pattern

**Monte Carlo calls Projection:**

```
runMonteCarloSimulation(plan, 1000, 40, 2025)
  ↓
For each scenario (0-999):
  generateRandomReturn(expectedReturn, volatility)
  ↓
  Create scenarioPlan with randomized growth rates
  ↓
  runMonteCarloScenario(scenarioPlan, years, year)
    ↓
    project(scenarioPlan, years, taxYear) ← calls projection.js
    ↓
    Check if finalBalance > 0 (success criteria)
  ↓
Calculate statistics (probability, percentiles, confidence intervals)
```

## Standard Stack

### Debugging Tools

| Tool                   | Purpose                            | How to Use                                         |
| ---------------------- | ---------------------------------- | -------------------------------------------------- |
| **Chrome DevTools**    | Browser console inspection         | F12 → Console tab                                  |
| **Python http.server** | Local dev server (CORS workaround) | `npm run serve` (port 3030)                        |
| **git show**           | View deleted file contents         | `git show 9d7b704:src/calculations/monte-carlo.js` |
| **git log**            | Track file history                 | `git log --all --oneline -- "filename"`            |

### Restoration Process

```bash
# Step 1: Verify the deleted implementation
git show 9d7b704:src/calculations/monte-carlo.js > /tmp/monte-carlo.js.backup
# Review the file to ensure it's the correct implementation

# Step 2: Restore the file
git show 9d7b704:src/calculations/monte-carlo.js > src/calculations/monte-carlo.js

# Step 3: Verify restoration
cat src/calculations/monte-carlo.js | wc -l  # Should be 171 lines

# Step 4: Check for other accidentally deleted files
git diff 9d7b704..HEAD --name-status | grep "^D"
```

## Don't Hand-Roll

| Problem                         | Don't Build           | Use Instead                                   | Why                                                                |
| ------------------------------- | --------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| Monte Carlo simulation          | Custom implementation | Restore from git (9d7b704)                    | Implementation already exists, tested, matches expected API        |
| Confidence interval calculation | Manual calculation    | Restore `getSuccessProbabilityWithConfidence` | Uses proper statistical methods (95% CI with normal approximation) |
| Normal distribution random      | Math.random() alone   | Restore `generateRandomReturn`                | Uses Box-Muller transform for proper normal distribution           |
| Volatility-based returns        | Simple percentage     | Restore volatility-based random               | Accounts for market volatility (12% equity, 4% bond)               |

## Common Pitfalls

### Pitfall 1: Assuming File Was Intentionally Removed

**What goes wrong:** Developer sees empty file, assumes Monte Carlo was intentionally removed, starts building from scratch.

**Why it happens:** No TODO/FIXME comments, no obvious signs of deletion.

**How to avoid:**

- Always check git history when finding unexpectedly empty or missing files
- Check if there are any tests that reference the expected functionality
- Look for usage patterns in dependent modules (ProjectionController imports)

**Warning signs:**

- File exists but is empty (1 line)
- Dependent modules try to import functions that don't exist
- No comments explaining why file is empty

### Pitfall 2: Restoring Without Testing

**What goes wrong:** Restoring Monte Carlo but not verifying it works end-to-end, only checking module loads.

**Why it happens:** Focus shifts to next bug before thorough verification.

**How to avoid:**

- After restoration, reload page and verify `window.app` exists
- Test all onclick handlers
- Run Monte Carlo simulation and verify results
- Check console for errors

**Verification steps:**

```javascript
// In DevTools console after restoration
typeof window.app === 'object'; // Should be true
window.app.runProjection(); // Should execute without errors
```

### Pitfall 3: Missing Volatility Defaults

**What goes wrong:** Restored Monte Carlo expects `plan.assumptions.equityVolatility` but plan data doesn't include it, causing undefined values.

**Why it happens:** Original implementation had defaults (0.12 for equity, 0.04 for bond) but newer plan data may not include volatility fields.

**How to avoid:**

- Review original implementation's default values
- Ensure Plan model includes volatility fields in defaults
- Add validation to check for missing volatility assumptions

**Warning signs:**

- `NaN` or `undefined` in growth rates
- Monte Carlo results all zero or identical
- Console warnings about undefined properties

## Code Examples

### Restoring Monte Carlo Implementation

```bash
# View the implementation before restoring
git show 9d7b704:src/calculations/monte-carlo.js

# Restore to current working tree
git show 9d7b704:src/calculations/monte-carlo.js > src/calculations/monte-carlo.js

# Verify line count (should be 171)
wc -l src/calculations/monte-carlo.js

# Stage and commit
git add src/calculations/monte-carlo.js
git commit -m "fix(BUGFIX-01): restore accidentally deleted Monte Carlo implementation"
```

### Verifying Fix Worked

```javascript
// In Chrome DevTools Console after fix
console.log('app exists:', typeof window.app !== 'undefined');
// Expected: app exists: true

console.log('app methods:', Object.getOwnPropertyNames(window.app));
// Expected: ['showNewPlanModal', 'createNewPlan', 'runProjection', ...]

// Test Monte Carlo
window.app.runProjection();
// Expected: Renders projection results, no console errors

// Check Monte Carlo results
console.log(window.app.projectionController.monteCarloResults);
// Expected: Object with { numScenarios, successProbability, percentiles, ... }
```

### Testing All onclick Handlers

```javascript
// In Chrome DevTools Console
const handlers = [
  () => window.app.showNewPlanModal(),
  () => window.app.showImportModal(),
  () => window.app.showPlanSettingsModal(),
  () => window.app.closeModal('newPlanModal'),
  () => window.app.closeModal('importModal'),
  () => window.app.closeModal('planSettingsModal'),
];

handlers.forEach((handler, i) => {
  try {
    handler();
    console.log(`✅ Handler ${i} passed`);
  } catch (error) {
    console.error(`❌ Handler ${i} failed:`, error);
  }
});
```

## Testing Strategy

### Unit Testing (After Restoration)

```javascript
// tests/unit/calculations/monte-carlo.test.js
import { describe, it, expect } from 'vitest';
import {
  runMonteCarloSimulation,
  getSuccessProbabilityWithConfidence,
  generateRandomReturn
} from '../../src/calculations/monte-carlo.js';

describe('Monte Carlo Simulation', () => {
  it('should run simulation and return expected structure', () => {
    const mockPlan = {
      assumptions: {
        equityGrowthRate: 0.07,
        equityVolatility: 0.12,
        bondGrowthRate: 0.04,
        bondVolatility: 0.04
      },
      accounts: [...],
      // ... other plan fields
    };

    const results = runMonteCarloSimulation(mockPlan, 100, 40, 2025);

    expect(results).toHaveProperty('numScenarios', 100);
    expect(results).toHaveProperty('successProbability');
    expect(results).toHaveProperty('averageFinalBalance');
    expect(results).toHaveProperty('percentiles');
    expect(results).toHaveProperty('scenarios');
  });

  it('should calculate success probability with confidence interval', () => {
    const mockResults = {
      numScenarios: 1000,
      successProbability: 0.85
    };

    const confidence = getSuccessProbabilityWithConfidence(mockResults);

    expect(confidence.probability).toBe(0.85);
    expect(confidence.lowerBound).toBeLessThan(confidence.probability);
    expect(confidence.upperBound).toBeGreaterThan(confidence.probability);
    expect(confidence.confidenceLevel).toBe(0.95);
  });
});
```

### Integration Testing (Browser)

```javascript
// Manual testing checklist
// 1. Load application: http://localhost:3030
// 2. Check console: Should be zero errors
// 3. Click "+ New Plan" button: Modal should open
// 4. Fill form, click "Create": Plan should appear in list
// 5. Click plan in list: Should select plan, show details
// 6. Add account via UI: Account should appear in accounts list
// 7. Click "Run Projection": Results should render
// 8. Check Monte Carlo section: Success probability, percentiles displayed
// 9. Verify charts: Balance, Monte Carlo fan, allocation, cash flow
// 10. Check year-by-year table: All rows render correctly
```

## Dependencies Between Bugfixes

```
BUGFIX-01 (restore monte-carlo.js)
    ↓
    BLOCKS
    ↓
BUGFIX-02 (window.app initialization)
    ↓
    BLOCKS
    ↓
BUGFIX-03 (console errors)
    ↓
    ENABLES
    ↓
BUGFIX-04 (end-to-end workflows)
```

**Dependency chain:**

- BUGFIX-02 and BUGFIX-03 are blocked by BUGFIX-01
- BUGFIX-04 can only be verified after BUGFIX-01, 02, 03 are fixed
- Fix order: BUGFIX-01 → BUGFIX-02 → BUGFIX-03 → BUGFIX-04

## Risk Assessment

### High Risk

**Risk: Other files were accidentally deleted in Phase 1**

- **Probability:** Medium (happened to monte-carlo.js)
- **Impact:** High (hidden bugs, incomplete features)
- **Mitigation:** After restoring monte-carlo.js, check git diff for other deleted files

```bash
# Check for other deletions
git diff 9d7b704..HEAD --name-status | grep "^D"
```

**Risk: Monte Carlo implementation has bugs or incompatibilities**

- **Probability:** Low (implementation worked before deletion)
- **Impact:** Medium (Monte Carlo results incorrect or crashes)
- **Mitigation:** Run unit tests, verify console logs, check calculation results

### Medium Risk

**Risk: Plan data structure changed since Monte Carlo was implemented**

- **Probability:** Medium (Phase 2-6 may have modified Plan model)
- **Impact:** Medium (Monte Carlo may fail to access new fields)
- **Mitigation:** Check Plan model for missing volatility fields, add defaults

**Risk: Monte Carlo performance degradation**

- **Probability:** Low (same algorithm, 1000 scenarios)
- **Impact:** Low (users may notice slight delay when running projection)
- **Mitigation:** Consider reducing to 500 scenarios if slow (check performance)

### Low Risk

**Risk: Restoring from git conflicts with uncommitted changes**

- **Probability:** Low (working tree is clean or has unrelated changes)
- **Impact:** Low (resolve conflicts, reapply changes)
- **Mitigation:** Check git status before restoration, commit or stash changes

## Recommended Task Breakdown

### Task 1: Restore Monte Carlo Implementation (BUGFIX-01)

**Actions:**

1. View original implementation: `git show 9d7b704:src/calculations/monte-carlo.js`
2. Review the 171-line implementation for correctness
3. Restore file: `git show 9d7b704:src/calculations/monte-carlo.js > src/calculations/monte-carlo.js`
4. Verify line count: `wc -l src/calculations/monte-carlo.js` (should be 171)
5. Check for other deleted files: `git diff 9d7b704..HEAD --name-status | grep "^D"`
6. Run linter: `npm run lint`
7. Stage and commit: `git add src/calculations/monte-carlo.js && git commit -m "..."`

**Verification:**

- File has 171 lines
- Exports: `runMonteCarloSimulation`, `getSuccessProbabilityWithConfidence`, `runMonteCarloScenario`, `generateRandomReturn`, `analyzeSequenceOfReturnsRisk`
- ESLint passes
- No other files were accidentally deleted

### Task 2: Verify window.app Initialization (BUGFIX-02)

**Actions:**

1. Start dev server: `npm run serve`
2. Open browser: `http://localhost:3030`
3. Check console for module errors (should be none)
4. In DevTools console: `typeof window.app` (should be 'object')
5. Check app methods: `Object.getOwnPropertyNames(window.app)` (should have all methods)
6. Test onclick handler: Click "+ New Plan" button (modal should open)
7. Check console (should be zero errors)

**Verification:**

- `window.app` is defined
- No module import errors in console
- "+ New Plan" button opens modal
- No "app is not defined" errors

### Task 3: Clear All Console Errors (BUGFIX-03)

**Actions:**

1. Open Chrome DevTools (F12 → Console tab)
2. Clear console
3. Reload page (Cmd+R)
4. Check for errors (should be zero)
5. If favicon.ico 404 exists, either ignore or add placeholder:
   ```bash
   # Create empty favicon
   touch public/favicon.ico
   # Or update HTML to remove favicon request
   ```
6. Click all buttons in UI to trigger onclick handlers:
   - "+ New Plan", "Import", "Export", "Settings"
   - "Cancel", "Create" (after opening modal)
7. Verify zero errors after all interactions

**Verification:**

- Zero console errors on page load
- Zero errors when clicking buttons
- Only acceptable warning: favicon.ico 404 (if ignored)

### Task 4: Verify End-to-End Workflows (BUGFIX-04)

**Actions:**

**Workflow 1: Create Plan**

1. Click "+ New Plan" button
2. Enter: Name="Test Plan", Current Age=40, Retirement Age=67
3. Click "Create"
4. Verify: Plan appears in plan list, no console errors

**Workflow 2: Add Account**

1. Select "Test Plan" from list
2. Navigate to Accounts section
3. Click "Add Account" button
4. Enter: Type="401k", Name="Employer 401k", Balance=100000, Contribution=10000
5. Click "Save"
6. Verify: Account appears in accounts list, no console errors

**Workflow 3: Run Projection**

1. Click "Run Projection" button
2. Wait for results to render
3. Verify:
   - Results table displays year-by-year data
   - Monte Carlo section shows success probability badge
   - Percentiles display (10th, 90th)
   - Analysis text appears
   - All 4 charts render (balance, Monte Carlo fan, allocation, cash flow)
4. Check console: Zero errors

**Workflow 4: Settings**

1. Click "Settings" button
2. Modify assumptions (e.g., equity growth rate)
3. Click "Save"
4. Verify: No console errors, plan updated

**Workflow 5: Import/Export**

1. Click "Export" button
2. Verify: Plan JSON downloads/copies
3. Clear plan list (for testing): Delete "Test Plan"
4. Click "Import" button
5. Paste exported JSON
6. Click "Import"
7. Verify: Plan reappears in list, no console errors

**Verification:**

- All 5 workflows complete without errors
- Console stays clean throughout
- All UI elements render correctly
- Monte Carlo results look reasonable (not all zero, not NaN)

### Task 5: Update Tests for Monte Carlo (Optional but Recommended)

**Actions:**

1. Review current test: `tests/unit/calculations/monte-carlo.test.js`
2. Update from placeholder to real tests:
   - Test `runMonteCarloSimulation` returns expected structure
   - Test `getSuccessProbabilityWithConfidence` calculates correct CI
   - Test `generateRandomReturn` produces values within expected range
3. Run tests: `npm test`
4. Verify: All Monte Carlo tests pass
5. Check coverage: `npm run test:coverage` (should increase from 0%)

**Verification:**

- All Monte Carlo unit tests pass
- Monte Carlo coverage increases from 0%
- Tests verify expected API contracts

## Open Questions

**None identified.** The root cause is clear (accidental deletion in Phase 1), and the fix is straightforward (restore from git history).

## Sources

### Primary (HIGH confidence)

- **Git commit 9d7b704** - Original Monte Carlo implementation (171 lines, fully tested)
- **Git commit d72c351** - Commit where Monte Carlo was accidentally deleted
- **Chrome DevTools** - Console errors confirmed broken imports and undefined `window.app`
- **Source code analysis** - ProjectionController, AppController, ChartRenderer, index.html reviewed

### Secondary (MEDIUM confidence)

- **Phase 3 planning documents** - 03-04-PLAN.md and 03-04-SUMMARY.md confirmed Monte Carlo was expected to exist
- **Phase 1 commit logs** - Confirmed ESLint/Prettier setup was the only major change

### Tertiary (LOW confidence)

- **None** - All findings are from direct code inspection and git history

## Metadata

**Confidence breakdown:**

- Root cause analysis: HIGH - Confirmed via git log and diff
- Solution approach: HIGH - Restore from git history is standard practice
- Dependencies: HIGH - Clear module loading failure cascade
- Risk assessment: MEDIUM - Potential for other deleted files, plan data structure changes

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable codebase, low risk of changes)

---

_Research complete. Ready for Phase 7 planning._
