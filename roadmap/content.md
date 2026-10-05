# Card content

One line of "what it is" and one code snippet per card. The heading must match the
card title in data.mjs exactly. `lang` is one of: js, sh, docker, yaml, prisma, json, text.

## Setup in 10 Minutes
what: A Node service is just a package.json, an entry file and a start script.
lang: js
```
// npm init -y && npm i express
// package.json -> "type": "module", "scripts": { "dev": "node --watch src/server.js" }

// src/server.js
import express from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
```

## First Endpoints
what: A route maps an HTTP method + path to a function that reads the request and sends JSON.
lang: js
```
app.use(express.json()); // fills req.body

// GET /items/42?verbose=true
app.get('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be a number' });
  res.json({ id, verbose: req.query.verbose === 'true' });
});

app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json({ id: Date.now(), name });
});

// ?url=a&url=b -> ['a', 'b'], ?url=a -> 'a'
const toArray = (v) => (v === undefined ? [] : [].concat(v));
```

## Middleware
what: Middleware is a function that runs before (or after) your routes for every request.
lang: js
```
// 1. log every request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(req.method, req.originalUrl, res.statusCode, `${Date.now() - start}ms`);
  });
  next();
});

// 2. let async routes throw
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 3. one place for errors (register last, 4 arguments)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal error' : err.message });
});
```

## Call Other APIs
what: Call many URLs in parallel and drop the ones that fail or are too slow.
lang: js
```
async function getJson(url, ms = 500) {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function getAll(urls, ms = 500) {
  const results = await Promise.allSettled(urls.map((u) => getJson(u, ms)));
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}

const isValidUrl = (s) => {
  try { return ['http:', 'https:'].includes(new URL(s).protocol); }
  catch { return false; }
};
```

## Strings & Tries
what: A trie stores words letter by letter, so you can see where a word stops sharing a path.
lang: js
```
function buildTrie(words) {
  const root = { count: 0, kids: {} };
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      node.kids[ch] ??= { count: 0, kids: {} };
      node = node.kids[ch];
      node.count++; // how many words pass through here
    }
  }
  return root;
}

// shortest prefix that only this word has
function uniquePrefix(root, word) {
  let node = root;
  for (let i = 0; i < word.length; i++) {
    node = node.kids[word[i]];
    if (node.count === 1) return word.slice(0, i + 1);
  }
  return word;
}
```

## Number Management Service
what: An aggregator: fan out to many URLs, keep what arrives in time, merge and sort.
lang: js
```
import express from 'express';
const app = express();

app.get('/numbers', async (req, res) => {
  const urls = [].concat(req.query.url ?? []).filter(isValidUrl);
  const deadline = AbortSignal.timeout(450); // leave headroom under 500 ms

  const results = await Promise.allSettled(
    urls.map((u) => fetch(u, { signal: deadline }).then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })),
  );

  const merged = new Set();
  for (const r of results) {
    if (r.status === 'fulfilled') r.value.numbers?.forEach((n) => merged.add(n));
  }
  res.json({ numbers: [...merged].sort((a, b) => a - b) });
});

app.listen(8008);
```

## Prefix Management Service
what: Look each keyword up in a fixed word list and answer from a trie.
lang: js
```
const WORDS = ['bonfire', 'cardio', 'case', 'character', 'bonsai' /* ...20 */];
const trie = buildTrie(WORDS);
const known = new Set(WORDS);

app.get('/prefixes', (req, res) => {
  const keywords = String(req.query.keywords ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  res.json(keywords.map((keyword) =>
    known.has(keyword)
      ? { keyword, status: 'found', prefix: uniquePrefix(trie, keyword) }
      : { keyword, status: 'not_found', prefix: 'not_applicable' },
  ));
});
```

## Reusable Package
what: Put shared code in its own folder with a package.json, then import it from every service.
lang: js
```
// Logging Middleware/package.json
// { "name": "logging-middleware", "type": "module", "main": "index.js" }

// root package.json
// { "workspaces": ["Logging Middleware", "Backend Test Submission"] }

// Backend Test Submission/package.json
// { "dependencies": { "logging-middleware": "*" } }

// any service
import { Log } from 'logging-middleware';

await Log('backend', 'info', 'route', 'server started');
```

## Bearer Token Client
what: Trade your client ID and secret for a token once, then send it on every request.
lang: js
```
const BASE = process.env.API_BASE_URL;
let token = process.env.ACCESS_TOKEN || null;

async function auth() {
  const res = await fetch(`${BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.EMAIL, name: process.env.NAME, rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET,
    }),
  });
  token = (await res.json()).access_token;
  return token;
}

export async function api(path, init = {}) {
  const call = () => fetch(`${BASE}${path}`, {
    ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  let res = await call();
  if (res.status === 401) { await auth(); res = await call(); } // refresh once
  return res.json();
}
```

## In-Memory Store
what: A Map is a fast key-value store that lives as long as the process does.
lang: js
```
import { randomBytes } from 'node:crypto';

const links = new Map(); // shortcode -> { url, createdAt, expiry, clicks: [] }

function newCode(len = 6) {
  let code;
  do {
    code = randomBytes(8).toString('base64url').replace(/[-_]/g, '').slice(0, len);
  } while (links.has(code));
  return code;
}

// drop expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [code, link] of links) {
    if (Date.parse(link.expiry) < now) links.delete(code);
  }
}, 60_000).unref();
```

## Redirects & Headers
what: A redirect is a response with a status 3xx and a Location header the browser follows.
lang: js
```
app.get('/:code', (req, res) => {
  const link = links.get(req.params.code);
  if (!link) return res.status(404).json({ error: 'Unknown short link' });
  if (Date.parse(link.expiry) < Date.now()) {
    return res.status(410).json({ error: 'Short link has expired' });
  }

  link.clicks.push({
    timestamp: new Date().toISOString(),
    referrer: req.get('referer') || 'direct',
    ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
  });

  res.redirect(302, link.url);
});
```

## Logging Middleware
what: One validated Log() function that ships logs to a server, used by every project.
lang: js
```
const STACKS = ['backend', 'frontend'];
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const PACKAGES = {
  backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler',
            'repository', 'route', 'service'],
  frontend: ['api', 'component', 'hook', 'page', 'state', 'style'],
  both: ['auth', 'config', 'middleware', 'utils'],
};

export async function Log(stack, level, pkg, message) {
  const okPkg = PACKAGES[stack]?.includes(pkg) || PACKAGES.both.includes(pkg);
  if (!STACKS.includes(stack) || !LEVELS.includes(level) || !okPkg) return;
  try {
    await api('/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch { /* logging must never crash the app */ }
}

// express middleware
export const requestLogger = (req, res, next) => {
  res.on('finish', () => Log('backend', res.statusCode >= 500 ? 'error' : 'info',
    'middleware', `${req.method} ${req.originalUrl} ${res.statusCode}`));
  next();
};
```

## URL Shortener Microservice
what: Map a short code to a long URL with an expiry, redirect on visit, and count clicks.
lang: js
```
app.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;
  if (!isValidUrl(url)) return res.status(400).json({ error: 'url must be http(s)' });
  if (!Number.isInteger(validity) || validity <= 0) {
    return res.status(400).json({ error: 'validity must be a positive integer (minutes)' });
  }
  if (shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
    return res.status(400).json({ error: 'shortcode must be 3-20 letters or digits' });
  }
  if (shortcode && links.has(shortcode)) {
    return res.status(409).json({ error: 'shortcode already in use' });
  }

  const code = shortcode || newCode();
  const expiry = new Date(Date.now() + validity * 60_000).toISOString();
  links.set(code, { url, createdAt: new Date().toISOString(), expiry, clicks: [] });
  Log('backend', 'info', 'handler', `created ${code}`);

  res.status(201).json({ shortLink: `${req.protocol}://${req.get('host')}/${code}`, expiry });
});

app.get('/shorturls/:code', (req, res) => {
  const link = links.get(req.params.code);
  if (!link) return res.status(404).json({ error: 'Unknown short link' });
  res.json({ ...link, totalClicks: link.clicks.length });
});
```

## Fan-Out Calls
what: Send the same request to several sources at once and tag each result with its source.
lang: js
```
const COMPANIES = ['A', 'B', 'C', 'D', 'E'];

async function fromAll(pathFor) {
  const settled = await Promise.allSettled(
    COMPANIES.map(async (company) => {
      const items = await api(pathFor(company));
      return items.map((item) => ({ ...item, company }));
    }),
  );
  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
```

## Sort & Filter
what: Read sort and filter options from the query, validate them, then apply them in order.
lang: js
```
const SORTABLE = ['price', 'rating', 'discount', 'company'];

function sortBy(list, field, order = 'asc') {
  if (!SORTABLE.includes(field)) return list;
  const dir = order === 'desc' ? -1 : 1;
  return [...list].sort((a, b) =>
    a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0);
}

function inPriceRange(list, min = 0, max = Infinity) {
  return list.filter((p) => p.price >= Number(min) && p.price <= Number(max));
}
```

## Cache with TTL
what: Keep a response for a while so repeat requests skip the slow or rate-limited upstream.
lang: js
```
const cache = new Map();

export async function cached(key, ttlMs, load) {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const value = await load();
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

// usage
const history = await cached(`stock:${ticker}:${minutes}`, 30_000,
  () => api(`/stocks/${ticker}?minutes=${minutes}`));
```

## Math in Code
what: Pearson correlation says how closely two series move together, from -1 to 1.
lang: js
```
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

function correlation(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < xs.length; i++) {
    cov += (xs[i] - mx) * (ys[i] - my);
    vx += (xs[i] - mx) ** 2;
    vy += (ys[i] - my) ** 2;
  }
  return vx && vy ? cov / Math.sqrt(vx * vy) : 0;
}

// pair two price histories by nearest timestamp (within 60 s)
function pairByTime(a, b, maxGap = 60_000) {
  return a.flatMap((p) => {
    const t = Date.parse(p.lastUpdatedAt);
    const near = b.reduce((best, q) =>
      Math.abs(Date.parse(q.lastUpdatedAt) - t) <
      Math.abs(Date.parse(best.lastUpdatedAt) - t) ? q : best);
    return Math.abs(Date.parse(near.lastUpdatedAt) - t) <= maxGap
      ? [[p.price, near.price]] : [];
  });
}
```

## Top Products Microservice
what: An aggregator over 5 company APIs that filters, ranks and returns the top n products.
lang: js
```
app.get('/categories/:category/products', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const n = Math.min(Number(req.query.n) || 10, 100);
  const { minPrice = 0, maxPrice = 1e9, sortBy: field = 'rating', order = 'desc' } = req.query;

  const all = await cached(`${category}:${minPrice}:${maxPrice}`, 60_000, () =>
    fromAll((c) => `/companies/${c}/categories/${category}/products` +
      `?top=${n}&minPrice=${minPrice}&maxPrice=${maxPrice}`));

  const ranked = sortBy(inPriceRange(all, minPrice, maxPrice), field, order)
    .slice(0, n)
    .map((p) => ({ id: stableId(p), ...p }));

  res.json(ranked);
}));

const stableId = (p) =>
  createHash('sha1').update(`${p.company}:${p.productName}`).digest('hex').slice(0, 12);
```

## Stock Price Aggregation
what: Average a stock's recent prices, and correlate two stocks over the same window.
lang: js
```
app.get('/stocks/:ticker', asyncHandler(async (req, res) => {
  const { ticker } = req.params;
  const minutes = Number(req.query.minutes) || 60;
  const priceHistory = await cached(`h:${ticker}:${minutes}`, 30_000,
    () => api(`/stocks/${ticker}?minutes=${minutes}`));
  res.json({ averageStockPrice: mean(priceHistory.map((p) => p.price)), priceHistory });
}));

app.get('/stockcorrelation', asyncHandler(async (req, res) => {
  const tickers = [].concat(req.query.ticker ?? []);
  if (tickers.length !== 2) return res.status(400).json({ error: 'pass exactly 2 tickers' });
  const minutes = Number(req.query.minutes) || 60;

  const [a, b] = await Promise.all(tickers.map((t) => cached(`h:${t}:${minutes}`,
    30_000, () => api(`/stocks/${t}?minutes=${minutes}`))));
  const pairs = pairByTime(a, b);

  res.json({
    correlation: correlation(pairs.map((p) => p[0]), pairs.map((p) => p[1])),
    stocks: {
      [tickers[0]]: { averagePrice: mean(a.map((p) => p.price)), priceHistory: a },
      [tickers[1]]: { averagePrice: mean(b.map((p) => p.price)), priceHistory: b },
    },
  });
}));
```

## Prisma + SQLite
what: Prisma turns a schema file into database tables and a typed client to query them.
lang: prisma
```
// npm i -D prisma && npm i @prisma/client
// npx prisma init --datasource-provider sqlite

// prisma/schema.prisma
model Journal {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  tags        String   // JSON array as text on SQLite
  date        DateTime
  mood        String   // neutral | happy | sad
  createdAt   DateTime @default(now())
}

// npx prisma migrate dev --name init
// import { PrismaClient } from '@prisma/client';
// const db = new PrismaClient();
// await db.journal.create({ data: { ... } });
```

## Switch to Postgres
what: Same schema, different database: change the provider and the connection URL.
lang: prisma
```
// .env
// DATABASE_URL="postgresql://dev:dev@localhost:5432/app"

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Journal {
  id    Int      @id @default(autoincrement())
  tags  String[] // real arrays on Postgres
  // ...same fields as before
}

// npx prisma migrate dev --name postgres
```

## Password Auth
what: Store only a slow hash of the password, and give back a signed token on login.
lang: js
```
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const checkPassword = (plain, hash) => bcrypt.compare(plain, hash);
export const signToken = (user) => jwt.sign({ sub: user.id }, SECRET, { expiresIn: '1h' });

export function requireAuth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer /, '');
  try {
    req.userId = jwt.verify(token, SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Log in first' });
  }
}
```

## Filters from Query
what: Turn optional query params into a database where-clause, validating each one.
lang: js
```
import { z } from 'zod';

const Query = z.object({
  date: z.string().date().optional(),             // 2026-05-08
  mood: z.enum(['neutral', 'happy', 'sad']).optional(),
});

function journalWhere(query) {
  const q = Query.parse(query);                     // throws on bad input
  const where = {};
  if (q.mood) where.mood = q.mood;
  if (q.date) {
    const start = new Date(q.date);
    where.date = { gte: start, lt: new Date(start.getTime() + 86_400_000) };
  }
  return where;
}
```

## User Management Service
what: Four auth endpoints on one users table: sign up, log in, edit profile, change password.
lang: js
```
app.post('/signup', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (await db.user.findUnique({ where: { email } })) {
    return res.status(409).json({ error: 'email already registered' });
  }
  const user = await db.user.create({
    data: { first_name, last_name, email, password: await hashPassword(password) },
  });
  res.status(201).json({ id: user.id, email });
}));

app.post('/login', asyncHandler(async (req, res) => {
  const user = await db.user.findUnique({ where: { email: req.body.email } });
  if (!user || !(await checkPassword(req.body.password, user.password))) {
    return res.status(401).json({ error: 'wrong email or password' });
  }
  res.json({ token: signToken(user) });
}));

app.patch('/users/me', requireAuth, asyncHandler(async (req, res) => {
  const { first_name, last_name } = req.body;
  res.json(await db.user.update({ where: { id: req.userId }, data: { first_name, last_name } }));
}));

app.put('/users/me/password', requireAuth, asyncHandler(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.userId } });
  if (!(await checkPassword(req.body.oldPassword, user.password))) {
    return res.status(400).json({ error: 'old password is wrong' });
  }
  await db.user.update({ where: { id: user.id },
    data: { password: await hashPassword(req.body.newPassword) } });
  res.status(204).end();
}));
```

## Journal CRUD API
what: Classic CRUD on one resource, plus a filtered list. Aim for under 30 minutes.
lang: js
```
const r = express.Router();

r.post('/', asyncHandler(async (req, res) =>
  res.status(201).json(await db.journal.create({ data: req.body }))));

r.get('/', asyncHandler(async (req, res) =>
  res.json(await db.journal.findMany({ where: journalWhere(req.query), orderBy: { date: 'desc' } }))));

r.patch('/:id', asyncHandler(async (req, res) =>
  res.json(await db.journal.update({ where: { id: Number(req.params.id) }, data: req.body }))));

r.delete('/:id', asyncHandler(async (req, res) => {
  await db.journal.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
}));

app.use('/journals', r);
```

## Priority Queue
what: A heap keeps the smallest item on top, so getting the top N is cheap.
lang: js
```
class MinHeap {
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a; a.push(x);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]]; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}
```

## Dynamic Programming
what: 0/1 knapsack: best total value from items with weights, under a weight limit.
lang: js
```
function knapsack(items, capacity) {
  // dp[w] = best value using weight <= w (1-D table, iterate weight downwards)
  const dp = new Array(capacity + 1).fill(0);
  const take = items.map(() => new Uint8Array(capacity + 1));

  items.forEach(({ weight, value }, i) => {
    for (let w = capacity; w >= weight; w--) {
      if (dp[w - weight] + value > dp[w]) {
        dp[w] = dp[w - weight] + value;
        take[i][w] = 1;
      }
    }
  });

  // walk back to find which items were chosen
  const chosen = [];
  for (let i = items.length - 1, w = capacity; i >= 0; i--) {
    if (take[i][w]) { chosen.push(items[i]); w -= items[i].weight; }
  }
  return { best: dp[capacity], chosen: chosen.reverse() };
}
```

## Worker Threads
what: Run CPU-heavy work on another thread so the server keeps answering requests.
lang: js
```
// solve.worker.js
import { parentPort, workerData } from 'node:worker_threads';
import { knapsack } from './knapsack.js';
parentPort.postMessage(knapsack(workerData.items, workerData.capacity));

// server.js
import { Worker } from 'node:worker_threads';

function solveInWorker(items, capacity) {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('./solve.worker.js', import.meta.url),
      { workerData: { items, capacity } });
    w.once('message', resolve);
    w.once('error', reject);
  });
}
```

## Several Services
what: Each service is its own folder and port; one root script starts them all.
lang: json
```
{
  "name": "campus",
  "private": true,
  "workspaces": ["Logging Middleware", "notifications", "vehicle-scheduler"],
  "scripts": {
    "dev": "concurrently -n notify,vehicles \"npm run dev -w notifications\" \"npm run dev -w vehicle-scheduler\""
  },
  "devDependencies": { "concurrently": "^9.0.0" }
}
```

## Campus Notifications Microservice
what: Pull notifications, rank unread ones by type then recency, and return the top 10.
lang: js
```
const WEIGHT = { Placement: 3, Result: 2, Event: 1 };

// accept the different key spellings an upstream may use
const normalize = (n) => ({
  id: n.ID ?? n.id,
  type: n.Type ?? n.type ?? n.notificationType,
  message: n.Message ?? n.message,
  timestamp: n.Timestamp ?? n.timestamp ?? n.createdAt,
  isRead: Boolean(n.isRead ?? n.read),
});

// "less" = less important, so the heap root is the weakest of the kept n
const lessImportant = (a, b) =>
  WEIGHT[a.type] - WEIGHT[b.type] || Date.parse(a.timestamp) - Date.parse(b.timestamp);

function topUnread(list, n = 10) {
  const heap = new MinHeap(lessImportant);
  for (const x of list.map(normalize)) {
    if (x.isRead) continue;
    heap.push(x);
    if (heap.size > n) heap.pop();
  }
  const out = [];
  while (heap.size) out.push(heap.pop());
  return out.reverse(); // most important first
}

app.get('/priority-inbox', asyncHandler(async (req, res) => {
  const { notifications = [] } = await api('/notifications');
  res.json(topUnread(notifications, Number(req.query.n) || 10));
}));
```

## Vehicle Maintenance Scheduler
what: For each depot, pick the tasks with the most total impact that fit its mechanic hours.
lang: js
```
app.get('/schedule-maintenance', asyncHandler(async (req, res) => {
  const [{ depots = [] }, { vehicles = [] }] = await Promise.all([
    api('/depots'), api('/vehicles'),
  ]);

  const items = vehicles.map((v) => ({ id: v.TaskID, weight: v.Duration, value: v.Impact }));

  const plans = await Promise.all(depots.map(async (depot) => {
    const { best, chosen } = await solveInWorker(items, depot.MechanicHours);
    return {
      depot: depot.ID ?? depot.id,
      mechanicHours: depot.MechanicHours,
      selectedTaskIDs: chosen.map((t) => t.id),
      totalDuration: chosen.reduce((s, t) => s + t.weight, 0),
      totalImpact: best,
    };
  }));

  Log('backend', 'info', 'handler', `scheduled ${plans.length} depots`);
  res.json(plans);
}));
```

## API Tests
what: Supertest calls your Express app in memory, so tests need no running server.
lang: js
```
// src/app.js exports the app; src/server.js only calls app.listen()
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('POST /shorturls', () => {
  it('creates a link with a 30 minute default', async () => {
    const res = await request(app).post('/shorturls').send({ url: 'https://example.com' });
    expect(res.status).toBe(201);
    expect(res.body.shortLink).toMatch(/\/[a-zA-Z0-9]+$/);
  });

  it('rejects a bad url', async () => {
    const res = await request(app).post('/shorturls').send({ url: 'nope' });
    expect(res.status).toBe(400);
  });
});
```

## Mock Upstreams
what: Fake the external API in tests so they are fast, repeatable and offline.
lang: js
```
import nock from 'nock';

it('ignores a url slower than 500 ms', async () => {
  nock('http://upstream').get('/primes').reply(200, { numbers: [2, 3, 5] });
  nock('http://upstream').get('/slow').delay(700).reply(200, { numbers: [99] });

  const started = Date.now();
  const res = await request(app)
    .get('/numbers?url=http://upstream/primes&url=http://upstream/slow');

  expect(res.body.numbers).toEqual([2, 3, 5]);
  expect(Date.now() - started).toBeLessThan(500);
});
```

## Submission Hygiene
what: The repo is graded too: clear layout, run steps, screenshots, and no secrets.
lang: sh
```
# repo named with your roll number
mkdir 22CS0001 && cd 22CS0001 && git init
mkdir "Logging Middleware" "Backend Test Submission"

# never commit secrets
printf "node_modules\n.env\n" > .gitignore
cp .env .env.example   # then blank out every value in .env.example

# check before every push
git status
git diff --cached | grep -iE "secret|token|password" && echo "STOP: secret staged"
```

## Mock Round: 3-Hour Assessment
what: A full rehearsal: two projects from an empty repo under the real time limit.
lang: text
```
0:00  create repo, folders, .gitignore, .env.example
0:10  Logging Middleware: Log(), validation, token refresh
0:50  URL Shortener: POST /shorturls, GET /:code, GET /shorturls/:code
2:00  wire Log() into every handler, error codes, expiry
2:30  Postman screenshots of every endpoint into README
2:50  final push, check no secrets committed
3:00  stop
```

## Mock Round: Journal CRUD in 30 Minutes
what: Speed drill: one resource, five endpoints, two filters, thirty minutes.
lang: text
```
00-03  npm init, express, prisma (sqlite), schema with mood enum
03-15  POST, GET (filters), PATCH, DELETE
15-22  zod checks: mood in neutral|happy|sad, date is YYYY-MM-DD
22-28  try every endpoint in Postman
28-30  README with the endpoint list
```

## First Containers
what: A container runs a ready-made image, so you get Redis or Postgres without installing them.
lang: sh
```
docker run -d --name redis -p 6379:6379 redis:7
docker run -d --name pg -p 5432:5432 \
  -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=app postgres:16

docker ps                 # what is running
docker logs -f pg         # follow logs
docker exec -it pg psql -U dev app
docker stop pg && docker rm pg
```

## Volumes & Env
what: A volume keeps data outside the container; an env file keeps config outside the command.
lang: sh
```
docker volume create pgdata

docker run -d --name pg -p 5432:5432 \
  --env-file .env.db \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

# .env.db
# POSTGRES_USER=dev
# POSTGRES_PASSWORD=dev
# POSTGRES_DB=app
```

## Containerised Dependencies
what: Point your projects at databases running in Docker instead of on your machine.
lang: sh
```
docker run -d --name pg -p 5432:5432 --env-file .env.db -v pgdata:/var/lib/postgresql/data postgres:16
docker run -d --name redis -p 6379:6379 -v redisdata:/data redis:7

# Journal API / User Management
DATABASE_URL="postgresql://dev:dev@localhost:5432/app" npx prisma migrate dev

# Stock service
REDIS_URL="redis://localhost:6379" npm run dev

docker rm -f pg && docker run -d --name pg ... -v pgdata:/var/lib/postgresql/data postgres:16
# data is still there
```

## Basic Dockerfile
what: A Dockerfile is the recipe that turns your code into an image.
lang: docker
```
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=5000
EXPOSE 5000
CMD ["node", "src/server.js"]
```

## Build & Run
what: Build the image once, then run it anywhere with ports and config passed in.
lang: sh
```
# .dockerignore
# node_modules
# .env
# .git

docker build -t url-service .
docker run -d --name url -p 5000:5000 --env-file .env url-service

curl -X POST localhost:5000/shorturls \
  -H "Content-Type: application/json" -d '{"url":"https://example.com"}'
```

## Containerise the URL Shortener
what: Your Day 2 service, packaged so anyone can run it with one command.
lang: docker
```
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["node", "src/server.js"]

# docker build -t url-shortener .
# docker run -p 5000:5000 -e API_BASE_URL=... -e ACCESS_TOKEN=... url-shortener
```

## Multi-Stage Build
what: Build in one stage, copy only what runs into a small final stage.
lang: docker
```
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./
CMD ["node", "src/server.js"]
```

## Run Safely
what: Run as a normal user and let Docker check that the app is actually healthy.
lang: docker
```
FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --omit=dev
USER node

EXPOSE 5000
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]
```

## Slim the Stock Service Image
what: Same service, smaller and safer image. Check the size with docker images.
lang: sh
```
docker build -t stock-service .
docker images stock-service        # SIZE should be < 150MB
docker run -d --name stock -p 3001:3001 --env-file .env stock-service
docker ps                          # STATUS shows (healthy)
docker exec stock whoami           # node, not root
```

## compose.yaml Basics
what: Compose describes several containers in one file and starts them together.
lang: yaml
```
services:
  api:
    build: .
    ports: ["5000:5000"]
    env_file: .env
    environment:
      UPSTREAM_URL: http://testserver:8090   # service name is the hostname

  testserver:
    image: golang:1.22-alpine
    working_dir: /src
    volumes: ["./testserver:/src"]
    command: go run testserver.go
```

## Startup Order
what: Health checks plus depends_on make a service wait until what it needs is ready.
lang: yaml
```
services:
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: dev }
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      retries: 10

  api:
    build: .
    depends_on:
      db:
        condition: service_healthy
```

## Dev Mode
what: Compose watch copies your edits into the running container, so you never rebuild by hand.
lang: yaml
```
services:
  api:
    build: .
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json

# docker compose watch
# docker compose logs -f api
```

## Compose Numbers + Test Server
what: Your Day 1 service and its Go test server, both started by docker compose up.
lang: yaml
```
services:
  testserver:
    image: golang:1.22-alpine
    working_dir: /src
    volumes: ["./problem1:/src"]
    command: go run testserver.go
    expose: ["8090"]

  numbers:
    build: ./numbers
    ports: ["8008:8008"]
    depends_on: [testserver]

# curl "localhost:8008/numbers?url=http://testserver:8090/primes&url=http://testserver:8090/fibo"
```

## Multi-Service Compose
what: One block per microservice, plus shared databases with named volumes.
lang: yaml
```
services:
  notifications:
    build: ./notifications
    env_file: .env
    ports: ["8002:8002"]
  vehicles:
    build: ./vehicle-scheduler
    env_file: .env
    ports: ["8001:8001"]
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: dev }
    volumes: ["pgdata:/var/lib/postgresql/data"]

volumes:
  pgdata:
```

## Networks & Secrets
what: Keep internal services off the host network, and keep secrets out of the image.
lang: yaml
```
services:
  gateway:
    build: ./gateway
    ports: ["8080:8080"]        # the only public port
    networks: [public, internal]
  vehicles:
    build: ./vehicle-scheduler
    env_file: .env.vehicles     # tokens live here, not in the Dockerfile
    networks: [internal]        # no ports: reachable only inside compose

networks:
  public:
  internal:
    internal: true
```

## Compose the Day 5 Services
what: Both Day 5 services and the logging package running together in containers.
lang: sh
```
docker compose up -d --build
docker compose ps                       # both services (healthy)
curl localhost:8002/priority-inbox
curl localhost:8001/schedule-maintenance
docker compose logs -f notifications
docker compose down                     # add -v only to wipe volumes
```

## Registry
what: A registry stores your images so any server can pull them.
lang: sh
```
echo $GITHUB_TOKEN | docker login ghcr.io -u <user> --password-stdin

SHA=$(git rev-parse --short HEAD)
docker build -t ghcr.io/<user>/url-shortener:$SHA .
docker push ghcr.io/<user>/url-shortener:$SHA
```

## CI Builds
what: CI runs your tests and builds images on every push, so main is always deployable.
lang: yaml
```
# .github/workflows/images.yml
on: { push: { branches: [main] } }
jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: docker/build-push-action@v6
        with: { context: ., push: true, tags: "ghcr.io/${{ github.repository }}:${{ github.sha }}" }
```

## Run on a Server
what: On the server, pull the new images and restart, using the same compose file.
lang: sh
```
ssh deploy@my-server <<'EOF'
  cd /srv/app
  export TAG=<commit-sha>
  docker compose pull
  docker compose up -d
  docker image prune -f
EOF
```

## CI/CD for Your Services
what: Push to main, and tests, image builds and the deploy all happen on their own.
lang: yaml
```
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v4 }, { run: npm ci && npm test }]
  images:
    needs: test
    # build + push one image per service (see CI Builds)
  deploy:
    needs: images
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.HOST }}
          username: deploy
          key: ${{ secrets.SSH_KEY }}
          script: cd /srv/app && TAG=${{ github.sha }} docker compose pull && docker compose up -d
```
