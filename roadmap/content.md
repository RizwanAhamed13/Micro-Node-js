# Card content

One "what" line and the code for every card. The heading must match the card title in data.mjs.

- `code: <path>#<Region>` pulls a `#region <Region>` ... `#endregion` block from a real file
  (paths are relative to the repo root). Several `code:` lines are joined in order.
  `code: <path>` with no region pulls the whole file. These files are run by the tests in projects/.
- A fenced block is an example that is not run by the test suite.
- `lang` is one of: js, sh, docker, yaml, prisma, json, sql, text.

## Setup in 10 Minutes
what: A Node service is a package.json, an entry file and a start script.
lang: js
code: projects/00-setup/server.js#Setup in 10 Minutes

## First Endpoints
what: A route maps an HTTP method + path to a function that reads the request and sends JSON.
lang: js
code: projects/00-setup/app.js#First Endpoints

## Middleware
what: Middleware is a function that runs before or after your routes for every request.
lang: js
code: projects/shared/middleware.js#Middleware

## Call Other APIs
what: Call many URLs in parallel and keep only the ones that answered in time.
lang: js
code: projects/shared/http.js#Call Other APIs

## Strings & Tries
what: A trie stores words letter by letter, so you can see where a word stops sharing a path.
lang: js
code: projects/shared/trie.js#Strings & Tries

## Number Management Service
what: An aggregator: fan out to many URLs under one deadline, keep what arrives, merge and sort.
lang: js
code: projects/01-number-management/app.js#Number Management Service

## Prefix Management Service
what: Look each keyword up in a fixed word list and answer from a trie.
lang: js
code: projects/02-prefix-management/app.js#Prefix Management Service

## Reusable Package
what: Shared code in its own workspace package, imported by name from every service.
lang: js
code: projects/logging-middleware/package.json
code: projects/03-logging-middleware/logger.test.js#Reusable Package

## Bearer Token Client
what: Trade credentials for a token, send it on every call, and refresh it once on 401.
lang: js
code: projects/shared/apiClient.js#Bearer Token Client

## In-Memory Store
what: A Map is a fast key-value store that lives as long as the process does.
lang: js
code: projects/04-url-shortener/store.js#In-Memory Store

## Redirects & Headers
what: A redirect is a 3xx response with a Location header the browser follows.
lang: js
code: projects/04-url-shortener/app.js#Redirects & Headers

## Logging Middleware
what: One validated Log() function that ships logs to the test server and never crashes the app.
lang: js
code: projects/logging-middleware/index.js#Logging Middleware

## URL Shortener Microservice
what: Map a short code to a long URL with an expiry, redirect on visit, and count clicks.
lang: js
code: projects/04-url-shortener/app.js#URL Shortener Microservice

## Fan-Out Calls
what: Ask every source at once and tag each result with where it came from.
lang: js
code: projects/shared/fanout.js#Fan-Out Calls

## Sort & Filter
what: Sort by a whitelisted field and filter by a range, without mutating the input.
lang: js
code: projects/shared/sort.js#Sort & Filter

## Cache with TTL
what: Keep a response for a while so repeat requests skip the slow or paid upstream.
lang: js
code: projects/shared/cache.js#Cache with TTL

## Math in Code
what: Pearson correlation says how closely two series move together, from -1 to 1.
lang: js
code: projects/shared/stats.js#Math in Code

## Average Calculator Microservice
what: A sliding window of unique numbers: add new ones, drop the oldest, report the average.
lang: js
code: projects/11-average-calculator/app.js#Average Calculator Microservice

## Top Products Microservice
what: An aggregator over 5 company APIs that validates, ranks, paginates and caches.
lang: js
code: projects/05-top-products/app.js#Top Products Microservice

## Stock Price Aggregation
what: Average a stock's recent prices, and correlate two stocks over the same window.
lang: js
code: projects/06-stock-aggregation/app.js#Stock Price Aggregation

## Prisma + SQLite
what: Prisma turns a schema file into database tables and a typed client to query them.
lang: prisma
code: projects/08-journal-crud/prisma/schema.prisma#Prisma + SQLite

## Switch to Postgres
what: Same schema and code, different database: change the provider and the URL.
lang: prisma
```
// .env
// JOURNAL_DATABASE_URL="postgresql://dev:dev@localhost:5432/app"

datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("JOURNAL_DATABASE_URL")
}

// npx prisma db push   -> tables created in Postgres
// The Journal API runs unchanged (checked against postgres:16-alpine).
```

## Password Auth
what: Store only a slow hash of the password, and hand back a signed token on login.
lang: js
code: projects/07-user-management/auth.js#Password Auth

## Filters from Query
what: Turn optional query params into a database where-clause, validating each one.
lang: js
code: projects/08-journal-crud/filters.js#Filters from Query

## User Management Service
what: Four auth endpoints on one users table; changing the password logs out old tokens.
lang: js
code: projects/07-user-management/app.js#User Management Service

## Journal CRUD API
what: Classic CRUD on one resource plus a filtered list. Aim for under 30 minutes.
lang: js
code: projects/08-journal-crud/app.js#Journal CRUD API

## Limit Concurrency
what: Run many calls but only N at a time, so you don't flood a paid API.
lang: js
code: projects/12-social-media-analytics/app.js#Limit Concurrency

## Background Refresh
what: Refresh a snapshot on a timer so requests never wait on the upstream.
lang: js
code: projects/12-social-media-analytics/server.js#Background Refresh

## Dates & Time Windows
what: Build a real timestamp from hours and minutes, then shift it by a delay.
lang: js
code: projects/13-train-schedule/schedule.js#Dates & Time Windows

## Social Media Analytics
what: Snapshot users, posts and comment counts with limited concurrency; answer from memory.
lang: js
code: projects/12-social-media-analytics/app.js#Social Media Analytics

## Train Schedule Service
what: Filter trains into a time window after delays, sort by price, seats and departure, cache.
lang: js
code: projects/13-train-schedule/schedule.js#Train Schedule Service
code: projects/13-train-schedule/app.js#Train Schedule Service

## Priority Queue
what: A heap keeps the smallest item on top, so "top N" costs O(N log n) instead of a full sort.
lang: js
code: projects/shared/heap.js#Priority Queue

## Dynamic Programming
what: 0/1 knapsack: the best total value from items with weights, under a weight limit.
lang: js
code: projects/shared/knapsack.js#Dynamic Programming

## Worker Threads
what: Run CPU-heavy work on another thread so the server keeps answering requests.
lang: js
code: projects/10-vehicle-scheduler/solve.worker.js#Worker Threads
code: projects/10-vehicle-scheduler/app.js#Worker Threads

## Notification Schema & Index
what: Tables plus one composite index that matches the hot query's filter and sort.
lang: sql
code: projects/09-campus-notifications/db.sql#Notification Schema & Index

## Stage 3 Queries
what: The two queries the paper asks for, run against SQLite in the tests.
lang: js
code: projects/09-campus-notifications/stages.test.js#Stage 3 Queries

## Reliable Notify-All
what: Save first, queue one job per student, retry, dead-letter, and never send twice.
lang: js
code: projects/09-campus-notifications/notifyAll.js#Reliable Notify-All

## Campus Notifications Microservice
what: Rank unread notifications by type, then recency, with a heap of size n.
lang: js
code: projects/09-campus-notifications/inbox.js#Campus Notifications Microservice

## Vehicle Maintenance Scheduler
what: For each depot, the tasks with the most total impact that fit its mechanic hours.
lang: js
code: projects/10-vehicle-scheduler/app.js#Vehicle Maintenance Scheduler

## API Tests
what: Supertest calls your Express app in memory, so tests need no running server.
lang: js
code: projects/04-url-shortener/app.test.js#API Tests

## Mock Upstreams
what: A real mock server on a free port, with a slow route and a failing route.
lang: js
code: projects/01-number-management/app.test.js#Mock Upstreams

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

## Mock Round: 90-Minute Backend Test
what: A full rehearsal of the backend task under the real time limit.
lang: text
```
0:00  repo + folders + .gitignore + .env.example
0:05  register / auth against your mock, save credentials
0:10  Logging Middleware (copy-free, from memory)
0:25  the service: routes, upstream calls, timeouts, cache
1:10  logging in every handler, status codes, edge cases
1:20  Postman screenshots into the README
1:30  push and stop
```

## Mock Round: 3-Hour Full Stack
what: Backend + frontend + logging from an empty repo, timed.
lang: text
```
0:00  repo, three folders, logging middleware
0:40  URL shortener backend, tested in Postman
1:40  React + MUI: shorten up to 5 URLs, stats page
2:40  logging in frontend and backend, screenshots
3:00  stop
```

## Mock Round: Journal CRUD in 30 Minutes
what: Speed drill: one resource, five endpoints, two filters, thirty minutes.
lang: text
```
00-03  npm init, express, prisma (sqlite), schema with mood
03-15  POST, GET (filters), PATCH, DELETE
15-22  zod checks: mood in neutral|happy|sad, date is YYYY-MM-DD
22-28  try every endpoint in Postman
28-30  README with the endpoint list
```

## First Containers
what: A container runs a ready-made image, so you get Redis or Postgres without installing them.
lang: sh
```
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name pg -p 5432:5432 \
  -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=app postgres:16-alpine

docker exec redis redis-cli ping          # PONG
docker exec -it pg psql -U dev app        # SQL prompt
docker ps
docker logs -f pg
docker rm -f pg redis
```

## Volumes & Env
what: A volume keeps data outside the container; an env file keeps config outside the command.
lang: sh
```
docker run -d --name pg -p 5432:5432 --env-file .env.db \
  -v pgdata:/var/lib/postgresql/data postgres:16-alpine

docker exec pg psql -U dev app -c "CREATE TABLE t (x int); INSERT INTO t VALUES (42);"
docker rm -f pg
docker run -d --name pg -p 5432:5432 --env-file .env.db \
  -v pgdata:/var/lib/postgresql/data postgres:16-alpine
docker exec pg psql -U dev app -tAc "SELECT x FROM t"   # 42: the data survived

# .env.db
# POSTGRES_USER=dev
# POSTGRES_PASSWORD=dev
# POSTGRES_DB=app
```

## Containerised Dependencies
what: Point a project at a database running in Docker instead of on your machine.
lang: sh
```
docker run -d --name pg -p 5432:5432 --env-file .env.db -v pgdata:/var/lib/postgresql/data postgres:16-alpine

# Journal API on Postgres: provider = "postgresql" in schema.prisma, then
export JOURNAL_DATABASE_URL="postgresql://dev:dev@localhost:5432/app"
npx prisma db push --schema 08-journal-crud/prisma/schema.prisma
```

## Basic Dockerfile
what: A Dockerfile is the recipe that turns your code into an image.
lang: docker
code: projects/04-url-shortener/Dockerfile#Basic Dockerfile

## Build & Run
what: Build the image once, then run it anywhere with ports and config passed in.
lang: sh
```
cd projects
docker build -f 04-url-shortener/Dockerfile -t url-shortener .
docker run -d --name url -p 5000:5000 url-shortener

curl -X POST localhost:5000/shorturls \
  -H "Content-Type: application/json" -d '{"url":"https://example.com","shortcode":"demo1"}'
curl -i localhost:5000/demo1     # 302 Location: https://example.com
```

## Containerise the URL Shortener
what: Your Day 2 service, packaged so anyone can run it with one command.
lang: yaml
code: .github/workflows/projects.yml#Containerise the URL Shortener

## Multi-Stage Build
what: Install in one stage, copy only what runs into a clean final stage.
lang: docker
code: projects/Dockerfile#Multi-Stage Build

## Run Safely
what: Run as a normal user and let Docker check that the app is actually healthy.
lang: docker
code: projects/Dockerfile#Run Safely

## Slim the Stock Service Image
what: The same Dockerfile for any service: pick it with a build arg.
lang: yaml
code: .github/workflows/projects.yml#Slim the Stock Service Image

## compose.yaml Basics
what: Compose describes several containers in one file and starts them together.
lang: yaml
```
services:
  testserver:
    image: golang:1.22-alpine
    command: go run main.go
  numbers:
    build: { context: ., args: { SERVICE: 01-number-management } }
    ports: ["8008:8008"]
# inside the network, "testserver" is the hostname: http://testserver:8090
```

## Startup Order
what: Health checks plus depends_on make a service wait until what it needs is ready.
lang: yaml
```
services:
  testserver:
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8090/primes"]
      interval: 5s
      retries: 30
  numbers:
    depends_on:
      testserver: { condition: service_healthy }
# docker compose up --wait   returns once every service is healthy
```

## Compose Numbers + Test Server
what: Your Day 1 service and its Go test server, both started by docker compose up.
lang: yaml
code: projects/compose.numbers.yaml#Compose Numbers + Test Server

## Multi-Service Compose
what: One block per microservice, a mock upstream, and Redis with a named volume.
lang: yaml
code: projects/compose.day6.yaml#Multi-Service Compose

## Networks & Secrets
what: Keep internal services off the host network, and keep secrets out of the image.
lang: yaml
code: projects/compose.day6.yaml#Networks & Secrets

## Compose the Day 6 Services
what: Both services up, healthy, and answering through their published ports.
lang: yaml
code: .github/workflows/projects.yml#Compose the Day 6 Services

## CI Builds
what: CI runs your tests and builds your images on every push.
lang: yaml
code: .github/workflows/projects.yml#CI Builds

## Registry
what: A registry stores your images so any server can pull them.
lang: sh
```
echo $GITHUB_TOKEN | docker login ghcr.io -u <user> --password-stdin

SHA=$(git rev-parse --short HEAD)
docker build -f 04-url-shortener/Dockerfile -t ghcr.io/<user>/url-shortener:$SHA .
docker push ghcr.io/<user>/url-shortener:$SHA
```

## Run on a Server
what: On the server, pull the new images and restart, using the same compose file.
lang: sh
```
ssh deploy@my-server <<'EOF'
  cd /srv/app
  export TAG=<commit-sha>
  docker compose pull
  docker compose up -d --wait
  docker image prune -f
EOF
```

## CI/CD for Your Services
what: Push, and the tests, image builds and container checks run on their own.
lang: yaml
code: .github/workflows/projects.yml#CI Builds

## Rounds & Time Limits
what: What happens between applying and the offer, with the clock for each step.
lang: text
```
1. Resume shortlist
2. Practical task, timed
     backend or frontend  ~90 min (some drives 2 h)
     full stack           ~3 h
     public GitHub repo named with your roll number, screenshots of every API
3. Technical interview(s), about 1 h each
     a deep dive into YOUR submission + backend / JS concepts + SQL
     sometimes a live machine-coding task (e.g. Journal CRUD in 30 min)
4. HR / final round
```

## Register & Get a Token
what: Register once, keep the credentials, then trade them for a Bearer token on every run.
lang: js
code: projects/03-logging-middleware/logger.test.js#Register & Get a Token

## Read the PDF Like a Spec
what: Turn every sentence of the question into a checklist item before writing code.
lang: text
```
"exposes GET /numbers/{numberid}"      -> route + 400 for other ids
"window size 10"                       -> config value, test with 11 numbers
"ignore responses over 500 ms"         -> AbortSignal / Promise.race + test
"respond within 500 ms"                -> one deadline for the whole request
"must use the logging middleware"      -> Log() in every handler, no console.log
"port 9876"                            -> PORT default 9876
field names (windowPrevState, avg ...) -> copy them exactly
```

## Caching Strategy
what: Cache what is slow or paid, for as long as it may be stale; Redis when you run many instances.
lang: js
code: projects/shared/cache.js#Cache with TTL

## Tokens & Secrets
what: Credentials come from the environment and never from the code, the repo or the browser.
lang: js
code: projects/shared/server.js#Tokens & Secrets

## Event Loop Order
what: Node runs sync code, then nextTick, then promises, then the event-loop phases.
lang: js
code: projects/interview/event-loop.cjs#Event Loop Order

## Parallel Awaits
what: Awaiting one by one adds the times up; Promise.all waits for the slowest only.
lang: js
code: projects/interview/concepts.test.js#Parallel Awaits

## Hoisting & TDZ
what: var is hoisted as undefined; let and const exist but throw until their line runs.
lang: js
code: projects/interview/concepts.test.js#Hoisting & TDZ

## SQL Round
what: The queries asked most: MIN/MAX, second highest, JOINs, GROUP BY + HAVING, top per group.
lang: js
code: projects/interview/concepts.test.js#SQL Round

## Query Tuning
what: Read the plan: SEARCH with an index is good, SCAN plus TEMP B-TREE means add an index.
lang: js
code: projects/09-campus-notifications/stages.test.js#Query Tuning

## Defend Your Submission
what: Expect to explain every line you submitted; rehearse with your own repo open.
lang: text
```
For each project, answer out loud in under a minute:
  1. Draw the request flow: client -> your service -> test server -> back
  2. Point to the timeout, the cache and the token refresh in the code
  3. Big-O of your core algorithm (merge, heap, knapsack, sort)
  4. What breaks at 100x data or 10 instances, and the fix
  5. Run one test and say what it proves
```
