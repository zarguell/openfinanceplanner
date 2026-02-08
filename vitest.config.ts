import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@/core': '/src/core',
      '@/components': '/src/components',
      '@': '/src',
    },
  },

  test: {
    globals: true,
    environment: 'node', // Use 'node' for engine tests, not 'jsdom'
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'dist/',
        'coverage/',
      ],
    },

    setupFiles: ['./src/test/setup.ts'],

    testTimeout: 5000,
    hookTimeout: 10000,
  },
});
