// #region Logging Middleware
const STACKS = ['backend', 'frontend'];
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const PACKAGES = {
  backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'],
  frontend: ['api', 'component', 'hook', 'page', 'state', 'style'],
  both: ['auth', 'config', 'middleware', 'utils'],
};

let client = null; // set once with initLogger({ api }) from createApiClient

export function initLogger(apiClient) {
  client = apiClient;
}

export function isValidLog(stack, level, pkg, message) {
  return (
    STACKS.includes(stack) &&
    LEVELS.includes(level) &&
    (PACKAGES[stack].includes(pkg) || PACKAGES.both.includes(pkg)) &&
    typeof message === 'string' &&
    message.trim().length > 0
  );
}

// Log(stack, level, package, message) -> true if the server accepted it.
// It never throws: logging must not crash the app.
export async function Log(stack, level, pkg, message) {
  if (!isValidLog(stack, level, pkg, message) || !client) return false;
  try {
    await client.api('/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
    return true;
  } catch {
    return false;
  }
}

// Express middleware: one log line per request.
export function logRequests(req, res, next) {
  res.on('finish', () => {
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    Log('backend', level, 'middleware', `${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
}
// #endregion
