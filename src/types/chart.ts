/**
 * Data point for a single year in chart visualization
 */
export interface ChartDataPoint {
  year: number;
  age: number;
  netWorth: number;
  startingBalance: number;
  growth: number;
  spending: number;
  endingBalance: number;
}

/**
 * Complete chart dataset derived from simulation result
 */
export interface ChartData {
  points: ChartDataPoint[];
  minNetWorth: number;
  maxNetWorth: number;
  years: number;
}

/**
 * Configuration for a data series in multi-series charts
 */
export interface ChartSeries {
  key: keyof ChartDataPoint;
  name: string;
  color: string;
}
