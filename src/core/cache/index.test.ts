import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache, createMemoizedFunction } from './index';

describe('createCache', () => {
  it('should store and retrieve values', () => {
    const cache = createCache<string, number>();
    cache.set('key1', 42);
    expect(cache.get('key1')).toBe(42);
  });

  it('should return undefined for non-existent keys', () => {
    const cache = createCache<string, number>();
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should check if key exists', () => {
    const cache = createCache<string, number>();
    cache.set('key1', 42);
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should delete keys', () => {
    const cache = createCache<string, number>();
    cache.set('key1', 42);
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should clear all keys', () => {
    const cache = createCache<string, number>();
    cache.set('key1', 42);
    cache.set('key2', 100);
    cache.clear();
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
  });

  it('should track cache size', () => {
    const cache = createCache<string, number>();
    expect(cache.size).toBe(0);
    cache.set('key1', 42);
    expect(cache.size).toBe(1);
    cache.set('key2', 100);
    expect(cache.size).toBe(2);
    cache.delete('key1');
    expect(cache.size).toBe(1);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('should handle object keys', () => {
    const cache = createCache<{ id: string }, number>();
    const key1 = { id: '1' };
    const key2 = { id: '1' };
    cache.set(key1, 42);
    expect(cache.get(key1)).toBe(42);
    expect(cache.get(key2)).toBeUndefined();
  });

  it('should get all keys', () => {
    const cache = createCache<string, number>();
    cache.set('key1', 42);
    cache.set('key2', 100);
    const keys = cache.keys();
    expect(keys).toHaveLength(2);
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  it('should get all values', () => {
    const cache = createCache<string, number>();
    cache.set('key1', 42);
    cache.set('key2', 100);
    const values = cache.values();
    expect(values).toHaveLength(2);
    expect(values).toContain(42);
    expect(values).toContain(100);
  });
});

describe('createCache - with maxSize', () => {
  it('should evict oldest entries when max size exceeded', () => {
    const cache = createCache<string, number>({ maxSize: 2 });
    cache.set('key1', 1);
    cache.set('key2', 2);
    expect(cache.size).toBe(2);

    cache.set('key3', 3);
    expect(cache.size).toBe(2);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);
    expect(cache.get('key3')).toBe(3);
  });

  it('should update existing key without affecting eviction order', () => {
    const cache = createCache<string, number>({ maxSize: 2 });
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.set('key1', 10);
    expect(cache.size).toBe(2);

    cache.set('key3', 3);
    expect(cache.get('key1')).toBe(10);
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.get('key3')).toBe(3);
  });

  it('should handle maxSize of 1', () => {
    const cache = createCache<string, number>({ maxSize: 1 });
    cache.set('key1', 1);
    cache.set('key2', 2);
    expect(cache.size).toBe(1);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);
  });
});

describe('createCache - with TTL', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should expire entries after TTL', () => {
    const cache = createCache<string, number>({ ttl: 1000 });
    cache.set('key1', 42);
    expect(cache.get('key1')).toBe(42);

    vi.advanceTimersByTime(1001);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should not expire entries before TTL', () => {
    const cache = createCache<string, number>({ ttl: 1000 });
    cache.set('key1', 42);

    vi.advanceTimersByTime(500);
    expect(cache.get('key1')).toBe(42);
  });

  it('should handle multiple entries with different expiration times', () => {
    const cache = createCache<string, number>({ ttl: 1000 });
    cache.set('key1', 1);
    vi.advanceTimersByTime(500);
    cache.set('key2', 2);

    vi.advanceTimersByTime(500);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);

    vi.advanceTimersByTime(501);
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should reset TTL on key update', () => {
    const cache = createCache<string, number>({ ttl: 1000 });
    cache.set('key1', 42);
    vi.advanceTimersByTime(500);
    cache.set('key1', 100);
    vi.advanceTimersByTime(600);
    expect(cache.get('key1')).toBe(100);
    vi.advanceTimersByTime(401);
    expect(cache.get('key1')).toBeUndefined();
  });
});

describe('createCache - with maxSize and TTL', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle both maxSize and TTL together', () => {
    const cache = createCache<string, number>({ maxSize: 2, ttl: 1000 });
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.set('key3', 3);

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);
    expect(cache.get('key3')).toBe(3);

    vi.advanceTimersByTime(1001);
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.get('key3')).toBeUndefined();
  });
});

describe('createMemoizedFunction', () => {
  it('should cache function results based on arguments', () => {
    const expensiveFn = vi.fn((x) => (x as number) * 2);
    const memoized = createMemoizedFunction(expensiveFn);

    expect(memoized(5)).toBe(10);
    expect(expensiveFn).toHaveBeenCalledTimes(1);

    expect(memoized(5)).toBe(10);
    expect(expensiveFn).toHaveBeenCalledTimes(1);
  });

  it('should cache different arguments separately', () => {
    const expensiveFn = vi.fn((x) => (x as number) * 2);
    const memoized = createMemoizedFunction(expensiveFn);

    memoized(5);
    memoized(10);
    expect(expensiveFn).toHaveBeenCalledTimes(2);

    memoized(5);
    memoized(10);
    expect(expensiveFn).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple arguments', () => {
    const expensiveFn = vi.fn((a, b) => (a as number) + (b as number));
    const memoized = createMemoizedFunction(expensiveFn);

    memoized(1, 2);
    memoized(1, 3);
    expect(expensiveFn).toHaveBeenCalledTimes(2);

    memoized(1, 2);
    memoized(1, 3);
    expect(expensiveFn).toHaveBeenCalledTimes(2);
  });

  it('should respect maxSize limit', () => {
    const expensiveFn = vi.fn((x) => (x as number) * 2);
    const memoized = createMemoizedFunction(expensiveFn, { maxSize: 2 });

    memoized(1);
    memoized(2);
    memoized(3);
    expect(expensiveFn).toHaveBeenCalledTimes(3);

    memoized(1);
    expect(expensiveFn).toHaveBeenCalledTimes(4);
  });

  it('should respect TTL for cache entries', () => {
    vi.useFakeTimers();
    const expensiveFn = vi.fn((x) => (x as number) * 2);
    const memoized = createMemoizedFunction(expensiveFn, { ttl: 1000 });

    memoized(5);
    expect(expensiveFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    memoized(5);
    expect(expensiveFn).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it('should provide clear method to reset cache', () => {
    const expensiveFn = vi.fn((x) => (x as number) * 2);
    const memoized = createMemoizedFunction(expensiveFn);

    memoized(5);
    memoized(10);
    expect(expensiveFn).toHaveBeenCalledTimes(2);

    memoized.clear();
    memoized(5);
    memoized(10);
    expect(expensiveFn).toHaveBeenCalledTimes(4);
  });

  it('should get cache size', () => {
    const expensiveFn: (...args: unknown[]) => number = (x) =>
      (x as number) * 2;
    const memoized = createMemoizedFunction(expensiveFn);

    expect(memoized.size).toBe(0);
    memoized(5);
    expect(memoized.size).toBe(1);
    memoized(10);
    expect(memoized.size).toBe(2);
  });
});
