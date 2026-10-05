import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import request from 'supertest';

process.env.USERS_DATABASE_URL = 'file:./test-users.db';
rmSync(new URL('./prisma/test-users.db', import.meta.url), { force: true }); // throwaway test database
execSync('npx prisma db push --skip-generate --schema 07-user-management/prisma/schema.prisma', { stdio: 'ignore' });
const { PrismaClient } = await import('./prisma/generated/index.js');
const { createApp } = await import('./app.js');

const db = new PrismaClient();
const app = createApp({ db, secret: 'test-secret' });
afterAll(() => db.$disconnect());

const ava = { firstName: 'Ava', lastName: 'Rao', email: 'ava@example.com', password: 'correct-horse' };

describe('07 user management service', () => {
  let token;

  it('API 1: registers a user without returning the password', async () => {
    const res = await request(app).post('/signup').send(ava);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ firstName: 'Ava', email: 'ava@example.com' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('rejects duplicates (409) and weak input (400)', async () => {
    expect((await request(app).post('/signup').send(ava)).status).toBe(409);
    expect((await request(app).post('/signup').send({ ...ava, email: 'x@y.com', password: 'short' })).status).toBe(400);
  });

  it('API 2: logs in with the right password only', async () => {
    expect((await request(app).post('/login').send({ email: ava.email, password: 'nope' })).status).toBe(401);
    const res = await request(app).post('/login').send({ email: ava.email, password: ava.password });
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  it('API 3: edits own details', async () => {
    expect((await request(app).patch('/users/me').send({ firstName: 'Avi' })).status).toBe(401);
    const res = await request(app).patch('/users/me').set('Authorization', `Bearer ${token}`).send({ firstName: 'Avi' });
    expect(res.body.firstName).toBe('Avi');
  });

  it('API 4: changes password, old tokens and old password stop working', async () => {
    const bad = await request(app).put('/users/me/password').set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'wrong', newPassword: 'battery-staple' });
    expect(bad.status).toBe(400);

    const ok = await request(app).put('/users/me/password').set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: ava.password, newPassword: 'battery-staple' });
    expect(ok.status).toBe(204);

    expect((await request(app).get('/users/me').set('Authorization', `Bearer ${token}`)).status).toBe(401);
    expect((await request(app).post('/login').send({ email: ava.email, password: ava.password })).status).toBe(401);
    expect((await request(app).post('/login').send({ email: ava.email, password: 'battery-staple' })).status).toBe(200);
  });
});
