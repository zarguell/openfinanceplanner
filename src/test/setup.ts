import { afterEach, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

/**
 * Test setup file for Vitest.
 *
 * This file runs before each test file and provides:
 * - Global cleanup after each test
 * - Reusable test utilities
 * - IndexedDB mocking for persistence tests
 *
 * Configure via setupFiles in vitest.config.ts
 */

// Set up fake IndexedDB for tests
const fakeIndexedDB = new IDBFactory();
globalThis.indexedDB = fakeIndexedDB as unknown as IDBFactory;

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
