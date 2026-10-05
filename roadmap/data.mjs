// Node.js microservices: the shortest code-only path, a containers track and an interview track.
// Every project is a real backend assessment question, rebuilt as a spec.
// Steps:    [title, minutes, tasks]
// Projects: { title, min, brief, upstream?, endpoints?, rules, sample? }
// The "what" line and code for each card live in content.md (code comes from projects/, where it is tested).
// Edit here, then run `npm run roadmap`.

export const tracks = [
  {
    name: 'Microservices Track',
    short: 'Day',
    intro: 'Seven days. Learn a step in code, then build the real assessment questions.',
    sections: [
      {
        title: 'Express Fast Start',
        ship: 'Two microservices: one fans out to slow URLs, one answers from memory',
        steps: [
          ['Setup in 10 Minutes', 20, [
            'npm init -y, npm i express',
            '"type": "module", node --watch for reloads',
            'Read PORT from process.env with a default',
          ]],
          ['First Endpoints', 40, [
            'app.get / app.post, res.json(), res.status()',
            'req.params, req.query, req.body (express.json())',
            'Repeated query params: ?url=a&url=b gives an array',
          ]],
          ['Middleware', 30, [
            'Request logger: method, path, status, ms',
            'Central error handler (err, req, res, next)',
            'JSON 404 for unknown routes',
          ]],
          ['Call Other APIs', 45, [
            'fetch(url, { signal: AbortSignal.timeout(500) })',
            'Promise.allSettled to call many URLs at once',
            'Skip failed / slow responses, keep the rest',
          ]],
          ['Strings & Tries', 30, [
            'Build a trie from a word list',
            'Walk the trie to find the shortest unique prefix',
          ]],
        ],
        projects: [
          {
            title: 'Number Management Service',
            min: 90,
            brief: 'Merge integer lists from many URLs and always answer within 500 ms.',
            upstream: [
              ['GET', '/primes', '{ "numbers": [2, 3, 5, 7, 11, 13] }'],
              ['GET', '/fibo', '{ "numbers": [1, 1, 2, 3, 5, 8, 13, 21] }'],
              ['GET', '/odd', '{ "numbers": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] }'],
              ['GET', '/rand', '{ "numbers": [5, 17, 3, 19, 76, 24, 1, 5, 10, 34, 8, 27, 7] }'],
              ['', 'Test server behaviour', 'Port 8090. Every call waits a random 0-550 ms, and about 10% of calls return 503'],
            ],
            endpoints: [
              ['GET', '/numbers?url=<u1>&url=<u2>...', '{ "numbers": [merged unique integers] }'],
            ],
            rules: [
              'The "url" query param can appear more than once',
              'Only fetch urls that are syntactically valid',
              'Merge all integers, sort ascending, each integer appears only once',
              'Return as quickly as possible, never later than 500 ms',
              'If a url takes too long, ignore it. The timeout holds regardless of data size',
              'Attach a Postman / Insomnia screenshot with response body and timing',
            ],
            sample: 'GET /numbers?url=http://localhost:8090/primes\n             &url=http://localhost:8090/fibo\n             &url=http://localhost:8090/odd\n{ "numbers": [1, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 21, 23] }',
          },
          {
            title: 'Prefix Management Service',
            min: 75,
            brief: 'For each keyword, say whether it exists and return the shortest prefix that uniquely identifies it.',
            endpoints: [
              ['GET', '/prefixes?keywords=bonfire,bool', 'One result per keyword'],
            ],
            rules: [
              'Hardcode about 20 words on the server, e.g. [bonfire, cardio, case, character, bonsai, ...]',
              'keywords is one comma-separated query param',
              'Found: status "found" and the smallest unique prefix of that word',
              'Not found: status "not_found" and prefix "not_applicable"',
              'Attach a Postman / Insomnia screenshot with the response body',
            ],
            sample: 'GET /prefixes?keywords=bonfire,bool\n[\n  { "keyword": "bonfire", "status": "found", "prefix": "bonf" },\n  { "keyword": "bool", "status": "not_found", "prefix": "not_applicable" }\n]',
          },
        ],
      },
      {
        title: 'Logging, Tokens & Links',
        ship: 'A reusable logging package and a URL shortener that uses it everywhere',
        steps: [
          ['Reusable Package', 40, [
            'Logging Middleware/ folder with its own package.json',
            'npm workspaces so every service can import it by name',
            'Validate every argument before sending',
          ]],
          ['Bearer Token Client', 40, [
            'POST /auth for an access_token',
            'Send Authorization: Bearer <token> on every call',
            'On 401, get a new token and retry once',
          ]],
          ['In-Memory Store', 30, [
            'Map as a store keyed by shortcode',
            'Generate short codes with crypto.randomBytes',
            'Clean expired entries with an unref()ed timer',
          ]],
          ['Redirects & Headers', 20, [
            'res.redirect(302, url)',
            'Read the Referer header',
            'ISO 8601 dates with new Date().toISOString()',
          ]],
        ],
        projects: [
          {
            title: 'Logging Middleware',
            min: 120,
            brief: 'A reusable Log(stack, level, package, message) function that sends every log to the test server. Every later project must use it.',
            upstream: [
              ['POST', '/register', 'Body { email, name, mobileNo, githubUsername, rollNo, accessCode } -> clientID, clientSecret (shown once)'],
              ['POST', '/auth', 'Body { email, name, rollNo, accessCode, clientID, clientSecret } -> { token_type: "Bearer", access_token, expires_in }'],
              ['POST', '/logs', 'Bearer. Body { stack, level, package, message } -> { logID, message: "log created successfully" }'],
            ],
            rules: [
              'stack: "backend" | "frontend"',
              'level: "debug" | "info" | "warn" | "error" | "fatal"',
              'package (backend only): cache, controller, cron_job, db, domain, handler, repository, route, service',
              'package (frontend only): api, component, hook, page, state, style',
              'package (both): auth, config, middleware, utils',
              'All values must be lowercase and from these lists',
              'Register once with your college email, roll number and the emailed access code',
              'Lives in its own Logging Middleware folder and is reused by every project',
              'Log significant events through Log(), never console.log',
            ],
            sample: 'Log("backend", "error", "handler", "received string, expected bool")\nLog("backend", "fatal", "db", "Critical database connection failure.")\n-> { "logID": "a4aad02e-...", "message": "log created successfully" }',
          },
          {
            title: 'URL Shortener Microservice',
            min: 150,
            brief: 'Shorten URLs with an expiry and optional custom code, redirect, and report click statistics.',
            endpoints: [
              ['POST', '/shorturls', 'Body { url, validity?, shortcode? } -> 201 { shortLink, expiry }'],
              ['GET', '/shorturls/:shortcode', 'Stats: original URL, created, expiry, total clicks, click details'],
              ['GET', '/:shortcode', 'Redirect to the original URL'],
            ],
            rules: [
              'validity is in minutes and defaults to 30',
              'shortcode is optional and alphanumeric. If missing, generate a unique one',
              'Every shortcode must be unique',
              'expiry is an ISO 8601 timestamp',
              'Each click records timestamp, referrer and a coarse location',
              'Proper status codes and JSON errors: bad input, taken code, unknown or expired link',
              'Use your Logging Middleware for every significant event, no console.log',
              'Folders: Logging Middleware / Backend Test Submission (/ Frontend Test Submission on full stack)',
            ],
            sample: 'POST /shorturls\n{ "url": "https://example.com/very/long/path", "validity": 30, "shortcode": "abcd1" }\n201 { "shortLink": "http://localhost:5000/abcd1", "expiry": "2026-01-01T00:30:00Z" }',
          },
        ],
      },
      {
        title: 'Aggregator Services',
        ship: 'Services that pull from authenticated upstreams, compute and cache',
        steps: [
          ['Fan-Out Calls', 30, [
            'Promise.allSettled over every source',
            'Tag each result with its source',
            'One failing source must not fail the request',
          ]],
          ['Sort & Filter', 30, [
            'Sort by a whitelisted field, asc / desc',
            'Filter by min / max price',
          ]],
          ['Cache with TTL', 30, [
            'Map<key, { value, expiresAt }>',
            'Reuse cached upstream data to cut paid API calls',
          ]],
          ['Math in Code', 40, [
            'Mean and Pearson correlation',
            'Pair two time series by nearest timestamp',
          ]],
        ],
        projects: [
          {
            title: 'Average Calculator Microservice',
            min: 120,
            brief: 'Keep a sliding window of unique numbers fetched from the test server and return its average.',
            upstream: [
              ['GET', '/primes', 'Bearer. { "numbers": [2, 3, 5, 7, 11, ...] }'],
              ['GET', '/fibo', 'Bearer. { "numbers": [1, 2, 3, 5, 8, 13, ...] }'],
              ['GET', '/even', 'Bearer. { "numbers": [2, 4, 6, 8, ...] }'],
              ['GET', '/rand', 'Bearer. { "numbers": [random ints] }'],
            ],
            endpoints: [
              ['GET', '/numbers/:numberid', 'numberid: p = prime, f = fibonacci, e = even, r = random (port 9876)'],
            ],
            rules: [
              'Only accept the qualified ids p, f, e, r',
              'Window size is configurable, e.g. 10',
              'Fetch from the test server only. Do not generate numbers yourself',
              'Stored numbers are unique: ignore duplicates',
              'Ignore responses slower than 500 ms or with errors',
              'Fewer numbers than the window: average what you have',
              'Window full: replace the oldest number with the newest',
              'Respond with the window before and after this call, the fetched numbers and the average',
              'Responses must never take longer than 500 ms',
            ],
            sample: 'GET http://localhost:9876/numbers/e\n{\n  "windowPrevState": [],\n  "windowCurrState": [2, 4, 6, 8],\n  "numbers": [2, 4, 6, 8],\n  "avg": 5.00\n}',
          },
          {
            title: 'Top Products Microservice',
            min: 150,
            brief: 'Show the top N products in a category and price range across 5 e-commerce companies.',
            upstream: [
              ['GET', '/companies/:company/categories/:category/products?top=n&minPrice=p&maxPrice=q', 'Bearer. [{ productName, price, rating, discount, availability }]'],
              ['', 'Companies', 'AMZ, FLP, SNP, MYN, AZO'],
              ['', 'Categories', 'Phone, Computer, TV, Earphone, Tablet, Charger, Mouse, Keypad, Bluetooth, Pendrive, Remote, Speaker, Headset, Laptop, PC'],
            ],
            endpoints: [
              ['GET', '/categories/:categoryname/products?n=&page=&minPrice=&maxPrice=&sortBy=&order=', 'Top n products across all companies'],
              ['GET', '/categories/:categoryname/products/:productid', 'Details of one product'],
            ],
            rules: [
              'Query all 5 companies and merge the results',
              'Sort by rating, price, company or discount, asc or desc',
              'n > 10: paginate with page',
              'The upstream has no ids: generate a unique id per product',
              'Respect the price range',
              'Keep paid upstream calls low: cache',
            ],
          },
          {
            title: 'Stock Price Aggregation',
            min: 150,
            brief: 'Average price of a stock over the last m minutes, and the correlation between two stocks.',
            upstream: [
              ['GET', '/stocks', 'Bearer. { "stocks": { "Nvidia Corporation": "NVDA", "PayPal Holdings, Inc.": "PYPL", ... } }'],
              ['GET', '/stocks/:ticker', 'Bearer. { "stock": { "price", "lastUpdatedAt" } }'],
              ['GET', '/stocks/:ticker?minutes=m', 'Bearer. [{ "price", "lastUpdatedAt" }, ...]'],
            ],
            endpoints: [
              ['GET', '/stocks/:ticker?minutes=m&aggregation=average', '{ averageStockPrice, priceHistory[] }'],
              ['GET', '/stockcorrelation?minutes=m&ticker={T1}&ticker={T2}', '{ correlation, stocks: { T1: {...}, T2: {...} } }'],
            ],
            rules: [
              'Average = mean of all prices in the last m minutes',
              'Correlation = Pearson correlation of the two price histories',
              'Prices arrive at different times: pair them by timestamp first',
              'Exactly 2 tickers for correlation, otherwise 400',
              'API calls are rate limited and cost money: cache',
            ],
            sample: 'GET /stocks/NVDA?minutes=50&aggregation=average\n{\n  "averageStockPrice": 453.56,\n  "priceHistory": [\n    { "price": 231.95, "lastUpdatedAt": "2026-05-08T04:26:27.465Z" },\n    { "price": 675.17, "lastUpdatedAt": "2026-05-08T04:37:23.825Z" }\n  ]\n}',
          },
        ],
      },
      {
        title: 'Database & Auth',
        ship: 'Data-backed CRUD and auth services with real tests',
        steps: [
          ['Prisma + SQLite', 45, [
            'Write the model in schema.prisma',
            'npx prisma db push (dev) / migrate (prod)',
            'create, findMany, update, delete',
          ]],
          ['Switch to Postgres', 20, [
            'provider = "postgresql" + DATABASE_URL',
            'Run the same migrations again',
          ]],
          ['Password Auth', 45, [
            'bcrypt.hash on signup, bcrypt.compare on login',
            'jwt.sign / jwt.verify, Authorization: Bearer',
          ]],
          ['Filters from Query', 25, [
            'Validate query params with zod',
            'Build a where-clause from the optional ones',
          ]],
        ],
        projects: [
          {
            title: 'User Management Service',
            min: 120,
            brief: 'Design and implement a user service with registration, login, profile edit and password change.',
            endpoints: [
              ['POST', '/signup', 'API 1: register a user'],
              ['POST', '/login', 'API 2: log in, return a token'],
              ['PATCH', '/users/me', 'API 3: edit your own details'],
              ['PUT', '/users/me/password', 'API 4: change your password'],
            ],
            rules: [
              'User should be able to register',
              'User should be able to successfully log in',
              'User should be able to edit their own details',
              'User should be able to change their password',
              'Store passwords hashed, never plain text',
              'Paths are your design: the ones above are a suggestion',
            ],
          },
          {
            title: 'Journal CRUD API',
            min: 30,
            brief: 'Live machine-coding round: journal CRUD APIs in 30 minutes, any stack.',
            endpoints: [
              ['POST', '/journals', 'Create'],
              ['PATCH', '/journals/:id', 'Update'],
              ['DELETE', '/journals/:id', 'Delete'],
              ['GET', '/journals?date=&mood=', 'Retrieve by date and mood'],
            ],
            rules: [
              'Fields: title, description, tags (list), date, mood',
              'mood: "neutral" | "happy" | "sad"',
              'Create, update and delete journals',
              'Retrieve journals filtered by date and by mood',
              'Time limit: 30 minutes. Design clean REST endpoints fast',
            ],
          },
        ],
      },
      {
        title: 'Snapshots & Schedules',
        ship: 'Services that answer instantly from a refreshed snapshot of a paid API',
        steps: [
          ['Limit Concurrency', 30, [
            'Run at most N upstream calls at once',
            'Keep results in input order',
          ]],
          ['Background Refresh', 30, [
            'Warm the snapshot before taking traffic',
            'setInterval(...).unref() to refresh it',
            'Requests read the snapshot, never the upstream',
          ]],
          ['Dates & Time Windows', 30, [
            'Build today\'s date from Hours / Minutes / Seconds',
            'Add a delay in minutes',
            'Filter by a (from, to] window',
          ]],
        ],
        projects: [
          {
            title: 'Social Media Analytics',
            min: 150,
            brief: 'Real-time analytics for business: top users and popular / latest posts, with as few paid test-server calls as possible.',
            upstream: [
              ['GET', '/users', 'Bearer. { "users": { "1": "John Doe", "2": "Jane Doe", ... } }'],
              ['GET', '/users/:userid/posts', 'Bearer. { "posts": [{ "id", "userid", "content" }] }'],
              ['GET', '/posts/:postid/comments', 'Bearer. { "comments": [{ "id", "postid", "content" }] }'],
            ],
            endpoints: [
              ['GET', '/users', 'Top 5 users with the most posts'],
              ['GET', '/posts?type=popular', 'Post(s) with the most comments (all ties)'],
              ['GET', '/posts?type=latest', 'Latest 5 posts, newest first'],
            ],
            rules: [
              'type is required: popular or latest',
              'Calls to the test server cost money: keep them to a minimum',
              'Data is unsorted, large, and changes over time',
              'Use caching and efficient data structures',
            ],
          },
          {
            title: 'Train Schedule Service',
            min: 150,
            brief: 'Register with a railway API and show trains departing in the next 12 hours, with seats and prices.',
            upstream: [
              ['POST', '/register', 'Body { companyName, ownerName, rollNo, ownerEmail, accessCode } -> clientID, clientSecret (fetch once, save them)'],
              ['POST', '/auth', 'Body { companyName, clientID, ownerName, ownerEmail, rollNo, clientSecret } -> { token_type, access_token, expires_in }'],
              ['GET', '/trains', 'Bearer. [{ trainName, trainNumber, departureTime: { Hours, Minutes, Seconds }, seatsAvailable: { sleeper, AC }, price: { sleeper, AC }, delayedBy }]'],
              ['GET', '/trains/:trainNumber', 'Bearer. One train'],
            ],
            endpoints: [
              ['GET', '/trains', 'Trains in the next 12 hours, sorted'],
              ['GET', '/trains/:trainNumber', 'One train with seats and prices'],
            ],
            rules: [
              'Users view schedules from your server without registering',
              'Ignore trains departing in the next 30 minutes',
              'Apply delays: a delayed train can move into the window',
              'Sort: price ascending, then tickets descending, then departure (after delay) descending',
              'Prices and seats change with demand: sort on current values',
              'Railway API calls are charged: minimise them',
            ],
          },
        ],
      },
      {
        title: 'Notifications & Algorithms',
        ship: 'A full notification design plus two algorithm-heavy services',
        steps: [
          ['Priority Queue', 30, [
            'Min-heap: push, pop, peek',
            'Top-N with a heap of size N',
          ]],
          ['Dynamic Programming', 40, [
            '0/1 knapsack in a 1-D table',
            'Walk back to list the chosen items',
          ]],
          ['Worker Threads', 20, [
            'Run the DP in worker_threads',
          ]],
          ['Notification Schema & Index', 30, [
            'Tables for students and notifications',
            'One composite index for the hot query',
          ]],
          ['Stage 3 Queries', 30, [
            'Unread notifications for a student, newest first',
            'Students with a Placement notification in the last 7 days',
          ]],
          ['Reliable Notify-All', 40, [
            'Save to the DB first, then queue one job per student',
            'Retries, dead-letter queue, idempotency key',
          ]],
        ],
        projects: [
          {
            title: 'Campus Notifications Microservice',
            min: 240,
            brief: 'Students get Placement, Result and Event notifications. A staged paper: design the API and data, tune queries, scale it, then build a priority inbox.',
            upstream: [
              ['GET', '/notifications?limit=&page=&notification_type=', 'Bearer. { "notifications": [{ "ID", "Type", "Message", "Timestamp": "YYYY-MM-DD HH:MM:SS" }] }'],
            ],
            endpoints: [
              ['POST', '/api/notifications', 'Stage 1: create'],
              ['GET', '/api/students/:id/notifications?page=&limit=', 'Stage 1: list'],
              ['GET', '/api/students/:id/notifications/unread', 'Stage 1: unread'],
              ['PATCH', '/api/students/:id/notifications/:nid/read', 'Stage 1: mark one read'],
              ['PATCH', '/api/students/:id/notifications/read-all', 'Stage 1: mark all read'],
              ['GET', '/priority-inbox?n=10', 'Stage 6: top n unread'],
            ],
            rules: [
              'Stage 1: REST API + JSON schemas, and real-time delivery (WebSocket / SSE)',
              'Stage 2: choose SQL or NoSQL, schema, indexes, scaling',
              'Stage 3: speed up "unread for student 1042, newest first"; why not index every column',
              'Stage 4: page loads overload the DB: cache (Redis), paginate, push updates',
              'Stage 5: notify 50,000 students reliably when email fails halfway',
              'Stage 6: priority inbox: Placement > Result > Event, then newest, heap of size n',
              'Repo: logging_middleware / notification_app_be / notification_system_design.md',
            ],
            sample: 'GET /priority-inbox?n=2\n{\n  "count": 2,\n  "notifications": [\n    { "id": "d146...", "type": "Placement", "message": "CSX Corporation hiring" },\n    { "id": "b283...", "type": "Result", "message": "mid-sem" }\n  ]\n}',
          },
          {
            title: 'Vehicle Maintenance Scheduler',
            min: 150,
            brief: 'Pick the maintenance tasks that give the most impact within each depot\'s mechanic-hour budget.',
            upstream: [
              ['GET', '/depots', 'Bearer. { "depots": [{ "ID": 1, "MechanicHours": 60 }] }'],
              ['GET', '/vehicles', 'Bearer. { "vehicles": [{ "TaskID": "...", "Duration": 5, "Impact": 8 }] }'],
            ],
            endpoints: [
              ['GET', '/schedule-maintenance', 'Best task set for every depot'],
              ['GET', '/schedule-maintenance?depotId=1', 'Best task set for one depot'],
            ],
            rules: [
              'Each task is picked at most once (0/1 knapsack)',
              'Total Duration must be <= MechanicHours',
              'Maximise total Impact',
              'The depot list can change between calls: fetch fresh',
              'Use your Logging Middleware throughout',
            ],
            sample: 'GET /schedule-maintenance?depotId=1\n{\n  "depotID": 1, "mechanicHours": 10,\n  "selectedTaskIDs": ["t2", "t4"],\n  "totalDuration": 7, "totalImpact": 90\n}',
          },
        ],
      },
      {
        title: 'Test & Mock Rounds',
        ship: 'Tested services and three rehearsals under the real time limits',
        steps: [
          ['API Tests', 45, [
            'Vitest + Supertest against each express app',
            'Export app separately from app.listen()',
          ]],
          ['Mock Upstreams', 30, [
            'Start a real mock server on a free port in tests',
            'Give it a slow route and a failing route',
          ]],
          ['Submission Hygiene', 20, [
            'Public repo named with your roll number',
            '.env.example only, never commit tokens',
            'README with run steps + screenshots of each API',
          ]],
        ],
        projects: [
          {
            title: 'Mock Round: 90-Minute Backend Test',
            min: 90,
            brief: 'Pick one Day 3 or Day 5 question you have not redone and build it from an empty repo in 90 minutes.',
            rules: [
              'Fresh public repo named with your roll number',
              'Logging Middleware folder + the service folder',
              'Every rule of the question met, screenshots in the README',
              'Stop at 90 minutes and note what is missing',
            ],
          },
          {
            title: 'Mock Round: 3-Hour Full Stack',
            min: 180,
            brief: 'Logging Middleware + URL Shortener backend + a React/MUI page that uses it, in 3 hours.',
            rules: [
              'Folders: Logging Middleware / Backend Test Submission / Frontend Test Submission',
              'Frontend on http://localhost:3000, Material UI',
              'No copying from your earlier code',
            ],
          },
          {
            title: 'Mock Round: Journal CRUD in 30 Minutes',
            min: 30,
            brief: 'Redo the Journal CRUD API with a timer running, explaining your choices out loud.',
            rules: [
              'Start from an empty folder',
              'All CRUD operations + filters by date and mood',
              'Done when every endpoint works in Postman',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Containers Track',
    short: 'Box',
    intro: 'An easy extra track that puts the projects you built into containers. Checked in CI on every push.',
    sections: [
      {
        title: 'Run Things in Docker',
        ship: 'Postgres and Redis running in containers for your projects',
        steps: [
          ['First Containers', 30, [
            'docker run -d -p 6379:6379 redis:7-alpine',
            'docker run postgres:16-alpine with env vars',
            'docker ps, docker logs -f, docker rm -f',
          ]],
          ['Volumes & Env', 20, [
            'Named volume keeps data across container restarts',
            '--env-file instead of many -e flags',
          ]],
        ],
        projects: [
          {
            title: 'Containerised Dependencies',
            min: 45,
            brief: 'Run the databases your projects need in Docker, no local installs.',
            rules: [
              'Switch User Management or Journal API to Postgres in Docker',
              'Data survives docker rm thanks to a named volume',
            ],
          },
        ],
      },
      {
        title: 'Your First Dockerfile',
        ship: 'One Node service running as an image',
        steps: [
          ['Basic Dockerfile', 30, [
            'FROM node:22-alpine, WORKDIR /app',
            'Copy package files, npm ci, then copy the code',
            'EXPOSE + CMD',
          ]],
          ['Build & Run', 20, [
            'docker build -f ... -t url-shortener .',
            'docker run -p 5000:5000 url-shortener',
            '.dockerignore: node_modules, .env, tests',
          ]],
        ],
        projects: [
          {
            title: 'Containerise the URL Shortener',
            min: 45,
            brief: 'Ship the URL Shortener as an image anyone can run.',
            rules: [
              'docker run starts it with no other setup',
              'Config only through environment variables',
              'POST /shorturls and the redirect work from the container',
            ],
          },
        ],
      },
      {
        title: 'Better Images',
        ship: 'Small, safe images with health checks',
        steps: [
          ['Multi-Stage Build', 30, [
            'Stage 1 installs production dependencies',
            'Stage 2 copies only what runs',
          ]],
          ['Run Safely', 20, [
            'USER node (non-root)',
            'HEALTHCHECK against /health',
          ]],
        ],
        projects: [
          {
            title: 'Slim the Stock Service Image',
            min: 45,
            brief: 'Build Stock Price Aggregation with the multi-stage Dockerfile.',
            rules: [
              'Runs as the node user, not root',
              'docker inspect shows the container as healthy',
            ],
          },
        ],
      },
      {
        title: 'Docker Compose',
        ship: 'Many containers started with one command',
        steps: [
          ['compose.yaml Basics', 30, [
            'services: build, ports, environment',
            'Services call each other by name: http://testserver:8090',
          ]],
          ['Startup Order', 20, [
            'healthcheck on each service',
            'depends_on: { condition: service_healthy }',
          ]],
        ],
        projects: [
          {
            title: 'Compose Numbers + Test Server',
            min: 60,
            brief: 'Run the Number Management Service next to its Go test server.',
            rules: [
              'Test server runs testserver.go in golang:1.22-alpine',
              'numbers waits until the test server is healthy',
              'docker compose up --wait, then curl /numbers',
            ],
          },
        ],
      },
      {
        title: 'Compose Many Services',
        ship: 'Several of your services running together in containers',
        steps: [
          ['Multi-Service Compose', 40, [
            'One block per microservice + a mock upstream',
            'Redis with a named volume',
          ]],
          ['Networks & Secrets', 20, [
            'An internal network with no route to the host',
            'Secrets via env_file, never baked into images',
          ]],
        ],
        projects: [
          {
            title: 'Compose the Day 6 Services',
            min: 90,
            brief: 'Run Campus Notifications and the Vehicle Scheduler together with docker compose up.',
            rules: [
              'Each service healthy before traffic',
              'Only the services you call publish ports',
            ],
          },
        ],
      },
      {
        title: 'CI/CD',
        ship: 'Tests and image builds on every push',
        steps: [
          ['CI Builds', 30, [
            'GitHub Actions: npm ci, npm test',
            'Build every image and smoke-test it',
          ]],
          ['Registry', 20, [
            'docker tag + docker push to GHCR',
            'Tag images with the git commit SHA',
          ]],
          ['Run on a Server', 30, [
            'docker compose pull && docker compose up -d',
          ]],
        ],
        projects: [
          {
            title: 'CI/CD for Your Services',
            min: 90,
            brief: 'Every push runs tests, builds the images and checks they start healthy.',
            rules: [
              'Tests run before any image is built',
              'Each compose stack comes up with --wait',
              'Add a push-to-registry job once tests are green',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Interview Track',
    short: 'Prep',
    intro: 'How the hiring process runs, and the questions they ask about your code, answered in code.',
    sections: [
      {
        title: 'How the Process Runs',
        ship: 'Know the rounds, the time limits and the submission rules before you start',
        steps: [
          ['Rounds & Time Limits', 15, [
            'Resume shortlist -> timed practical task -> interview(s) on your submission -> HR / final',
            'Backend or frontend task: about 90 min (some years 2 h). Full stack: about 3 h',
            'Backend in Go or Express. Work not submitted or copied is not evaluated',
          ]],
          ['Register & Get a Token', 20, [
            'Register once: the clientID / clientSecret are shown once',
            'Roll number and email must match your college records',
            'Auth for a Bearer token, re-auth when it expires',
          ]],
          ['Read the PDF Like a Spec', 15, [
            'Port numbers, field names and folder names exactly as written',
            'Every "must" is a test case: list them before coding',
          ]],
        ],
        projects: [],
      },
      {
        title: 'Backend Concepts in Code',
        ship: 'Answer each concept question by showing code',
        steps: [
          ['Caching Strategy', 20, [
            'In-memory TTL cache vs Redis',
            'What to cache from a paid API and for how long',
          ]],
          ['Tokens & Secrets', 15, [
            'Tokens in the Authorization header',
            'Why .env must stay out of git and out of the browser',
          ]],
          ['Event Loop Order', 20, [
            'sync -> nextTick -> promises -> immediate -> timers',
          ]],
          ['Parallel Awaits', 15, [
            'Sequential awaits add up; Promise.all runs them together',
          ]],
          ['Hoisting & TDZ', 10, [
            'var is hoisted as undefined; let / const throw before their line',
          ]],
        ],
        projects: [],
      },
      {
        title: 'SQL Round',
        ship: 'Write the 5-6 queries they ask, from MIN/MAX up to JOINs',
        steps: [
          ['SQL Round', 45, [
            'MIN / MAX, second highest',
            'INNER vs LEFT JOIN',
            'GROUP BY + HAVING, top per group',
          ]],
          ['Query Tuning', 20, [
            'Read EXPLAIN QUERY PLAN',
            'Composite index in filter-then-sort order',
          ]],
        ],
        projects: [
          {
            title: 'Defend Your Submission',
            min: 60,
            brief: 'The technical interview is a deep dive into the code you submitted. Rehearse these answers against your own repo.',
            rules: [
              'Why this timeout value, and what happens when every upstream is slow?',
              'Where do you cache, for how long, and how do you invalidate?',
              'How do you refresh an expired token without failing the request?',
              'What is the time complexity of your sort / heap / knapsack?',
              'How would this work with 100x the data or 10 instances?',
              'Why these status codes and this route design?',
              'Where are your secrets, and why not in the repo?',
              'Walk through one test: what does it prove?',
            ],
          },
        ],
      },
    ],
  },
];
