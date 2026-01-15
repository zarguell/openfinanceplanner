# Open Finance Planner - Architecture Documentation

## Project Overview

Open Finance Planner is a client-side financial planning application that provides comprehensive financial projection capabilities. The application runs entirely in the browser, persists data using localStorage, and supports JSON import/export for data portability.

**Current Status:** Modular Architecture (Post-Refactoring)

The codebase has been refactored from a single-file implementation into a layered, modular architecture with clear separation of concerns. This establishes the foundation for complex financial planning rules and future scaling.

## Tech Stack Selection

**Vanilla JavaScript (ES2020+) with ES6 Modules**

- Zero build process or framework dependencies
- Native ES6 import/export for code organization
- Modular architecture with clear layer separation
- Eliminates framework churn and reduces maintenance burden

**Web Storage API**

- localStorage provides 5-10MB of persistent storage per domain
- Synchronous API simplifies state management for single-user scenarios
- No server infrastructure eliminates hosting costs and privacy concerns

**Web Workers**

- Offload heavy projection calculations to prevent UI thread blocking
- Maintain responsive interface during complex Monte Carlo simulations or 40-year projections

**IndexedDB (Future Enhancement)**

- Migration path when localStorage limits become restrictive
- Supports larger datasets for historical growth data import feature

## Major System Components

### 1. Core Calculation Engine

- **ProjectionRunner**: Orchestrates year-by-year simulations across all accounts
- **TaxEngine**: Modular rule-based system handling federal/state taxes, Roth conversions, backdoor Roth mechanics, and required minimum distributions
- **GrowthEngine**: Applies assumed growth rates with configurable volatility; designed for easy replacement with historical data module
- **ExpenseModeler**: Handles inflation-adjusted expense streams, one-time events, and dynamic spending rules

### 2. Data Layer

- **StorageManager**: Encapsulates all localStorage operations with versioning and migration logic
- **SchemaValidator**: JSON Schema-based validation for imported/exported data
- **SerializationService**: Handles conversion between UI format and storage format

### 3. Rule System

- **RuleRegistry**: Central registry for financial strategy implementations
- **StrategyFactory**: Instantiates appropriate rule handlers (e.g., BackdoorRothStrategy, RothConversionLadder)
- **TaxRuleInterface**: Standardized interface for all tax-related calculations enabling plug-and-play rule additions

#### RuleRegistry System (Sprint 11)

The RuleRegistry provides an extensible framework for implementing financial strategies as composable rules. This enables dynamic strategy execution and future support for rule composition (e.g., "Roth conversion + QCD").

**Core Components:**

1. **BaseRule** (`src/core/rules/BaseRule.js`)
   - Abstract base class defining the rule interface
   - All strategies must extend BaseRule
   - Required methods: `apply()`, `validate()`, `getDependencies()`
   - Optional methods: `canApply()`, `getMetadata()`

2. **RuleRegistry** (`src/core/rules/RuleRegistry.js`)
   - Central registry for all rule instances
   - Features:
     - Rule registration with validation
     - Dependency validation (missing dependencies, circular detection)
     - Topological sort for execution order
     - Rule retrieval and management

3. **StrategyFactory** (`src/core/rules/StrategyFactory.js`)
   - Factory pattern for dynamic rule instantiation
   - Register rule classes, create instances from config
   - Supports declarative rule configuration

**BaseRule Interface:**

```javascript
class CustomRule extends BaseRule {
  constructor(config) {
    super(config);
    this.name = config.name;
    this.description = config.description;
    this.dependencies = config.dependencies || [];
    // Custom properties
  }

  apply(context) {
    // context: { plan, yearOffset, projectionState }
    // Returns: { resultKey: value }
  }

  validate(config) {
    // Returns: { valid: boolean, errors: string[] }
  }

  canApply(context) {
    // Returns: boolean
  }
}
```

**Implemented Strategy Rules:**

- **RothConversionRule** (`src/core/rules/RothConversionRule.js`)
  - Wraps roth-conversions.js calculations
  - Strategies: fixed, bracket-fill, percentage
  - Applies to: Traditional 401k/IRA accounts

- **QCDRule** (`src/core/rules/QCDRule.js`)
  - Wraps qcd.js calculations
  - Strategies: fixed, percentage, rmd-based
  - Age requirement: 70.5+

- **TLHRule** (`src/core/rules/TLHRule.js`)
  - Wraps tax-loss-harvesting.js calculations
  - Strategies: all, offset-gains
  - Applies to: Taxable accounts only

**Usage Example:**

```javascript
import { RuleRegistry, RothConversionRule } from './core/rules/index.js';

// Create registry and register rules
const registry = new RuleRegistry();
const rothRule = new RothConversionRule({
  name: 'roth-conversions',
  description: 'Roth conversion strategy',
  strategy: 'bracket-fill',
  bracketTop: 89450,
});

registry.register(rothRule);

// Get execution order (topological sort)
const rules = registry.getExecutionOrder();

// Validate dependencies
const validation = registry.validateDependencies();
if (!validation.valid) {
  console.error(validation.errors);
}
```

**Future Enhancements:**

- Rule composition (combining multiple strategies)
- Dependency injection for projection state
- Rule metadata UI (display available strategies)
- Custom rule creation via UI

**Implemented Rules (Sprint 12):**

- **RothConversionRule** (`src/core/rules/RothConversionRule.js`)
  - Wraps roth-conversions.js calculations
  - Strategies: fixed, bracket-fill, percentage
  - Applies to: Traditional 401k/IRA accounts
  - Added `name` property to result for projection tracking
  - Fixed bug: missing `name` property in rule results

- **BackdoorRothRule** (`src/core/rules/BackdoorRothRule.js`)
  - Pro-rata calculations for IRS Form 8606 compliance
  - Income eligibility checking with phase-out thresholds
  - Annual contribution limits by year (2025: $7,000, 2026+: $8,000 for ages 50+)
  - Age requirement: 18+
  - Applies to: Traditional IRA accounts
  - Features:
    - Pro-rata calculation for pre-tax vs non-deductible contributions
    - Tax calculation on taxable portion of conversion
    - Income phase-out support (129k-144k for 2025)

- **MegaBackdoorRothRule** (`src/core/rules/MegaBackdoorRothRule.js`)
  - After-tax 401(k) contributions with in-service withdrawal
  - Enforces total 401(k) limit ($69,000 for 2025)
  - Employer match calculation and room availability
  - Plan eligibility flags (after-tax support, in-service withdrawal)
  - Applies to: 401(k) accounts with Roth conversion
  - Features:
    - Calculates available room for after-tax contributions
    - Immediate in-service withdrawal to Roth (tax-free)
    - Employer match tracking (cannot be converted)
    - Configurable employer match rate and deferral limits

**Implemented Rules (Sprint 12):**

- **BackdoorRothRule** (`src/core/rules/BackdoorRothRule.js`)
  - Pro-rata calculations for IRS Form 8606 compliance
  - Income eligibility checking with phase-out thresholds
  - Annual contribution limits by year (2025: $7,000, 2026+: $8,000 for ages 50+)
  - Age requirement: 18+
  - Applies to: Traditional IRA accounts
  - Features:
    - Pro-rata calculation for pre-tax vs non-deductible contributions
    - Tax calculation on taxable portion of conversion
    - Income phase-out support (129k-144k for 2025)

- **MegaBackdoorRothRule** (`src/core/rules/MegaBackdoorRothRule.js`)
  - After-tax 401(k) contributions with in-service withdrawal
  - Enforces total 401(k) limit ($69,000 for 2025)
  - Employer match calculation and room availability
  - Plan eligibility flags (after-tax support, in-service withdrawal)
  - Applies to: 401(k) accounts with Roth conversion
  - Features:
    - Calculates available room for after-tax contributions
    - Immediate in-service withdrawal to Roth (tax-free)
    - Employer match tracking (cannot be converted)
    - Configurable employer match rate and deferral limits

### 4. UI Controllers

- **PlanController**: Manages plan lifecycle (create, load, save, delete)
- **AccountController**: Handles account-specific operations and validations
- **ProjectionController**: Manages calculation triggers and result caching
- **ImportExportController**: Orchestrates file operations and data transformation

## API Endpoints (Module Interfaces)

### StorageManager API

```javascript
// Plan persistence
StorageManager.savePlan(planId, planData) → Promise<void>
StorageManager.loadPlan(planId) → Promise<Plan>
StorageManager.listPlans() → Promise<PlanMetadata[]>
StorageManager.deletePlan(planId) → Promise<void>

// Version management
StorageManager.getSchemaVersion() → string
StorageManager.migrateData(targetVersion) → Promise<void>
```

### TaxEngine API

```javascript
// Annual tax calculation
TaxEngine.calculateYear(projectionState, taxYear) → TaxResult

// Rule registration
TaxEngine.registerRule(ruleName, ruleImplementation) → void
TaxEngine.getApplicableRules(accountType, age) → Rule[]

// Roth-specific operations
TaxEngine.calculateRothConversionTax(amount, traditionalBalance, basis) → number
TaxEngine.validateBackdoorRothEligibility(income, filingStatus) → boolean

// Required Minimum Distributions (RMD)
TaxEngine.calculateRMD(accountBalance, age) → number
TaxEngine.mustTakeRMD(age, birthYear) → boolean
TaxEngine.calculateTotalRMD(accounts, age) → number

// Social Security Benefits
TaxEngine.calculateSocialSecurityBenefit(pia, birthYear, filingAge) → number
TaxEngine.calculateTaxableSocialSecurity(annualBenefit, provisionalIncome, filingStatus) → object
TaxEngine.estimatePIA(averageIndexedEarnings) → number
```

#### RMD Module Details

**Implementation**: `src/calculations/rmd.js`

- Implements IRS Uniform Lifetime Table (ages 72-120)
- Supports SECURE Act 2.0: RMDs start at age 73 (or 72 if born in 1951)
- Exemptions: Roth IRAs, HSAs, and taxable brokerage accounts
- Only applies to tax-advantaged retirement accounts (401k, traditional IRA)
- Life expectancy factors capped at age 120+

**Exported Functions**:

- `getLifeExpectancyFactor(age)` - Returns IRS life expectancy factor
- `calculateRMD(accountBalance, age)` - Basic RMD calculation
- `mustTakeRMD(age, birthYear)` - Determines if RMD required
- `getRMDStartAge(birthYear)` - Returns 72 (born 1951) or 73 (all others)
- `calculateRMDForAccount(account, age)` - Account-specific RMD
- `calculateTotalRMD(accounts, age)` - Sum of RMDs across all accounts
- `getRMDDeadline(age, birthYear)` - Returns deadline string

#### Social Security Module Details

**Implementation**: `src/calculations/social-security.js`

- Full Retirement Age (FRA) determination based on birth year (62-67, depending on birth year)
- Primary Insurance Amount (PIA) calculation with 2025 bend points
- Early claiming reductions (5.5%/month first 36 months, 5/12% thereafter)
- Delayed retirement credits (8% per year, maximum at age 70)
- Social Security taxation (50%/85% based on provisional income thresholds)
- Cost-of-Living Adjustment (COLA) calculations for inflation

**Exported Functions**:

- `calculateFullRetirementAge(birthYear)` - Returns FRA in years and months
- `calculateSocialSecurityBenefit(pia, birthYear, filingAge, currentYear, retirementYear, colaRate)` - Monthly benefit
- `calculateSocialSecurityForYear(socialSecurity, yearOffset, currentAge, retirementAge, inflationRate)` - Annual SS for year
- `calculateTaxableSocialSecurity(annualBenefit, provisionalIncome, filingStatus)` - Returns taxable portion
- `estimatePIA(averageIndexedEarnings)` - Estimates monthly PIA from AIME
- `getClaimingStrategyOptions()` - Returns common claiming age strategies

#### Withdrawal Strategies Module Details

**Implementation**: `src/calculations/withdrawal-strategies.js`

- Provides multiple withdrawal ordering strategies for retirement distributions
- Integrates with RMD calculations to ensure regulatory compliance
- Supports tax-efficient withdrawal sequencing to minimize lifetime tax burden
- Pure function design enables easy testing and composition

**Available Strategies**:

1. **Proportional** (default)
   - Distributes withdrawals proportionally to account balances
   - Simple approach that maintains asset allocation
   - Not tax-optimized

2. **Tax-Efficient** (recommended)
   - Prioritizes withdrawals by tax treatment to minimize lifetime taxes
   - Order: Required RMDs → Taxable → Traditional → Roth → HSA
   - Depletes taxable accounts first (capital gains rates)
   - Preserves tax-free Roth and HSA accounts for last
   - RMDs always satisfied first (regulatory requirement)

3. **Tax-Aware** (advanced, placeholder)
   - Future enhancement for bracket management
   - Will implement dynamic withdrawal sizing based on tax brackets
   - Goal: Stay in lower tax brackets while managing RMDs

**Exported Functions**:

- `proportionalWithdrawalStrategy(accounts, totalAmount, rmdRequirements)` - Proportional distribution
- `taxEfficientWithdrawalStrategy(accounts, totalAmount, rmdRequirements, context)` - Tax-optimized ordering
- `taxAwareWithdrawalStrategy(accounts, totalAmount, rmdRequirements, context)` - Future bracket-aware strategy
- `calculateWithdrawals(strategy, accounts, totalAmount, rmdRequirements, context)` - Main entry point

**Account Priority Order (Tax-Efficient)**:

```javascript
const ACCOUNT_PRIORITY = {
  Taxable: 1, // Capital gains rates (typically lower)
  IRA: 2, // Ordinary income (deferred)
  '401k': 2, // Ordinary income (deferred)
  Roth: 3, // Tax-free (save for last)
  HSA: 4, // Tax-free medical (save for last)
};
```

**Integration with Projection Engine**:

- RMD requirements calculated first for all Traditional accounts
- Roth conversions executed before withdrawals (if enabled)
- Conversions use three strategies: fixed, bracket-fill, percentage
- Total withdrawal needed = max(deficit, total RMDs)
- Strategy allocates withdrawals across accounts
- All monetary values in cents (integers)
- Pure functions (no side effects, easy to test)

#### Roth Conversion Module Details

**Implementation**: `src/calculations/roth-conversions.js`

- Implements multiple Roth conversion strategies for tax-efficient retirement planning
- Supports tax impact analysis and net benefit calculations
- Handles pro-rata basis for mixed IRAs (pre-tax + after-tax)
- Tracks 5-year rule for penalty-free withdrawals

**Available Strategies**:

1. **Fixed Annual Conversion**
   - Convert same amount every year (if available)
   - Simple approach, predictable tax impact
   - Ignores RMDs (conversions are separate)

2. **Bracket-Fill Conversion**
   - Convert just enough to fill up to top of current tax bracket
   - Maximizes conversions at current marginal rate
   - Requires knowing current taxable income

3. **Percentage-Based Conversion**
   - Convert a fixed percentage of traditional balance each year
   - Adapts to balance changes (market growth)
   - Common approach: 5-10% annually

4. **Backdoor Roth Conversion**
   - Convert after-tax contributions (basis) to Roth
   - Tax-free since taxes already paid on the money
   - Applies to after-tax 401(k) contributions or non-deductible IRA contributions

**Exported Functions**:

- `calculateConversionTax()` - Tax impact of conversion
- `calculateBracketFillConversion()` - Fill to top of bracket
- `calculateFixedConversion()` - Fixed annual amount
- `calculatePercentageConversion()` - Percentage of balance
- `calculateBackdoorRothConversion()` - After-tax basis conversion
- `calculateProRataBasis()` - Pro-rata basis for mixed IRAs
- `isPenaltyFree()` - Check 5-year rule compliance
- `optimizeConversionsAcrossYears()` - Multi-year conversion planning
- `analyzeConversion()` - Net benefit analysis

**Integration with Projection**:

- Conversions executed after RMD calculations, before withdrawals
- Conversion amount taxed as ordinary income that year
- Balance transferred: Traditional decreased, Roth increased
- Conversion taxes added to yearly tax totals
- Results include `rothConversions` field showing annual conversions

**Schema Support**:

- `plan.rothConversions.enabled` - Whether conversions enabled
- `plan.rothConversions.strategy` - Strategy: 'fixed' | 'bracket-fill' | 'percentage'

#### QCD Module Details

**Implementation**: `src/calculations/qcd.js`

- Implements Qualified Charitable Distribution (QCD) calculations for tax-efficient charitable giving
- Supports three QCD strategies: fixed amount, percentage of balance, RMD-based
- Calculates tax benefit of QCDs vs. taxable withdrawals
- Enforces IRS rules: age 70½+ requirement, $100,000 annual limit per person
- Handles pro-rata distribution across multiple eligible accounts

**Available Strategies**:

1. **Fixed Annual QCD**
   - Donate same fixed amount each year (e.g., $10,000/year)
   - Simple approach, predictable tax savings
   - Capped at $100,000 per IRS rules

2. **Percentage-Based QCD**
   - Donate a fixed percentage of Traditional account balance each year
   - Adapts to balance changes (market growth/decreases)
   - Common approach: 5-10% annually

3. **RMD-Based QCD**
   - Donate the full RMD amount to charity instead of taking it as taxable income
   - Maximizes tax savings by eliminating RMD taxes entirely
   - Only applies if QCDs don't exceed $100,000 limit

**Exported Functions**:

- `mustTakeQCD(age)` - Check if user must take QCD (age 70.5+)
- `canAccountTakeQCD(accountType)` - Check if account type eligible (IRA, 401k only)
- `calculateQCDForAccount(account, qcdSettings, rmdAmount)` - Calculate QCD for specific account
- `calculateTotalQCD(accounts, qcdSettings, totalRmdCents)` - Calculate total QCDs across all accounts
- `getQCDLimit()` - Returns IRS annual limit ($100,000)
- `getQCDMinimumAge()` - Returns minimum age for QCDs (70.5 years)
- `calculateQCDTaxBenefit(qcdAmount, marginalTaxRate)` - Calculate tax savings from QCDs
- `validateQCDSettings(qcdSettings)` - Validate QCD configuration

**Integration with Projection**:

- QCDs calculated after RMD requirements are determined
- QCDs count toward RMD requirement (reduce required RMD withdrawal)
- QCDs deducted from account balances before growth and withdrawals
- QCDs are tax-free (no federal/state tax on charitable distribution)
- Results include `totalQCD` field showing annual QCD amounts
- QCDs only apply to IRA and 401k accounts (Roth, HSA, Taxable excluded)

**Schema Support**:

- `plan.qcdSettings.enabled` - Whether QCDs enabled
- `plan.qcdSettings.strategy` - Strategy: 'fixed' | 'percentage' | 'rmd'
- `plan.qcdSettings.annualAmount` - Fixed annual amount (in cents)
- `plan.qcdSettings.percentage` - Percentage for percentage strategy (0-1)
- `plan.qcdSettings.marginalTaxRate` - Marginal tax rate for benefit calc (0-1)
- `plan.rothConversions.annualAmount` - Fixed amount (cents)
- `plan.rothConversions.percentage` - Percentage (decimal)
- `plan.rothConversions.bracketTop` - Bracket top (cents) for bracket-fill

#### Tax-Loss Harvesting Module Details

**Implementation**: `src/calculations/tax-loss-harvesting.js`

- Implements tax-loss harvesting calculations for Taxable accounts to reduce taxes
- Supports two harvesting strategies: all losses, offset gains + $3,000 ordinary income
- Calculates tax benefit from harvested losses (offsets capital gains + ordinary income)
- Tracks cost basis for Taxable accounts to measure unrealized gains/losses
- Enforces IRS $3,000 annual ordinary income offset limit
- Threshold-based harvesting (only harvest losses above configurable minimum)

**Available Strategies**:

1. **All Available Losses**
   - Harvest all unrealized losses above threshold
   - Maximizes tax benefits but may reduce portfolio diversification
   - Simple approach, conservative tax optimization

2. **Offset Gains + $3,000**
   - Harvest only enough to offset realized capital gains + $3,000 ordinary income
   - More targeted approach, preserves tax lots for future use
   - Reduces portfolio turnover

**Tax Benefit Calculation**:

- Losses first offset realized capital gains (15% long-term capital gains rate assumed)
- Remaining losses offset up to $3,000 of ordinary income (at marginal tax rate)
- Example: $10,000 harvested loss with $5,000 gains and 24% marginal rate
  - Gains offset: $5,000 × 15% = $750
  - Ordinary income offset: $3,000 × 24% = $720
  - Total benefit: $1,470

**Exported Functions**:

- `calculateUnrealizedLoss(account)` - Calculate unrealized loss for single account (Taxable only)
- `calculateTotalUnrealizedLoss(accounts)` - Sum unrealized losses across all accounts
- `calculateTaxBenefitFromLoss(harvestedLossCents, capitalGainsCents, marginalRate)` - Calculate tax savings
- `suggestHarvestingAmount(unrealizedLossCents, capitalGainsCents, marginalRate, settings)` - Suggest amount to harvest
- `validateHarvestingAmount(harvestAmountCents, account)` - Validate harvest amount is valid
- `applyHarvesting(account, harvestAmountCents)` - Apply harvest, reset cost basis
- `isHarvestingEnabled(settings)` - Check if TLH enabled
- `getStrategyDescription(strategy)` - Human-readable strategy description

**Integration with Projection**:

- Taxable account snapshots track both balance and costBasis
- Unrealized losses calculated each year before growth application
- Harvesting applied when losses exceed threshold and strategy triggers
- Harvesting resets costBasis to new value (simulates sell + rebuy)
- Tax benefit deducted from totalTax calculation
- Results include `taxBenefitFromHarvesting` and `harvestedLoss` fields
- Only applies to Taxable accounts (401k, IRA, Roth, HSA excluded)
- Assumes long-term holdings (>1 year) → uses 15% capital gains rate (simplified)
- No wash-sale rule tracking (future enhancement)

**Schema Support**:

- `plan.taxLossHarvesting.enabled` - Whether TLH enabled
- `plan.taxLossHarvesting.strategy` - Strategy: 'all' | 'offset-gains'
- `plan.taxLossHarvesting.threshold` - Minimum loss to harvest (cents, default $1,000)
- `account.costBasis` - Track cost basis for Taxable accounts (cents, equals balance initially)

### ProjectionRunner API

```javascript
// Full projection execution
ProjectionRunner.execute(planConfig, yearsToProject) → ProjectionResult

// Partial recalculation
ProjectionRunner.recalculateFromYear(startYear, updatedState) → ProjectionResult

// Worker management
ProjectionRunner.setWorkerPool(size) → void
ProjectionRunner.terminate() → void
```

## Database Schema (localStorage)

### Key Structure: `retirement_plans_v{version}_{planId}`

```json
{
  "metadata": {
    "planId": "uuid",
    "name": "string",
    "created": "ISO timestamp",
    "lastModified": "ISO timestamp",
    "schemaVersion": "1.0"
  },
  "assumptions": {
    "inflationRate": "number (0.03)",
    "marketGrowthRate": "number (0.07)",
    "bondGrowthRate": "number (0.04)"
  },
  "accounts": [
    {
      "id": "uuid",
      "type": "401k|IRA|Roth|Taxable|HSA",
      "name": "string",
      "balance": "number (cents)",
      "contributions": [
        {
          "year": "number",
          "amount": "number (cents)",
          "type": "employee|employer|catchup"
        }
      ],
      "withdrawalStrategy": "string"
    }
  ],
  "taxProfile": {
    "filingStatus": "single|married_joint|married_separate|head",
    "state": "string",
    "currentAge": "number",
    "retirementAge": "number",
    "rothBasis": "number (cents)"
  },
  "backdoorRoth": {
    "enabled": "boolean",
    "annualContribution": "number (dollars, default: 6000)",
    "incomeThreshold": "number (dollars, default: 129000)",
    "phaseOutEnd": "number (dollars, default: 144000)"
  },
  "megaBackdoorRoth": {
    "enabled": "boolean",
    "annualContribution": "number (dollars, default: 15000)",
    "planSupportsAfterTax": "boolean (default: true)",
    "planSupportsInServiceWithdrawal": "boolean (default: true)",
    "employerMatchRate": "number (0.04 default)",
    "employeeDeferralLimit": "number (dollars, 23500 for 2025)",
    "total401kLimit": "number (dollars, 69000 for 2025)"
  },
  "expenses": [
    {
      "id": "uuid",
      "name": "string",
      "baseAmount": "number (cents)",
      "startYear": "number",
      "endYear": "number|null",
      "inflationAdjusted": "boolean"
    }
  ],
  "rules": [
    {
      "ruleId": "backdoor_roth_2026",
      "enabled": "boolean",
      "parameters": {}
    }
  ]
}
```

### Storage Keys Convention

- `retirement_plans_metadata`: Array of plan summaries for listing
- `retirement_plans_v1_{uuid}`: Individual plan data
- `app_config`: User preferences and UI state
- `schema_version`: Current schema version for migration detection

## Dependencies

**Runtime: Zero dependencies**

**Development/Testing:**

- `jsonschema` (for validation logic porting to vanilla JS)
- `web-worker-mock` (testing environment)
- `puppeteer` (end-to-end testing)

**Optional Enhancements:**

- `chart.js` (visualizations, loaded via CDN on demand)
- `comlink` (simplifies Web Worker communication)

## Validation and Testing Strategy

### Unit Testing

- **Calculation Engine**: Test each financial formula in isolation using known test vectors from IRS publications
- **Tax Rules**: Validate each rule against IRS worksheets (e.g., Form 8606 for Roth conversions)
- **Storage Layer**: Mock localStorage and test serialization/deserialization roundtrips

### Integration Testing

- **End-to-End Projections**: Run 1-year, 10-year, and 40-year projections comparing output to established calculators
- **Import/Export Cycle**: Verify data integrity through export → import → re-export sequence
- **Schema Migration**: Test automated migration from v1 to v2 schemas

### Performance Testing

- **Worker Threading**: Ensure UI remains responsive during 40-year Monte Carlo simulations
- **Memory Usage**: Monitor heap size with large plan datasets (20+ accounts, 50+ expense streams)
- **localStorage Limits**: Test behavior as approach 5MB storage cap

### Validation Approach

- JSON Schema validation for all imported data with semantic checks
- Business rule validation (e.g., catch-up contributions only allowed after age 50)
- Real-time input validation with contextual error messages

## Potential Risks and Complexity Hotspots

### 1. Tax Calculation Accuracy

**Risk**: Incorrect tax calculations could lead users to make poor financial decisions.
**Mitigation**:

- Separate tax engine with pluggable rules
- Unit tests against IRS-provided examples
- Community audit process for rule implementations
- Clear disclaimers about estimation nature

### 2. localStorage Data Loss

**Risk**: Browser data clearing or storage quotas could destroy user plans.
**Mitigation**:

- Automated export reminders
- Versioned backups in localStorage
- Clear user education about browser storage limitations
- Future IndexedDB migration path

### 3. Rule System Complexity

**Risk**: Interdependencies between rules (e.g., Roth conversions affecting RMDs) create combinatorial complexity.
**Mitigation**:

- Immutable state passing between rule executions
- Directed acyclic graph for rule dependency management
- Comprehensive integration test suite covering rule interactions

### 4. Performance with Complex Plans

**Risk**: 40-year projections with multiple accounts and dynamic rules may exceed single-thread performance.
**Mitigation**:

- Web Worker implementation with chunked processing
- Memoization of intermediate year calculations
- Progressive loading of projection results

### 5. Schema Evolution

**Risk**: Adding new features requires schema changes that break existing saved plans.
**Mitigation**:

- Versioned schema with automated migration scripts
- Backward compatibility layer for at least two major versions
- Export format that includes schema version metadata

### 6. Browser Compatibility

**Risk**: Advanced APIs (Web Workers, structured cloning) may behave differently across browsers.
**Mitigation**:

- Feature detection with graceful degradation
- Target modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Polyfill strategy for critical missing APIs
