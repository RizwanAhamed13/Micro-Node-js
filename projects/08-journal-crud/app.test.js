import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import request from 'supertest';

process.env.JOURNAL_DATABASE_URL = 'file:./test-journal.db';
rmSync(new URL('./prisma/test-journal.db', import.meta.url), { force: true }); // throwaway test database
execSync('npx prisma db push --skip-generate --schema 08-journal-crud/prisma/schema.prisma', { stdio: 'ignore' });
const { PrismaClient } = await import('./prisma/generated/index.js');
const { createApp } = await import('./app.js');

const db = new PrismaClient();
const app = createApp({ db });
afterAll(() => db.$disconnect());

describe('08 journal CRUD', () => {
  let id;

  it('creates journals', async () => {
    const res = await request(app).post('/journals').send({
      title: 'Offer letter', description: 'Got the offer', tags: ['career'], date: '2026-05-08', mood: 'happy',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Offer letter', tags: ['career'], date: '2026-05-08', mood: 'happy' });
    id = res.body.id;
    await request(app).post('/journals').send({ title: 'Rainy day', date: '2026-05-08', mood: 'sad' });
    await request(app).post('/journals').send({ title: 'Gym', date: '2026-05-09', mood: 'neutral' });
  });

  it('rejects an invalid mood or date', async () => {
    expect((await request(app).post('/journals').send({ title: 'x', date: '2026-05-08', mood: 'angry' })).status).toBe(400);
    expect((await request(app).post('/journals').send({ title: 'x', date: '08/05/2026', mood: 'sad' })).status).toBe(400);
  });

  it('retrieves by date and by mood', async () => {
    expect((await request(app).get('/journals?date=2026-05-08')).body).toHaveLength(2);
    expect((await request(app).get('/journals?mood=sad')).body.map((j) => j.title)).toEqual(['Rainy day']);
    expect((await request(app).get('/journals?date=2026-05-08&mood=happy')).body).toHaveLength(1);
    expect((await request(app).get('/journals?mood=angry')).status).toBe(400);
  });

  it('updates', async () => {
    const res = await request(app).patch(`/journals/${id}`).send({ mood: 'neutral', tags: ['career', 'win'] });
    expect(res.body).toMatchObject({ mood: 'neutral', tags: ['career', 'win'], title: 'Offer letter' });
  });

  it('deletes, then 404', async () => {
    expect((await request(app).delete(`/journals/${id}`)).status).toBe(204);
    expect((await request(app).get(`/journals/${id}`)).status).toBe(404);
    expect((await request(app).delete(`/journals/${id}`)).status).toBe(404);
  });
});
