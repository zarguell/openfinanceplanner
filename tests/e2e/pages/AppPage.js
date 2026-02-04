export class AppPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('http://localhost:3030');
  }

  async createPlan(name = 'Test Plan') {
    // Click the new plan button using the data-testid attribute
    await this.page.getByTestId('new-plan-button').click();

    // Fill in the plan details using more specific locators
    await this.page.locator('#newPlanName').fill(name);
    await this.page.locator('#newPlanAge').fill('40');
    await this.page.locator('#newPlanRetirementAge').fill('67');

    // Click the create button
    await this.page.getByRole('button', { name: 'Create' }).click();

    // Wait for the modal to close and plan list to update
    await this.page.waitForTimeout(1000);
  }

  async isPlanInList(name) {
    try {
      // Look for the plan in the list using data-testid attributes
      const planItems = await this.page.getByTestId('plan-item').all();
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
      const planItems = await this.page.getByTestId('plan-item').all();
      return planItems.length;
    } catch {
      return 0;
    }
  }
}
