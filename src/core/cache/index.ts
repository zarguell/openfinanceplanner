export interface CacheOptions {
  maxSize?: number;
  ttl?: number;
}

interface CacheEntry<V> {
  value: V;
  timestamp: number;
  accessOrder: number;
  insertionOrder: number;
}

export function createCache<K, V>(
  options: CacheOptions = {}
): {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): void;
  clear(): void;
  get size(): number;
  keys(): K[];
  values(): V[];
  getEntries(): ReadonlyArray<{
    key: K;
    accessOrder: number;
    insertionOrder: number;
  }>;
} {
  const { maxSize = Infinity, ttl = Infinity } = options;

  const cache = new Map<K, CacheEntry<V>>();
  let accessCounter = 0;
  let insertionCounter = 0;

  function evictIfNeeded(): void {
    if (cache.size >= maxSize) {
      const expiredKeys: K[] = [];
      let oldestKey: K | undefined;
      let oldestAccessOrder = Infinity;

      for (const [key, entry] of cache.entries()) {
        if (isExpired(entry)) {
          expiredKeys.push(key);
          continue;
        }
        if (entry.accessOrder < oldestAccessOrder) {
          oldestAccessOrder = entry.accessOrder;
          oldestKey = key;
        }
      }

      for (const key of expiredKeys) {
        cache.delete(key);
      }

      if (oldestKey !== undefined && cache.size >= maxSize) {
        cache.delete(oldestKey);
      }
    }
  }

  function isExpired(entry: CacheEntry<V>): boolean {
    return Date.now() - entry.timestamp >= ttl;
  }

  return {
    get(key: K): V | undefined {
      const entry = cache.get(key);
      if (entry === undefined) {
        return undefined;
      }

      if (isExpired(entry)) {
        cache.delete(key);
        return undefined;
      }

      entry.accessOrder = ++accessCounter;
      return entry.value;
    },

    set(key: K, value: V): void {
      const now = Date.now();
      const existingEntry = cache.get(key);

      if (existingEntry !== undefined) {
        existingEntry.value = value;
        existingEntry.timestamp = now;
        existingEntry.accessOrder = ++accessCounter;
      } else {
        evictIfNeeded();
        cache.set(key, {
          value,
          timestamp: now,
          accessOrder: ++accessCounter,
          insertionOrder: ++insertionCounter,
        });
      }
    },

    has(key: K): boolean {
      const entry = cache.get(key);
      if (entry === undefined) {
        return false;
      }

      if (isExpired(entry)) {
        cache.delete(key);
        return false;
      }

      return true;
    },

    delete(key: K): void {
      cache.delete(key);
    },

    clear(): void {
      cache.clear();
      accessCounter = 0;
      insertionCounter = 0;
    },

    get size(): number {
      return cache.size;
    },

    keys(): K[] {
      return Array.from(cache.keys());
    },

    values(): V[] {
      return Array.from(cache.values()).map((entry) => entry.value);
    },

    getEntries(): ReadonlyArray<{
      key: K;
      accessOrder: number;
      insertionOrder: number;
    }> {
      const entries: Array<{
        key: K;
        accessOrder: number;
        insertionOrder: number;
      }> = [];
      for (const [key, entry] of cache.entries()) {
        entries.push({
          key,
          accessOrder: entry.accessOrder,
          insertionOrder: entry.insertionOrder,
        });
      }
      return entries;
    },
  };
}

export interface MemoizeOptions {
  maxSize?: number;
  ttl?: number;
  keyGenerator?: (...args: unknown[]) => string;
}

export function createMemoizedFunction<
  T extends (...args: unknown[]) => unknown,
>(
  fn: T,
  options: MemoizeOptions = {}
): T & {
  clear: () => void;
  get size(): number;
} {
  const { maxSize, ttl, keyGenerator } = options;

  const generateKey = (...args: unknown[]): string => {
    if (keyGenerator !== undefined) {
      return keyGenerator(...args);
    }
    return JSON.stringify(args);
  };

  const cache = createCache<string, ReturnType<T>>({ maxSize, ttl });

  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = generateKey(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached as ReturnType<T>;
    }

    const result = fn(...args);
    cache.set(key, result as ReturnType<T>);
    return result as ReturnType<T>;
  }) as T & {
    clear: () => void;
    get size(): number;
  };

  memoized.clear = () => cache.clear();
  Object.defineProperty(memoized, 'size', {
    get: () => cache.size,
  });

  return memoized;
}
