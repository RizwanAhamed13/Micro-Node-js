// Mock of the test server's GET /notifications.
import express from 'express';
import { mockAuth } from '../shared/mockAuth.js';

export function createMockServer({ notifications }) {
  const app = express();
  const requireToken = mockAuth(app);
  app.get('/notifications', requireToken, (req, res) => res.json({ notifications }));
  return app;
}
