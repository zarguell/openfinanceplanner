import { test, expect } from '@playwright/test';

test('should have access to browser page', async ({ page }) => {
  expect(page).toBeDefined();
  expect(typeof page.goto).toBe('function');
});


