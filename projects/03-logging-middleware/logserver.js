// Mock of the test server's register / auth / logs API.
import express from 'express';
import { randomUUID } from 'node:crypto';
import { isValidLog } from 'logging-middleware';

export function createLogServer({ tokenTtlMs = 15 * 60_000, now = Date.now } = {}) {
  const app = express();
  app.use(express.json());
  const clients = new Map(); // clientID -> clientSecret
  const tokens = new Map(); // token -> expiresAt
  const logs = [];

  app.post('/register', (req, res) => {
    const { email, name, mobileNo, githubUsername, rollNo, accessCode } = req.body ?? {};
    if (![email, name, mobileNo, githubUsername, rollNo, accessCode].every(Boolean)) {
      return res.status(400).json({ error: 'all registration fields are required' });
    }
    const clientID = randomUUID();
    const clientSecret = randomUUID().slice(0, 16);
    clients.set(clientID, clientSecret);
    res.status(201).json({ email, name, rollNo, clientID, clientSecret });
  });

  app.post('/auth', (req, res) => {
    const { clientID, clientSecret } = req.body ?? {};
    if (!clients.has(clientID) || clients.get(clientID) !== clientSecret) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const token = randomUUID();
    tokens.set(token, now() + tokenTtlMs);
    res.json({ token_type: 'Bearer', access_token: token, expires_in: Math.floor(tokenTtlMs / 1000) });
  });

  const requireToken = (req, res, next) => {
    const token = req.get('authorization')?.replace(/^Bearer /, '');
    if (!token || !(tokens.get(token) > now())) return res.status(401).json({ error: 'invalid or expired token' });
    next();
  };

  app.post('/logs', requireToken, (req, res) => {
    const { stack, level, package: pkg, message } = req.body ?? {};
    if (!isValidLog(stack, level, pkg, message)) return res.status(400).json({ error: 'invalid log' });
    const logID = randomUUID();
    logs.push({ logID, stack, level, package: pkg, message, at: new Date(now()).toISOString() });
    res.status(201).json({ logID, message: 'log created successfully' });
  });

  app.get('/logs', requireToken, (req, res) => {
    const { level, package: pkg, stack } = req.query;
    res.json(logs.filter((l) => (!level || l.level === level) && (!pkg || l.package === pkg) && (!stack || l.stack === stack)).reverse());
  });

  return { app, logs, expireAllTokens: () => tokens.clear() };
}
