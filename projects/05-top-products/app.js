import express from 'express';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { fromAll } from '../shared/fanout.js';
import { createCache } from '../shared/cache.js';
import { sortBy, inPriceRange, SORTABLE } from '../shared/sort.js';
import { errorHandler } from '../shared/middleware.js';
import { COMPANIES, CATEGORIES } from './mockserver.js';

const Query = z.object({
  n: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
  minPrice: z.coerce.number().min(0).default(0),
  maxPrice: z.coerce.number().positive().default(1e9),
  sortBy: z.enum(SORTABLE).default('rating'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// #region Top Products Microservice
const stableId = (p) => createHash('sha1').update(`${p.company}:${p.productName}`).digest('hex').slice(0, 12);

export function createApp({ api, ttlMs = 60_000 }) {
  const app = express();
  const { cached } = createCache();
  const byId = new Map(); // productid -> product, filled as lists are served

  app.get('/categories/:category/products', async (req, res, next) => {
    try {
      const { category } = req.params;
      if (!CATEGORIES.includes(category)) return res.status(400).json({ error: `unknown category ${category}` });
      const q = Query.parse(req.query);

      const all = await cached(`${category}:${q.minPrice}:${q.maxPrice}`, ttlMs, () =>
        fromAll(COMPANIES, (c) =>
          api(`/companies/${c}/categories/${category}/products?top=${Math.max(q.n, 10)}&minPrice=${q.minPrice}&maxPrice=${q.maxPrice}`),
        ));

      const ranked = sortBy(inPriceRange(all, q.minPrice, q.maxPrice), q.sortBy, q.order)
        .map(({ source, ...p }) => ({ id: stableId({ ...p, company: source }), company: source, ...p }));
      ranked.forEach((p) => byId.set(`${category}/${p.id}`, p));

      const pageSize = Math.min(q.n, 10); // n > 10 -> pages of 10
      const top = ranked.slice(0, q.n);
      res.json({
        total: top.length,
        page: q.page,
        products: top.slice((q.page - 1) * pageSize, q.page * pageSize),
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/categories/:category/products/:productid', (req, res) => {
    const p = byId.get(`${req.params.category}/${req.params.productid}`);
    if (!p) return res.status(404).json({ error: 'product not found' });
    res.json(p);
  });

  app.use(errorHandler);
  return app;
}
// #endregion
