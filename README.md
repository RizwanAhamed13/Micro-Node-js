# Micro-Node-js

The quickest code-only path to building **Node.js microservices**, with a project after every part.

- **Microservices Track (6 days):** short code steps, then 2 projects each day. Every project is a real backend assessment question with its full requirements and API endpoints, and you code it. Day 6 ends with two timed mock rounds.
- **Containers Track (extra):** an easy, gentle path from your first `docker run` to CI/CD. It containerises the projects you already built.

38 code steps · 18 projects · about 49 hours of building. There's no theory: every card is something you write.

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
| 1 | Express Fast Start: endpoints, middleware, calling APIs with timeouts, tries | 01 Number Management Service · 02 Prefix Management Service |
| 2 | Logging, Tokens & Links: reusable package, Bearer token client, in-memory store | 03 Logging Middleware · 04 URL Shortener Microservice |
| 3 | Aggregator Services: fan-out calls, sort/filter, TTL cache, correlation | 05 Top Products Microservice · 06 Stock Price Aggregation |
| 4 | Database & Auth: Prisma, Postgres, password auth, query filters | 07 User Management Service · 08 Journal CRUD API |
| 5 | Multi-Service Systems: heaps, knapsack DP, worker threads, several services | 09 Campus Notifications Microservice · 10 Vehicle Maintenance Scheduler |
| 6 | Test & Mock Rounds: Supertest, mock upstreams, submission hygiene | 11 Mock Round: 3-Hour Assessment · 12 Mock Round: Journal CRUD in 30 Minutes |

## Containers Track

| Box | Learn in code | Project |
|-----|---------------|---------|
| 1 | Run Things in Docker | C1 Containerised Dependencies |
| 2 | Your First Dockerfile | C2 Containerise the URL Shortener |
| 3 | Better Images | C3 Slim the Stock Service Image |
| 4 | Docker Compose | C4 Compose Numbers + Test Server |
| 5 | Compose Many Services | C5 Compose the Day 5 Services |
| 6 | Push & Deploy | C6 CI/CD for Your Services |

## Edit the roadmap

Steps, minutes, projects, endpoints, rules and samples are in [`roadmap/data.mjs`](roadmap/data.mjs). The one-line explanation and code snippet for each card are in [`roadmap/content.md`](roadmap/content.md). After editing either, regenerate `roadmap.svg`, `PROJECTS.md` and `docs/index.html`:

```bash
npm run roadmap
```
