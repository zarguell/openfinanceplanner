import { test as base, expect } from '@playwright/test';
import { AppPage } from './AppPage.js';
import { PlanPage } from './PlanPage.js';
import { AccountPage } from './AccountPage.js';
import { ProjectionPage } from './ProjectionPage.js';
import { StorageHelper } from '../helpers/storage.js';

/**
 * Custom Playwright Fixtures
 *
 * Extends Playwright's base test object with page objects and helpers.
 * Provides automatic setup (navigation, data initialization) and teardown (localStorage cleanup).
 *
 * Usage in test files:
 * import { test, expect } from '../pages/fixtures.js';
 *
 * test('my test', async ({ authenticatedPage }) => {
 *   const { appPage, planPage, accountPage, projectionPage, testPlan } = authenticatedPage;
 *   // testPlan is already in localStorage, app is navigated
 * });
 */

// Extended test object with custom fixtures
export const test = base.extend({
  // Storage helper fixture (no auto-setup, just helper)
  storageHelper: async ({ page }, use) => {
    await use(new StorageHelper(page));
  },

  // AppPage fixture - navigates to app
  appPage: async ({ page }, use) => {
    const appPage = new AppPage(page);
    await appPage.goto();
    await use(appPage);
    // Cleanup: clear localStorage after test
    await page.evaluate(() => localStorage.clear());
  },

  // PlanPage fixture - navigates to app, ready for plan operations
  planPage: async ({ page, storageHelper }, use) => {
    const planPage = new PlanPage(page);
    await page.goto('http://localhost:3030');
    await use(planPage);
    // Cleanup
    await storageHelper.clear();
  },

  // AccountPage fixture - expects a plan to already exist
  accountPage: async ({ page, storageHelper }, use) => {
    const accountPage = new AccountPage(page);
    await page.goto('http://localhost:3030');
    await use(accountPage);
    // Cleanup
    await storageHelper.clear();
  },

  // ProjectionPage fixture - expects plan with accounts to exist
  projectionPage: async ({ page, storageHelper }, use) => {
    const projectionPage = new ProjectionPage(page);
    await page.goto('http://localhost:3030');
    await use(projectionPage);
    // Cleanup
    await storageHelper.clear();
  },

  // authenticatedPage fixture - creates a test plan before each test
  // Provides all page objects and a pre-populated test plan
  authenticatedPage: async ({ page, storageHelper }, use) => {
    // Navigate to app first (required for localStorage access)
    await page.goto('http://localhost:3030');

    // Import builder for test data
    const { aPlan } = await import('../builders/PlanBuilder.js');

    // Create test plan via localStorage (faster than UI)
    const testPlan = aPlan()
      .withName('E2E Test Plan')
      .withAges(40, 67)
      .withAccount('Test 401k', '401k', 100000, 10000)
      .build();

    await storageHelper.setPlan(testPlan);

    // Reload to see the plan
    await page.reload();

    // Provide page objects
    const appPage = new AppPage(page);
    const planPage = new PlanPage(page);
    const accountPage = new AccountPage(page);
    const projectionPage = new ProjectionPage(page);

    await use({ appPage, planPage, accountPage, projectionPage, testPlan });

    // Cleanup
    await storageHelper.clear();
  },
});

// Re-export expect from Playwright for convenience
export { expect } from '@playwright/test';
