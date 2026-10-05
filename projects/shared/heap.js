// #region Priority Queue
// less(a, b) === true means a belongs nearer the top than b.
export class MinHeap {
  constructor(less) {
    this.a = [];
    this.less = less;
  }

  get size() {
    return this.a.length;
  }

  peek() {
    return this.a[0];
  }

  push(x) {
    const a = this.a;
    a.push(x);
    for (let i = a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }

  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

// Keep the n "biggest" items using a heap of size n: O(N log n).
export function topN(items, n, less) {
  const heap = new MinHeap(less);
  for (const x of items) {
    heap.push(x);
    if (heap.size > n) heap.pop();
  }
  const out = [];
  while (heap.size) out.push(heap.pop());
  return out.reverse();
}
// #endregion
