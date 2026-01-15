/**
 * Rule Interface - Standardized contract for all financial strategy rules
 * All rules must implement this interface to be compatible with the RuleEngine
 */

/**
 * Base Rule Interface that all financial strategy rules must implement
 * @interface
 */
export class RuleInterface {
  /**
   * Get the unique identifier for this rule
   * @returns {string} Rule identifier (e.g., 'backdoor_roth', 'roth_conversion_ladder')
   */
  getId() {
    throw new Error('RuleInterface.getId() must be implemented by subclass');
  }

  /**
   * Get the human-readable name for this rule
   * @returns {string} Display name (e.g., 'Backdoor Roth IRA')
   */
  getName() {
    throw new Error('RuleInterface.getName() must be implemented by subclass');
  }

  /**
   * Get the description of what this rule does
   * @returns {string} Detailed description for UI display
   */
  getDescription() {
    throw new Error('RuleInterface.getDescription() must be implemented by subclass');
  }

  /**
   * Get the configuration parameters this rule accepts
   * @returns {Array} Array of parameter definitions with validation rules
   */
  getParameters() {
    throw new Error('RuleInterface.getParameters() must be implemented by subclass');
  }

  /**
   * Validate that the provided parameters are valid for this rule
   * @param {object} parameters - Parameter values to validate
   * @returns {object} Validation result with isValid boolean and error messages
   */
  validateParameters(parameters) {
    throw new Error('RuleInterface.validateParameters() must be implemented by subclass');
  }

  /**
   * Check if this rule is applicable given the current plan state
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year (0 = current year)
   * @param {object} projectionState - Current state of the projection
   * @returns {boolean} True if rule should be applied
   */
  isApplicable(plan, yearOffset, projectionState) {
    throw new Error('RuleInterface.isApplicable() must be implemented by subclass');
  }

  /**
   * Apply the rule to modify the projection state
   * @param {object} plan - The financial plan
   * @param {number} yearOffset - Years from current year
   * @param {object} projectionState - Current projection state (modified in-place)
   * @param {object} parameters - Rule-specific parameters
   * @returns {object} Result object with applied changes and metadata
   */
  apply(plan, yearOffset, projectionState, parameters) {
    throw new Error('RuleInterface.apply() must be implemented by subclass');
  }

  /**
   * Get the rule dependencies (other rules that must be applied first)
   * @returns {Array} Array of rule IDs that this rule depends on
   */
  getDependencies() {
    throw new Error('RuleInterface.getDependencies() must be implemented by subclass');
  }

  /**
   * Get the version of this rule implementation
   * @returns {string} Semantic version (e.g., '1.0.0')
   */
  getVersion() {
    throw new Error('RuleInterface.getVersion() must be implemented by subclass');
  }

  /**
   * Get the category this rule belongs to
   * @returns {string} Category (e.g., 'tax_optimization', 'withdrawal_strategy', 'contribution_strategy')
   */
  getCategory() {
    throw new Error('RuleInterface.getCategory() must be implemented by subclass');
  }
}

/**
 * Parameter definition for rule configuration
 */
export class ParameterDefinition {
  constructor(
    name,
    type,
    required = false,
    defaultValue = null,
    validation = null,
    description = ''
  ) {
    this.name = name;
    this.type = type; // 'number', 'boolean', 'string', 'select'
    this.required = required;
    this.defaultValue = defaultValue;
    this.validation = validation; // Validation function or object
    this.description = description;
    this.options = []; // For select type, array of {value, label} objects
  }
}

/**
 * Rule application result
 */
export class RuleResult {
  constructor(applied, changes = {}, metadata = {}) {
    this.applied = applied; // Boolean indicating if rule was applied
    this.changes = changes; // Object describing what changed (accounts, taxes, etc.)
    this.metadata = metadata; // Additional information about the application
  }
}
