# Open Finance Planner - Manual Testing Checklist

**Purpose:** Comprehensive manual testing to verify all functionality works correctly after the maintainability overhaul

**Date:** 2026-01-17

**Testing Phase:** 06-02 (Validation & Polish)

---

## Setup Instructions

### Prerequisites

1. **Open the application:**
   - Option 1: Open `index.html` directly in a browser
   - Option 2: Run `npm run serve` and navigate to `http://localhost:3030`

2. **Browser versions tested:**
   - Chrome 90+ ✅
   - Firefox 88+ ✅
   - Safari 14+ ✅

3. **Open DevTools:**
   - Chrome/Edge: `Cmd+Option+I` (Mac) or `F12` (Windows)
   - Firefox: `Cmd+Option+I` (Mac) or `F12` (Windows)
   - Safari: `Cmd+Option+I` (Mac) - must be enabled in Safari > Preferences > Advanced

4. **Monitor console:**
   - Switch to Console tab
   - Verify no console errors on initial load
   - Keep console open throughout testing

---

## Core Functionality Tests

### 1. Application Load

- [ ] **Application loads without errors**
  - Open `index.html` in browser
  - Verify: Page displays correctly with all UI elements
  - Console: No red errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Dark mode toggle works**
  - Click the dark mode toggle button (moon/sun icon)
  - Verify: Colors change appropriately (light ↔ dark)
  - Verify: Toggle state persists across page refresh
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 2. Plan Management

- [ ] **Create new plan**
  - Click "Create New Plan" button
  - Verify: Plan creation modal appears
  - Enter plan name: "Test Plan"
  - Click "Create"
  - Verify: New plan appears in plan list
  - Verify: Plan details display correctly
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Save plan to localStorage**
  - Make changes to plan (add account, expense, etc.)
  - Click "Save Plan" button
  - Verify: Success message appears
  - Verify: Changes persist after page refresh
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Load plan from localStorage**
  - Refresh page (`Cmd+R` / `F5`)
  - Verify: Plan loads automatically
  - Verify: All data displays correctly
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 3. Account Management

- [ ] **Add 401(k) account**
  - Click "Add Account" button
  - Select account type: "401(k)"
  - Enter values: Name="Test 401k", Balance=$100000, GrowthRate=8%
  - Click "Add"
  - Verify: Account appears in account list
  - Verify: Balance displays correctly
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Add IRA account**
  - Click "Add Account" button
  - Select account type: "IRA"
  - Enter values: Name="Test IRA", Balance=$50000, GrowthRate=7%
  - Click "Add"
  - Verify: Account appears in account list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Add Roth IRA account**
  - Click "Add Account" button
  - Select account type: "Roth IRA"
  - Enter values: Name="Test Roth IRA", Balance=$30000, GrowthRate=8%
  - Click "Add"
  - Verify: Account appears in account list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Add HSA account**
  - Click "Add Account" button
  - Select account type: "HSA"
  - Enter values: Name="Test HSA", Balance=$10000, GrowthRate=5%
  - Click "Add"
  - Verify: Account appears in account list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Add Taxable account**
  - Click "Add Account" button
  - Select account type: "Taxable"
  - Enter values: Name="Test Taxable", Balance=$20000, GrowthRate=8%
  - Click "Add"
  - Verify: Account appears in account list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Edit account**
  - Click "Edit" button on an account
  - Verify: Edit modal appears with current values
  - Change balance to new value
  - Click "Save"
  - Verify: Account updates in list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Delete account**
  - Click "Delete" button on an account
  - Verify: Confirmation dialog appears
  - Click "Confirm"
  - Verify: Account removed from list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 4. Expense Management

- [ ] **Add expense with inflation**
  - Click "Add Expense" button
  - Enter values: Name="Housing", Amount=$2000, Inflation=3%
  - Click "Add"
  - Verify: Expense appears in expense list
  - Verify: Values display correctly
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Add multiple expenses**
  - Add expense: "Food", $800, inflation 3%
  - Add expense: "Healthcare", $500, inflation 5%
  - Add expense: "Transportation", $400, inflation 2%
  - Verify: All expenses appear in list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Edit expense**
  - Click "Edit" button on an expense
  - Verify: Edit modal appears with current values
  - Change amount to new value
  - Click "Save"
  - Verify: Expense updates in list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Delete expense**
  - Click "Delete" button on an expense
  - Verify: Confirmation dialog appears
  - Click "Confirm"
  - Verify: Expense removed from list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 5. Income Management

- [ ] **Add salary income**
  - Click "Add Income" button
  - Enter values: Name="Salary", Amount=$80000, StartAge=30, EndAge=65
  - Click "Add"
  - Verify: Income appears in income list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Add Social Security income**
  - Click "Add Income" button
  - Select type: "Social Security"
  - Enter values: Name="SS", Amount=$20000, StartAge=67
  - Click "Add"
  - Verify: Income appears in income list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Edit income**
  - Click "Edit" button on an income source
  - Verify: Edit modal appears with current values
  - Change amount to new value
  - Click "Save"
  - Verify: Income updates in list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Delete income**
  - Click "Delete" button on an income source
  - Verify: Confirmation dialog appears
  - Click "Confirm"
  - Verify: Income removed from list
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 6. Projections

- [ ] **Run projections**
  - Add 2-3 accounts with balances
  - Add 2-3 expenses with amounts
  - Add 1-2 income sources
  - Click "Run Projections" button
  - Verify: Projections generate
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Charts render correctly**
  - After running projections, verify chart area displays
  - Verify: Portfolio balance chart appears with data
  - Verify: Income vs Expenses chart appears
  - Verify: Tax breakdown chart appears (if applicable)
  - Console: No Chart.js errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Chart tooltips work**
  - Hover over data points in charts
  - Verify: Tooltips display with correct values
  - Verify: Year-by-year breakdown shows
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 7. Data Portability

- [ ] **Export plan to JSON**
  - Click "Export Plan" button
  - Verify: File download triggers
  - Save JSON file to local machine
  - Verify: File contains valid JSON (open in text editor)
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Import plan from JSON**
  - Click "Create New Plan" (to clear current state)
  - Click "Import Plan" button
  - Select the previously exported JSON file
  - Verify: All data loads correctly
  - Verify: Accounts match exported data
  - Verify: Expenses match exported data
  - Verify: Income sources match exported data
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

---

## Calculation Verification

### 8. Tax Calculations

- [ ] **Federal tax calculations**
  - Add income that triggers federal tax
  - Run projections
  - Verify: Federal tax amounts display in projection table
  - Verify: Tax brackets apply progressively (10%, 12%, 22%, etc.)
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **State tax calculations**
  - Set state in plan settings (e.g., California)
  - Run projections
  - Verify: State tax amounts display
  - Verify: State-specific rates apply
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 9. RMD Calculations

- [ ] **RMD triggers at correct age**
  - Add IRA account with balance
  - Set plan age range beyond 73 (RMD age)
  - Run projections
  - Verify: RMD calculations start at age 73
  - Verify: RMD amounts display in projection table
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 10. Projection Updates

- [ ] **Projections update when inputs change**
  - Run initial projections
  - Note portfolio value at age 65
  - Modify account balance (increase by 50%)
  - Re-run projections
  - Verify: Portfolio values increase proportionally
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 11. Monte Carlo Simulation

- [ ] **Monte Carlo simulation runs**
  - Add accounts and run projections
  - Click "Run Monte Carlo" button (if available)
  - Verify: Simulation progress indicator appears
  - Verify: Confidence interval results display
  - Verify: Percentile bands (10th, 50th, 90th) show
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 12. Strategy Rules

- [ ] **Backdoor Roth strategy**
  - Add income that exceeds direct Roth contribution limits
  - Enable Backdoor Roth strategy in plan settings
  - Run projections
  - Verify: Backdoor Roth conversions appear in projection
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **QCD (Qualified Charitable Distribution) strategy**
  - Add IRA account
  - Enable QCD strategy in plan settings
  - Set age beyond 70½
  - Run projections
  - Verify: QCD amounts appear in projection
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

---

## UI/UX Tests

### 13. Form Validation

- [ ] **Account form validation**
  - Try adding account with negative balance
  - Verify: Validation error appears
  - Try adding account with blank name
  - Verify: Validation error appears
  - Try adding account with non-numeric balance
  - Verify: Input rejects invalid data
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Expense form validation**
  - Try adding expense with negative amount
  - Verify: Validation error appears
  - Try adding expense with inflation > 100%
  - Verify: Validation error appears
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

- [ ] **Income form validation**
  - Try adding income with negative amount
  - Verify: Validation error appears
  - Try adding income with end age < start age
  - Verify: Validation error appears
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 14. Error Messages

- [ ] **Error messages display appropriately**
  - Trigger validation errors (see above)
  - Verify: Error messages appear near invalid fields
  - Verify: Error messages are clear and actionable
  - Verify: Errors disappear when corrected
  - Console: No uncaught exceptions
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 15. Modal Behavior

- [ ] **Modals open and close properly**
  - Open "Add Account" modal
  - Click "Cancel" or X to close
  - Verify: Modal closes without saving
  - Re-open modal and add account
  - Verify: Modal closes after save
  - Repeat for other modals (Expense, Income)
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 16. Chart Responsiveness

- [ ] **Charts are responsive**
  - Resize browser window
  - Verify: Charts resize to fit container
  - Verify: No horizontal scrollbar appears
  - Verify: Chart data remains visible
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 17. Navigation

- [ ] **Navigation works**
  - Click through different sections (Accounts, Expenses, Income, Projections)
  - Verify: Active section highlights
  - Verify: Content switches correctly
  - Verify: No page reloads (SPA navigation)
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 18. Data Persistence

- [ ] **Data persists across page refresh**
  - Create plan with accounts, expenses, income
  - Save plan
  - Refresh page (`Cmd+R` / `F5`)
  - Verify: All data displays correctly
  - Verify: No data loss
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

---

## Regression Tests

### 19. localStorage Schema Versioning

- [ ] **localStorage schema versioning works**
  - Check localStorage for `ofp_schema_version`
  - Verify: Current version is stored
  - Clear localStorage and reload
  - Verify: Default plan created
  - Console: No migration errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 20. No Data Loss on Save/Load

- [ ] **No data loss on save/load**
  - Create complex plan with multiple accounts, expenses, income
  - Save plan
  - Refresh page
  - Verify: All accounts present
  - Verify: All expenses present
  - Verify: All income sources present
  - Verify: No corruption or missing data
  - Console: No errors
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 21. No Console Errors During Normal Operation

- [ ] **No console errors during normal operation**
  - Open DevTools console
  - Perform all operations from tests above
  - Verify: No red errors appear
  - Verify: No uncaught exceptions
  - Verify: No warnings about deprecated APIs
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 22. Charts Display Without Errors

- [ ] **Charts display without errors**
  - Run projections
  - Verify: All charts render
  - Console: No Chart.js errors
  - Console: No canvas-related errors
  - Verify: No "undefined" or "NaN" in chart data
  - Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

---

## Browser Compatibility

### 23. Chrome Testing

- [ ] **Chrome compatibility**
  - Browser: Chrome 90+
  - Complete all tests above
  - Overall Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 24. Firefox Testing

- [ ] **Firefox compatibility**
  - Browser: Firefox 88+
  - Complete all tests above
  - Overall Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

### 25. Safari Testing (if available)

- [ ] **Safari compatibility**
  - Browser: Safari 14+
  - Complete all tests above
  - Overall Result: ✅ PASS / ❌ FAIL
  - Notes: _____________________________________________________________

---

## Test Results Summary

**Date Tested:** ________________________

**Browser(s) Tested:** ________________________

**Tests Passed:** _____ / 25

**Tests Failed:** _____ / 25

**Overall Status:** ✅ ALL PASS / ❌ ISSUES FOUND

---

## Issues Found

If any tests failed, document issues below:

### Issue #1: ________________________

- **Severity:** ❌ Critical / ⚠️ High / ⚡ Medium / 📝 Low
- **Test Reference:** Test #_____
- **Steps to Reproduce:**
  1. ________________________
  2. ________________________
  3. ________________________
- **Expected Behavior:** ________________________
- **Actual Behavior:** ________________________
- **Console Errors:** ________________________

### Issue #2: ________________________

- **Severity:** ❌ Critical / ⚠️ High / ⚡ Medium / 📝 Low
- **Test Reference:** Test #_____
- **Steps to Reproduce:**
  1. ________________________
  2. ________________________
  3. ________________________
- **Expected Behavior:** ________________________
- **Actual Behavior:** ________________________
- **Console Errors:** ________________________

---

## Recommendations

**Optional improvements discovered during testing:**

1. ___________________________________________________________

2. ___________________________________________________________

3. ___________________________________________________________

**Edge cases to handle in future:**

1. ___________________________________________________________

2. ___________________________________________________________

3. ___________________________________________________________

**UX enhancements:**

1. ___________________________________________________________

2. ___________________________________________________________

3. ___________________________________________________________

---

## Tester Notes

**Overall Experience:** ⭐⭐⭐⭐⭐ (1-5)

**What worked well:**
- ___________________________________________________________

**What needs improvement:**
- ___________________________________________________________

**Additional comments:**
- ___________________________________________________________

---

**Testing completed by:** ________________________

**Date:** ________________________
