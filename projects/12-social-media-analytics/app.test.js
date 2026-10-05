import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createAnalytics, createApp } from './app.js';
import { mockAuth } from '../shared/mockAuth.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';

const users = { 1: 'John Doe', 2: 'Jane Doe', 3: 'Alice', 4: 'Bob', 5: 'Carol', 6: 'Dan' };
// user -> number of posts: 1:3, 2:1, 3:4, 4:2, 5:2, 6:1
const plan = { 1: 3, 2: 1, 3: 4, 4: 2, 5: 2, 6: 1 };
let nextId = 100;
const posts = Object.entries(plan).flatMap(([uid, n]) =>
  Array.from({ length: n }, () => ({ id: nextId++, userid: Number(uid), content: `post ${nextId}` })));
const commentCount = (pid) => ({ 101: 7, 106: 7, 103: 2 })[pid] ?? 1;

let mock;
let calls = 0;
let analytics;
beforeAll(async () => {
  const up = express();
  const requireToken = mockAuth(up);
  up.use((req, res, next) => { calls++; next(); });
  up.get('/users', requireToken, (req, res) => res.json({ users }));
  up.get('/users/:id/posts', requireToken, (req, res) => res.json({ posts: posts.filter((p) => p.userid === Number(req.params.id)) }));
  up.get('/posts/:id/comments', requireToken, (req, res) =>
    res.json({ comments: Array.from({ length: commentCount(Number(req.params.id)) }, (_, i) => ({ id: i, postid: Number(req.params.id), content: 'c' })) }));
  mock = await listen(up);
  analytics = createAnalytics({ api: createApiClient({ baseUrl: mock.url, credentials: {} }).api });
  await analytics.refresh();
});
afterAll(() => mock.close());

describe('12 social media analytics', () => {
  const app = () => createApp({ analytics });

  it('GET /users: top 5 users by post count', async () => {
    const res = await request(app()).get('/users');
    expect(res.body.map((u) => [u.id, u.postCount])).toEqual([['3', 4], ['1', 3], ['4', 2], ['5', 2], ['2', 1]]);
    expect(res.body[0].name).toBe('Alice');
  });

  it('GET /posts?type=popular: every post tied for the most comments', async () => {
    const res = await request(app()).get('/posts?type=popular');
    expect(res.body.map((p) => p.id).sort()).toEqual([101, 106]);
    expect(res.body[0].commentCount).toBe(7);
  });

  it('GET /posts?type=latest: 5 newest posts', async () => {
    const res = await request(app()).get('/posts?type=latest');
    expect(res.body.map((p) => p.id)).toEqual([112, 111, 110, 109, 108]);
  });

  it('400 without a valid type', async () => {
    expect((await request(app()).get('/posts')).status).toBe(400);
  });

  it('requests are served from the snapshot, not the test server', async () => {
    const before = calls;
    await request(app()).get('/users');
    await request(app()).get('/posts?type=popular');
    expect(calls).toBe(before);
  });
});
