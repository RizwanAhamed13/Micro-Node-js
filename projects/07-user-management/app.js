import express from 'express';
import { z } from 'zod';
import { hashPassword, checkPassword, signToken, requireAuth } from './auth.js';
import { errorHandler } from '../shared/middleware.js';

const Signup = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});
const Profile = Signup.pick({ firstName: true, lastName: true }).partial();
const ChangePassword = z.object({ oldPassword: z.string(), newPassword: z.string().min(8) });

// #region User Management Service
export function createApp({ db, secret }) {
  const app = express();
  app.use(express.json());
  const auth = requireAuth(secret);
  const publicUser = ({ password, tokenVer, ...u }) => u;
  const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

  // the token must belong to an existing user and not be logged out
  const currentUser = async (req) => {
    const user = await db.user.findUnique({ where: { id: req.auth.sub } });
    return user && user.tokenVer === req.auth.ver ? user : null;
  };

  // API 1: register
  app.post('/signup', wrap(async (req, res) => {
    const data = Signup.parse(req.body);
    if (await db.user.findUnique({ where: { email: data.email } })) {
      return res.status(409).json({ error: 'email already registered' });
    }
    const user = await db.user.create({ data: { ...data, password: await hashPassword(data.password) } });
    res.status(201).json(publicUser(user));
  }));

  // API 2: log in
  app.post('/login', wrap(async (req, res) => {
    const user = await db.user.findUnique({ where: { email: String(req.body?.email ?? '') } });
    if (!user || !(await checkPassword(String(req.body?.password ?? ''), user.password))) {
      return res.status(401).json({ error: 'wrong email or password' });
    }
    res.json({ token: signToken(user, secret) });
  }));

  app.get('/users/me', auth, wrap(async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: 'log in again' });
    res.json(publicUser(user));
  }));

  // API 3: edit own details
  app.patch('/users/me', auth, wrap(async (req, res) => {
    if (!(await currentUser(req))) return res.status(401).json({ error: 'log in again' });
    const user = await db.user.update({ where: { id: req.auth.sub }, data: Profile.parse(req.body) });
    res.json(publicUser(user));
  }));

  // API 4: change password (old tokens stop working)
  app.put('/users/me/password', auth, wrap(async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: 'log in again' });
    const { oldPassword, newPassword } = ChangePassword.parse(req.body);
    if (!(await checkPassword(oldPassword, user.password))) return res.status(400).json({ error: 'old password is wrong' });
    await db.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword), tokenVer: { increment: 1 } },
    });
    res.status(204).end();
  }));

  app.use(errorHandler);
  return app;
}
// #endregion
