import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { createMockServer, COMPANIES, productsFor } from './mockserver.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';

let mock;
let app;
let calls = 0;

beforeAll(async () => {
  mock = await listen(createMockServer({ failCompany: 'AZO' }));
  const { api } = createApiClient({ baseUrl: mock.url, credentials: {} });
  app = createApp({ api: (path) => { calls++; return api(path); } });
});
afterAll(() => mock.close());

describe('05 top products', () => {
  it('returns the top n across companies, sorted by price', async () => {
    const res = await request(app).get('/categories/Laptop/products?n=5&sortBy=price&order=asc');
    expect(res.status).toBe(200);
    const prices = res.body.products.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const cheapest = Math.min(...COMPANIES.filter((c) => c !== 'AZO').flatMap((c) => productsFor(c, 'Laptop').map((p) => p.price)));
    expect(prices[0]).toBe(cheapest);
    expect(res.body.products[0]).toHaveProperty('company');
    expect(res.body.products[0].id).toMatch(/^[0-9a-f]{12}$/);
  });

  it('respects the price range', async () => {
    const res = await request(app).get('/categories/Phone/products?n=50&minPrice=1000&maxPrice=5000');
    expect(res.body.products.every((p) => p.price >= 1000 && p.price <= 5000)).toBe(true);
  });

  it('paginates by 10 when n > 10', async () => {
    const p1 = await request(app).get('/categories/TV/products?n=25&page=1');
    const p3 = await request(app).get('/categories/TV/products?n=25&page=3');
    expect(p1.body.products).toHaveLength(10);
    expect(p3.body.products).toHaveLength(5);
  });

  it('serves product details by id', async () => {
    const list = await request(app).get('/categories/Mouse/products?n=1');
    const { id } = list.body.products[0];
    const one = await request(app).get(`/categories/Mouse/products/${id}`);
    expect(one.body).toEqual(list.body.products[0]);
    expect((await request(app).get('/categories/Mouse/products/nope')).status).toBe(404);
  });

  it('caches upstream calls', async () => {
    await request(app).get('/categories/Speaker/products?n=3');
    const before = calls;
    await request(app).get('/categories/Speaker/products?n=3&sortBy=discount');
    expect(calls).toBe(before);
  });

  it('400 for an unknown category or bad query', async () => {
    expect((await request(app).get('/categories/Cars/products')).status).toBe(400);
    expect((await request(app).get('/categories/TV/products?sortBy=colour')).status).toBe(400);
  });
});
