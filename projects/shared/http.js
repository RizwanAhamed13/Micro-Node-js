// #region Call Other APIs
export async function getJson(url, ms = 500, init = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

// Call every URL in parallel, keep only the ones that answered in time.
export async function getAll(urls, ms = 500) {
  const results = await Promise.allSettled(urls.map((u) => getJson(u, ms)));
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

export function isValidUrl(s) {
  try {
    return ['http:', 'https:'].includes(new URL(s).protocol);
  } catch {
    return false;
  }
}
// #endregion
