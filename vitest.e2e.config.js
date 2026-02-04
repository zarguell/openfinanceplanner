/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/e2e/**/*.test.js'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
});
