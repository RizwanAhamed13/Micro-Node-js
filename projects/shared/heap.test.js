import { describe, it, expect } from 'vitest';
import { MinHeap, topN } from './heap.js';
import { createCache } from './cache.js';
import { fromAll } from './fanout.js';
import { sortBy, inPriceRange } from './sort.js';

describe('shared helpers', () => {
  it('MinHeap pops in order', () => {
    const h = new MinHeap((a, b) => a < b);
    [5, 1, 4, 2, 3, 0].forEach((x) => h.push(x));
    const out = [];
    while (h.size) out.push(h.pop());
    expect(out).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('topN keeps the n biggest, biggest first', () => {
    expect(topN([3, 9, 1, 7, 5], 3, (a, b) => a < b)).toEqual([9, 7, 5]);
  });

  it('cache reuses values until the TTL passes', async () => {
    let t = 0;
    let loads = 0;
    const { cached } = createCache({ now: () => t });
    const load = async () => ++loads;
    expect(await cached('k', 100, load)).toBe(1);
    expect(await cached('k', 100, load)).toBe(1);
    t = 101;
    expect(await cached('k', 100, load)).toBe(2);
  });

  it('fromAll tags results and survives a failing source', async () => {
    const out = await fromAll(['A', 'B'], async (s) => {
      if (s === 'B') throw new Error('down');
      return [{ x: 1 }];
    });
    expect(out).toEqual([{ x: 1, source: 'A' }]);
  });

  it('sortBy and inPriceRange', () => {
    const list = [{ price: 3 }, { price: 1 }, { price: 2 }];
    expect(sortBy(list, 'price', 'desc').map((p) => p.price)).toEqual([3, 2, 1]);
    expect(sortBy(list, 'colour')).toBe(list);
    expect(inPriceRange(list, 2, 3).map((p) => p.price)).toEqual([3, 2]);
  });
});
