import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';

describe('event loop: what prints first?', () => {
  it('sync, nextTick, promise, immediate, timer (run as a real script)', () => {
    const out = execFileSync(process.execPath, [new URL('./event-loop.cjs', import.meta.url).pathname], { encoding: 'utf8' });
    expect(out.trim().split('\n')).toEqual(['1 sync', '2 sync', '3 nextTick', '4 promise', '5 immediate', '6 timer']);
  });

  it('awaits in parallel vs in sequence', async () => {
    const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
    // #region Parallel Awaits
    let t = Date.now();
    const a = await wait(100, 'a');
    const b = await wait(100, 'b'); // sequential: ~200 ms
    const sequential = Date.now() - t;

    t = Date.now();
    const [c, d] = await Promise.all([wait(100, 'c'), wait(100, 'd')]); // parallel: ~100 ms
    const parallel = Date.now() - t;
    // #endregion
    expect([a, b, c, d]).toEqual(['a', 'b', 'c', 'd']);
    expect(sequential).toBeGreaterThanOrEqual(190);
    expect(parallel).toBeLessThan(170);
  });

  it('let is in the temporal dead zone before its line', () => {
    // #region Hoisting & TDZ
    const read = () => {
      try {
        return x; // eslint-disable-line no-use-before-define
      } catch (err) {
        return err.name;
      } finally {
        // nothing
      }
      let x = 10; // eslint-disable-line no-unreachable
    };
    // var -> undefined, let/const -> ReferenceError ("temporal dead zone")
    // #endregion
    expect(read()).toBe('ReferenceError');
  });
});

describe('SQL round', () => {
  const db = new DatabaseSync(':memory:');
  // #region SQL Round
  db.exec(`
    CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER, deptId INTEGER REFERENCES departments(id));
    INSERT INTO departments VALUES (1, 'Backend'), (2, 'Frontend'), (3, 'Data');
    INSERT INTO employees VALUES
      (1, 'Ava', 90000, 1), (2, 'Ravi', 70000, 1), (3, 'Meera', 85000, 2),
      (4, 'John', 60000, 2), (5, 'Sara', 120000, NULL);
  `);

  // 1. MIN / MAX
  const highest = `SELECT MAX(salary) AS max, MIN(salary) AS min FROM employees`;
  // 2. second highest salary
  const secondHighest = `SELECT MAX(salary) AS salary FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)`;
  // 3. INNER JOIN: only employees with a department
  const withDept = `SELECT e.name, d.name AS dept FROM employees e JOIN departments d ON d.id = e.deptId ORDER BY e.id`;
  // 4. LEFT JOIN: every department, even with no employees
  const headcount = `
    SELECT d.name, COUNT(e.id) AS people
    FROM departments d LEFT JOIN employees e ON e.deptId = d.id
    GROUP BY d.id ORDER BY people DESC, d.name`;
  // 5. GROUP BY + HAVING: departments paying more than 75k on average
  const richDepts = `
    SELECT d.name, AVG(e.salary) AS avgSalary
    FROM employees e JOIN departments d ON d.id = e.deptId
    GROUP BY d.id HAVING AVG(e.salary) > 75000`;
  // 6. top earner per department
  const topPerDept = `
    SELECT d.name AS dept, e.name, e.salary
    FROM employees e JOIN departments d ON d.id = e.deptId
    WHERE e.salary = (SELECT MAX(salary) FROM employees WHERE deptId = e.deptId)
    ORDER BY d.name`;
  // #endregion

  it('MIN / MAX and second highest', () => {
    expect(db.prepare(highest).get()).toEqual({ max: 120000, min: 60000 });
    expect(db.prepare(secondHighest).get()).toEqual({ salary: 90000 });
  });

  it('INNER vs LEFT JOIN', () => {
    expect(db.prepare(withDept).all()).toHaveLength(4); // Sara has no dept
    expect(db.prepare(headcount).all()).toEqual([
      { name: 'Backend', people: 2 }, { name: 'Frontend', people: 2 }, { name: 'Data', people: 0 },
    ]);
  });

  it('GROUP BY + HAVING, top per group', () => {
    expect(db.prepare(richDepts).all()).toEqual([{ name: 'Backend', avgSalary: 80000 }]);
    expect(db.prepare(topPerDept).all()).toEqual([
      { dept: 'Backend', name: 'Ava', salary: 90000 }, { dept: 'Frontend', name: 'Meera', salary: 85000 },
    ]);
  });
});
