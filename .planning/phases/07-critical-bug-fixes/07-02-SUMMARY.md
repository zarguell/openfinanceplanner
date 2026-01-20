---
phase: 07-critical-bug-fixes
plan: 02
date: 2026-01-20
commits:
  - hash: 103b305
    type: fix
    task: add currentPlan setter to auto-sync controllers
    files:
      - src/ui/AppController.js
  - hash: d25efe6
    type: fix
    task: add null checks to controller methods
    files:
      - src/ui/ExpenseIncomeController.js
      - src/ui/AccountController.js
      - src/ui/PlanController.js
  - hash: 8c4bf8c
    type: fix
    task: add defensive check for missing TLH settings
    files:
      - src/ui/PlanController.js
---

# Plan 07-02: Verify App Initialization and Console Errors

## Status: Complete ✓

## What Was Accomplished

Fixed **BUGFIX-02** (app initialization) and **BUGFIX-03** (console errors) by resolving root cause: controllers not receiving live `currentPlan` reference when plan is selected.

## Issues Fixed

### 1. currentPlan Setter (commit 103b305)

**Root Cause:** Controllers were initialized with `null` currentPlan in constructor and never updated when plan was selected.

**Fix:** Added getter/setter pattern for `currentPlan` property that auto-syncs to all controllers:

```javascript
set currentPlan(value) {
  this._currentPlan = value;
  this.planController.currentPlan = value;
  this.accountController.currentPlan = value;
  this.expenseIncomeController.currentPlan = value;
  this.projectionController.currentPlan = value;
}
```

**Impact:** When user selects a plan, all controllers immediately get updated reference.

### 2. Null Checks (commit d25efe6)

**Root Cause:** Methods accessed `this.currentPlan` without checking if it exists, causing crashes when no plan selected.

**Fix:** Added null checks at start of 7 methods:

- `ExpenseIncomeController.addIncome()` - alerts "Please create or select a plan first"
- `ExpenseIncomeController.addExpense()` - alerts user
- `AccountController.addAccount()` - alerts user
- `AccountController.editAccount()` - alerts user
- `PlanController.saveSocialSecurity()` - alerts user
- `PlanController.saveAssumptions()` - alerts user
- `PlanController.savePlanSettings()` - alerts user

**Impact:** No more crashes - helpful alerts guide user to create/select plan first.

### 3. Missing TLH Settings Defense (commit 8c4bf8c)

**Root Cause:** `savePlanSettings()` tried to access Tax Loss Harvesting elements (`settingsTLHEnabled.checked`) that don't exist in modal HTML.

**Fix:** Added defensive check:

```javascript
const tlhEnabledEl = document.getElementById('settingsTLHEnabled');
if (tlhEnabledEl) {
  // Access TLH elements
} else {
  // Preserve existing TLH settings with defaults
  this.currentPlan.taxLossHarvesting = this.currentPlan.taxLossHarvesting || {
    enabled: false,
    strategy: 'threshold',
    threshold: 100000,
  };
}
```

**Impact:** Can save plan settings without crash. TLH functionality preserved when feature is fully implemented.

## Verification Results

✅ window.app initialized (typeof === 'object')
✅ All 9 onclick handlers functional (no "app is not defined" errors)
✅ Zero console errors during typical workflow
✅ All app methods accessible via window.app
✅ Helpful alerts when operations attempted without plan selected
✅ Plan settings save without errors

## Deviations from Plan

None - all issues discovered during checkpoint were fixed.

## Blocking Issues Resolved

- BUGFIX-01 (07-01): Monte Carlo module restored ✓
- BUGFIX-02 (07-02): App initialization fixed ✓
- BUGFIX-03 (07-02): Console errors resolved ✓

## Next Steps

Proceed to Wave 3 (07-03-PLAN.md) for end-to-end workflow verification.
