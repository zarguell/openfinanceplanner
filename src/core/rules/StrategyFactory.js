/**
 * StrategyFactory - Factory for creating rule instances from configuration
 * Supports dynamic rule instantiation with validation
 */

import { BaseRule } from './BaseRule.js';

export class StrategyFactory {
  constructor() {
    this.ruleClasses = new Map();
  }

  /**
   * Register a rule class for instantiation
   * @param {string} ruleType - Rule type identifier
   * @param {class} RuleClass - Rule class constructor
   */
  registerRuleClass(ruleType, RuleClass) {
    if (typeof RuleClass !== 'function') {
      throw new Error(`RuleClass for "${ruleType}" must be a constructor function`);
    }

    this.ruleClasses.set(ruleType, RuleClass);
  }

  /**
   * Create a rule instance from configuration
   * @param {object} config - Rule configuration
   * @param {string} config.type - Rule type (must be registered)
   * @param {string} config.name - Rule name/ID
   * @param {object} config.settings - Rule-specific settings
   * @returns {BaseRule} Rule instance
   */
  create(config) {
    const { type, name, settings = {} } = config;

    if (!type) {
      throw new Error('Rule config must have a "type" property');
    }

    if (!name) {
      throw new Error('Rule config must have a "name" property');
    }

    const RuleClass = this.ruleClasses.get(type);

    if (!RuleClass) {
      throw new Error(`Unknown rule type: "${type}". Did you register the rule class?`);
    }

    const ruleConfig = {
      name,
      description: settings.description || `${type} strategy`,
      dependencies: settings.dependencies || [],
      ...settings,
    };

    const rule = new RuleClass(ruleConfig);

    if (!(rule instanceof BaseRule)) {
      throw new Error(`Rule class for "${type}" must extend BaseRule`);
    }

    const validation = rule.validate(ruleConfig);
    if (!validation.valid) {
      throw new Error(`Rule validation failed for "${name}": ${validation.errors.join(', ')}`);
    }

    return rule;
  }

  /**
   * Create multiple rules from configuration array
   * @param {object[]} configs - Array of rule configurations
   * @returns {BaseRule[]} Array of rule instances
   */
  createMany(configs) {
    return configs.map((config) => this.create(config));
  }

  /**
   * Check if a rule type is registered
   * @param {string} ruleType - Rule type to check
   * @returns {boolean} True if rule type is registered
   */
  hasRuleType(ruleType) {
    return this.ruleClasses.has(ruleType);
  }

  /**
   * Get all registered rule types
   * @returns {string[]} Array of rule type identifiers
   */
  listRuleTypes() {
    return Array.from(this.ruleClasses.keys());
  }

  /**
   * Unregister a rule class
   * @param {string} ruleType - Rule type to unregister
   * @returns {boolean} True if rule type was removed
   */
  unregisterRuleType(ruleType) {
    return this.ruleClasses.delete(ruleType);
  }

  /**
   * Clear all registered rule classes
   */
  clear() {
    this.ruleClasses.clear();
  }
}
