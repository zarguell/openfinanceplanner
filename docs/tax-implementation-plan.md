# Tax Engine Fix & State Tax Implementation Plan

## Current Status (January 2026)

### Federal Tax Engine - BROKEN ❌

- **Commit 41a0f64** introduced breaking changes to `src/calculations/tax.js`
- File has syntax errors and broken structure
- Unit tests failing (SyntaxError)
- Previous working implementation existed in commit `db9d9e5`

### State Tax - NOT Implemented ❌

- Only partial data exists: `STANDARD_DEDUCTIONS_DC_2025` (never used)
- No state tax calculation functions
- No state tax brackets for DC, CA, or NY
- No integration with projection engine

---

## Phase 1: Fix Federal Tax Engine (CRITICAL - P0)

### Task 1.1: Fix Syntax Errors in tax.js

**File**: `src/calculations/tax.js`

**Issues to fix**:

1. Line 7-31: Remove duplicate `TAX_BRACKETS_2024` declaration (first one is incomplete)
2. Line 28: Fix syntax error - remove extra colon: `{ rate: 0.12, min: 1160001, :  max: 4715000 }`
3. Line 30: Remove broken comment and complete `married_separate` bracket definition
4. Line 119-124: Remove `STANDARD_DEDUCTIONS_DC_2025` (not used)
5. Add back `STANDARD_DEDUCTIONS` object with both 2024 and 2025 data

**Reference working version** (from commit `db9d9e5`):

```javascript
const STANDARD_DEDUCTIONS = {
  2024: {
    single: 1460000,
    married_joint: 2920000,
    married_separate: 1460000,
    head_of_household: 2190000,
  },
  2025: {
    single: 1575000,
    married_joint: 3150000,
    married_separate: 1575000,
    head_of_household: 2362500,
  },
};
```

### Task 1.2: Verify Fix

1. Run unit tests: `node tests/unit/calculations/tax.test.js`
2. All tests should pass
3. No syntax errors
4. All tax functions work correctly

### Task 1.3: Update Documentation

- Update `docs/tasks.md` to reflect fixed status
- Mark federal tax as ✅ Complete
- Update "Next Steps" section

---

## Phase 2: Implement State Tax (P0)

### Task 2.1: Research State Tax Brackets

**States to implement**: DC, CA, NY

**For each state**, gather:

1. 2024 and 2025 tax brackets
2. Standard deduction amounts
3. Exemption thresholds (if applicable)
4. Any state-specific rules (e.g., CA has mental health tax)

**Sources**:

- Official state tax agency websites
- Tax Foundation state tax data
- IRS state tax information

### Task 2.2: Implement State Tax Constants in tax.js

Add to `src/calculations/tax.js`:

```javascript
// DC Tax Brackets (2025)
const STATE_TAX_BRACKETS_DC_2025 = {
  single: [
    { rate: 0.04, min: 0, max: 1000000 },
    { rate: 0.06, min: 1000001, max: 4000000 },
    { rate: 0.065, min: 4000001, max: 6000000 },
    { rate: 0.085, min: 6000001, max: 10000000 },
    { rate: 0.0875, min: 10000001, max: 40000000 },
    { rate: 0.089, min: 40000001, max: 100000000 },
    { rate: 0.0915, min: 100000001, max: 250000000 },
    { rate: 0.095, min: 250000001, max: 500000000 },
    { rate: 0.0965, min: 500000001, max: Infinity },
  ],
  // ... other filing statuses
};

// CA Tax Brackets (2025)
const STATE_TAX_BRACKETS_CA_2025 = {
  // Progressive brackets up to 13.3%
};

// NY Tax Brackets (2025)
const STATE_TAX_BRACKETS_NY_2025 = {
  // Progressive brackets up to 10.9%
};
```

### Task 2.3: Implement State Tax Calculation Function

Add to `src/calculations/tax.js`:

```javascript
/**
 * Calculate state income tax
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY')
 * @param {number} income - Taxable income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} State tax liability in cents
 */
export function calculateStateTax(state, income, filingStatus, year = 2025) {
  // Get state-specific brackets
  const brackets = getStateTaxBrackets(state, year, filingStatus);
  const deduction = getStateStandardDeduction(state, year, filingStatus);

  const taxableIncome = Math.max(0, income - deduction);

  // Calculate progressive tax
  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min + 1
    );

    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;

    remainingIncome -= taxableInBracket;
  }

  return Math.round(totalTax);
}

/**
 * Get state tax brackets for given state and year
 */
function getStateTaxBrackets(state, year, filingStatus) {
  const yearSuffix = year === 2024 ? '_2024' : '_2025';
  const bracketsKey = `STATE_TAX_BRACKETS_${state}${yearSuffix}`;

  const brackets = global[bracketsKey]; // or import

  if (!brackets || !brackets[filingStatus]) {
    throw new Error(`Invalid state or filing status: ${state}, ${filingStatus}, ${year}`);
  }

  return brackets[filingStatus];
}

/**
 * Get state standard deduction
 */
function getStateStandardDeduction(state, year, filingStatus) {
  // State-specific standard deduction logic
  // Some states (like CA) have their own standard deduction schedule
  // Others follow federal or have fixed amounts
}
```

### Task 2.4: Integrate State Tax into Tax Calculations

Add new function to combine federal and state taxes:

```javascript
/**
 * Calculate total income tax (federal + state)
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', or null)
 * @param {number} income - Gross income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year
 * @returns {object} Tax breakdown with federal, state, and total
 */
export function calculateTotalTax(state, income, filingStatus, year = 2025) {
  const federalTax = calculateFederalTax(income, filingStatus, year);
  const stateTax = state ? calculateStateTax(state, income, filingStatus, year) : 0;

  return {
    federalTax,
    stateTax,
    totalTax: federalTax + stateTax,
  };
}
```

### Task 2.5: Update Tax Schema & Domain Models

**Update `src/storage/schema.js`**:

- Add `state` field to `TaxProfile` if not present
- Validate state abbreviations against supported list: ['DC', 'CA', 'NY', null]

**Update `src/core/models/Plan.js`**:

- Ensure tax profile can store state
- Add method: `getTaxState()`

### Task 2.6: Integrate with Projection Engine

**Update `src/calculations/projection.js`**:

- Import `calculateTotalTax` or `calculateStateTax`
- Use state tax when projecting withdrawals from taxable accounts
- Include state tax in net income calculations

Example integration:

```javascript
// In projection loop, when calculating taxes:
const taxCalculation = calculateTotalTax(
  plan.taxProfile.state,
  totalIncome,
  plan.taxProfile.filingStatus,
  currentYear
);

totalTaxes = taxCalculation.federalTax + taxCalculation.stateTax;
```

### Task 2.7: Add Unit Tests for State Tax

Create `tests/unit/calculations/tax-state.test.js`:

```javascript
export function testDCTax() {
  const tax = calculateStateTax('DC', 5000000, 'single', 2025);
  // Verify against DC tax calculator
  console.assert(tax === expectedTax, 'DC tax calculation failed');
}

export function testCATax() {
  const tax = calculateStateTax('CA', 10000000, 'married_joint', 2025);
  // Verify against CA tax calculator
}

export function testNYTax() {
  const tax = calculateStateTax('NY', 7500000, 'single', 2025);
  // Verify against NY tax calculator
}

export function testTotalTax() {
  const total = calculateTotalTax('CA', 5000000, 'single', 2025);
  console.assert(
    total.totalTax === total.federalTax + total.stateTax,
    'Total tax should equal federal + state'
  );
}
```

### Task 2.8: Update Documentation

1. Update `docs/tasks.md`:
   - Mark state tax as ✅ Complete
   - Update Phase 1 completion status

2. Update `CLAUDE.md`:
   - Document new tax functions
   - Explain state tax integration
   - Update architecture section

---

## Phase 3: Verification & Testing (P0)

### Task 3.1: Run Full Test Suite

```bash
# Federal tax tests
node tests/unit/calculations/tax.test.js

# State tax tests
node tests/unit/calculations/tax-state.test.js

# Full integration test
node tests/integration/full-flow.test.js
```

### Task 3.2: Manual Verification

1. Create test plans with different states
2. Verify tax calculations match state tax calculators
3. Check projection engine uses state tax correctly
4. Verify UI displays state-specific tax breakdowns

---

## Success Criteria

Phase 1 complete when:

- ✅ No syntax errors in tax.js
- ✅ All unit tests pass
- ✅ Federal tax calculations verified accurate

Phase 2 complete when:

- ✅ State tax brackets implemented for DC, CA, NY
- ✅ `calculateStateTax()` function works for all states
- ✅ State tax integrated into projection engine
- ✅ Unit tests pass for state tax
- ✅ Tax profile schema includes state field

Phase 3 complete when:

- ✅ All tests pass (federal + state + integration)
- ✅ Manual verification confirms accuracy
- ✅ Documentation updated

---

## Estimated Timeline

- **Phase 1** (Fix Federal Tax): 1-2 hours
- **Phase 2** (Implement State Tax): 6-8 hours
  - Research: 2 hours
  - Implementation: 4 hours
  - Testing: 2 hours
- **Phase 3** (Verification): 1-2 hours

**Total**: 8-12 hours of focused work

---

## Next Steps After Completion

Once state tax is implemented, the tax calculation engine will be fully functional. Next priorities from `docs/tasks.md`:

1. Roth conversion calculations (pro-rata rules)
2. Medicare premium impact modeling
3. Social Security benefit estimation
4. Integration tests with real-world scenarios
5. Begin Phase 2: Rules Engine & Tax Strategies
