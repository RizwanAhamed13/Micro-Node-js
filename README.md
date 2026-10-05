# Micro-Node-js

A **6-day code sprint** from Node.js application development to Node microservices.
It has 49 topics and about 45 hours of building, so roughly 7–8 hours a day. Every topic is a list of things you write in code, with no theory.

<p align="center"><img src="./roadmap.svg" alt="Node.js 6-Day Sprint roadmap" width="100%"></p>

## Use it interactively

Download or clone the repo and open `roadmap.svg` in a browser (Chrome, Edge, Firefox or Safari).

- **Click a topic** to open its build tasks. Use **Prev / Next** to move through the path.
- **Click the circle** on a card, or **Mark as built** in the panel, to tick a topic off.
- Each day badge shows that day's `done/total`, its **SHIP** goal (what you'll have running by the end of the day) and its time budget.
- Each card shows the minutes budgeted for that topic. The bar at the top shows overall progress and the hours you have left.
- Click the **Day 1–6** chips to jump to a day. `Esc` closes the panel.
- Progress is saved in your browser's localStorage.

> GitHub shows the SVG as a static image. The clicking and progress tracking only work when you open the file directly in a browser.

## The sprint

| Day | Focus | Ship by end of day |
|-----|-------|--------------------|
| 1 | Node Core & Project Setup | A raw `http` server and a CLI tool, in a linted TypeScript project |
| 2 | REST API with Express | A CRUD API with validation, error handling and docs |
| 3 | Database, Cache & Auth | The API running on Postgres and Redis, with JWT auth and roles |
| 4 | Real-time, Jobs & Testing | WebSockets, BullMQ jobs, webhooks and a passing test suite |
| 5 | Microservices & Events | A gateway plus users, catalog, orders and payments services, talking over HTTP and RabbitMQ (outbox, saga) |
| 6 | Containers, Observability & Ship | Docker Compose stack, tracing, metrics, CI/CD, Kubernetes, and the capstone demo |

## Edit the roadmap

All the content (days, topics, minutes and tasks) is in [`roadmap/data.mjs`](roadmap/data.mjs). To change it, edit that file and regenerate the SVG:

```bash
npm run roadmap
```
