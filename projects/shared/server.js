// Shared startup for every service: logger, /health, graceful shutdown.
import { initLogger, Log } from 'logging-middleware';
import { createApiClient } from './apiClient.js';

// #region Tokens & Secrets
// Secrets come from the environment (.env locally, env_file in Docker, CI secrets in Actions).
// Never hardcode them, never commit .env, never ship them to a browser bundle.
export function upstreamFromEnv(baseUrl = process.env.API_BASE_URL ?? 'http://localhost:8090') {
  return createApiClient({
    baseUrl,
    token: process.env.ACCESS_TOKEN || null,
    credentials: {
      email: process.env.EMAIL, name: process.env.NAME, rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE, clientID: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET,
    },
  });
}
// #endregion

export function start(app, { name, port }) {
  if (process.env.LOG_API_BASE_URL) initLogger(upstreamFromEnv(process.env.LOG_API_BASE_URL));
  app.get('/health', (req, res) => res.json({ ok: true, service: name }));
  const server = app.listen(port, () => {
    console.log(`${name} on http://localhost:${port}`);
    Log('backend', 'info', 'config', `${name} started on ${port}`);
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  return server;
}
