# E2E Testing Tools for Vanilla JavaScript (No Build Process)

**Project:** Open Finance Planner
**Research Date:** 2026-01-20
**Focus:** E2E testing for ES6 modules without build process

## Executive Summary

For testing a vanilla JavaScript application with ES6 modules and no build process, **Playwright** is the recommended E2E testing solution. It provides comprehensive browser automation, excellent developer experience, and works seamlessly with ES6 modules without requiring a build step. Vitest+Browser Mode is a promising alternative for unit/component testing but requires additional setup. Puppeteer is viable but has a steeper learning curve and fewer built-in testing features.

**Recommendation:** Use **Playwright (@playwright/test)** for E2E testing, paired with existing **Vitest** for unit tests.

---

## Technology Landscape

### Option 1: Playwright (@playwright/test)

**Version:** Latest (currently v1.49+)
**Confidence:** HIGH (official documentation)

**What it is:**

- Full-featured E2E testing framework by Microsoft
- Includes test runner, assertions, browser automation in one package
- Supports Chromium, Firefox, WebKit
- Can run tests headless or headed

**Key Features:**

- **Codegen:** Record tests by interacting with browser UI
- **Auto-waiting:** Automatically waits for elements to be ready
- **Web-First Assertions:** Built-in assertions that wait for conditions
- **Parallel execution:** Runs tests in parallel by default
- **Trace viewer:** Time-travel debugging for failed tests
- **Multiple browsers:** Test across Chromium, Firefox, WebKit
- **Network mocking:** Intercept and mock network requests
- **Screenshots/videos:** Automatic capture on failures

**Pros:**

- Zero configuration for E2E testing
- Works with any JavaScript application (no framework requirements)
- Excellent developer experience (VS Code extension, UI mode)
- Comprehensive documentation and examples
- Active community and Microsoft backing
- Codegen reduces test-writing time
- Native ES6 module support (via import syntax)

**Cons:**

- Requires browser binary downloads (~300MB)
- Slightly slower initialization than unit test frameworks
- Overkill for simple unit tests (better suited for E2E)

**ES6 Module Compatibility:**
✅ **FULLY COMPATIBLE** - Playwright tests are written as ES6 modules and use standard import syntax. No build process required for test files.

**Installation:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Example Test:**

```javascript
import { test, expect } from '@playwright/test';

test('basic E2E flow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3030');

  // Interact with UI
  await page.fill('#plan-name', 'Retirement Plan');
  await page.click('button[type="submit"]');

  // Assert result
  await expect(page.locator('.plan-name')).toHaveText('Retirement Plan');
});
```

**Codegen (Test Recording):**

```bash
npx playwright codegen http://localhost:3030
```

---

### Option 2: Vitest + Browser Mode (@vitest/browser-playwright)

**Version:** 4.0.17 (already installed)
**Confidence:** HIGH (official documentation)

**What it is:**

- Browser testing mode for Vitest (already used for unit tests)
- Runs Vitest tests in actual browser (Chromium, Firefox, WebKit)
- Uses Playwright or WebDriverIO as browser provider
- Provides browser globals (window, document) in tests

**Key Features:**

- **Unified test runner:** Run unit and browser tests together
- **Familiar API:** Same test/expect syntax as existing Vitest tests
- **Browser globals:** Access to window, document, localStorage
- **Component testing:** Render and test components in isolation
- **Playwright integration:** Uses Playwright under the hood for browser control
- **Parallel execution:** Inherited from Vitest's parallel test runner

**Pros:**

- **Already installed:** No new dependencies (Vitest v4.0.17 in use)
- **Unified testing:** Single test runner for unit + browser tests
- **Familiar syntax:** Same API as existing 308 unit tests
- **Framework-agnostic:** Works with vanilla JavaScript, React, Vue, etc.
- **Fast iteration:** Watch mode and HMR inherited from Vitest
- **No separate browser binary management:** Uses provider's browser

**Cons:**

- **Early development:** Browser mode still maturing (potential bugs)
- **Longer initialization:** Must spin up browser and provider (slower than unit tests)
- **Limited browser control:** Less fine-grained control than standalone Playwright
- **Requires configuration:** More setup than Playwright Test
- **Thread-blocking dialogs:** alert(), confirm() are mocked (can't test natively)
- **Module mocking limitations:** Can't spy on imported ES6 modules

**ES6 Module Compatibility:**
✅ **FULLY COMPATIBLE** - Uses native browser ESM support to serve modules directly. Tests run in real browser with native module loading.

**Installation:**

```bash
# Already have vitest@4.0.17
npm install -D @vitest/browser-playwright
```

**Configuration (vitest.config.js):**

```javascript
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    // Existing unit test config
    include: ['tests/**/*.test.js'],
    environment: 'node',

    // Browser mode for E2E tests
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
    },

    // Separate projects for unit vs browser tests
    projects: [
      {
        name: 'unit',
        include: ['tests/unit/**/*.{test,spec}.js'],
        environment: 'node',
      },
      {
        name: 'browser',
        include: ['tests/e2e/**/*.{test,spec}.js'],
        browser: {
          enabled: true,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
        },
      },
    ],
  },
});
```

**Example Test:**

```javascript
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

test('browser interaction', async () => {
  // Navigate to page
  await page.goto('http://localhost:3030');

  // Fill form and submit
  const usernameInput = page.getByLabelText(/username/i);
  await usernameInput.fill('Alice');

  // Assert
  await expect.element(page.getByText('Hi, Alice')).toBeInTheDocument();
});
```

**Limitations:**

- Cannot spy on module exports with `vi.spyOn()` (ESM modules are sealed)
- Thread-blocking dialogs (alert, confirm) are mocked
- Longer startup time due to browser initialization
- Less mature than standalone Playwright (still evolving)

---

### Option 3: Puppeteer (Library Only)

**Version:** 24.35.0
**Confidence:** HIGH (official documentation)

**What it is:**

- Browser automation library by Google
- Controls Chrome or Firefox via DevTools Protocol
- Lower-level API (library, not full test runner)
- Requires manual test runner setup

**Key Features:**

- **Chrome control:** Launch and control Chrome/Chromium
- **Headless/headful:** Run with or without UI
- **Screenshot/PDF:** Capture page visuals
- **Performance tracing:** Capture Chrome DevTools timeline
- **Network interception:** Mock and intercept requests
- **Chrome Extension testing:** Test browser extensions
- **Form automation:** Fill forms, click elements, type text

**Pros:**

- **Official Google Chrome tool:** First-class Chrome support
- **Lightweight:** Library-only, no test runner overhead
- **Flexible:** Can use with any test runner (Vitest, Mocha, Jest)
- **Direct API:** Fine-grained control over browser actions
- **Chrome DevTools Protocol:** Direct access to Chrome internals

**Cons:**

- **No built-in test runner:** Must write your own or use with another framework
- **No web-first assertions:** Need separate assertion library (chai, expect)
- **Steeper learning curve:** More boilerplate code required
- **Manual setup:** Need to configure test runner, browser lifecycle, cleanup
- **Chrome-only:** Primarily supports Chrome (Firefox support is newer)
- **No codegen:** No test recording tool like Playwright

**ES6 Module Compatibility:**
✅ **FULLY COMPATIBLE** - Puppeteer tests are Node.js scripts that control browser. Test files can use ES6 imports with `"type": "module"` in package.json.

**Installation:**

```bash
npm install -D puppeteer
```

**Example Test (with Vitest):**

```javascript
import puppeteer from 'puppeteer';
import { test, expect } from 'vitest';

let browser;
let page;

test.beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
  await browser.close();
});

test('basic interaction', async () => {
  await page.goto('http://localhost:3030');
  await page.type('#plan-name', 'Test Plan');
  await page.click('button[type="submit"]');

  const text = await page.$eval('.plan-name', (el) => el.textContent);
  expect(text).toBe('Test Plan');
});
```

**Comparison to Playwright:**

- Playwright is higher-level (test runner + assertions)
- Puppeteer is lower-level (library only)
- Playwright supports more browsers (Chromium, Firefox, WebKit)
- Puppeteer is Chrome-focused
- Playwright has codegen and better DX
- Puppeteer requires manual setup

---

## Comparison Matrix

| Criterion                    | Playwright                       | Vitest+Browser Mode           | Puppeteer                        |
| ---------------------------- | -------------------------------- | ----------------------------- | -------------------------------- |
| **Test Runner**              | ✅ Built-in                      | ✅ Built-in (Vitest)          | ❌ Requires external runner      |
| **Assertions**               | ✅ Web-first built-in            | ✅ Standard Vitest assertions | ❌ Requires external library     |
| **ES6 Modules**              | ✅ Full support                  | ✅ Full support (browser ESM) | ✅ Full support (Node.js ESM)    |
| **No Build Required**        | ✅ Test files use native imports | ✅ Uses Vite dev server       | ✅ Test files use native imports |
| **Browser Support**          | Chromium, Firefox, WebKit        | Chromium, Firefox, WebKit     | Chrome, Firefox                  |
| **Codegen (Test Recording)** | ✅ Excellent                     | ❌ No                         | ❌ No                            |
| **Auto-waiting**             | ✅ Built-in                      | ⚠️ Via provider               | ⚠️ Manual implementation         |
| **Trace Viewer**             | ✅ Built-in                      | ⚠️ Via provider               | ❌ No                            |
| **Parallel Execution**       | ✅ Built-in                      | ✅ Via Vitest                 | ⚠️ Manual setup                  |
| **Screenshots/Video**        | ✅ Automatic on failure          | ⚠️ Via provider               | ✅ Manual implementation         |
| **Network Mocking**          | ✅ Built-in                      | ⚠️ Via provider               | ✅ Built-in                      |
| **CI Integration**           | ✅ First-class                   | ✅ First-class                | ⚠️ Manual setup                  |
| **Learning Curve**           | Low                              | Low (if using Vitest)         | High                             |
| **Maturity**                 | High                             | Medium (early development)    | High                             |
| **Setup Complexity**         | Low                              | Medium                        | High                             |
| **Package Size**             | ~300MB (browsers)                | ~100MB (via Vitest)           | ~200MB (Chrome)                  |
| **Startup Time**             | Medium                           | Medium                        | Medium                           |
| **VS Code Extension**        | ✅ Excellent                     | ⚠️ Via Vitest                 | ❌ No                            |
| **Documentation Quality**    | Excellent                        | Good                          | Good                             |

---

## Specific Use Cases

### Use Playwright when:

- **Primary E2E testing:** Best choice for comprehensive E2E test suite
- **Need test recording:** Codegen dramatically speeds up test writing
- **Cross-browser testing:** Need to test Chrome, Firefox, Safari (WebKit)
- **Visual regression:** Screenshots and video capture built-in
- **Time-travel debugging:** Trace viewer for failed tests
- **Network mocking:** Intercept and mock API calls
- **Quick setup:** Want zero configuration for E2E tests
- **Modern DX:** Want best developer experience (VS Code extension, UI mode)

### Use Vitest+Browser Mode when:

- **Already using Vitest:** Existing unit tests in Vitest (current project)
- **Unified test runner:** Want single runner for unit + browser tests
- **Component testing:** Need to test UI components in isolation
- **No new dependencies:** Prefer to extend existing Vitest setup
- **Familiar API:** Team already knows Vitest test/expect syntax
- **Framework integration:** Using React/Vue/Svelte (has framework-specific packages)

**⚠️ Avoid for:** Critical production E2E tests (still maturing)

### Use Puppeteer when:

- **Chrome-specific testing:** Only need to test in Chrome
- **Custom test runner:** Need fine-grained control over test execution
- **Library integration:** Embedding browser automation in scripts, not tests
- **Chrome DevTools Protocol:** Need low-level access to Chrome internals
- **Minimal dependencies:** Don't want full test runner framework

---

## Integration with Open Finance Planner

### Current Setup Analysis

**Existing Configuration:**

- ✅ Vitest 4.0.17 installed and configured
- ✅ 308 unit tests passing (57% coverage)
- ✅ `"type": "module"` in package.json (ES6 modules)
- ✅ No build process (vanilla JavaScript)
- ✅ Python dev server on port 3030

**Testing Gaps:**

- ❌ No E2E tests (6.98% UI coverage)
- ❌ No browser automation tests
- ❌ Tests run in Node.js, not browser environment

### Recommended Approach

**Phase 1: Add Playwright for E2E Tests** (Recommended)

Install Playwright for E2E testing alongside existing Vitest unit tests:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Create `tests/e2e/` directory and add E2E tests:

```javascript
// tests/e2e/planning.spec.js
import { test, expect } from '@playwright/test';

test.describe('Financial Planning E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3030');
    await page.waitForLoadState('networkidle');
  });

  test('create retirement plan', async ({ page }) => {
    // Fill plan details
    await page.fill('#plan-name', 'Retirement Plan');
    await page.fill('#birth-year', '1990');
    await page.selectOption('#filing-status', 'single');

    // Submit
    await page.click('button[data-testid="create-plan"]');

    // Assert
    await expect(page.locator('.plan-name')).toHaveText('Retirement Plan');
    await expect(page.locator('.birth-year')).toHaveText('1990');
  });

  test('add account to plan', async ({ page }) => {
    // Create plan first
    await page.goto('http://localhost:3030');
    await page.fill('#plan-name', 'Test Plan');
    await page.click('button[data-testid="create-plan"]');

    // Add account
    await page.click('button[data-testid="add-account"]');
    await page.fill('#account-name', '401(k)');
    await page.fill('#account-balance', '100000');
    await page.selectOption('#account-type', '401k');

    // Submit
    await page.click('button[data-testid="save-account"]');

    // Assert
    await expect(page.locator('.account-name')).toHaveText('401(k)');
    await expect(page.locator('.account-balance')).toHaveText('$100,000');
  });
});
```

Add scripts to package.json:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

Create Playwright config:

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3030',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 3030',
    url: 'http://localhost:3030',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Advantages of this approach:**

- ✅ Keeps Vitest for unit tests (no changes needed)
- ✅ Adds dedicated E2E testing with Playwright
- ✅ Playwright handles dev server startup
- ✅ Auto-waiting, assertions, screenshots built-in
- ✅ Codegen for quick test recording
- ✅ Mature, battle-tested framework
- ✅ Best-in-class DX (VS Code extension, UI mode, trace viewer)

**Phase 2: Optional Vitest Browser Mode** (Future Consideration)

If needed later, can add Vitest browser mode for component-level testing:

```bash
npm install -D @vitest/browser-playwright
```

Modify vitest.config.js to add browser project:

```javascript
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      {
        name: 'unit',
        include: ['tests/unit/**/*.{test,spec}.js'],
        environment: 'node',
      },
      {
        name: 'browser',
        include: ['tests/browser/**/*.{test,spec}.js'],
        browser: {
          enabled: true,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
        },
      },
    ],
  },
});
```

**Use Vitest browser mode for:**

- Testing individual UI components in isolation
- Unit tests requiring browser APIs (localStorage, IndexedDB)
- Integration tests between components (not full E2E flows)
- Tests that need to run in browser environment

**Stick with Playwright for:**

- Full user flows and scenarios
- Multi-page navigation tests
- Cross-browser testing
- Network request/response mocking
- Visual regression testing

---

## Pitfalls and Warnings

### Pitfall 1: Mixing Test Runners Without Clear Separation

**Problem:** Using both Playwright and Vitest browser mode for the same types of tests leads to confusion about which to use.

**Prevention:**

- Define clear separation: Playwright for E2E (multi-page flows), Vitest browser for component/integration (single-page)
- Use different directories: `tests/e2e/` vs `tests/browser/`
- Document purpose in README

### Pitfall 2: ES6 Module Import Conflicts

**Problem:** Test files use ES6 imports but test runner doesn't support them, causing module resolution errors.

**Prevention:**

- All three tools (Playwright, Vitest, Puppeteer) support ES6 modules
- Ensure `"type": "module"` in package.json (already set)
- Use `.js` extension in imports for clarity: `import { test } from './utils.js'`

### Pitfall 3: Dev Server Race Conditions

**Problem:** Tests start before dev server is ready, causing connection refused errors.

**Prevention:**

- Use Playwright's built-in `webServer` config to auto-start server
- Or manually wait: `await page.waitForLoadState('networkidle')`
- Or use `baseURL` in Playwright config

### Pitfall 4: Hardcoded URLs and Selectors

**Problem:** Tests break when UI changes because selectors are brittle (CSS classes, structure).

**Prevention:**

- Use Playwright codegen to generate stable selectors
- Prefer accessible selectors: `page.getByRole()`, `page.getByLabelText()`, `page.getByTestId()`
- Add `data-testid` attributes to critical elements for testing
- Avoid CSS classes and DOM structure in selectors

### Pitfall 5: Testing Implementation Details

**Problem:** Tests break when implementation changes but behavior stays the same.

**Prevention:**

- Test user behavior, not implementation
- Test "user clicks submit button" not "form submits event"
- Test visible output, not internal state
- Use page-level assertions, not component internals

### Pitfall 6: Thread-Blocking Dialogs in Vitest Browser Mode

**Problem:** Using `alert()`, `confirm()` in code causes tests to hang (Vitest mocks these).

**Prevention:**

- Avoid synchronous dialogs in code (use custom UI instead)
- If required, mock them explicitly in tests
- Playwright handles this natively: `page.on('dialog', dialog => dialog.accept())`

### Pitfall 7: Flaky Tests Due to Timing

**Problem:** Tests fail intermittently due to race conditions (element not loaded yet).

**Prevention:**

- Playwright: Use auto-waiting assertions (built-in)
- Puppeteer: Implement manual waits or use Playwright
- Vitest: Use `await expect.element().toBeInTheDocument()` with proper timeout
- Never use `setTimeout()` for synchronization
- Use networkidle or specific element visibility

---

## Recommendations

### Primary Recommendation: Playwright (@playwright/test)

**Use Playwright for E2E testing.** It's the mature, feature-rich solution designed specifically for end-to-end browser testing. Works seamlessly with ES6 modules and requires no build process.

**Implementation Steps:**

1. Install: `npm install -D @playwright/test`
2. Install browsers: `npx playwright install chromium`
3. Create `tests/e2e/` directory
4. Configure `playwright.config.js` with dev server
5. Add E2E tests starting with critical user flows
6. Use codegen to bootstrap test writing
7. Add scripts to package.json for running E2E tests
8. Integrate with CI (GitHub Actions)

**Why Not Alternatives?**

- **Vitest Browser Mode:** Too early in development, limitations (thread-blocking dialogs, module mocking)
- **Puppeteer:** No built-in test runner, requires manual setup, steeper learning curve

### Secondary Recommendation: Extend Vitest for Component Tests (Optional)

**Later consideration:** If you find E2E tests are too slow or granular, add Vitest browser mode for component-level testing. This complements Playwright E2E tests.

**Use for:**

- Testing individual UI components
- Integration tests between 2-3 components
- Tests requiring browser APIs (localStorage, IndexedDB)

**Don't use for:**

- Full user flows across multiple pages
- Cross-browser testing
- Production-critical E2E tests

---

## Installation Quick Start

### Playwright (Recommended)

```bash
# Install
npm install -D @playwright/test

# Install browsers
npx playwright install chromium

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui

# Record tests
npx playwright codegen http://localhost:3030

# Debug tests
npx playwright test --debug
```

### Vitest Browser Mode (Optional)

```bash
# Install (already have vitest)
npm install -D @vitest/browser-playwright

# Configure vitest.config.js
# Add browser.enabled and provider configuration

# Run browser tests
npx vitest --run --browser=chromium

# Run specific browser project
npx vitest --run --project=browser
```

### Puppeteer (Alternative)

```bash
# Install
npm install -D puppeteer

# Write tests with Vitest or another runner
# Use puppeteer API to control browser
```

---

## Sources

| Source                                                              | Confidence | Notes                                               |
| ------------------------------------------------------------------- | ---------- | --------------------------------------------------- |
| [Playwright Installation](https://playwright.dev/docs/intro)        | HIGH       | Official documentation, up-to-date                  |
| [Playwright Library](https://playwright.dev/docs/library)           | HIGH       | Official docs, detailed API reference               |
| [Playwright Codegen](https://playwright.dev/docs/codegen-intro)     | HIGH       | Official docs on test recording                     |
| [Vitest Browser Mode](https://vitest.dev/guide/browser/)            | HIGH       | Official documentation, current version 4.0.17      |
| [Vitest Browser Mode - Why](https://vitest.dev/guide/browser/why)   | HIGH       | Official docs explaining motivation and limitations |
| [Puppeteer Introduction](https://pptr.dev/guides/what-is-puppeteer) | HIGH       | Official documentation, version 24.35.0             |
| [Project package.json](./package.json)                              | HIGH       | Current project configuration                       |
| [Project vitest.config.js](./vitest.config.js)                      | HIGH       | Current test configuration                          |

---

## Appendix: Test Type Definitions

### Unit Tests

- Test individual functions in isolation
- Mock all dependencies
- Run in Node.js environment
- Fast execution (seconds)
- Example: Testing `calculateTax()` function with mock inputs

### Integration Tests

- Test interaction between 2-3 components/modules
- Use real dependencies (or partially mocked)
- Run in browser environment (Vitest browser mode)
- Medium execution (seconds to minutes)
- Example: Testing form submission flow with real DOM

### E2E (End-to-End) Tests

- Test complete user scenarios across multiple pages
- No mocking (or minimal external API mocking)
- Run in real browser (Playwright)
- Slow execution (minutes)
- Example: User creates plan, adds accounts, runs projection, sees results

---

**Research Complete:** 2026-01-20
**Next Step:** Proceed with Playwright implementation in Phase 7 (E2E Testing)
