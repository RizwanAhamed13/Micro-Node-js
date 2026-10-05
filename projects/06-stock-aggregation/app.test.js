import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { createMockServer } from './mockserver.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';
import { correlation, pairByTime } from '../shared/stats.js';

const NOW = Date.parse('2026-05-08T05:00:00Z');
const at = (minAgo, sec = 0) => new Date(NOW - minAgo * 60_000 + sec * 1000).toISOString();

// NVDA rises, PYPL rises with it (a few seconds later), AAPL falls.
const histories = {
  NVDA: [10, 20, 30, 40].map((price, i) => ({ price, lastUpdatedAt: at(40 - i * 10) })),
  PYPL: [100, 210, 290, 410].map((price, i) => ({ price, lastUpdatedAt: at(40 - i * 10, 5) })),
  AAPL: [50, 40, 30, 20].map((price, i) => ({ price, lastUpdatedAt: at(40 - i * 10, 2) })),
};

let mock;
let app;
let calls = 0;
beforeAll(async () => {
  mock = await listen(createMockServer({ histories, now: () => NOW }));
  const { api } = createApiClient({ baseUrl: mock.url, credentials: {} });
  app = createApp({ api: (p) => { calls++; return api(p); } });
});
afterAll(() => mock.close());

describe('06 stock price aggregation', () => {
  it('averages the last m minutes', async () => {
    const res = await request(app).get('/stocks/NVDA?minutes=50&aggregation=average');
    expect(res.body.averageStockPrice).toBe(25);
    expect(res.body.priceHistory).toHaveLength(4);

    const recent = await request(app).get('/stocks/NVDA?minutes=15&aggregation=average');
    expect(recent.body.averageStockPrice).toBe(40);
  });

  it('correlates two stocks after pairing by timestamp', async () => {
    const up = await request(app).get('/stockcorrelation?minutes=50&ticker=NVDA&ticker=PYPL');
    expect(up.body.correlation).toBeGreaterThan(0.99);
    expect(up.body.stocks.NVDA.averagePrice).toBe(25);
    expect(up.body.stocks.PYPL.averagePrice).toBe(252.5);

    const down = await request(app).get('/stockcorrelation?minutes=50&ticker=NVDA&ticker=AAPL');
    expect(down.body.correlation).toBe(-1);
  });

  it('needs exactly 2 tickers', async () => {
    expect((await request(app).get('/stockcorrelation?minutes=50&ticker=NVDA')).status).toBe(400);
  });

  it('404 for an unknown ticker', async () => {
    expect((await request(app).get('/stocks/ZZZZ?minutes=10')).status).toBe(404);
  });

  it('reuses cached history instead of calling the upstream again', async () => {
    await request(app).get('/stocks/AAPL?minutes=30');
    const before = calls;
    await request(app).get('/stocks/AAPL?minutes=30');
    expect(calls).toBe(before);
  });

  it('math helpers', () => {
    expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
    expect(correlation([1, 1, 1], [1, 2, 3])).toBe(0);
    expect(pairByTime(histories.NVDA, histories.PYPL)).toEqual([[10, 100], [20, 210], [30, 290], [40, 410]]);
  });
});
