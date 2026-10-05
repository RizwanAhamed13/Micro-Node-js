import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { createMockServer } from './mockserver.js';
import { priorityInbox } from './inbox.js';
import { createApiClient } from '../shared/apiClient.js';
import { listen } from '../shared/listen.js';

const ts = (min) => new Date(Date.parse('2026-04-22T17:00:00Z') + min * 60_000).toISOString();
const upstream = [
  { ID: 'e1', Type: 'Event', Message: 'tech fest', Timestamp: ts(50) },
  { ID: 'p1', Type: 'Placement', Message: 'old drive', Timestamp: ts(1) },
  { ID: 'r1', Type: 'Result', Message: 'mid-sem', Timestamp: ts(40) },
  { ID: 'p2', Type: 'Placement', Message: 'new drive', Timestamp: ts(30) },
  { ID: 'r2', Type: 'Result', Message: 'end-sem', Timestamp: ts(45), isRead: true },
  ...Array.from({ length: 20 }, (_, i) => ({ ID: `e${i + 2}`, Type: 'Event', Message: `event ${i}`, Timestamp: ts(i) })),
];

let mock;
let app;
beforeAll(async () => {
  mock = await listen(createMockServer({ notifications: upstream }));
  app = createApp({ api: createApiClient({ baseUrl: mock.url, credentials: {} }).api });
});
afterAll(() => mock.close());

describe('09 campus notifications: priority inbox', () => {
  it('top 10 unread: Placement > Result > Event, newest first', async () => {
    const res = await request(app).get('/priority-inbox');
    expect(res.body.count).toBe(10);
    expect(res.body.notifications.slice(0, 4).map((n) => n.id)).toEqual(['p2', 'p1', 'r1', 'e1']);
    expect(res.body.notifications.map((n) => n.id)).not.toContain('r2'); // already read
  });

  it('n is configurable', async () => {
    const res = await request(app).get('/priority-inbox?n=2');
    expect(res.body.notifications.map((n) => n.id)).toEqual(['p2', 'p1']);
  });

  it('orders the test server timestamp format "YYYY-MM-DD HH:MM:SS"', () => {
    const top = priorityInbox([
      { ID: 'a', Type: 'Result', Message: 'older', Timestamp: '2026-04-22 09:05:00' },
      { ID: 'b', Type: 'Result', Message: 'newer', Timestamp: '2026-04-22 17:51:30' },
    ], 10);
    expect(top.map((n) => n.id)).toEqual(['b', 'a']);
  });

  it('accepts other key spellings', () => {
    const top = priorityInbox([
      { id: 1, type: 'Event', message: 'a', createdAt: ts(5) },
      { notificationID: 2, notificationType: 'Placement', message: 'b', timestamp: ts(1) },
    ], 10);
    expect(top.map((n) => n.id)).toEqual([2, 1]);
  });
});

describe('09 campus notifications: stage 1 API', () => {
  it('create, list, unread, mark read, read-all', async () => {
    const post = (body) => request(app).post('/api/notifications').send(body);
    expect((await post({ studentIds: [1042, 7], type: 'Placement', title: 'Drive', message: 'ABC visiting' })).status).toBe(201);
    await post({ studentIds: [1042], type: 'Event', title: 'Fest', message: 'Saturday' });
    expect((await post({ studentIds: [1042], type: 'Party', title: 'x', message: 'y' })).status).toBe(400);

    const list = await request(app).get('/api/students/1042/notifications?page=1&limit=20');
    expect(list.body.total).toBe(2);

    const unread = await request(app).get('/api/students/1042/notifications/unread');
    expect(unread.body.unreadCount).toBe(2);

    await request(app).patch('/api/students/1042/notifications/1/read');
    expect((await request(app).get('/api/students/1042/notifications/unread')).body.unreadCount).toBe(1);
    expect((await request(app).patch('/api/students/1042/notifications/99/read')).status).toBe(404);

    await request(app).patch('/api/students/1042/notifications/read-all');
    expect((await request(app).get('/api/students/1042/notifications/unread')).body.unreadCount).toBe(0);
    expect((await request(app).get('/api/students/7/notifications/unread')).body.unreadCount).toBe(1);
  });
});
