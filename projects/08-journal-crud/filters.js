import { z } from 'zod';

export const MOODS = ['neutral', 'happy', 'sad'];

// #region Filters from Query
const Query = z.object({
  date: z.iso.date().optional(), // 2026-05-08
  mood: z.enum(MOODS).optional(),
});

// Turn optional query params into a Prisma where-clause.
export function journalWhere(query) {
  const q = Query.parse(query); // throws ZodError -> 400
  const where = {};
  if (q.mood) where.mood = q.mood;
  if (q.date) {
    const start = new Date(`${q.date}T00:00:00.000Z`);
    where.date = { gte: start, lt: new Date(start.getTime() + 86_400_000) };
  }
  return where;
}
// #endregion

export const JournalInput = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  tags: z.array(z.string()).default([]),
  date: z.iso.date(),
  mood: z.enum(MOODS),
});
