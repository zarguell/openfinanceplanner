/**
 * Strategy Factory - Factory pattern for creating financial strategy rule instances
 * Provides centralized instantiation and parameter injection for all rules
 */

import { ruleRegistry } from './RuleRegistry.js';

export class StrategyFactory {
  constructor() {
    this.ruleConstructors = new Map(); // ruleId -> constructor function
  }

  /**
   * Register a rule constructor with the factory
   * @param {string} ruleId - The rule ID
   * @param {Function} constructorFn - The constructor function for the rule
   */
  registerConstructor(ruleId, constructorFn) {
    if (typeof constructorFn !== 'function') {
      throw new Error('Constructor must be a function');
    }
    this.ruleConstructors.set(ruleId, constructorFn);
    console.log(`Registered constructor for rule: ${ruleId}`);
  }

  /**
   * Create a rule instance with the given parameters
   * @param {string} ruleId - The rule ID to create
   * @param {object} parameters - Parameters to pass to the rule constructor
   * @returns {RuleInterface} The created rule instance
   * @throws {Error} If rule is not registered or creation fails
   */
  createRule(ruleId, parameters = {}) {
    const constructorFn = this.ruleConstructors.get(ruleId);
    if (!constructorFn) {
      throw new Error(`No constructor registered for rule: ${ruleId}`);
    }

    try {
      const ruleInstance = new constructorFn(parameters);

      // Validate that the created instance implements RuleInterface
      if (!ruleInstance.getId || ruleInstance.getId() !== ruleId) {
        throw new Error(`Created rule instance does not match expected ID: ${ruleId}`);
      }

      // Validate parameters if the rule supports it
      if (typeof ruleInstance.validateParameters === 'function') {
        const validation = ruleInstance.validateParameters(parameters);
        if (!validation.isValid) {
          throw new Error(`Invalid parameters for rule ${ruleId}: ${validation.errors.join(', ')}`);
        }
      }

      return ruleInstance;
    } catch (error) {
      throw new Error(`Failed to create rule ${ruleId}: ${error.message}`);
    }
  }

  /**
   * Create multiple rules at once
   * @param {Array} ruleConfigs - Array of {ruleId, parameters} objects
   * @returns {Array} Array of created rule instances
   */
  createRules(ruleConfigs) {
    return ruleConfigs.map((config) => {
      const { ruleId, parameters = {} } = config;
      return this.createRule(ruleId, parameters);
    });
  }

  /**
   * Create rules from a plan's rule configuration
   * @param {object} planRulesConfig - Plan's rules configuration object
   * @returns {Array} Array of created rule instances
   */
  createRulesFromPlanConfig(planRulesConfig) {
    if (!planRulesConfig || !planRulesConfig.enabledRules) {
      return [];
    }

    const ruleConfigs = planRulesConfig.enabledRules.map((ruleId) => ({
      ruleId,
      parameters: planRulesConfig.parameters?.[ruleId] || {},
    }));

    return this.createRules(ruleConfigs);
  }

  /**
   * Get available rule IDs that can be created
   * @returns {Array} Array of rule IDs with registered constructors
   */
  getAvailableRuleIds() {
    return Array.from(this.ruleConstructors.keys());
  }

  /**
   * Check if a rule can be created
   * @param {string} ruleId - The rule ID to check
   * @returns {boolean} True if the rule can be created
   */
  canCreateRule(ruleId) {
    return this.ruleConstructors.has(ruleId);
  }

  /**
   * Get the expected parameters for a rule
   * @param {string} ruleId - The rule ID
   * @returns {Array|null} Array of parameter definitions or null if rule not found
   */
  getRuleParameters(ruleId) {
    const rule = ruleRegistry.getRule(ruleId);
    return rule ? rule.getParameters() : null;
  }

  /**
   * Validate parameters for a rule without creating an instance
   * @param {string} ruleId - The rule ID
   * @param {object} parameters - Parameters to validate
   * @returns {object} Validation result
   */
  validateRuleParameters(ruleId, parameters = {}) {
    const rule = ruleRegistry.getRule(ruleId);
    if (!rule) {
      return { isValid: false, errors: [`Rule not found: ${ruleId}`] };
    }

    if (typeof rule.validateParameters !== 'function') {
      return { isValid: true, errors: [] }; // Assume valid if no validation method
    }

    return rule.validateParameters(parameters);
  }

  /**
   * Get rule metadata for UI display
   * @param {string} ruleId - The rule ID
   * @returns {object|null} Rule metadata or null if not found
   */
  getRuleMetadata(ruleId) {
    const rule = ruleRegistry.getRule(ruleId);
    if (!rule) {
      return null;
    }

    return {
      id: rule.getId(),
      name: rule.getName(),
      description: rule.getDescription(),
      category: rule.getCategory(),
      version: rule.getVersion(),
      parameters: rule.getParameters(),
      dependencies: rule.getDependencies(),
      canCreate: this.canCreateRule(ruleId),
    };
  }

  /**
   * Get metadata for all available rules
   * @returns {Array} Array of rule metadata objects
   */
  getAllRuleMetadata() {
    const availableIds = this.getAvailableRuleIds();
    return availableIds
      .map((ruleId) => this.getRuleMetadata(ruleId))
      .filter((meta) => meta !== null);
  }

  /**
   * Clear all registered constructors
   */
  clear() {
    this.ruleConstructors.clear();
    console.log('Strategy factory cleared');
  }

  /**
   * Auto-register constructors from a rules directory
   * This is a helper method for development - dynamically imports and registers rules
   * @param {string} rulesDir - Directory containing rule files (default: './strategies/')
   * @returns {Promise<void>}
   */
  async autoRegisterConstructors(rulesDir = './strategies/') {
    // This would typically scan a directory and import all rule files
    // For now, this is a placeholder for future enhancement
    console.log(`Auto-registration from ${rulesDir} not yet implemented`);
  }
}

// Export singleton instance
export const strategyFactory = new StrategyFactory();
