import { useMemo } from 'react';
import { useStore } from '@/store';
import type { ChartData, ChartDataPoint } from '@/types/chart';

export function useChartData(): ChartData {
  const projection = useStore((state) => state.projection);

  return useMemo(() => {
    if (!projection || projection.length === 0) {
      return {
        points: [],
        minNetWorth: 0,
        maxNetWorth: 0,
        years: 0,
      };
    }

    const points: ChartDataPoint[] = projection.map((result) => ({
      year: result.year,
      age: result.age,
      netWorth: result.endingBalance,
      startingBalance: result.startingBalance,
      growth: result.growth,
      spending: result.spending,
      endingBalance: result.endingBalance,
    }));

    const netWorths = points.map((p) => p.netWorth);
    const minNetWorth = Math.min(...netWorths);
    const maxNetWorth = Math.max(...netWorths);

    return {
      points,
      minNetWorth,
      maxNetWorth,
      years: points.length,
    };
  }, [projection]);
}
