import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createApp } from './app.js';
import { knapsack } from '../shared/knapsack.js';
import { mockAuth } from '../shared/mockAuth.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';

const depots = [{ ID: 1, MechanicHours: 10 }, { ID: 2, MechanicHours: 4 }];
const vehicles = [
  { TaskID: 't1', Duration: 5, Impact: 10 },
  { TaskID: 't2', Duration: 4, Impact: 40 },
  { TaskID: 't3', Duration: 6, Impact: 30 },
  { TaskID: 't4', Duration: 3, Impact: 50 },
];

let mock;
let app;
beforeAll(async () => {
  const up = express();
  const requireToken = mockAuth(up);
  up.get('/depots', requireToken, (req, res) => res.json({ depots }));
  up.get('/vehicles', requireToken, (req, res) => res.json({ vehicles }));
  mock = await listen(up);
  app = createApp({ api: createApiClient({ baseUrl: mock.url, credentials: {} }).api });
});
afterAll(() => mock.close());

// Brute force over every subset, to check the DP gives the true best.
function bruteForce(items, cap) {
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let w = 0, v = 0;
    items.forEach((it, i) => { if (mask & (1 << i)) { w += it.weight; v += it.value; } });
    if (w <= cap) best = Math.max(best, v);
  }
  return best;
}

describe('10 vehicle maintenance scheduler', () => {
  it('plans every depot with the best impact inside its hours', async () => {
    const res = await request(app).get('/schedule-maintenance');
    expect(res.body).toEqual([
      { depotID: 1, mechanicHours: 10, selectedTaskIDs: ['t2', 't4'], totalDuration: 7, totalImpact: 90 },
      { depotID: 2, mechanicHours: 4, selectedTaskIDs: ['t4'], totalDuration: 3, totalImpact: 50 }, // t4 beats t2
    ]);
  });

  it('plans one depot, 404 for an unknown one', async () => {
    expect((await request(app).get('/schedule-maintenance?depotId=2')).body.totalImpact).toBe(50);
    expect((await request(app).get('/schedule-maintenance?depotId=9')).status).toBe(404);
  });

  it('knapsack matches brute force on random inputs', () => {
    for (let round = 0; round < 200; round++) {
      const items = Array.from({ length: 1 + (round % 10) }, (_, i) => ({
        id: i, weight: 1 + ((round * 7 + i * 13) % 9), value: (round * 11 + i * 17) % 50,
      }));
      const cap = round % 25;
      const { best, chosen } = knapsack(items, cap);
      expect(best).toBe(bruteForce(items, cap));
      expect(chosen.reduce((s, x) => s + x.weight, 0)).toBeLessThanOrEqual(cap);
      expect(chosen.reduce((s, x) => s + x.value, 0)).toBe(best);
    }
  });
});
