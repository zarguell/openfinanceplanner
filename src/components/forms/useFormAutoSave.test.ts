import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormAutoSave } from './useFormAutoSave';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useFormAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('saves form data to localStorage after debounce delay', () => {
    const form = {
      values: { name: 'test', age: 30 },
      setValues: vi.fn(),
    };

    renderHook(() =>
      useFormAutoSave(form as any, 'test-form', {
        debounceMs: 1000,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const saved = mockLocalStorage.getItem('test-form');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.name).toBe('test');
    expect(parsed.age).toBe(30);
  });

  it('returns isDirty state', () => {
    const form = {
      values: { name: 'test', age: 30 },
      setValues: vi.fn(),
    };

    const { result } = renderHook(() =>
      useFormAutoSave(form as any, 'test-form', {
        debounceMs: 1000,
      })
    );

    expect(result.current.isDirty).toBe(false);
  });

  it('clears localStorage', () => {
    const form = {
      values: { name: 'test', age: 30 },
      setValues: vi.fn(),
    };

    const { result } = renderHook(() =>
      useFormAutoSave(form as any, 'test-form', {
        debounceMs: 1000,
      })
    );

    result.current.clear();

    const saved = mockLocalStorage.getItem('test-form');
    expect(saved).toBeNull();
  });
});
