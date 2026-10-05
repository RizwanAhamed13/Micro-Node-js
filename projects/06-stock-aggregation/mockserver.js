// Mock of the stock test server.
import express from 'express';
import { mockAuth } from '../shared/mockAuth.js';

export const STOCKS = { 'Nvidia Corporation': 'NVDA', 'PayPal Holdings, Inc.': 'PYPL', 'Apple Inc.': 'AAPL' };

export function createMockServer({ histories, now = Date.now }) {
  const app = express();
  const requireToken = mockAuth(app);

  app.get('/stocks', requireToken, (req, res) => res.json({ stocks: STOCKS }));

  app.get('/stocks/:ticker', requireToken, (req, res) => {
    const history = histories[req.params.ticker];
    if (!history) return res.status(404).json({ error: 'unknown ticker' });
    const minutes = Number(req.query.minutes);
    if (!minutes) return res.json({ stock: history.at(-1) });
    const from = now() - minutes * 60_000;
    res.json(history.filter((p) => Date.parse(p.lastUpdatedAt) >= from));
  });

  return app;
}
