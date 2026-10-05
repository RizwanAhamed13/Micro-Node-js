// #region Worker Threads
// solve.worker.js: runs the knapsack off the main thread.
import { parentPort, workerData } from 'node:worker_threads';
import { knapsack } from '../shared/knapsack.js';

parentPort.postMessage(knapsack(workerData.items, workerData.capacity));
// #endregion
