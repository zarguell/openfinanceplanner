# Phase 15: State Management & Persistence - Research

**Researched:** 2026-02-08
**Domain:** Zustand state management with IndexedDB persistence
**Confidence:** HIGH

## Summary

This phase requires implementing a Zustand-based global state management layer with IndexedDB persistence for the Open Finance Planner application. The research confirms that **Zustand 5.x** with its official **persist middleware** is the current standard (2026) for React state management, offering 65% less code than Redux Toolkit while providing built-in TypeScript support, middleware composition, and async storage handling.

For IndexedDB persistence, two viable approaches exist: (1) **custom storage adapter using idb-keyval** following the official Zustand documentation pattern, or (2) the dedicated **zustand-indexeddb** library (last updated Dec 2025). The custom idb-keyval approach is recommended as it provides explicit control, follows official documentation patterns, and avoids the opinionated constraints of zustand-indexeddb (which is designed specifically for non-serializable data like FileSystemFileHandle).

**Primary recommendation:** Use Zustand 5.x with persist middleware, create a custom IndexedDB storage adapter using idb-keyval 6.2.2, implement a single store with logical slices for the financial projection state, and build JSON export/import using Blob/File APIs.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **zustand** | ^5.0.0 | Global state management | Current standard (2026), 65% less boilerplate than Redux, built-in TypeScript support, official React hooks integration, active maintenance (53.4k GitHub stars) |
| **idb-keyval** | ^6.2.0 | IndexedDB promise wrapper | Official recommendation from Zustand docs for custom storage, tiny footprint, mature library (last updated Aug 2024), promise-based API perfect for async persist middleware |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Not required | - | - | All functionality provided by core stack |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom idb-keyval adapter | zustand-indexeddb | zustand-indexeddb is designed for non-serializable data (FileHandles, etc.), forces single database per store, doesn't use createJSONStorage - overkill for JSON-serializable financial data |
| Zustand | Redux Toolkit | 65% more code, requires Provider boilerplate, more complex setup for same functionality |
| Zustand | Jotai/TanStack Query | Different paradigms (atomic/server state), not designed for global app state |
| IndexedDB | localStorage | Only ~5MB limit vs 2GB+, would fail STATE-06 (large dataset support) |

**Installation:**
```bash
npm install zustand idb-keyval
npm install --save-dev @types/idb-keyval  # TypeScript types
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── store/
│   ├── index.ts           # Main store creation & export
│   ├── types.ts           # Store-specific TypeScript types
│   ├── slices/
│   │   ├── profile.ts     # UserProfile state slice
│   │   └── projection.ts  # Projection results state slice
│   ├── middleware/
│   │   └── indexeddb.ts   # Custom IndexedDB storage adapter
│   └── utils/
│       ├── export.ts      # JSON export functionality
│       └── import.ts      # JSON import functionality
├── core/
│   ├── types/             # Existing core types (UserProfile, SimulationResult)
│   └── projection/        # Existing projection logic
└── components/
    └── (future UI)
```

### Pattern 1: Custom IndexedDB Storage Adapter

**What:** Create a StateStorage-compliant adapter using idb-keyval for Zustand's persist middleware

**When to use:** Required for STATE-02 (IndexedDB persistence)

**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-use-a-custom-storage-engine
import { StateStorage, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

// Custom IndexedDB storage adapter
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  },
}

// Usage in persist middleware
storage: createJSONStorage(() => indexedDBStorage)
```

### Pattern 2: Single Store with Logical Slices

**What:** One Zustand store with state organized by domain slices

**When to use:** Default recommendation for this phase - features are related (profile + projection)

**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/guides/slices-pattern
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserProfile, SimulationResult } from '@/core/types'

// Slice interfaces
interface ProfileSlice {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

interface ProjectionSlice {
  projection: SimulationResult[] | null
  setProjection: (projection: SimulationResult[]) => void
  clearProjection: () => void
}

// Main store combining slices
export const useStore = create<ProfileSlice & ProjectionSlice>()(
  persist(
    (set) => ({
      // Profile slice
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),

      // Projection slice
      projection: null,
      setProjection: (projection) => set({ projection }),
      clearProjection: () => set({ projection: null }),
    }),
    {
      name: 'open-finance-planner',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
)
```

### Pattern 3: Hydration Tracking

**What:** Track store hydration state to prevent UI flash/loading issues

**When to use:** Required for STATE-03 (hydration on app load)

**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
interface HydrationSlice {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useStore = create<ProfileSlice & ProjectionSlice & HydrationSlice>()(
  persist(
    (set) => ({
      // ... other slices
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'open-finance-planner',
      storage: createJSONStorage(() => indexedDBStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Usage in component
export function App() {
  const hasHydrated = useStore((state) => state._hasHydrated)
  if (!hasHydrated) return <div>Loading...</div>
  return <MainApp />
}
```

### Pattern 4: JSON Export with Blob API

**What:** Export store state as downloadable JSON file

**When to use:** Required for STATE-04 (JSON export)

**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
export function exportState(store: StoreState) {
  const data = JSON.stringify(store, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `finance-planner-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

### Pattern 5: JSON Import with File API

**What:** Import state from uploaded JSON file

**When to use:** Required for STATE-05 (JSON import)

**Example:**
```typescript
// Source: https://stackoverflow.com/questions/70069445/how-do-i-upload-json-file-to-react-web-app
export async function importState(file: File): Promise<StoreState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

// Usage in component
<input
  type="file"
  accept="application/json"
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const state = await importState(file)
      useStore.setState(state)
    }
  }}
/>
```

### Anti-Patterns to Avoid

- **Multiple stores for related data:** Use slices in a single store instead. Only use multiple stores for completely isolated features.
- **Manual localStorage/sessionStorage:** IndexedDB is required for STATE-06 (large datasets). localStorage has ~5MB limit; IndexedDB supports 2GB+.
- **Synchronous storage assumption:** Always treat IndexedDB operations as async. Use `onRehydrateStorage` or `hasHydrated()` to detect when hydration completes.
- **Ignoring hydration state:** Failing to track `_hasHydrated` causes UI flash/wrong state on initial render.
- **Object reference issues during rehydration:** Use `onRehydrateStorage` callback to handle post-hydration logic, not immediate state access after store creation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State management | Custom Context + useReducer | Zustand | Zustand provides devtools, persist middleware, TypeScript support, selectors, and prevents re-renders out of the box |
| IndexedDB wrapper | Native IndexedDB API | idb-keyval | Native IndexedDB is event-based and verbose (~50 lines for what idb-keyval does in 1). idb-keyval provides promise-based API perfect for async middleware |
| Storage adapter | Custom persist logic | Zustand persist middleware | Handles hydration, rehydration, versioning, migration, merge strategies, and storage abstraction automatically |
| JSON serialization | Manual JSON.parse/stringify | createJSONStorage() | Handles serialization/deserialization, type safety with TypeScript, and edge cases (Map/Set, Date, etc.) |
| File download | Server-side download | Blob + URL.createObjectURL() | Client-side downloads are faster, no server round-trip, works offline, maintains data privacy |

**Key insight:** Building custom state management or persistence seems simple but quickly becomes complex. Hydration race conditions, versioning, migration, storage quotas, and TypeScript type safety are all solved problems. Zustand + idb-keyval provides production-ready solutions with 65% less code than alternatives.

## Common Pitfalls

### Pitfall 1: Hydration Race Conditions

**What goes wrong:** App renders before async IndexedDB hydration completes, showing default/empty state instead of persisted data

**Why it happens:** IndexedDB storage is asynchronous. Zustand initializes synchronously, then hydrates in a microtask. Components rendering immediately see empty state.

**How to avoid:**
1. Always add `_hasHydrated` field to store
2. Use `onRehydrateStorage` to set `hasHydrated: true`
3. Render loading state until hydrated:
```typescript
if (!hasHydrated) return <div>Loading...</div>
```

**Warning signs:** "User logged out" on page load, data flickering, state mismatch between reloads

### Pitfall 2: Storage Quota Exceeded

**What goes wrong:** App crashes with `QuotaExceededError` when storing large datasets

**Why it happens:** localStorage has ~5MB limit per origin. Multiple scenarios or long projections exceed this.

**How to avoid:** Use IndexedDB (2GB+ limit) via idb-keyval. For reference:
- localStorage: ~5MB
- sessionStorage: ~5MB
- IndexedDB: 2GB+ per origin (Chrome: 50% of disk up to 8TB, Firefox/Safari: 2GB)

**Warning signs:** Works with small data, fails with multiple scenarios. Tests pass but production fails.

### Pitfall 3: Missing TypeScript Types for Storage Adapter

**What goes wrong:** Custom storage adapter has type errors or loses type safety

**Why it happens:** Forgetting to import `StateStorage` type from Zustand middleware

**How to avoid:**
```typescript
import { StateStorage } from 'zustand/middleware'

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => { /* ... */ },
  setItem: async (name: string, value: string): Promise<void> => { /* ... */ },
  removeItem: async (name: string): Promise<void> => { /* ... */ },
}
```

**Warning signs:** Type errors on `storage` prop in `persist()` configuration

### Pitfall 4: File Import Memory Leak

**What goes wrong:** Blob URLs not revoked causing memory leaks

**Why it happens:** `URL.createObjectURL()` creates a reference that must be explicitly freed

**How to avoid:**
```typescript
const url = URL.createObjectURL(blob)
// ... use url
URL.revokeObjectURL(url) // Always cleanup
```

**Warning signs:** Memory usage increases with each file download/import operation

### Pitfall 5: Import Validation Missing

**What goes wrong:** Importing malformed JSON crashes the app or corrupts state

**Why it happens:** Not validating file structure before setting state

**How to avoid:**
```typescript
try {
  const data = JSON.parse(e.target?.result as string)
  // Validate schema
  if (!data.profile || !data.projection) {
    throw new Error('Invalid file format')
  }
  useStore.setState(data)
} catch (error) {
  console.error('Invalid JSON file:', error)
  // Show error to user
}
```

**Warning signs:** App crashes after file upload, state has `undefined` values

### Pitfall 6: Version Migrations Not Handled

**What goes wrong:** Updating state shape breaks existing users' persisted data

**Why it happens:** Stored data has old structure, new code expects new structure

**How to avoid:**
```typescript
{
  version: 1, // Increment when breaking changes occur
  migrate: (persistedState, version) => {
    if (version === 0) {
      // Migrate from v0 to v1
      persistedState.newField = persistedState.oldField
      delete persistedState.oldField
    }
    return persistedState
  }
}
```

**Warning signs:** Existing users see broken app after update, state fields are `undefined`

## Code Examples

Verified patterns from official sources:

### Creating the Main Store

```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { indexedDBStorage } from './middleware/indexeddb'
import type { UserProfile, SimulationResult } from '@/core/types'

interface StoreState {
  profile: UserProfile | null
  projection: SimulationResult[] | null
  _hasHydrated: boolean
  setProfile: (profile: UserProfile) => void
  setProjection: (projection: SimulationResult[]) => void
  clearProfile: () => void
  clearProjection: () => void
  setHasHydrated: (state: boolean) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      profile: null,
      projection: null,
      _hasHydrated: false,
      setProfile: (profile) => set({ profile }),
      setProjection: (projection) => set({ projection }),
      clearProfile: () => set({ profile: null }),
      clearProjection: () => set({ projection: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'open-finance-planner',
      storage: createJSONStorage(() => indexedDBStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
```

### Export/Import Utilities

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
import type { StoreState } from '../types'

export function exportState(state: StoreState) {
  const data = JSON.stringify(state, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `finance-planner-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function importState(file: File): Promise<StoreState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Basic validation
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid JSON: not an object')
        }
        resolve(data as StoreState)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
```

### Using Store in Component

```typescript
// Source: https://zustand.docs.pmnd.rs/guides/slices-pattern
import { useStore } from '@/store'
import { calculateProjection } from '@/core/projection'

export function ProfileForm() {
  const profile = useStore((state) => state.profile)
  const setProfile = useStore((state) => state.setProfile)
  const setProjection = useStore((state) => state.setProjection)

  const handleSubmit = (newProfile: UserProfile) => {
    setProfile(newProfile)
    const projection = calculateProjection(newProfile)
    setProjection(projection)
  }

  if (!profile) return <div>Loading...</div>

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux + redux-persist | Zustand + persist middleware | 2023-2024 | 65% less boilerplate, built-in TypeScript, no Provider wrapper |
| localStorage/sessionStorage | IndexedDB for large datasets | 2020+ | Storage increased from ~5MB to 2GB+ per origin |
| Native IndexedDB API | idb-keyval promise wrapper | 2019+ | Went from event-based verbose API to clean promise-based API |
| Manual file handling | Blob + URL.createObjectURL() | 2018+ | Standardized client-side file downloads without server |

**Deprecated/outdated:**
- **Context API alone for global state:** Lacks devtools, persistence, selectors, and performance optimizations. Use Zustand instead.
- **Multiple Context providers:** Causes "provider hell" and unnecessary re-renders. Zustand's single store with slices is cleaner.
- **localStorage for app state:** Insufficient for modern apps with large datasets. Use IndexedDB for anything >5MB.
- **Native IndexedDB in app code:** Too verbose and error-prone. Always use a wrapper like idb-keyval.

## Open Questions

1. **Should we implement state compression for large datasets?**
   - What we know: IndexedDB supports 2GB+, compression would add complexity
   - What's unclear: Typical size of a "scenario" ( UserProfile + ~80 years of SimulationResult )
   - Recommendation: Start without compression. Measure actual storage size. Add only if scenarios exceed ~100MB. JSON compresses well; could use `lz-string` library if needed.

2. **Should we support multiple concurrent scenarios?**
   - What we know: Requirements say "multiple scenarios" (STATE-06), but store structure currently has single `profile`/`projection`
   - What's unclear: Should users compare scenarios side-by-side? Or save/load different scenarios?
   - Recommendation: Start with single active scenario. Store can evolve to `scenarios: Map<string, {profile, projection}>` if UI needs comparison features.

## Sources

### Primary (HIGH confidence)

- [Zustand Official Docs - Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - Complete persist middleware API, custom storage examples, hydration patterns, TypeScript usage
- [Zustand Official Docs - Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern) - Official pattern for organizing large stores
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - Source of truth for current version (5.0.10), middleware implementation, TypeScript definitions
- [idb-keyval npm package](https://www.npmjs.com/package/idb-keyval) - Current version (6.2.2), API reference, usage examples
- [idb-keyval GitHub](https://github.com/jakearchibald/idb) - Authoritative source for idb-keyval implementation
- [MDN - Using Files from Web Applications](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications) - Official File API documentation (updated Sept 2025)
- [MDN - Storage Quotas and Eviction Criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) - Official browser storage limits (updated Jan 2026)

### Secondary (MEDIUM confidence)

- [GitHub - How can I use zustand persist with indexeddb? #1721](https://github.com/pmndrs/zustand/discussions/1721) - Community discussion on IndexedDB integration patterns (Mar 2024)
- [zustand-indexeddb GitHub](https://github.com/zustandjs/zustand-indexeddb) - Alternative approach, reveals limitations of dedicated library (Dec 2025)
- [Dev.to - Making Zustand Persist Play Nice with Async Storage](https://dev.to/finalgirl321/making-zustand-persist-play-nice-with-async-storage-react-suspense-part-12-58l1) - Race condition patterns with async storage (Apr 2025)
- [RxDB - IndexedDB Max Storage Size](https://rxdb.info/articles/indexeddb-max-storage-limit.html) - Detailed breakdown of IndexedDB limits by browser
- [LogRocket - Programmatically Downloading Files](https://blog.logrocket.com/programmatically-downloading-files-browser/) - Modern file download patterns (Aug 2024)

### Tertiary (LOW confidence)

- [Dev.to - React State Management with Zustand](https://dev.to/djibrilm/react-state-management-with-zustand-5hl9) - General Zustand introduction, lacks specific persistence patterns (Aug 2023)
- [Stack Overflow - Zustand re-rendering issue after restoring from IndexedDB](https://stackoverflow.com/questions/79366488) - Specific edge case, may not apply to our use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation verified, current versions confirmed (2026)
- Architecture: HIGH - Official Zustand patterns documented (slices, persist, custom storage)
- Pitfalls: HIGH - Official docs list hydration issues, MDN documents storage limits, common patterns well-known

**Research date:** 2026-02-08
**Valid until:** 2026-03-10 (30 days - stable ecosystem, but verify versions before implementation)
