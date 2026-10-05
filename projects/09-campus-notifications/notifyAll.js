// #region Reliable Notify-All
// Stage 5. The naive version:
//   for (id of studentIds) { send_email(id, msg); save_to_db(id, msg); push_to_app(id, msg) }
// fails halfway for 50,000 students and loses or duplicates messages.
// Fix: save first, then queue one job per student; workers retry, failures go to a DLQ,
// and an idempotency key stops duplicates when a job is retried.
export function createNotifier({ saveToDb, sendEmail, pushToApp, maxAttempts = 3 }) {
  const queue = [];
  const deadLetters = [];
  const delivered = new Set(); // idempotency keys already sent

  async function notifyAll(studentIds, message, notificationId) {
    await saveToDb(studentIds, message, notificationId); // 1. the DB is the source of truth
    for (const studentId of studentIds) {
      queue.push({ key: `${notificationId}:${studentId}`, studentId, message, attempts: 0 }); // 2. enqueue
    }
  }

  async function work() {
    while (queue.length) {
      const job = queue.shift();
      if (delivered.has(job.key)) continue; // already done: skip duplicate
      try {
        await sendEmail(job.studentId, job.message);
        await pushToApp(job.studentId, job.message);
        delivered.add(job.key);
      } catch (err) {
        job.attempts += 1;
        if (job.attempts < maxAttempts) queue.push(job); // retry later
        else deadLetters.push({ ...job, error: err.message }); // give up: dead-letter queue
      }
    }
  }

  return { notifyAll, work, deadLetters, delivered };
}
// #endregion
