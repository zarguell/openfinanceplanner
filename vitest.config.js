/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.planning', 'docs'],
    coverage: {
      provider: 'v8',
      exclude: ['node_modules', 'dist', '.planning', 'docs'],
    },
  },
});
