// #region Event Loop Order
// Run with: node event-loop.cjs   (CommonJS on purpose: ES modules start inside a microtask)
const fs = require('node:fs');

fs.readFile(__filename, () => {
  // inside an I/O callback the order below is guaranteed
  console.log('1 sync');
  setTimeout(() => console.log('6 timer'), 0);
  setImmediate(() => console.log('5 immediate')); // check phase runs right after I/O
  Promise.resolve().then(() => console.log('4 promise'));
  process.nextTick(() => console.log('3 nextTick')); // nextTick queue drains before promises
  console.log('2 sync');
});
// 1 sync, 2 sync, 3 nextTick, 4 promise, 5 immediate, 6 timer
// #endregion
