/**
 * StorageManager - Encapsulates all localStorage operations
 * Provides versioning, migration, and validation for stored data
 */
import { STORAGE_KEYS, validatePlanSchema, migratePlan, CURRENT_SCHEMA_VERSION } from './schema.js';

export class StorageManager {
  /**
   * Save a plan to localStorage
   * @param {object} plan - Plan object to save
   * @throws {Error} If validation fails
   */
  static savePlan(plan) {
    const validation = validatePlanSchema(plan);
    if (!validation.valid) {
      throw new Error(`Invalid plan schema: ${validation.errors.join(', ')}`);
    }

    const key = STORAGE_KEYS.PLAN_PREFIX + plan.id;
    localStorage.setItem(key, JSON.stringify(plan));
    this.updatePlansList();
  }

  /**
   * Load a plan from localStorage
   * @param {string} planId - Plan ID to load
   * @returns {object|null} Plan object or null if not found
   */
  static loadPlan(planId) {
    const key = STORAGE_KEYS.PLAN_PREFIX + planId;
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    try {
      const plan = JSON.parse(data);
      return plan;
    } catch (error) {
      console.error('Failed to parse plan data:', error);
      return null;
    }
  }

  /**
   * List all plans in localStorage
   * @returns {Array} Array of plan metadata objects
   */
  static listPlans() {
    const listData = localStorage.getItem(STORAGE_KEYS.PLANS_LIST);
    if (!listData) {
      return [];
    }

    try {
      const list = JSON.parse(listData);
      return list
        .map((meta) => ({
          ...meta,
          lastModified: new Date(meta.lastModified),
        }))
        .sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error('Failed to parse plans list:', error);
      return [];
    }
  }

  /**
   * Update the cached plans list metadata
   * @private
   */
  static updatePlansList() {
    const list = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.PLAN_PREFIX)) {
        try {
          const plan = JSON.parse(localStorage.getItem(key));
          list.push({
            id: plan.id,
            name: plan.name,
            created: plan.created,
            lastModified: plan.lastModified,
          });
        } catch (error) {
          console.error(`Failed to parse plan at key ${key}:`, error);
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.PLANS_LIST, JSON.stringify(list));
  }

  /**
   * Delete a plan from localStorage
   * @param {string} planId - Plan ID to delete
   */
  static deletePlan(planId) {
    const key = STORAGE_KEYS.PLAN_PREFIX + planId;
    localStorage.removeItem(key);
    this.updatePlansList();
  }

  /**
   * Export a plan as JSON string
   * @param {object} plan - Plan object to export
   * @returns {string} JSON string representation
   */
  static exportPlan(plan) {
    const exportData = {
      ...plan,
      _exportMeta: {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        application: 'Open Finance Planner',
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import a plan from JSON string
   * @param {string} jsonString - JSON string to import
   * @returns {object} Imported plan object
   * @throws {Error} If JSON is invalid or schema validation fails
   */
  static importPlan(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Remove export metadata if present
      if (data._exportMeta) {
        delete data._exportMeta;
      }

      // Validate schema
      const validation = validatePlanSchema(data);
      if (!validation.valid) {
        throw new Error(`Invalid plan schema: ${validation.errors.join(', ')}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to import plan: ${error.message}`);
    }
  }

  /**
   * Get current schema version
   * @returns {string} Schema version
   */
  static getSchemaVersion() {
    return localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || CURRENT_SCHEMA_VERSION;
  }

  /**
   * Clear all application data from localStorage
   * Use with caution - this is destructive
   */
  static clearAll() {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ofp_') || key.startsWith('plan_'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}
