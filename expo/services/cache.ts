interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 60_000;

export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  store.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
  console.log('[Cache] SET', key, 'TTL:', ttlMs / 1000, 's');
}

export function getCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    console.log('[Cache] EXPIRED', key);
    return null;
  }
  console.log('[Cache] HIT', key);
  return entry.data;
}

export function clearCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    console.log('[Cache] CLEARED ALL');
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
  console.log('[Cache] CLEARED prefix:', prefix);
}

export function getCacheKeys(): string[] {
  return Array.from(store.keys());
}
