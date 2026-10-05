import express from 'express';
import { Worker } from 'node:worker_threads';
import { Log } from 'logging-middleware';

// #region Worker Threads
export function solveInWorker(items, capacity) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./solve.worker.js', import.meta.url), { workerData: { items, capacity } });
    worker.once('message', resolve);
    worker.once('error', reject);
  });
}
// #endregion

// #region Vehicle Maintenance Scheduler
export function createApp({ api }) {
  const app = express();

  async function plan(depotFilter) {
    const [{ depots = [] }, { vehicles = [] }] = await Promise.all([api('/depots'), api('/vehicles')]);
    const items = vehicles.map((v) => ({ id: v.TaskID, weight: v.Duration, value: v.Impact }));
    const chosenDepots = depots.filter((d) => depotFilter === undefined || String(d.ID) === String(depotFilter));

    return Promise.all(chosenDepots.map(async (depot) => {
      const { best, chosen } = await solveInWorker(items, depot.MechanicHours);
      return {
        depotID: depot.ID,
        mechanicHours: depot.MechanicHours,
        selectedTaskIDs: chosen.map((t) => t.id),
        totalDuration: chosen.reduce((s, t) => s + t.weight, 0),
        totalImpact: best,
      };
    }));
  }

  app.get('/schedule-maintenance', async (req, res) => {
    try {
      const plans = await plan(req.query.depotId);
      if (req.query.depotId !== undefined && !plans.length) return res.status(404).json({ error: 'depot not found' });
      Log('backend', 'info', 'handler', `scheduled ${plans.length} depot(s)`);
      res.json(req.query.depotId !== undefined ? plans[0] : plans);
    } catch (err) {
      Log('backend', 'error', 'service', `scheduling failed: ${err.message}`);
      res.status(502).json({ error: 'could not reach the depot or vehicle API' });
    }
  });

  return app;
}
// #endregion
