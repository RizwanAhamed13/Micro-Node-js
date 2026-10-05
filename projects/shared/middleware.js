// #region Middleware
// 1. Log every request when it finishes.
export function requestLogger(log = console.log) {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  };
}

// 2. An error that carries its HTTP status.
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// 3. One place that turns errors into JSON (register it last: 4 arguments).
export function errorHandler(err, req, res, next) {
  const status = err.status || (err.name === 'ZodError' ? 400 : 500);
  const message = status === 500 ? 'Internal error' : err.message;
  res.status(status).json({ error: message });
}

// 4. Unknown routes.
export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}
// #endregion
