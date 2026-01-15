/**
 * Rule Registry - Central registry for managing financial strategy rules
 * Provides registration, discovery, and management of all available rules
 */

import { RuleInterface } from './RuleInterface.js';

export class RuleRegistry {
  constructor() {
    this.rules = new Map(); // ruleId -> rule instance
    this.categories = new Map(); // category -> Set of ruleIds
    this.versions = new Map(); // ruleId -> version string
  }

  /**
   * Register a rule with the registry
   * @param {RuleInterface} rule - The rule instance to register
   * @throws {Error} If rule doesn't implement RuleInterface or registration fails
   */
  register(rule) {
    if (!(rule instanceof RuleInterface)) {
      throw new Error('Rule must implement RuleInterface');
    }

    const ruleId = rule.getId();
    const version = rule.getVersion();
    const category = rule.getCategory();

    // Validate rule has required methods
    this._validateRuleImplementation(rule);

    // Check for version conflicts
    if (this.rules.has(ruleId)) {
      const existingVersion = this.versions.get(ruleId);
      if (existingVersion !== version) {
        console.warn(
          `Rule ${ruleId} version mismatch: existing ${existingVersion}, registering ${version}`
        );
      }
    }

    // Register the rule
    this.rules.set(ruleId, rule);
    this.versions.set(ruleId, version);

    // Add to category index
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(ruleId);

    console.log(`Registered rule: ${ruleId} v${version} (${category})`);
  }

  /**
   * Unregister a rule from the registry
   * @param {string} ruleId - The ID of the rule to unregister
   * @returns {boolean} True if rule was unregistered, false if not found
   */
  unregister(ruleId) {
    if (!this.rules.has(ruleId)) {
      return false;
    }

    const rule = this.rules.get(ruleId);
    const category = rule.getCategory();

    // Remove from main registry
    this.rules.delete(ruleId);
    this.versions.delete(ruleId);

    // Remove from category index
    if (this.categories.has(category)) {
      this.categories.get(category).delete(ruleId);
      // Clean up empty categories
      if (this.categories.get(category).size === 0) {
        this.categories.delete(category);
      }
    }

    console.log(`Unregistered rule: ${ruleId}`);
    return true;
  }

  /**
   * Get a rule by its ID
   * @param {string} ruleId - The rule ID to retrieve
   * @returns {RuleInterface|null} The rule instance or null if not found
   */
  getRule(ruleId) {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Get all registered rules
   * @returns {Map} Map of ruleId -> rule instance
   */
  getAllRules() {
    return new Map(this.rules);
  }

  /**
   * Get rules by category
   * @param {string} category - The category to filter by
   * @returns {Array} Array of rule instances in the category
   */
  getRulesByCategory(category) {
    const ruleIds = this.categories.get(category);
    if (!ruleIds) {
      return [];
    }

    return Array.from(ruleIds)
      .map((ruleId) => this.rules.get(ruleId))
      .filter((rule) => rule !== undefined);
  }

  /**
   * Get all available categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Check if a rule is registered
   * @param {string} ruleId - The rule ID to check
   * @returns {boolean} True if the rule is registered
   */
  hasRule(ruleId) {
    return this.rules.has(ruleId);
  }

  /**
   * Get the version of a registered rule
   * @param {string} ruleId - The rule ID
   * @returns {string|null} The version string or null if not found
   */
  getRuleVersion(ruleId) {
    return this.versions.get(ruleId) || null;
  }

  /**
   * Get rules that have dependencies satisfied by the provided rule set
   * @param {Set|string[]} enabledRules - Set or array of enabled rule IDs
   * @returns {Array} Array of rule instances that can be applied
   */
  getApplicableRules(enabledRules) {
    const enabledSet = new Set(enabledRules);
    const applicable = [];

    for (const [ruleId, rule] of this.rules) {
      if (!enabledSet.has(ruleId)) {
        continue;
      }

      const dependencies = rule.getDependencies();
      const depsSatisfied = dependencies.every((depId) => enabledSet.has(depId));

      if (depsSatisfied) {
        applicable.push(rule);
      }
    }

    return applicable;
  }

  /**
   * Validate rule dependencies for a set of enabled rules
   * @param {Set|string[]} enabledRules - Set or array of enabled rule IDs
   * @returns {object} Validation result with isValid and missingDependencies
   */
  validateDependencies(enabledRules) {
    const enabledSet = new Set(enabledRules);
    const missingDeps = new Map(); // ruleId -> missing dependencies

    for (const ruleId of enabledSet) {
      const rule = this.rules.get(ruleId);
      if (!rule) {
        continue;
      }

      const dependencies = rule.getDependencies();
      const unsatisfied = dependencies.filter((depId) => !enabledSet.has(depId));

      if (unsatisfied.length > 0) {
        missingDeps.set(ruleId, unsatisfied);
      }
    }

    return {
      isValid: missingDeps.size === 0,
      missingDependencies: missingDeps,
    };
  }

  /**
   * Get a summary of registered rules
   * @returns {object} Summary object with counts and details
   */
  getSummary() {
    const summary = {
      totalRules: this.rules.size,
      categories: {},
      rules: [],
    };

    // Category counts
    for (const [category, ruleIds] of this.categories) {
      summary.categories[category] = ruleIds.size;
    }

    // Rule details
    for (const [ruleId, rule] of this.rules) {
      summary.rules.push({
        id: ruleId,
        name: rule.getName(),
        category: rule.getCategory(),
        version: rule.getVersion(),
        description: rule.getDescription(),
      });
    }

    return summary;
  }

  /**
   * Clear all registered rules
   */
  clear() {
    this.rules.clear();
    this.categories.clear();
    this.versions.clear();
    console.log('Rule registry cleared');
  }

  /**
   * Validate that a rule properly implements the RuleInterface
   * @private
   * @param {RuleInterface} rule - The rule to validate
   * @throws {Error} If validation fails
   */
  _validateRuleImplementation(rule) {
    const requiredMethods = [
      'getId',
      'getName',
      'getDescription',
      'getParameters',
      'validateParameters',
      'isApplicable',
      'apply',
      'getDependencies',
      'getVersion',
      'getCategory',
    ];

    for (const method of requiredMethods) {
      if (typeof rule[method] !== 'function') {
        throw new Error(`Rule missing required method: ${method}`);
      }
    }

    // Validate rule ID format
    const ruleId = rule.getId();
    if (!ruleId || typeof ruleId !== 'string' || !/^[a-z_]+$/.test(ruleId)) {
      throw new Error(`Invalid rule ID format: ${ruleId}. Must be lowercase with underscores.`);
    }

    // Validate category
    const category = rule.getCategory();
    const validCategories = [
      'tax_optimization',
      'withdrawal_strategy',
      'contribution_strategy',
      'retirement_planning',
    ];
    if (!validCategories.includes(category)) {
      throw new Error(
        `Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`
      );
    }
  }
}

// Export singleton instance
export const ruleRegistry = new RuleRegistry();
