// Start an express app on a free port (used by tests and mock servers).
export function listen(app, port = 0) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const url = `http://127.0.0.1:${server.address().port}`;
      resolve({ server, url, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
