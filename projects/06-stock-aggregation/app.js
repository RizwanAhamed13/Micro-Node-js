import express from 'express';
import { createCache } from '../shared/cache.js';
import { mean, correlation, pairByTime } from '../shared/stats.js';

// #region Stock Price Aggregation
export function createApp({ api, ttlMs = 30_000 }) {
  const app = express();
  const { cached } = createCache();

  const history = (ticker, minutes) =>
    cached(`${ticker}:${minutes}`, ttlMs, () => api(`/stocks/${ticker}?minutes=${minutes}`));
  const minutesOf = (q) => Math.max(1, Number(q.minutes) || 60);

  app.get('/stocks/:ticker', async (req, res, next) => {
    try {
      const priceHistory = await history(req.params.ticker, minutesOf(req.query));
      res.json({ averageStockPrice: mean(priceHistory.map((p) => p.price)), priceHistory });
    } catch (err) {
      res.status(String(err.message).endsWith('404') ? 404 : 502).json({ error: err.message });
    }
  });

  app.get('/stockcorrelation', async (req, res) => {
    const tickers = [].concat(req.query.ticker ?? []);
    if (tickers.length !== 2) return res.status(400).json({ error: 'pass exactly 2 tickers' });
    const minutes = minutesOf(req.query);
    try {
      const [a, b] = await Promise.all(tickers.map((t) => history(t, minutes)));
      const pairs = pairByTime(a, b);
      res.json({
        correlation: Number(correlation(pairs.map((p) => p[0]), pairs.map((p) => p[1])).toFixed(4)),
        stocks: {
          [tickers[0]]: { averagePrice: mean(a.map((p) => p.price)), priceHistory: a },
          [tickers[1]]: { averagePrice: mean(b.map((p) => p.price)), priceHistory: b },
        },
      });
    } catch (err) {
      res.status(String(err.message).endsWith('404') ? 404 : 502).json({ error: err.message });
    }
  });

  return app;
}
// #endregion
