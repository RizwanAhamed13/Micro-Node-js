import express from 'express';
import { isValidUrl } from '../shared/http.js';

// #region Number Management Service
export function createApp({ timeoutMs = 400 } = {}) {
  const app = express();

  app.get('/numbers', async (req, res) => {
    const urls = [].concat(req.query.url ?? []).filter(isValidUrl);
    const deadline = AbortSignal.timeout(timeoutMs); // one deadline for all calls, under 500 ms

    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const r = await fetch(url, { signal: deadline });
        if (!r.ok) throw new Error(`${url} -> ${r.status}`);
        return r.json();
      }),
    );

    const merged = new Set();
    for (const r of results) {
      if (r.status !== 'fulfilled') continue; // slow, failed or bad JSON: ignore
      for (const n of r.value?.numbers ?? []) if (Number.isInteger(n)) merged.add(n);
    }
    res.json({ numbers: [...merged].sort((a, b) => a - b) });
  });

  return app;
}
// #endregion
