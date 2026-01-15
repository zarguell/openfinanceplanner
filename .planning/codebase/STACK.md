# Technology Stack

**Analysis Date:** 2026-01-15

## Languages

**Primary:**

- JavaScript ES2020+ - All application code using ES6 modules

**Secondary:**

- HTML5 - Markup structure
- CSS3 - Styling with custom properties for theming

## Runtime

**Environment:**

- Browser-based - Runs entirely in client-side browsers (Chrome 90+, Firefox 88+, Safari 14+)
- No Node.js runtime - Pure client-side application

**Package Manager:**

- No package manager dependencies
- Lockfile: Not applicable (no build process)

## Frameworks

**Core:**

- None - Vanilla JavaScript with ES6 modules (no React, Vue, Angular)

**Testing:**

- Custom test runner - Plain JavaScript with assert-style testing (no formal framework)

**Build/Dev:**

- None - No build process, no transpilation, direct browser execution
- Python HTTP server - Development server via `npm run serve` (python3 -m http.server 3030)

## Key Dependencies

**Critical:**

- Chart.js v4.4.0 - Data visualization loaded via CDN (`index.html` line 11)

**Infrastructure:**

- No external dependencies - All business logic implemented natively
- Browser built-ins - localStorage, ES6 modules, Web APIs

## Configuration

**Environment:**

- No .env files or environment variables
- Configuration embedded in application code
- User preferences stored in localStorage under app configuration

**Build:**

- No build configuration files
- No bundler (webpack, vite, rollup)
- No transpiler (TypeScript, Babel)

## Platform Requirements

**Development:**

- Any platform with Python 3 (for development server)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- No external tooling required

**Production:**

- Static file hosting or CDN
- Browser-based execution only
- No server-side requirements

---

_Stack analysis: 2026-01-15_
_Update after major dependency changes_
