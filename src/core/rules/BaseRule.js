/**
 * BaseRule - Abstract base class for all financial strategy rules
 * All strategies must extend this class to implement the rule interface
 */

export class BaseRule {
  /**
   * Constructor
   * @param {object} config - Rule configuration
   * @param {string} config.name - Rule name/ID
   * @param {string} config.description - Human-readable description
   * @param {string[]} config.dependencies - List of rule IDs this rule depends on
   */
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.dependencies = config.dependencies || [];
  }

  /**
   * Apply the rule to a projection context
   * @param {object} context - Projection context
   * @param {object} context.plan - The financial plan
   * @param {number} context.yearOffset - Years from now
   * @param {object} context.projectionState - Current projection state
   * @returns {object} Rule application result
   */
  apply(context) {
    throw new Error(`${this.name}: apply() method must be implemented by subclass`);
  }

  /**
   * Validate the rule configuration
   * @param {object} config - Rule configuration to validate
   * @returns {object} { valid: boolean, errors: string[] }
   */
  validate(config) {
    const errors = [];

    if (!this.name || typeof this.name !== 'string') {
      errors.push('Rule must have a valid name');
    }

    if (!this.description || typeof this.description !== 'string') {
      errors.push('Rule must have a valid description');
    }

    if (!Array.isArray(this.dependencies)) {
      errors.push('Rule dependencies must be an array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get rule dependencies
   * @returns {string[]} Array of rule IDs this rule depends on
   */
  getDependencies() {
    return this.dependencies;
  }

  /**
   * Get rule metadata
   * @returns {object} Rule metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      dependencies: this.dependencies
    };
  }

  /**
   * Check if rule can run in given context
   * @param {object} context - Projection context
   * @returns {boolean} Can rule run?
   */
  canApply(context) {
    return true;
  }
}
