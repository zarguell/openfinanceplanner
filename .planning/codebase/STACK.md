# Technology Stack

**Analysis Date:** 2026-01-16

## Languages

**Primary:**

- JavaScript (ES6 Modules) - All application code in `.js` files throughout `src/`

**Secondary:**

- HTML5 - `index.html`
- CSS3 - `src/styles/base.css`, `src/styles/layout.css`, `src/styles/components.css`, `src/styles/variables.css`

## Runtime

**Environment:**

- Browser-based client-side application - No Node.js runtime detected for production
- Python 3 for development server - `package.json` script: `"serve": "python3 -m http.server 3030"`

**Package Manager:**

- npm - `package.json`
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**

- Vanilla JavaScript (ES6 Modules) - No web framework detected

**Testing:**

- Vitest - Testing framework, `vitest.config.js`

**Build/Dev:**

- ESLint - Code quality, `eslint.config.js`
- Prettier - Code formatting, `package.json`
- Python HTTP Server - Development server

## Key Dependencies

**Critical:**

- Chart.js 4.4.0 (CDN) - Data visualization, loaded via CDN in `index.html`

**Infrastructure:**

- Browser built-ins - localStorage, DOM APIs, fetch (unused)

## Configuration

**Environment:**

- No environment variables - No .env files detected
- Configuration via embedded JavaScript modules

**Build:**

- ESLint configuration - `eslint.config.js`
- Vitest configuration - `vitest.config.js`
- Prettier configuration - `.prettierrc.json`

## Platform Requirements

**Development:**

- Any platform with Python 3 and a browser
- No external dependencies

**Production:**

- Static web hosting (any web server)
- Modern browser with ES6 module support

---

_Stack analysis: 2026-01-16_
_Update after major dependency changes_
