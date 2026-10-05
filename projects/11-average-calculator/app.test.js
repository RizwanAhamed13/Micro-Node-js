import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createApp } from './app.js';
import { mockAuth } from '../shared/mockAuth.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';

let mock;
let api;
let slow = false;
beforeAll(async () => {
  const up = express();
  const requireToken = mockAuth(up);
  up.get('/even', requireToken, (req, res) => res.json({ numbers: [2, 4, 6, 8] }));
  up.get('/primes', requireToken, (req, res) => res.json({ numbers: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29] }));
  up.get('/fibo', requireToken, (req, res) =>
    setTimeout(() => res.json({ numbers: [55, 89] }), slow ? 700 : 0));
  up.get('/rand', requireToken, (req, res) => res.status(500).end());
  mock = await listen(up);
  api = createApiClient({ baseUrl: mock.url, credentials: {} }).api;
  await api('/even'); // warm up the token
});
afterAll(() => mock.close());

describe('11 average calculator', () => {
  it('first call: empty previous window, average of what arrived', async () => {
    const app = createApp({ api });
    const res = await request(app).get('/numbers/e');
    expect(res.body).toEqual({ windowPrevState: [], windowCurrState: [2, 4, 6, 8], numbers: [2, 4, 6, 8], avg: 5 });
  });

  it('keeps numbers unique and drops the oldest past the window size', async () => {
    const app = createApp({ api });
    await request(app).get('/numbers/e'); // [2,4,6,8]
    const res = await request(app).get('/numbers/p'); // 2 is a duplicate
    expect(res.body.windowPrevState).toEqual([2, 4, 6, 8]);
    expect(res.body.windowCurrState).toEqual([6, 8, 3, 5, 7, 11, 13, 17, 19, 23, 29].slice(-10));
    expect(res.body.windowCurrState).toHaveLength(10);
    expect(res.body.avg).toBe(13.5); // (8+3+5+7+11+13+17+19+23+29) / 10
  });

  it('ignores slow and failing responses, window unchanged, still under 500 ms', async () => {
    const app = createApp({ api });
    await request(app).get('/numbers/e');
    slow = true;
    const started = Date.now();
    const res = await request(app).get('/numbers/f');
    expect(Date.now() - started).toBeLessThan(500);
    expect(res.body).toMatchObject({ windowPrevState: [2, 4, 6, 8], windowCurrState: [2, 4, 6, 8], numbers: [] });
    slow = false;
    expect((await request(app).get('/numbers/r')).body.numbers).toEqual([]);
  });

  it('400 for an unknown numberid', async () => {
    expect((await request(createApp({ api })).get('/numbers/x')).status).toBe(400);
  });
});
