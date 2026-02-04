/**
 * PlanPage - Page Object Model for Plan CRUD operations
 * Encapsulates all interactions with plan creation, selection, deletion, and settings
 */
export class PlanPage {
  constructor(page) {
    this.page = page;
    this.newPlanButton = page.getByTestId('new-plan-button');
    this.planNameInput = page.getByTestId('plan-name-input');
    this.planAgeInput = page.getByTestId('plan-age-input');
    this.retirementAgeInput = page.getByTestId('plan-retirement-age-input');
    this.createButton = page.getByTestId('create-plan-button');
    this.planItems = page.getByTestId('plan-item');
    this.settingsButton = page.getByTestId('settings-button');
    this.deleteButton = page.getByTestId('delete-plan-button');
  }

  /**
   * Create a new plan with the given parameters
   * @param {string} name - Plan name
   * @param {number} currentAge - Current age (default: 40)
   * @param {number} retirementAge - Retirement age (default: 67)
   */
  async createPlan(name, currentAge = 40, retirementAge = 67) {
    await this.newPlanButton.click();
    await this.planNameInput.fill(name);
    await this.planAgeInput.fill(String(currentAge));
    await this.retirementAgeInput.fill(String(retirementAge));
    await this.createButton.click();
    // Wait for modal to close and plan to appear in list
    await this.page.waitForSelector('[data-testid="plan-item"]', { state: 'visible' });
  }

  /**
   * Select a plan from the plan list by name
   * @param {string} name - Plan name to select
   */
  async selectPlan(name) {
    const planItems = await this.planItems.all();
    for (const item of planItems) {
      const text = await item.textContent();
      if (text.includes(name)) {
        await item.click();
        return;
      }
    }
    throw new Error(`Plan "${name}" not found in list`);
  }

  /**
   * Delete the currently selected plan
   * @param {string} name - Plan name to delete
   */
  async deletePlan(name) {
    await this.selectPlan(name);
    await this.deleteButton.click();
    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.waitForSelector('[data-testid="plan-item"]', { state: 'hidden' }).catch(() => {});
  }

  /**
   * Check if a plan is visible in the plan list
   * @param {string} name - Plan name to check
   * @returns {boolean} True if plan exists in list
   */
  async isPlanVisible(name) {
    try {
      const planItems = await this.planItems.all();
      for (const item of planItems) {
        const text = await item.textContent();
        if (text.includes(name)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get the count of plans in the plan list
   * @returns {number} Number of plans
   */
  async getPlanCount() {
    try {
      return await this.planItems.count();
    } catch {
      return 0;
    }
  }

  /**
   * Open plan settings modal
   */
  async openPlanSettings() {
    await this.settingsButton.click();
    await this.page.waitForSelector('#planSettingsModal.active', { state: 'visible' });
  }

  /**
   * Rename the current plan
   * @param {string} newName - New plan name
   */
  async renamePlan(newName) {
    await this.openPlanSettings();
    const nameInput = this.page.locator('#settingsPlanName');
    await nameInput.fill(newName);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForSelector('#planSettingsModal', { state: 'hidden' });
  }
}
