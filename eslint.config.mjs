import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage', '*.config.js', '*.config.ts'],
  },

  // Base JS recommended rules
  eslint.configs.recommended,

  // TypeScript recommended rules with type-aware linting
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),

  {
    // React and JSX settings
    files: ['**/*.ts', '**/*.tsx', '**/*.jsx'],
    settings: { react: { version: '18' } },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      // React 17+ doesn't need React in scope for JSX
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Prettier must be LAST to disable conflicting ESLint rules
  prettier,
];
