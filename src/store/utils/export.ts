import type { StoreState } from '../types';

/**
 * Export store state as a downloadable JSON file
 *
 * Creates a JSON file with the current store state and triggers a download
 * in the browser. The filename includes the current date for easy identification.
 *
 * @param state - The current store state to export
 *
 * @example
 * ```ts
 * import { useStore } from '@/store'
 *
 * const handleExport = () => {
 *   const state = useStore.getState()
 *   exportState(state)
 * }
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
 */
export function exportState(state: StoreState): void {
  // Convert state to formatted JSON string
  const data = JSON.stringify(state, null, 2);

  // Create a blob with the JSON data
  const blob = new Blob([data], { type: 'application/json' });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `finance-planner-${new Date().toISOString().split('T')[0]}.json`;

  // Append to DOM, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL to prevent memory leaks
  URL.revokeObjectURL(url);
}
