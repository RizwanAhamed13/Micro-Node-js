// #region Cache with TTL
export function createCache({ now = Date.now } = {}) {
  const store = new Map();

  // Return the cached value, or load it, keep it for ttlMs and return it.
  async function cached(key, ttlMs, load) {
    const hit = store.get(key);
    if (hit && hit.expiresAt > now()) return hit.value;
    const value = await load();
    store.set(key, { value, expiresAt: now() + ttlMs });
    return value;
  }

  return { cached, clear: () => store.clear(), size: () => store.size };
}
// #endregion
