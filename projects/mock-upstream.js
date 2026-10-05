// One mock test server for local runs and docker compose:
// /auth, /stocks, /notifications, /depots, /vehicles.
import express from 'express';
import { mockAuth } from './shared/mockAuth.js';

const app = express();
const requireToken = mockAuth(app);
const minsAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();

const histories = {
  NVDA: [231.95, 260.1, 310.4, 675.17].map((price, i) => ({ price, lastUpdatedAt: minsAgo(40 - i * 10) })),
  PYPL: [680.6, 702.2, 690.1, 715.8].map((price, i) => ({ price, lastUpdatedAt: minsAgo(40 - i * 10) })),
};
app.get('/stocks', requireToken, (req, res) => res.json({ stocks: { 'Nvidia Corporation': 'NVDA', 'PayPal Holdings, Inc.': 'PYPL' } }));
app.get('/stocks/:t', requireToken, (req, res) => {
  const h = histories[req.params.t];
  if (!h) return res.status(404).json({ error: 'unknown ticker' });
  const m = Number(req.query.minutes);
  res.json(m ? h.filter((p) => Date.parse(p.lastUpdatedAt) >= Date.now() - m * 60_000) : { stock: h.at(-1) });
});

app.get('/notifications', requireToken, (req, res) => res.json({ notifications: [
  { ID: 'n1', Type: 'Event', Message: 'tech fest', Timestamp: minsAgo(5) },
  { ID: 'n2', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: minsAgo(30) },
  { ID: 'n3', Type: 'Result', Message: 'mid-sem', Timestamp: minsAgo(10) },
] }));
app.get('/depots', requireToken, (req, res) => res.json({ depots: [{ ID: 1, MechanicHours: 10 }] }));
app.get('/vehicles', requireToken, (req, res) => res.json({ vehicles: [
  { TaskID: 't1', Duration: 5, Impact: 10 }, { TaskID: 't2', Duration: 4, Impact: 40 },
  { TaskID: 't3', Duration: 6, Impact: 30 }, { TaskID: 't4', Duration: 3, Impact: 50 },
] }));
app.get('/health', (req, res) => res.json({ ok: true, service: 'mock-upstream' }));

const port = Number(process.env.PORT) || 8090;
app.listen(port, () => console.log(`mock upstream on http://localhost:${port}`));
