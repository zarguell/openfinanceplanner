export class AppPage {
  constructor(page) {
    this.page = page;
    this.planList = page.getByTestId('plan-item');
    this.tabs = page.getByTestId(/tab-/);  // Uses data-testid, NOT .tab class
    this.newPlanButton = page.getByTestId('new-plan-button');
    this.settingsButton = page.getByTestId('settings-button');
    this.deleteButton = page.getByTestId('delete-plan-button');
    this.planNameInput = page.getByTestId('plan-name-input');
    this.planAgeInput = page.getByTestId('plan-age-input');
    this.retirementAgeInput = page.getByTestId('plan-retirement-age-input');
    this.createButton = page.getByTestId('create-plan-button');
  }

  async goto() {
    await this.page.goto('http://localhost:3030');
  }

  // Navigation methods

  async switchTab(tabName) {
    await this.page.getByTestId(`tab-${tabName}`).click();
  }

  async selectPlan(planName) {
    const planItems = await this.planList.all();
    for (const item of planItems) {
      const text = await item.textContent();
      if (text.includes(planName)) {
        await item.click();
        return;
      }
    }
    throw new Error(`Plan "${planName}" not found in list`);
  }

  // Shared utilities

  async waitForModal(modalId) {
    await this.page.waitForSelector(`#${modalId}.active`, { state: 'visible' });
  }

  async closeModal(modalId) {
    const modal = this.page.locator(`#${modalId}`);
    await modal.locator('.btn-outline').first().click();
    await modal.waitFor({ state: 'hidden' });
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Plan CRUD methods

  async createPlan(name = 'Test Plan', currentAge = 40, retirementAge = 67) {
    await this.newPlanButton.click();
    await this.planNameInput.fill(name);
    await this.planAgeInput.fill(String(currentAge));
    await this.retirementAgeInput.fill(String(retirementAge));
    await this.createButton.click();
    // Wait for modal to close and plan to appear in list
    await this.page.waitForSelector('[data-testid="plan-item"]', { state: 'visible' });
  }

  async isPlanInList(name) {
    try {
      const planItems = await this.planList.all();
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

  async getPlanCount() {
    try {
      return await this.planList.count();
    } catch {
      return 0;
    }
  }

  async openPlanSettings() {
    await this.settingsButton.click();
    await this.waitForModal('planSettingsModal');
  }

  async deletePlan(planName) {
    await this.selectPlan(planName);
    await this.deleteButton.click();
    await this.page.waitForSelector('dialog', { state: 'visible' });
    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept());
  }
}
