import { test, expect } from '../pages/fixtures.js';
import { aPlan } from '../builders/PlanBuilder.js';
import { anAccount } from '../builders/AccountBuilder.js';

/**
 * Fixtures Demo Tests
 *
 * This file demonstrates the usage of custom fixtures and builders.
 * It serves as both documentation and verification that the fixture system works correctly.
 */

test.describe('Fixtures Demo', () => {
  test('authenticatedPage fixture creates test plan automatically', async ({ authenticatedPage, storageHelper }) => {
    const { appPage, planPage, testPlan } = authenticatedPage;

    // Plan already exists in localStorage from fixture
    const plans = await storageHelper.getPlans();
    expect(plans.length).toBe(1);
    expect(plans[0].name).toBe('E2E Test Plan');

    // Can interact with the app using page objects
    expect(await planPage.isPlanVisible('E2E Test Plan')).toBe(true);
  });

  test('planPage fixture provides clean state', async ({ planPage, storageHelper }) => {
    // Use builder to create test data
    const testPlan = aPlan()
      .withName('Demo Plan')
      .withAges(35, 65)
      .withAccount('401k', '401k', 50000, 5000)
      .build();

    // Pre-populate localStorage
    await storageHelper.setPlan(testPlan);

    // Reload to see the plan
    await planPage.page.reload();
    expect(await planPage.isPlanVisible('Demo Plan')).toBe(true);
  });

  test('builders create valid test data', async () => {
    const plan = aPlan()
      .withName('Complex Test Plan')
      .withAges(30, 60)
      .withAccount('401k', '401k', 150000, 20000)
      .withAccount('Roth IRA', 'Roth', 50000, 7000)
      .build();

    expect(plan.name).toBe('Complex Test Plan');
    expect(plan.currentAge).toBe(30);
    expect(plan.retirementAge).toBe(60);
    expect(plan.accounts.length).toBe(2);
  });

  test('storageHelper manages localStorage', async ({ page, storageHelper }) => {
    const plan = aPlan().withName('Storage Test').withAges(40, 67).build();

    await storageHelper.setPlan(plan);
    const retrieved = await storageHelper.getPlan(plan.id);

    expect(retrieved.name).toBe('Storage Test');
    expect(retrieved.id).toBe(plan.id);

    await storageHelper.clear();
    const plans = await storageHelper.getPlans();
    expect(plans.length).toBe(0);
  });
});
