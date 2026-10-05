// Roadmap content: application development in Node.js and Node microservices.
// Every task is something you write in code. Edit here, then run `npm run roadmap`.

export const phases = [
  {
    title: 'Node Runtime Core',
    topics: [
      ['Modules', [
        'ESM import / export, "type": "module"',
        'CommonJS require / module.exports',
        'Dynamic import() for lazy loading',
        'import.meta.dirname, import.meta.url',
      ]],
      ['File System', [
        'fs/promises readFile, writeFile, appendFile',
        'Walk folders with readdir + stat',
        'mkdir({ recursive }), rm, rename',
        'Build a JSON file-backed data store',
      ]],
      ['Path & URL', [
        'path.join, path.resolve, path.extname',
        'new URL(), URLSearchParams',
        'fileURLToPath / pathToFileURL',
      ]],
      ['Events', [
        'class extends EventEmitter',
        'on / once / off, emit with payloads',
        'Handle the "error" event',
        'await events.once(emitter, "ready")',
      ]],
      ['Streams', [
        'Readable, Writable, Transform classes',
        'stream/promises pipeline()',
        'Stream a large file to an HTTP response',
        'readline over a CSV, line by line',
      ]],
      ['Buffers & Crypto', [
        'Buffer.from / alloc, base64 / hex encoding',
        'crypto.randomUUID(), randomBytes',
        'createHash("sha256"), createHmac',
        'timingSafeEqual to compare secrets',
      ]],
      ['Process', [
        'process.env, process.argv, exit codes',
        'Listen to SIGINT / SIGTERM',
        'uncaughtException, unhandledRejection',
        'Write a CLI tool with util.parseArgs',
      ]],
      ['Async Patterns', [
        'Promise.all / allSettled / race / any',
        'for await...of over async iterators',
        'AbortController + AbortSignal.timeout',
        'util.promisify callback APIs',
      ]],
      ['Raw HTTP Server', [
        'http.createServer((req, res) => ...)',
        'Route by req.method + URL pathname',
        'Read and parse a JSON request body',
        'Set status codes and headers manually',
      ]],
      ['Concurrency', [
        'worker_threads for CPU-heavy work',
        'child_process spawn / exec / fork',
        'cluster.fork() one worker per CPU',
      ]],
    ],
  },
  {
    title: 'Project Setup & Tooling',
    topics: [
      ['npm & package.json', [
        'npm init, scripts, dependencies vs devDependencies',
        'Semver ranges and package-lock.json',
        'npx and local bin scripts',
      ]],
      ['TypeScript', [
        'tsconfig.json with strict mode',
        'Run with tsx, build to dist/ with tsc',
        'Typed Express req / res / handlers',
      ]],
      ['Lint & Format', [
        'ESLint flat config (eslint.config.js)',
        'Prettier + editor format on save',
        'husky + lint-staged pre-commit hook',
      ]],
      ['Config & Env', [
        'Load .env with dotenv / --env-file',
        'Validate env with a zod schema',
        'Fail fast at boot on invalid config',
        'Export one typed config object',
      ]],
      ['Folder Structure', [
        'src/routes, controllers, services, repositories',
        'Split app.ts (Express app) from server.ts',
        'Path aliases via package.json "imports"',
      ]],
      ['Dev Loop', [
        'node --watch / nodemon for reloads',
        'node --inspect + VS Code launch.json',
        'Breakpoints in route handlers',
      ]],
    ],
  },
  {
    title: 'REST API with Express',
    topics: [
      ['Routing', [
        'express.Router() per resource',
        'Route params, query strings',
        'Mount versioned routes at /api/v1',
      ]],
      ['Middleware', [
        'Write request-logger middleware',
        'express.json() and urlencoded parsers',
        'asyncHandler wrapper for async routes',
        'Middleware order: parse, auth, route, error',
      ]],
      ['Controllers & Services', [
        'Thin controllers, logic in services',
        'Map entities to response DTOs',
        'Inject dependencies into services',
      ]],
      ['Validation', [
        'zod schemas for body, params, query',
        'validate(schema) middleware',
        'Return 400 / 422 with field errors',
      ]],
      ['Error Handling', [
        'AppError class with statusCode',
        'Central error-handling middleware',
        '404 not-found handler',
        'Hide stack traces in production',
      ]],
      ['CRUD Resource', [
        'GET list, GET one, POST, PATCH, DELETE',
        'Correct status codes: 200, 201, 204, 404',
        'Location header on create',
      ]],
      ['Pagination & Filters', [
        'limit / offset and cursor pagination',
        '?sort=-createdAt parser',
        'Build filters from query params safely',
      ]],
      ['File Uploads', [
        'multer disk and memory storage',
        'File size and MIME type limits',
        'Stream uploads straight to S3',
      ]],
      ['Security Middleware', [
        'helmet() secure headers',
        'cors() with an origin allow-list',
        'express-rate-limit per IP',
        'Limit body size: express.json({ limit })',
      ]],
      ['API Docs', [
        'Write an OpenAPI spec',
        'Serve it with swagger-ui-express',
        'Generate the spec from zod schemas',
      ]],
      ['Fastify Version', [
        'Rebuild the API with Fastify plugins',
        'JSON-schema route validation',
        'Hooks (onRequest, preHandler) & decorators',
      ]],
    ],
  },
  {
    title: 'Databases & Data Layer',
    topics: [
      ['PostgreSQL + pg', [
        'pg.Pool connection pool',
        'Parameterized queries ($1, $2)',
        'BEGIN / COMMIT / ROLLBACK transactions',
      ]],
      ['Prisma ORM', [
        'Model schema.prisma with relations',
        'prisma migrate dev / deploy',
        'include / select relations',
        '$transaction for multi-step writes',
      ]],
      ['Drizzle / Knex', [
        'Type-safe query builder queries',
        'Joins, aggregates, raw SQL escapes',
        'Migration files in code',
      ]],
      ['MongoDB + Mongoose', [
        'Schemas, models, validators',
        'populate() references',
        'Aggregation pipelines',
        'Compound and unique indexes',
      ]],
      ['Migrations & Seeds', [
        'Versioned migration scripts',
        'Seed script with fake data (faker)',
        'Reset DB between test runs',
      ]],
      ['Repository Pattern', [
        'UserRepository interface',
        'Postgres and in-memory implementations',
        'Inject repositories into services',
      ]],
      ['Redis Caching', [
        'ioredis client setup',
        'Cache-aside: get, miss, set with TTL',
        'Invalidate keys on writes',
        'Distributed lock with SET NX PX',
      ]],
      ['Full-Text Search', [
        'Postgres tsvector + GIN index',
        'Elasticsearch / Meilisearch client',
        'Sync index on create / update / delete',
      ]],
    ],
  },
  {
    title: 'Auth & Security',
    topics: [
      ['Password Auth', [
        'Hash with argon2 / bcrypt',
        'POST /signup and POST /login',
        'Verify hash, return tokens',
      ]],
      ['JWT', [
        'Sign short-lived access tokens',
        'requireAuth middleware verifies token',
        'Refresh-token rotation stored in DB',
        'Revoke refresh tokens on logout',
      ]],
      ['Sessions & Cookies', [
        'express-session with a Redis store',
        'httpOnly, secure, sameSite cookies',
        'Destroy session on logout',
      ]],
      ['OAuth2 Login', [
        'Passport Google / GitHub strategies',
        'Callback route, upsert user',
        'Link social accounts to a user',
      ]],
      ['RBAC & Permissions', [
        'Roles on the user model',
        'authorize("admin") middleware',
        'Resource ownership checks',
      ]],
      ['Account Flows', [
        'Email verification tokens',
        'Forgot / reset password flow',
        'TOTP two-factor auth with otplib',
      ]],
      ['API Keys', [
        'Generate keys, store only the hash',
        'x-api-key header middleware',
        'Scopes and per-key rate limits',
      ]],
      ['Hardening', [
        'Block NoSQL / SQL injection inputs',
        'CSRF tokens for cookie auth',
        'npm audit + dependency updates in CI',
      ]],
    ],
  },
  {
    title: 'Real-time & Background Work',
    topics: [
      ['WebSockets', [
        'ws server attached to the HTTP server',
        'Socket.IO rooms and namespaces',
        'Authenticate on handshake (JWT)',
        'Scale with the Redis adapter',
      ]],
      ['Server-Sent Events', [
        'text/event-stream endpoint',
        'Heartbeat / keep-alive comments',
        'Resume with Last-Event-ID',
      ]],
      ['Job Queues', [
        'BullMQ Queue + Worker',
        'Retries with exponential backoff',
        'Delayed and prioritized jobs',
        'Dashboard with Bull Board',
      ]],
      ['Scheduled Jobs', [
        'node-cron schedules',
        'Repeatable BullMQ jobs',
        'Lock so only one instance runs a job',
      ]],
      ['Email & Notifications', [
        'nodemailer SMTP transport',
        'HTML templates (Handlebars / MJML)',
        'Send emails through a queue',
      ]],
      ['File Storage', [
        'AWS SDK v3 PutObject / GetObject',
        'Presigned upload & download URLs',
        'Resize images with sharp',
      ]],
      ['Payments & Webhooks', [
        'Stripe Checkout session endpoint',
        'Verify webhook signatures (raw body)',
        'Idempotent webhook handlers',
      ]],
      ['3rd-Party API Clients', [
        'fetch / undici with timeouts',
        'Retry transient failures',
        'Typed client wrapper module',
      ]],
    ],
  },
  {
    title: 'Testing',
    topics: [
      ['Unit Tests', [
        'Vitest / Jest / node:test setup',
        'Test services with fake repositories',
        'vi.fn() / jest.fn() spies and mocks',
      ]],
      ['Integration Tests', [
        'Supertest against the Express app',
        'Separate test database',
        'beforeEach truncate / seed',
      ]],
      ['Mocking External Calls', [
        'nock / msw for HTTP calls',
        'Fake timers for cron & retries',
        'Mock the queue and mailer',
      ]],
      ['Testcontainers', [
        'Start Postgres and Redis in tests',
        'Run migrations before the suite',
        'Stop containers after the suite',
      ]],
      ['Contract Tests', [
        'Pact consumer test in client service',
        'Pact provider verification',
        'Event schema tests between services',
      ]],
      ['E2E & Load Tests', [
        'E2E flow: signup, order, pay',
        'Load test with k6 / autocannon',
        'Compare p95 latency before / after',
      ]],
      ['Coverage in CI', [
        'c8 / istanbul coverage reports',
        'Coverage thresholds that fail builds',
        'Run tests in GitHub Actions',
      ]],
    ],
  },
  {
    title: 'Observability & Production',
    topics: [
      ['Structured Logging', [
        'pino logger + pino-http',
        'Child loggers with requestId',
        'Redact passwords and tokens',
      ]],
      ['Request Context', [
        'AsyncLocalStorage per request',
        'Read / set x-request-id header',
        'Pass the ID to downstream calls',
      ]],
      ['Health Checks', [
        'GET /health/live',
        'GET /health/ready pings DB & Redis',
      ]],
      ['Metrics', [
        'prom-client counters & histograms',
        'HTTP duration middleware',
        'Expose GET /metrics',
      ]],
      ['Tracing', [
        'OpenTelemetry Node SDK setup',
        'Auto-instrument http, express, pg',
        'Custom spans around business logic',
      ]],
      ['Graceful Shutdown', [
        'On SIGTERM: server.close()',
        'Drain in-flight requests and workers',
        'Close DB pools and Redis',
      ]],
      ['Performance', [
        'compression(), ETag, Cache-Control',
        'Profile with --cpu-prof / clinic.js',
        'Run with PM2 cluster mode',
      ]],
      ['Error Tracking', [
        'Sentry SDK init',
        'Capture exceptions in error middleware',
        'Attach user and request context',
      ]],
    ],
  },
  {
    title: 'Microservices Foundations',
    topics: [
      ['Monorepo', [
        'npm / pnpm workspaces',
        'packages/: shared types, logger, errors',
        'Turborepo build & test pipelines',
      ]],
      ['Split Into Services', [
        'users, catalog, orders, payments, notify',
        'Each service owns its own database',
        'No cross-service DB queries',
      ]],
      ['Service Template', [
        'Shared bootstrap: config, logger, health',
        'Shared error handler & shutdown',
        'Scaffold new services from the template',
      ]],
      ['Service HTTP Clients', [
        'undici client per downstream service',
        'Typed SDK package for each service',
        'Forward auth and request IDs',
      ]],
      ['gRPC', [
        'Write .proto service definitions',
        '@grpc/grpc-js server & client',
        'Server-streaming RPCs',
      ]],
      ['API Gateway', [
        'http-proxy-middleware routes per service',
        'Verify JWT once at the gateway',
        'Gateway rate limits & CORS',
      ]],
      ['GraphQL Gateway', [
        'Apollo Server resolvers',
        'DataLoader to batch service calls',
        'Federated subgraphs per service',
      ]],
      ['Service Auth', [
        'Propagate user claims in headers',
        'Signed internal service tokens',
        'Reject untrusted internal calls',
      ]],
    ],
  },
  {
    title: 'Event-Driven Microservices',
    topics: [
      ['RabbitMQ', [
        'amqplib exchanges, queues, bindings',
        'Publish and consume with ack / nack',
        'Dead-letter queues for failures',
      ]],
      ['Kafka', [
        'kafkajs producer & consumer',
        'Consumer groups, partition keys',
        'Commit offsets after processing',
      ]],
      ['Event Contracts', [
        'Versioned event types: order.created.v1',
        'zod validation on publish & consume',
        'Shared events package',
      ]],
      ['Outbox Pattern', [
        'Insert event row in the same DB tx',
        'Relay worker publishes outbox rows',
        'Mark rows as sent',
      ]],
      ['Saga', [
        'Orchestrated order -> payment -> stock saga',
        'Compensating actions on failure',
        'Persist saga state',
      ]],
      ['Idempotency', [
        'Idempotency-Key header on POST',
        'Store processed message IDs',
        'Skip duplicate deliveries',
      ]],
      ['CQRS & Projections', [
        'Separate write & read models',
        'Project events into a read DB',
        'Rebuild projections by replaying',
      ]],
      ['Redis Streams', [
        'XADD to publish events',
        'XREADGROUP consumer groups',
        'XACK and pending-entry recovery',
      ]],
    ],
  },
  {
    title: 'Resilience & Scaling',
    topics: [
      ['Timeouts & Retries', [
        'AbortSignal.timeout on every call',
        'Exponential backoff with jitter (p-retry)',
        'Retry only idempotent operations',
      ]],
      ['Circuit Breaker', [
        'Wrap calls with opossum',
        'Fallback responses when open',
        'Emit breaker state as metrics',
      ]],
      ['Rate Limiting (Redis)', [
        'Redis token bucket / sliding window',
        'Shared limits across instances',
        'Return 429 with Retry-After',
      ]],
      ['Concurrency Control', [
        'p-limit for outgoing calls',
        'Worker concurrency in queues',
        'Shed load when queues are full',
      ]],
      ['Cross-Service Caching', [
        'Cache downstream responses',
        'Invalidate via events',
      ]],
      ['Distributed Tracing', [
        'Propagate W3C traceparent over HTTP',
        'Inject trace context into messages',
        'Follow one request through all services',
      ]],
      ['Service Discovery', [
        'Service URLs from env / DNS',
        'Kubernetes Service DNS names',
        'Consul registration (optional)',
      ]],
    ],
  },
  {
    title: 'Containers & Delivery',
    topics: [
      ['Dockerfile', [
        'Multi-stage build on node:22-alpine',
        'npm ci --omit=dev, run as non-root',
        '.dockerignore and HEALTHCHECK',
      ]],
      ['Docker Compose', [
        'All services + Postgres, Redis, RabbitMQ',
        'depends_on with healthchecks',
        'Volumes and per-service env files',
      ]],
      ['Kubernetes', [
        'Deployment + Service per microservice',
        'ConfigMap and Secret',
        'Liveness / readiness probes, HPA',
      ]],
      ['CI/CD Pipeline', [
        'GitHub Actions: lint, test, build',
        'Build & push images per changed service',
        'Deploy on merge to main',
      ]],
      ['Reverse Proxy', [
        'Nginx / Traefik in front of the gateway',
        'TLS certificates',
      ]],
      ['Secrets & Environments', [
        'dev / staging / prod configs',
        'Load secrets from a secrets manager',
      ]],
    ],
  },
  {
    title: 'Capstone: E-Commerce App',
    topics: [
      ['API Gateway', [
        'Route /users, /products, /orders',
        'JWT verification and rate limits',
      ]],
      ['Users Service', [
        'Signup, login, refresh, roles',
        'Postgres + Prisma',
      ]],
      ['Catalog Service', [
        'Products CRUD, search, image upload',
        'Redis cache for product pages',
      ]],
      ['Orders Service', [
        'Create order, outbox events',
        'Order saga with payments & stock',
      ]],
      ['Payments Service', [
        'Stripe checkout + webhooks',
        'Publish payment.succeeded / failed',
      ]],
      ['Notifications Service', [
        'Consume events, queue emails',
        'Live order status over WebSockets',
      ]],
      ['Ship It', [
        'docker compose up for the full stack',
        'Tests, tracing, dashboards, CI/CD',
      ]],
    ],
  },
];
