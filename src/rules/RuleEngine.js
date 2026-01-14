/**
 * Rule Engine - Orchestrates the application of financial strategy rules
 * Manages rule dependencies, ordering, and state transitions during projections
 */

import { ruleRegistry } from './RuleRegistry.js';
import { RuleResult } from './RuleInterface.js';

export class RuleEngine {
  constructor() {
    this.appliedRules = new Map(); // yearOffset -> applied rule results
    this.ruleOrder = []; // Ordered list of rule IDs for application
    this.errors = []; // Track errors during rule application
  }

  /**
   * Initialize the rule engine with a set of enabled rules
   * @param {string[]|Set} enabledRules - Array or Set of enabled rule IDs
   * @param {object} ruleParameters - Parameters for each rule (ruleId -> params)
   * @returns {object} Initialization result with success and any errors
   */
  initialize(enabledRules, ruleParameters = {}) {
    this.clear();

    const enabledSet = new Set(enabledRules);
    const initResult = {
      success: true,
      errors: [],
      warnings: [],
      ruleOrder: []
    };

    // Validate dependencies
    const depValidation = ruleRegistry.validateDependencies(enabledSet);
    if (!depValidation.isValid) {
      initResult.success = false;
      for (const [ruleId, missingDeps] of depValidation.missingDependencies) {
        initResult.errors.push(`Rule ${ruleId} missing dependencies: ${missingDeps.join(', ')}`);
      }
      return initResult;
    }

    // Build rule application order (topological sort based on dependencies)
    this.ruleOrder = this._buildRuleOrder(enabledSet);

    // Validate parameters for each rule
    for (const ruleId of this.ruleOrder) {
      const params = ruleParameters[ruleId] || {};
      const paramValidation = ruleRegistry.getRule(ruleId).validateParameters(params);

      if (!paramValidation.isValid) {
        initResult.errors.push(`Invalid parameters for ${ruleId}: ${paramValidation.errors.join(', ')}`);
        initResult.success = false;
      }
    }

    if (initResult.success) {
      initResult.ruleOrder = [...this.ruleOrder];
    }

    return initResult;
  }

  /**
   * Apply all enabled rules for a specific year in the projection
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year (0 = current year)
   * @param {object} projectionState - Current projection state (modified in-place)
   * @param {object} ruleParameters - Parameters for each rule
   * @returns {object} Application result with applied rules and any errors
   */
  applyRulesForYear(plan, yearOffset, projectionState, ruleParameters = {}) {
    const yearResult = {
      yearOffset,
      appliedRules: [],
      skippedRules: [],
      errors: [],
      warnings: []
    };

    // Initialize applied rules for this year if not exists
    if (!this.appliedRules.has(yearOffset)) {
      this.appliedRules.set(yearOffset, []);
    }

    // Apply rules in dependency order
    for (const ruleId of this.ruleOrder) {
      const rule = ruleRegistry.getRule(ruleId);
      if (!rule) {
        yearResult.errors.push(`Rule not found: ${ruleId}`);
        continue;
      }

      const params = ruleParameters[ruleId] || {};

      try {
        // Check if rule is applicable for this context
        if (!rule.isApplicable(plan, yearOffset, projectionState)) {
          yearResult.skippedRules.push({
            ruleId,
            reason: 'not_applicable'
          });
          continue;
        }

        // Apply the rule
        const ruleResult = rule.apply(plan, yearOffset, projectionState, params);

        // Store the result
        const appliedResult = {
          ruleId,
          applied: ruleResult.applied,
          changes: ruleResult.changes,
          metadata: ruleResult.metadata
        };

        this.appliedRules.get(yearOffset).push(appliedResult);
        yearResult.appliedRules.push(appliedResult);

        // Track any rule-specific warnings
        if (ruleResult.metadata?.warnings) {
          yearResult.warnings.push(...ruleResult.metadata.warnings.map(w => `${ruleId}: ${w}`));
        }

      } catch (error) {
        const errorMsg = `Error applying rule ${ruleId}: ${error.message}`;
        yearResult.errors.push(errorMsg);
        this.errors.push({
          yearOffset,
          ruleId,
          error: errorMsg,
          timestamp: new Date().toISOString()
        });

        console.error(errorMsg);
        // Continue with other rules rather than failing completely
      }
    }

    return yearResult;
  }

  /**
   * Apply rules for multiple years in a projection
   * @param {object} plan - The financial plan
   * @param {number} yearsToProject - Number of years to project
   * @param {object} ruleParameters - Parameters for each rule
   * @param {Function} yearCallback - Optional callback for each year's results
   * @returns {object} Multi-year application results
   */
  applyRulesForProjection(plan, yearsToProject, ruleParameters = {}, yearCallback = null) {
    const projectionResult = {
      totalYears: yearsToProject,
      yearsProcessed: 0,
      totalAppliedRules: 0,
      totalSkippedRules: 0,
      totalErrors: 0,
      yearResults: [],
      summary: {}
    };

    // Create a copy of the initial projection state
    const baseProjectionState = this._createInitialProjectionState(plan);

    for (let yearOffset = 0; yearOffset <= yearsToProject; yearOffset++) {
      // Clone the projection state for this year
      const yearProjectionState = JSON.parse(JSON.stringify(baseProjectionState));

      // Apply rules for this year
      const yearResult = this.applyRulesForYear(plan, yearOffset, yearProjectionState, ruleParameters);

      // Update counters
      projectionResult.yearsProcessed++;
      projectionResult.totalAppliedRules += yearResult.appliedRules.length;
      projectionResult.totalSkippedRules += yearResult.skippedRules.length;
      projectionResult.totalErrors += yearResult.errors.length;

      // Store year result
      projectionResult.yearResults.push({
        yearOffset,
        ...yearResult,
        projectionState: yearProjectionState
      });

      // Call callback if provided
      if (yearCallback) {
        yearCallback(yearOffset, yearResult, yearProjectionState);
      }
    }

    // Generate summary
    projectionResult.summary = this._generateProjectionSummary(projectionResult);

    return projectionResult;
  }

  /**
   * Get the results of rule application for a specific year
   * @param {number} yearOffset - The year offset to query
   * @returns {Array} Array of applied rule results for that year
   */
  getYearResults(yearOffset) {
    return this.appliedRules.get(yearOffset) || [];
  }

  /**
   * Get all rule application results
   * @returns {Map} Map of yearOffset -> array of applied rule results
   */
  getAllResults() {
    return new Map(this.appliedRules);
  }

  /**
   * Get errors that occurred during rule application
   * @returns {Array} Array of error objects
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Clear all stored results and reset the engine
   */
  clear() {
    this.appliedRules.clear();
    this.ruleOrder = [];
    this.errors = [];
  }

  /**
   * Get the current rule application order
   * @returns {Array} Array of rule IDs in application order
   */
  getRuleOrder() {
    return [...this.ruleOrder];
  }

  /**
   * Build the rule application order using topological sort
   * @private
   * @param {Set} enabledRules - Set of enabled rule IDs
   * @returns {Array} Ordered array of rule IDs
   */
  _buildRuleOrder(enabledRules) {
    const order = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (ruleId) => {
      if (visited.has(ruleId)) return;
      if (visiting.has(ruleId)) {
        throw new Error(`Circular dependency detected involving rule: ${ruleId}`);
      }

      visiting.add(ruleId);

      const rule = ruleRegistry.getRule(ruleId);
      if (rule) {
        const dependencies = rule.getDependencies();
        for (const depId of dependencies) {
          if (enabledRules.has(depId)) {
            visit(depId);
          }
        }
      }

      visiting.delete(ruleId);
      visited.add(ruleId);
      order.push(ruleId);
    };

    for (const ruleId of enabledRules) {
      if (!visited.has(ruleId)) {
        visit(ruleId);
      }
    }

    return order;
  }

  /**
   * Create the initial projection state for rule application
   * @private
   * @param {object} plan - The financial plan
   * @returns {object} Initial projection state
   */
  _createInitialProjectionState(plan) {
    // This creates a basic projection state that rules can modify
    // In practice, this would be integrated with the main projection logic
    return {
      accounts: plan.accounts.map(acc => ({
        ...acc,
        balance: acc.balance,
        contributions: 0,
        withdrawals: 0,
        taxesPaid: 0
      })),
      expenses: plan.expenses.map(exp => ({
        ...exp,
        amount: 0
      })),
      income: {
        earnedIncome: 0,
        socialSecurity: 0,
        totalIncome: 0
      },
      taxes: {
        federal: 0,
        state: 0,
        fica: 0,
        total: 0
      },
      metadata: {
        year: new Date().getFullYear(),
        age: plan.taxProfile.currentAge,
        isRetired: false
      }
    };
  }

  /**
   * Generate a summary of projection results
   * @private
   * @param {object} projectionResult - The full projection result
   * @returns {object} Summary statistics
   */
  _generateProjectionSummary(projectionResult) {
    const summary = {
      totalRulesApplied: 0,
      rulesAppliedByType: {},
      mostActiveRules: [],
      errorRate: 0,
      yearsWithErrors: 0
    };

    const ruleCounts = {};
    let totalErrors = 0;
    let yearsWithErrors = 0;

    for (const yearResult of projectionResult.yearResults) {
      summary.totalRulesApplied += yearResult.appliedRules.length;

      for (const appliedRule of yearResult.appliedRules) {
        ruleCounts[appliedRule.ruleId] = (ruleCounts[appliedRule.ruleId] || 0) + 1;
      }

      if (yearResult.errors.length > 0) {
        totalErrors += yearResult.errors.length;
        yearsWithErrors++;
      }
    }

    // Rules applied by type
    for (const [ruleId, count] of Object.entries(ruleCounts)) {
      const rule = ruleRegistry.getRule(ruleId);
      const type = rule ? rule.getCategory() : 'unknown';
      summary.rulesAppliedByType[type] = (summary.rulesAppliedByType[type] || 0) + count;
    }

    // Most active rules
    summary.mostActiveRules = Object.entries(ruleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([ruleId, count]) => ({ ruleId, count }));

    summary.errorRate = projectionResult.yearsProcessed > 0 ?
      (totalErrors / projectionResult.yearsProcessed) : 0;

    summary.yearsWithErrors = yearsWithErrors;

    return summary;
  }
}

// Export singleton instance
export const ruleEngine = new RuleEngine();
