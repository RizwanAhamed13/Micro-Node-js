# Projects

Every project from the roadmap with its full spec. Where a project lists a mock upstream, build that small server first, then build the service against it.

## Microservices Track

### Project 01: Number Merge Service

*Day 1 · Express Fast Start · 1h 30m*

Merge integer lists from many URLs and always answer within 500 ms.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/primes` | { "numbers": [2, 3, 5, 7, 11, 13] } |
| GET | `/fibo` | { "numbers": [1, 2, 3, 5, 8, 13, 21] } |
| GET | `/odd` | { "numbers": [1, 3, 5, 7, 9, 11] } |
| GET | `/rand` | { "numbers": [random ints] }, add a random 0-800 ms delay |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/numbers?url=<u1>&url=<u2>...` | Merged, unique, ascending integers |

**Requirements**

- Ignore every url that is not a valid http(s) URL
- Call all urls in parallel
- Drop any url that has not answered within 500 ms
- Merge all arrays, remove duplicates, sort ascending
- Whole response must return in under 500 ms, even if every url fails
- If nothing usable came back, return { "numbers": [] }

**Sample**

```
GET /numbers?url=http://localhost:8090/primes
             &url=http://localhost:8090/fibo
             &url=http://localhost:8090/odd
{ "numbers": [1, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 21, 23] }
```

### Project 02: Average Calculator Microservice

*Day 1 · Express Fast Start · 2h*

Keep a sliding window of unique numbers from an upstream API and return its average.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/test/primes` | { "numbers": [2, 3, 5, 7, 11] } |
| GET | `/test/fibo` | { "numbers": [1, 2, 3, 5, 8, 13] } |
| GET | `/test/even` | { "numbers": [2, 4, 6, 8, 10] } |
| GET | `/test/rand` | { "numbers": [random ints] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/numbers/:numberid` | numberid: p = prime, f = fibonacci, e = even, r = random |

**Requirements**

- Window size is 10 (read from config)
- Store only unique numbers in the window
- When the window is full, drop the oldest numbers first
- Ignore upstream responses slower than 500 ms or failed: window stays the same
- avg = average of the current window, 2 decimal places
- Invalid numberid returns 400 with a JSON error
- Respond in under 500 ms

**Sample**

```
GET /numbers/e
{
  "windowPrevState": [],
  "windowCurrState": [2, 4, 6, 8],
  "numbers": [2, 4, 6, 8],
  "avg": 5.00
}
```

### Project 03: Logging Middleware + Log Service

*Day 2 · Logging, Tokens & Links · 2h 30m*

Build a log service and a reusable Log(stack, level, package, message) function every project uses.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/register` | Body { email, name, rollNo, accessCode } -> { clientID, clientSecret } |
| POST | `/auth` | Body { email, name, rollNo, accessCode, clientID, clientSecret } -> { token_type: "Bearer", access_token, expires_in } |
| POST | `/logs` | Bearer token. Body { stack, level, package, message } -> 201 { logID, message: "log created successfully" } |
| GET | `/logs?level=&package=&stack=` | Bearer token. Filtered logs, newest first |

**Requirements**

- stack: "backend" | "frontend"
- level: "debug" | "info" | "warn" | "error" | "fatal"
- package (backend only): cache, controller, cron_job, db, domain, handler, repository, route, service
- package (frontend only): api, component, hook, page, state, style
- package (both): auth, config, middleware, utils
- All values lowercase. Anything else returns 400
- Log() sends the token, caches it, re-auths on 401, never throws
- Express middleware logs every request: method, path, status, duration
- No console.log in app code. Every log goes through Log()

**Sample**

```
Log("backend", "error", "handler", "received string, expected bool")
Log("backend", "fatal", "db", "Critical database connection failure.")
-> 201 { "logID": "a4aad02e-...", "message": "log created successfully" }
```

### Project 04: URL Shortener Microservice

*Day 2 · Logging, Tokens & Links · 2h 30m*

Shorten URLs with expiry and custom codes, redirect, and track click stats.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/shorturls` | Body { url, validity?, shortcode? } -> 201 { shortLink, expiry } |
| GET | `/:shortcode` | 302 redirect to the original URL |
| GET | `/shorturls/:shortcode` | Stats: url, createdAt, expiry, totalClicks, clicks[] |

**Requirements**

- validity is in minutes, default 30
- shortcode is optional, alphanumeric, 4-20 chars, must be unique
- If no shortcode is given, generate a unique one
- Shortcode already taken returns 409
- Invalid url returns 400
- Unknown code returns 404, expired code returns 410
- Each click stores timestamp, referrer and a coarse location (or "unknown")
- All logging through the logger package from the previous project

**Sample**

```
POST /shorturls
{ "url": "https://example.com/very/long/path", "validity": 30, "shortcode": "abcd1" }
201 { "shortLink": "http://localhost:5000/abcd1", "expiry": "2026-01-01T00:30:00Z" }
```

### Project 05: Top Products Aggregator

*Day 3 · Aggregator Services · 2h 30m*

Show the top N products in a category and price range across 5 e-commerce companies.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/companies/:company/categories/:category/products?top=n&minPrice=p&maxPrice=q` | [{ productName, price, rating, discount, availability }] |
|  | `Companies` | AMZ, FLP, SNP, MYN, AZO |
|  | `Categories` | Phone, Computer, TV, Earphone, Tablet, Charger, Mouse, Keypad, Bluetooth, Pendrive, Remote, Speaker, Headset, Laptop, PC |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/categories/:categoryname/products?n=&page=&minPrice=&maxPrice=&sortBy=&order=` | Top n products across all companies |
| GET | `/categories/:categoryname/products/:productid` | Details of one product |

**Requirements**

- Call all 5 companies in parallel
- sortBy: rating | price | company | discount, order: asc | desc
- If n > 10, paginate with page (10 per page)
- Give every product a stable unique id (the upstream has none)
- Every product includes its company name
- Cache upstream responses for 60 s
- Invalid category or query values return 400

**Sample**

```
GET /categories/Laptop/products?n=2&minPrice=1&maxPrice=10000&sortBy=price&order=asc
[
  { "id": "9f1c...", "productName": "Laptop 13", "company": "SNP",
    "price": 2236, "rating": 4.7, "discount": 63, "availability": "yes" },
  { "id": "1a2b...", "productName": "Laptop 1", "company": "AMZ",
    "price": 2652, "rating": 4.6, "discount": 21, "availability": "yes" }
]
```

### Project 06: Stock Price Aggregator

*Day 3 · Aggregator Services · 2h 30m*

Average price over the last m minutes, and the correlation between two stocks.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/stocks` | { "stocks": { "Nvidia Corporation": "NVDA", "PayPal Holdings, Inc.": "PYPL", ... } } |
| GET | `/stocks/:ticker` | { "stock": { "price": 666.66, "lastUpdatedAt": "..." } } |
| GET | `/stocks/:ticker?minutes=m` | [{ "price": 231.95, "lastUpdatedAt": "..." }, ...] |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/stocks/:ticker?minutes=m&aggregation=average` | { averageStockPrice, priceHistory[] } |
| GET | `/stockcorrelation?minutes=m&ticker=NVDA&ticker=PYPL` | { correlation, stocks: { NVDA: {...}, PYPL: {...} } } |

**Requirements**

- Correlation is Pearson correlation over the same time window
- Align the two price series by timestamp before correlating
- Exactly 2 tickers for correlation, otherwise 400
- Round correlation to 4 decimals
- Upstream calls are costly: cache price history and reuse it
- Unknown ticker returns 404

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
```

### Project 07: Social Media Analytics

*Day 4 · Database & Auth · 2h 30m*

Top users and popular / latest posts, answered fast from your own cache.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/users` | { "users": { "1": "John Doe", "2": "Jane Doe", ... } } |
| GET | `/users/:userid/posts` | { "posts": [{ "id": 246, "userid": 1, "content": "Post about ant" }] } |
| GET | `/posts/:postid/comments` | { "comments": [{ "id": 3893, "postid": 150, "content": "Old comment" }] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/users` | Top 5 users with the most posts |
| GET | `/posts?type=popular` | Post(s) with the most comments (return all ties) |
| GET | `/posts?type=latest` | Latest 5 posts |

**Requirements**

- Upstream is slow and costly: keep calls to a minimum
- Sync users, posts and comment counts into your store in the background
- Serve every request from your store, not live upstream calls
- Post ids increase over time: latest = highest id
- type other than popular | latest returns 400

**Sample**

```
GET /users
[ { "id": "7", "name": "Ava", "postCount": 42 }, ... 5 items ]
```

### Project 08: Train Schedule Service

*Day 4 · Database & Auth · 2h 30m*

Register with a railway API, pull trains with a token, and list the best trains for the next 12 hours.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| POST | `/register` | Body { companyName, ownerName, rollNo, ownerEmail, accessCode } -> { companyName, clientID, clientSecret } |
| POST | `/auth` | Body { companyName, clientID, clientSecret, ownerName, ownerEmail, rollNo } -> { token_type, access_token, expires_in } |
| GET | `/trains` | Bearer. [{ trainName, trainNumber, departureTime: { Hours, Minutes, Seconds }, seatsAvailable: { sleeper, AC }, price: { sleeper, AC }, delayedBy }] |
| GET | `/trains/:trainNumber` | Bearer. One train |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/trains` | Trains departing in the next 12 hours, sorted |
| GET | `/trains/:trainNumber` | One train with seats and prices |

**Requirements**

- Add delayedBy (minutes) to the departure time first
- Skip trains departing in the next 30 minutes
- Sort: price ascending, then seats available descending, then departure time descending
- Re-auth automatically when the token expires
- Store trains in the DB, refresh with a sync job every minute

### Project 09: Notifications Priority Inbox

*Day 5 · Multi-Service Systems · 3h*

A notification service plus an inbox service that always returns the most important unread notifications first.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/notifications` | Body { studentId, type, message } -> 201 notification |
| GET | `/notifications?type=&page=&limit=` | Paged list for the logged-in student |
| PATCH | `/notifications/:id/read` | Mark as read |
| GET | `/priority-inbox?n=10` | Top n unread, most important first |

**Requirements**

- Notification: { ID, Type: Placement | Result | Event, Message, Timestamp, isRead }
- Priority weight: Placement > Result > Event, then newest first
- Use a heap of size n, not a full sort
- notifications-service publishes notification.created on Redis
- inbox-service subscribes and updates its inbox instantly
- Gateway routes /api/notifications/* and /api/inbox/*
- Every service logs through the logger package

**Sample**

```
GET /api/inbox/priority-inbox?n=2
[
  { "ID": "d146...", "Type": "Placement", "Message": "CSX Corporation hiring",
    "Timestamp": "2026-04-22 17:51:30" },
  { "ID": "b283...", "Type": "Result", "Message": "mid-sem",
    "Timestamp": "2026-04-22 17:51:18" }
]
```

### Project 10: Vehicle Maintenance Scheduler

*Day 5 · Multi-Service Systems · 2h 30m*

For each depot, pick the maintenance tasks that give the most impact within its mechanic-hour budget.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/depots` | { "depots": [{ "ID": 1, "MechanicHours": 60 }, ...] } |
| GET | `/vehicles` | { "vehicles": [{ "TaskID": "t-1", "Duration": 5, "Impact": 8 }, ...] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/schedule` | Best task set for every depot |
| GET | `/schedule/:depotId` | Best task set for one depot |

**Requirements**

- Each task is picked once or not at all (0/1 knapsack)
- Total Duration must be <= the depot MechanicHours
- Maximise total Impact
- Run the DP in a worker thread so the server stays responsive
- Cache results until the upstream data changes
- Unknown depot returns 404

**Sample**

```
GET /schedule/1
{
  "depotId": 1, "mechanicHours": 60, "totalDuration": 58, "totalImpact": 91,
  "tasks": ["t-3", "t-7", "t-12"]
}
```

### Project 11: Capstone: Mini Platform

*Day 6 · Test & Ship · 4h*

Join your projects into one platform behind a gateway, wired with events and tests.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/api/auth/signup` | auth-service: create user, return JWT |
| POST | `/api/auth/login` | auth-service: return JWT |
| POST | `/api/urls` | url-service: create a short link (JWT required) |
| GET | `/api/urls/:code/stats` | url-service: stats for your own link |
| GET | `/:code` | url-service: redirect |
| GET | `/api/inbox/priority-inbox?n=10` | inbox-service: your notifications |

**Requirements**

- Services: gateway, auth, url, notifications, inbox, log
- When a link reaches 10 clicks, url-service publishes link.milestone
- notifications-service turns it into an Event notification for the owner
- Users can only see their own links and notifications
- Every service: /health, graceful shutdown, logger package, tests
- npm run dev starts the whole platform

## Containers Track

### Project C1: Containerised Dependencies

*Box 1 · Run Things in Docker · 45m*

Run the Postgres and Redis your projects need in Docker, no local installs.

**Requirements**

- Social Media Analytics and the Notifications Inbox use Redis in Docker
- Train Schedule Service uses Postgres in Docker
- Data survives docker rm thanks to a named volume

### Project C2: Containerise the URL Shortener

*Box 2 · Your First Dockerfile · 45m*

Ship the URL shortener as an image anyone can run.

**Requirements**

- docker run starts it with no other setup
- Config only through environment variables
- Redirects and stats work from the container

### Project C3: Slim the Aggregator Image

*Box 3 · Better Images · 45m*

Get the Top Products Aggregator image under 150 MB.

**Requirements**

- Multi-stage Dockerfile, final stage on node:22-alpine
- Runs as a non-root user
- docker ps shows the container as healthy

### Project C4: Compose the Aggregators

*Box 4 · Docker Compose · 1h*

Run the Top Products Aggregator with all 5 mock company services in compose.

**Requirements**

- 6 containers: aggregator + 5 mock companies
- Aggregator finds the mocks by service name
- docker compose up and the API works

### Project C5: Capstone in Compose

*Box 5 · Compose the Platform · 1h 30m*

Run the Mini Platform with docker compose up.

**Requirements**

- Only the gateway is reachable from the host
- Every service healthy before the gateway starts
- Data survives docker compose down (without -v)

### Project C6: CI/CD for the Platform

*Box 6 · Push & Deploy · 1h 30m*

Every push to main builds, pushes and deploys your images.

**Requirements**

- Tests run before any image is built
- Each service image is pushed with the commit SHA tag
- The server pulls and restarts with zero manual steps
