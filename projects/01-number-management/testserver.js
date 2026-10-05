// A Node copy of the test server: same data, random 0-550 ms delay, ~10% 503s.
import express from 'express';

const DATA = {
  primes: [2, 3, 5, 7, 11, 13],
  fibo: [1, 1, 2, 3, 5, 8, 13, 21],
  odd: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23],
  rand: [5, 17, 3, 19, 76, 24, 1, 5, 10, 34, 8, 27, 7],
};

export function createTestServer({ random = Math.random, maxDelayMs = 550, failRate = 0.1 } = {}) {
  const app = express();
  app.get('/:name', (req, res) => {
    const numbers = DATA[req.params.name];
    if (!numbers) return res.status(404).end();
    setTimeout(() => {
      if (random() < failRate) return res.status(503).send('service unavailable');
      res.json({ numbers });
    }, Math.floor(random() * maxDelayMs));
  });
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createTestServer().listen(8090, () => console.log('test server on http://localhost:8090'));
}
