// Mock of the 5 e-commerce company APIs.
import express from 'express';
import { mockAuth } from '../shared/mockAuth.js';

export const COMPANIES = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
export const CATEGORIES = ['Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger', 'Mouse', 'Keypad',
  'Bluetooth', 'Pendrive', 'Remote', 'Speaker', 'Headset', 'Laptop', 'PC'];

// Deterministic products: same input -> same output.
export function productsFor(company, category) {
  const seed = [...(company + category)].reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: 10 }, (_, i) => ({
    productName: `${category} ${i + 1}`,
    price: 100 + ((seed * (i + 7)) % 9900),
    rating: Math.round((1 + ((seed + i * 13) % 40) / 10) * 10) / 10,
    discount: (seed + i * 17) % 90,
    availability: i % 4 === 0 ? 'out-of-stock' : 'yes',
  }));
}

export function createMockServer({ failCompany = null } = {}) {
  const app = express();
  const requireToken = mockAuth(app);
  app.get('/companies/:company/categories/:category/products', requireToken, (req, res) => {
    const { company, category } = req.params;
    if (company === failCompany) return res.status(503).end();
    if (!COMPANIES.includes(company) || !CATEGORIES.includes(category)) return res.status(404).end();
    const top = Number(req.query.top) || 10;
    const min = Number(req.query.minPrice) || 0;
    const max = Number(req.query.maxPrice) || Infinity;
    res.json(productsFor(company, category).filter((p) => p.price >= min && p.price <= max).slice(0, top));
  });
  return app;
}
