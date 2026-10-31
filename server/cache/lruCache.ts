/**
 * High-Performance In-Memory LRU Cache with TTL (Time-To-Live) and Eviction Telemetry.
 * Provides O(1) average lookup, insertion, and cache eviction.
 */

export interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
}

export interface CacheStats {
  readonly size: number;
  readonly maxEntries: number;
  readonly hits: number;
  readonly misses: number;
  readonly evictions: number;
}

export class FastLRUCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  private readonly defaultTTLMs: number;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxEntries = 150, defaultTTLMs = 1000 * 60 * 30) {
    if (maxEntries <= 0) {
      throw new Error('FastLRUCache maxEntries must be greater than 0');
    }
    this.maxEntries = maxEntries;
    this.defaultTTLMs = defaultTTLMs;
  }

  /**
   * Retrieves an item from the cache. Updates recency on hit.
   * Returns null if key is not found or expired.
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses += 1;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses += 1;
      return null;
    }

    // Refresh position to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits += 1;
    return entry.data;
  }

  /**
   * Stores an item with a given TTL. Evicts the least recently used item if max capacity is exceeded.
   */
  set(key: string, data: T, ttlMs = this.defaultTTLMs): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        this.evictions += 1;
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + Math.max(0, ttlMs),
    });
  }

  /**
   * Removes a specific key from the cache.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clears all cached entries and resets statistics.
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Current number of entries in the cache.
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Performance diagnostics and cache hit ratio.
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
    };
  }
}
