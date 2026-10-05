# Micro-Node-js

The quickest code-only path to building **Node.js microservices**, with a project after every part.

- **Microservices Track (6 days):** short code steps, then 2 projects each day. Every project gives you the full requirements and API endpoints, and you code it.
- **Containers Track (extra):** an easy, gentle path from your first `docker run` to CI/CD. It containerises the projects you already built.

41 code steps · 17 projects · about 54 hours of building. There's no theory: every card is something you write.

<p align="center"><img src="./roadmap.svg" alt="Node.js Microservices: Code & Projects roadmap" width="100%"></p>

## Use it interactively

Download or clone the repo and open `roadmap.svg` in a browser.

- **Click a step** to see exactly what to code.
- **Click a project** to open its full spec: the mock upstream API to build, your endpoints, requirements and a sample response. **Copy spec** puts it on your clipboard as Markdown.
- **Tick the circle** on a card, or press **Mark as built**, to track progress. It's saved in your browser.
- Use the **Day 1–6 / Box 1–6** chips to jump, **Prev / Next** to walk the path, and `Esc` to close.

> GitHub shows the SVG as a static image. Open it in a browser for the interactive version, or read every spec in **[PROJECTS.md](PROJECTS.md)**.

## Microservices Track

| Day | Learn in code | Projects |
|-----|---------------|----------|
| 1 | Express Fast Start: endpoints, middleware, calling APIs with timeouts | 01 Number Merge Service · 02 Average Calculator Microservice |
| 2 | Logging, Tokens & Links: workspaces package, Bearer token client, in-memory store | 03 Logging Middleware + Log Service · 04 URL Shortener Microservice |
| 3 | Aggregator Services: fan-out calls, sort/paginate, TTL cache, correlation | 05 Top Products Aggregator · 06 Stock Price Aggregator |
| 4 | Database & Auth: Prisma, Postgres, JWT, background sync | 07 Social Media Analytics · 08 Train Schedule Service |
| 5 | Multi-Service Systems: gateway, Redis events, heaps, worker threads | 09 Notifications Priority Inbox · 10 Vehicle Maintenance Scheduler |
| 6 | Test & Ship: Supertest, mock upstreams, health, shutdown | 11 Capstone: Mini Platform |

## Containers Track

| Box | Learn in code | Project |
|-----|---------------|---------|
| 1 | Run Things in Docker | C1 Containerised Dependencies |
| 2 | Your First Dockerfile | C2 Containerise the URL Shortener |
| 3 | Better Images | C3 Slim the Aggregator Image |
| 4 | Docker Compose | C4 Compose the Aggregators |
| 5 | Compose the Platform | C5 Capstone in Compose |
| 6 | Push & Deploy | C6 CI/CD for the Platform |

## Edit the roadmap

All the content (steps, minutes, projects, endpoints, rules and samples) is in [`roadmap/data.mjs`](roadmap/data.mjs). After editing it, regenerate `roadmap.svg` and `PROJECTS.md`:

```bash
npm run roadmap
```
