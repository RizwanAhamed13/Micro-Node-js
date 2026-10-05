import express from 'express';
import { journalWhere, JournalInput } from './filters.js';
import { errorHandler } from '../shared/middleware.js';

// #region Journal CRUD API
export function createApp({ db }) {
  const app = express();
  app.use(express.json());
  const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
  const toDb = (j) => ({ ...j, tags: j.tags && JSON.stringify(j.tags), date: j.date && new Date(`${j.date}T00:00:00.000Z`) });
  const fromDb = (j) => ({ ...j, tags: JSON.parse(j.tags), date: j.date.toISOString().slice(0, 10) });
  const findOr404 = async (req, res) => {
    const j = await db.journal.findUnique({ where: { id: Number(req.params.id) || 0 } });
    if (!j) res.status(404).json({ error: 'journal not found' });
    return j;
  };

  app.post('/journals', wrap(async (req, res) => {
    const j = await db.journal.create({ data: toDb(JournalInput.parse(req.body)) });
    res.status(201).json(fromDb(j));
  }));

  app.get('/journals', wrap(async (req, res) => {
    const list = await db.journal.findMany({ where: journalWhere(req.query), orderBy: { date: 'desc' } });
    res.json(list.map(fromDb));
  }));

  app.get('/journals/:id', wrap(async (req, res) => {
    const j = await findOr404(req, res);
    if (j) res.json(fromDb(j));
  }));

  app.patch('/journals/:id', wrap(async (req, res) => {
    if (!(await findOr404(req, res))) return;
    const data = toDb(JournalInput.partial().parse(req.body));
    const j = await db.journal.update({ where: { id: Number(req.params.id) }, data });
    res.json(fromDb(j));
  }));

  app.delete('/journals/:id', wrap(async (req, res) => {
    if (!(await findOr404(req, res))) return;
    await db.journal.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  }));

  app.use(errorHandler);
  return app;
}
// #endregion
