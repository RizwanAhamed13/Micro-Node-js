// Node.js microservices: the shortest code-only path + a containers track.
// Steps:    [title, minutes, tasks]
// Projects: { title, min, brief, upstream?, endpoints?, rules, sample? }
// Edit here, then run `npm run roadmap` (rebuilds roadmap.svg and PROJECTS.md).

export const tracks = [
  {
    name: 'Microservices Track',
    short: 'Day',
    sections: [
      {
        title: 'Express Fast Start',
        ship: 'Two working microservices that call upstream APIs with timeouts',
        steps: [
          ['Setup in 10 Minutes', 20, [
            'npm init -y, npm i express',
            '"type": "module", "dev": "node --watch src/server.js"',
            'Read PORT from process.env with a default',
          ]],
          ['First Endpoints', 40, [
            'app.get / app.post, res.json(), res.status()',
            'req.params, req.query, req.body (express.json())',
            'Return 400 on bad input, 404 on unknown route',
          ]],
          ['Middleware', 30, [
            'Request logger: method, path, status, ms',
            'Central error handler (err, req, res, next)',
            'asyncHandler wrapper for async routes',
          ]],
          ['Call Other APIs', 45, [
            'fetch(url, { signal: AbortSignal.timeout(500) })',
            'Promise.allSettled to call many URLs at once',
            'Skip failed / slow responses, keep the rest',
          ]],
          ['Folder Layout', 20, [
            'src/routes, src/controllers, src/services',
            'src/config.js exports all settings',
            'Mock upstream server in mock/server.js',
          ]],
        ],
        projects: [
          {
            title: 'Number Merge Service',
            min: 90,
            brief: 'Merge integer lists from many URLs and always answer within 500 ms.',
            upstream: [
              ['GET', '/primes', '{ "numbers": [2, 3, 5, 7, 11, 13] }'],
              ['GET', '/fibo', '{ "numbers": [1, 2, 3, 5, 8, 13, 21] }'],
              ['GET', '/odd', '{ "numbers": [1, 3, 5, 7, 9, 11] }'],
              ['GET', '/rand', '{ "numbers": [random ints] }, add a random 0-800 ms delay'],
            ],
            endpoints: [
              ['GET', '/numbers?url=<u1>&url=<u2>...', 'Merged, unique, ascending integers'],
            ],
            rules: [
              'Ignore every url that is not a valid http(s) URL',
              'Call all urls in parallel',
              'Drop any url that has not answered within 500 ms',
              'Merge all arrays, remove duplicates, sort ascending',
              'Whole response must return in under 500 ms, even if every url fails',
              'If nothing usable came back, return { "numbers": [] }',
            ],
            sample: 'GET /numbers?url=http://localhost:8090/primes\n             &url=http://localhost:8090/fibo\n             &url=http://localhost:8090/odd\n{ "numbers": [1, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 21, 23] }',
          },
          {
            title: 'Average Calculator Microservice',
            min: 120,
            brief: 'Keep a sliding window of unique numbers from an upstream API and return its average.',
            upstream: [
              ['GET', '/test/primes', '{ "numbers": [2, 3, 5, 7, 11] }'],
              ['GET', '/test/fibo', '{ "numbers": [1, 2, 3, 5, 8, 13] }'],
              ['GET', '/test/even', '{ "numbers": [2, 4, 6, 8, 10] }'],
              ['GET', '/test/rand', '{ "numbers": [random ints] }'],
            ],
            endpoints: [
              ['GET', '/numbers/:numberid', 'numberid: p = prime, f = fibonacci, e = even, r = random'],
            ],
            rules: [
              'Window size is 10 (read from config)',
              'Store only unique numbers in the window',
              'When the window is full, drop the oldest numbers first',
              'Ignore upstream responses slower than 500 ms or failed: window stays the same',
              'avg = average of the current window, 2 decimal places',
              'Invalid numberid returns 400 with a JSON error',
              'Respond in under 500 ms',
            ],
            sample: 'GET /numbers/e\n{\n  "windowPrevState": [],\n  "windowCurrState": [2, 4, 6, 8],\n  "numbers": [2, 4, 6, 8],\n  "avg": 5.00\n}',
          },
        ],
      },
      {
        title: 'Logging, Tokens & Links',
        ship: 'A reusable logging package and a URL shortener that uses it',
        steps: [
          ['Reusable Package', 40, [
            'packages/logger with its own package.json',
            'npm workspaces: "workspaces": ["packages/*", "services/*"]',
            'import { Log } from "@app/logger" in any service',
          ]],
          ['Bearer Token Client', 40, [
            'POST /register once, save clientID + clientSecret in .env',
            'POST /auth for an access_token, cache it in memory',
            'Refresh the token on 401 or before expires_in',
          ]],
          ['In-Memory Store', 30, [
            'Map as a store, setInterval cleanup of expired keys',
            'Generate short ids with crypto.randomBytes / nanoid',
          ]],
          ['Redirects & Headers', 20, [
            'res.redirect(302, url)',
            'Read Referer and X-Forwarded-For headers',
            'Return ISO dates with new Date().toISOString()',
          ]],
        ],
        projects: [
          {
            title: 'Logging Middleware + Log Service',
            min: 150,
            brief: 'Build a log service and a reusable Log(stack, level, package, message) function every project uses.',
            endpoints: [
              ['POST', '/register', 'Body { email, name, rollNo, accessCode } -> { clientID, clientSecret }'],
              ['POST', '/auth', 'Body { email, name, rollNo, accessCode, clientID, clientSecret } -> { token_type: "Bearer", access_token, expires_in }'],
              ['POST', '/logs', 'Bearer token. Body { stack, level, package, message } -> 201 { logID, message: "log created successfully" }'],
              ['GET', '/logs?level=&package=&stack=', 'Bearer token. Filtered logs, newest first'],
            ],
            rules: [
              'stack: "backend" | "frontend"',
              'level: "debug" | "info" | "warn" | "error" | "fatal"',
              'package (backend only): cache, controller, cron_job, db, domain, handler, repository, route, service',
              'package (frontend only): api, component, hook, page, state, style',
              'package (both): auth, config, middleware, utils',
              'All values lowercase. Anything else returns 400',
              'Log() sends the token, caches it, re-auths on 401, never throws',
              'Express middleware logs every request: method, path, status, duration',
              'No console.log in app code. Every log goes through Log()',
            ],
            sample: 'Log("backend", "error", "handler", "received string, expected bool")\nLog("backend", "fatal", "db", "Critical database connection failure.")\n-> 201 { "logID": "a4aad02e-...", "message": "log created successfully" }',
          },
          {
            title: 'URL Shortener Microservice',
            min: 150,
            brief: 'Shorten URLs with expiry and custom codes, redirect, and track click stats.',
            endpoints: [
              ['POST', '/shorturls', 'Body { url, validity?, shortcode? } -> 201 { shortLink, expiry }'],
              ['GET', '/:shortcode', '302 redirect to the original URL'],
              ['GET', '/shorturls/:shortcode', 'Stats: url, createdAt, expiry, totalClicks, clicks[]'],
            ],
            rules: [
              'validity is in minutes, default 30',
              'shortcode is optional, alphanumeric, 4-20 chars, must be unique',
              'If no shortcode is given, generate a unique one',
              'Shortcode already taken returns 409',
              'Invalid url returns 400',
              'Unknown code returns 404, expired code returns 410',
              'Each click stores timestamp, referrer and a coarse location (or "unknown")',
              'All logging through the logger package from the previous project',
            ],
            sample: 'POST /shorturls\n{ "url": "https://example.com/very/long/path", "validity": 30, "shortcode": "abcd1" }\n201 { "shortLink": "http://localhost:5000/abcd1", "expiry": "2026-01-01T00:30:00Z" }',
          },
        ],
      },
      {
        title: 'Aggregator Services',
        ship: 'Services that fan out to many upstreams, merge, sort, paginate and cache',
        steps: [
          ['Fan-Out Calls', 30, [
            'Promise.all over a list of upstream URLs',
            'Attach the source name to every result',
          ]],
          ['Sort, Filter, Paginate', 40, [
            'Sort by any field with asc / desc',
            'Paginate with ?page=&n= and return total',
            'Validate query values with zod',
          ]],
          ['Cache with TTL', 30, [
            'Map<key, { value, expiresAt }> cache helper',
            'Same helper on Redis with SET key value EX 60',
          ]],
          ['Math in Code', 30, [
            'Average, covariance, standard deviation functions',
            'Pearson correlation of two price arrays',
            'Align two time series by nearest timestamp',
          ]],
          ['Stable IDs', 15, [
            'createHash("sha1").update(company + name) for ids',
          ]],
        ],
        projects: [
          {
            title: 'Top Products Aggregator',
            min: 150,
            brief: 'Show the top N products in a category and price range across 5 e-commerce companies.',
            upstream: [
              ['GET', '/companies/:company/categories/:category/products?top=n&minPrice=p&maxPrice=q', '[{ productName, price, rating, discount, availability }]'],
              ['', 'Companies', 'AMZ, FLP, SNP, MYN, AZO'],
              ['', 'Categories', 'Phone, Computer, TV, Earphone, Tablet, Charger, Mouse, Keypad, Bluetooth, Pendrive, Remote, Speaker, Headset, Laptop, PC'],
            ],
            endpoints: [
              ['GET', '/categories/:categoryname/products?n=&page=&minPrice=&maxPrice=&sortBy=&order=', 'Top n products across all companies'],
              ['GET', '/categories/:categoryname/products/:productid', 'Details of one product'],
            ],
            rules: [
              'Call all 5 companies in parallel',
              'sortBy: rating | price | company | discount, order: asc | desc',
              'If n > 10, paginate with page (10 per page)',
              'Give every product a stable unique id (the upstream has none)',
              'Every product includes its company name',
              'Cache upstream responses for 60 s',
              'Invalid category or query values return 400',
            ],
            sample: 'GET /categories/Laptop/products?n=2&minPrice=1&maxPrice=10000&sortBy=price&order=asc\n[\n  { "id": "9f1c...", "productName": "Laptop 13", "company": "SNP",\n    "price": 2236, "rating": 4.7, "discount": 63, "availability": "yes" },\n  { "id": "1a2b...", "productName": "Laptop 1", "company": "AMZ",\n    "price": 2652, "rating": 4.6, "discount": 21, "availability": "yes" }\n]',
          },
          {
            title: 'Stock Price Aggregator',
            min: 150,
            brief: 'Average price over the last m minutes, and the correlation between two stocks.',
            upstream: [
              ['GET', '/stocks', '{ "stocks": { "Nvidia Corporation": "NVDA", "PayPal Holdings, Inc.": "PYPL", ... } }'],
              ['GET', '/stocks/:ticker', '{ "stock": { "price": 666.66, "lastUpdatedAt": "..." } }'],
              ['GET', '/stocks/:ticker?minutes=m', '[{ "price": 231.95, "lastUpdatedAt": "..." }, ...]'],
            ],
            endpoints: [
              ['GET', '/stocks/:ticker?minutes=m&aggregation=average', '{ averageStockPrice, priceHistory[] }'],
              ['GET', '/stockcorrelation?minutes=m&ticker=NVDA&ticker=PYPL', '{ correlation, stocks: { NVDA: {...}, PYPL: {...} } }'],
            ],
            rules: [
              'Correlation is Pearson correlation over the same time window',
              'Align the two price series by timestamp before correlating',
              'Exactly 2 tickers for correlation, otherwise 400',
              'Round correlation to 4 decimals',
              'Upstream calls are costly: cache price history and reuse it',
              'Unknown ticker returns 404',
            ],
            sample: 'GET /stocks/NVDA?minutes=50&aggregation=average\n{\n  "averageStockPrice": 453.56,\n  "priceHistory": [\n    { "price": 231.95, "lastUpdatedAt": "2026-05-08T04:26:27.465Z" },\n    { "price": 675.17, "lastUpdatedAt": "2026-05-08T04:37:23.825Z" }\n  ]\n}',
          },
        ],
      },
      {
        title: 'Database & Auth',
        ship: 'Data-backed services with JWT auth and a background sync job',
        steps: [
          ['Prisma + SQLite', 45, [
            'npx prisma init --datasource-provider sqlite',
            'Write models, run npx prisma migrate dev',
            'create, findMany, update, delete with Prisma Client',
          ]],
          ['Switch to Postgres', 20, [
            'Change provider to postgresql + DATABASE_URL',
            'Run the same migrations again',
          ]],
          ['JWT Auth', 45, [
            'bcrypt.hash on signup, bcrypt.compare on login',
            'jwt.sign({ sub, role }, secret, { expiresIn })',
            'requireAuth middleware reads Authorization: Bearer',
          ]],
          ['Background Sync', 30, [
            'setInterval / node-cron job pulls upstream data',
            'Upsert into the DB, serve requests from the DB',
          ]],
        ],
        projects: [
          {
            title: 'Social Media Analytics',
            min: 150,
            brief: 'Top users and popular / latest posts, answered fast from your own cache.',
            upstream: [
              ['GET', '/users', '{ "users": { "1": "John Doe", "2": "Jane Doe", ... } }'],
              ['GET', '/users/:userid/posts', '{ "posts": [{ "id": 246, "userid": 1, "content": "Post about ant" }] }'],
              ['GET', '/posts/:postid/comments', '{ "comments": [{ "id": 3893, "postid": 150, "content": "Old comment" }] }'],
            ],
            endpoints: [
              ['GET', '/users', 'Top 5 users with the most posts'],
              ['GET', '/posts?type=popular', 'Post(s) with the most comments (return all ties)'],
              ['GET', '/posts?type=latest', 'Latest 5 posts'],
            ],
            rules: [
              'Upstream is slow and costly: keep calls to a minimum',
              'Sync users, posts and comment counts into your store in the background',
              'Serve every request from your store, not live upstream calls',
              'Post ids increase over time: latest = highest id',
              'type other than popular | latest returns 400',
            ],
            sample: 'GET /users\n[ { "id": "7", "name": "Ava", "postCount": 42 }, ... 5 items ]',
          },
          {
            title: 'Train Schedule Service',
            min: 150,
            brief: 'Register with a railway API, pull trains with a token, and list the best trains for the next 12 hours.',
            upstream: [
              ['POST', '/register', 'Body { companyName, ownerName, rollNo, ownerEmail, accessCode } -> { companyName, clientID, clientSecret }'],
              ['POST', '/auth', 'Body { companyName, clientID, clientSecret, ownerName, ownerEmail, rollNo } -> { token_type, access_token, expires_in }'],
              ['GET', '/trains', 'Bearer. [{ trainName, trainNumber, departureTime: { Hours, Minutes, Seconds }, seatsAvailable: { sleeper, AC }, price: { sleeper, AC }, delayedBy }]'],
              ['GET', '/trains/:trainNumber', 'Bearer. One train'],
            ],
            endpoints: [
              ['GET', '/trains', 'Trains departing in the next 12 hours, sorted'],
              ['GET', '/trains/:trainNumber', 'One train with seats and prices'],
            ],
            rules: [
              'Add delayedBy (minutes) to the departure time first',
              'Skip trains departing in the next 30 minutes',
              'Sort: price ascending, then seats available descending, then departure time descending',
              'Re-auth automatically when the token expires',
              'Store trains in the DB, refresh with a sync job every minute',
            ],
          },
        ],
      },
      {
        title: 'Multi-Service Systems',
        ship: 'Several services behind one gateway, talking over HTTP and events',
        steps: [
          ['Workspaces Monorepo', 30, [
            'services/gateway, services/<name>, packages/logger',
            'npm run dev -w services/<name>, concurrently for all',
          ]],
          ['API Gateway', 40, [
            'http-proxy-middleware: /api/<name> -> service URL',
            'Verify JWT once in the gateway, forward x-user-id',
            'Pass x-request-id through every hop',
          ]],
          ['Events with Redis', 40, [
            'redis.publish("notification.created", JSON)',
            'subscriber.subscribe and handle in another service',
          ]],
          ['Priority Queue', 30, [
            'Min-heap class: push, pop, peek',
            'Top-N with a heap of size N',
          ]],
          ['Worker Threads', 20, [
            'Move a heavy loop into worker_threads',
          ]],
        ],
        projects: [
          {
            title: 'Notifications Priority Inbox',
            min: 180,
            brief: 'A notification service plus an inbox service that always returns the most important unread notifications first.',
            endpoints: [
              ['POST', '/notifications', 'Body { studentId, type, message } -> 201 notification'],
              ['GET', '/notifications?type=&page=&limit=', 'Paged list for the logged-in student'],
              ['PATCH', '/notifications/:id/read', 'Mark as read'],
              ['GET', '/priority-inbox?n=10', 'Top n unread, most important first'],
            ],
            rules: [
              'Notification: { ID, Type: Placement | Result | Event, Message, Timestamp, isRead }',
              'Priority weight: Placement > Result > Event, then newest first',
              'Use a heap of size n, not a full sort',
              'notifications-service publishes notification.created on Redis',
              'inbox-service subscribes and updates its inbox instantly',
              'Gateway routes /api/notifications/* and /api/inbox/*',
              'Every service logs through the logger package',
            ],
            sample: 'GET /api/inbox/priority-inbox?n=2\n[\n  { "ID": "d146...", "Type": "Placement", "Message": "CSX Corporation hiring",\n    "Timestamp": "2026-04-22 17:51:30" },\n  { "ID": "b283...", "Type": "Result", "Message": "mid-sem",\n    "Timestamp": "2026-04-22 17:51:18" }\n]',
          },
          {
            title: 'Vehicle Maintenance Scheduler',
            min: 150,
            brief: 'For each depot, pick the maintenance tasks that give the most impact within its mechanic-hour budget.',
            upstream: [
              ['GET', '/depots', '{ "depots": [{ "ID": 1, "MechanicHours": 60 }, ...] }'],
              ['GET', '/vehicles', '{ "vehicles": [{ "TaskID": "t-1", "Duration": 5, "Impact": 8 }, ...] }'],
            ],
            endpoints: [
              ['GET', '/schedule', 'Best task set for every depot'],
              ['GET', '/schedule/:depotId', 'Best task set for one depot'],
            ],
            rules: [
              'Each task is picked once or not at all (0/1 knapsack)',
              'Total Duration must be <= the depot MechanicHours',
              'Maximise total Impact',
              'Run the DP in a worker thread so the server stays responsive',
              'Cache results until the upstream data changes',
              'Unknown depot returns 404',
            ],
            sample: 'GET /schedule/1\n{\n  "depotId": 1, "mechanicHours": 60, "totalDuration": 58, "totalImpact": 91,\n  "tasks": ["t-3", "t-7", "t-12"]\n}',
          },
        ],
      },
      {
        title: 'Test & Ship',
        ship: 'A tested multi-service platform you start with one command',
        steps: [
          ['API Tests', 45, [
            'Vitest + Supertest against each express app',
            'Export app separately from app.listen()',
          ]],
          ['Mock Upstreams', 30, [
            'nock / msw to fake upstream APIs in tests',
            'Test the timeout path with a delayed mock',
          ]],
          ['Health & Shutdown', 20, [
            'GET /health on every service',
            'On SIGTERM: server.close(), then process.exit',
          ]],
          ['One-Command Dev', 20, [
            'Root "dev" script starts every service',
            '.env.example per service',
          ]],
        ],
        projects: [
          {
            title: 'Capstone: Mini Platform',
            min: 240,
            brief: 'Join your projects into one platform behind a gateway, wired with events and tests.',
            endpoints: [
              ['POST', '/api/auth/signup', 'auth-service: create user, return JWT'],
              ['POST', '/api/auth/login', 'auth-service: return JWT'],
              ['POST', '/api/urls', 'url-service: create a short link (JWT required)'],
              ['GET', '/api/urls/:code/stats', 'url-service: stats for your own link'],
              ['GET', '/:code', 'url-service: redirect'],
              ['GET', '/api/inbox/priority-inbox?n=10', 'inbox-service: your notifications'],
            ],
            rules: [
              'Services: gateway, auth, url, notifications, inbox, log',
              'When a link reaches 10 clicks, url-service publishes link.milestone',
              'notifications-service turns it into an Event notification for the owner',
              'Users can only see their own links and notifications',
              'Every service: /health, graceful shutdown, logger package, tests',
              'npm run dev starts the whole platform',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Containers Track',
    short: 'Box',
    sections: [
      {
        title: 'Run Things in Docker',
        ship: 'Postgres and Redis running in containers for your projects',
        steps: [
          ['First Containers', 30, [
            'docker run -d -p 6379:6379 redis:7',
            'docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16',
            'docker ps, docker logs -f, docker stop / rm',
          ]],
          ['Volumes & Env', 20, [
            '-v pgdata:/var/lib/postgresql/data keeps data',
            '--env-file .env instead of many -e flags',
          ]],
        ],
        projects: [
          {
            title: 'Containerised Dependencies',
            min: 45,
            brief: 'Run the Postgres and Redis your projects need in Docker, no local installs.',
            rules: [
              'Social Media Analytics and the Notifications Inbox use Redis in Docker',
              'Train Schedule Service uses Postgres in Docker',
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
            'COPY package*.json, RUN npm ci, COPY . .',
            'EXPOSE 5000, CMD ["node", "src/server.js"]',
          ]],
          ['Build & Run', 20, [
            'docker build -t url-service .',
            'docker run -p 5000:5000 --env-file .env url-service',
            '.dockerignore: node_modules, .env, .git',
          ]],
        ],
        projects: [
          {
            title: 'Containerise the URL Shortener',
            min: 45,
            brief: 'Ship the URL shortener as an image anyone can run.',
            rules: [
              'docker run starts it with no other setup',
              'Config only through environment variables',
              'Redirects and stats work from the container',
            ],
          },
        ],
      },
      {
        title: 'Better Images',
        ship: 'Small, safe images with health checks',
        steps: [
          ['Multi-Stage Build', 30, [
            'Stage 1: install + build, stage 2: copy only what runs',
            'npm ci --omit=dev in the final stage',
          ]],
          ['Run Safely', 20, [
            'USER node (non-root)',
            'HEALTHCHECK CMD wget -qO- localhost:5000/health',
          ]],
        ],
        projects: [
          {
            title: 'Slim the Aggregator Image',
            min: 45,
            brief: 'Get the Top Products Aggregator image under 150 MB.',
            rules: [
              'Multi-stage Dockerfile, final stage on node:22-alpine',
              'Runs as a non-root user',
              'docker ps shows the container as healthy',
            ],
          },
        ],
      },
      {
        title: 'Docker Compose',
        ship: 'Many containers started with one command',
        steps: [
          ['compose.yaml Basics', 30, [
            'services: build, ports, env_file',
            'Services call each other by name: http://mock:8090',
          ]],
          ['Startup Order', 20, [
            'healthcheck on each service',
            'depends_on: { db: { condition: service_healthy } }',
          ]],
          ['Dev Mode', 20, [
            'docker compose watch syncs code on save',
            'docker compose logs -f <service>',
          ]],
        ],
        projects: [
          {
            title: 'Compose the Aggregators',
            min: 60,
            brief: 'Run the Top Products Aggregator with all 5 mock company services in compose.',
            rules: [
              '6 containers: aggregator + 5 mock companies',
              'Aggregator finds the mocks by service name',
              'docker compose up and the API works',
            ],
          },
        ],
      },
      {
        title: 'Compose the Platform',
        ship: 'The whole capstone running in containers',
        steps: [
          ['Full Stack Compose', 40, [
            'gateway, auth, url, notifications, inbox, log',
            'postgres + redis with named volumes',
          ]],
          ['Networks & Secrets', 20, [
            'Only the gateway publishes a port',
            'Secrets via env_file, never baked into images',
          ]],
        ],
        projects: [
          {
            title: 'Capstone in Compose',
            min: 90,
            brief: 'Run the Mini Platform with docker compose up.',
            rules: [
              'Only the gateway is reachable from the host',
              'Every service healthy before the gateway starts',
              'Data survives docker compose down (without -v)',
            ],
          },
        ],
      },
      {
        title: 'Push & Deploy',
        ship: 'Images built in CI and running on a server',
        steps: [
          ['Registry', 20, [
            'docker tag + docker push to GHCR or Docker Hub',
            'Tag images with the git commit SHA',
          ]],
          ['CI Builds', 30, [
            'GitHub Actions: docker/build-push-action per service',
            'Build only when that service changed',
          ]],
          ['Run on a Server', 30, [
            'docker compose pull && docker compose up -d',
          ]],
        ],
        projects: [
          {
            title: 'CI/CD for the Platform',
            min: 90,
            brief: 'Every push to main builds, pushes and deploys your images.',
            rules: [
              'Tests run before any image is built',
              'Each service image is pushed with the commit SHA tag',
              'The server pulls and restarts with zero manual steps',
            ],
          },
        ],
      },
    ],
  },
];
