-- #region Notification Schema & Index
-- Stage 2: tables for the campus notification service.
CREATE TABLE students (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  batch  TEXT NOT NULL
);

CREATE TABLE notifications (
  id                INTEGER PRIMARY KEY,
  studentID         INTEGER NOT NULL REFERENCES students(id),
  notificationType  TEXT NOT NULL CHECK (notificationType IN ('Placement', 'Result', 'Event')),
  message           TEXT NOT NULL,
  isRead            INTEGER NOT NULL DEFAULT 0,
  createdAt         TEXT NOT NULL
);

-- Stage 3: the slow query filters on studentID + isRead and sorts by createdAt.
-- One composite index in that order serves the filter AND the sort.
-- (Indexing every column separately slows every insert and still can't serve this query well.)
CREATE INDEX idx_notif_student_unread ON notifications (studentID, isRead, createdAt DESC);
-- #endregion
