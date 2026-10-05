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
|  | `Test server behaviour` | Port 8090. Every call waits a random 0-550 ms, and about 10% of calls return 503 |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/numbers?url=<u1>&url=<u2>...` | { "numbers": [merged unique integers] } |

**Requirements**

- The "url" query param can appear more than once
- Only fetch urls that are syntactically valid
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
```

### Project 03: Logging Middleware

*Day 2 · Logging, Tokens & Links · 2h*

A reusable Log(stack, level, package, message) function that sends every log to the test server. Every later project must use it.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| POST | `/register` | Body { email, name, mobileNo, githubUsername, rollNo, accessCode } -> clientID, clientSecret (shown once) |
| POST | `/auth` | Body { email, name, rollNo, accessCode, clientID, clientSecret } -> { token_type: "Bearer", access_token, expires_in } |
| POST | `/logs` | Bearer. Body { stack, level, package, message } -> { logID, message: "log created successfully" } |

**Requirements**

- stack: "backend" | "frontend"
- level: "debug" | "info" | "warn" | "error" | "fatal"
- package (backend only): cache, controller, cron_job, db, domain, handler, repository, route, service
- package (frontend only): api, component, hook, page, state, style
- package (both): auth, config, middleware, utils
- All values must be lowercase and from these lists
- Register once with your college email, roll number and the emailed access code
- Lives in its own Logging Middleware folder and is reused by every project
- Log significant events through Log(), never console.log

**Sample**

```
Log("backend", "error", "handler", "received string, expected bool")
Log("backend", "fatal", "db", "Critical database connection failure.")
-> { "logID": "a4aad02e-...", "message": "log created successfully" }
```

### Project 04: URL Shortener Microservice

*Day 2 · Logging, Tokens & Links · 2h 30m*

Shorten URLs with an expiry and optional custom code, redirect, and report click statistics.

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/shorturls` | Body { url, validity?, shortcode? } -> 201 { shortLink, expiry } |
| GET | `/shorturls/:shortcode` | Stats: original URL, created, expiry, total clicks, click details |
| GET | `/:shortcode` | Redirect to the original URL |

**Requirements**

- validity is in minutes and defaults to 30
- shortcode is optional and alphanumeric. If missing, generate a unique one
- Every shortcode must be unique
- expiry is an ISO 8601 timestamp
- Each click records timestamp, referrer and a coarse location
- Proper status codes and JSON errors: bad input, taken code, unknown or expired link
- Use your Logging Middleware for every significant event, no console.log
- Folders: Logging Middleware / Backend Test Submission (/ Frontend Test Submission on full stack)

**Sample**

```
POST /shorturls
{ "url": "https://example.com/very/long/path", "validity": 30, "shortcode": "abcd1" }
201 { "shortLink": "http://localhost:5000/abcd1", "expiry": "2026-01-01T00:30:00Z" }
```

### Project 05: Average Calculator Microservice

*Day 3 · Aggregator Services · 2h*

Keep a sliding window of unique numbers fetched from the test server and return its average.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/primes` | Bearer. { "numbers": [2, 3, 5, 7, 11, ...] } |
| GET | `/fibo` | Bearer. { "numbers": [1, 2, 3, 5, 8, 13, ...] } |
| GET | `/even` | Bearer. { "numbers": [2, 4, 6, 8, ...] } |
| GET | `/rand` | Bearer. { "numbers": [random ints] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/numbers/:numberid` | numberid: p = prime, f = fibonacci, e = even, r = random (port 9876) |

**Requirements**

- Only accept the qualified ids p, f, e, r
- Window size is configurable, e.g. 10
- Fetch from the test server only. Do not generate numbers yourself
- Stored numbers are unique: ignore duplicates
- Ignore responses slower than 500 ms or with errors
- Fewer numbers than the window: average what you have
- Window full: replace the oldest number with the newest
- Respond with the window before and after this call, the fetched numbers and the average
- Responses must never take longer than 500 ms

**Sample**

```
GET http://localhost:9876/numbers/e
{
  "windowPrevState": [],
  "windowCurrState": [2, 4, 6, 8],
  "numbers": [2, 4, 6, 8],
  "avg": 5.00
}
```

### Project 06: Top Products Microservice

*Day 3 · Aggregator Services · 2h 30m*

Show the top N products in a category and price range across 5 e-commerce companies.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/companies/:company/categories/:category/products?top=n&minPrice=p&maxPrice=q` | Bearer. [{ productName, price, rating, discount, availability }] |
|  | `Companies` | AMZ, FLP, SNP, MYN, AZO |
|  | `Categories` | Phone, Computer, TV, Earphone, Tablet, Charger, Mouse, Keypad, Bluetooth, Pendrive, Remote, Speaker, Headset, Laptop, PC |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/categories/:categoryname/products?n=&page=&minPrice=&maxPrice=&sortBy=&order=` | Top n products across all companies |
| GET | `/categories/:categoryname/products/:productid` | Details of one product |

**Requirements**

- Query all 5 companies and merge the results
- Sort by rating, price, company or discount, asc or desc
- n > 10: paginate with page
- The upstream has no ids: generate a unique id per product
- Respect the price range
- Keep paid upstream calls low: cache

### Project 07: Stock Price Aggregation

*Day 3 · Aggregator Services · 2h 30m*

Average price of a stock over the last m minutes, and the correlation between two stocks.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/stocks` | Bearer. { "stocks": { "Nvidia Corporation": "NVDA", "PayPal Holdings, Inc.": "PYPL", ... } } |
| GET | `/stocks/:ticker` | Bearer. { "stock": { "price", "lastUpdatedAt" } } |
| GET | `/stocks/:ticker?minutes=m` | Bearer. [{ "price", "lastUpdatedAt" }, ...] |

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
- API calls are rate limited and cost money: cache

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

### Project 08: User Management Service

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

### Project 09: Journal CRUD API

*Day 4 · Database & Auth · 30m*

Live machine-coding round: journal CRUD APIs in 30 minutes, any stack.

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

### Project 10: Social Media Analytics

*Day 5 · Snapshots & Schedules · 2h 30m*

Real-time analytics for business: top users and popular / latest posts, with as few paid test-server calls as possible.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/users` | Bearer. { "users": { "1": "John Doe", "2": "Jane Doe", ... } } |
| GET | `/users/:userid/posts` | Bearer. { "posts": [{ "id", "userid", "content" }] } |
| GET | `/posts/:postid/comments` | Bearer. { "comments": [{ "id", "postid", "content" }] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/users` | Top 5 users with the most posts |
| GET | `/posts?type=popular` | Post(s) with the most comments (all ties) |
| GET | `/posts?type=latest` | Latest 5 posts, newest first |

**Requirements**

- type is required: popular or latest
- Calls to the test server cost money: keep them to a minimum
- Data is unsorted, large, and changes over time
- Use caching and efficient data structures

### Project 11: Train Schedule Service

*Day 5 · Snapshots & Schedules · 2h 30m*

Register with a railway API and show trains departing in the next 12 hours, with seats and prices.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| POST | `/register` | Body { companyName, ownerName, rollNo, ownerEmail, accessCode } -> clientID, clientSecret (fetch once, save them) |
| POST | `/auth` | Body { companyName, clientID, ownerName, ownerEmail, rollNo, clientSecret } -> { token_type, access_token, expires_in } |
| GET | `/trains` | Bearer. [{ trainName, trainNumber, departureTime: { Hours, Minutes, Seconds }, seatsAvailable: { sleeper, AC }, price: { sleeper, AC }, delayedBy }] |
| GET | `/trains/:trainNumber` | Bearer. One train |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/trains` | Trains in the next 12 hours, sorted |
| GET | `/trains/:trainNumber` | One train with seats and prices |

**Requirements**

- Users view schedules from your server without registering
- Ignore trains departing in the next 30 minutes
- Apply delays: a delayed train can move into the window
- Sort: price ascending, then tickets descending, then departure (after delay) descending
- Prices and seats change with demand: sort on current values
- Railway API calls are charged: minimise them

### Project 12: Campus Notifications Microservice

*Day 6 · Notifications & Algorithms · 4h*

Students get Placement, Result and Event notifications. A staged paper: design the API and data, tune queries, scale it, then build a priority inbox.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/notifications?limit=&page=&notification_type=` | Bearer. { "notifications": [{ "ID", "Type", "Message", "Timestamp": "YYYY-MM-DD HH:MM:SS" }] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| POST | `/api/notifications` | Stage 1: create |
| GET | `/api/students/:id/notifications?page=&limit=` | Stage 1: list |
| GET | `/api/students/:id/notifications/unread` | Stage 1: unread |
| PATCH | `/api/students/:id/notifications/:nid/read` | Stage 1: mark one read |
| PATCH | `/api/students/:id/notifications/read-all` | Stage 1: mark all read |
| GET | `/priority-inbox?n=10` | Stage 6: top n unread |

**Requirements**

- Stage 1: REST API + JSON schemas, and real-time delivery (WebSocket / SSE)
- Stage 2: choose SQL or NoSQL, schema, indexes, scaling
- Stage 3: speed up "unread for student 1042, newest first"; why not index every column
- Stage 4: page loads overload the DB: cache (Redis), paginate, push updates
- Stage 5: notify 50,000 students reliably when email fails halfway
- Stage 6: priority inbox: Placement > Result > Event, then newest, heap of size n
- Repo: logging_middleware / notification_app_be / notification_system_design.md

**Sample**

```
GET /priority-inbox?n=2
{
  "count": 2,
  "notifications": [
    { "id": "d146...", "type": "Placement", "message": "CSX Corporation hiring" },
    { "id": "b283...", "type": "Result", "message": "mid-sem" }
  ]
}
```

### Project 13: Vehicle Maintenance Scheduler

*Day 6 · Notifications & Algorithms · 2h 30m*

Pick the maintenance tasks that give the most impact within each depot's mechanic-hour budget.

**Mock upstream (build this too)**

| Method | Path | Returns |
|---|---|---|
| GET | `/depots` | Bearer. { "depots": [{ "ID": 1, "MechanicHours": 60 }] } |
| GET | `/vehicles` | Bearer. { "vehicles": [{ "TaskID": "...", "Duration": 5, "Impact": 8 }] } |

**Your endpoints**

| Method | Path | Returns |
|---|---|---|
| GET | `/schedule-maintenance` | Best task set for every depot |
| GET | `/schedule-maintenance?depotId=1` | Best task set for one depot |

**Requirements**

- Each task is picked at most once (0/1 knapsack)
- Total Duration must be <= MechanicHours
- Maximise total Impact
- The depot list can change between calls: fetch fresh
- Use your Logging Middleware throughout

**Sample**

```
GET /schedule-maintenance?depotId=1
{
  "depotID": 1, "mechanicHours": 10,
  "selectedTaskIDs": ["t2", "t4"],
  "totalDuration": 7, "totalImpact": 90
}
```

### Project 14: Mock Round: 90-Minute Backend Test

*Day 7 · Test & Mock Rounds · 1h 30m*

Pick one Day 3 or Day 5 question you have not redone and build it from an empty repo in 90 minutes.

**Requirements**

- Fresh public repo named with your roll number
- Logging Middleware folder + the service folder
- Every rule of the question met, screenshots in the README
- Stop at 90 minutes and note what is missing

### Project 15: Mock Round: 3-Hour Full Stack

*Day 7 · Test & Mock Rounds · 3h*

Logging Middleware + URL Shortener backend + a React/MUI page that uses it, in 3 hours.

**Requirements**

- Folders: Logging Middleware / Backend Test Submission / Frontend Test Submission
- Frontend on http://localhost:3000, Material UI
- No copying from your earlier code

### Project 16: Mock Round: Journal CRUD in 30 Minutes

*Day 7 · Test & Mock Rounds · 30m*

Redo the Journal CRUD API with a timer running, explaining your choices out loud.

**Requirements**

- Start from an empty folder
- All CRUD operations + filters by date and mood
- Done when every endpoint works in Postman

## Containers Track

### Project C1: Containerised Dependencies

*Box 1 · Run Things in Docker · 45m*

Run the databases your projects need in Docker, no local installs.

**Requirements**

- Switch User Management or Journal API to Postgres in Docker
- Data survives docker rm thanks to a named volume

### Project C2: Containerise the URL Shortener

*Box 2 · Your First Dockerfile · 45m*

Ship the URL Shortener as an image anyone can run.

**Requirements**

- docker run starts it with no other setup
- Config only through environment variables
- POST /shorturls and the redirect work from the container

### Project C3: Slim the Stock Service Image

*Box 3 · Better Images · 45m*

Build Stock Price Aggregation with the multi-stage Dockerfile.

**Requirements**

- Runs as the node user, not root
- docker inspect shows the container as healthy

### Project C4: Compose Numbers + Test Server

*Box 4 · Docker Compose · 1h*

Run the Number Management Service next to its Go test server.

**Requirements**

- Test server runs testserver.go in golang:1.22-alpine
- numbers waits until the test server is healthy
- docker compose up --wait, then curl /numbers

### Project C5: Compose the Day 6 Services

*Box 5 · Compose Many Services · 1h 30m*

Run Campus Notifications and the Vehicle Scheduler together with docker compose up.

**Requirements**

- Each service healthy before traffic
- Only the services you call publish ports

### Project C6: CI/CD for Your Services

*Box 6 · CI/CD · 1h 30m*

Every push runs tests, builds the images and checks they start healthy.

**Requirements**

- Tests run before any image is built
- Each compose stack comes up with --wait
- Add a push-to-registry job once tests are green

## Interview Track

### PREP 1: Defend Your Submission

*Prep 3 · SQL Round · 1h*

The technical interview is a deep dive into the code you submitted. Rehearse these answers against your own repo.

**Requirements**

- Why this timeout value, and what happens when every upstream is slow?
- Where do you cache, for how long, and how do you invalidate?
- How do you refresh an expired token without failing the request?
- What is the time complexity of your sort / heap / knapsack?
- How would this work with 100x the data or 10 instances?
- Why these status codes and this route design?
- Where are your secrets, and why not in the repo?
- Walk through one test: what does it prove?
