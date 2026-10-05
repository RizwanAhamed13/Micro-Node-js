// #region Math in Code
export const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

// Pearson correlation: +1 move together, -1 move opposite, 0 unrelated.
export function correlation(xs, ys) {
  if (xs.length < 2 || xs.length !== ys.length) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < xs.length; i++) {
    cov += (xs[i] - mx) * (ys[i] - my);
    vx += (xs[i] - mx) ** 2;
    vy += (ys[i] - my) ** 2;
  }
  return vx && vy ? cov / Math.sqrt(vx * vy) : 0;
}

// Pair two price histories by nearest timestamp (within maxGapMs).
export function pairByTime(a, b, maxGapMs = 60_000) {
  if (!b.length) return [];
  const bt = b.map((q) => [Date.parse(q.lastUpdatedAt), q.price]);
  const pairs = [];
  for (const p of a) {
    const t = Date.parse(p.lastUpdatedAt);
    let best = bt[0];
    for (const q of bt) if (Math.abs(q[0] - t) < Math.abs(best[0] - t)) best = q;
    if (Math.abs(best[0] - t) <= maxGapMs) pairs.push([p.price, best[1]]);
  }
  return pairs;
}
// #endregion
