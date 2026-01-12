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
```

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
