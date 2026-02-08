/**
 * Format a number as currency string
 * @param value - Numeric value to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string (e.g., "$150,000")
 */
export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

/**
 * Format currency in compact notation for axis labels
 * @param value - Numeric value to format
 * @returns Compact format (e.g., "$150k" instead of "$150,000")
 */
export function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a number with commas (no currency symbol)
 * @param value - Numeric value to format
 * @returns Formatted number (e.g., "150,000")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
