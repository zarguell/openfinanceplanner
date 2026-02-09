/**
 * Store utility functions for state export/import
 *
 * Provides utilities for backing up and restoring store state
 * via JSON file downloads and uploads.
 *
 * @example
 * ```ts
 * import { exportState, importState } from '@/store/utils'
 * import { useStore } from '@/store'
 *
 * // Export current state
 * const handleExport = () => {
 *   const state = useStore.getState()
 *   exportState(state)
 * }
 *
 * // Import state from file
 * const handleImport = async (file: File) => {
 *   const state = await importState(file)
 *   useStore.setState(state)
 * }
 * ```
 */

export { exportState } from './export';
export { importState } from './import';
