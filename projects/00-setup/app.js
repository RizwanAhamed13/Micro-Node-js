import express from 'express';
import { requestLogger, errorHandler, notFound } from '../shared/middleware.js';

export function createApp({ log = () => {} } = {}) {
  const app = express();
  app.use(express.json());
  app.use(requestLogger(log));

  app.get('/health', (req, res) => res.json({ ok: true }));

  // #region First Endpoints
  // GET /items/42?verbose=true
  app.get('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be a number' });
    res.json({ id, verbose: req.query.verbose === 'true' });
  });

  // POST /items  { "name": "pen" }
  app.post('/items', (req, res) => {
    const { name } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    res.status(201).json({ id: 1, name });
  });

  // ?url=a&url=b -> ['a', 'b'],  ?url=a -> ['a']
  app.get('/echo', (req, res) => {
    const urls = [].concat(req.query.url ?? []);
    res.json({ urls });
  });
  // #endregion

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
