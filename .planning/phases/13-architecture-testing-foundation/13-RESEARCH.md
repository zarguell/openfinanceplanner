# Phase 13: Architecture & Testing Foundation - Research

**Researched:** 2026-02-08
**Domain:** Vite + React + TypeScript project scaffolding, test infrastructure, code quality tooling
**Confidence:** HIGH

## Summary

Phase 13 establishes the foundation for the entire v0.1.0 milestone by scaffolding a Vite + React + TypeScript project with strict mode configuration, Clean Engine Pattern folder structure, path aliases, comprehensive ESLint/Prettier setup, and Vitest infrastructure with TDD workflow support. This phase creates zero functionality itself but enables all subsequent phases to work efficiently with proper type safety, testing capabilities, and developer experience.

**Primary recommendation:** Use Vite's official React TypeScript template, configure strict TypeScript with path aliases in both `tsconfig.json` and `vite.config.ts`, set up Vitest with v8 coverage provider and `jsdom` environment, implement ESLint flat config with `typescript-eslint` recommended rules, add Prettier with integration to avoid conflicts, and organize the project with a `src/core` folder for future business logic separate from UI components.

## Standard Stack

### Core

| Library    | Version | Purpose                   | Why Standard                                                                           |
| ---------- | ------- | ------------------------- | -------------------------------------------------------------------------------------- |
| Vite       | 5.x     | Build tool and dev server | Instant server start, lightning-fast HMR, optimized builds, native ESM support         |
| React      | 18.x    | UI library                | Industry standard for component-based UI, vast ecosystem, excellent TypeScript support |
| TypeScript | 5.9.x   | Type system               | Strict type checking, excellent developer experience, prevents runtime errors          |
| Vitest     | 2.x     | Test framework            | Vite-native, Jest-compatible, blazing fast, native ESM/TypeScript support              |
| ESLint     | 9.x     | Linting                   | Flat config format (new in v9), TypeScript support via typescript-eslint               |
| Prettier   | 3.x     | Code formatting           | De facto standard, integrates with ESLint to avoid conflicts                           |

### Supporting

| Library                          | Version | Purpose                           | When to Use                                            |
| -------------------------------- | ------- | --------------------------------- | ------------------------------------------------------ |
| @vitejs/plugin-react             | ^1      | Vite plugin for React             | Required for React JSX transformation in Vite          |
| @typescript-eslint/eslint-plugin | ^8      | TypeScript linting rules          | Required for TypeScript-specific ESLint rules          |
| @typescript-eslint/parser        | ^8      | TypeScript parser for ESLint      | Required for ESLint to understand TypeScript syntax    |
| typescript-eslint                | ^8      | Unified TypeScript ESLint package | New flat config format, replaces old separate packages |
| eslint-plugin-react              | ^7      | React-specific linting rules      | Enforces React best practices                          |
| eslint-plugin-react-hooks        | ^5      | React Hooks linting rules         | Enforces Rules of Hooks for custom hooks               |
| @vitest/ui                       | ^2      | Vitest UI interface               | Optional: Visual test runner UI for better debugging   |

### Alternatives Considered

| Instead of          | Could Use                  | Tradeoff                                                                                                             |
| ------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Vite                | Next.js                    | Next.js provides full-stack framework, but Phase 13 requires zero server-side build requirements for static hosting  |
| Vitest              | Jest                       | Jest is slower, requires additional configuration for ESM, Vitest integrates natively with Vite config               |
| ESLint flat config  | Legacy .eslintrc           | Flat config is the future (required in ESLint v9), legacy format deprecated                                          |
| Manual path aliases | vite-tsconfig-paths plugin | Plugin automatically syncs tsconfig paths, but manual configuration provides explicit control and fewer dependencies |

**Installation:**

```bash
# Initialize project with Vite
npm create vite@latest . -- --template react-ts

# Install testing dependencies
npm install -D vitest @vitest/ui jsdom @vitest/coverage-v8

# Install ESLint and Prettier
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript-eslint eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier eslint-plugin-prettier
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── core/              # Pure business logic (Clean Engine Pattern)
│   ├── types/         # TypeScript types/interfaces for domain models
│   ├── utils/         # Pure utility functions used across the app
│   └── tests/         # Unit tests for core logic (co-located)
├── components/        # React UI components
│   └── tests/         # Component tests (using React Testing Library in future phases)
├── hooks/             # Custom React hooks
├── stores/            # Zustand stores (Phase 15)
├── App.tsx            # Root component
└── main.tsx           # Application entry point
```

**Why this structure:**

- **`src/core/`** separates business logic from UI (Clean Engine Pattern), enables testing pure functions without React dependencies
- **`src/core/types/`** centralizes domain models, shared across core and UI
- **`src/core/utils/`** contains pure utility functions for calculations, validations
- **`src/core/tests/`** co-locates unit tests with core logic for easy discovery
- **Future-proof:** Anticipates Phase 14 (Core Financial Engine) and Phase 15 (State Management)

### Pattern 1: Vite + React + TypeScript Initialization

**What:** Use Vite's create tool with React TypeScript template, then enhance with strict TypeScript configuration.

**When to use:** Starting a new React TypeScript project with Vite as build tool.

**Example:**

```bash
# Initialize in current directory
npm create vite@latest . -- --template react-ts

# Or with specific package manager
pnpm create vite . --template react-ts
```

**Source:** [Vite Documentation - Scaffold Vite Project](https://github.com/vitejs/vite/blob/main/docs/guide/index.md)

### Pattern 2: TypeScript Strict Mode Configuration

**What:** Enable strict mode in `tsconfig.json` with compiler options appropriate for Vite projects.

**When to use:** All Vite + React + TypeScript projects for maximum type safety.

**Example:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting - STRICT MODE */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/core/*": ["./src/core/*"],
      "@/components/*": ["./src/components/*"],
      "@/*": ["./src/*"]
    },

    /* Vite client types */
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Source:** [Context7: Configure TypeScript Compiler Options for Vite](https://context7.com/vitejs/vite/llms.txt)

### Pattern 3: Vite Configuration with Path Aliases

**What:** Configure Vite to resolve path aliases matching TypeScript's `paths` configuration.

**When to use:** When using TypeScript path aliases for cleaner imports (e.g., `@/core/types` instead of `../../core/types`).

**Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': '/src',
      '@/core': '/src/core',
      '@/components': '/src/components',
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Source:** [Context7: Configure Vite with defineConfig Helper](https://context7.com/vitejs/vite/llms.txt)

### Pattern 4: Vitest Configuration with Coverage

**What:** Configure Vitest for unit testing with coverage reporting and test utilities.

**When to use:** Setting up test infrastructure for TDD workflow in Vite projects.

**Example:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enable global test APIs (describe, it, expect)
    environment: 'jsdom', // DOM environment for React component testing (future phases)
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],

    coverage: {
      provider: 'v8', // Fast coverage provider (alternative: istanbul)
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },

    setupFiles: ['./src/test/setup.ts'],

    testTimeout: 5000,
    hookTimeout: 10000,
  },
});
```

**Source:** [Context7: Configure Vitest in vitest.config.ts](https://context7.com/vitest-dev/vitest/llms.txt)

### Pattern 5: ESLint Flat Config with TypeScript

**What:** Use ESLint v9's flat config format with `typescript-eslint` for React TypeScript projects.

**When to use:** Modern ESLint setup (ESLint v9+ requires flat config format).

**Example:**

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  // Base JS recommended rules
  eslint.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  {
    // React and JSX settings
    settings: { react: { version: 'detect' } },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
    },
  },

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
];
```

**Source:** [Context7: Configure ESLint with TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint/blob/main/docs/getting-started/Quickstart.mdx)

### Pattern 6: Test Utilities and Setup Files

**What:** Create a test setup file with custom utilities and global configurations.

**When to use:** When you need shared test utilities, custom matchers, or global test setup.

**Example:**

```typescript
// src/test/setup.ts
import { afterEach, vi } from 'vitest';

// Global cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Custom test utilities
export const testUtils = {
  // Add reusable test helpers here
  mockConsole: () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  },
};
```

**Source:** [Context7: Vitest Test File Setup Example](https://github.com/vitest-dev/vitest/blob/main/docs/guide/lifecycle.md)

### Anti-Patterns to Avoid

- **Don't skip strict mode:** Disabling `strict: true` in TypeScript defeats the purpose of using TypeScript
- **Don't mix path alias configs:** Avoid configuring path aliases in only `tsconfig.json` or only `vite.config.ts` — they must be synchronized
- **Don't ignore ESLint in setup files:** Forgetting to add setup files to ESLint config causes linting errors
- **Don't place business logic in components:** Violates Clean Engine Pattern, makes testing difficult
- **Don't use `any` type:** Undermines TypeScript's type safety, use `unknown` or proper types instead
- **Don't ignore tsconfig paths:** Vite doesn't automatically read TypeScript path mappings, must configure `resolve.alias` in vite.config

## Don't Hand-Roll

| Problem                    | Don't Build                                    | Use Instead                                                        | Why                                                                                           |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Path alias synchronization | Custom script to sync tsconfig and vite.config | Manual configuration in both files OR `vite-tsconfig-paths` plugin | Edge cases: monorepo setups, non-standard paths, TypeScript's compiler option complexity      |
| Test environment setup     | Custom test runner, manual DOM mocking         | Vitest with `jsdom` environment                                    | Vitest provides instant watch mode, native ESM/TypeScript support, built-in coverage          |
| Code formatting            | Custom formatter, build scripts                | Prettier with ESLint integration                                   | De facto standard, avoids conflicts with `eslint-config-prettier`, IDE integration everywhere |
| Type checking in tests     | Separate TypeScript build step                 | Vitest's built-in TypeScript support via Vite                      | Zero-config TypeScript, same transformation as source code, faster feedback loop              |
| Linting configuration      | Custom linting rules                           | ESLint with `typescript-eslint` and `eslint-plugin-react`          | Battle-tested rules, community maintenance, automatic updates as best practices evolve        |

**Key insight:** Custom solutions for build tooling, testing, and linting require ongoing maintenance, miss edge cases, and create technical debt. Established tools have solved these problems at scale.

## Common Pitfalls

### Pitfall 1: Path Aliases Not Resolving

**What goes wrong:** Imports using path aliases (e.g., `import { UserProfile } from '@/core/types'`) fail with "module not found" errors in Vite, even though they work in TypeScript.

**Why it happens:** Vite does not automatically read TypeScript's `compilerOptions.paths` configuration. Both `tsconfig.json` (for TypeScript) and `vite.config.ts` (for Vite's module resolution) must be configured with matching path aliases.

**How to avoid:** Always configure path aliases in both files:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"]
    }
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@/core': '/src/core',
    },
  },
});
```

**Alternative:** Use the `vite-tsconfig-paths` plugin to automatically sync path mappings.

**Warning signs:** Imports work in IDE but fail at runtime, build succeeds but dev server errors, "Failed to resolve import" messages.

### Pitfall 2: ESLint + Prettier Conflicts

**What goes wrong:** ESLint and Prettier have conflicting rules (e.g., max line length, trailing commas, semicolons), causing files to be formatted differently by each tool.

**Why it happens:** Both tools attempt to format code, but their default rules overlap and conflict. Prettier is a formatter, ESLint is a linter with formatting rules.

**How to avoid:** Use `eslint-config-prettier` to disable all ESLint formatting rules that conflict with Prettier:

```bash
npm install -D eslint-config-prettier
```

```javascript
// eslint.config.mjs
export default [
  // ...other configs
  prettier, // Must be LAST to override other configs
];
```

**Warning signs:** Files reformat after running `eslint --fix`, ESLint errors after Prettier format, CI/lint checks fail despite formatting.

### Pitfall 3: Vitest Not Finding Tests

**What goes wrong:** Tests are not discovered or run by Vitest despite being in the project.

**Why it happens:** Default test file patterns don't match your naming convention, or test files are excluded by configuration.

**How to avoid:** Explicitly configure test file patterns in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
  },
});
```

**Warning signs:** `vitest run` reports "No test files found", tests run in IDE but not CLI, new test files ignored.

### Pitfall 4: TypeScript Strict Mode Errors

**What goes wrong:** Enabling `strict: true` causes hundreds of type errors in otherwise-working code.

**Why it happens:** Existing code (or generated code) doesn't adhere to strict type checking rules (no implicit any, strict null checks, strict function types).

**How to avoid:** Start with strict mode enabled from the beginning (before writing any code). For existing code, incrementally enable strict options:

```json
{
  "compilerOptions": {
    // Start with strict: true for new projects
    "strict": true,

    // Or enable individual options incrementally
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Warning signs:** Type errors on standard React code, `any` types required to fix errors, excessive type casting.

### Pitfall 5: Test Isolation Issues

**What goes wrong:** Tests pass when run individually but fail when run together, or tests affect each other's state.

**Why it happens:** Shared global state, uncleaned mocks, missing cleanup in test hooks.

**How to avoid:** Use Vitest's lifecycle hooks for setup and cleanup:

```typescript
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  // Setup before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});
```

**Warning signs:** Flaky tests (pass/fail inconsistently), different results in watch mode vs single run, state leaks between tests.

## Code Examples

Verified patterns from official sources:

### Initialize Vite React TypeScript Project

```bash
npm create vite@latest . -- --template react-ts
npm install
```

**Source:** [Vite Documentation](https://github.com/vitejs/vite/blob/main/docs/guide/index.md)

### Configure TypeScript with Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/components/*": ["./src/components/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

**Source:** [Context7: Vite TypeScript Compiler Options](https://context7.com/vitejs/vite/llms.txt)

### Configure Vite with Path Aliases

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/core': '/src/core',
      '@/components': '/src/components',
    },
  },
});
```

**Source:** [Context7: Vite Configuration](https://context7.com/vitejs/vite/llms.txt)

### Configure Vitest with Coverage

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**Source:** [Context7: Vitest Configuration](https://context7.com/vitest-dev/vitest/llms.txt)

### Configure ESLint Flat Config

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: { react: { version: 'detect' } },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
];
```

**Source:** [Context7: TypeScript ESLint Configuration](https://github.com/typescript-eslint/typescript-eslint/blob/main/docs/getting-started/Quickstart.mdx)

### Configure Prettier

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

### Write a Simple Unit Test

```typescript
// src/core/utils/math.test.ts
import { describe, it, expect } from 'vitest';
import { add } from './math';

describe('add', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should handle zero', () => {
    expect(add(0, 0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });
});
```

**Source:** [Vitest Best Practices](https://dev.to/wallacefreitas/best-techniques-to-create-tests-with-the-vitest-framework-9al)

## State of the Art

| Old Approach                                    | Current Approach                    | When Changed                | Impact                                                              |
| ----------------------------------------------- | ----------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| Legacy `.eslintrc` config                       | Flat config `eslint.config.mjs`     | ESLint v9 (2024)            | Required for ESLint v9+, simpler syntax, better TypeScript support  |
| Separate `@typescript-eslint/parser` and plugin | Unified `typescript-eslint` package | typescript-eslint v8 (2024) | Easier configuration, coordinated versioning                        |
| Jest for testing                                | Vitest for Vite projects            | 2022-2023                   | Native Vite integration, 10-100x faster, ESM support out of the box |
| `istanbul` for coverage                         | `v8` provider for coverage          | Vitest 1.x+                 | Faster coverage, better integration with Vite                       |
| Manual test setup                               | `setupFiles` configuration          | Vitest 0.34.x+              | Standardized way to run setup code before tests                     |
| Webpack build tool                              | Vite build tool                     | 2020-2022                   | Instant server start, native ESM, faster HMR                        |

**Deprecated/outdated:**

- **Jest with Vite:** Requires complex Babel configuration, slower, replaced by Vitest
- **Create React App:** No longer maintained, replaced by Vite for new projects
- **Legacy ESLint config:** `.eslintrc.js` format deprecated in favor of flat config in ESLint v9
- **TSC for builds:** Using `tsc` for bundling replaced by Vite (use `tsc` only for type checking)
- **UglifyJS for minification:** Replaced by esbuild (built into Vite)

## Open Questions

1. **Path Alias Configuration Approach**
   - What we know: Path aliases must be configured in both `tsconfig.json` and `vite.config.ts` OR use `vite-tsconfig-paths` plugin
   - What's unclear: Whether to use manual configuration (more explicit control) or plugin (less duplication)
   - Recommendation: Use manual configuration for Phase 13 to understand the setup, add plugin later if needed for monorepo complexity

2. **ESLint Plugin Selection**
   - What we know: Need `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`
   - What's unclear: Whether to include `eslint-plugin-jsx-a11y` for accessibility rules
   - Recommendation: Exclude accessibility linting in Phase 13 (overhead for infrastructure setup), include in Phase 16 (UI Framework & Components) where it becomes relevant

3. **Test File Organization**
   - What we know: Can co-locate tests with source files or separate into `__tests__` directories
   - What's unclear: Which pattern scales better for the Clean Engine Pattern
   - Recommendation: Co-locate tests in Phase 13 (`src/core/utils/math.test.ts`) for simplicity, re-evaluate in Phase 14 when Core Engine tests grow

4. **Vitest Browser Mode**
   - What we know: Vitest supports browser mode via `@vitest/browser` with Playwright/WebdriverIO providers
   - What's unclear: Whether Phase 13 needs browser mode setup or if `jsdom` environment suffices
   - Recommendation: Use `jsdom` environment in Phase 13 (sufficient for unit tests), defer browser mode to Phase 16 (UI component testing)

## Sources

### Primary (HIGH confidence)

- **/vitejs/vite** - Project initialization, TypeScript configuration, path aliases, build optimization
- **/vitest-dev/vitest** - Test framework configuration, coverage reporting, setup files, test utilities
- **/microsoft/typescript** - Strict mode configuration, path alias syntax, compiler options
- **/typescript-eslint/typescript-eslint** - ESLint flat config format, TypeScript parser configuration, recommended rules
- **[Vite Official Documentation](https://github.com/vitejs/vite/blob/main/docs/guide/index.md)** - Scaffold Vite Project with npm, Yarn, pnpm, Bun, and Deno
- **[Vitest Documentation](https://vitest.dev/config/setupfiles)** - setupFiles configuration and test file patterns

### Secondary (MEDIUM confidence)

- **[Complete Guide to Setting Up React with TypeScript and Vite (2025)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)** - Comprehensive 2025 setup guide verified against Vite docs
- **[How to Set Up ESLint and Prettier for React app in VSCode (2025)](https://dev.to/marina_eremina/how-to-set-up-eslint-and-prettier-for-react-app-in-vscode-2025-2341)** - Verified ESLint/Prettier integration patterns
- **[Stop Struggling with Path Aliases in Vite + TypeScript + React](https://medium.com/@tusharupadhyay691/stop-struggling-with-path-aliases-in-vite-typescript-react-heres-the-ultimate-fix-1ce319eb77d0)** - Path alias synchronization verified against Vite docs
- **[How to Configure TypeScript Path Aliases](https://oneuptime.com/blog/post/2026-01-24-configure-typescript-path-aliases/view)** - January 2026 path alias configuration guide
- **[Test Like a Pro in 2025: Vitest Testing Workflows](https://javascript.plainenglish.io/test-like-a-pro-in-2025-how-i-transformed-my-javascript-projects-with-vitest-playwright-and-more-9616cfb72e9b)** - TDD workflow with Vitest
- **[Recommended Folder Structure for Node(TS) 2025](https://dev.to/pramod_boda/recommended-folder-structure-for-nodets-2025-39jl)** - Modern TypeScript folder structure with `services/` for business logic
- **[The Perfect Folder Structure for Scalable Frontend](https://feature-sliced.design/blog/frontend-folder-structure)** - Feature-based organization patterns (Dec 2025)
- **[StackOverflow: How do I use Typescript path aliases in Vite?](https://stackoverflow.com/questions/77249074/how-do-i-use-typescript-path-aliases-in-vite/77249092)** - Path alias configuration verification
- **[Vite: Fix "Failed to resolve import" (path aliases)](https://blog.openreplay.com/vite-fix-failed-to-resolve-import-path-aliases/)** - Path alias troubleshooting (October 2025)

### Tertiary (LOW confidence)

- **[Vitest Best Practices and Coding Standards](https://cursorrules.org/article/vitest-cursor-mdc-file)** - Test organization patterns (unverified, flagged for validation)
- **[A Beginner's Guide to Unit Testing with Vitest](https://betterstack.com/community/guides/testing/vitest-explained/)** - General Vitest patterns (supplemental to official docs)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All versions and configurations verified via Context7 and official docs
- Architecture: HIGH - Clean Engine Pattern and folder structure verified via 2025-2026 resources
- Pitfalls: MEDIUM - Common pitfalls verified via StackOverflow, Medium articles, and GitHub issues (2024-2025)

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - tooling versions stable, but new best practices emerge rapidly)

**Researcher notes:**

- All critical configurations (TypeScript strict mode, Vitest, ESLint flat config) verified against official docs via Context7
- Path alias synchronization well-documented across multiple sources (StackOverflow, Medium, GitHub)
- ESLint flat config is a major shift in 2024-2025, ensure documentation reflects this (not legacy `.eslintrc`)
- Vitist has matured rapidly (2022-2025), now considered production-ready replacement for Jest in Vite projects
- Clean Engine Pattern with `src/core/` separation is a strategic architectural decision supporting Phase 14 (Core Financial Engine)
