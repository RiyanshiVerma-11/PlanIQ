/**
 * Unit tests for FastLRUCache
 * Validates O(1) recency eviction, TTL expiration, cache hits/misses, and statistics.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FastLRUCache } from '../server/cache/lruCache.ts';

describe('FastLRUCache Engine', () => {
  it('stores and retrieves items correctly', () => {
    const cache = new FastLRUCache<string>(3, 5000);
    cache.set('k1', 'val1');
    cache.set('k2', 'val2');

    assert.equal(cache.get('k1'), 'val1');
    assert.equal(cache.get('k2'), 'val2');
    assert.equal(cache.get('k3'), null);
    assert.equal(cache.size(), 2);
  });

  it('evicts least recently used item when capacity is exceeded', () => {
    const cache = new FastLRUCache<number>(3, 5000);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    // Access 'a' so 'b' becomes the least recently used
    cache.get('a');

    // Add 'd' -> 'b' should be evicted
    cache.set('d', 4);

    assert.equal(cache.get('b'), null, 'key "b" should have been evicted');
    assert.equal(cache.get('a'), 1, 'key "a" should be retained');
    assert.equal(cache.get('c'), 3, 'key "c" should be retained');
    assert.equal(cache.get('d'), 4, 'key "d" should be present');
    assert.equal(cache.size(), 3);
  });

  it('expires entries after TTL elapsed', async () => {
    const cache = new FastLRUCache<string>(5, 30); // 30ms TTL
    cache.set('quick', 'expireMe', 30);

    assert.equal(cache.get('quick'), 'expireMe');

    await new Promise((resolve) => setTimeout(resolve, 45));

    assert.equal(cache.get('quick'), null, 'entry should have expired');
    assert.equal(cache.size(), 0);
  });

  it('tracks cache statistics (hits, misses, evictions) accurately', () => {
    const cache = new FastLRUCache<string>(2, 5000);
    cache.set('x', '1');
    cache.set('y', '2');

    cache.get('x'); // hit 1
    cache.get('y'); // hit 2
    cache.get('z'); // miss 1

    cache.set('w', '3'); // causes eviction of 'x'

    const stats = cache.getStats();
    assert.equal(stats.hits, 2);
    assert.equal(stats.misses, 1);
    assert.equal(stats.evictions, 1);
    assert.equal(stats.size, 2);
    assert.equal(stats.maxEntries, 2);
  });

  it('clears cache and resets telemetry', () => {
    const cache = new FastLRUCache<string>(10, 5000);
    cache.set('k', 'v');
    cache.get('k');
    assert.equal(cache.size(), 1);

    cache.clear();
    assert.equal(cache.size(), 0);
    assert.equal(cache.get('k'), null);

    const stats = cache.getStats();
    assert.equal(stats.hits, 0);
    assert.equal(stats.misses, 1);
    assert.equal(stats.evictions, 0);
  });
});
