import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createApp } from './app.js';
import { mockAuth } from '../shared/mockAuth.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';

// "now" is 10:00 local time today
const NOW = new Date(); NOW.setHours(10, 0, 0, 0);
const t = (name, h, m, delayedBy, sleeper, ac, seatsS, seatsA) => ({
  trainName: name, trainNumber: name.length * 1000 + h,
  departureTime: { Hours: h, Minutes: m, Seconds: 0 },
  seatsAvailable: { sleeper: seatsS, AC: seatsA }, price: { sleeper, AC: ac }, delayedBy,
});
const trains = [
  t('Chennai Exp', 10, 20, 0, 500, 1500, 10, 5), // leaves in 20 min: skipped
  t('Hyderabad Exp', 10, 20, 15, 400, 1200, 10, 5), // delayed to 10:35: included
  t('Delhi Door', 23, 0, 0, 300, 900, 1, 1), // 13 h away: skipped
  t('Mumbai Mail', 14, 0, 0, 400, 1200, 50, 20), // same price as Hyderabad, more seats
  t('Pune Fast', 12, 0, 0, 250, 800, 5, 5),
  t('Goa Line', 18, 0, 0, 400, 1200, 10, 5), // ties Hyderabad on price+seats, later departure
];

let mock;
let calls = 0;
let app;
beforeAll(async () => {
  const up = express();
  const requireToken = mockAuth(up);
  up.get('/trains', requireToken, (req, res) => { calls++; res.json(trains); });
  up.get('/trains/:n', requireToken, (req, res) => {
    const train = trains.find((x) => String(x.trainNumber) === req.params.n);
    return train ? res.json(train) : res.status(404).end();
  });
  mock = await listen(up);
  app = createApp({ api: createApiClient({ baseUrl: mock.url, credentials: {} }).api, now: () => NOW.getTime() });
});
afterAll(() => mock.close());

describe('13 train schedule', () => {
  it('next 12 h, skip the next 30 min, delays applied, sorted', async () => {
    const res = await request(app).get('/trains');
    expect(res.body.map((x) => x.trainName)).toEqual(['Pune Fast', 'Mumbai Mail', 'Goa Line', 'Hyderabad Exp']);
  });

  it('caches the railway server between requests', async () => {
    const before = calls;
    await request(app).get('/trains');
    expect(calls).toBe(before);
  });

  it('one train, 404 for unknown', async () => {
    expect((await request(app).get(`/trains/${trains[3].trainNumber}`)).body.trainName).toBe('Mumbai Mail');
    expect((await request(app).get('/trains/1')).status).toBe(404);
  });
});
