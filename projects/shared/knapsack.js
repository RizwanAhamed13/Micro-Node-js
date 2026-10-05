// #region Dynamic Programming
// 0/1 knapsack: pick items (each at most once) to maximise value within capacity.
export function knapsack(items, capacity) {
  const cap = Math.max(0, Math.floor(capacity));
  // dp[w] = best value with total weight <= w. Walk w downwards so each item is used once.
  const dp = new Array(cap + 1).fill(0);
  const took = items.map(() => new Uint8Array(cap + 1));

  items.forEach(({ weight, value }, i) => {
    for (let w = cap; w >= weight; w--) {
      if (dp[w - weight] + value > dp[w]) {
        dp[w] = dp[w - weight] + value;
        took[i][w] = 1;
      }
    }
  });

  // Walk back through the choices to list the items.
  const chosen = [];
  for (let i = items.length - 1, w = cap; i >= 0; i--) {
    if (took[i][w]) {
      chosen.push(items[i]);
      w -= items[i].weight;
    }
  }
  return { best: dp[cap], chosen: chosen.reverse() };
}
// #endregion
