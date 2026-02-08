import { afterEach, vi } from 'vitest';

/**
 * Test setup file for Vitest.
 *
 * This file runs before each test file and provides:
 * - Global cleanup after each test
 * - Reusable test utilities
 *
 * Configure via setupFiles in vitest.config.ts
 */

// Clear all mocks after each test to prevent state leakage
afterEach(() => {
  vi.clearAllMocks();
});

// Reusable test utilities
export const testUtils = {
  /**
   * Mock console.error to prevent test output pollution
   * Usage: testUtils.mockConsole()
   */
  mockConsole: () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  },

  /**
   * Restore console.error after mocking
   */
  restoreConsole: () => {
    vi.restoreAllMocks();
  },
};
