import type { StoreState } from '../types'

/**
 * Import store state from a JSON file
 *
 * Reads a JSON file, validates its structure, and returns the parsed state.
 * Throws an error if the file is malformed or missing required fields.
 *
 * @param file - The JSON file to import
 * @returns Promise that resolves with the parsed store state
 * @throws Error if JSON is malformed or missing required structure
 *
 * @example
 * ```ts
 * import { importState } from '@/store/utils'
 * import { useStore } from '@/store'
 *
 * const handleImport = async (file: File) => {
 *   try {
 *     const state = await importState(file)
 *     useStore.setState(state)
 *   } catch (error) {
 *     console.error('Import failed:', error)
 *   }
 * }
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 */
export async function importState(file: File): Promise<StoreState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // Parse JSON from file content
        const content = e.target?.result
        if (typeof content !== 'string') {
          throw new Error('File content is not a string')
        }

        const data = JSON.parse(content)

        // Validate that data is an object and not null
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid file format: not an object')
        }

        // Validate that data has the expected structure
        // We check for presence of key fields, but don't do full type validation
        // as TypeScript will handle that at compile time
        if (
          !('profile' in data) ||
          !('projection' in data) ||
          !('_hasHydrated' in data)
        ) {
          throw new Error(
            'Invalid file format: missing required fields (profile, projection, _hasHydrated)'
          )
        }

        // Return validated data as StoreState
        resolve(data as StoreState)
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Malformed JSON: ' + error.message))
        } else {
          reject(error)
        }
      }
    }

    reader.onerror = () => {
      reject(new Error('File read error: ' + reader.error?.message))
    }

    // Read the file as text
    reader.readAsText(file)
  })
}
