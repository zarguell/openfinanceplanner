/**
 * StorageHelper - Helper for managing localStorage in E2E tests
 * Provides methods to read, write, and clear localStorage with plan data
 */
export class StorageHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Clear all localStorage data
   */
  async clear() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Get the list of plans from localStorage
   * @returns {Array<Array>} List of plans as stored in ofp_plans_list
   */
  async getPlans() {
    return await this.page.evaluate(() => {
      const plansList = localStorage.getItem('ofp_plans_list');
      return plansList ? JSON.parse(plansList) : [];
    });
  }

  /**
   * Get a specific plan by ID from localStorage
   * @param {string} planId - Plan ID to retrieve
   * @returns {Object|null} Plan object or null if not found
   */
  async getPlan(planId) {
    return await this.page.evaluate((id) => {
      const planData = localStorage.getItem(`ofp_plan_${id}`);
      return planData ? JSON.parse(planData) : null;
    }, planId);
  }

  /**
   * Save a plan to localStorage (creates or updates)
   * Stores both the plan data and updates the plans list index
   * @param {Object} planData - Plan object to save
   */
  async savePlan(planData) {
    await this.page.evaluate((data) => {
      // Store the full plan data
      localStorage.setItem(`ofp_plan_${data.id}`, JSON.stringify(data));

      // Update the plans list index
      const plansList = JSON.parse(localStorage.getItem('ofp_plans_list') || '[]');
      const existingIndex = plansList.findIndex(p => p.id === data.id);
      if (existingIndex >= 0) {
        // Update existing entry
        plansList[existingIndex] = { id: data.id, name: data.name, lastModified: data.lastModified };
      } else {
        // Add new entry
        plansList.push({ id: data.id, name: data.name, lastModified: data.lastModified });
      }
      localStorage.setItem('ofp_plans_list', JSON.stringify(plansList));
    }, planData);
  }

  /**
   * Helper to pre-populate localStorage with a plan (faster than UI creation)
   * @param {Object} planData - Plan object to set
   */
  async setPlan(planData) {
    await this.savePlan(planData);
  }

  /**
   * Get the account count for a specific plan
   * @param {string} planId - Plan ID to check
   * @returns {number} Number of accounts in the plan
   */
  async getAccountCount(planId) {
    const plan = await this.getPlan(planId);
    return plan ? plan.accounts.length : 0;
  }
}
