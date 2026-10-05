import express from 'express';
import { createCache } from '../shared/cache.js';
import { upcomingTrains } from './schedule.js';

// #region Train Schedule Service
// The railway server charges per call: cache its answers briefly.
export function createApp({ api, now = Date.now, ttlMs = 60_000 }) {
  const app = express();
  const { cached } = createCache({ now });

  app.get('/trains', async (req, res) => {
    try {
      const trains = await cached('trains', ttlMs, () => api('/trains'));
      res.json(upcomingTrains(trains, now()));
    } catch {
      res.status(502).json({ error: 'railway server unavailable' });
    }
  });

  app.get('/trains/:trainNumber', async (req, res) => {
    try {
      const train = await cached(`train:${req.params.trainNumber}`, ttlMs, () => api(`/trains/${req.params.trainNumber}`));
      res.json(train);
    } catch (err) {
      res.status(String(err.message).endsWith('404') ? 404 : 502).json({ error: 'train not found' });
    }
  });

  return app;
}
// #endregion
