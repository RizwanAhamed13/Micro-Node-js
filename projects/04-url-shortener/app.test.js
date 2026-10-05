import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

let clock = Date.parse('2026-01-01T00:00:00Z');
const now = () => clock;

// #region API Tests
describe('04 URL shortener', () => {
  const app = createApp({ now });

  it('creates a link with a 30 minute default validity', async () => {
    const res = await request(app).post('/shorturls').send({ url: 'https://example.com/a/long/path' });
    expect(res.status).toBe(201);
    expect(res.body.shortLink).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/[a-zA-Z0-9]{6}$/);
    expect(res.body.expiry).toBe('2026-01-01T00:30:00.000Z');
  });

  it('accepts a custom shortcode and validity', async () => {
    const res = await request(app).post('/shorturls').send({ url: 'https://example.com', validity: 5, shortcode: 'abcd1' });
    expect(res.status).toBe(201);
    expect(res.body.shortLink).toMatch(/\/abcd1$/);
    expect(res.body.expiry).toBe('2026-01-01T00:05:00.000Z');
  });

  it('rejects a taken shortcode with 409', async () => {
    const res = await request(app).post('/shorturls').send({ url: 'https://example.com', shortcode: 'abcd1' });
    expect(res.status).toBe(409);
  });

  it('rejects bad input with 400', async () => {
    expect((await request(app).post('/shorturls').send({ url: 'nope' })).status).toBe(400);
    expect((await request(app).post('/shorturls').send({ url: 'https://x.com', validity: -1 })).status).toBe(400);
    expect((await request(app).post('/shorturls').send({ url: 'https://x.com', shortcode: 'a!' })).status).toBe(400);
  });
});
// #endregion

describe('04 URL shortener: redirect and stats', () => {
  const app = createApp({ now });

  it('redirects, records the click and reports stats', async () => {
    await request(app).post('/shorturls').send({ url: 'https://example.com/target', shortcode: 'go123' });
    const hit = await request(app).get('/go123').set('Referer', 'https://news.site').set('x-country', 'IN');
    expect(hit.status).toBe(302);
    expect(hit.headers.location).toBe('https://example.com/target');

    const stats = await request(app).get('/shorturls/go123');
    expect(stats.body).toMatchObject({ originalUrl: 'https://example.com/target', totalClicks: 1 });
    expect(stats.body.clicks[0]).toMatchObject({ referrer: 'https://news.site', location: 'IN' });
  });

  it('404 for unknown codes, 410 once expired', async () => {
    expect((await request(app).get('/nothing')).status).toBe(404);
    expect((await request(app).get('/shorturls/nothing')).status).toBe(404);
    await request(app).post('/shorturls').send({ url: 'https://example.com', validity: 1, shortcode: 'short1' });
    clock += 2 * 60_000;
    expect((await request(app).get('/short1')).status).toBe(410);
  });
});
