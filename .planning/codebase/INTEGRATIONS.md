# External Integrations

**Analysis Date:** 2026-01-15

## APIs & External Services

**Data Visualization:**

- Chart.js - Interactive charts for financial projections
  - SDK/Client: CDN load via `index.html` (v4.4.0)
  - Auth: No authentication required
  - Endpoints used: None (client-side only)

**External APIs:**

- None - No external API integrations
  - Integration method: Not applicable
  - Auth: Not applicable
  - Rate limits: Not applicable

## Data Storage

**Databases:**

- None - No database integration
  - Connection: Not applicable
  - Client: Not applicable
  - Migrations: Not applicable

**File Storage:**

- localStorage - Client-side browser storage
  - SDK/Client: Browser built-in API
  - Auth: Not applicable (browser-scoped)
  - Capacity: 5-10MB limit per domain

**Caching:**

- None - All calculations run in real-time

## Authentication & Identity

**Auth Provider:**

- None - No authentication system
  - Implementation: Not applicable
  - Token storage: Not applicable
  - Session management: Not applicable

**OAuth Integrations:**

- None - No OAuth providers

## Monitoring & Observability

**Error Tracking:**

- None - No error tracking service

**Analytics:**

- None - No analytics integration

**Logs:**

- Browser console - console.log, console.error for debugging
  - Integration: Browser DevTools only
  - Retention: Session-only (not persisted)

## CI/CD & Deployment

**Hosting:**

- Static file hosting - Any static hosting provider or CDN
  - Deployment: Manual file upload or GitHub Pages
  - Environment vars: Not applicable

**CI Pipeline:**

- None - No continuous integration

## Environment Configuration

**Development:**

- Required env vars: None
- Secrets location: Not applicable (no secrets)
- Mock/stub services: Not applicable (all client-side)

**Staging:**

- Environment-specific differences: Not applicable
- Data: Same as production (localStorage)

**Production:**

- Secrets management: Not applicable
- Failover/redundancy: Not applicable (client-side only)

## Webhooks & Callbacks

**Incoming:**

- None - No webhooks

**Outgoing:**

- None - No external callbacks

---

_Integration audit: 2026-01-15_
_Update when adding/removing external services_
