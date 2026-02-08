# Phase 17: Data Visualization - Research

**Researched:** 2026-02-08  
**Domain:** React data visualization with Recharts  
**Confidence:** HIGH

## Summary

Recharts is the established standard for React charting libraries, with over 24.8K GitHub stars and 3.6M+ weekly downloads. It provides declarative, composable React components built on top of D3, with full TypeScript support and SVG-based rendering. For financial data visualization in a mobile-first application, the key patterns involve wrapping charts in `ResponsiveContainer`, using `syncId` for coordinated interactions, and implementing custom tooltips for currency formatting.

The primary integration concerns are: (1) ensuring `ResponsiveContainer` has a parent with defined dimensions, (2) using stable references for `dataKey` functions to prevent unnecessary re-renders, and (3) mocking the container in tests since it relies on DOM measurements that don't work in JSDOM.

**Primary recommendation:** Use Recharts 3.x with `ResponsiveContainer` for all charts, implement custom tooltip components for financial formatting, and memoize all callback props to prevent performance degradation with Zustand state updates.

---

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library             | Version  | Purpose               | Why Standard                                                     |
| ------------------- | -------- | --------------------- | ---------------------------------------------------------------- |
| recharts            | ^3.0.0   | Charting library      | De facto React standard, 3.6M+ weekly downloads, declarative API |
| ResponsiveContainer | Built-in | Mobile responsiveness | Only reliable way to make charts responsive in Recharts          |

### Supporting

| Library                 | Version | Purpose                | When to Use                                 |
| ----------------------- | ------- | ---------------------- | ------------------------------------------- |
| react-error-boundary    | ^4.x    | Error handling         | Wrap charts to prevent crash on data errors |
| ResizeObserver polyfill | ^1.x    | Legacy browser support | Only if supporting IE11 or older Safari     |

### Alternatives Considered

| Instead of | Could Use | Tradeoff                                                              |
| ---------- | --------- | --------------------------------------------------------------------- |
| Recharts   | Victory   | Victory has React Native support but larger bundle                    |
| Recharts   | Nivo      | Nivo has Canvas support for large datasets but steeper learning curve |
| Recharts   | Chart.js  | Chart.js uses Canvas (better performance) but less React-idiomatic    |

**Installation:**

```bash
npm install recharts
# No additional packages required for core functionality
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── charts/
│   │   ├── NetWorthChart.tsx       # Main projection chart
│   │   ├── CustomTooltip.tsx       # Reusable financial tooltip
│   │   └── ResponsiveChart.tsx     # Wrapper with error boundary
│   └── tables/
│       └── ProjectionTable.tsx     # Year-by-year data table
├── hooks/
│   └── useChartData.ts             # Transform simulation data for charts
└── types/
    └── chart.ts                    # Chart-specific type definitions
```

### Pattern 1: ResponsiveContainer Wrapper

**What:** All charts must be wrapped in `ResponsiveContainer` which uses ResizeObserver to adapt to parent dimensions.

**When to use:** Every chart component. Never use fixed width/height on chart components directly.

**Example:**

```typescript
// Source: Context7 - Recharts official documentation
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function NetWorthChart({ data }: { data: ChartData[] }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <Line type="monotone" dataKey="netWorth" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Key requirements:**

- Parent element MUST have explicit or percentage-based dimensions
- `ResponsiveContainer` cannot be used inside a flex container without explicit sizing
- Use `minWidth`/`minHeight`/`maxHeight` props for constraints

### Pattern 2: Custom Financial Tooltip

**What:** Custom tooltip component for formatting currency values and dates.

**When to use:** When displaying monetary values or when default tooltip styling doesn't match design.

**Example:**

```typescript
// Source: Context7 - Recharts documentation
import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  currency?: string;
}

const FinancialTooltip = ({ active, payload, label, currency = '$' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Year: {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: '5px 0' }}>
            {entry.name}: {currency}{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Usage in chart
<Tooltip content={<FinancialTooltip currency="$" />} />
```

### Pattern 3: State Synchronization with Zustand

**What:** Connect chart data to Zustand store for real-time updates.

**When to use:** When chart must react to state changes (input updates, simulation re-runs).

**Example:**

```typescript
import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulation';

function useChartData() {
  const simulationResult = useSimulationStore((state) => state.result);

  // Transform simulation data to chart format
  const chartData = useMemo(() => {
    if (!simulationResult?.projections) return [];

    return simulationResult.projections.map((projection) => ({
      year: projection.year,
      netWorth: projection.netWorth,
      totalAssets: projection.totalAssets,
      totalLiabilities: projection.totalLiabilities,
    }));
  }, [simulationResult]);

  return chartData;
}
```

**Performance optimization:**

- Always use `useMemo` for data transformation
- Select only needed state from Zustand to minimize re-renders
- Use `React.memo` on chart components

### Pattern 4: Area Chart with Gradient

**What:** Area chart with gradient fill for visual appeal.

**When to use:** For net worth projection showing accumulation over time.

**Example:**

```typescript
// Source: Context7 - Recharts AreaChart examples
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function NetWorthAreaChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="year" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip content={<FinancialTooltip />} />
        <Area
          type="monotone"
          dataKey="netWorth"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorNetWorth)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Anti-Patterns to Avoid

- **Inline dataKey functions:** `dataKey={(entry) => entry.value}` creates new reference on every render, causing performance issues. Use string keys or memoized functions.
- **No parent dimensions:** Placing `ResponsiveContainer` in flex container without explicit sizing causes 0x0 dimensions.
- **Unmemoized data transformation:** Transforming data inline in render causes unnecessary re-renders.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem               | Don't Build                 | Use Instead                     | Why                                                                   |
| --------------------- | --------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| Resize detection      | Custom ResizeObserver hook  | `ResponsiveContainer` component | Uses native ResizeObserver, handles cleanup, tested across browsers   |
| Tooltip display       | Custom overlay positioning  | `Tooltip` component             | Handles positioning, collision detection, touch events automatically  |
| Chart zoom/pan        | Custom mouse/touch handlers | `Brush` component               | Built-in range selection, keyboard accessible, touch-friendly         |
| Chart synchronization | Custom event system         | `syncId` prop on charts         | Synchronizes tooltip/hover state across multiple charts automatically |
| Y-axis formatting     | Custom tick component       | `tickFormatter` prop            | Built-in formatting with proper spacing                               |
| Animation             | CSS transitions             | `isAnimationActive` prop        | SVG-based animations optimized for charts                             |

**Key insight:** Recharts components handle complex SVG coordinate calculations, event delegation, and accessibility. Custom implementations often miss edge cases like high-DPI displays, RTL layouts, or keyboard navigation.

---

## Common Pitfalls

### Pitfall 1: ResponsiveContainer in Tests

**What goes wrong:** `ResponsiveContainer` renders with 0x0 dimensions in test environment because JSDOM doesn't support layout measurements.

**Why it happens:** `ResponsiveContainer` uses ResizeObserver which requires actual DOM layout calculations unavailable in JSDOM.

**How to avoid:** Mock `ResponsiveContainer` in tests to provide fixed dimensions:

```typescript
// Setup in test file or jest.setup.ts
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, width = 800, height = 600 }: any) => (
      <OriginalModule.ResponsiveContainer width={width} height={height}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});
```

**Warning signs:** Test passes but chart SVG elements not found; `screen.debug()` shows empty container.

### Pitfall 2: Unstable Function References

**What goes wrong:** Charts re-render excessively or animations restart on every state update.

**Why it happens:** Passing inline functions or objects as props creates new references each render, triggering Recharts internal comparison.

**How to avoid:**

```typescript
// BAD - new function on every render
<Line dataKey={(entry) => entry.value} />

// GOOD - stable string key
<Line dataKey="value" />

// GOOD - memoized function
const getValue = useCallback((entry: DataPoint) => entry.value, []);
<Line dataKey={getValue} />

// BAD - inline margin object
<LineChart margin={{ top: 5, right: 20 }} />

// GOOD - constant outside component or memoized
const CHART_MARGIN = { top: 5, right: 20, bottom: 5, left: 0 };
<LineChart margin={CHART_MARGIN} />
```

### Pitfall 3: Mobile Touch Events

**What goes wrong:** Tooltip doesn't appear on touch devices or chart interaction feels laggy.

**Why it happens:** Recharts uses mouse events by default; touch events may be interrupted by browser gestures or other elements.

**How to avoid:**

- Ensure tooltips have `cursor={{ stroke: 'color', strokeWidth: 2 }}` for visual feedback
- Test on actual devices (iOS Safari has known issues with touch event interception as of Recharts 3.x)
- Consider using `debounce` prop on ResponsiveContainer: `debounce={200}` to reduce resize calculations on mobile orientation changes

### Pitfall 4: Parent Container Sizing

**What goes wrong:** Chart doesn't appear or has 0 height.

**Why it happens:** `ResponsiveContainer` requires parent to have defined dimensions. In flex/grid layouts, percentage heights often resolve to 0.

**How to avoid:**

```typescript
// BAD - no explicit height
<div>
  <ResponsiveContainer height="100%">...</ResponsiveContainer>
</div>

// GOOD - explicit height on parent
<div style={{ height: 300 }}>
  <ResponsiveContainer height="100%">...</ResponsiveContainer>
</div>

// GOOD - flex with explicit basis
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <div style={{ flex: '1 1 300px' }}>
    <ResponsiveContainer height="100%">...</ResponsiveContainer>
  </div>
</div>
```

### Pitfall 5: Large Dataset Performance

**What goes wrong:** Chart becomes sluggish with >1000 data points or causes browser freeze.

**Why it happens:** SVG rendering performance degrades with many DOM elements. Each data point creates multiple SVG nodes.

**How to avoid:**

- Aggregate data before rendering (show yearly instead of daily for long projections)
- Use `isAnimationActive={false}` for large datasets
- Consider data sampling: show every Nth point for overview, detail on zoom
- As noted in Recharts docs: "Does your chart truly need to display all 50,000 data points?"

---

## Testing Approach

### Unit Testing Strategy

Recharts renders SVG elements, so tests should query for SVG nodes rather than looking for component names.

**Mocking ResponsiveContainer:**

```typescript
// In setup file or test
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, width = 800, height = 400 }: any) => (
      <div style={{ width, height }}>{children}</div>
    ),
  };
});
```

**Testing chart rendering:**

```typescript
import { render, screen } from '@testing-library/react';
import { NetWorthChart } from './NetWorthChart';

describe('NetWorthChart', () => {
  const mockData = [
    { year: 2024, netWorth: 100000 },
    { year: 2025, netWorth: 110000 },
  ];

  it('renders chart with data', () => {
    render(<NetWorthChart data={mockData} />);

    // Query SVG elements created by Recharts
    const lines = document.querySelectorAll('.recharts-line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('displays correct number of data points', () => {
    render(<NetWorthChart data={mockData} />);

    const dots = document.querySelectorAll('.recharts-dot');
    expect(dots).toHaveLength(mockData.length);
  });
});
```

**Testing custom tooltip:**

```typescript
import { render, screen } from '@testing-library/react';
import { FinancialTooltip } from './CustomTooltip';

describe('FinancialTooltip', () => {
  it('formats currency correctly', () => {
    render(
      <FinancialTooltip
        active={true}
        payload={[{ name: 'Net Worth', value: 150000, color: '#8884d8' }]}
        label={2025}
      />
    );

    expect(screen.getByText(/\$150,000/)).toBeInTheDocument();
  });
});
```

**Testing with Zustand:**

```typescript
import { renderHook } from '@testing-library/react';
import { useChartData } from './useChartData';
import { useSimulationStore } from '@/stores/simulation';

// Reset store before each test
beforeEach(() => {
  useSimulationStore.setState({ result: null });
});

describe('useChartData', () => {
  it('transforms simulation result to chart data', () => {
    useSimulationStore.setState({
      result: {
        projections: [
          {
            year: 2024,
            netWorth: 100000,
            totalAssets: 150000,
            totalLiabilities: 50000,
          },
        ],
      },
    });

    const { result } = renderHook(() => useChartData());

    expect(result.current).toEqual([
      {
        year: 2024,
        netWorth: 100000,
        totalAssets: 150000,
        totalLiabilities: 50000,
      },
    ]);
  });
});
```

### Integration Testing

For chart interactions and visual regression, use Cypress or Playwright:

```typescript
// Cypress example
describe('Net Worth Chart', () => {
  it('shows tooltip on hover', () => {
    cy.visit('/dashboard');
    cy.get('.recharts-line').first().trigger('mouseover');
    cy.get('.recharts-tooltip-wrapper').should('be.visible');
  });
});
```

---

## Mobile-First Considerations

### Responsive Design

- Use `ResponsiveContainer` with percentage widths
- Set `minHeight` to prevent charts from becoming too small
- Consider hiding less critical data series on mobile
- Use `aspect` prop for consistent aspect ratios: `aspect={2}` (width/height = 2)

### Touch Interactions

- Tooltips work on touch but require tap-and-hold
- Brush component supports touch for zooming/panning
- Test on actual devices - iOS Safari has specific touch event handling

### Performance on Mobile

- Disable animations on low-powered devices: `isAnimationActive={!isMobile}`
- Reduce data points for mobile viewports
- Use `debounce` prop on ResponsiveContainer to limit resize calculations

---

## State of the Art

| Old Approach          | Current Approach    | When Changed | Impact                                                                   |
| --------------------- | ------------------- | ------------ | ------------------------------------------------------------------------ |
| Recharts 2.x          | Recharts 3.x        | 2024         | Improved performance, removed react-smooth dependency, better TypeScript |
| Custom ResizeObserver | ResponsiveContainer | Always       | Standardized responsive behavior                                         |
| Class components      | Function components | React 16.8+  | Better hooks integration                                                 |
| Redux for chart data  | Zustand + computed  | 2023+        | Less boilerplate, better performance                                     |

**Deprecated/outdated:**

- `recharts-scale` dependency: Now built into Recharts 3.x
- `react-smooth` dependency: Animation now built into Recharts 3.x
- `Cell` component for bar coloring: Use `shape` prop instead (migration guide available)

---

## Open Questions

1. **Touch event reliability on iOS**
   - What we know: Recharts 3.x has reported issues with touch events on iOS (GitHub issue #6092)
   - What's unclear: Exact conditions that trigger the bug
   - Recommendation: Test extensively on iOS Safari; consider disabling complex interactions if issues arise

2. **Maximum data point performance threshold**
   - What we know: Performance degrades with >1000 points
   - What's unclear: Exact threshold depends on device and chart complexity
   - Recommendation: Implement data aggregation for projections >50 years; profile on target devices

---

## Sources

### Primary (HIGH confidence)

- Context7: `/recharts/recharts` - ResponsiveContainer, Tooltip, syncId, AreaChart, performance patterns
- Recharts Official Performance Guide: https://recharts.github.io/en-US/guide/performance/
- Recharts GitHub: https://github.com/recharts/recharts (v3.x migration guide)

### Secondary (MEDIUM confidence)

- LogRocket: "Best React chart libraries 2025" - Library comparison and community insights
- Medium: "React Writing tests with Charts" - Testing patterns for Recharts
- StackOverflow: ResponsiveContainer testing solutions (multiple verified answers)

### Tertiary (LOW confidence)

- GitHub issues discussing touch events on iOS (#6092) - Known but not fully resolved
- Community blog posts on Zustand + Recharts integration patterns

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Context7 documentation and official sources
- Architecture: HIGH - Official docs and verified patterns
- Pitfalls: HIGH - Documented in official performance guide and GitHub issues
- Testing: MEDIUM - Community patterns, verified through multiple sources

**Research date:** 2026-02-08  
**Valid until:** 2026-05-08 (Recharts is stable but check for v3.x updates)
