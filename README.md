# Micro-Node-js

The quickest code-only path to building **Node.js microservices**, built around real backend assessment questions.

- **Microservices Track (7 days):** short code steps, then projects. Every project is a real assessment question with its full requirements and API endpoints. Day 7 ends with timed mock rounds.
- **Containers Track:** an easy path from your first `docker run` to CI, using the projects you built.
- **Interview Track:** how the rounds run, the concept and SQL questions asked, answered in code, and how to defend your submission.

75 cards · 23 projects · about 65 hours. Every card has a one-line "what it is" and code. 59 cards show code that is run by the test suite in [`projects/`](projects/).

<p align="center"><img src="./roadmap.svg" alt="Node.js Microservices: Code & Projects roadmap" width="100%"></p>

## Web version

**https://rizwanahamed13.github.io/Micro-Node-js/**

Every card opens a drawer with a one-line "what it is", the tasks to tick off, and a working code snippet with a Copy button. Projects show their full API spec and starter code. You can search, filter by To do / Built, and track progress (saved in your browser). The page is built from the same data into `docs/index.html`.

## Use the SVG interactively

Download or clone the repo and open `roadmap.svg` in a browser.

- **Click a step** to see exactly what to code.
- **Click a project** to open its full spec: the mock upstream API to build, your endpoints, requirements and a sample response. **Copy spec** puts it on your clipboard as Markdown.
- **Tick the circle** on a card, or press **Mark as built**, to track progress. It's saved in your browser.
- Use the **Day 1–6 / Box 1–6** chips to jump, **Prev / Next** to walk the path, and `Esc` to close.

> GitHub shows the SVG as a static image. Open it in a browser for the interactive version, or read every spec in **[PROJECTS.md](PROJECTS.md)**.

## Microservices Track

| Day | Learn in code | Projects |
|-----|---------------|----------|
| 1 | Express, middleware, calling APIs with timeouts, tries | Number Management Service · Prefix Management Service |
| 2 | Shared package, Bearer token client, in-memory store, redirects | Logging Middleware · URL Shortener Microservice |
| 3 | Fan-out calls, sort/filter, TTL cache, correlation | Average Calculator · Top Products · Stock Price Aggregation |
| 4 | Prisma, Postgres, password auth, query filters | User Management Service · Journal CRUD API |
| 5 | Concurrency limits, background refresh, time windows | Social Media Analytics · Train Schedule Service |
| 6 | Heaps, knapsack DP, worker threads, schema + index, reliable queues | Campus Notifications (6 stages) · Vehicle Maintenance Scheduler |
| 7 | API tests, mock upstreams, submission hygiene | Mock rounds: 90-min backend · 3-hour full stack · 30-min Journal CRUD |

## Containers Track

| Box | Learn | Project |
|-----|-------|---------|
| 1 | Run Things in Docker | Containerised Dependencies |
| 2 | Your First Dockerfile | Containerise the URL Shortener |
| 3 | Better Images | Slim the Stock Service Image |
| 4 | Docker Compose | Compose Numbers + Test Server |
| 5 | Compose Many Services | Compose the Day 6 Services |
| 6 | CI/CD | CI/CD for Your Services |

## Interview Track

| Prep | Covers |
|------|--------|
| 1 | Rounds and time limits, register and get a token, reading the question PDF like a spec |
| 2 | Caching, tokens and secrets, event loop order, parallel awaits, hoisting/TDZ |
| 3 | The SQL round, query tuning with EXPLAIN, and defending your own submission |

## Run the projects

```bash
cd projects
npm install
npm test                      # 17 test files, every project + shared helpers
node 01-number-management/testserver.js &   # mock test server on :8090
node 01-number-management/server.js         # GET :8008/numbers?url=...
```

Each project has `app.js` (the service), `server.js` (start it) and `app.test.js`. Mock upstreams stand in for the real test server; set `API_BASE_URL` and the credentials in `.env` (see `.env.example`) to point a service at a real one. The workflow in `.github/workflows/projects.yml` runs the tests and builds and starts every container on each push.

## Edit the roadmap

Steps, minutes, projects, endpoints, rules and samples are in [`roadmap/data.mjs`](roadmap/data.mjs). The one-line explanation for each card, and which file and `#region` its code comes from, are in [`roadmap/content.md`](roadmap/content.md). After editing either, regenerate `roadmap.svg`, `PROJECTS.md` and `docs/index.html`:

```bash
npm run roadmap
```
