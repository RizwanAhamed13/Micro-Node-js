import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('00 setup: first endpoints + middleware', () => {
  const lines = [];
  const app = createApp({ log: (l) => lines.push(l) });

  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('reads params and query', async () => {
    const res = await request(app).get('/items/42?verbose=true');
    expect(res.body).toEqual({ id: 42, verbose: true });
  });

  it('rejects a bad id with 400', async () => {
    expect((await request(app).get('/items/abc')).status).toBe(400);
  });

  it('POST creates with 201, and validates the body', async () => {
    expect((await request(app).post('/items').send({ name: 'pen' })).status).toBe(201);
    expect((await request(app).post('/items').send({})).status).toBe(400);
  });

  it('repeated query params become an array', async () => {
    expect((await request(app).get('/echo?url=a&url=b')).body.urls).toEqual(['a', 'b']);
    expect((await request(app).get('/echo?url=a')).body.urls).toEqual(['a']);
  });

  it('unknown routes are JSON 404s, and every request is logged', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No route/);
    expect(lines.some((l) => l.startsWith('GET /nope 404'))).toBe(true);
  });
});
