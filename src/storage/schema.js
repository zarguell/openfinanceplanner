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

  if (planData.taxProfile.state !== null && (typeof planData.taxProfile.state !== 'string' || planData.taxProfile.state === '')) {
    errors.push('taxProfile.state must be a string (e.g., "DC", "CA", "NY") or null');
  }

  if (planData.taxProfile.state !== null && !['DC', 'CA', 'NY'].includes(planData.taxProfile.state)) {
    errors.push('taxProfile.state must be a valid state code (DC, CA, NY, or null)');
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
