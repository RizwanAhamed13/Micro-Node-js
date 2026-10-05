import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createNotifier } from './notifyAll.js';

const schema = readFileSync(new URL('./db.sql', import.meta.url), 'utf8');

function seed() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  const addS = db.prepare('INSERT INTO students (id, name, batch) VALUES (?, ?, ?)');
  [[1042, 'Ava', '2027'], [7, 'Ravi', '2027'], [8, 'Meera', '2026']].forEach((s) => addS.run(...s));
  const addN = db.prepare('INSERT INTO notifications (studentID, notificationType, message, isRead, createdAt) VALUES (?, ?, ?, ?, ?)');
  const day = (d) => `2026-05-${String(d).padStart(2, '0')}T10:00:00Z`;
  addN.run(1042, 'Placement', 'ABC drive', 0, day(1));
  addN.run(1042, 'Event', 'Fest', 0, day(5));
  addN.run(1042, 'Result', 'Mid-sem', 1, day(3));
  addN.run(7, 'Placement', 'XYZ drive', 0, day(6));
  addN.run(8, 'Placement', 'Old drive', 0, '2026-04-01T10:00:00Z');
  return db;
}

describe('09 stage 2-3: schema, index and queries', () => {
  // #region Stage 3 Queries
  const unreadForStudent = `
    SELECT * FROM notifications
    WHERE studentID = ? AND isRead = 0
    ORDER BY createdAt DESC`;

  // students who got a Placement notification in the last 7 days
  const placedLastWeek = `
    SELECT DISTINCT s.id, s.name
    FROM students s
    JOIN notifications n ON n.studentID = s.id
    WHERE n.notificationType = 'Placement'
      AND n.createdAt >= ?
    ORDER BY s.id`;
  // #endregion

  it('the slow query uses the composite index, no table scan or sort', () => {
    const db = seed();
    // #region Query Tuning
    // Ask the database how it will run the query.
    const plan = db.prepare(`EXPLAIN QUERY PLAN ${unreadForStudent}`).all(1042).map((r) => r.detail).join(' | ');
    // with the composite index: "SEARCH notifications USING INDEX idx_notif_student_unread (studentID=? AND isRead=?)"
    // without it:               "SCAN notifications" + "USE TEMP B-TREE FOR ORDER BY"
    // #endregion
    expect(plan).toMatch(/USING INDEX idx_notif_student_unread/);
    expect(plan).not.toMatch(/TEMP B-TREE/); // the index already gives the order
    expect(db.prepare(unreadForStudent).all(1042).map((r) => r.message)).toEqual(['Fest', 'ABC drive']);
  });

  it('placement notifications in the last 7 days', () => {
    const db = seed();
    const since = '2026-05-01T00:00:00Z'; // "now" = 2026-05-08
    expect(db.prepare(placedLastWeek).all(since)).toEqual([{ id: 7, name: 'Ravi' }, { id: 1042, name: 'Ava' }]);
  });
});

describe('09 stage 5: reliable notify-all', () => {
  it('saves first, retries failures, dead-letters what keeps failing, never sends twice', async () => {
    const saved = [];
    const emails = [];
    const failures = { 2: 1, 3: Infinity }; // student 2 fails once, student 3 always fails
    const n = createNotifier({
      saveToDb: async (ids) => saved.push(...ids),
      sendEmail: async (id) => {
        if (failures[id]-- > 0) throw new Error('smtp timeout');
        emails.push(id);
      },
      pushToApp: async () => {},
    });

    await n.notifyAll([1, 2, 3, 4], 'Drive tomorrow', 'n1');
    await n.notifyAll([1], 'Drive tomorrow', 'n1'); // duplicate request
    await n.work();

    expect(saved).toEqual([1, 2, 3, 4, 1]);
    expect(emails.sort()).toEqual([1, 2, 4]); // 1 only once, 2 after a retry
    expect(n.deadLetters.map((j) => j.studentId)).toEqual([3]);
  });
});
