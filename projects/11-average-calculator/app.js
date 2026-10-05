import express from 'express';

// numberid -> test-server path
export const SOURCES = { p: 'primes', f: 'fibo', e: 'even', r: 'rand' };

// #region Average Calculator Microservice
export function createApp({ api, windowSize = 10, timeoutMs = 450 }) {
  const app = express();
  let windowNums = []; // unique numbers, oldest first

  app.get('/numbers/:numberid', async (req, res) => {
    const source = SOURCES[req.params.numberid];
    if (!source) return res.status(400).json({ error: 'numberid must be p, f, e or r' });

    const windowPrevState = [...windowNums];
    let numbers = [];
    try {
      // ignore anything slower than the deadline, or failing
      const body = await Promise.race([
        api(`/${source}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ]);
      numbers = (body?.numbers ?? []).filter(Number.isInteger);
    } catch {
      numbers = [];
    }

    for (const n of numbers) {
      if (windowNums.includes(n)) continue; // unique only
      windowNums.push(n);
      if (windowNums.length > windowSize) windowNums.shift(); // replace the oldest
    }

    const avg = windowNums.length ? windowNums.reduce((s, n) => s + n, 0) / windowNums.length : 0;
    res.json({
      windowPrevState,
      windowCurrState: [...windowNums],
      numbers,
      avg: Number(avg.toFixed(2)),
    });
  });

  return app;
}
// #endregion
