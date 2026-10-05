// Node.js microservices: the shortest code-only path + a containers track.
// Every project is a real backend assessment question, rebuilt as a spec.
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
        ship: 'Two working microservices: one calls slow APIs, one answers from memory',
        steps: [
          ['Setup in 10 Minutes', 20, [
            'npm init -y, npm i express',
            '"type": "module", "dev": "node --watch src/server.js"',
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
            'asyncHandler wrapper for async routes',
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
              ['', 'Test server behaviour', 'Runs on port 8090. Every call waits a random 0-550 ms, and about 10% of calls return 503'],
            ],
            endpoints: [
              ['GET', '/numbers?url=<u1>&url=<u2>...', '{ "numbers": [merged unique integers] }'],
            ],
            rules: [
              'The "url" query param can appear more than once',
              'Only fetch urls that are syntactically valid',
              'Collect the response from each valid url',
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
            sample: 'GET /prefixes?keywords=bonfire,bool\n[\n  { "keyword": "bonfire", "status": "found", "prefix": "bonf" },\n  { "keyword": "bool", "status": "not_found", "prefix": "not_applicable" }\n]\n\nGET /prefixes?keywords=bonfire,bonsai\n[\n  { "keyword": "bonfire", "status": "found", "prefix": "bonf" },\n  { "keyword": "bonsai", "status": "found", "prefix": "bons" }\n]',
          },
        ],
      },
      {
        title: 'Logging, Tokens & Links',
        ship: 'A reusable logging package and a URL shortener that uses it',
        steps: [
          ['Reusable Package', 40, [
            'Logging Middleware/ folder with its own package.json',
            'npm workspaces, or a relative import, to share it',
            'Validate every argument before sending',
          ]],
          ['Bearer Token Client', 40, [
            'POST /register once, keep clientID + clientSecret',
            'POST /auth for an access_token',
            'Send Authorization: Bearer <token> on every call',
          ]],
          ['In-Memory Store', 30, [
            'Map as a store keyed by shortcode',
            'Generate short codes with crypto.randomBytes',
          ]],
          ['Redirects & Headers', 20, [
            'res.redirect(url)',
            'Read the Referer header and client IP',
            'ISO 8601 dates with new Date().toISOString()',
          ]],
        ],
        projects: [
          {
            title: 'Logging Middleware',
            min: 120,
            brief: 'A reusable Log(stack, level, package, message) function that sends every log to the test server. Every later project must use it.',
            upstream: [
              ['POST', '/register', 'Body { email, name, mobileNo, githubUsername, rollNo, accessCode } -> clientID, clientSecret'],
              ['POST', '/auth', 'Body { email, name, rollNo, accessCode, clientID, clientSecret } -> access_token (Bearer)'],
              ['POST', '/logs', 'Bearer token. Body { stack, level, package, message }'],
            ],
            rules: [
              'stack: "backend" | "frontend"',
              'level: "debug" | "info" | "warn" | "error" | "fatal"',
              'package (backend only): cache, controller, cron_job, db, domain, handler, repository, route, service',
              'package (frontend only): api, component, hook, page, state, style',
              'package (both): auth, config, middleware, utils',
              'All values must be lowercase and from these lists',
              'Lives in its own "Logging Middleware" folder and is reused by the other projects',
              'Log significant events in your app through Log(), not console.log',
            ],
            sample: 'Log("backend", "error", "handler", "received string, expected bool")\nLog("backend", "fatal", "db", "Critical database connection failure.")',
          },
          {
            title: 'URL Shortener Microservice',
            min: 150,
            brief: 'Shorten URLs with an expiry and optional custom code, redirect, and report click statistics.',
            endpoints: [
              ['POST', '/shorturls', 'Body { url, validity?, shortcode? } -> 201 { shortLink, expiry }'],
              ['GET', '/shorturls/:shortcode', 'Statistics for one short link'],
              ['GET', '/:shortcode', 'Redirect to the original URL'],
            ],
            rules: [
              'validity is in minutes and defaults to 30',
              'shortcode is optional and alphanumeric. If missing, generate a unique one',
              'Every shortcode must be unique',
              'expiry is an ISO 8601 timestamp',
              'Stats: original URL, creation date, expiry, total clicks, and per-click timestamp, referrer and location',
              'Return proper status codes and JSON errors for bad input, taken codes, unknown or expired links',
              'Use your Logging Middleware for every significant event',
              'Folder layout: Logging Middleware / Backend Test Submission',
            ],
            sample: 'POST /shorturls\n{ "url": "https://example.com/very/long/path", "validity": 30, "shortcode": "abcd1" }\n201 { "shortLink": "http://localhost:5000/abcd1", "expiry": "2026-01-01T00:30:00Z" }',
          },
        ],
      },
      {
        title: 'Aggregator Services',
        ship: 'Services that pull from authenticated upstreams, compute, and cache',
        steps: [
          ['Fan-Out Calls', 30, [
            'Promise.all over several upstream calls',
            'Attach the source name to every result',
          ]],
          ['Sort & Filter', 30, [
            'Sort by any field, asc / desc',
            'Filter by min / max price from the query',
          ]],
          ['Cache with TTL', 30, [
            'Map<key, { value, expiresAt }> cache helper',
            'Reuse cached upstream data to cut API calls',
          ]],
          ['Math in Code', 40, [
            'Average, covariance, standard deviation',
            'Pearson correlation of two price series',
            'Pair two time series by nearest timestamp',
          ]],
        ],
        projects: [
          {
            title: 'Top Products Microservice',
            min: 150,
            brief: 'You have access to the APIs of 5 e-commerce companies. Build a public API that shows the top N products in a category and price range across all of them.',
            upstream: [
              ['', 'Test server', 'Register once through a single API to access all 5 companies'],
              ['GET', 'Company product APIs', 'Top products per company, category and price range'],
            ],
            endpoints: [
              ['GET', '/categories/:categoryname/products?n=&minPrice=&maxPrice=', 'Top n products in that category across all companies'],
            ],
            rules: [
              'Query all 5 companies and merge the results',
              'Respect the requested price range',
              'Return the top n products so users can compare companies',
              'Meet the API usage and performance limits of the test server',
            ],
          },
          {
            title: 'Stock Price Aggregation',
            min: 150,
            brief: 'Average price of a stock over the last m minutes, and the correlation between two stocks.',
            upstream: [
              ['GET', '/stocks', 'Bearer. All tickers'],
              ['GET', '/stocks/:ticker', 'Bearer. Latest { price, lastUpdatedAt }'],
              ['GET', '/stocks/:ticker?minutes=m', 'Bearer. [{ price, lastUpdatedAt }, ...] for the last m minutes'],
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
              'Cache upstream data: API calls are limited',
            ],
            sample: 'GET /stocks/NVDA?minutes=50&aggregation=average\n{\n  "averageStockPrice": 453.56,\n  "priceHistory": [\n    { "price": 231.95, "lastUpdatedAt": "2026-05-08T04:26:27.465Z" },\n    { "price": 675.17, "lastUpdatedAt": "2026-05-08T04:37:23.825Z" }\n  ]\n}\n\nGET /stockcorrelation?minutes=50&ticker=NVDA&ticker=PYPL\n{\n  "correlation": -0.9367,\n  "stocks": {\n    "NVDA": { "averagePrice": 204.00, "priceHistory": [...] },\n    "PYPL": { "averagePrice": 458.60, "priceHistory": [...] }\n  }\n}',
          },
        ],
      },
      {
        title: 'Database & Auth',
        ship: 'Data-backed CRUD and auth services',
        steps: [
          ['Prisma + SQLite', 45, [
            'npx prisma init --datasource-provider sqlite',
            'Write models, run npx prisma migrate dev',
            'create, findMany, update, delete',
          ]],
          ['Switch to Postgres', 20, [
            'provider = "postgresql" + DATABASE_URL',
            'Run the same migrations again',
          ]],
          ['Password Auth', 45, [
            'bcrypt.hash on signup, bcrypt.compare on login',
            'jwt.sign({ sub }, secret, { expiresIn })',
            'requireAuth middleware reads Authorization: Bearer',
          ]],
          ['Filters from Query', 25, [
            'where: { date, mood } built from req.query',
            'Validate enums with zod',
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
            sample: 'POST /signup\n{ "first_name": "Ava", "last_name": "Rao", "email": "ava@x.com", "password": "..." }\n\nPOST /login\n{ "email": "ava@x.com", "password": "..." }',
          },
          {
            title: 'Journal CRUD API',
            min: 30,
            brief: 'Build journal CRUD APIs in 30 minutes, any stack.',
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
        title: 'Multi-Service Systems',
        ship: 'Services that fetch from the test server and run real algorithms',
        steps: [
          ['Priority Queue', 30, [
            'Min-heap class: push, pop, peek',
            'Top-N with a heap instead of a full sort',
          ]],
          ['Dynamic Programming', 40, [
            '0/1 knapsack table: dp[i][capacity]',
            'Walk the table back to list the chosen items',
          ]],
          ['Worker Threads', 20, [
            'Move the DP into worker_threads',
          ]],
          ['Several Services', 40, [
            'One folder per service, one port each',
            'Shared Logging Middleware in every service',
            'npm run dev starts them all (concurrently)',
          ]],
        ],
        projects: [
          {
            title: 'Campus Notifications Microservice',
            min: 180,
            brief: 'Students get Placement, Result and Event notifications. Design the notification API, then build a priority inbox.',
            upstream: [
              ['GET', '/notifications', 'Bearer. All notifications from the test server'],
            ],
            endpoints: [
              ['POST', '/api/notifications', 'Create a notification'],
              ['GET', '/api/students/:id/notifications?page=&limit=', 'All notifications for a student'],
              ['GET', '/api/students/:id/notifications/unread', 'Unread notifications'],
              ['PATCH', '/api/students/:id/notifications/:nid/read', 'Mark one as read'],
              ['PATCH', '/api/students/:id/notifications/read-all', 'Mark all as read'],
              ['GET', '/priority-inbox', 'Top 10 unread notifications'],
            ],
            rules: [
              'Notification types: Placement, Result, Event',
              'Priority: Placement > Result > Event, then newest first',
              'Priority inbox returns the top 10 unread notifications',
              'Use a heap for the top 10, not a full sort',
              'Write the API design (stage 1) in a markdown file in the repo',
              'Use your Logging Middleware throughout',
            ],
          },
          {
            title: 'Vehicle Maintenance Scheduler',
            min: 150,
            brief: 'Pick the maintenance tasks that give the most impact within a depot\'s mechanic-hour budget.',
            upstream: [
              ['GET', '/depots', 'Bearer. { "depots": [{ ..., "MechanicHours": 60 }] }'],
              ['GET', '/vehicles', 'Bearer. { "vehicles": [{ "TaskID": "...", "Duration": 5, "Impact": 8 }] }'],
            ],
            endpoints: [
              ['GET', '/schedule-maintenance', 'Best task set for the depot'],
            ],
            rules: [
              'Each task is picked at most once (0/1 knapsack)',
              'Total Duration must be <= MechanicHours',
              'Maximise total Impact',
              'Return the chosen TaskIDs, total duration, total impact and mechanic hours',
              'Use your Logging Middleware throughout',
            ],
            sample: 'GET /schedule-maintenance\n{\n  "selectedTaskIDs": ["t-3", "t-7", "t-12"],\n  "totalDuration": 58,\n  "totalImpact": 91,\n  "mechanicHours": 60\n}',
          },
        ],
      },
      {
        title: 'Test & Mock Rounds',
        ship: 'Tested services, and two full rehearsals under the real time limits',
        steps: [
          ['API Tests', 45, [
            'Vitest + Supertest against each express app',
            'Export app separately from app.listen()',
          ]],
          ['Mock Upstreams', 30, [
            'nock / msw to fake the test server in tests',
            'Test the 500 ms timeout with a delayed mock',
          ]],
          ['Submission Hygiene', 20, [
            'Public repo named with your roll number',
            '.env.example only, never commit tokens or secrets',
            'README with run steps + screenshots of each API',
          ]],
        ],
        projects: [
          {
            title: 'Mock Round: 3-Hour Assessment',
            min: 180,
            brief: 'Rebuild the Logging Middleware and URL Shortener from an empty repo in 3 hours.',
            rules: [
              'Fresh public repo, folders: Logging Middleware / Backend Test Submission',
              'No copying from your earlier code',
              'Every requirement of both projects met',
              'Screenshots of every API call in the README',
              'Stop at 3 hours and note what is missing',
            ],
          },
          {
            title: 'Mock Round: Journal CRUD in 30 Minutes',
            min: 30,
            brief: 'Redo the Journal CRUD API with a timer running.',
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
            brief: 'Run the databases your projects need in Docker, no local installs.',
            rules: [
              'User Management Service and Journal API use Postgres in Docker',
              'Stock Price Aggregation caches in Redis in Docker',
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
            brief: 'Ship the URL Shortener as an image anyone can run.',
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
            title: 'Slim the Stock Service Image',
            min: 45,
            brief: 'Get the Stock Price Aggregation image under 150 MB.',
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
            'Services call each other by name: http://testserver:8090',
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
            title: 'Compose Numbers + Test Server',
            min: 60,
            brief: 'Run the Number Management Service next to its Go test server in compose.',
            rules: [
              'testserver service built from golang:1.22-alpine running testserver.go',
              'numbers service calls http://testserver:8090/primes etc.',
              'docker compose up and the 500 ms rule still holds',
            ],
          },
        ],
      },
      {
        title: 'Compose Many Services',
        ship: 'Several of your services running together in containers',
        steps: [
          ['Multi-Service Compose', 40, [
            'One service block per microservice',
            'postgres + redis with named volumes',
          ]],
          ['Networks & Secrets', 20, [
            'Publish only the ports you need',
            'Secrets via env_file, never baked into images',
          ]],
        ],
        projects: [
          {
            title: 'Compose the Day 5 Services',
            min: 90,
            brief: 'Run Campus Notifications and the Vehicle Scheduler together with docker compose up.',
            rules: [
              'Each service in its own container with a healthcheck',
              'Both use the shared Logging Middleware',
              'Bearer token and secrets come from env_file',
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
            title: 'CI/CD for Your Services',
            min: 90,
            brief: 'Every push to main tests, builds, pushes and deploys your images.',
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
