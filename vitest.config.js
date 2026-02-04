/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.planning', 'docs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '.planning/',
        'docs/',
        '**/*.test.js',
        '**/test-helper.js',
        '**/vitest.config.js',
        '**/vitest.setup.js',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
