// 6-day code sprint: Node.js application development -> Node microservices.
// Each topic: [title, minutes, tasks]. Every task is something you write in code.
// Edit here, then run `npm run roadmap`.

export const days = [
  {
    title: 'Node Core & Project Setup',
    ship: 'A raw http server + a CLI tool, in a linted TypeScript project',
    topics: [
      ['Project Setup', 45, [
        'npm init, scripts, "type": "module"',
        'TypeScript strict + tsx watch',
        'ESLint flat config + Prettier',
        'src/ folder: app.ts vs server.ts',
      ]],
      ['Config & Env', 30, [
        'Load .env with --env-file / dotenv',
        'Validate env with a zod schema',
        'Export one typed config object',
      ]],
      ['Modules & File System', 60, [
        'ESM import / export, dynamic import()',
        'fs/promises read, write, readdir, mkdir',
        'path.join / resolve, import.meta.dirname',
        'Build a JSON file-backed data store',
      ]],
      ['Events & Streams', 75, [
        'class extends EventEmitter, on / once / emit',
        'Readable / Transform streams',
        'stream/promises pipeline()',
        'Stream a large file to an HTTP response',
      ]],
      ['Async Patterns', 45, [
        'Promise.all / allSettled / race',
        'for await...of over async iterators',
        'AbortController + AbortSignal.timeout',
      ]],
      ['Process & CLI', 45, [
        'process.argv with util.parseArgs',
        'Exit codes, SIGINT / SIGTERM handlers',
        'unhandledRejection / uncaughtException',
      ]],
      ['Raw HTTP Server', 90, [
        'http.createServer((req, res) => ...)',
        'Route by method + URL pathname',
        'Parse a JSON request body',
        'In-memory CRUD for /todos, no framework',
      ]],
      ['Workers & Crypto', 45, [
        'worker_threads for CPU-heavy work',
        'crypto.randomUUID, createHash, createHmac',
        'cluster.fork() one worker per CPU',
      ]],
    ],
  },
  {
    title: 'REST API with Express',
    ship: 'A production-shaped CRUD API with validation, errors and docs',
    topics: [
      ['Routing & Structure', 45, [
        'express.Router() per resource',
        'Routes -> controllers -> services',
        'Mount versioned routes at /api/v1',
      ]],
      ['Middleware', 45, [
        'Request-logger middleware',
        'express.json({ limit }) body parser',
        'asyncHandler wrapper for async routes',
      ]],
      ['Validation', 45, [
        'zod schemas for body, params, query',
        'validate(schema) middleware',
        'Return 400 / 422 with field errors',
      ]],
      ['Error Handling', 45, [
        'AppError class with statusCode',
        'Central error middleware + 404 handler',
        'Hide stack traces in production',
      ]],
      ['CRUD Resource', 75, [
        'GET list / one, POST, PATCH, DELETE',
        'Status codes 200, 201, 204, 404',
        'Map entities to response DTOs',
      ]],
      ['Pagination & Filters', 45, [
        'limit / offset and cursor pagination',
        '?sort=-createdAt parser',
        'Build filters from query safely',
      ]],
      ['File Uploads', 45, [
        'multer with size & MIME limits',
        'Save to disk, return file URL',
      ]],
      ['Security Middleware', 30, [
        'helmet(), cors() allow-list',
        'express-rate-limit per IP',
      ]],
      ['API Docs', 45, [
        'OpenAPI spec from zod schemas',
        'Serve with swagger-ui-express',
      ]],
    ],
  },
  {
    title: 'Database, Cache & Auth',
    ship: 'The API on Postgres + Redis with full JWT auth and roles',
    topics: [
      ['PostgreSQL + Prisma', 90, [
        'Model schema.prisma with relations',
        'prisma migrate dev, seed script',
        'include / select relations',
        '$transaction for multi-step writes',
      ]],
      ['Repository Layer', 45, [
        'UserRepository interface',
        'Prisma and in-memory implementations',
        'Inject repositories into services',
      ]],
      ['Redis Cache', 60, [
        'ioredis client setup',
        'Cache-aside get / set with TTL',
        'Invalidate keys on writes',
      ]],
      ['Password Auth', 45, [
        'Hash with argon2 / bcrypt',
        'POST /signup and POST /login',
      ]],
      ['JWT & Refresh', 75, [
        'Sign short-lived access tokens',
        'requireAuth middleware',
        'Refresh-token rotation stored in DB',
        'Logout revokes refresh tokens',
      ]],
      ['RBAC', 45, [
        'Roles on the user model',
        'authorize("admin") middleware',
        'Resource ownership checks',
      ]],
      ['Account Flows', 60, [
        'Email verification token',
        'Forgot / reset password endpoints',
      ]],
      ['MongoDB (Bonus)', 60, [
        'Mongoose schema, model, validators',
        'populate() and an aggregation pipeline',
      ]],
    ],
  },
  {
    title: 'Real-time, Jobs & Testing',
    ship: 'Live updates, background jobs, and a green test suite',
    topics: [
      ['WebSockets', 60, [
        'Socket.IO on the HTTP server',
        'JWT auth on handshake',
        'Rooms + broadcast events',
      ]],
      ['Job Queues', 75, [
        'BullMQ Queue + Worker',
        'Retries with exponential backoff',
        'Delayed jobs + repeatable cron jobs',
      ]],
      ['Email & Storage', 60, [
        'nodemailer emails sent via the queue',
        'S3 presigned upload URLs',
        'Resize images with sharp in a job',
      ]],
      ['Webhooks', 45, [
        'Stripe Checkout session endpoint',
        'Verify webhook signature (raw body)',
        'Idempotent webhook handler',
      ]],
      ['Unit Tests', 60, [
        'Vitest setup',
        'Test services with fake repositories',
        'vi.fn() mocks and spies',
      ]],
      ['Integration Tests', 75, [
        'Supertest against the Express app',
        'Testcontainers Postgres + Redis',
        'Seed / truncate between tests',
      ]],
      ['Logging & Health', 60, [
        'pino + pino-http with requestId',
        'AsyncLocalStorage request context',
        '/health/live and /health/ready',
        'Graceful shutdown on SIGTERM',
      ]],
    ],
  },
  {
    title: 'Microservices & Events',
    ship: 'Users, catalog, orders, payments services talking over HTTP + events',
    topics: [
      ['Monorepo', 45, [
        'npm workspaces: services/* + packages/*',
        'Shared packages: config, logger, errors',
      ]],
      ['Service Template', 45, [
        'Bootstrap: config, logger, health, shutdown',
        'Scaffold each service from it',
        'One database per service',
      ]],
      ['API Gateway', 60, [
        'http-proxy-middleware route per service',
        'Verify JWT once at the gateway',
        'Forward user claims + x-request-id',
      ]],
      ['Service HTTP Clients', 45, [
        'undici client per downstream service',
        'Typed SDK package per service',
      ]],
      ['RabbitMQ Events', 75, [
        'amqplib exchange, queues, bindings',
        'Publish / consume with ack / nack',
        'Dead-letter queue for failures',
        'zod-validated versioned event schemas',
      ]],
      ['Outbox & Idempotency', 60, [
        'Write event row in the same DB tx',
        'Relay worker publishes outbox rows',
        'Store processed message IDs, skip dupes',
      ]],
      ['Order Saga', 60, [
        'order.created -> payment -> stock flow',
        'Compensating actions on failure',
        'Persist saga state',
      ]],
      ['Resilience', 60, [
        'Timeouts + retries with jitter (p-retry)',
        'Circuit breaker with opossum + fallback',
        'Redis rate limit shared across instances',
      ]],
      ['gRPC (Bonus)', 45, [
        '.proto file + @grpc/grpc-js server & client',
      ]],
    ],
  },
  {
    title: 'Containers, Observability & Ship',
    ship: 'The full stack running with one command, traced and deployed by CI',
    topics: [
      ['Dockerfile', 45, [
        'Multi-stage build on node:22-alpine',
        'npm ci --omit=dev, run as non-root',
        '.dockerignore + HEALTHCHECK',
      ]],
      ['Docker Compose', 60, [
        'Gateway + services + Postgres, Redis, RabbitMQ',
        'depends_on with healthchecks',
        'docker compose up runs everything',
      ]],
      ['Tracing', 60, [
        'OpenTelemetry SDK auto-instrumentation',
        'Propagate traceparent over HTTP + messages',
        'View a request across services in Jaeger',
      ]],
      ['Metrics', 45, [
        'prom-client histograms per route',
        'Expose /metrics, scrape with Prometheus',
      ]],
      ['E2E & Load Test', 60, [
        'E2E: signup -> order -> pay -> notify',
        'k6 / autocannon load test the gateway',
      ]],
      ['CI/CD', 60, [
        'GitHub Actions: lint, test, build',
        'Build & push an image per service',
      ]],
      ['Kubernetes', 60, [
        'Deployment + Service per microservice',
        'ConfigMap, Secret, liveness / readiness probes',
      ]],
      ['Capstone Demo', 60, [
        'Live order status over WebSockets',
        'Notifications service sends emails',
        'Record the full flow end-to-end',
      ]],
    ],
  },
];
