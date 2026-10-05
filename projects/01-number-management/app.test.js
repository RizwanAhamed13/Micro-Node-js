import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createApp } from './app.js';
import { createTestServer } from './testserver.js';
import { listen } from '../shared/listen.js';

// #region Mock Upstreams
// A real mock server on a free port: one fast route, one too slow, one failing.
let mock;
beforeAll(async () => {
  const up = express();
  up.get('/primes', (req, res) => res.json({ numbers: [2, 3, 5, 7, 11, 13] }));
  up.get('/fibo', (req, res) => res.json({ numbers: [1, 1, 2, 3, 5, 8, 13, 21] }));
  up.get('/odd', (req, res) => res.json({ numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] }));
  up.get('/slow', (req, res) => setTimeout(() => res.json({ numbers: [999] }), 700));
  up.get('/down', (req, res) => res.status(503).send('service unavailable'));
  mock = await listen(up);
});
afterAll(() => mock.close());
// #endregion

describe('01 number management service', () => {
  const app = createApp();

  it('matches the expected output from the problem statement', async () => {
    const q = ['primes', 'fibo', 'odd'].map((p) => `url=${mock.url}/${p}`).join('&');
    const res = await request(app).get(`/numbers?${q}`);
    expect(res.body).toEqual({ numbers: [1, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 21, 23] });
  });

  it('ignores slow urls and still answers within 500 ms', async () => {
    const started = Date.now();
    const res = await request(app).get(`/numbers?url=${mock.url}/primes&url=${mock.url}/slow`);
    expect(Date.now() - started).toBeLessThan(500);
    expect(res.body.numbers).toEqual([2, 3, 5, 7, 11, 13]);
  });

  it('ignores failing and invalid urls', async () => {
    const res = await request(app).get(`/numbers?url=${mock.url}/down&url=not-a-url&url=${mock.url}/primes`);
    expect(res.body.numbers).toEqual([2, 3, 5, 7, 11, 13]);
  });

  it('returns an empty list when nothing usable came back', async () => {
    expect((await request(app).get('/numbers')).body).toEqual({ numbers: [] });
  });

  it('stays under 500 ms against the random test server', async () => {
    const ts = await listen(createTestServer());
    const q = ['primes', 'fibo', 'odd', 'rand'].map((p) => `url=${ts.url}/${p}`).join('&');
    for (let i = 0; i < 5; i++) {
      const started = Date.now();
      const res = await request(app).get(`/numbers?${q}`);
      expect(Date.now() - started).toBeLessThan(500);
      expect(res.status).toBe(200);
    }
    await ts.close();
  });
});
