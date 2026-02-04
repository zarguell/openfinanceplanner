import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage.js';

test('should create a plan via browser automation and verify it exists', async ({ page }) => {
  const appPage = new AppPage(page);
  const planName = 'Test Plan ' + Date.now();

  // Navigate to the application
  await appPage.goto();

  // Get initial plan count
  const initialCount = await appPage.getPlanCount();

  // Create a plan through the UI
  await appPage.createPlan(planName);

  // Verify the plan exists in the list
  const planExists = await appPage.isPlanInList(planName);
  expect(planExists).toBe(true);

  // Verify plan count increased by one
  const finalCount = await appPage.getPlanCount();
  expect(finalCount).toBe(initialCount + 1);
});
