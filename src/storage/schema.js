/**
 * Storage schema definitions and version management
 * Handles migration between schema versions
 */

export const CURRENT_SCHEMA_VERSION = '1.0';

export const STORAGE_KEYS = {
  PLANS_LIST: 'ofp_plans_list',
  PLAN_PREFIX: 'ofp_plan_',
  APP_CONFIG: 'ofp_app_config',
  SCHEMA_VERSION: 'ofp_schema_version'
};

/**
 * Validate plan structure against schema requirements
 * @param {object} planData - Plan data to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePlanSchema(planData) {
  const errors = [];

  if (!planData.id || typeof planData.id !== 'string') {
    errors.push('Plan must have a valid id');
  }

  if (!planData.name || typeof planData.name !== 'string') {
    errors.push('Plan must have a valid name');
  }

  if (!planData.taxProfile || typeof planData.taxProfile !== 'object') {
    errors.push('Plan must have a taxProfile object');
  }

  // MVP: Use estimatedTaxRate instead of detailed tax calculations
  if (typeof planData.taxProfile.estimatedTaxRate !== 'number' || planData.taxProfile.estimatedTaxRate < 0 || planData.taxProfile.estimatedTaxRate > 1) {
    errors.push('taxProfile.estimatedTaxRate must be a number between 0 and 1 (e.g., 0.25 for 25%)');
  }

  // Optional: Keep state field for future advanced features
  if (planData.taxProfile.state !== null && planData.taxProfile.state !== undefined && (typeof planData.taxProfile.state !== 'string' || planData.taxProfile.state === '')) {
    errors.push('taxProfile.state must be a string (e.g., "DC", "CA", "NY") or null');
  }

  if (planData.taxProfile.state !== null && planData.taxProfile.state !== undefined && ![
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ].includes(planData.taxProfile.state)) {
    errors.push('taxProfile.state must be a valid 2-letter US state or territory code, or null');
  }

  if (!planData.assumptions || typeof planData.assumptions !== 'object') {
    errors.push('Plan must have an assumptions object');
  }

  if (!Array.isArray(planData.accounts)) {
    errors.push('Plan must have an accounts array');
  }

  if (!Array.isArray(planData.expenses)) {
    errors.push('Plan must have an expenses array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Migrate plan data to current schema version
 * @param {object} planData - Plan data to migrate
 * @param {string} fromVersion - Source schema version
 * @returns {object} Migrated plan data
 */
export function migratePlan(planData, fromVersion) {
  // For now, no migrations needed (v1.0 is initial version)
  // Future: Add migration logic here when schema evolves

  return planData;
}
