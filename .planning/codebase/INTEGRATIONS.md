# External Integrations

**Analysis Date:** 2026-01-16

## APIs & External Services

**External Libraries:**

- Chart.js 4.4.0 - Data visualization for financial projections
  - Integration method: CDN-loaded in `index.html` (line 11)
  - Usage: Chart rendering for projection results and analysis

**External APIs:**

- Not detected - No external API calls found (no fetch, axios, or XMLHttpRequest usage)

## Data Storage

**Client-Side Storage:**

- Browser localStorage - User data persistence
  - Implementation: `src/storage/StorageManager.js`
  - Schema: `src/storage/schema.js`
  - Purpose: Store financial plans, accounts, and user settings

**Configuration Data:**

- Embedded tax configuration - Federal and state tax brackets
  - Location: `src/calculations/tax/config/federal-2024.js`, `src/calculations/tax/config/federal-2025.js`
  - Location: `src/calculations/tax/config/states-2024.js`, `src/calculations/tax/config/states-2025.js`
  - Location: `config/loader.js` for contribution limits and thresholds

## Authentication & Identity

**No Authentication Required:**

- Client-side only application with no user accounts
- No external identity providers
- Data stored locally in browser only

## Monitoring & Observability

**Error Tracking:**

- None - No external error tracking service

**Analytics:**

- None - No usage analytics or tracking

**Logs:**

- Browser console only - No centralized logging service

## CI/CD & Deployment

**Development Server:**

- Python HTTP Server 3.x - Local development
  - Command: `python3 -m http.server 3030`
  - Configuration: `package.json` script

**Static Hosting:**

- Any static web server - Production deployment
  - Requirements: ES6 module support in browser
  - Files: Static assets served from project root

## Environment Configuration

**Development:**

- No environment variables required
- Configuration embedded in JavaScript modules
- No secrets management needed

**Staging:**

- Not applicable - No separate staging environment

**Production:**

- No external configuration
- Self-contained application with no external dependencies

## Webhooks & Callbacks

**Incoming:**

- None - No server endpoints or webhooks

**Outgoing:**

- None - No external service communication

---

_Integration audit: 2026-01-16_
_Update when adding/removing external services_
