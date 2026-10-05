import express from 'express';
import { z } from 'zod';
import { Log, logRequests } from 'logging-middleware';
import { priorityInbox, WEIGHT } from './inbox.js';
import { errorHandler } from '../shared/middleware.js';

const NewNotification = z.object({
  studentIds: z.array(z.number().int()).min(1),
  type: z.enum(Object.keys(WEIGHT)),
  title: z.string().min(1),
  message: z.string().min(1),
});
const Page = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function createApp({ api, now = Date.now }) {
  const app = express();
  app.use(express.json());
  app.use(logRequests);

  // Stage 1: the notification API, in memory.
  const notifications = []; // { id, type, title, message, createdAt }
  const inbox = new Map(); // studentId -> Map(notificationId -> { isRead })
  let nextId = 1;
  const ofStudent = (sid) => {
    if (!inbox.has(sid)) inbox.set(sid, new Map());
    return inbox.get(sid);
  };
  const view = (sid) => [...ofStudent(sid)].map(([id, s]) => ({ ...notifications[id - 1], isRead: s.isRead }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id);

  app.post('/api/notifications', (req, res) => {
    const { studentIds, ...data } = NewNotification.parse(req.body);
    const n = { id: nextId++, ...data, createdAt: new Date(now()).toISOString() };
    notifications.push(n);
    studentIds.forEach((sid) => ofStudent(sid).set(n.id, { isRead: false }));
    Log('backend', 'info', 'handler', `notification ${n.id} sent to ${studentIds.length} students`);
    res.status(201).json({ notificationID: n.id, message: 'Notification created successfully' });
  });

  app.get('/api/students/:sid/notifications', (req, res) => {
    const { page, limit } = Page.parse(req.query);
    const all = view(Number(req.params.sid));
    res.json({ studentID: Number(req.params.sid), page, total: all.length, notifications: all.slice((page - 1) * limit, page * limit) });
  });

  app.get('/api/students/:sid/notifications/unread', (req, res) => {
    const unread = view(Number(req.params.sid)).filter((n) => !n.isRead);
    res.json({ studentID: Number(req.params.sid), unreadCount: unread.length, notifications: unread });
  });

  app.patch('/api/students/:sid/notifications/read-all', (req, res) => {
    ofStudent(Number(req.params.sid)).forEach((s) => { s.isRead = true; });
    res.json({ message: 'All notifications marked as read' });
  });

  app.patch('/api/students/:sid/notifications/:nid/read', (req, res) => {
    const s = ofStudent(Number(req.params.sid)).get(Number(req.params.nid));
    if (!s) return res.status(404).json({ error: 'notification not found for this student' });
    s.isRead = true;
    res.json({ message: 'Notification marked as read' });
  });

  // Stage 2: priority inbox over the test server's notifications.
  app.get('/priority-inbox', async (req, res, next) => {
    try {
      const n = Math.min(Math.max(Number(req.query.n) || 10, 1), 100);
      const { notifications: list = [] } = await api('/notifications');
      const top = priorityInbox(list, n);
      Log('backend', 'info', 'domain', `priority inbox returned ${top.length} notifications`);
      res.json({ count: top.length, notifications: top });
    } catch (err) {
      Log('backend', 'error', 'service', `notifications upstream failed: ${err.message}`);
      next(Object.assign(err, { status: 502 }));
    }
  });

  app.use(errorHandler);
  return app;
}
