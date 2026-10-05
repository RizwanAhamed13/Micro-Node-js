import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
// #region Reusable Package
// projects/package.json:            "workspaces": ["logging-middleware"]
// projects/logging-middleware/package.json: { "name": "logging-middleware", "main": "index.js" }
// After `npm install`, every service imports it by name:
import { Log, initLogger, logRequests } from 'logging-middleware';
import { createApiClient } from '../shared/apiClient.js';
// #endregion
import { createLogServer } from './logserver.js';
import { listen } from '../shared/listen.js';

let server;
let mock;
let client;

beforeAll(async () => {
  mock = createLogServer();
  server = await listen(mock.app);
  // #region Register & Get a Token
  // 1. register ONCE (the server shows clientID/clientSecret only once: save them)
  const reg = await request(mock.app).post('/register').send({
    email: 'me@college.edu', name: 'me', mobileNo: '9999999999',
    githubUsername: 'me', rollNo: '22CS0001', accessCode: 'XXXX',
  });
  client = createApiClient({
    baseUrl: server.url,
    credentials: { email: 'me@college.edu', name: 'me', rollNo: '22CS0001', accessCode: 'XXXX', ...reg.body },
  });
  // 2. every call after that: /auth -> Bearer token (createApiClient does it and re-auths on 401)
  // #endregion
  initLogger(client);
});
afterAll(() => server.close());
beforeEach(() => { mock.logs.length = 0; });

describe('03 logging middleware', () => {
  it('sends a valid log to the server', async () => {
    expect(await Log('backend', 'error', 'handler', 'received string, expected bool')).toBe(true);
    expect(mock.logs).toMatchObject([{ stack: 'backend', level: 'error', package: 'handler' }]);
  });

  it('rejects bad values without calling the server', async () => {
    expect(await Log('backend', 'ERROR', 'handler', 'x')).toBe(false); // uppercase
    expect(await Log('backend', 'info', 'component', 'x')).toBe(false); // frontend-only package
    expect(await Log('server', 'info', 'db', 'x')).toBe(false);
    expect(await Log('backend', 'info', 'db', '')).toBe(false);
    expect(mock.logs).toHaveLength(0);
  });

  it('accepts shared packages on both stacks', async () => {
    expect(await Log('frontend', 'warn', 'auth', 'token about to expire')).toBe(true);
    expect(await Log('backend', 'debug', 'utils', 'helper called')).toBe(true);
  });

  it('re-authenticates when the token expires', async () => {
    mock.expireAllTokens();
    expect(await Log('backend', 'fatal', 'db', 'Critical database connection failure.')).toBe(true);
  });

  it('never throws when the server is down', async () => {
    initLogger(createApiClient({ baseUrl: 'http://127.0.0.1:1', token: 'x', timeoutMs: 200 }));
    await expect(Log('backend', 'info', 'service', 'hello')).resolves.toBe(false);
    initLogger(client);
  });

  it('logs every request through the middleware', async () => {
    const app = express();
    app.use(logRequests);
    app.get('/ok', (req, res) => res.json({ ok: true }));
    await request(app).get('/ok');
    await new Promise((r) => setTimeout(r, 100));
    expect(mock.logs.at(-1)).toMatchObject({ level: 'info', package: 'middleware', message: 'GET /ok 200' });
  });
});
