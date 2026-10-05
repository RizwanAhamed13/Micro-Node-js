# Projects

Every project from the roadmap with its full spec. Where a project lists a mock upstream, build that small server first, then build the service against it.

## Microservices Track

### Project 01: Number Management Service

*Day 1 · Express Fast Start · 1h 30m*

Merge integer lists from many URLs and always answer within 500 ms.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/primes` | { "numbers": [2, 3, 5, 7, 11, 13] } |
| GET | `/fibo` | { "numbers": [1, 1, 2, 3, 5, 8, 13, 21] } |
| GET | `/odd` | { "numbers": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] } |
| GET | `/rand` | { "numbers": [5, 17, 3, 19, 76, 24, 1, 5, 10, 34, 8, 27, 7] } |
|  | `Test server behaviour` | Runs on port 8090. Every call waits a random 0-550 ms, and about 10% of calls return 503 |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/numbers?url=<u1>&url=<u2>...` | { "numbers": [merged unique integers] } |

**Requirements**

- The "url" query param can appear more than once
- Only fetch urls that are syntactically valid
- Collect the response from each valid url
- Merge all integers, sort ascending, each integer appears only once
- Return as quickly as possible, never later than 500 ms
- If a url takes too long, ignore it. The timeout holds regardless of data size
- Attach a Postman / Insomnia screenshot with response body and timing

**Sample**

```
GET /numbers?url=http://localhost:8090/primes
             &url=http://localhost:8090/fibo
             &url=http://localhost:8090/odd
{ "numbers": [1, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 21, 23] }
```

### Project 02: Prefix Management Service

*Day 1 · Express Fast Start · 1h 15m*

For each keyword, say whether it exists and return the shortest prefix that uniquely identifies it.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/prefixes?keywords=bonfire,bool` | One result per keyword |

**Requirements**

- Hardcode about 20 words on the server, e.g. [bonfire, cardio, case, character, bonsai, ...]
- keywords is one comma-separated query param
- Found: status "found" and the smallest unique prefix of that word
- Not found: status "not_found" and prefix "not_applicable"
- Attach a Postman / Insomnia screenshot with the response body

**Sample**

```
GET /prefixes?keywords=bonfire,bool
[
  { "keyword": "bonfire", "status": "found", "prefix": "bonf" },
  { "keyword": "bool", "status": "not_found", "prefix": "not_applicable" }
]

GET /prefixes?keywords=bonfire,bonsai
[
  { "keyword": "bonfire", "status": "found", "prefix": "bonf" },
  { "keyword": "bonsai", "status": "found", "prefix": "bons" }
]
```

### Project 03: Logging Middleware

*Day 2 · Logging, Tokens & Links · 2h*

A reusable Log(stack, level, package, message) function that sends every log to the test server. Every later project must use it.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| POST | `/register` | Body { email, name, mobileNo, githubUsername, rollNo, accessCode } -> clientID, clientSecret |
| POST | `/auth` | Body { email, name, rollNo, accessCode, clientID, clientSecret } -> access_token (Bearer) |
| POST | `/logs` | Bearer token. Body { stack, level, package, message } |

**Requirements**

- stack: "backend" | "frontend"
- level: "debug" | "info" | "warn" | "error" | "fatal"
- package (backend only): cache, controller, cron_job, db, domain, handler, repository, route, service
- package (frontend only): api, component, hook, page, state, style
- package (both): auth, config, middleware, utils
- All values must be lowercase and from these lists
- Lives in its own "Logging Middleware" folder and is reused by the other projects
- Log significant events in your app through Log(), not console.log

**Sample**

```
Log("backend", "error", "handler", "received string, expected bool")
Log("backend", "fatal", "db", "Critical database connection failure.")
```

### Project 04: URL Shortener Microservice

*Day 2 · Logging, Tokens & Links · 2h 30m*

Shorten URLs with an expiry and optional custom code, redirect, and report click statistics.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/shorturls` | Body { url, validity?, shortcode? } -> 201 { shortLink, expiry } |
| GET | `/shorturls/:shortcode` | Statistics for one short link |
| GET | `/:shortcode` | Redirect to the original URL |

**Requirements**

- validity is in minutes and defaults to 30
- shortcode is optional and alphanumeric. If missing, generate a unique one
- Every shortcode must be unique
- expiry is an ISO 8601 timestamp
- Stats: original URL, creation date, expiry, total clicks, and per-click timestamp, referrer and location
- Return proper status codes and JSON errors for bad input, taken codes, unknown or expired links
- Use your Logging Middleware for every significant event
- Folder layout: Logging Middleware / Backend Test Submission

**Sample**

```
POST /shorturls
{ "url": "https://example.com/very/long/path", "validity": 30, "shortcode": "abcd1" }
201 { "shortLink": "http://localhost:5000/abcd1", "expiry": "2026-01-01T00:30:00Z" }
```

### Project 05: Top Products Microservice

*Day 3 · Aggregator Services · 2h 30m*

You have access to the APIs of 5 e-commerce companies. Build a public API that shows the top N products in a category and price range across all of them.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
|  | `Test server` | Register once through a single API to access all 5 companies |
| GET | `Company product APIs` | Top products per company, category and price range |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/categories/:categoryname/products?n=&minPrice=&maxPrice=` | Top n products in that category across all companies |

**Requirements**

- Query all 5 companies and merge the results
- Respect the requested price range
- Return the top n products so users can compare companies
- Meet the API usage and performance limits of the test server

### Project 06: Stock Price Aggregation

*Day 3 · Aggregator Services · 2h 30m*

Average price of a stock over the last m minutes, and the correlation between two stocks.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/stocks` | Bearer. All tickers |
| GET | `/stocks/:ticker` | Bearer. Latest { price, lastUpdatedAt } |
| GET | `/stocks/:ticker?minutes=m` | Bearer. [{ price, lastUpdatedAt }, ...] for the last m minutes |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/stocks/:ticker?minutes=m&aggregation=average` | { averageStockPrice, priceHistory[] } |
| GET | `/stockcorrelation?minutes=m&ticker={T1}&ticker={T2}` | { correlation, stocks: { T1: {...}, T2: {...} } } |

**Requirements**

- Average = mean of all prices in the last m minutes
- Correlation = Pearson correlation of the two price histories
- Prices arrive at different times: pair them by timestamp first
- Exactly 2 tickers for correlation, otherwise 400
- Cache upstream data: API calls are limited

**Sample**

```
GET /stocks/NVDA?minutes=50&aggregation=average
{
  "averageStockPrice": 453.56,
  "priceHistory": [
    { "price": 231.95, "lastUpdatedAt": "2026-05-08T04:26:27.465Z" },
    { "price": 675.17, "lastUpdatedAt": "2026-05-08T04:37:23.825Z" }
  ]
}

GET /stockcorrelation?minutes=50&ticker=NVDA&ticker=PYPL
{
  "correlation": -0.9367,
  "stocks": {
    "NVDA": { "averagePrice": 204.00, "priceHistory": [...] },
    "PYPL": { "averagePrice": 458.60, "priceHistory": [...] }
  }
}
```

### Project 07: User Management Service

*Day 4 · Database & Auth · 2h*

Design and implement a user service with registration, login, profile edit and password change.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/signup` | API 1: register a user |
| POST | `/login` | API 2: log in, return a token |
| PATCH | `/users/me` | API 3: edit your own details |
| PUT | `/users/me/password` | API 4: change your password |

**Requirements**

- User should be able to register
- User should be able to successfully log in
- User should be able to edit their own details
- User should be able to change their password
- Store passwords hashed, never plain text
- Paths are your design: the ones above are a suggestion

**Sample**

```
POST /signup
{ "first_name": "Ava", "last_name": "Rao", "email": "ava@x.com", "password": "..." }

POST /login
{ "email": "ava@x.com", "password": "..." }
```

### Project 08: Journal CRUD API

*Day 4 · Database & Auth · 30m*

Build journal CRUD APIs in 30 minutes, any stack.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/journals` | Create |
| PATCH | `/journals/:id` | Update |
| DELETE | `/journals/:id` | Delete |
| GET | `/journals?date=&mood=` | Retrieve by date and mood |

**Requirements**

- Fields: title, description, tags (list), date, mood
- mood: "neutral" | "happy" | "sad"
- Create, update and delete journals
- Retrieve journals filtered by date and by mood
- Time limit: 30 minutes. Design clean REST endpoints fast

### Project 09: Campus Notifications Microservice

*Day 5 · Multi-Service Systems · 3h*

Students get Placement, Result and Event notifications. Design the notification API, then build a priority inbox.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/notifications` | Bearer. All notifications from the test server |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/api/notifications` | Create a notification |
| GET | `/api/students/:id/notifications?page=&limit=` | All notifications for a student |
| GET | `/api/students/:id/notifications/unread` | Unread notifications |
| PATCH | `/api/students/:id/notifications/:nid/read` | Mark one as read |
| PATCH | `/api/students/:id/notifications/read-all` | Mark all as read |
| GET | `/priority-inbox` | Top 10 unread notifications |

**Requirements**

- Notification types: Placement, Result, Event
- Priority: Placement > Result > Event, then newest first
- Priority inbox returns the top 10 unread notifications
- Use a heap for the top 10, not a full sort
- Write the API design (stage 1) in a markdown file in the repo
- Use your Logging Middleware throughout

### Project 10: Vehicle Maintenance Scheduler

*Day 5 · Multi-Service Systems · 2h 30m*

Pick the maintenance tasks that give the most impact within a depot's mechanic-hour budget.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/depots` | Bearer. { "depots": [{ ..., "MechanicHours": 60 }] } |
| GET | `/vehicles` | Bearer. { "vehicles": [{ "TaskID": "...", "Duration": 5, "Impact": 8 }] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/schedule-maintenance` | Best task set for the depot |

**Requirements**

- Each task is picked at most once (0/1 knapsack)
- Total Duration must be <= MechanicHours
- Maximise total Impact
- Return the chosen TaskIDs, total duration, total impact and mechanic hours
- Use your Logging Middleware throughout

**Sample**

```
GET /schedule-maintenance
{
  "selectedTaskIDs": ["t-3", "t-7", "t-12"],
  "totalDuration": 58,
  "totalImpact": 91,
  "mechanicHours": 60
}
```

### Project 11: Mock Round: 3-Hour Assessment

*Day 6 · Test & Mock Rounds · 3h*

Rebuild the Logging Middleware and URL Shortener from an empty repo in 3 hours.

**Requirements**

- Fresh public repo, folders: Logging Middleware / Backend Test Submission
- No copying from your earlier code
- Every requirement of both projects met
- Screenshots of every API call in the README
- Stop at 3 hours and note what is missing

### Project 12: Mock Round: Journal CRUD in 30 Minutes

*Day 6 · Test & Mock Rounds · 30m*

Redo the Journal CRUD API with a timer running.

**Requirements**

- Start from an empty folder
- All CRUD operations + filters by date and mood
- Done when every endpoint works in Postman

## Containers Track

### Project C1: Containerised Dependencies

*Box 1 · Run Things in Docker · 45m*

Run the databases your projects need in Docker, no local installs.

**Requirements**

- User Management Service and Journal API use Postgres in Docker
- Stock Price Aggregation caches in Redis in Docker
- Data survives docker rm thanks to a named volume

### Project C2: Containerise the URL Shortener

*Box 2 · Your First Dockerfile · 45m*

Ship the URL Shortener as an image anyone can run.

**Requirements**

- docker run starts it with no other setup
- Config only through environment variables
- Redirects and stats work from the container

### Project C3: Slim the Stock Service Image

*Box 3 · Better Images · 45m*

Get the Stock Price Aggregation image under 150 MB.

**Requirements**

- Multi-stage Dockerfile, final stage on node:22-alpine
- Runs as a non-root user
- docker ps shows the container as healthy

### Project C4: Compose Numbers + Test Server

*Box 4 · Docker Compose · 1h*

Run the Number Management Service next to its Go test server in compose.

**Requirements**

- testserver service built from golang:1.22-alpine running testserver.go
- numbers service calls http://testserver:8090/primes etc.
- docker compose up and the 500 ms rule still holds

### Project C5: Compose the Day 5 Services

*Box 5 · Compose Many Services · 1h 30m*

Run Campus Notifications and the Vehicle Scheduler together with docker compose up.

**Requirements**

- Each service in its own container with a healthcheck
- Both use the shared Logging Middleware
- Bearer token and secrets come from env_file

### Project C6: CI/CD for Your Services

*Box 6 · Push & Deploy · 1h 30m*

Every push to main tests, builds, pushes and deploys your images.

**Requirements**

- Tests run before any image is built
- Each service image is pushed with the commit SHA tag
- The server pulls and restarts with zero manual steps
