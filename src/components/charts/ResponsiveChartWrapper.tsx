import { type ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Box } from '@mantine/core';

interface ResponsiveChartWrapperProps {
  children: ReactNode;
  height?: number;
  minHeight?: number;
  debounce?: number;
}

/**
 * Wrapper component that ensures ResponsiveContainer has proper parent dimensions.
 *
 * CRITICAL: ResponsiveContainer requires parent with explicit dimensions.
 * This component uses Mantine's Box with defined height to satisfy that requirement.
 *
 * From 17-RESEARCH.md Pattern 1:
 * - Parent element MUST have explicit or percentage-based dimensions
 * - ResponsiveContainer cannot be used inside flex container without explicit sizing
 */
export function ResponsiveChartWrapper({
  children,
  height = 300,
  minHeight = 200,
  debounce = 200, // Debounce resize calculations for mobile performance
}: ResponsiveChartWrapperProps) {
  return (
    <Box
      style={{
        width: '100%',
        height: `${height}px`,
        minHeight: `${minHeight}px`,
        position: 'relative',
      }}
    >
      <ResponsiveContainer width="100%" height={height} debounce={debounce}>
        {children}
      </ResponsiveContainer>
    </Box>
  );
}
