/**
 * RuleRegistry - Central registry for all financial strategy rules
 * Manages rule registration, retrieval, validation, and execution order
 */

export class RuleRegistry {
  constructor() {
    this.rules = new Map();
  }

  /**
   * Register a rule in the registry
   * @param {BaseRule} rule - Rule instance to register
   * @returns {object} { success: boolean, error: string | null }
   */
  register(rule) {
    if (!rule || typeof rule.apply !== 'function') {
      return {
        success: false,
        error: 'Rule must be an instance of BaseRule with apply() method'
      };
    }

    const validation = rule.validate();
    if (!validation.valid) {
      return {
        success: false,
        error: `Rule validation failed: ${validation.errors.join(', ')}`
      };
    }

    if (this.rules.has(rule.name)) {
      return {
        success: false,
        error: `Rule "${rule.name}" is already registered`
      };
    }

    this.rules.set(rule.name, rule);
    return { success: true, error: null };
  }

  /**
   * Unregister a rule from the registry
   * @param {string} ruleName - Name of rule to unregister
   * @returns {boolean} True if rule was removed
   */
  unregister(ruleName) {
    return this.rules.delete(ruleName);
  }

  /**
   * Get a rule by name
   * @param {string} ruleName - Name of rule to retrieve
   * @returns {BaseRule | undefined} Rule instance or undefined if not found
   */
  get(ruleName) {
    return this.rules.get(ruleName);
  }

  /**
   * Check if a rule is registered
   * @param {string} ruleName - Name of rule to check
   * @returns {boolean} True if rule is registered
   */
  has(ruleName) {
    return this.rules.has(ruleName);
  }

  /**
   * Get all registered rule names
   * @returns {string[]} Array of rule names
   */
  list() {
    return Array.from(this.rules.keys());
  }

  /**
   * Get all registered rules
   * @returns {BaseRule[]} Array of all rule instances
   */
  getAll() {
    return Array.from(this.rules.values());
  }

  /**
   * Validate rule dependencies
   * @returns {object} { valid: boolean, errors: string[] }
   */
  validateDependencies() {
    const errors = [];

    for (const rule of this.rules.values()) {
      for (const dep of rule.getDependencies()) {
        if (!this.rules.has(dep)) {
          errors.push(`Rule "${rule.name}" depends on "${dep}" which is not registered`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for circular dependencies in rules
   * @returns {object} { valid: boolean, cycles: string[][] }
   */
  detectCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (ruleName, path = []) => {
      if (recursionStack.has(ruleName)) {
        const cycleStart = path.indexOf(ruleName);
        cycles.push([...path.slice(cycleStart), ruleName]);
        return;
      }

      if (visited.has(ruleName)) {
        return;
      }

      visited.add(ruleName);
      recursionStack.add(ruleName);
      path.push(ruleName);

      const rule = this.rules.get(ruleName);
      if (rule) {
        for (const dep of rule.getDependencies()) {
          dfs(dep, [...path]);
        }
      }

      recursionStack.delete(ruleName);
    };

    for (const ruleName of this.rules.keys()) {
      if (!visited.has(ruleName)) {
        dfs(ruleName);
      }
    }

    return {
      valid: cycles.length === 0,
      cycles
    };
  }

  /**
   * Get rules in dependency order (topological sort)
   * @returns {BaseRule[]} Array of rules in dependency order
   */
  getExecutionOrder() {
    const order = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (ruleName) => {
      if (temp.has(ruleName)) {
        throw new Error(`Circular dependency detected involving "${ruleName}"`);
      }
      if (visited.has(ruleName)) {
        return;
      }

      const rule = this.rules.get(ruleName);
      if (!rule) {
        return;
      }

      temp.add(ruleName);

      for (const dep of rule.getDependencies()) {
        visit(dep);
      }

      temp.delete(ruleName);
      visited.add(ruleName);
      order.push(rule);
    };

    for (const ruleName of this.rules.keys()) {
      if (!visited.has(ruleName)) {
        visit(ruleName);
      }
    }

    return order;
  }

  /**
   * Clear all rules from registry
   */
  clear() {
    this.rules.clear();
  }

getStats() {
    return {
      totalRules: this.rules.size,
      ruleNames: this.list()
    };
  }

  applyRules(context) {
    const results = [];
    const executionOrder = this.getExecutionOrder();

    for (const rule of executionOrder) {
      if (rule.canApply(context)) {
        const result = rule.apply(context);
        results.push(result);
      }
    }

    return results;
  }
}
