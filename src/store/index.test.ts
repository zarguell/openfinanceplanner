import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { useStore } from './index';
import { exportState } from './utils/export';
import { importState } from './utils/import';
import type { UserProfile, SimulationResult } from '@/core/types';

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.getState().clearProfile();
    useStore.getState().clearProjection();
    useStore.getState().setHasHydrated(false);
  });

  describe('ProfileSlice', () => {
    it('should set profile', () => {
      const profile: UserProfile = {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      };

      useStore.getState().setProfile(profile);

      expect(useStore.getState().profile).toEqual(profile);
    });

    it('should clear profile', () => {
      const profile: UserProfile = {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      };

      useStore.getState().setProfile(profile);
      expect(useStore.getState().profile).toEqual(profile);

      useStore.getState().clearProfile();
      expect(useStore.getState().profile).toBeNull();
    });

    it('should update existing profile', () => {
      const profile1: UserProfile = {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      };

      const profile2: UserProfile = {
        age: 35,
        currentSavings: 150000,
        annualGrowthRate: 8,
        annualSpending: 50000,
      };

      useStore.getState().setProfile(profile1);
      useStore.getState().setProfile(profile2);

      expect(useStore.getState().profile).toEqual(profile2);
    });
  });

  describe('ProjectionSlice', () => {
    it('should set projection', () => {
      const projection: SimulationResult[] = [
        {
          year: 0,
          age: 30,
          startingBalance: 100000,
          growth: 7000,
          spending: 40000,
          endingBalance: 67000,
        },
        {
          year: 1,
          age: 31,
          startingBalance: 67000,
          growth: 4690,
          spending: 40000,
          endingBalance: 31690,
        },
      ];

      useStore.getState().setProjection(projection);

      expect(useStore.getState().projection).toEqual(projection);
    });

    it('should clear projection', () => {
      const projection: SimulationResult[] = [
        {
          year: 0,
          age: 30,
          startingBalance: 100000,
          growth: 7000,
          spending: 40000,
          endingBalance: 67000,
        },
      ];

      useStore.getState().setProjection(projection);
      expect(useStore.getState().projection).toEqual(projection);

      useStore.getState().clearProjection();
      expect(useStore.getState().projection).toBeNull();
    });

    it('should update existing projection', () => {
      const projection1: SimulationResult[] = [
        {
          year: 0,
          age: 30,
          startingBalance: 100000,
          growth: 7000,
          spending: 40000,
          endingBalance: 67000,
        },
      ];

      const projection2: SimulationResult[] = [
        {
          year: 0,
          age: 35,
          startingBalance: 150000,
          growth: 12000,
          spending: 50000,
          endingBalance: 112000,
        },
      ];

      useStore.getState().setProjection(projection1);
      useStore.getState().setProjection(projection2);

      expect(useStore.getState().projection).toEqual(projection2);
    });
  });

  describe('HydrationSlice', () => {
    it('should set hasHydrated state', () => {
      expect(useStore.getState()._hasHydrated).toBe(false);

      useStore.getState().setHasHydrated(true);
      expect(useStore.getState()._hasHydrated).toBe(true);

      useStore.getState().setHasHydrated(false);
      expect(useStore.getState()._hasHydrated).toBe(false);
    });
  });

  describe('Store integration', () => {
    it('should maintain independent profile and projection state', () => {
      const profile: UserProfile = {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      };

      const projection: SimulationResult[] = [
        {
          year: 0,
          age: 30,
          startingBalance: 100000,
          growth: 7000,
          spending: 40000,
          endingBalance: 67000,
        },
      ];

      useStore.getState().setProfile(profile);
      useStore.getState().setProjection(projection);

      expect(useStore.getState().profile).toEqual(profile);
      expect(useStore.getState().projection).toEqual(projection);

      useStore.getState().clearProfile();
      expect(useStore.getState().profile).toBeNull();
      expect(useStore.getState().projection).toEqual(projection); // Should still be there
    });
  });
});

describe('exportState', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DOM APIs
    globalThis.Blob = class MockBlob {
      constructor(
        public parts: unknown[],
        public options: BlobPropertyBag
      ) {}
    } as unknown as typeof Blob;

    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    globalThis.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    } as unknown as typeof URL;

    globalThis.document = {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: mockClick,
      })),
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    } as unknown as Document;
  });

  it('should create blob with correct content type', () => {
    const state = useStore.getState();
    exportState(state);

    const createObjectURL = globalThis.URL.createObjectURL as ReturnType<
      typeof vi.fn
    >;
    expect(createObjectURL).toHaveBeenCalled();
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('should generate filename with current date format', () => {
    const state = useStore.getState();
    exportState(state);

    const createElement = globalThis.document.createElement as ReturnType<
      typeof vi.fn
    >;
    const link = createElement.mock.results[0].value;

    // Filename should match pattern: finance-planner-YYYY-MM-DD.json
    expect(link.download).toMatch(/^finance-planner-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('should create and click anchor element', () => {
    const state = useStore.getState();
    exportState(state);

    const createElement = globalThis.document.createElement as ReturnType<
      typeof vi.fn
    >;
    const mockBody = globalThis.document.body as unknown as {
      appendChild: ReturnType<typeof vi.fn>;
      removeChild: ReturnType<typeof vi.fn>;
    };

    expect(mockBody.appendChild).toHaveBeenCalled();
    const link = createElement.mock.results[0].value;
    expect(link.click).toHaveBeenCalled();
    expect(mockBody.removeChild).toHaveBeenCalled();
  });

  it('should revoke object URL to prevent memory leaks', () => {
    const state = useStore.getState();
    exportState(state);

    const revokeObjectURL = globalThis.URL.revokeObjectURL as ReturnType<
      typeof vi.fn
    >;
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});

describe('importState', () => {
  // Helper to create a mock File with embedded content
  function createMockFile(content: string, filename: string): File {
    const file = {
      name: filename,
      type: 'application/json',
      size: content.length,
      lastModified: Date.now(),
      _content: content, // Store content for FileReader to access
    } as unknown as File;

    return file;
  }

  // Setup FileReader mock before all tests
  beforeAll(() => {
    // Mock FileReader globally
    globalThis.FileReader = class MockFileReader {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      result: string | null = null;
      error: Error | null = null;

      readAsText(file: File) {
        // Simulate async file reading with immediate execution
        Promise.resolve().then(() => {
          if (this.onload) {
            // Try to get content from file
            const content = (file as any)._content;
            if (content) {
              this.result = content;
              this.onload({
                target: this,
              } as unknown as ProgressEvent<FileReader>);
            } else {
              this.error = new Error('No content');
              if (this.onerror) {
                this.onerror({
                  target: this,
                } as unknown as ProgressEvent<FileReader>);
              }
            }
          }
        });
      }
    } as unknown as typeof FileReader;
  });

  it('should parse valid JSON correctly', async () => {
    const validState = {
      profile: {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      },
      projection: [
        {
          year: 0,
          age: 30,
          startingBalance: 100000,
          growth: 7000,
          spending: 40000,
          endingBalance: 67000,
        },
      ],
      _hasHydrated: true,
    };

    const json = JSON.stringify(validState);
    const file = createMockFile(json, 'test.json');

    const result = await importState(file);

    expect(result).toEqual(validState);
  });

  it('should throw on malformed JSON', async () => {
    const invalidJson = '{ invalid json }';
    const file = createMockFile(invalidJson, 'test.json');

    await expect(importState(file)).rejects.toThrow('Malformed JSON');
  });

  it('should throw on non-object data', async () => {
    const notAnObject = JSON.stringify(['array', 'not', 'object']);
    const file = createMockFile(notAnObject, 'test.json');

    await expect(importState(file)).rejects.toThrow('missing required fields');
  });

  it('should throw on null data', async () => {
    const nullData = JSON.stringify(null);
    const file = createMockFile(nullData, 'test.json');

    await expect(importState(file)).rejects.toThrow(
      'Invalid file format: not an object'
    );
  });

  it('should throw on missing profile field', async () => {
    const missingProfile = {
      projection: [],
      _hasHydrated: true,
    };
    const json = JSON.stringify(missingProfile);
    const file = createMockFile(json, 'test.json');

    await expect(importState(file)).rejects.toThrow('missing required fields');
  });

  it('should throw on missing projection field', async () => {
    const missingProjection = {
      profile: {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      },
      _hasHydrated: true,
    };
    const json = JSON.stringify(missingProjection);
    const file = createMockFile(json, 'test.json');

    await expect(importState(file)).rejects.toThrow('missing required fields');
  });

  it('should throw on missing _hasHydrated field', async () => {
    const missingHydrated = {
      profile: {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      },
      projection: [],
    };
    const json = JSON.stringify(missingHydrated);
    const file = createMockFile(json, 'test.json');

    await expect(importState(file)).rejects.toThrow('missing required fields');
  });

  it('should validate object structure', async () => {
    const validState = {
      profile: {
        age: 30,
        currentSavings: 100000,
        annualGrowthRate: 7,
        annualSpending: 40000,
      },
      projection: [
        {
          year: 0,
          age: 30,
          startingBalance: 100000,
          growth: 7000,
          spending: 40000,
          endingBalance: 67000,
        },
      ],
      _hasHydrated: true,
    };

    const json = JSON.stringify(validState);
    const file = createMockFile(json, 'test.json');

    const result = await importState(file);

    expect(result.profile).toBeDefined();
    expect(result.projection).toBeDefined();
    expect(result._hasHydrated).toBeDefined();
  });

  it('should handle FileReader errors', async () => {
    const file = createMockFile('test', 'test.json');

    // Create a mock FileReader that triggers an error
    class ErrorFileReader {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      result: string | null = null;
      error: Error | null = new Error('Read failed');

      readAsText(_file: File) {
        // Immediately trigger error
        Promise.resolve().then(() => {
          if (this.onerror) {
            this.onerror({
              target: this,
            } as unknown as ProgressEvent<FileReader>);
          }
        });
      }
    }

    // Temporarily replace FileReader with error version
    const originalFileReader = globalThis.FileReader;
    globalThis.FileReader = ErrorFileReader as unknown as typeof FileReader;

    try {
      await expect(importState(file)).rejects.toThrow('File read error');
    } finally {
      // Restore original FileReader
      globalThis.FileReader = originalFileReader;
    }
  });
});
