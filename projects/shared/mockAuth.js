// Mock servers accept POST /auth and require "Authorization: Bearer <token>".
import { randomUUID } from 'node:crypto';

export function mockAuth(app) {
  const tokens = new Set();
  app.post('/auth', (req, res) => {
    const token = randomUUID();
    tokens.add(token);
    res.json({ token_type: 'Bearer', access_token: token, expires_in: 900 });
  });
  return (req, res, next) => {
    const token = req.get('authorization')?.replace(/^Bearer /, '');
    if (!tokens.has(token)) return res.status(401).json({ error: 'invalid or expired token' });
    next();
  };
}
